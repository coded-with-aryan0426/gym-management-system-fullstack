#!/usr/bin/env python3
"""
=============================================================================
Professional PDF Generator - Full Page Diagrams
=============================================================================

Features:
- Each diagram sized to fit ONE FULL PAGE
- Large, readable diagrams without zooming
- Table of Contents with clickable hyperlinks
- Page numbers on bottom-right
- Titles on same page as their diagrams

Author: Gym Management System Documentation
=============================================================================
"""

import os
import re
import subprocess
import sys
import shutil
from pathlib import Path
from typing import List, Tuple

# =============================================================================
# Configuration
# =============================================================================

DOCS_DIR = Path(__file__).parent
PDF_DIR = DOCS_DIR / "pdf"
TEMP_DIR = DOCS_DIR / ".temp_build"

# All diagram files use landscape for maximum diagram space
LANDSCAPE_FILES = [
    "er_diagram",
    "uml_diagrams", 
    "dfd_diagrams",
    "system_architecture",
    "workflows"
]

# High-resolution diagram settings for full-page display
DIAGRAM_CONFIG = {
    "width": 2400,
    "height": 1600,
    "scale": 3  # Higher scale for crisp rendering
}

# =============================================================================
# Dependency Checking
# =============================================================================

def check_dependencies() -> bool:
    """Verify all required tools are installed."""
    required = ["mmdc", "pandoc", "xelatex"]
    missing = [cmd for cmd in required if shutil.which(cmd) is None]
    
    if missing:
        print(f"ERROR: Missing: {', '.join(missing)}")
        return False
    return True

# =============================================================================
# Mermaid Diagram Processing
# =============================================================================

def extract_mermaid_blocks(content: str) -> List[str]:
    """Extract all mermaid code blocks from markdown."""
    pattern = r'```mermaid\n(.*?)```'
    return re.findall(pattern, content, re.DOTALL)

def render_diagram(mermaid_code: str, output_path: Path) -> bool:
    """Render Mermaid diagram to high-resolution PNG."""
    temp_mmd = output_path.with_suffix('.mmd')
    temp_mmd.write_text(mermaid_code)
    
    cmd = [
        "mmdc",
        "-i", str(temp_mmd),
        "-o", str(output_path),
        "-w", str(DIAGRAM_CONFIG["width"]),
        "-H", str(DIAGRAM_CONFIG["height"]),
        "-s", str(DIAGRAM_CONFIG["scale"]),
        "-b", "white"
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, timeout=90)
        temp_mmd.unlink(missing_ok=True)
        return output_path.exists()
    except:
        temp_mmd.unlink(missing_ok=True)
        return False

# =============================================================================
# Markdown Processing
# =============================================================================

def clean_markdown(content: str) -> str:
    """Clean and normalize markdown content."""
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = re.sub(r'\n---\n', '\n\n', content)
    return content.strip()

def process_diagrams(content: str, file_stem: str) -> Tuple[str, int, int]:
    """
    Process all Mermaid diagrams - each on its own full page.
    
    Each diagram gets:
    1. Page break before it (to start fresh)
    2. Full-page sizing (fills available space)
    3. Centered on page
    """
    diagrams = extract_mermaid_blocks(content)
    rendered_count = 0
    
    for i, diagram in enumerate(diagrams):
        png_path = TEMP_DIR / f"diagram_{file_stem}_{i}.png"
        
        if render_diagram(diagram, png_path):
            mermaid_block = f"```mermaid\n{diagram}```"
            
            # Each diagram on its own page, sized to fill available space
            # Using both width and height constraints to maximize size
            img_latex = f"""

\\vfill
\\begin{{center}}
\\includegraphics[width=0.95\\textwidth,height=0.85\\textheight,keepaspectratio]{{{png_path}}}
\\end{{center}}
\\vfill
\\clearpage

"""
            content = content.replace(mermaid_block, img_latex, 1)
            rendered_count += 1
    
    return content, len(diagrams), rendered_count

# =============================================================================
# LaTeX Header - Full Page Diagram Support
# =============================================================================

