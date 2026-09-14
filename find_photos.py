from PIL import Image
import numpy as np

def find_photos_in_column(im, x_search_min, x_search_max, y_search_min, y_search_max):
    # Convert image to RGB numpy array
    arr = np.array(im.convert('RGB'))
    h, w, _ = arr.shape
    
    # We want to find rectangles with substantial color / non-background
    # The backgrounds of the rows are white (#FFFFFF) or light gray (#f1f5f9 / #efefef).
    # Inside the avatar circle/square, there is a person portrait.
    pass

im1 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png")
arr1 = np.array(im1.convert('RGB'))

# Let's inspect rows by looking at alternating gray/white row stripes in the left column
# Left column card width: ~0 to 410, right column: ~430 to 840
print("Array shape:", arr1.shape)

# Let's print row boundaries by scanning y
# Let's sample a vertical line through left photos (around x=80) and right photos (around x=510)
for y in range(0, arr1.shape[0], 20):
    print(f"y={y}: left(x=80)={arr1[y, 80].tolist()}, right(x=510)={arr1[y, 510].tolist()}")
