// Built by scripts/build-note-md.mjs from src/lab/notes/noteMdFrame.ts. Do not edit: change the source and run it again.
"use strict";
var TinctNoteMd = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lab/notes/noteMdFrame.ts
  var noteMdFrame_exports = {};
  __export(noteMdFrame_exports, {
    NOTE_MAX_CHARS: () => NOTE_MAX_CHARS2,
    capNoteMarkdown: () => capNoteMarkdown2,
    createNoteEditor: () => createNoteEditor,
    domToDoc: () => domToDoc,
    escapeHtml: () => escapeHtml2,
    noteHtml: () => noteHtml2,
    notePlainText: () => notePlainText2,
    parseNote: () => parseNote2,
    pastedDoc: () => pastedDoc,
    positionOf: () => positionOf,
    serializeNote: () => serializeNote2,
    textToDoc: () => textToDoc,
    upgrade: () => upgrade
  });

  // src/lab/notes/noteMarkdown.ts
  var NOTE_MAX_CHARS = 4e3;
  var NOTE_MAX_DEPTH = 3;
  var BULLET_LINE = /^( *)[-*] (.*)$/;
  function parseNote(markdown) {
    const lines = String(markdown != null ? markdown : "").replace(/\r\n?/g, "\n").split("\n");
    const doc = lines.map((line) => {
      const tabbed = line.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length));
      const bullet = tabbed.match(BULLET_LINE);
      if (bullet) return { depth: Math.min(NOTE_MAX_DEPTH, Math.floor(bullet[1].length / 2)), runs: parseInline(bullet[2]) };
      return { depth: -1, runs: parseInline(line) };
    });
    return normalizeDoc(doc);
  }
  function normalizeDoc(doc) {
    let prev = -1;
    const out = (doc.length ? doc : [{ depth: -1, runs: [] }]).map((block) => {
      const depth = block.depth < 0 ? -1 : Math.max(0, Math.min(block.depth, prev + 1, NOTE_MAX_DEPTH));
      prev = depth;
      return { depth, runs: compactRuns(block.runs) };
    });
    return out;
  }
  function compactRuns(runs) {
    const out = [];
    for (const run of runs) {
      if (!run.text) continue;
      const last = out[out.length - 1];
      if (last && !!last.b === !!run.b && !!last.i === !!run.i) last.text += run.text;
      else out.push({ text: run.text, ...run.b ? { b: true } : {}, ...run.i ? { i: true } : {} });
    }
    return out;
  }
  var isSpace = (ch) => ch === void 0 || /\s/.test(ch);
  function parseInline(line) {
    const tokens = [];
    const stack = [];
    let text = "";
    const flush = () => {
      if (text) {
        tokens.push({ kind: "text", text });
        text = "";
      }
    };
    for (let k = 0; k < line.length; ) {
      const ch = line[k];
      if (ch === "\\" && (line[k + 1] === "\\" || line[k + 1] === "*" || line[k + 1] === "-")) {
        text += line[k + 1];
        k += 2;
        continue;
      }
      if (ch !== "*") {
        text += ch;
        k += 1;
        continue;
      }
      let end = k;
      while (line[end] === "*") end += 1;
      let left = end - k;
      const before = line[k - 1], after = line[end];
      flush();
      if (!isSpace(before)) {
        while (left > 0 && stack.length) {
          const top = stack[stack.length - 1];
          const need = top.mark === "b" ? 2 : 1;
          if (left < need) break;
          stack.pop();
          top.matched = true;
          tokens.push({ kind: "close", mark: top.mark, stars: "*".repeat(need), matched: true });
          left -= need;
        }
      }
      if (left > 0 && !isSpace(after)) {
        const opens = left >= 3 ? ["b", "i"] : left === 2 ? ["b"] : ["i"];
        const used = left >= 3 ? 3 : left;
        if (left > used) tokens.push({ kind: "text", text: "*".repeat(left - used) });
        for (const mark of opens) {
          const token = { kind: "open", mark, stars: mark === "b" ? "**" : "*" };
          tokens.push(token);
          stack.push(token);
        }
      } else if (left > 0) tokens.push({ kind: "text", text: "*".repeat(left) });
      k = end;
    }
    flush();
    const runs = [];
    let b = 0, i = 0;
    for (const token of tokens) {
      if (token.kind === "text") runs.push({ text: token.text, ...b ? { b: true } : {}, ...i ? { i: true } : {} });
      else if (!token.matched) runs.push({ text: token.stars, ...b ? { b: true } : {}, ...i ? { i: true } : {} });
      else if (token.mark === "b") b += token.kind === "open" ? 1 : -1;
      else i += token.kind === "open" ? 1 : -1;
    }
    return compactRuns(runs);
  }
  var escapeText = (text) => text.replace(/[\\*]/g, (ch) => "\\" + ch);
  function serializeInline(runs) {
    const chars = [];
    for (const run of runs) for (const ch of run.text) chars.push({ ch, b: !!run.b, i: !!run.i });
    const space = (k) => /\s/.test(chars[k].ch);
    let out = "";
    const stack = [];
    const star = (mark) => mark === "b" ? "**" : "*";
    const firstUnwanted = (want) => {
      const k = stack.findIndex((mark) => !want[mark]);
      return k < 0 ? stack.length : k;
    };
    const open = (want) => {
      for (const mark of ["b", "i"]) if (want[mark] && !stack.includes(mark)) {
        out += star(mark);
        stack.push(mark);
      }
    };
    for (let k = 0; k < chars.length; k += 1) {
      const c = chars[k];
      if (space(k)) {
        out += c.ch;
        continue;
      }
      const want = { b: c.b, i: c.i };
      if (k > 0 && !space(k - 1)) {
        let cut = firstUnwanted(want);
        const opening = ["b", "i"].some((mark) => want[mark] && !stack.slice(0, cut).includes(mark));
        if (opening && cut > 0 && stack[cut - 1] === "i") cut = 0;
        while (stack.length > cut) out += star(stack.pop());
      }
      open(want);
      out += escapeText(c.ch);
      if (k + 1 === chars.length || space(k + 1)) {
        let z = k + 1;
        while (z < chars.length && space(z)) z += 1;
        const next = z < chars.length ? { b: chars[z].b, i: chars[z].i } : { b: false, i: false };
        const cut = firstUnwanted(next);
        while (stack.length > cut) out += star(stack.pop());
      }
    }
    return out;
  }
  function serializeNote(doc) {
    return normalizeDoc(doc).map((block) => {
      const inline = serializeInline(block.runs);
      if (block.depth >= 0) return "  ".repeat(block.depth) + "- " + inline;
      return /^ *[-*] /.test(inline) ? inline.replace(/^( *)-/, "$1\\-") : inline;
    }).join("\n");
  }
  function notePlainText(markdown) {
    return parseNote(markdown).map((block) => (block.depth >= 0 ? "  ".repeat(block.depth) + "• " : "") + block.runs.map((run) => run.text).join("")).join("\n");
  }
  function noteTree(doc) {
    const out = [];
    const norm = normalizeDoc(doc);
    for (let k = 0; k < norm.length; ) {
      if (norm[k].depth < 0) {
        out.push({ type: "p", runs: norm[k].runs });
        k += 1;
        continue;
      }
      let end = k;
      while (end < norm.length && norm[end].depth >= 0) end += 1;
      out.push(listOf(norm.slice(k, end), 0));
      k = end;
    }
    return out;
  }
  function listOf(blocks, depth) {
    const items = [];
    for (let k = 0; k < blocks.length; ) {
      const block = blocks[k];
      let end = k + 1;
      while (end < blocks.length && blocks[end].depth > depth) end += 1;
      const kids = blocks.slice(k + 1, end);
      items.push({ runs: block.depth === depth ? block.runs : [], children: kids.length ? listOf(kids, depth + 1) : null });
      k = end;
    }
    return { type: "ul", items };
  }
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var escapeHtml = (text) => String(text).replace(/[&<>"']/g, (ch) => ESC[ch]);
  function runsHtml(runs) {
    return runs.map((run) => {
      let html = escapeHtml(run.text);
      if (run.i) html = `<em>${html}</em>`;
      if (run.b) html = `<strong>${html}</strong>`;
      return html;
    }).join("");
  }
  function nodeHtml(node) {
    if (node.type === "p") return `<p>${node.runs.length ? runsHtml(node.runs) : "<br>"}</p>`;
    return `<ul>${node.items.map((item) => `<li>${runsHtml(item.runs)}${item.children ? nodeHtml(item.children) : ""}</li>`).join("")}</ul>`;
  }
  function noteHtml(markdown) {
    return noteTree(parseNote(markdown)).map(nodeHtml).join("");
  }
  var toLines = (doc) => doc.map((block) => ({ depth: block.depth, chars: block.runs.flatMap((run) => run.text.split("").map((ch) => ({ ch, b: !!run.b, i: !!run.i }))) }));
  var fromLines = (lines) => normalizeDoc(lines.map((line) => ({ depth: line.depth, runs: line.chars.map((c) => ({ text: c.ch, ...c.b ? { b: true } : {}, ...c.i ? { i: true } : {} })) })));
  function docText(doc) {
    return doc.map((block) => block.runs.map((run) => run.text).join("")).join("\n");
  }
  function locate(doc, pos) {
    let rest = Math.max(0, pos);
    for (let line = 0; line < doc.length; line += 1) {
      const len = doc[line].runs.reduce((n, run) => n + run.text.length, 0);
      if (rest <= len) return { line, offset: rest };
      rest -= len + 1;
    }
    const last = doc.length - 1;
    return { line: Math.max(0, last), offset: last >= 0 ? doc[last].runs.reduce((n, run) => n + run.text.length, 0) : 0 };
  }
  function lineStart(doc, line) {
    let pos = 0;
    for (let k = 0; k < line && k < doc.length; k += 1) pos += doc[k].runs.reduce((n, run) => n + run.text.length, 0) + 1;
    return pos;
  }
  function replaceText(doc, from, to, text, style = {}) {
    const pasted = text.split("\n").map((part) => ({ depth: -1, runs: part ? [{ text: part, ...style.b ? { b: true } : {}, ...style.i ? { i: true } : {} }] : [] }));
    return replaceWithDoc(doc, from, to, pasted, { keepFirstDepth: true });
  }
  function replaceWithDoc(doc, from, to, insert, { keepFirstDepth = false } = {}) {
    const lines = toLines(doc);
    const [a, z] = from <= to ? [from, to] : [to, from];
    const start = locate(doc, a), end = locate(doc, z);
    const head = lines[start.line], tail = lines[end.line];
    const before = head.chars.slice(0, start.offset), after = tail.chars.slice(end.offset);
    const add = toLines(insert.length ? insert : [{ depth: -1, runs: [] }]);
    const made = add.map((line, k) => ({ depth: k === 0 && (keepFirstDepth || before.length || head.depth >= 0) ? head.depth : line.depth, chars: line.chars }));
    made[0] = { depth: made[0].depth, chars: [...before, ...made[0].chars] };
    const lastIndex = made.length - 1;
    const caretLine = start.line + lastIndex, caretOffset = made[lastIndex].chars.length;
    made[lastIndex] = { depth: made[lastIndex].depth, chars: [...made[lastIndex].chars, ...after] };
    const next = [...lines.slice(0, start.line), ...made, ...lines.slice(end.line + 1)];
    const out = fromLines(next);
    return { doc: out, caret: lineStart(out, caretLine) + caretOffset };
  }
  function splitLine(doc, from, to = from) {
    const cut = from === to ? { doc, caret: from } : replaceText(doc, from, to, "");
    const lines = toLines(cut.doc);
    const at = locate(cut.doc, cut.caret);
    const line = lines[at.line];
    if (line.depth >= 0 && line.chars.length === 0) {
      lines[at.line] = { depth: -1, chars: [] };
      const out2 = fromLines(lines);
      return { doc: out2, caret: lineStart(out2, at.line) };
    }
    const first = { depth: line.depth, chars: line.chars.slice(0, at.offset) };
    const second = { depth: line.depth, chars: line.chars.slice(at.offset) };
    lines.splice(at.line, 1, first, second);
    const out = fromLines(lines);
    return { doc: out, caret: lineStart(out, at.line + 1) };
  }
  function backspaceAtStart(doc, pos) {
    const at = locate(doc, pos);
    if (at.offset !== 0) return null;
    const lines = toLines(doc);
    const line = lines[at.line];
    if (line.depth > 0) {
      line.depth -= 1;
      const out2 = fromLines(lines);
      return { doc: out2, caret: lineStart(out2, at.line) };
    }
    if (line.depth === 0) {
      line.depth = -1;
      const out2 = fromLines(lines);
      return { doc: out2, caret: lineStart(out2, at.line) };
    }
    if (at.line === 0) return { doc, caret: 0 };
    const above = lines[at.line - 1];
    const caretOffset = above.chars.length;
    lines.splice(at.line - 1, 2, { depth: above.depth, chars: [...above.chars, ...line.chars] });
    const out = fromLines(lines);
    return { doc: out, caret: lineStart(out, at.line - 1) + caretOffset };
  }
  var linesBetween = (doc, from, to) => {
    const a = locate(doc, Math.min(from, to)).line, z = locate(doc, Math.max(from, to)).line;
    return { a, z };
  };
  function indentLines(doc, from, to, delta) {
    const { a, z } = linesBetween(doc, from, to);
    const lines = toLines(doc);
    let any = false;
    for (let k = a; k <= z; k += 1) {
      if (lines[k].depth < 0) continue;
      any = true;
      const prev = k > 0 ? lines[k - 1].depth : -1;
      lines[k].depth = delta > 0 ? Math.min(NOTE_MAX_DEPTH, lines[k].depth + 1, prev + 1) : lines[k].depth - 1;
    }
    return any ? fromLines(lines) : null;
  }
  function toggleBullets(doc, from, to) {
    const { a, z } = linesBetween(doc, from, to);
    const lines = toLines(doc);
    const all = lines.slice(a, z + 1).every((line) => line.depth >= 0);
    for (let k = a; k <= z; k += 1) lines[k].depth = all ? -1 : Math.max(0, lines[k].depth);
    return fromLines(lines);
  }
  function hasMark(doc, from, to, mark) {
    const lines = toLines(doc);
    const [a, z] = from <= to ? [from, to] : [to, from];
    if (a === z) {
      const at = locate(doc, a);
      const c = lines[at.line].chars[at.offset - 1];
      return !!c && c[mark];
    }
    let seen = false;
    for (let pos = a; pos < z; pos += 1) {
      const at = locate(doc, pos);
      const c = lines[at.line].chars[at.offset];
      if (!c) continue;
      if (/\s/.test(c.ch)) continue;
      seen = true;
      if (!c[mark]) return false;
    }
    return seen;
  }
  function toggleMark(doc, from, to, mark) {
    const on = !hasMark(doc, from, to, mark);
    const lines = toLines(doc);
    const [a, z] = from <= to ? [from, to] : [to, from];
    for (let pos = a; pos < z; pos += 1) {
      const at = locate(doc, pos);
      const c = lines[at.line].chars[at.offset];
      if (c) c[mark] = on;
    }
    return fromLines(lines);
  }
  function depthAt(doc, pos) {
    var _a, _b;
    return (_b = (_a = doc[locate(doc, pos).line]) == null ? void 0 : _a.depth) != null ? _b : -1;
  }
  function markdownShortcut(doc, caret) {
    var _a;
    const at = locate(doc, caret);
    const lines = toLines(doc);
    const line = lines[at.line];
    const text = line.chars.map((c) => c.ch).join("");
    const before = text.slice(0, at.offset);
    if (line.depth < 0 && (before === "- " || before === "* ") && line.chars.slice(0, 2).every((c) => !c.b && !c.i)) {
      lines[at.line] = { depth: 0, chars: line.chars.slice(2) };
      const out = fromLines(lines);
      return { doc: out, caret: lineStart(out, at.line) };
    }
    const plainBefore = line.chars.slice(0, at.offset);
    const tryWrap = (stars, mark) => {
      const re = stars === 2 ? /(?:^|[^*\\])\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/ : /(?:^|[^*\\])\*([^*\s](?:[^*]*[^*\s])?)\*$/;
      const m = before.match(re);
      if (!m) return null;
      const inner = m[1];
      const end = at.offset, innerStart = end - stars - inner.length, open = innerStart - stars;
      if (plainBefore.slice(open, end).some((c) => c[mark])) return null;
      const kept = [...plainBefore.slice(0, open), ...plainBefore.slice(innerStart, innerStart + inner.length).map((c) => ({ ...c, [mark]: true })), ...line.chars.slice(end)];
      lines[at.line] = { depth: line.depth, chars: kept };
      const out = fromLines(lines);
      return { doc: out, caret: lineStart(out, at.line) + end - stars * 2 };
    };
    return (_a = tryWrap(2, "b")) != null ? _a : tryWrap(1, "i");
  }
  function capDoc(doc, max = NOTE_MAX_CHARS) {
    if (serializeNote(doc).length <= max) return doc;
    const total = docText(doc).length;
    let lo = 0, hi = total;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (serializeNote(replaceText(doc, mid, total, "").doc).length <= max) lo = mid;
      else hi = mid - 1;
    }
    return replaceText(doc, lo, total, "").doc;
  }
  function capNoteMarkdown(markdown, max = NOTE_MAX_CHARS) {
    if (markdown.length <= max) return markdown;
    return serializeNote(capDoc(parseNote(markdown), max));
  }

  // src/lab/notes/noteEditor.ts
  var isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["DIV", "P", "LI", "UL", "OL", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6", "PRE", "SECTION", "ARTICLE", "HEADER", "FOOTER", "TABLE", "TR", "TD", "TH", "DL", "DT", "DD", "FIGURE", "FIGCAPTION", "HR"]);
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "HEAD", "TITLE", "META", "LINK", "IFRAME", "OBJECT", "SVG", "MATH", "BUTTON", "SELECT", "TEXTAREA", "INPUT", "IMG", "VIDEO", "AUDIO", "CANVAS"]);
  function styleOf(el, inherited) {
    let { b, i } = inherited;
    const tag = el.tagName;
    if (tag === "B" || tag === "STRONG") b = true;
    if (tag === "I" || tag === "EM") i = true;
    const style = el.style;
    if (style) {
      const weight = style.fontWeight;
      if (weight === "bold" || weight === "bolder" || Number(weight) >= 600) b = true;
      else if (weight === "normal" || weight && Number(weight) > 0 && Number(weight) < 600) b = false;
      if (style.fontStyle === "italic" || style.fontStyle === "oblique") i = true;
      else if (style.fontStyle === "normal") i = false;
    }
    return { b, i };
  }
  function domToDoc(root) {
    const doc = [];
    let current = null;
    let pendingDepth = -1;
    const open = (depth) => {
      current = { depth, runs: [] };
      doc.push(current);
    };
    const add = (text, style) => {
      if (!current) open(pendingDepth);
      current.runs.push({ text, ...style.b ? { b: true } : {}, ...style.i ? { i: true } : {} });
    };
    const nextSignificant = (node) => {
      let n = node.nextSibling;
      while (n && n.nodeType === 3 && !(n.nodeValue || "").replace(/\u200b/g, "")) n = n.nextSibling;
      return n;
    };
    const walk = (node, style, listDepth) => {
      if (node.nodeType === 3) {
        const text = (node.nodeValue || "").replace(/\u200b/g, "").replace(/[\r\n]+/g, " ");
        if (text) add(text, style);
        return;
      }
      if (node.nodeType !== 1 && node.nodeType !== 11) return;
      const el = node;
      const tag = node.nodeType === 1 ? el.tagName.toUpperCase() : "#fragment";
      if (SKIP_TAGS.has(tag)) return;
      if (tag === "BR") {
        if (nextSignificant(node) === null) return;
        if (!current) open(pendingDepth);
        open(current.depth);
        return;
      }
      const next = node.nodeType === 1 ? styleOf(el, style) : style;
      if (node.nodeType === 1 && BLOCK_TAGS.has(tag)) {
        if (tag === "UL" || tag === "OL") {
          current = null;
          for (const child of Array.from(el.childNodes)) walk(child, next, listDepth + 1);
          current = null;
          return;
        }
        const own = el.getAttribute("data-depth");
        const depth = own != null && /^-?\d+$/.test(own) ? Number(own) : tag === "LI" ? Math.max(0, listDepth) : -1;
        const outer = pendingDepth;
        const before = doc.length;
        const hasBlocks = Array.from(el.children).some((child) => BLOCK_TAGS.has(child.tagName.toUpperCase()));
        current = null;
        pendingDepth = depth;
        for (const child of Array.from(el.childNodes)) {
          walk(child, next, listDepth);
          if (child.nodeType === 1 && BLOCK_TAGS.has(child.tagName.toUpperCase())) pendingDepth = depth;
        }
        if (doc.length === before && !hasBlocks) open(depth);
        current = null;
        pendingDepth = outer;
        return;
      }
      for (const child of Array.from(node.childNodes)) walk(child, next, listDepth);
    };
    for (const child of Array.from(root.childNodes)) walk(child, { b: false, i: false }, -1);
    return doc.length ? doc : [{ depth: -1, runs: [] }];
  }
  function pastedDoc(root) {
    const doc = domToDoc(root);
    const empty = (block) => !block.runs.some((run) => run.text.trim());
    let a = 0, z = doc.length;
    while (a < z && empty(doc[a])) a += 1;
    while (z > a && empty(doc[z - 1])) z -= 1;
    const out = [];
    for (const block of doc.slice(a, z)) {
      if (empty(block) && out.length && empty(out[out.length - 1])) continue;
      out.push(empty(block) ? { depth: -1, runs: [] } : block);
    }
    return out.length ? out : [{ depth: -1, runs: [] }];
  }
  function textToDoc(text) {
    return parseNote(String(text).replace(/\r\n?/g, "\n").replace(/^([ \t]*)[•◦▪‣·]\s+/gm, "$1- "));
  }
  function renderDoc(root, doc) {
    const d = root.ownerDocument;
    const blocks = doc.map((block) => {
      const div = d.createElement("div");
      div.className = "tn-line";
      div.setAttribute("data-depth", String(block.depth));
      for (const run of block.runs) {
        let node = d.createTextNode(run.text);
        if (run.i) {
          const em = d.createElement("em");
          em.appendChild(node);
          node = em;
        }
        if (run.b) {
          const strong = d.createElement("strong");
          strong.appendChild(node);
          node = strong;
        }
        div.appendChild(node);
      }
      if (!block.runs.length) div.appendChild(d.createElement("br"));
      return div;
    });
    root.replaceChildren(...blocks);
  }
  function clean(root) {
    for (const child of Array.from(root.childNodes)) {
      if (child.nodeType !== 1 || child.tagName !== "DIV" || !child.hasAttribute("data-depth")) return false;
      for (const node of Array.from(child.childNodes)) {
        if (node.nodeType === 3) continue;
        if (node.nodeType !== 1) return false;
        const tag = node.tagName;
        if (BLOCK_TAGS.has(tag)) return false;
      }
    }
    return true;
  }
  function positionOf(root, node, offset) {
    if (!root.contains(node)) return 0;
    if (node === root) {
      const kids = Array.from(root.childNodes);
      if (offset >= kids.length) return docText(domToDoc(root)).length;
      node = kids[offset];
      offset = 0;
    }
    const range = root.ownerDocument.createRange();
    range.setStart(root, 0);
    range.setEnd(node, offset);
    const prefix = domToDoc(range.cloneContents());
    return docText(prefix).length;
  }
  function pointAt(root, pos, right = false) {
    const lines = Array.from(root.children);
    let rest = Math.max(0, pos);
    for (let k = 0; k < lines.length; k += 1) {
      const line = lines[k];
      const texts = [];
      const tw = root.ownerDocument.createTreeWalker(line, 4);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) texts.push(n);
      const len = texts.reduce((n, t) => n + (t.nodeValue || "").length, 0);
      if (rest <= len || k === lines.length - 1) {
        if (!texts.length) return { node: line, offset: 0 };
        for (let t = 0; t < texts.length; t += 1) {
          const size = (texts[t].nodeValue || "").length;
          if (rest < size || rest === size && !(right && t + 1 < texts.length)) return { node: texts[t], offset: Math.min(rest, size) };
          rest -= size;
        }
        const last = texts[texts.length - 1];
        return { node: last, offset: (last.nodeValue || "").length };
      }
      rest -= len + 1;
    }
    return { node: root, offset: 0 };
  }
  function createNoteEditor(root, options = {}) {
    var _a, _b;
    const max = (_a = options.max) != null ? _a : NOTE_MAX_CHARS;
    root.setAttribute("contenteditable", "true");
    root.setAttribute("role", "textbox");
    root.setAttribute("aria-multiline", "true");
    if (!root.hasAttribute("spellcheck")) root.setAttribute("spellcheck", "true");
    let value = "";
    let emitted = "";
    let pending = null;
    let pendingAt = -1;
    let composing = false;
    const undo = [];
    const redo = [];
    let lastSnap = 0;
    let lastState = "";
    const selection = () => {
      var _a2, _b2;
      const sel = (_b2 = (_a2 = root.ownerDocument).getSelection) == null ? void 0 : _b2.call(_a2);
      if (!sel || !sel.rangeCount || !root.contains(sel.anchorNode)) return null;
      const a = positionOf(root, sel.anchorNode, sel.anchorOffset);
      const f = sel.focusNode && root.contains(sel.focusNode) ? positionOf(root, sel.focusNode, sel.focusOffset) : a;
      return [Math.min(a, f), Math.max(a, f)];
    };
    const select = (from, to = from, right = false) => {
      var _a2, _b2;
      const sel = (_b2 = (_a2 = root.ownerDocument).getSelection) == null ? void 0 : _b2.call(_a2);
      if (!sel) return;
      const a = pointAt(root, from, right), z = to === from ? a : pointAt(root, to);
      const range = root.ownerDocument.createRange();
      range.setStart(a.node, a.offset);
      range.setEnd(z.node, z.offset);
      sel.removeAllRanges();
      sel.addRange(range);
    };
    const readDoc = () => domToDoc(root);
    const markEmpty = (doc) => root.classList.toggle("is-empty", doc.length === 1 && doc[0].depth < 0 && !doc[0].runs.length);
    const emit = (doc) => {
      var _a2;
      markEmpty(doc);
      value = serializeNote(doc);
      if (value === emitted) return;
      emitted = value;
      (_a2 = options.onChange) == null ? void 0 : _a2.call(options, value);
    };
    const snapshot = (force = false) => {
      var _a2;
      const now = Date.now();
      if (!force && now - lastSnap < 900) return;
      lastSnap = now;
      const sel = (_a2 = selection()) != null ? _a2 : [0, 0];
      const top = undo[undo.length - 1];
      if (top && top.value === value) return;
      undo.push({ value, sel });
      if (undo.length > 200) undo.shift();
      redo.length = 0;
    };
    const apply = (doc, caret, to = caret, right = false) => {
      snapshot(true);
      let next = doc;
      if (serializeNote(next).length > max) next = capDoc(next, max);
      renderDoc(root, next);
      const len = docText(next).length;
      select(Math.min(caret, len), Math.min(to, len), right);
      emit(next);
      lastSnap = 0;
      report();
    };
    const report = () => {
      if (!options.onState) return;
      const s = state();
      const key = `${s.bold}${s.italic}${s.bullet}`;
      if (key === lastState) return;
      lastState = key;
      options.onState(s);
    };
    const state = () => {
      const sel = selection();
      if (!sel) return { bold: false, italic: false, bullet: false };
      const doc = readDoc();
      const [a, z] = sel;
      return {
        bold: pending && a === z ? pending.b : hasMark(doc, a, z, "b"),
        italic: pending && a === z ? pending.i : hasMark(doc, a, z, "i"),
        bullet: depthAt(doc, a) >= 0
      };
    };
    const toggle = (mark) => {
      const sel = selection();
      if (!sel) return;
      const doc = readDoc();
      const [a, z] = sel;
      if (a === z) {
        const now = pending != null ? pending : { b: hasMark(doc, a, a, "b"), i: hasMark(doc, a, a, "i") };
        pending = { ...now, [mark]: !now[mark] };
        pendingAt = a;
        report();
        return;
      }
      apply(toggleMark(doc, a, z, mark), a, z);
    };
    const command = (name) => {
      var _a2;
      if (root.ownerDocument.activeElement !== root) root.focus({ preventScroll: true });
      if (name === "bold") return toggle("b");
      if (name === "italic") return toggle("i");
      const sel = (_a2 = selection()) != null ? _a2 : [0, 0];
      apply(toggleBullets(readDoc(), sel[0], sel[1]), sel[0], sel[1]);
    };
    const restore = (from, to) => {
      var _a2;
      const snap = from.pop();
      if (!snap) return;
      to.push({ value, sel: (_a2 = selection()) != null ? _a2 : [0, 0] });
      const doc = parseNote(snap.value);
      renderDoc(root, doc);
      select(snap.sel[0], snap.sel[1]);
      emit(doc);
      report();
    };
    const onBeforeInput = (event) => {
      var _a2, _b2, _c;
      if (composing || event.isComposing) return;
      const type = event.inputType;
      if (type === "historyUndo" || type === "historyRedo") {
        event.preventDefault();
        restore(type === "historyUndo" ? undo : redo, type === "historyUndo" ? redo : undo);
        return;
      }
      if (type === "formatBold" || type === "formatItalic") {
        event.preventDefault();
        toggle(type === "formatBold" ? "b" : "i");
        return;
      }
      const sel = selection();
      if (!sel) return;
      const [a, z] = sel;
      if (type === "insertParagraph" || type === "insertLineBreak") {
        event.preventDefault();
        const made = splitLine(readDoc(), a, z);
        pending = null;
        apply(made.doc, made.caret);
        return;
      }
      if (type === "deleteContentBackward" && a === z) {
        const made = backspaceAtStart(readDoc(), a);
        if (made) {
          event.preventDefault();
          apply(made.doc, made.caret);
        }
        return;
      }
      if (type === "insertText" || type === "insertReplacementText") {
        const data = (_c = (_b2 = event.data) != null ? _b2 : (_a2 = event.dataTransfer) == null ? void 0 : _a2.getData("text/plain")) != null ? _c : "";
        if (value.length + data.length > max && a === z) {
          event.preventDefault();
          return;
        }
        if (pending && type === "insertText" && data) {
          event.preventDefault();
          const style = pending;
          pending = null;
          const made = replaceText(readDoc(), a, z, data, style);
          apply(made.doc, made.caret);
          return;
        }
      }
      if (type.startsWith("insert") || type.startsWith("delete")) snapshot();
    };
    const onInput = (event) => {
      if (composing) return;
      const ie = event;
      if (!clean(root)) {
        const sel = selection();
        const doc2 = readDoc();
        renderDoc(root, doc2);
        if (sel) select(sel[0], sel[1]);
      }
      let doc = readDoc();
      if (ie.inputType === "insertText" && (ie.data === " " || ie.data === "*")) {
        const sel = selection();
        if (sel && sel[0] === sel[1]) {
          const made = markdownShortcut(doc, sel[0]);
          if (made) {
            apply(made.doc, made.caret);
            if (ie.data === "*") {
              pending = { b: false, i: false };
              pendingAt = made.caret;
            }
            return;
          }
        }
      }
      if (serializeNote(doc).length > max) {
        const sel = selection();
        doc = capDoc(doc, max);
        renderDoc(root, doc);
        if (sel) select(Math.min(sel[0], docText(doc).length));
      }
      emit(doc);
      report();
    };
    const onKeyDown = (event) => {
      if (event.isComposing || composing) return;
      const mod = isMac() ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (mod && !event.altKey && (key === "b" || key === "i")) {
        event.preventDefault();
        toggle(key === "b" ? "b" : "i");
        return;
      }
      if (mod && !event.altKey && (key === "z" || key === "y")) {
        event.preventDefault();
        const back = key === "z" && !event.shiftKey;
        restore(back ? undo : redo, back ? redo : undo);
        return;
      }
      if (event.key === "Tab" && !mod && !event.altKey) {
        const sel = selection();
        if (!sel) return;
        const made = indentLines(readDoc(), sel[0], sel[1], event.shiftKey ? -1 : 1);
        if (!made) return;
        event.preventDefault();
        apply(made, sel[0], sel[1]);
        return;
      }
    };
    const onPaste = (event) => {
      var _a2;
      const data = event.clipboardData;
      if (!data) return;
      event.preventDefault();
      const sel = (_a2 = selection()) != null ? _a2 : [value.length, value.length];
      const html = data.getData("text/html");
      let pasted;
      if (html && typeof DOMParser !== "undefined") {
        const page = new DOMParser().parseFromString(html, "text/html");
        pasted = pastedDoc(page.body);
      } else pasted = textToDoc(data.getData("text/plain") || "");
      const doc = readDoc();
      const made = replaceWithDoc(doc, sel[0], sel[1], pasted);
      let next = made.doc;
      if (serializeNote(next).length > max) next = capDoc(next, max);
      apply(next, Math.min(made.caret, docText(next).length));
    };
    const onDrop = (event) => {
      var _a2, _b2;
      const text = (_a2 = event.dataTransfer) == null ? void 0 : _a2.getData("text/plain");
      event.preventDefault();
      if (!text) return;
      const sel = (_b2 = selection()) != null ? _b2 : [value.length, value.length];
      const made = replaceWithDoc(readDoc(), sel[0], sel[1], textToDoc(text));
      apply(made.doc, made.caret);
    };
    const onSelection = () => {
      if (root.ownerDocument.activeElement !== root) return;
      const sel = selection();
      if (pending && !(sel && sel[0] === sel[1] && sel[0] === pendingAt)) pending = null;
      report();
    };
    const onCompositionStart = () => {
      composing = true;
    };
    const onCompositionEnd = () => {
      composing = false;
      onInput(new Event("input"));
    };
    const onBlur = () => {
      pending = null;
    };
    root.addEventListener("beforeinput", onBeforeInput);
    root.addEventListener("input", onInput);
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("paste", onPaste);
    root.addEventListener("drop", onDrop);
    root.addEventListener("compositionstart", onCompositionStart);
    root.addEventListener("compositionend", onCompositionEnd);
    root.addEventListener("blur", onBlur);
    root.ownerDocument.addEventListener("selectionchange", onSelection);
    const setValue = (markdown) => {
      const doc = parseNote(String(markdown != null ? markdown : ""));
      value = serializeNote(doc);
      renderDoc(root, doc);
      markEmpty(doc);
    };
    setValue((_b = options.value) != null ? _b : "");
    emitted = value;
    const onChangeEvent = () => {
      var _a2;
      if (value !== emitted) {
        emitted = value;
        (_a2 = options.onChange) == null ? void 0 : _a2.call(options, value);
      }
    };
    root.addEventListener("change", onChangeEvent);
    const textarea = {
      value: { get: () => value, set: (v) => {
        setValue(v);
        undo.length = 0;
        redo.length = 0;
      }, configurable: true },
      selectionStart: { get: () => {
        var _a2;
        return ((_a2 = selection()) != null ? _a2 : [value.length])[0];
      }, configurable: true },
      selectionEnd: { get: () => {
        const s = selection();
        return s ? s[1] : value.length;
      }, configurable: true },
      setSelectionRange: { value: (a, z = a) => {
        const len = docText(readDoc()).length;
        select(Math.min(a, len), Math.min(z, len));
      }, configurable: true, writable: true }
    };
    Object.defineProperties(root, textarea);
    return {
      getValue: () => value,
      setValue: (v) => {
        if (v !== value) setValue(v);
        emitted = value;
      },
      command,
      state,
      destroy() {
        root.removeEventListener("beforeinput", onBeforeInput);
        root.removeEventListener("input", onInput);
        root.removeEventListener("keydown", onKeyDown);
        root.removeEventListener("paste", onPaste);
        root.removeEventListener("drop", onDrop);
        root.removeEventListener("compositionstart", onCompositionStart);
        root.removeEventListener("compositionend", onCompositionEnd);
        root.removeEventListener("blur", onBlur);
        root.removeEventListener("change", onChangeEvent);
        root.ownerDocument.removeEventListener("selectionchange", onSelection);
      }
    };
  }

  // src/lab/notes/noteMdFrame.ts
  var MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");
  function button(doc, cls, label, text, title) {
    const b = doc.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = text;
    b.setAttribute("aria-label", label);
    b.setAttribute("aria-pressed", "false");
    b.title = title;
    return b;
  }
  function upgrade(host) {
    const known = host.noteEditor;
    if (known) return known;
    const field = host.querySelector("[data-note-field]");
    if (!field) return null;
    const value = field.textContent || "";
    field.textContent = "";
    const doc = host.ownerDocument;
    const bar = doc.createElement("div");
    bar.className = "tn-fmt";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Format");
    const b = button(doc, "tn-b", "Bold", "B", `Bold ${MAC ? "⌘B" : "Ctrl+B"}`);
    const i = button(doc, "tn-i", "Italic", "I", `Italic ${MAC ? "⌘I" : "Ctrl+I"}`);
    const u = button(doc, "tn-u", "Bulleted list", "•", "Bulleted list (Tab to indent)");
    bar.append(b, i, u);
    const handle = createNoteEditor(field, {
      value,
      onState: (s) => {
        b.setAttribute("aria-pressed", String(s.bold));
        i.setAttribute("aria-pressed", String(s.italic));
        u.setAttribute("aria-pressed", String(s.bullet));
      }
    });
    for (const [el, name] of [[b, "bold"], [i, "italic"], [u, "bullet"]]) {
      el.addEventListener("pointerdown", (e) => e.preventDefault());
      el.addEventListener("mousedown", (e) => e.preventDefault());
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handle.command(name);
      });
    }
    field.after(bar);
    host.noteEditor = handle;
    field.noteEditor = handle;
    return handle;
  }
  if (typeof customElements !== "undefined" && typeof HTMLElement !== "undefined" && !customElements.get("tinct-note")) {
    customElements.define("tinct-note", class extends HTMLElement {
      connectedCallback() {
        upgrade(this);
      }
    });
  }
  var noteHtml2 = noteHtml;
  var notePlainText2 = notePlainText;
  var parseNote2 = parseNote;
  var serializeNote2 = serializeNote;
  var capNoteMarkdown2 = capNoteMarkdown;
  var escapeHtml2 = escapeHtml;
  var NOTE_MAX_CHARS2 = NOTE_MAX_CHARS;
  return __toCommonJS(noteMdFrame_exports);
})();
(typeof self !== 'undefined' ? self : globalThis).TinctNoteMd = TinctNoteMd;