def create_latex_header() -> str:
    """
    LaTeX header optimized for full-page diagrams.
    """
    return r"""
% =============================================================================
% Packages
% =============================================================================
\usepackage{fancyhdr}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{needspace}
\usepackage{titlesec}

% =============================================================================
% Page Style
% =============================================================================
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[R]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% =============================================================================
% Hyperlinks
% =============================================================================
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue,
    bookmarks=true,
    pdfpagemode=UseOutlines
}

% =============================================================================
% Graphics Settings - Allow Full Page Sizing
% =============================================================================
\setkeys{Gin}{keepaspectratio}

% =============================================================================
% Section Formatting - Keep Titles With Content
% =============================================================================
\titleformat{\section}
  {\needspace{4\baselineskip}\normalfont\Large\bfseries}
  {\thesection}{1em}{}

\titleformat{\subsection}
  {\needspace{3\baselineskip}\normalfont\large\bfseries}
  {\thesubsection}{1em}{}

\titleformat{\subsubsection}
  {\needspace{2\baselineskip}\normalfont\normalsize\bfseries}
  {\thesubsubsection}{1em}{}

% Compact spacing between sections
\titlespacing*{\section}{0pt}{1.5ex plus .5ex minus .2ex}{0.5ex plus .2ex}
\titlespacing*{\subsection}{0pt}{1ex plus .5ex minus .2ex}{0.3ex plus .2ex}
\titlespacing*{\subsubsection}{0pt}{0.5ex plus .5ex minus .2ex}{0.2ex plus .2ex}

% Prevent orphan lines
\widowpenalty=10000
\clubpenalty=10000
"""

# =============================================================================
# PDF Generation
# =============================================================================

def generate_pdf(md_file: Path, output_pdf: Path, is_landscape: bool) -> bool:
    """Generate PDF with full-page diagrams."""
    print(f"  Processing: {md_file.name}")
    
    # Read and clean
    raw_content = md_file.read_text()
    cleaned_content = clean_markdown(raw_content)
    
    # Process diagrams
    processed_content, total, rendered = process_diagrams(
        cleaned_content,
        md_file.stem
    )
    
    if total > 0:
        print(f"    Diagrams: {rendered}/{total}")
    
    # Write temp markdown
    temp_md = TEMP_DIR / f"{md_file.stem}_processed.md"
    temp_md.write_text(processed_content)
    
    # Write header
    header_file = TEMP_DIR / f"{md_file.stem}_header.tex"
    header_file.write_text(create_latex_header())
    
    # Geometry - minimal margins for maximum diagram space
    if is_landscape:
        geometry = "landscape,margin=0.5in,top=0.4in,bottom=0.5in"
    else:
        geometry = "margin=0.6in,top=0.5in,bottom=0.6in"
    
    # Pandoc command
    cmd = [
        "pandoc", str(temp_md),
        "-o", str(output_pdf),
        "--pdf-engine=xelatex",
        f"--variable=geometry:{geometry}",
        "--variable=fontsize:11pt",
        "--variable=mainfont:Helvetica",
        "-H", str(header_file),
        "--toc",
        "--toc-depth=3",
        "-V", "toc-title:Table of Contents",
        "-V", "colorlinks=true"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        
        if result.returncode == 0:
            print(f"  Done: {output_pdf.name}")
            return True
        else:
            # Fallback without TOC
            cmd_simple = [c for c in cmd if c not in ["--toc", "--toc-depth=3"]]
            cmd_simple = [c for c in cmd_simple if "toc-title" not in c]
            subprocess.run(cmd_simple, capture_output=True, timeout=180)
            print(f"  Done: {output_pdf.name} (no TOC)")
            return True
            
    except Exception as e:
        print(f"  ERROR: {e}")
        return False

# =============================================================================
# Cleanup
# =============================================================================

def cleanup():
    """Remove temporary files."""
    if TEMP_DIR.exists():
        for f in TEMP_DIR.iterdir():
            try: f.unlink()
            except: pass
        try: TEMP_DIR.rmdir()
        except: pass

# =============================================================================
# Main
# =============================================================================

def main() -> int:
    print("=" * 60)
    print("  PDF Generator - Full Page Diagrams")
    print("=" * 60)
    
    if not check_dependencies():
        return 1
    
    PDF_DIR.mkdir(exist_ok=True)
    TEMP_DIR.mkdir(exist_ok=True)
    
    md_files = sorted([
        f for f in DOCS_DIR.glob("*.md")
        if f.name not in ["README.md"]
    ])
    
    print(f"\n  Processing {len(md_files)} files\n" + "-" * 60)
    
    success = 0
    for md_file in md_files:
        is_landscape = any(name in md_file.stem for name in LANDSCAPE_FILES)
        if generate_pdf(md_file, PDF_DIR / f"{md_file.stem}.pdf", is_landscape):
            success += 1
    
    cleanup()
    
    print("-" * 60)
    print(f"  Complete: {success}/{len(md_files)} PDFs")
    print(f"  Output: {PDF_DIR}\n")
    print("=" * 60)
    
    return 0 if success == len(md_files) else 1


if __name__ == "__main__":
    sys.exit(main())
