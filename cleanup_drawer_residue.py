import os
import re

files_to_check = [
    'about.html', 'contact.html', 'contacto.html', 'index.html',
    'nosotros.html', 'privacy-policy.html', 'process.html',
    'services.html', 'servicios.html', 'terms.html'
]

pattern = r'\n\s*<button class="drawer-close" aria-label=".*?">.*?</button>\s*</div>\s*<div class="drawer-nav">.*?</div>\s*</div>\n'

for f in files_to_check:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if pattern matches
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        cleaned = content[:match.start()] + '\n' + content[match.end():]
        with open(f, 'w', encoding='utf-8') as file:
            file.write(cleaned)
        print(f"Cleaned residue in {f}")
    else:
        print(f"Pattern did not match in {f}")
