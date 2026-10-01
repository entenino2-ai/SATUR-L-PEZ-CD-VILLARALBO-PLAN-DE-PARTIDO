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

def slugify(text):
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-zA-Z0-9_\-\s]', '', text).strip()
    return re.sub(r'\s+', '_', text)

def create_player_avatar(dorsal, name, pos, team_name, primary_color, secondary_color, out_path):
    size = (360, 360)
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

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

def upload_file_to_supabase(local_file, storage_path):
    with open(local_file, 'rb') as f:
        data = f.read()

    url = f"{SUPABASE_URL}/storage/v1/object/FOTOS%20JUGADORES/{storage_path}"
    req = urllib.request.Request(url, data=data, method='POST', headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/png',
        'x-upsert': 'true'
    })
    try:
        with urllib.request.urlopen(req) as response:
            return response.status in (200, 201)
    except urllib.error.HTTPError as e:
        if e.code in (200, 201):
            return True
        return False
    except:
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
    except:
        return False

BATCH_2 = [
    {
        "team_id": "1ae3572d-fa9f-4a8e-aeb3-d46c2ddb4112",
        "team_name": "Atlético Mansillés",
        "folder": "Atletico_Mansilles",
        "primary_color": (185, 28, 28),
        "secondary_color": (255, 255, 255),
        "players": [
            (1, "ÁLEX, GONZÁLEZ", "Portero", "Dorsal 1 | Titular | Portero de gran agilidad"),
            (2, "JAVIER, CASAS", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro rápido"),
            (3, "MARIO, BLANCO", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo férreo"),
            (4, "DAVID, ASENSIO", "Defensa Central", "Dorsal 4 | Titular | Central contundente"),
            (5, "PABLO, DÍAZ", "Defensa Central", "Dorsal 5 | Titular | Central de buen salto"),
            (6, "SERGIO, MATÉ", "Mediocentro", "Dorsal 6 | Titular | Centrocampista recuperador"),
            (7, "RUBÉN, HUERGA", "Extremo", "Dorsal 7 | Titular | Extremo rápido"),
            (8, "VÍCTOR, GÓMEZ", "Interior", "Dorsal 8 | Titular | Interior con visión"),
            (9, "DANI, BLANCO", "Delantero", "Dorsal 9 | Titular | Delantero goleador"),
            (10, "ÁNGEL, LÓPEZ", "Mediapunta", "Dorsal 10 | Titular | Mediapunta con técnica"),
            (11, "DIEGO, SANCHÍS", "Extremo", "Dorsal 11 | Titular | Extremo vertical"),
            (13, "HUGO, SUÁREZ", "Portero", "Dorsal 13 | Suplente | Portero suplente"),
            (14, "CARLOS, GARCÍA", "Defensa Central", "Dorsal 14 | Suplente | Central recambio"),
            (15, "ADRIÁN, LLAMAS", "Mediocentro", "Dorsal 15 | Suplente | Mediocentro mixto"),
            (16, "MARCOS, RIVAS", "Delantero", "Dorsal 16 | Suplente | Delantero de apoyo")
        ]
    },
    {
        "team_id": "bede2b21-7a97-4134-9cf0-d8f64074dc19",
        "team_name": "C.D. Mirandés S.A.D. \"B\"",
        "folder": "CD_Mirandes_B",
        "primary_color": (220, 38, 38),
        "secondary_color": (15, 23, 42),
        "players": [
            (1, "ALEJANDRO, IBARRA", "Portero", "Dorsal 1 | Titular | Filial Mirandés, gran juego aéreo"),
            (2, "UNAI, ZUBELDIA", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro incisivo"),
            (3, "ASIER, MURUA", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de profundidad"),
            (4, "IKER, SAN VICENTE", "Defensa Central", "Dorsal 4 | Titular | Central expeditivo"),
            (5, "MARKEL, MARTÍNEZ", "Defensa Central", "Dorsal 5 | Titular | Central zurdo de inicio"),
            (6, "ANDER, PÉREZ", "Mediocentro", "Dorsal 6 | Titular | Pivote organizador"),
            (7, "PABLO, HERVIAS", "Extremo", "Dorsal 7 | Titular | Extremo desequilibrante"),
            (8, "JORGE, SALGADO", "Interior", "Dorsal 8 | Titular | Interior de recorrido"),
            (9, "ENEKO, BASCONES", "Delantero", "Dorsal 9 | Titular | Delantero centro de área"),
            (10, "ARITZ, MUGURUZA", "Mediapunta", "Dorsal 10 | Titular | Talento y último pase"),
            (11, "ALBERTO, SANTA CRUZ", "Extremo", "Dorsal 11 | Titular | Extremo rápido"),
            (13, "JON, GOIKOETXEA", "Portero", "Dorsal 13 | Suplente | Portero de reflejos"),
            (14, "MIKEL, ARANA", "Defensa Central", "Dorsal 14 | Suplente | Central suplente"),
            (15, "INAZIO, LARRAÑAGA", "Mediocentro", "Dorsal 15 | Suplente | Mediocentro de contención"),
            (16, "BEÑAT, LEIZA", "Delantero", "Dorsal 16 | Suplente | Delantero móvil")
        ]
    },
    {
        "team_id": "adcd10e4-3d19-4937-a0c9-996f95caa536",
        "team_name": "Real Ávila CF",
        "folder": "Real_Avila_CF",
        "primary_color": (30, 58, 138),
        "secondary_color": (220, 38, 38),
        "players": [
            (1, "ÁLVARO, DE PABLO", "Portero", "Dorsal 1 | Titular | Guardameta sobrio y seguro"),
            (2, "ALFA, SITO", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho potente"),
            (3, "IBRAHIM, DOUCOURE", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de físico imponente"),
            (4, "CARLOS, PASCUAL", "Defensa Central", "Dorsal 4 | Titular | Central mariscal en el Adolfo Suárez"),
            (5, "ADILSON, GOMES", "Defensa Central", "Dorsal 5 | Titular | Central rápido en coberturas"),
            (6, "DANI, TENA", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de jerarquía y mando"),
            (7, "ALBERTO, MARTÍN", "Extremo", "Dorsal 7 | Titular | Extremo incisivo"),
            (8, "FERNANDO, ALBÍN", "Interior", "Dorsal 8 | Titular | Interior con llegada"),
            (9, "TITI, ADRIÁN", "Delantero", "Dorsal 9 | Titular | Delantero goleador y rematador"),
            (10, "CAMPOS, JORGE", "Mediapunta", "Dorsal 10 | Titular | El '10' con calidad técnica"),
            (11, "MARQUITO, MARCOS", "Extremo", "Dorsal 11 | Titular | Extremo eléctrico"),
            (13, "ÑETE, HERNÁNDEZ", "Portero", "Dorsal 13 | Suplente | Portero de garantías"),
            (14, "VÍCTOR, DEL MONTE", "Defensa Central", "Dorsal 14 | Suplente | Central suplente"),
            (15, "BABACAR, DIOP", "Mediocentro", "Dorsal 15 | Suplente | Pivote físico"),
            (16, "EDER, DÍEZ", "Delantero", "Dorsal 16 | Suplente | Delantero de choque")
        ]
    },
    {
        "team_id": "9bdd4760-85a1-4234-8640-919bba545e5f",
        "team_name": "Zamora CF",
        "folder": "Zamora_CF",
        "primary_color": (185, 28, 28),
        "secondary_color": (15, 23, 42),
        "players": [
            (1, "FERMÍN, SOBRÓN", "Portero", "Dorsal 1 | Titular | Portero titular en Ruta de la Plata"),
            (2, "CARLOS, PARRA", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro con experiencia"),
            (3, "JULEN, CASTAÑEDA", "Defensa Lateral", "Dorsal 3 | Titular | Lateral izquierdo veterano y preciso"),
            (4, "BOLO, JAVIER", "Defensa Central", "Dorsal 4 | Titular | Central de enorme jerarquía"),
            (5, "LUISETTE, MORALES", "Defensa Central", "Dorsal 5 | Titular | Central contundente al corte"),
            (6, "JUANAN, DEL ÁLAMO", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de equilibrio y llegada"),
            (7, "KIKI, MÁRQUEZ", "Extremo", "Dorsal 7 | Titular | Extremo con regate y desborde"),
            (8, "CARLOS, RAMOS", "Interior", "Dorsal 8 | Titular | Especialista a balón parado y visión"),
            (9, "PINITO, SERGIO", "Delantero", "Dorsal 9 | Titular | Delantero referencia y remate"),
            (10, "MANCEBO, ADRIÁN", "Mediapunta", "Dorsal 10 | Titular | Mago del balón en tres cuartos"),
            (11, "RUFO, SÁNCHEZ", "Extremo", "Dorsal 11 | Titular | Extremo con gran disparo"),
            (13, "TROYA, JON", "Portero", "Dorsal 13 | Suplente | Portero de reflejos"),
            (14, "THEO, LÓPEZ", "Defensa Central", "Dorsal 14 | Suplente | Central suplente"),
            (15, "MARKEL, GOÑI", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista de contención"),
            (16, "BALDRICH, JOEL", "Delantero", "Dorsal 16 | Suplente | Delantero de velocidad")
        ]
    },
    {
        "team_id": "23e16c58-9fbf-4e0b-83a5-5559a1635c6f",
        "team_name": "C.D.F. Mojados",
        "folder": "CDF_Mojados",
        "primary_color": (234, 179, 8),
        "secondary_color": (30, 58, 138),
        "players": [
            (1, "CHUCHI, DE LA FUENTE", "Portero", "Dorsal 1 | Titular | Portero seguro y con mando"),
            (2, "ALVARITO, GARCÍA", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho rápido"),
            (3, "JORGE, SANTOS", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo disciplinado"),
            (4, "COLAS, MIGUEL", "Defensa Central", "Dorsal 4 | Titular | Central de anticipación"),
            (5, "MARIO, CANO", "Defensa Central", "Dorsal 5 | Titular | Central de poderío físico"),
            (6, "DAVID, CERRO", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de contención"),
            (7, "DIEGO, PELÁEZ", "Extremo", "Dorsal 7 | Titular | Extremo de desborde"),
            (8, "ALFONSO, HUERGA", "Interior", "Dorsal 8 | Titular | Interior de calidad"),
            (9, "DANI, BLANCO", "Delantero", "Dorsal 9 | Titular | Delantero rematador"),
            (10, "KIKO, GONZÁLEZ", "Mediapunta", "Dorsal 10 | Titular | Mediapunta creativo"),
            (11, "SERGIO, MATEO", "Extremo", "Dorsal 11 | Titular | Extremo rápido"),
            (13, "ROBERTO, SÁNCHEZ", "Portero", "Dorsal 13 | Suplente | Guardameta suplente"),
            (14, "ÁLEX, RIVAS", "Defensa Central", "Dorsal 14 | Suplente | Central suplente"),
            (15, "NACHO, BLANCO", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista mixto"),
            (16, "RAÚL, CALVO", "Delantero", "Dorsal 16 | Suplente | Delantero revulsivo")
        ]
    }
]

def main():
    print("========================================================================")
    print("SINCRONIZANDO LOTE 2 DE EQUIPOS RIVALES EN SUPABASE")
    print("========================================================================\n")

    temp_dir = os.path.join(os.getcwd(), "scratch_avatars")
    os.makedirs(temp_dir, exist_ok=True)

    total_inserted = 0

    for team in BATCH_2:
        team_id = team["team_id"]
        team_name = team["team_name"]
        folder = team["folder"]
        prim_col = team["primary_color"]
        sec_col = team["secondary_color"]
        players = team["players"]

        print(f"\n--- Procesando: {team_name} ({len(players)} jugadores) ---")

        for dorsal, name, pos, carac in players:
            dorsal_str = f"{dorsal:02d}" if dorsal else "00"
            clean_name = slugify(name)
            filename = f"{dorsal_str}_{clean_name}.png"
            local_path = os.path.join(temp_dir, folder, filename)
            storage_path = f"jugadores_equipo/{folder}/{filename}"

            create_player_avatar(dorsal, name, pos, team_name, prim_col, sec_col, local_path)
            upload_file_to_supabase(local_path, storage_path)
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

            player_record = {
                "equipo_id": team_id,
                "equipo_nombre": team_name,
                "nombre": name,
                "demarcacion": pos,
                "caracteristicas": carac,
                "foto_url": public_url
            }

            ok = insert_player_db(player_record)
            if ok:
                total_inserted += 1
                print(f"  OK [{dorsal_str}] {name} ({pos})")
            else:
                print(f"  ERR {name}")

    print(f"\n========================================================================")
    print(f"¡LOTE 2 COMPLETADO! Se sincronizaron {total_inserted} jugadores adicionales.")
    print(f"========================================================================")

if __name__ == "__main__":
    main()
