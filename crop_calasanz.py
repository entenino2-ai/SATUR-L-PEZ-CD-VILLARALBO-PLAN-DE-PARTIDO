import os
from PIL import Image

im1 = Image.open(r'C:\Users\Usuario\.gemini\antigravity-ide\brain\73a98e03-4be3-4139-bca5-a6d79432da59\.user_uploaded\media_1790766779571.png').convert('RGB')
im2 = Image.open(r'C:\Users\Usuario\.gemini\antigravity-ide\brain\73a98e03-4be3-4139-bca5-a6d79432da59\.user_uploaded\media_1790766804010.png').convert('RGB')

# Let's find vertical segments for Image 1:
# Check x=90 for background color vs photo color
bg_colors = [(255, 255, 255), (242, 242, 242), (245, 245, 245), (238, 238, 238)]

def is_bg(pixel):
    r, g, b = pixel
    return (abs(r - g) < 5 and abs(g - b) < 5 and r > 230)

segments_1 = []
in_photo = False
start_y = 0
for y in range(im1.height):
    p = im1.getpixel((90, y))
    if not is_bg(p) and not in_photo:
        in_photo = True
        start_y = y
    elif is_bg(p) and in_photo:
        in_photo = False
        if y - start_y > 20:
            segments_1.append((start_y, y))

print("Segments in Image 1:", len(segments_1), segments_1)

segments_2 = []
in_photo = False
start_y = 0
for y in range(im2.height):
    p = im2.getpixel((80, y))
    if not is_bg(p) and not in_photo:
        in_photo = True
        start_y = y
    elif is_bg(p) and in_photo:
        in_photo = False
        if y - start_y > 20:
            segments_2.append((start_y, y))

print("Segments in Image 2:", len(segments_2), segments_2)
