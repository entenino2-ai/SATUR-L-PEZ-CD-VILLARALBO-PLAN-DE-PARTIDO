from PIL import Image

im1 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png").convert('RGB')
w1, h1 = im1.size

# Let's inspect pixel colors in columns around x=80 (Santa Marta) and x=510 (Arandina)
print(f"Image 1: width={w1}, height={h1}")

# Let's find rows by checking horizontal borders or backgrounds
for y in range(0, h1, 10):
    p_left = im1.getpixel((80, y))
    p_right = im1.getpixel((510, y))
    print(f"y={y:3d} | L(80)={p_left} | R(510)={p_right}")
