import os
from PIL import Image

im1_path = r'C:\Users\Usuario\.gemini\antigravity-ide\brain\73a98e03-4be3-4139-bca5-a6d79432da59\.user_uploaded\media_1790770532448.png'
im2_path = r'C:\Users\Usuario\.gemini\antigravity-ide\brain\73a98e03-4be3-4139-bca5-a6d79432da59\.user_uploaded\media_1790770537072.png'

im1 = Image.open(im1_path).convert('RGB')
im2 = Image.open(im2_path).convert('RGB')

target_dirs = [
    os.path.join(os.getcwd(), 'public', 'players', 'jugadores_equipo', 'CD_Guijuelo'),
    os.path.join(os.getcwd(), 'public', 'players', 'rivals')
]

for d in target_dirs:
    os.makedirs(d, exist_ok=True)

# Image 1 (Titulares)
titulares = [
    (13, 'GUZMAN_DE_LOS_SANTOS__JOHAN_SNICK'),
    (3, 'GONZALEZ_GOMEZ__RODRIGO'),
    (4, 'ROSON_FERNANDEZ__DAVID'),
    (5, 'RUIZ_IBORRA__JOSE'),
    (7, 'GARCIA_OVIEDO__HUGO'),
    (8, 'SANCHEZ_ASTUDILLO__SERGIO'),
    (14, 'MARTIN_ANDRES__ALBERTO'),
    (17, 'SANCHEZ_MARTIN__DANIEL'),
    (19, 'GODSON__CHRISTIAN'),
    (21, 'ALVAREZ_GARCIA__PEDRO'),
    (22, 'SANCHEZ_GONZALEZ__ALVARO')
]

# Image 2 (Suplentes)
suplentes = [
    (1, 'FERNANDEZ_GARCIA__DANIEL'),
    (6, 'GUTIERREZ_PARRA__HUGO'),
    (9, 'LAZARO_GAITAN__ROBERTO'),
    (15, 'MURIEL_SASTRE__FERNANDO'),
    (16, 'CORDERO_BALLESTEROS__DANIEL'),
    (20, 'REYES_ARDILA__ROBERTO_ANDRES')
]

for i, (dorsal, name) in enumerate(titulares):
    y1 = 67 + i * 70
    y2 = 112 + i * 70
    crop = im1.crop((75, y1, 110, y2))
    # Resize with high quality filter to standard 140x180
    resized = crop.resize((140, 180), Image.Resampling.LANCZOS)
    filename = f"{dorsal:02d}_{name}.png"
    for d in target_dirs:
        out_path = os.path.join(d, filename)
        resized.save(out_path, format='PNG')
    print(f"Saved: {filename}")

for i, (dorsal, name) in enumerate(suplentes):
    y1 = 12 + i * 70
    y2 = 57 + i * 70
    crop = im2.crop((53, y1, 88, y2))
    resized = crop.resize((140, 180), Image.Resampling.LANCZOS)
    filename = f"{dorsal:02d}_{name}.png"
    for d in target_dirs:
        out_path = os.path.join(d, filename)
        resized.save(out_path, format='PNG')
    print(f"Saved: {filename}")

print("\nAll 17 photos cropped and saved successfully!")
