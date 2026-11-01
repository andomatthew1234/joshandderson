"""Keep shared navigation and footer in the rendered HTML for every page."""
from pathlib import Path
import re
import hashlib

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
    def version_asset(match):
        path = match.group(2).split('?')[0]
        if path.startswith(('http:', 'https:', '#', 'tel:', 'mailto:')):
            return match.group(0)
        asset = ROOT / path
        if asset.suffix not in ('.css', '.js', '.svg', '.jpg', '.jpeg', '.png') or not asset.is_file():
            return match.group(0)
        digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
        return f'{match.group(1)}{path}?v={digest}"'
    text = re.sub(r'((?:src|href)=")([^"]+)"', version_asset, text)
    page.write_text(text)
