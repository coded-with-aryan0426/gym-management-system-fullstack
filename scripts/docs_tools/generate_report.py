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

DOCS_DIR    = Path(__file__).parent.parent.parent / "docs"
REPORT_DIR  = DOCS_DIR / "build_artifacts" / "report"
STYLES_DIR  = REPORT_DIR / "styles"
TEMPLATE    = STYLES_DIR / "report.latex"
TEMP_DIR    = DOCS_DIR / "build_artifacts" / ".report_build"
OUTPUT_PDF  = REPORT_DIR / "GymManagementSystem_Internship_Report.pdf"

# =============================================================================
# Chapter Assembly Order
# =============================================================================

FRONT_MATTER = [
    "00_front_cover.md",
    "01_declaration_form.md",
    "03_declaration_originality.md",
    "04_acknowledgements.md",
    "05_abstract.md",
    "06_table_of_contents.md",
    "10_abbreviations.md",
]

BODY_CHAPTERS = [
    REPORT_DIR / "11_chapter1_introduction.md",
    DOCS_DIR / "research_and_theory" / "literature_review.md",
    REPORT_DIR / "13_chapter3_experience.md",
    DOCS_DIR / "architecture_and_design" / "system_architecture.md",
    DOCS_DIR / "diagrams_and_models" / "er_diagram.md",
    DOCS_DIR / "diagrams_and_models" / "uml_diagrams.md",
    DOCS_DIR / "diagrams_and_models" / "dfd_diagrams.md",
    DOCS_DIR / "research_and_theory" / "algorithms.md",
    DOCS_DIR / "architecture_and_design" / "workflows.md",
    DOCS_DIR / "architecture_and_design" / "features.md",
    REPORT_DIR / "17_chapter7_conclusion.md",
]

BACK_MATTER = [
    DOCS_DIR / "research_and_theory" / "references.md",
    REPORT_DIR / "19_appendices.md",
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

MERMAID_CONFIG = Path(__file__).parent / "mermaid_config.json"

def render_mermaid(code: str, out_png: Path) -> bool:
    mmd = out_png.with_suffix(".mmd")
    mmd.write_text(code, encoding="utf-8")
    cmd = [
        "mmdc", "-i", str(mmd), "-o", str(out_png),
        "-s", str(DIAGRAM_SCALE), "-b", "white",
        "-c", str(MERMAID_CONFIG),
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

        img_name = f"mermaid_{file_tag}_{idx}.png"
        report_png = REPORT_DIR / img_name   # user-managed, source of truth
        temp_png   = TEMP_DIR   / img_name   # fallback render destination

        if report_png.exists():
            # Use the existing image in report dir (preserves manual updates)
            print(f"    [USE]    {img_name} (from report/)")
            final_png = report_png
        elif render_mermaid(code, temp_png):
            # No existing image — render fresh and save to report dir too
            shutil.copy(temp_png, report_png)
            print(f"    [RENDER] {img_name}")
            final_png = report_png
        else:
            return ""  # render failed, strip

        return (
            "\\begin{figure}[H]\n"
            "\\centering\n"
            f"\\includegraphics[width=0.85\\textwidth,height=0.42\\textheight,keepaspectratio]{{{final_png}}}\n"
            "\\end{figure}\n"
        )

    return pattern.sub(replacer, content)


# =============================================================================
# Markdown Pre-processing
# =============================================================================

CHAPTER_H1_MAP = {
    "11_chapter1_introduction":  "Introduction",
    "literature_review":         "Literature Review",
    "13_chapter3_experience":    "Overall Experience Gained from the Internship",
    "system_architecture":       "System Design – Architecture",
    "er_diagram":                "System Design – Entity-Relationship Diagram",
    "uml_diagrams":              "System Design – UML Diagrams",
    "dfd_diagrams":              "Methodology and Tools – Data Flow Diagrams",
    "algorithms":                "Methodology and Tools – Algorithms",
    "workflows":                 "Methodology and Tools – System Workflows",
    "features":                  "Features, Requirements, and Implementation",
    "17_chapter7_conclusion":    "Conclusion",
}


def sanitise_md(content: str) -> str:
    """Global sanitisation: replace bare --- HR lines with a LaTeX rule.

    Pandoc's markdown parser treats a bare '---' line as a YAML front-matter
    delimiter or a setext heading underline, producing unpredictable output.
    We swap each one for an explicit LaTeX horizontal rule before pandoc sees it.
    """
    rule = (
        "\n\\medskip"
        "\\noindent\\rule{\\textwidth}{0.4pt}"
        "\\medskip\n"
    )
    content = re.sub(r'(?m)^\s*---\s*$', lambda _: rule, content)
    return content


def compact_algo_blocks(content: str) -> str:
    """Replace plain ```...``` fences in algorithms.md with compact lstlisting[style=algo].

    Plain code fences render at the default 9/11pt with a frame.
    The algo style uses 8/9.5pt, no frame, and 3pt above/below — saving
    significant vertical space across the 8 algorithm definitions.
    """
    def replacer(m: re.Match) -> str:
        body = m.group(1)
        return (
            "\n\\begin{lstlisting}[style=algo]\n"
            + body
            + "\\end{lstlisting}\n"
        )
    # Match plain fences (no language tag) only
    return re.sub(r'```\n(.*?)```', replacer, content, flags=re.DOTALL)


def process_md(src: Path, file_tag: str, mmdc_ok: bool) -> str:
    """Read, clean, and pre-process a markdown file."""
    content = src.read_text(encoding="utf-8")

    # Normalise excessive blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Global: replace bare --- HR lines with a proper LaTeX rule
    content = sanitise_md(content)

    # For the algorithms chapter: convert plain code fences to compact algo blocks
    if file_tag == "algorithms":
        content = compact_algo_blocks(content)

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
        "--variable=geometry:a4paper,left=0.70in,right=0.70in,top=1.0in,bottom=1.0in,headheight=14pt,headsep=0.15in,footskip=0.4in",
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

    print("\n  Building PDF...\n{'-' * 60}")
    success = build_pdf(combined_md)
    
    if success:
        # Sync only freshly-rendered images (do NOT overwrite user-managed ones)
        print(f"\n  Syncing new renders to {REPORT_DIR}...")
        for png in TEMP_DIR.glob("mermaid_*.png"):
            dest = REPORT_DIR / png.name
            if not dest.exists():   # never overwrite manual images
                shutil.copy(png, dest)

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
