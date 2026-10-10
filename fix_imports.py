import re
import sys
import glob

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix 'React' unused import
    content = re.sub(r'import\s+React\s+from\s+[\'"]react[\'"];\n', '', content)
    content = re.sub(r'import\s+React,\s+\{', 'import {', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

files = glob.glob('src/**/*.ts*', recursive=True) + glob.glob('tests/**/*.ts*', recursive=True)
for f in files:
    try:
        fix_file(f)
    except Exception as e:
        pass
