import os
from PIL import Image

im1_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378286130.png"
im2_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\70f0d800-6526-4205-9c78-baa884737d02\.user_uploaded\media_1789378303324.png"

out_dir = r"c:\Users\Usuario\Desktop\WEB APP SATUR LÓPEZ CD VILLARALBO PLAN PARTIDO\public\players\rivals"
os.makedirs(out_dir, exist_ok=True)

im1 = Image.open(im1_path).convert('RGB')
im2 = Image.open(im2_path).convert('RGB')

# Image 1 (Titulares): 844x781
# Santa Marta Titulares (11)
sm_titulares = [
    (1, "DEL RÍO REDONDO, SERGIO"),
    (2, "ALONSO CARBALLO, DIEGO JOSE"),
    (3, "GARCÍA OLIVA, MANUEL SANTIAGO"),
    (5, "INIESTA SORIANO, ALEJANDRO"),
    (6, "VELAZQUEZ SANCHO, MIGUEL"),
    (7, "HERNANDEZ EZQUERRO, IKER"),
    (9, "GALVAN ROMO, MARTIN LUIS"),
    (10, "SANTOS RUBIO, SERGIO"),
    (19, "NATER CARUNGAL, NINTE"),
    (22, "COQUE PÉREZ, ÁLVARO"),
    (23, "LEON ORTEGA, ADRIAN"),
]

for i, (dorsal, name) in enumerate(sm_titulares):
    cy = int(95 + i * 64.6)
    box = (67, cy - 23, 103, cy + 24)
    crop = im1.crop(box).resize((120, 150), Image.Resampling.LANCZOS)
    filename = f"santa_marta_dorsal_{dorsal}.png"
    crop.save(os.path.join(out_dir, filename))
    print(f"Saved {filename}")

# Arandina Titulares (11)
ar_titulares = [
    (1, "TAPIAS PEREZ, RODRIGO"),
    (3, "MARTIN AGUILAR, FRANCISCO"),
    (5, "SASTOQUE PINZON, JUAN DIEGO"),
    (8, "GONZÁLEZ IGLESIAS, ISRAEL"),
    (9, "RENGEL RODRIGUEZ, JULIO"),
    (10, "GONZALEZ SANTANA, MARIO"),
    (11, "BARRANCO MONTOYA, FRANCISCO JAVIER"),
    (14, "NEBREDA MUÑOZ, LUCAS"),
    (18, "KANOUTE, FAMOUSSA"),
    (19, "MENOR MOLINERO, JOSE"),
    (21, "JIMENEZ RUIZ, ADRIAN"),
]

for i, (dorsal, name) in enumerate(ar_titulares):
    cy = int(95 + i * 64.6)
    box = (499, cy - 23, 535, cy + 24)
    crop = im1.crop(box).resize((120, 150), Image.Resampling.LANCZOS)
    filename = f"arandina_dorsal_{dorsal}.png"
    crop.save(os.path.join(out_dir, filename))
    print(f"Saved {filename}")

# Image 2 (Suplentes): 835x663
# Santa Marta Suplentes (9)
sm_suplentes = [
    (13, "SALDAÑA BAEZA, JOSE MARIA"),
    (4, "GARRIDO RODRIGUEZ, DANIEL"),
    (8, "GANDARA GONZALEZ, ROBERTO"),
    (11, "MARTÍN MARCOS, DAVID"),
    (17, "GARCIA GARCIA, ALONSO"),
    (20, "RODERO BERROCAL, ENRIQUE"),
    (21, "ARIAS GARCIA, MANUEL"),
    (26, "GARCIA VINAGRE, CHRISTIAN"),
    (30, "EGIDO CALLES, ALVARO"),
]

for i, (dorsal, name) in enumerate(sm_suplentes):
    cy = int(66 + i * 64.9)
    box = (67, cy - 23, 103, cy + 24)
    crop = im2.crop(box).resize((120, 150), Image.Resampling.LANCZOS)
    filename = f"santa_marta_dorsal_{dorsal}.png"
    crop.save(os.path.join(out_dir, filename))
    print(f"Saved {filename}")

# Arandina Suplentes (6)
ar_suplentes = [
    (13, "GONZALEZ CESPEDOSA, ALBERTO"),
    (4, "HURTADO MELADO, ALEJANDRO"),
    (6, "DE BENITO FERNANDEZ, AARON"),
    (7, "VELASCO RUIZ, GUILLERMO"),
    (15, "CORTIJO DEL HOYO, FERNANDO"),
    (20, "CORTÁZAR GARCÍA, METEKU JUAN"),
]

for i, (dorsal, name) in enumerate(ar_suplentes):
    cy = int(66 + i * 64.9)
    box = (499, cy - 23, 535, cy + 24)
    crop = im2.crop(box).resize((120, 150), Image.Resampling.LANCZOS)
    filename = f"arandina_dorsal_{dorsal}.png"
    crop.save(os.path.join(out_dir, filename))
    print(f"Saved {filename}")

# Arandina Staff (3)
ar_staff = [
    ("samuel_paez", 532),
    ("diego_rojas", 602),
]
for tag, cy in ar_staff:
    box = (499, cy - 23, 535, cy + 24)
    crop = im2.crop(box).resize((120, 150), Image.Resampling.LANCZOS)
    filename = f"arandina_staff_{tag}.png"
    crop.save(os.path.join(out_dir, filename))
    print(f"Saved {filename}")

print("All crops completed successfully!")
