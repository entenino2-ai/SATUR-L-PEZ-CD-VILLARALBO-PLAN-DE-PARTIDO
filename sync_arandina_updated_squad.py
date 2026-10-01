import os
import sys
import json
import re
import unicodedata
import urllib.request
from PIL import Image, ImageDraw, ImageFont

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://slexyuklfyjufevzppsc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA"

ARANDINA_TEAM_ID = "566d8e1b-8c69-47b9-aa5a-55830eb29f70"
ARANDINA_NAME = "Arandina CF"
ARANDINA_FOLDER = "Arandina_CF"

IM1_PATH = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\9aa8e092-c8ec-4284-af88-87e4e5ef69d8\.user_uploaded\media_1790855676550.png"
IM2_PATH = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\9aa8e092-c8ec-4284-af88-87e4e5ef69d8\.user_uploaded\media_1790855697386.png"

def slugify(text):
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-zA-Z0-9_\-\s]', '', text).strip()
    return re.sub(r'\s+', '_', text)

def upload_to_supabase_storage(local_path, bucket_name, storage_path, content_type='image/png'):
    with open(local_path, 'rb') as f:
        data = f.read()

    url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{storage_path}"
    req = urllib.request.Request(url, data=data, method='POST', headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': content_type,
        'x-upsert': 'true'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status in (200, 201)
    except urllib.error.HTTPError as e:
        if e.code in (200, 201):
            return True
        print(f"Storage error {e.code} uploading {storage_path}: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Storage exception uploading {storage_path}: {e}")
        return False

def insert_player_db(player_data):
    url = f"{SUPABASE_URL}/rest/v1/jugadores_equipo"
    req_data = json.dumps(player_data).encode('utf-8')
    req = urllib.request.Request(url, data=req_data, method='POST', headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status in (200, 201)
    except urllib.error.HTTPError as e:
        print(f"DB insert error {e.code}: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Exception inserting player: {e}")
        return False

def process_cropped_photo(cropped_img, out_path, size=(240, 240)):
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    cropped_rgb = cropped_img.convert('RGB')
    target_h = size[1] - 16
    aspect = cropped_rgb.width / cropped_rgb.height
    target_w = int(target_h * aspect)
    resized_photo = cropped_rgb.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    pos_x = (size[0] - target_w) // 2
    pos_y = 8
    
    mask = Image.new('L', (target_w, target_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, target_w, target_h], radius=16, fill=255)
    
    img.paste(resized_photo, (pos_x, pos_y), mask)
    
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([pos_x, pos_y, pos_x + target_w, pos_y + target_h], radius=16, outline=(30, 58, 138, 220), width=3)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="PNG")

def create_styled_avatar(dorsal, name, pos, out_path):
    size = (360, 360)
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    primary_color = (30, 58, 138) # Arandina Blue
    secondary_color = (255, 255, 255) # White

    margin = 10
    draw.ellipse([margin, margin, size[0] - margin, size[1] - margin], fill=primary_color, outline=secondary_color, width=8)

    inner_m = 24
    draw.ellipse([inner_m, inner_m, size[0] - inner_m, size[1] - inner_m], outline=(255, 255, 255, 120), width=3)

    head_center = (180, 130)
    head_radius = 50
    draw.ellipse([head_center[0] - head_radius, head_center[1] - head_radius, head_center[0] + head_radius, head_center[1] + head_radius], fill=(245, 245, 245, 230))

    draw.chord([60, 190, 300, 390], 180, 360, fill=(245, 245, 245, 230))
    draw.polygon([(150, 195), (180, 225), (210, 195)], fill=primary_color)

    d_center = (280, 275)
    d_radius = 42
    draw.ellipse([d_center[0] - d_radius, d_center[1] - d_radius, d_center[0] + d_radius, d_center[1] + d_radius], fill=(220, 38, 38), outline=(255, 255, 255), width=4)

    try:
        font_large = ImageFont.truetype("arialbd.ttf", 38)
        font_small = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    d_str = str(dorsal) if dorsal else "-"
    draw.text(d_center, d_str, fill=(255, 255, 255), font=font_large, anchor="mm")

    pos_abbrev = {
        'Portero': 'POR',
        'Defensa Central': 'DFC',
        'Defensa Lateral': 'LTD/LTI',
        'Mediocentro': 'MC',
        'Interior': 'INT',
        'Extremo': 'EXT',
        'Mediapunta': 'MCO',
        'Delantero': 'DC'
    }.get(pos, 'JUG')

    draw.rounded_rectangle([30, 260, 130, 295], radius=8, fill=(15, 23, 42, 220), outline=(255, 255, 255, 180), width=2)
    draw.text((80, 277), pos_abbrev, fill=(255, 255, 255), font=font_small, anchor="mm")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="PNG")

