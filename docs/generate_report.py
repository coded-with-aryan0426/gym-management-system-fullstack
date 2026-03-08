#!/usr/bin/env python3
"""
=============================================================================
Internship Report Generator
=============================================================================
Generates a single, university-compliant PDF from all report .md chapters.

Requirements:
    - pandoc    (brew install pandoc)
    - xelatex   (brew install --cask mactex-no-gui)
    - mmdc      (npm install -g @mermaid-js/mermaid-cli)

Usage:
    cd docs/
    python generate_report.py

Output:
    docs/report/GymManagementSystem_Internship_Report.pdf
=============================================================================
"""

import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# =============================================================================
# Paths
# =============================================================================

DOCS_DIR    = Path(__file__).parent
REPORT_DIR  = DOCS_DIR / "report"
STYLES_DIR  = REPORT_DIR / "styles"
TEMPLATE    = STYLES_DIR / "report.latex"
TEMP_DIR    = DOCS_DIR / ".report_build"
OUTPUT_PDF  = REPORT_DIR / "GymManagementSystem_Internship_Report.pdf"

# =============================================================================
# Chapter Assembly Order
# =============================================================================

FRONT_MATTER = [
    "00_front_cover.md",
    "01_declaration_form.md",
    "02_title_page.md",
    "03_declaration_originality.md",
    "04_acknowledgements.md",
    "05_abstract.md",
    "06_table_of_contents.md",
    "10_abbreviations.md",
]

BODY_CHAPTERS = [
    "11_chapter1_introduction.md",      # Chapter 1: Introduction
    DOCS_DIR / "literature_review.md",  # Chapter 2: Literature Review
    "13_chapter3_experience.md",        # Chapter 3: Internship Experience
    DOCS_DIR / "system_architecture.md",# Chapter 4: System Design (arch)
    DOCS_DIR / "er_diagram.md",         # Chapter 4 continued: ER Diagram
    DOCS_DIR / "uml_diagrams.md",       # Chapter 4 continued: UML
    DOCS_DIR / "dfd_diagrams.md",       # Chapter 5: DFD / Methodology
    DOCS_DIR / "algorithms.md",         # Chapter 5 continued: Algorithms
    DOCS_DIR / "workflows.md",          # Chapter 5 continued: Workflows
    DOCS_DIR / "features.md",           # Chapter 6: Features & Testing
    "17_chapter7_conclusion.md",        # Chapter 7: Conclusion
]

BACK_MATTER = [
    DOCS_DIR / "references.md",         # Bibliography
    "19_appendices.md",                 # Appendices
]

# Mermaid diagram config
DIAGRAM_W     = 2200
DIAGRAM_H     = 1400
DIAGRAM_SCALE = 2


# =============================================================================
# Dependency Check
# =============================================================================

def check_dependencies():
    missing = []
    for tool in ["pandoc", "xelatex"]:
        if shutil.which(tool) is None:
            missing.append(tool)

    mmdc_available = shutil.which("mmdc") is not None

    if missing:
        print(f"[ERROR] Missing tools: {', '.join(missing)}")
        print("  Install pandoc:  brew install pandoc")
        print("  Install xelatex: brew install --cask mactex-no-gui")
        return False, False

    if not mmdc_available:
        print("[WARN]  mmdc not found — Mermaid diagrams will be removed.")
        print("        Install: npm install -g @mermaid-js/mermaid-cli")

    return True, mmdc_available


# =============================================================================
# Mermaid Rendering
# =============================================================================

def render_mermaid(code: str, out_png: Path) -> bool:
    mmd = out_png.with_suffix(".mmd")
    mmd.write_text(code, encoding="utf-8")
    cmd = [
        "mmdc", "-i", str(mmd), "-o", str(out_png),
        "-w", str(DIAGRAM_W), "-H", str(DIAGRAM_H),
        "-s", str(DIAGRAM_SCALE), "-b", "white"
    ]
    try:
        subprocess.run(cmd, capture_output=True, timeout=120)
        return out_png.exists()
    except Exception:
        return False
    finally:
        mmd.unlink(missing_ok=True)


def replace_mermaid(content: str, file_tag: str, mmdc_ok: bool) -> str:
    """Replace ```mermaid blocks with rendered PNG or remove them."""
    pattern = re.compile(r'```mermaid\n(.*?)```', re.DOTALL)
    counter = [0]

    def replacer(m):
        idx = counter[0]
        counter[0] += 1
        code = m.group(1)

        if not mmdc_ok:
            return ""  # strip mermaid block entirely

        png = TEMP_DIR / f"mermaid_{file_tag}_{idx}.png"
        if render_mermaid(code, png):
            # Full page, centred, with vfill for nice placement
            return (
                "\n\\vfill\n"
                "\\begin{center}\n"
                f"\\includegraphics[width=0.95\\textwidth,height=0.82\\textheight,keepaspectratio]{{{png}}}\n"
                "\\end{center}\n"
                "\\vfill\n"
                "\\clearpage\n"
            )
        return ""  # render failed, strip

    return pattern.sub(replacer, content)


