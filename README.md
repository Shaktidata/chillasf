# ChillASF: interactive clothing store (demo)

Open `index.html` by double-clicking it, or serve the folder with any local server (for example `python -m http.server`).

- No build step and no backend. Product data lives in `js/data.js`. The garment and mannequin SVGs are in `js/svg.js`.
- The scripts are classic `defer` scripts that share one `window.OF` namespace, not ES modules. Browsers block ES modules on `file://`, so modules would stop the double-click requirement from working. The files are split the same way prompt.md describes.
- The cart, current outfit, saved looks, taste profile and unlocked codes are saved in `localStorage` (`of_state_v1`). The last order is saved under `lastOrder`.
- Checkout is a mock. It never asks for payment details.
- Styling follows the ChillASF design system: Storefront theme for the page, Fitting room (studio) theme for the outfit builder. Tokens live at the top of `css/styles.css`.
- Discount codes: `WELCOME5` always works. `PLAY10` works only after you win a game.
