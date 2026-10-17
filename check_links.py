import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
missing_src = 0
broken_href = 0

for h in html_files:
    with open(h, 'r', encoding='utf-8') as f:
        html = f.read()

    # check srcs
    srcs = re.findall(r'src=["\']([^"\']+)["\']', html)
    for s in srcs:
        if s.startswith('http') or s == '' or s.startswith('data:'):
            continue
        clean_s = s.split('?')[0]
        if not os.path.exists(clean_s):
            print(f'Missing src in {h}: {s}')
            missing_src += 1

    # check hrefs (.html)
    hrefs = re.findall(r'href=["\']([^"\'#:]+\.html)(?:#[^"\']*)?["\']', html)
    for href in hrefs:
        clean_h = href.split('?')[0]
        if not os.path.exists(clean_h):
            print(f'Broken link in {h}: {href}')
            broken_href += 1

print(f'Check complete: {missing_src} missing srcs, {broken_href} broken hrefs.')
