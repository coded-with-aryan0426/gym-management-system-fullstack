#!/usr/bin/env python3
"""
Converts all open booktabs-style tabular environments to fully-boxed tabularx grids.
Targets only the pattern: \begin{tabular}{@{} ... @{}}
"""

import re
import sys

def col_count(col_spec):
    """Count columns in a spec like p{4.5cm} p{2.5cm} p{...}"""
    return len(re.findall(r'p\{', col_spec))

def build_tabularx_sig(col_spec):
    """Convert @{} ... @{} col spec to |c1|c2|X| tabularx spec."""
    # Split on 'p{' and rebuild
    parts = re.split(r'(p\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\})', col_spec)
    p_cols = [s for s in parts if s.startswith('p{')]
    if not p_cols:
        return None, None
    # Last column becomes X (auto-stretch)
    formatted = []
    for i, col in enumerate(p_cols):
        if i == len(p_cols) - 1:
            formatted.append('X')
        else:
            formatted.append(col)
    sig = "\\noindent\\begin{tabularx}{\\textwidth}{|" + "|".join(formatted) + "|}"
    return sig

def process_body(body):
    """Clean up booktabs commands and add hlines to every row."""
    # Remove toprule/midrule/bottomrule (with optional \noalign{})
    body = re.sub(r'\\(toprule|midrule|bottomrule)(\s*\\noalign\{\})?', '', body)
    # Remove leftover blank lines that result
    body = re.sub(r'\n{3,}', '\n\n', body)
    body = body.strip()
    # Add \hline after every row-ending \\ (but not if already followed by \hline)
    body = re.sub(r'(\\\\(?:\s*\[[^\]]*\])?)([ \t]*\n)(?!\s*\\hline)', r'\1\2\\hline\n', body)
    return body

def convert_open_tables(content):
    """Find and replace all @{} tabular envs with boxed tabularx."""
    
    pattern = re.compile(
        r'(\\begin\{tabular\}\{@\{\}\s*)(.*?)(\s*@\{\}\})(.*?)(\\end\{tabular\})',
        re.DOTALL
    )

    def replacer(match):
        col_spec = match.group(2).strip()
        body = match.group(4)
        
        sig = build_tabularx_sig(col_spec)
        if sig is None:
            return match.group(0)  # can't parse, leave unchanged
        
        new_body = process_body(body)
        return sig + "\n\\hline\n" + new_body + "\n\\hline\n\\end{tabularx}"
    
    return pattern.sub(replacer, content)

def main():
    input_file = sys.argv[1]
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = convert_open_tables(content)
    
    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Done. Tables converted.")

if __name__ == '__main__':
    main()