# =============================================================================
# Markdown Pre-processing
# =============================================================================

CHAPTER_H1_MAP = {
    "11_chapter1_introduction":  "Chapter 1: Introduction",
    "literature_review":         "Chapter 2: Literature Review",
    "13_chapter3_experience":    "Chapter 3: Overall Experience Gained from the Internship",
    "system_architecture":       "Chapter 4: System Design – Architecture",
    "er_diagram":                "Chapter 4: System Design – Entity-Relationship Diagram",
    "uml_diagrams":              "Chapter 4: System Design – UML Diagrams",
    "dfd_diagrams":              "Chapter 5: Methodology and Tools – Data Flow Diagrams",
    "algorithms":                "Chapter 5: Methodology and Tools – Algorithms",
    "workflows":                 "Chapter 5: Methodology and Tools – System Workflows",
    "features":                  "Chapter 6: Features, Requirements, and Implementation",
    "17_chapter7_conclusion":    "Chapter 7: Conclusion",
}

def process_md(src: Path, file_tag: str, mmdc_ok: bool) -> str:
    """Read, clean, and pre-process a markdown file."""
    content = src.read_text(encoding="utf-8")

    # Normalise excessive blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    # Remove bare hr lines (--- ) that pandoc may misinterpret
    content = re.sub(r'^\s*---\s*$', '', content, flags=re.MULTILINE)

    # Replace mermaid blocks
    content = replace_mermaid(content, file_tag, mmdc_ok)

    # Force page break between sections that span large content
    content = content.replace('\n\\clearpage\n', '\n\n\\clearpage\n\n')

    return content


# =============================================================================
# Report Assembly
# =============================================================================

def resolve(item) -> Path:
    """Resolve str (relative to REPORT_DIR) or Path (absolute)."""
    if isinstance(item, Path):
        return item
    return REPORT_DIR / item


def assemble_report(mmdc_ok: bool) -> Path:
    """Concatenate all chapter files into one processed .md file."""
    all_files = (
        [resolve(f) for f in FRONT_MATTER]
        + [resolve(f) for f in BODY_CHAPTERS]
        + [resolve(f) for f in BACK_MATTER]
    )

    chunks = []
    for src in all_files:
        if not src.exists():
            print(f"  [SKIP] Not found: {src}")
            continue
        tag = src.stem
        print(f"  [OK]   {src.name}")
        processed = process_md(src, tag, mmdc_ok)
        # Page break between major files
        chunks.append(processed)
        chunks.append("\n\n\\clearpage\n\n")

    combined = "\n".join(chunks)
    out = TEMP_DIR / "combined_report.md"
    out.write_text(combined, encoding="utf-8")
    print(f"\n  Combined: {out}")
    return out


# =============================================================================
# PDF Generation
# =============================================================================

def build_pdf(combined_md: Path) -> bool:
    """Run pandoc to produce the final PDF."""
    cmd = [
        "pandoc", str(combined_md),
        "-o", str(OUTPUT_PDF),
        "--pdf-engine=xelatex",
        "-H", str(TEMPLATE),          # header include (not custom template)
        "--variable=documentclass:report",
        "--variable=fontsize:12pt",
        "--variable=papersize:a4paper",
        "--variable=geometry:a4paper,left=1.5in,right=1.0in,top=1.0in,bottom=1.0in,headheight=15pt,headsep=0.3in,footskip=0.4in",
        "--number-sections",
        "--standalone",
    ]

    # Also generate .tex for debugging
    tex_cmd = cmd.copy()
    tex_cmd[3] = str(OUTPUT_PDF.with_suffix(".tex"))
    subprocess.run(tex_cmd, capture_output=True, text=True, timeout=120)

    print("\n  Running pandoc...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode == 0:
        return True

    # Print errors for debugging
    print("[ERROR] pandoc failed:")
    for line in (result.stderr or "").splitlines()[-30:]:
        print(f"    {line}")

    return False


# =============================================================================
# Cleanup
# =============================================================================

def cleanup():
    if TEMP_DIR.exists():
        for f in TEMP_DIR.iterdir():
            try:
                f.unlink()
            except Exception:
                pass
        try:
            TEMP_DIR.rmdir()
        except Exception:
            pass


# =============================================================================
# Main
# =============================================================================

def main() -> int:
    print("=" * 60)
    print("  Internship Report Generator")
    print("=" * 60)

    ok, mmdc_ok = check_dependencies()
    if not ok:
        return 1

    TEMP_DIR.mkdir(exist_ok=True)
    OUTPUT_PDF.parent.mkdir(exist_ok=True)

    print(f"\n  Assembling chapters...\n{'-' * 60}")
    combined_md = assemble_report(mmdc_ok)

    print(f"\n  Building PDF...\n{'-' * 60}")
    success = build_pdf(combined_md)

    #cleanup()

    print("-" * 60)
    if success:
        size_mb = OUTPUT_PDF.stat().st_size / 1024 / 1024
        print(f"  SUCCESS: {OUTPUT_PDF} ({size_mb:.1f} MB)")
    else:
        print("  FAILED — check errors above.")

    print("=" * 60)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
