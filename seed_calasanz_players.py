import os
import re
from PIL import Image

# 1. Load Screenshots
im1 = Image.open(r'C:\Users\Usuario\.gemini\antigravity-ide\brain\73a98e03-4be3-4139-bca5-a6d79432da59\.user_uploaded\media_1790766779571.png').convert('RGB')
im2 = Image.open(r'C:\Users\Usuario\.gemini\antigravity-ide\brain\73a98e03-4be3-4139-bca5-a6d79432da59\.user_uploaded\media_1790766804010.png').convert('RGB')

local_team_dir = r"c:\Users\Usuario\Desktop\WEB APP SATUR LÓPEZ CD VILLARALBO PLAN PARTIDO\public\players\jugadores_equipo\CD_Calasanz_de_Soria"
local_rivals_dir = r"c:\Users\Usuario\Desktop\WEB APP SATUR LÓPEZ CD VILLARALBO PLAN PARTIDO\public\players\rivals"

os.makedirs(local_team_dir, exist_ok=True)
os.makedirs(local_rivals_dir, exist_ok=True)

# Image 1 (Titulares):
# Segments: [(68, 113), (138, 183), (209, 253), (278, 323), (348, 393), (418, 463), (488, 533), (558, 603), (628, 673), (698, 743), (768, 813)]
# Photo x box: (73, 108)
titulares = [
    (1, "MÍNGUEZ BRAVO, FERNANDO", "Portero", "Dorsal 1 | Titular | Portero"),
    (5, "MIGUEL CHICO, ALVARO", "Defensa Central", "Dorsal 5 | Titular | Central"),
    (6, "MARTINEZ SANZ, ADRIAN", "Defensa Central", "Dorsal 6 | Titular | Central / Lateral"),
    (8, "GARCIA ORDEN, EDUARDO", "Mediocentro", "Dorsal 8 | Titular | Mediocentro"),
    (10, "NIETO VELA, DANIEL", "Mediapunta", "Dorsal 10 | Titular | Mediapunta / Organizador"),
    (11, "BACIERO ALVAREZ, ASIER", "Extremo", "Dorsal 11 | Titular | Extremo"),
    (12, "MATEO PEREZ, DIEGO", "Defensa Lateral", "Dorsal 12 | Titular | Lateral"),
    (14, "GARCIA SAUKO, DANIEL", "Mediocentro", "Dorsal 14 | Titular | Mediocentro"),
    (16, "DOMINGUEZ VELA, RODRIGO", "Extremo", "Dorsal 16 | Titular | Extremo / Delantero"),
    (21, "SANZ MARTINEZ, PABLO", "Interior", "Dorsal 21 | Titular | Interior"),
    (22, "ACEBES HUERTA, EDGAR", "Delantero", "Dorsal 22 | Titular | Delantero Centro")
]

segments_1 = [(68, 113), (138, 183), (209, 253), (278, 323), (348, 393), (418, 463), (488, 533), (558, 603), (628, 673), (698, 743), (768, 813)]

def sanitize(name):
    import unicodedata
    n = unicodedata.normalize('NFD', name)
    n = ''.join(c for c in n if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-zA-Z0-9_]', '_', n).strip('_')

print("Cropping Titulares from Image 1...")
for i, (dorsal, name, dem, car) in enumerate(titulares):
    sy, ey = segments_1[i]
    # Crop box
    box = (72, sy, 109, ey)
    crop = im1.crop(box)
    
    # Resize to standard size (e.g. 160x200 or 140x180)
    crop = crop.resize((140, 180), Image.Resampling.LANCZOS)
    
    clean_name = sanitize(name)
    fname = f"{str(dorsal).padStart(2, '0') if hasattr(str(dorsal), 'padStart') else f'{dorsal:02d}'}_{clean_name}.png"
    
    dest1 = os.path.join(local_team_dir, fname)
    dest2 = os.path.join(local_rivals_dir, f"calasanz_dorsal_{dorsal}.png")
    
    crop.save(dest1)
    crop.save(dest2)
    print(f"  [OK] {fname} saved.")

# Image 2 (Suplentes):
# Segments: [(17, 62), (89, 132), (157, 202), (227, 269), (294, 339), (364, 409), (434, 479), (504, 549)]
# Photo x box: (59, 96)
suplentes = [
    (33, "GARRIDO GONZALEZ, RAUL", "Portero", "Dorsal 33 | Suplente | Portero"),
    (4, "DOMINGO CAMPOS, ASIER", "Defensa Lateral", "Dorsal 4 | Suplente | Lateral"),
    (7, "AGUSTÍN DOMINGO, ALEJANDRO", "Extremo", "Dorsal 7 | Suplente | Extremo"),
    (9, "RUBIO URCHAGA, HECTOR", "Delantero", "Dorsal 9 | Suplente | Delantero"),
    (17, "MADRIGAL DUARTE, SERGIO", "Delantero", "Dorsal 17 | Suplente | Delantero"),
    (20, "CORDEIRO BARTOLOME, DIEGO", "Interior", "Dorsal 20 | Suplente | Interior / Mediocentro"),
    (23, "GÓMEZ GARCÍA, SERGIO", "Mediapunta", "Dorsal 23 | Suplente | Mediapunta"),
    (24, "NIÑO RUIZ, IVAN", "Defensa Central", "Dorsal 24 | Suplente | Central")
]

segments_2 = [(17, 62), (89, 132), (157, 202), (227, 269), (294, 339), (364, 409), (434, 479), (504, 549)]

print("\nCropping Suplentes from Image 2...")
for i, (dorsal, name, dem, car) in enumerate(suplentes):
    sy, ey = segments_2[i]
    box = (59, sy, 96, ey)
    crop = im2.crop(box)
    crop = crop.resize((140, 180), Image.Resampling.LANCZOS)
    
    clean_name = sanitize(name)
    fname = f"{dorsal:02d}_{clean_name}.png"
    
    dest1 = os.path.join(local_team_dir, fname)
    dest2 = os.path.join(local_rivals_dir, f"calasanz_dorsal_{dorsal}.png")
    
    crop.save(dest1)
    crop.save(dest2)
    print(f"  [OK] {fname} saved.")

print("\nAll 19 photos cropped and saved successfully!")
