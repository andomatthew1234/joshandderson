# Josh Anderson Music

Light blue and white website for Josh Anderson Music, hosted at https://andomatthew1234.github.io/joshandderson/.

Includes Home, a Josh Anderson profile, and Contact, shared navigation/footer, a placeholder portrait, and a custom SVG wordmark and favicon. Event photography is retained for future customization.

Run `python3 scripts/sync_partials.py` after editing the shared header/footer, then preview locally with `python3 -m http.server 8000`. The deployment also synchronizes these elements automatically. Pushes to `main` deploy automatically with GitHub Actions. Google Fonts is an external dependency.

Home hero photograph: Rafael Rodrigues, [Unsplash](https://unsplash.com/photos/a-close-up-of-a-guitar-strings-on-a-wooden-guitar-XQnMqkokCBY). Served locally without a colour tint.

Music service icons are from [Simple Icons](https://github.com/simple-icons/simple-icons), distributed under CC0, and coloured to match the site theme.

The site uses brief exit and entrance transitions for internal page navigation, while preserving normal external links, modified clicks, anchor scrolling, and browser Back/Forward behavior. Motion effects respect the system’s reduced-motion preference. The header and footer are included directly in each page so links work without JavaScript and navigation has no delayed header/footer injection.