def main():
    print("========================================================================")
    print("SINCRONIZANDO PLANTILLA ACTUALIZADA Y FOTOS DE ARANDINA CF EN SUPABASE")
    print("========================================================================\n")

    im1 = Image.open(IM1_PATH).convert('RGB')
    im2 = Image.open(IM2_PATH).convert('RGB')

    # Image 1 Players:
    im1_players = [
        (1, "TAPIAS PEREZ, RODRIGO", "Portero", "Dorsal 1 | Titular | Portero experimentado y seguro bajo palos", (53, 20, 97, 67)),
        (3, "MARTIN AGUILAR, FRANCISCO", "Defensa Lateral", "Dorsal 3 | Titular | Lateral diestro con gran repliegue y anticipación", (53, 90, 97, 137)),
        (5, "SASTOQUE PINZON, JUAN DIEGO", "Defensa Central", "Dorsal 5 | Titular | Central de jerarquía y contundencia por alto", (53, 160, 97, 207)),
        (8, "GONZÁLEZ IGLESIAS, ISRAEL", "Mediocentro", "Dorsal 8 | Titular | Mediocentro de equilibrio, pase preciso y recuperación", (53, 230, 97, 277)),
        (9, "RENGEL RODRIGUEZ, JULIO", "Delantero", "Dorsal 9 | Titular | Delantero centro de área, rematador y movilidad", (53, 300, 97, 347)),
        (10, "GONZALEZ SANTANA, MARIO", "Mediapunta", "Dorsal 10 | Titular | Mediapunta creativo, visión de juego y último pase", (53, 370, 97, 417)),
        (11, "BARRANCO MONTOYA, FRANCISCO JAVIER", "Extremo", "Dorsal 11 | Titular | Extremo rápido, desborde continuo en 1vs1", (53, 440, 97, 487)),
        (18, "KANOUTE, FAMOUSSA", "Extremo", "Dorsal 18 | Titular | Extremo de tremenda zancada y potencia física", (53, 510, 97, 557)),
        (19, "MENOR MOLINERO, JOSE", "Interior", "Dorsal 19 | Titular | Interior dinámico con llegada y golpeo a puerta", (53, 580, 97, 627)),
        (21, "JIMENEZ RUIZ, ADRIAN", "Extremo", "Dorsal 21 | Titular | Extremo vertical de diagonales incisivas", (53, 650, 97, 697)),
        (23, "CORTIJO DEL HOYO, FERNANDO", "Defensa Lateral", "Dorsal 23 | Titular | Lateral izquierdo de profundidad y centros", (53, 720, 97, 767))
    ]

    # Image 2 Players:
    im2_players = [
        (13, "GONZALEZ CESPEDOSA, ALBERTO", "Portero", "Dorsal 13 | Suplente | Guardameta de reflejos rápidos", (53, 16, 97, 61)),
        (4, "HURTADO MELADO, ALEJANDRO", "Defensa Central", "Dorsal 4 | Suplente | Central expeditivo en duelos terrestres", (53, 80, 97, 128)),
        (6, "DE BENITO FERNANDEZ, AARON", "Mediocentro", "Dorsal 6 | Suplente | Pivote defensivo de orden táctico", (53, 154, 97, 201)),
        (20, "CORTÁZAR GARCÍA, METEKU JUAN", "Extremo", "Dorsal 20 | Suplente | Atacante explosivo y regateador", (53, 224, 97, 271)),
        (24, "VELASCO RUIZ, GUILLERMO", "Delantero", "Dorsal 24 | Suplente | Delantero de apoyo y juego de espaldas", (53, 294, 97, 341))
    ]

    # Additional squad members from text list:
    extra_players = [
        (14, "NEBREDA MUÑOZ, LUCAS", "Defensa Lateral", "Dorsal 14 | Suplente | Lateral sobrio y polivalente"),
        (7, "RUSU IONITA, STEFAN ALEJANDRO", "Mediocentro", "Dorsal 7 | Suplente | Centrocampista con buena visión"),
        (12, "SAMSO BAGALONI, PEDRO ISIDRO", "Delantero", "Dorsal 12 | Suplente | Atacante de área y presión"),
        (15, "TARIQ, ARMAN AMER", "Extremo", "Dorsal 15 | Suplente | Extremo de desmarque rápido"),
        (16, "WASHINGTON SULIMAN, ABDULLA LLOYD", "Mediocentro", "Dorsal 16 | Suplente | Centrocampista de corte defensivo")
    ]

    # Clean previous records for Arandina CF
    try:
        del_url = f"{SUPABASE_URL}/rest/v1/jugadores_equipo?equipo_id=eq.{ARANDINA_TEAM_ID}"
        req_del = urllib.request.Request(del_url, method='DELETE', headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        })
        with urllib.request.urlopen(req_del) as d_resp:
            print("  ✓ Limpieza de registros anteriores de Arandina CF completada.")
    except Exception as e:
        print(f"Nota limpieza: {e}")

    scratch_dir = os.path.join(os.getcwd(), "scratch_avatars", ARANDINA_FOLDER)
    os.makedirs(scratch_dir, exist_ok=True)

    total_synced = 0

    print("\n1. Procesando y subiendo fotos de Image 1 (Titulares):")
    for dorsal, name, pos, carac, bbox in im1_players:
        crop = im1.crop(bbox)
        dorsal_str = f"{dorsal:02d}"
        clean_name = slugify(name)
        filename = f"{dorsal_str}_{clean_name}.png"
        local_path = os.path.join(scratch_dir, filename)
        storage_path = f"jugadores_equipo/{ARANDINA_FOLDER}/{filename}"

        process_cropped_photo(crop, local_path)
        upload_to_supabase_storage(local_path, "FOTOS%20JUGADORES", storage_path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

        record = {
            "equipo_id": ARANDINA_TEAM_ID,
            "equipo_nombre": ARANDINA_NAME,
            "nombre": name,
            "demarcacion": pos,
            "caracteristicas": carac,
            "foto_url": public_url
        }
        if insert_player_db(record):
            total_synced += 1
            print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> Foto y BD OK")

    print("\n2. Procesando y subiendo fotos de Image 2 (Resto de Plantilla):")
    for dorsal, name, pos, carac, bbox in im2_players:
        crop = im2.crop(bbox)
        dorsal_str = f"{dorsal:02d}"
        clean_name = slugify(name)
        filename = f"{dorsal_str}_{clean_name}.png"
        local_path = os.path.join(scratch_dir, filename)
        storage_path = f"jugadores_equipo/{ARANDINA_FOLDER}/{filename}"

        process_cropped_photo(crop, local_path)
        upload_to_supabase_storage(local_path, "FOTOS%20JUGADORES", storage_path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

        record = {
            "equipo_id": ARANDINA_TEAM_ID,
            "equipo_nombre": ARANDINA_NAME,
            "nombre": name,
            "demarcacion": pos,
            "caracteristicas": carac,
            "foto_url": public_url
        }
        if insert_player_db(record):
            total_synced += 1
            print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> Foto y BD OK")

    print("\n3. Procesando y subiendo jugadores adicionales:")
    for dorsal, name, pos, carac in extra_players:
        dorsal_str = f"{dorsal:02d}"
        clean_name = slugify(name)
        filename = f"{dorsal_str}_{clean_name}.png"
        local_path = os.path.join(scratch_dir, filename)
        storage_path = f"jugadores_equipo/{ARANDINA_FOLDER}/{filename}"

        create_styled_avatar(dorsal, name, pos, local_path)
        upload_to_supabase_storage(local_path, "FOTOS%20JUGADORES", storage_path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

        record = {
            "equipo_id": ARANDINA_TEAM_ID,
            "equipo_nombre": ARANDINA_NAME,
            "nombre": name,
            "demarcacion": pos,
            "caracteristicas": carac,
            "foto_url": public_url
        }
        if insert_player_db(record):
            total_synced += 1
            print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> Avatar y BD OK")

    print(f"\n========================================================================")
    print(f"¡FINALIZADO! Se han sincronizado {total_synced} jugadores de Arandina CF.")
    print(f"========================================================================")

if __name__ == "__main__":
    main()
