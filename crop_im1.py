import os
from PIL import Image

im1 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png").convert('RGB')
im2 = Image.open(r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378303324.png").convert('RGB')

out_dir = r"c:\Users\Usuario\Desktop\WEB APP SATUR LÓPEZ CD VILLARALBO PLAN PARTIDO\public\players\scraped"
os.makedirs(out_dir, exist_ok=True)

# Image 1 (Titulares):
# Santa Marta (11 players)
sm_titulares = [
    (1, "Sergio del Río Redondo", "Portero"),
    (2, "Diego José Alonso Carballo", "Defensa Lateral"),
    (3, "Manuel Santiago García Oliva", "Defensa Central"),
    (5, "Alejandro Iniesta Soriano", "Defensa Central"),
    (6, "Miguel Velázquez Sancho", "Mediocentro"),
    (7, "Iker Hernández Ezquerro", "Extremo"),
    (9, "Martín Luis Galván Romo", "Delantero"),
    (10, "Sergio Santos Rubio", "Mediapunta"),
    (19, "Ninte Nater Carungal", "Extremo"),
    (22, "Álvaro Coque Pérez", "Defensa Lateral"),
    (23, "Adrián León Ortega", "Mediocentro")
]

# Arandina (11 players)
ar_titulares = [
    (1, "Rodrigo Tapias Pérez", "Portero"),
    (3, "Francisco Martín Aguilar", "Defensa Central"),
    (5, "Juan Diego Sastoque Pinzón", "Defensa Central"),
    (8, "Israel González Iglesias", "Mediocentro"),
    (9, "Julio Rengel Rodríguez", "Delantero"),
    (10, "Mario González Santana", "Mediapunta"),
    (11, "Francisco Javier Barranco Montoya", "Extremo"),
    (14, "Lucas Nebreda Muñoz", "Defensa Lateral"),
    (18, "Famoussa Kanoute", "Extremo"),
    (19, "José Menor Molinero", "Interior"),
    (21, "Adrián Jiménez Ruiz", "Defensa Lateral")
]

# Lets crop Image 1
for i, (dorsal, name, dem) in enumerate(sm_titulares):
    # center y = 97 + i * 65
    cy = int(95 + i * 64.6)
    box = (68, cy - 24, 102, cy + 24)
    cropped = im1.crop(box)
    fname = f"sm_titular_{dorsal}_{name.replace(' ', '_').lower()}.png"
    cropped.save(os.path.join(out_dir, fname))

for i, (dorsal, name, dem) in enumerate(ar_titulares):
    cy = int(95 + i * 64.6)
    box = (500, cy - 24, 534, cy + 24)
    cropped = im1.crop(box)
    fname = f"ar_titular_{dorsal}_{name.replace(' ', '_').lower()}.png"
    cropped.save(os.path.join(out_dir, fname))

print("Image 1 cropped successfully.")
