from PIL import Image

im2 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378303324.png").convert('RGB')
w2, h2 = im2.size
print(f"Image 2: {w2}x{h2}")

# Let's inspect Left column (Santa Marta suplentes: 9 players)
# and Right column (Arandina suplentes: 6 players, and Cuerpo Técnico: 3 staff)
for y in range(0, h2, 10):
    p_left = im2.getpixel((80, y))
    p_right = im2.getpixel((510, y))
    print(f"y={y:3d} | L(80)={p_left} | R(510)={p_right}")
