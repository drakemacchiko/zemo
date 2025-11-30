import os
import re

# Files to fix
files_to_fix = [
    r'f:\zemo\src\app\community-guidelines\page.tsx',
    r'f:\zemo\src\app\cancellation-policy\page.tsx'
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace empty span tags with self-closing version
        content = re.sub(
            r'<span className="([^"]*)">\s*</span>',
            r'<span className="\1" />',
            content
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed: {file_path}')
    else:
        print(f'File not found: {file_path}')

print('\nAll files processed!')
