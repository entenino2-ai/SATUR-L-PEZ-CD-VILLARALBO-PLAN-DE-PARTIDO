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

TUREGANO_TEAM_ID = "29914875-9423-4c2d-8a3d-8cec7423011a"
TUREGANO_NAME = "Turégano C.F."
TUREGANO_FOLDER = "Turegano_CF"

IM1_PATH = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\9aa8e092-c8ec-4284-af88-87e4e5ef69d8\.user_uploaded\media_1790851980389.png"
IM2_PATH = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\9aa8e092-c8ec-4284-af88-87e4e5ef69d8\.user_uploaded\media_1790851988933.png"
SHIELD_PATH = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\9aa8e092-c8ec-4284-af88-87e4e5ef69d8\.user_uploaded\media_1790852082043.png"

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
    # Create framed avatar with subtle border and transparent background
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    
    # Resize cropped image maintaining aspect ratio
    cropped_rgb = cropped_img.convert('RGB')
    target_h = size[1] - 16
    aspect = cropped_rgb.width / cropped_rgb.height
    target_w = int(target_h * aspect)
    resized_photo = cropped_rgb.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Center photo in canvas
    pos_x = (size[0] - target_w) // 2
    pos_y = 8
    
    # Create rounded mask or rounded rectangle
    mask = Image.new('L', (target_w, target_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, target_w, target_h], radius=16, fill=255)
    
    # Paste photo with mask
    img.paste(resized_photo, (pos_x, pos_y), mask)
    
    # Draw nice border
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([pos_x, pos_y, pos_x + target_w, pos_y + target_h], radius=16, outline=(220, 38, 38, 220), width=3)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="PNG")

