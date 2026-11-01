"""Keep shared navigation and footer in the rendered HTML for every page."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
for page in ROOT.glob('*.html'):
    if page.name in ('header.html', 'footer.html'):
        continue
    text = page.read_text()
    for part in ('header', 'footer'):
        content = (ROOT / f'{part}.html').read_text().strip()
        block = f'<!-- shared-{part}:start -->\n<div id="{part}-placeholder">\n{content}\n</div>\n<!-- shared-{part}:end -->'
        pattern = rf'<!-- shared-{part}:start -->.*?<!-- shared-{part}:end -->'
        if re.search(pattern, text, re.S):
            text = re.sub(pattern, lambda _: block, text, count=1, flags=re.S)
        else:
            placeholder = f'<div id="{part}-placeholder"></div>'
            if placeholder not in text:
                raise ValueError(f'Missing {part} placeholder in {page.name}')
            text = text.replace(placeholder, block, 1)
    page.write_text(text)
