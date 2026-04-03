#!/usr/bin/env python3
"""
Phase 2: Convert longtable booktabs-style tables (with noalign) to tabularx boxed grids.
Also replace remaining toprule/midrule/bottomrule with hline everywhere.
"""

import re
import sys

def fix_longtables(content):
    """
    Convert \begin{longtable}{...} ... \end{longtable} to tabularx boxed format.
    These use \toprule\noalign{} style.
    """

    def longtable_replacer(match):
        col_spec = match.group(1).strip()
        body = match.group(2)

        # Clean booktabs rules
        body = re.sub(r'\\(toprule|midrule|bottomrule)(\\noalign\{\})?', '', body)
        # Remove head/foot continuation markers
        body = re.sub(r'\\endhead\s*', '', body)
        body = re.sub(r'\\endfirsthead\s*', '', body)
        body = re.sub(r'\\endfoot\s*', '', body)
        body = re.sub(r'\\endlastfoot\s*', '', body)

        # Extract column count from spec like {lllll} or {p{} p{} l X}
        # Determine if it already has borders
        has_borders = col_spec.startswith('|')

        # Build new col spec: try to detect column pattern
        # Strip existing borders and whitespace
        inner = col_spec.strip('|').strip()
        # Convert to tabularx: replace last 'l', 'r', 'c', or p{} with X
        # Split columns smartly
        cols = re.findall(r'[lrcX]|p\{[^}]+\}', inner)
        if cols:
            cols[-1] = 'X'
            new_spec = '|' + '|'.join(cols) + '|'
        else:
            new_spec = '|' + inner + '|'

        body = body.strip()
        # Add \hline after every \\
        body = re.sub(r'(\\\\(?:\s*\[[^\]]*\])?)([ \t]*\n)(?!\s*\\hline)', r'\1\2\\hline\n', body)

        return (
            "\\renewcommand{\\arraystretch}{1.35}\n"
            "\\noindent\\begin{tabularx}{\\textwidth}{" + new_spec + "}\n"
            "\\hline\n" + body + "\n\\hline\n\\end{tabularx}"
        )

    content = re.sub(
        r'\\begin\{longtable\}\{([^}]+)\}(.*?)\\end\{longtable\}',
        longtable_replacer,
        content,
        flags=re.DOTALL
    )
    return content


def fix_remaining_booktabs(content):
    """Remove any leftover toprule/midrule/bottomrule not inside longtable."""
    content = re.sub(r'\\(toprule|midrule|bottomrule)(\\noalign\{\})?', lambda m: r'\hline', content)
    # Clean duplicate hlines
    content = re.sub(r'(\\hline[ \t]*\n){2,}', r'\\hline\n', content)
    return content


def main():
    input_file = sys.argv[1]
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    content = fix_longtables(content)
    content = fix_remaining_booktabs(content)

    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Phase 2 done.")

if __name__ == '__main__':
    main()
