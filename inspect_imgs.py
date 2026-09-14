from PIL import Image
import os

img1_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png"
img2_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378303324.png"

im1 = Image.open(img1_path)
im2 = Image.open(img2_path)

print(f"Image 1 size: {im1.size}")
print(f"Image 2 size: {im2.size}")
