#!/usr/bin/env python3
import os
import re

# Fix all .py files in app directory (excluding __pycache__)
for root, dirs, files in os.walk('app'):
    # Skip cache directories
    dirs[:] = [d for d in dirs if d != '__pycache__']
    
    for filename in files:
        if filename.endswith('.py'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Replace missing= with load_default=
            content = content.replace('missing=', 'load_default=')
            
            with open(filepath, 'w') as f:
                f.write(content)
            
            print(f'Updated {filepath}')

print('All files updated!')
