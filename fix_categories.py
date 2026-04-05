import sys
path = 'src/app/shop/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = "['All', 'Electronics', 'Peripherals', 'Fashion', 'Audio'].map(cat => ("
new = "['All', 'Electronics', 'Accessories', 'Audio', 'Devices'].map(cat => ("

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Categories updated")
else:
    print("WARNING: Target string not found in file")
    print("Looking for near matches...")
    import re
    matches = [line for line in content.split('\n') if 'Peripherals' in line or 'Fashion' in line]
    for m in matches:
        print(repr(m))
