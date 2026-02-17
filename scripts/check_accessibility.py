import os
import re

def check_accessibility(directory):
    issues = []
    
    # Patterns to look for
    # format: (regex, message, allowed_prefixes)
    patterns = [
        # Pattern: text-white
        (r'[\w:-]*\btext-white\b', "Unconditional white text (may be invisible in light mode)", ['dark:', 'hover:', 'focus:', 'group-hover:', 'group-focus:']),
        
        # Pattern: Hardcoded light blue text which fails AA on white
        (r'[\w:-]*text-\[#4C8DFF\]', "Hardcoded light blue text (fails AA on white background)", ['dark:']),
        
        # Pattern: Amber-400 text (fails AA on white)
        (r'[\w:-]*\btext-amber-400\b', "Amber-400 text (fails AA on white background)", ['dark:']),
        
        # Pattern: Red-500 text (fails AA on white for small text)
        (r'[\w:-]*\btext-red-500\b', "Red-500 text (fails AA on white background for small text)", ['dark:']),
        
        # Pattern: Hardcoded dark hex backgrounds
        (r'[\w:-]*bg-\[#1[0-9A-Fa-f]+\]', "Hardcoded dark background (likely dark mode color in light mode)", ['dark:']),
    ]

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.css'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                    
                for line_num, line in enumerate(content.split('\n'), 1):
                    for pattern, message, allowed_prefixes in patterns:
                        # Find all matches in the line
                        for match in re.finditer(pattern, line):
                            matched_text = match.group(0)
                            
                            # Check if any allowed prefix is present in the matched class
                            is_safe = False
                            for prefix in allowed_prefixes:
                                if prefix in matched_text:
                                    is_safe = True
                                    break
                            
                            if is_safe:
                                continue
                                
                            # Skip if it's inside a comment (simple check)
                            if '//' in line and line.index('//') < line.find(matched_text):
                                continue
                                
                            # Skip known false positives or intentional uses if marked
                            if 'accessibility-ignore' in line:
                                continue
                                
                            issues.append({
                                'file': filepath,
                                'line': line_num,
                                'content': line.strip(),
                                'message': message,
                                'matched': matched_text
                            })

    return issues

if __name__ == "__main__":
    target_dir = 'frontend/src/pages/Equipment'
    print(f"Scanning {target_dir} for accessibility issues...")
    
    issues = check_accessibility(target_dir)
    
    if issues:
        print(f"\nFound {len(issues)} potential issues:")
        for issue in issues:
            print(f"\nFile: {issue['file']}:{issue['line']}")
            print(f"Issue: {issue['message']}")
            print(f"Matched: {issue['matched']}")
            print(f"Code: {issue['content']}")
    else:
        print("\nNo obvious accessibility issues found! (Static analysis passed)")
