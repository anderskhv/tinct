# Desktop selection — September 9, 2026

Anders reported awkward character long pressing and highlighting on desktop. Mouse clicks now open the existing character card for a reviewed mention, or dictionary for an ordinary word. Existing highlights retain their editing controls. A lookup does not create a new saved highlight. Touch long press remains supported.

The concrete mouse path previously entered selection only after movement; stationary release fell through to chrome toggling. Drag tracking only accepted exact word hit targets, so gaps could leave the endpoint behind. Mouse release now dispatches an explicit lookup intent. Mouse drags find the nearest word through gaps, stay within the initiating comparison side and avoid repainting an unchanged endpoint. Text, pagination, position writes and character spoiler gating are unchanged.

Verification: 151 files / 1,620 tests passed; build and verify-bundle passed. Real mouse lookup and drag-to-highlight passed Chromium and WebKit at desktop size, including no incidental highlight and unchanged reading place. Character mouse clicks passed both English editions; WebKit phone long presses passed both editions. Deployment evidence follows.
