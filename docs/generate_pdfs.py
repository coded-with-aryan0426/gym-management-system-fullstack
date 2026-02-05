#!/usr/bin/env python3
"""
Generate well-formatted PDFs and Word documents from Markdown.
Fixed version: matches PDF look in Word, aligned titles/diagrams.
"""

import os
import re
import subprocess
import sys
import shutil
from pathlib import Path

DOCS_DIR = Path(__file__).parent
PDF_DIR = DOCS_DIR / "pdf"
DOC_DIR = DOCS_DIR / "doc"
TEMP_DIR = DOCS_DIR / ".temp_diagrams"

LANDSCAPE_FILES = ["er_diagram", "uml_diagrams", "dfd_diagrams", "system_architecture", "workflows"]

def check_dependencies():
    deps = ["mmdc", "pandoc"]
    missing = [cmd for cmd in deps if shutil.which(cmd) is None]
    if missing:
        print(f"Missing: {', '.join(missing)}")
        return False
    return True

def extract_mermaid_diagrams(md_content):
    pattern = r'```mermaid\n(.*?)```'
    return re.findall(pattern, md_content, re.DOTALL)

def render_mermaid_to_png(mermaid_code, output_path, is_landscape=False):
    temp_mmd = output_path.with_suffix('.mmd')
    temp_mmd.write_text(mermaid_code)
    
    if is_landscape:
        width, height = 2400, 1600
    else:
        width, height = 1600, 1200
    
    cmd = ["mmdc", "-i", str(temp_mmd), "-o", str(output_path), 
           "-w", str(width), "-H", str(height), "-s", "2", "-b", "white"]
    
    try:
        subprocess.run(cmd, capture_output=True, timeout=60)
        temp_mmd.unlink(missing_ok=True)
        return output_path.exists()
    except:
        temp_mmd.unlink(missing_ok=True)
        return False

def format_markdown_content(content):
    """
    Format markdown to enforce page breaks before sections and better spacing.
    This ensures titles stay with their content (diagrams) on a new page.
    """
    # 1. Remove excessive whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # 2. Remove --- separators which might be redundant or cause blank pages
    content = re.sub(r'\n---\n', '\n\n', content)
    
    # 3. Add page breaks before H2 headers (## Title)
    # This forces each main section (like "2. Use Case Diagram") to start on a new page.
    lines = content.split('\n')
    result = []
    first_h2 = True
    
    for line in lines:
        if line.startswith('## '):
            if not first_h2:
                # Add LaTeX/Pandoc page break before H2
                result.append('\n\\newpage\n')
            first_h2 = False
        result.append(line)
        
    return '\n'.join(result)

def convert_to_pdf(md_file, output_pdf, is_landscape=False):
    print(f"  PDF: {md_file.name}")
    
    md_content = md_file.read_text()
    formatted_content = format_markdown_content(md_content)
    TEMP_DIR.mkdir(exist_ok=True)
    
    diagrams = extract_mermaid_diagrams(formatted_content)
    modified_content = formatted_content
    
    for i, diagram in enumerate(diagrams):
        png_path = TEMP_DIR / f"d_{md_file.stem}_{i}.png"
        
        if render_mermaid_to_png(diagram, png_path, is_landscape):
            mermaid_block = f"```mermaid\n{diagram}```"
            # PDF specific image styling
            img_tag = f"\n![Diagram]({png_path}){{ width=95% }}\n"
            modified_content = modified_content.replace(mermaid_block, img_tag, 1)
    
    temp_md = TEMP_DIR / f"{md_file.stem}_pdf.md"
    temp_md.write_text(modified_content)
    
    if is_landscape:
        geometry = "landscape,margin=0.6in"
    else:
        geometry = "margin=0.75in"
    
    header_file = TEMP_DIR / "header.tex"
    header_file.write_text(r"""
\usepackage{fancyhdr}
\usepackage{float}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[R]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\let\origfigure\figure
\let\endorigfigure\endfigure
\renewenvironment{figure}[1][H]{
  \origfigure[H]
}{
  \endorigfigure
}
""")
    
    cmd = [
        "pandoc", str(temp_md), "-o", str(output_pdf),
        "--pdf-engine=xelatex",
        f"--variable=geometry:{geometry}",
        "--variable=fontsize:11pt",
        "--variable=mainfont:Helvetica",
        "-H", str(header_file),
        "-V", "colorlinks=true",
        "-V", "linkcolor=blue"
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except subprocess.CalledProcessError:
        return False

def convert_to_docx(md_file, output_docx, is_landscape=False):
    """Convert to Docx aiming to match PDF formatting."""
    print(f"  DOC: {md_file.name}")
    
    md_content = md_file.read_text()
    formatted_content = format_markdown_content(md_content)
    TEMP_DIR.mkdir(exist_ok=True)
    
    diagrams = extract_mermaid_diagrams(formatted_content)
    modified_content = formatted_content
    
    for i, diagram in enumerate(diagrams):
        png_path = TEMP_DIR / f"w_{md_file.stem}_{i}.png"
        
        if render_mermaid_to_png(diagram, png_path, is_landscape):
            mermaid_block = f"```mermaid\n{diagram}```"
            # Docx specific sizing - setting width helps Pandoc scale it properly
            # width=90% usually works if pandoc extensions are enabled, otherwise explicit inches
            img_tag = f"\n![Diagram]({png_path}){{ width=6.5in }}\n"
            modified_content = modified_content.replace(mermaid_block, img_tag, 1)
    
    temp_md = TEMP_DIR / f"{md_file.stem}_doc.md"
    temp_md.write_text(modified_content)
    
    cmd = [
        "pandoc", str(temp_md), "-o", str(output_docx),
        "--from=markdown+page_blocks", # Enable page breaks
        "--to=docx"
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except subprocess.CalledProcessError:
        try:
            # Fallback without specific extensions if it fails
            cmd = ["pandoc", str(temp_md), "-o", str(output_docx), "--to=docx"]
            subprocess.run(cmd, capture_output=True, check=True)
            return True
        except:
            return False

def cleanup():
    if TEMP_DIR.exists():
        for f in TEMP_DIR.iterdir():
            try: f.unlink()
            except: pass
        try: TEMP_DIR.rmdir()
        except: pass

def main():
    print("=" * 50)
    print("Document Generator (PDF & Docx)")
    print("=" * 50)
    
    if not check_dependencies():
        return 1
    
    PDF_DIR.mkdir(exist_ok=True)
    DOC_DIR.mkdir(exist_ok=True)
    
    md_files = sorted([f for f in DOCS_DIR.glob("*.md") if f.name not in ["README.md"]])
    
    print(f"\nProcessing {len(md_files)} files...\n")
    
    success = 0
    for md_file in md_files:
        is_landscape = any(v in md_file.stem for v in LANDSCAPE_FILES)
        
        p = convert_to_pdf(md_file, PDF_DIR / f"{md_file.stem}.pdf", is_landscape)
        d = convert_to_docx(md_file, DOC_DIR / f"{md_file.stem}.docx", is_landscape)
        
        if p and d:
            print(f"       ✓ Done")
            success += 1
        else:
            print(f"       ✗ Failed")
    
    cleanup()
    print("=" * 50)
    return 0 if success == len(md_files) else 1

if __name__ == "__main__":
    sys.exit(main())
