/** Cloudflare's bundler turns a `.wasm` import into a compiled module (wrangler CompiledWasm rule). */
declare module '*.wasm' {
  const module: WebAssembly.Module
  export default module
}