def create_styled_avatar(dorsal, name, pos, out_path):
    size = (360, 360)
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    primary_color = (185, 28, 28) # Turégano Red
    secondary_color = (30, 41, 59) # Slate

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
    draw.ellipse([d_center[0] - d_radius, d_center[1] - d_radius, d_center[0] + d_radius, d_center[1] + d_radius], fill=secondary_color, outline=(255, 255, 255), width=4)

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
    print("SINCRONIZANDO PLANTILLA Y ESCUDO DE TURÉGANO C.F. EN SUPABASE")
    print("========================================================================\n")

    # 1. Update Shield in Supabase
    print("1. Subiendo Escudo de Turégano C.F...")
    im_shield = Image.open(SHIELD_PATH)
    local_shield_path = os.path.join("public", "shields", "turegano.png")
    im_shield.save(local_shield_path)
    
    # Upload shield to FOTOS ESCUDOS bucket
    upload_to_supabase_storage(local_shield_path, "FOTOS%20ESCUDOS", "turegano.png")
    
    # Update equipo record in DB
    try:
        update_team_url = f"{SUPABASE_URL}/rest/v1/equipos?id=eq.{TUREGANO_TEAM_ID}"
        update_data = json.dumps({
            "escudo_url": "/shields/turegano.png"
        }).encode('utf-8')
        req_update = urllib.request.Request(update_team_url, data=update_data, method='PATCH', headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json'
        })
        with urllib.request.urlopen(req_update) as r:
            print("  ✓ Escudo de Turégano C.F. actualizado en base de datos.")
    except Exception as e:
        print(f"  Nota actualizando escudo en DB: {e}")

    # 2. Open Screenshots
    im1 = Image.open(IM1_PATH).convert('RGB')
    im2 = Image.open(IM2_PATH).convert('RGB')

    # Players in Image 1 (Titulares):
    # [(67, 112), (137, 182), (208, 252), (277, 322), (347, 392), (417, 462), (487, 532), (557, 602), (627, 672), (697, 742), (768, 812)]
    im1_players = [
        (1, "TEJEDOR BENITO, EDER", "Portero", "Dorsal 1 | Titular | Portero de gran agilidad y reflejos bajo palos", (75, 67, 117, 114)),
        (3, "ARRANZ SANZ, DAVID", "Defensa Lateral", "Dorsal 3 | Titular | Lateral rápido y seguro en marcas defensivas", (75, 137, 117, 184)),
        (4, "MURDOLO CRIADO, ALBERT", "Defensa Central", "Dorsal 4 | Titular | Central de poderío físico y contundencia por alto", (75, 208, 117, 254)),
        (5, "ALMENDÁRIZ GARCÍA, DIEGO", "Defensa Central", "Dorsal 5 | Titular | Central con gran sentido táctico y anticipación", (75, 277, 117, 324)),
        (14, "MARTIN DUQUE, GUILLERMO", "Interior", "Dorsal 14 | Titular | Interior técnico con despliegue y último pase", (75, 347, 117, 394)),
        (15, "GIL LAZARO, MANUEL", "Mediocentro", "Dorsal 15 | Titular | Pivote organizador y recuperador en mediocampo", (75, 417, 117, 464)),
        (16, "LEMOUATI, WAIL", "Extremo", "Dorsal 16 | Titular | Extremo desequilibrante con gran cambio de ritmo", (75, 487, 117, 534)),
        (17, "HERNANDO GONZALEZ, DIEGO", "Defensa Lateral", "Dorsal 17 | Titular | Lateral de recorrido y centros precisos", (75, 557, 117, 604)),
        (18, "ESPEJO RUIZ, HUGO", "Extremo", "Dorsal 18 | Titular | Extremo zurdo incisivo en el 1vs1", (75, 627, 117, 674)),
        (20, "PINO JORGE, HECTOR", "Delantero", "Dorsal 20 | Titular | Delantero de movilidad y velocidad al espacio", (75, 697, 117, 744)),
        (22, "ROMERO, ANDRES EDUARDO", "Delantero", "Dorsal 22 | Titular | Delantero centro potente y rematador en el área", (75, 768, 117, 814))
    ]

    # Players in Image 2:
    # [(21, 66), (91, 136), (161, 206), (231, 276), (310, 346), (371, 416), (441, 486), (515, 556), (581, 626)]
    im2_players = [
        (6, "GARCIA GARCIA, CARLOS", "Defensa Central", "Dorsal 6 | Suplente | Central diestro contundente en duelos", (55, 21, 97, 68)),
        (7, "ROGERO PASCUAL, ALEJANDRO", "Extremo", "Dorsal 7 | Suplente | Extremo con regate y desborde exterior", (55, 91, 97, 138)),
        (8, "CONTRERAS SANZ, ADRIÁN", "Mediocentro", "Dorsal 8 | Suplente | Mediocentro de equilibrio y pase seguro", (55, 161, 97, 208)),
        (9, "PEREZ GARCIA, MIGUEL", "Delantero", "Dorsal 9 | Suplente | Delantero oportunista con olfato de gol", (55, 231, 97, 278)),
        (10, "MARTÍN GOZALO, JOAQUÍN", "Mediapunta", "Dorsal 10 | Suplente | Capitán, visión de juego privilegiada y golpeo", (55, 305, 97, 350)),
        (11, "ALCUBILLA FERRER, DIEGO", "Extremo", "Dorsal 11 | Suplente | Extremo vertical de diagonales rápidas", (55, 371, 97, 418)),
        (12, "LETTIERI, MASSIMO", "Mediocentro", "Dorsal 12 | Suplente | Centrocampista dinámico de buen pie", (55, 441, 97, 488)),
        (21, "ALONSO PEREZ, ADRIAN", "Defensa Lateral", "Dorsal 21 | Suplente | Lateral sobrio y ordenado en cobertura", (55, 510, 97, 558)),
        (23, "SANCHEZ ABAD, SIMON", "Portero", "Dorsal 23 | Suplente | Guardameta de reflejos y buen blocaje", (55, 581, 97, 628))
    ]

    # Remaining 4 squad members from text list:
    extra_players = [
        (19, "ALCUBILLA FERRER, SERGIO", "Delantero", "Dorsal 19 | Suplente | Atacante de zancada y remate"),
        (2, "GARCIA GARCIA, JAVIER", "Defensa Lateral", "Dorsal 2 | Suplente | Lateral diestro disciplinado"),
        (13, "GOMEZ ESCUDERO, IVAN", "Mediocentro", "Dorsal 13 | Suplente | Centrocampista de corte táctico"),
        (24, "SALINAS BALLESTEROS, PABLO", "Delantero", "Dorsal 24 | Suplente | Delantero revulsivo")
    ]

    # Clean previous records for Turégano C.F. to ensure crisp fresh data
    try:
        del_url = f"{SUPABASE_URL}/rest/v1/jugadores_equipo?equipo_id=eq.{TUREGANO_TEAM_ID}"
        req_del = urllib.request.Request(del_url, method='DELETE', headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        })
        with urllib.request.urlopen(req_del) as d_resp:
            print("  ✓ Limpieza previa de registros completada.")
    except Exception as e:
        print(f"Nota limpieza: {e}")

    scratch_dir = os.path.join(os.getcwd(), "scratch_avatars", TUREGANO_FOLDER)
    os.makedirs(scratch_dir, exist_ok=True)

    total_synced = 0

    print("\n2. Procesando y subiendo fotos de Image 1 (Titulares):")
    for dorsal, name, pos, carac, bbox in im1_players:
        crop = im1.crop(bbox)
        dorsal_str = f"{dorsal:02d}"
        clean_name = slugify(name)
        filename = f"{dorsal_str}_{clean_name}.png"
        local_path = os.path.join(scratch_dir, filename)
        storage_path = f"jugadores_equipo/{TUREGANO_FOLDER}/{filename}"

        process_cropped_photo(crop, local_path)
        upload_to_supabase_storage(local_path, "FOTOS%20JUGADORES", storage_path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

        record = {
            "equipo_id": TUREGANO_TEAM_ID,
            "equipo_nombre": TUREGANO_NAME,
            "nombre": name,
            "demarcacion": pos,
            "caracteristicas": carac,
            "foto_url": public_url
        }
        if insert_player_db(record):
            total_synced += 1
            print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> Foto y BD OK")

    print("\n3. Procesando y subiendo fotos de Image 2 (Resto de Plantilla):")
    for dorsal, name, pos, carac, bbox in im2_players:
        crop = im2.crop(bbox)
        dorsal_str = f"{dorsal:02d}"
        clean_name = slugify(name)
        filename = f"{dorsal_str}_{clean_name}.png"
        local_path = os.path.join(scratch_dir, filename)
        storage_path = f"jugadores_equipo/{TUREGANO_FOLDER}/{filename}"

        process_cropped_photo(crop, local_path)
        upload_to_supabase_storage(local_path, "FOTOS%20JUGADORES", storage_path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

        record = {
            "equipo_id": TUREGANO_TEAM_ID,
            "equipo_nombre": TUREGANO_NAME,
            "nombre": name,
            "demarcacion": pos,
            "caracteristicas": carac,
            "foto_url": public_url
        }
        if insert_player_db(record):
            total_synced += 1
            print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> Foto y BD OK")

    print("\n4. Procesando y subiendo jugadores adicionales:")
    for dorsal, name, pos, carac in extra_players:
        dorsal_str = f"{dorsal:02d}"
        clean_name = slugify(name)
        filename = f"{dorsal_str}_{clean_name}.png"
        local_path = os.path.join(scratch_dir, filename)
        storage_path = f"jugadores_equipo/{TUREGANO_FOLDER}/{filename}"

        create_styled_avatar(dorsal, name, pos, local_path)
        upload_to_supabase_storage(local_path, "FOTOS%20JUGADORES", storage_path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

        record = {
            "equipo_id": TUREGANO_TEAM_ID,
            "equipo_nombre": TUREGANO_NAME,
            "nombre": name,
            "demarcacion": pos,
            "caracteristicas": carac,
            "foto_url": public_url
        }
        if insert_player_db(record):
            total_synced += 1
            print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> Avatar y BD OK")

    print(f"\n========================================================================")
    print(f"¡FINALIZADO! Se han sincronizado {total_synced} jugadores de Turégano C.F.")
    print(f"========================================================================")

if __name__ == "__main__":
    main()
