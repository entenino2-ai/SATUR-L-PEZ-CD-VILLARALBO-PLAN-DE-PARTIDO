from PIL import Image

im2 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378303324.png").convert('RGB')

# Let's inspect Right column from y=400 to 660, scanning x around 450 to 570
for y in range(430, 660, 5):
    for x in range(480, 560, 5):
        p = im2.getpixel((x, y))
        if p != (255, 255, 255) and p != (242, 242, 242) and p != (222, 226, 230):
            print(f"y={y}, x={x}: {p}")
            break
