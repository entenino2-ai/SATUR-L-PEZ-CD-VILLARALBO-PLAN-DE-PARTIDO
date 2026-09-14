import os
from PIL import Image

img1_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png"
img2_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378303324.png"

out_dir = r"c:\Users\Usuario\Desktop\WEB APP SATUR LÓPEZ CD VILLARALBO PLAN PARTIDO\public\players\rivals"
os.makedirs(out_dir, exist_ok=True)

im1 = Image.open(img1_path)
im2 = Image.open(img2_path)

# Let's find rows in Image 1 (Titulares):
# Image 1 is 844x781.
# Left column is UD Santa Marta de Tormes, Right column is Arandina CF.
# Titulares header is around top: y=0 to 70.
# There are 11 rows in each column.
# Let's inspect coordinates for rows:
# Row heights: ~63.5px each, from y=72 to 770.
# Left photo x: roughly 65 to 105 or 68 to 102
# Right photo x: roughly 485 to 525 or 500 to 535
print("Image 1 mode/size:", im1.mode, im1.size)
print("Image 2 mode/size:", im2.mode, im2.size)
