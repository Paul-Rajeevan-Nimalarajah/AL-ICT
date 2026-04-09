import os

pages = {
    "past-papers.html": {
        "title": "AL ICT Notes Hub - Past Papers Archive",
        "description": "Download authentic A/L ICT Past Papers from 2011 to 2025. Includes both Part I and Part II along with official marking schemes.",
        "url": "https://alict.paulrajeevan.com/past-papers"
    },
    "model-papers.html": {
        "title": "AL ICT Notes Hub - Model Papers & Mock Exams",
        "description": "Practice with expert-crafted A/L ICT Tamil Medium model papers and highly anticipated mock exams.",
        "url": "https://alict.paulrajeevan.com/model-papers"
    },
    "tuition.html": {
        "title": "AL ICT Notes Hub - Tuition Classes Directory",
        "description": "Find top-rated A/L ICT physical and online revision and theory classes. Connect directly with educators.",
        "url": "https://alict.paulrajeevan.com/tuition"
    },
    "online-ide.html": {
        "title": "AL ICT Online Web Workspace",
        "description": "Run Python, HTML/CSS, SQL, and PHP code directly in your browser. Fully functional offline-capable coding workspace for AL ICT students.",
        "url": "https://alict.paulrajeevan.com/online-ide"
    },
    "notes.html": {
        "title": "AL ICT Notes Hub - Unit Notes (Tamil Medium)",
        "description": "Study A/L ICT Unit 1 to 14 with our detailed Tamil Medium notes. Free PDF downloads.",
        "url": "https://alict.paulrajeevan.com/notes"
    }
}

for filename, metadata in pages.items():
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # If it doesn't have twitter:card, let's inject missing tags
        if "twitter:card" not in content:
            template = f"""
  <!-- Open Graph & Twitter Cards injected -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{metadata['url']}">
  <meta property="og:title" content="{metadata['title']}">
  <meta property="og:description" content="{metadata['description']}">
  <meta property="og:image" content="https://alict.paulrajeevan.com/assets/img/og-image.jpg">
  
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="{metadata['url']}">
  <meta property="twitter:title" content="{metadata['title']}">
  <meta property="twitter:description" content="{metadata['description']}">
  <meta property="twitter:image" content="https://alict.paulrajeevan.com/assets/img/og-image.jpg">
</head>"""
            
            # Remove any existing incomplete Open Graph block to avoid duplication
            # This is tricky using string replacement, but since only notes.html has it and we saw exactly what it was:
            if filename == "notes.html":
                # Remove old lines
                old_og = """  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://alict.paulrajeevan.com/notes">
  <meta property="og:title" content="AL ICT Notes Hub - Unit Notes (Tamil Medium)">
  <meta property="og:description" content="Study A/L ICT Unit 1 to 14 with our detailed Tamil Medium notes. Free PDF downloads.">"""
                content = content.replace(old_og, "")
            
            if filename == "past-papers.html":
                old_og2 = """  <link href="https://alict.paulrajeevan.com/past-papers" rel="canonical"/>
  <meta content="AL ICT Notes Hub - Past Papers Archive" property="og:title"/>
  <meta content="Practice with official GCE A/L ICT Tamil Medium past papers and schemes." property="og:description"/>"""
                content = content.replace(old_og2, """  <link href="https://alict.paulrajeevan.com/past-papers" rel="canonical"/>""")

            content = content.replace("</head>", template)

            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filename}")
