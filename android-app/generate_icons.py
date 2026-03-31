import os
from PIL import Image, ImageDraw

def generate_icons(logo_path, res_path):
    img = Image.open(logo_path).convert("RGBA")
    
    sizes = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192
    }
    
    for dpi, size in sizes.items():
        folder = os.path.join(res_path, f"mipmap-{dpi}")
        if not os.path.exists(folder):
            os.makedirs(folder)
        
        # Regular icon
        regular_img = img.resize((size, size), Image.Resampling.LANCZOS)
        regular_img.save(os.path.join(folder, "ic_launcher.png"))
        
        # Round icon (create a circular mask)
        round_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        round_img.paste(regular_img, (0, 0), mask=mask)
        round_img.save(os.path.join(folder, "ic_launcher_round.png"))
        
        print(f"Generated {dpi} ({size}x{size})")

if __name__ == "__main__":
    logo = r"C:\Users\Paul-Rajeevan\Desktop\AL ICT Tamil Medium Notes Hub\logo.png"
    res = r"C:\Users\Paul-Rajeevan\Desktop\AL ICT Tamil Medium Notes Hub\android-app\app\src\main\res"
    generate_icons(logo, res)
