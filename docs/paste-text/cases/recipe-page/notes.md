# recipe-page — notes

Synthetic food blog (WordPress + WP Recipe Maker classes). The brief says a recipe page "should mostly be stripped": what is left is the personal intro, the one explanatory section and the recipe itself.

Rules tested:

- R09 "Jump to Recipe", "Print Recipe", "Pin", "Share", "Yum", recipe-card buttons ("Print", "Pin", "Rate") dropped.
- R06 "Posted on … by …", comment count and the affiliate disclosure sentence dropped from the body (author, date kept as metadata). Disclosure rule: a short block containing "affiliate links" or "disclosure policy".
- R08 Ad containers (`adthrive`, `mediavine`, `ezoic`, "Advertisement") dropped.
- R35 Recipe boilerplate sections dropped by heading text: "Why you’ll love this recipe" (and the usual siblings: "Tips", "Variations", "FAQ", "Storage", "More recipes you'll love") — heading matches a known SEO-filler phrase and its section is a short list. "What is cardamom?" is **kept**: it is one paragraph of real explanation. (Open question Q5: this line is subjective; the alternative is "recipe card only".)
- R35 Recipe card: name heading equal to the page title dropped; rating "4.9 from 212 votes", summary duplicating the intro, time chips and "Servings" dropped (open question: keep times as one line?); ingredient spans joined into one item each ("500 g plain flour"); instructions kept as a numbered list; nutrition and "Tried this recipe?" call-to-action dropped.
- R11 Author widget and comments (with star ratings) dropped.
- R20 In-body image kept with caption.
- R30 One section; recipe card group names "Ingredients"/"Instructions" become subheadings.
