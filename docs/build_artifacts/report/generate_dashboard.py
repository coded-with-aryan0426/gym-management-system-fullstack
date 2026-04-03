import os
import re

images_to_show = [
    "mermaid_dfd_diagrams_0.png",
    "mermaid_dfd_diagrams_1.png",
    "mermaid_er_diagram_0.png",
    "mermaid_er_diagram_1.png",
    "mermaid_er_diagram_2.png",
    "mermaid_system_architecture_0.png",
    "mermaid_system_architecture_1.png",
    "mermaid_system_architecture_2.png",
    "mermaid_system_architecture_4.png",
    "mermaid_uml_diagrams_0.png",
    "mermaid_uml_diagrams_4.png",
    "mermaid_uml_diagrams_5.png",
    "mermaid_uml_diagrams_6.png",
    "mermaid_workflows_0.png",
    "mermaid_workflows_1.png",
    "mermaid_workflows_2.png",
    "mermaid_workflows_3.png",
    "mermaid_workflows_4.png",
    "mermaid_workflows_6.png",
    "mermaid_workflows_8.png",
    "mermaid_workflows_11.png"
]

MD_FILES = {
    "system_architecture": "../../../docs/architecture_and_design/system_architecture.md",
    "er_diagram": "../../../docs/diagrams_and_models/er_diagram.md",
    "uml_diagrams": "../../../docs/diagrams_and_models/uml_diagrams.md",
    "dfd_diagrams": "../../../docs/diagrams_and_models/dfd_diagrams.md",
    "workflows": "../../../docs/architecture_and_design/workflows.md",
}

def clean_mermaid_code(code):
    return code.replace('<', '&lt;').replace('>', '&gt;')

def extract_title(md_content, block_index):
    # Try to find a heading immediately before the mermaid block
    # We can split the md content by mermaid blocks and look at the text before the block.
    parts = re.split(r'```(?:mermaid)?\n', md_content)
    if block_index < len(parts) - 1:
        text_before = parts[block_index]
        # Find the last markdown header in text_before
        headers = re.findall(r'^#{1,6}\s*(.+)$', text_before, re.MULTILINE)
        if headers:
            return headers[-1].strip()
    return f"Diagram #{block_index}"

html_out = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Diagram Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --accent: #f59e0b;
            --bg: #ffffff;
            --card-bg: #f8fafc;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            padding: 40px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 60px;
            padding: 40px;
            background: linear-gradient(135deg, var(--card-bg), #fff);
            border-bottom: 2px solid var(--border);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }
        .header h1 {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary-dark);
            letter-spacing: -1px;
            margin-bottom: 15px;
        }
        .header p {
            color: var(--text-muted);
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            gap: 50px;
        }
        .diagram-item {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            align-items: stretch;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .diagram-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            border-color: #cbd5e1;
        }
        .diagram-visual {
            background: var(--card-bg);
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-right: 1px solid var(--border);
        }
        .diagram-visual img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            background: #fff;
            padding: 10px;
        }
        .title-badge {
            background: var(--primary);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            align-self: flex-start;
        }
        .diagram-code {
            padding: 30px;
            display: flex;
            flex-direction: column;
            background: #fff;
        }
        .diagram-code h3 {
            font-size: 1.25rem;
            color: var(--text-main);
            margin-bottom: 5px;
        }
        .diagram-code p {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 20px;
        }
        .code-block {
            background: #0f172a;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            overflow-y: auto;
            flex-grow: 1;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            max-height: 500px;
            white-space: pre;
        }
        @media (max-width: 1024px) {
            .diagram-item { grid-template-columns: 1fr; }
            .diagram-visual { border-right: none; border-bottom: 1px solid var(--border); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Enterprise Architecture Reference</h1>
        <p>A comprehensive visual and structural reference of all foundational Mermaid diagrams used in the Gym Management System Report.</p>
    </div>
    <div class="container">
"""

for img in images_to_show:
    # Parse the format: mermaid_CATEGORY_INDEX.png
    match = re.match(r'mermaid_(.+)_(\d+)\.png', img)
    if not match:
        continue
    
    category = match.group(1)
    index = int(match.group(2))
    
    md_path = MD_FILES.get(category)
    mermaid_code = "Code not found."
    title = f"{category.replace('_', ' ').title()} - {index}"
    
    if md_path and os.path.exists(md_path):
        with open(md_path, "r") as f:
            md_content = f.read()
            blocks = re.findall(r'```(?:mermaid)?\n(.*?)```', md_content, re.DOTALL)
            if index < len(blocks):
                mermaid_code = clean_mermaid_code(blocks[index].strip())
                title = extract_title(md_content, index)

    html_out += f"""
        <div class="diagram-item">
            <div class="diagram-visual">
                <span class="title-badge">{category.replace('_', ' ')}</span>
                <img src="{img}" alt="{title}" loading="lazy">
            </div>
            <div class="diagram-code">
                <h3>{title}</h3>
                <p>Mermaid Structural Code Definition</p>
                <div class="code-block">{mermaid_code}</div>
            </div>
        </div>
    """

html_out += """
    </div>
</body>
</html>
"""

with open("Diagram_Dashboard.html", "w") as f:
    f.write(html_out)

print("Diagram_Dashboard.html generated successfully.")
