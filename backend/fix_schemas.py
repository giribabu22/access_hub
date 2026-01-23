#!/usr/bin/env python3
import os
import re

schemas_dir = 'app/schemas'

for filename in os.listdir(schemas_dir):
    if filename.endswith('.py'):
        filepath = os.path.join(schemas_dir, filename)
        with open(filepath, 'r') as f:
            content = f.read()
        
        content = content.replace('missing=', 'load_default=')
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f'Updated {filename}')

print('All schema files updated!')
