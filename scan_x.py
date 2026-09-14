from PIL import Image

im1 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png").convert('RGB')
w1, h1 = im1.size

# Left photo horizontal scan at y=97
print("Left photo at y=97:")
for x in range(50, 130, 2):
    print(f"x={x}: {im1.getpixel((x, 97))}")

print("\nRight photo at y=97:")
for x in range(480, 560, 2):
    print(f"x={x}: {im1.getpixel((x, 97))}")
