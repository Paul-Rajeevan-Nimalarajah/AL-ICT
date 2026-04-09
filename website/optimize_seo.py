import os
import glob

# Constants for tags
PRECONNECTS = """
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <meta name="theme-color" content="#f9fafb">
  """

html_files = glob.glob("*.html")

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Preconnects before the first css stylesheet if not exists
    if '<meta name="theme-color"' not in content:
        content = content.replace('<link rel="stylesheet" href="css/style.css', PRECONNECTS + '<link rel="stylesheet" href="css/style.css')
        content = content.replace("<link rel='stylesheet' href='css/style.css", PRECONNECTS + "<link rel='stylesheet' href='css/style.css")

    # 2. Add defer to app.js
    content = content.replace('<script src="js/app.js"></script>', '<script src="js/app.js" defer></script>')
    content = content.replace('<script src="js/app.js?v=1.1"></script>', '<script src="js/app.js?v=1.1" defer></script>')

    # 3. Add defer to telegram script
    content = content.replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', '<script src="https://telegram.org/js/telegram-web-app.js" defer></script>')
    content = content.replace("<script src='https://telegram.org/js/telegram-web-app.js'></script>", "")
    content = content.replace('<script src="https://telegram.org/js/telegram-web-app.js?v=1.1"></script>', '<script src="https://telegram.org/js/telegram-web-app.js?v=1.1" defer></script>')

    # Write back
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Successfully optimized html files.")
