import urllib.request
import urllib.parse
import json
import os
import io
from PIL import Image, ImageDraw, ImageFont

SUPABASE_URL = "https://slexyuklfyjufevzppsc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA"
BUCKET_NAME = "FOTOS JUGADORES"
TEAM_ID = "0d209155-3149-427b-90f2-db84b2feedc7"
TEAM_NAME = "C.D. Palencia Cristo Atlético"
FOLDER_NAME = "Palencia_Cristo_Atletico"

LOCAL_DIR = f"public/players/{FOLDER_NAME}"
os.makedirs(LOCAL_DIR, exist_ok=True)
os.makedirs("scratch_cristo_hq", exist_ok=True)

# List of 23 players
players_data = [
    {
        "dorsal": 1,
        "nombre": "VICENTE CARMONA, PABLO",
        "apodo": "Pablo Vicente",
        "demarcacion": "Portero",
        "caracteristicas": "Dorsal 1 | Titular | Portero ágil y de gran seguridad bajo palos",
        "crop_src": "scratch_cristo/01_VICENTE_CARMONA_PABLO.png",
        "filename": "01_PABLO_VICENTE.png"
    },
    {
        "dorsal": 2,
        "nombre": "APARICIO GOMEZ, JAVIER",
        "apodo": "Aparicio",
        "demarcacion": "Defensa Lateral",
        "caracteristicas": "Dorsal 2 | Titular | Lateral diestro con solidez defensiva y salida limpia",
        "crop_src": "scratch_cristo/02_APARICIO_GOMEZ_JAVIER.png",
        "filename": "02_JAVIER_APARICIO.png"
    },
    {
        "dorsal": 3,
        "nombre": "OCHIROSII, IULIAN RAZVAN",
        "apodo": "Razvan Ochirosii",
        "demarcacion": "Defensa Lateral",
        "caracteristicas": "Dorsal 3 | Titular | Lateral zurdo de gran experiencia, contundencia y golpeo a balón parado",
        "crop_src": "scratch_cristo/03_OCHIROSII_IULIAN_RAZVAN.png",
        "filename": "03_RAZVAN_OCHIROSII.png"
    },
    {
        "dorsal": 4,
        "nombre": "MARIANO PALMA, ANDERSON ALESSANDRO",
        "apodo": "Anderson Mariano",
        "demarcacion": "Defensa Central",
        "caracteristicas": "Dorsal 4 | Suplente / Convocado | Central potente, veloz en cobertura y buen juego aéreo",
        "crop_src": "scratch_cristo/04_MARIANO_PALMA_ANDERSON.png",
        "filename": "04_ANDERSON_MARIANO.png"
    },
    {
        "dorsal": 5,
        "nombre": "REVUELTA ORDUÑA, IVAN",
        "apodo": "Revuelta",
        "demarcacion": "Defensa Central",
        "caracteristicas": "Dorsal 5 | Suplente / Convocado | Central expeditivo y resolutivo en duelos individuales",
        "crop_src": "scratch_cristo/05_REVUELTA_ORDUNA_IVAN.png",
        "filename": "05_IVAN_REVUELTA.png"
    },
    {
        "dorsal": 6,
        "nombre": "OLMEDILLA MAESO, MANUEL",
        "apodo": "Olmedilla",
        "demarcacion": "Mediocentro",
        "caracteristicas": "Dorsal 6 | Suplente / Convocado | Pivote organizador, equilibrio táctico y buen pase",
        "crop_src": "scratch_cristo/06_OLMEDILLA_MAESO_MANUEL.png",
        "filename": "06_MANUEL_OLMEDILLA.png"
    },
    {
        "dorsal": 7,
        "nombre": "Felipe Peredo",
        "apodo": "Peredo",
        "demarcacion": "Extremo",
        "caracteristicas": "Dorsal 7 | Titular | Extremo desequilibrante, velocidad punta y llegada al área",
        "crop_src": "scratch_cristo/07_FELIPE_PEREDO.png",
        "filename": "07_FELIPE_PEREDO.png"
    },
    {
        "dorsal": 8,
        "nombre": "SÁNCHEZ MARTÍNEZ, ROBERTO",
        "apodo": "Roberto Sánchez",
        "demarcacion": "Interior",
        "caracteristicas": "Dorsal 8 | Titular | Interior de gran recorrido, despliegue físico y conexión entre líneas",
        "crop_src": "scratch_cristo/08_SANCHEZ_MARTINEZ_ROBERTO.png",
        "filename": "08_ROBERTO_SANCHEZ.png"
    },
    {
        "dorsal": 9,
        "nombre": "SANTAMARÍA DE LA FUENTE, IVAN",
        "apodo": "Santamaría",
        "demarcacion": "Delantero",
        "caracteristicas": "Dorsal 9 | Suplente / Convocado | Delantero centro de referencia, fijación de centrales y rematador",
        "crop_src": "scratch_cristo/09_SANTAMARIA_DE_LA_FUENTE_IVAN.png",
        "filename": "09_IVAN_SANTAMARIA.png"
    },
    {
        "dorsal": 10,
        "nombre": "VALLEJO PICON, RUBÉN",
        "apodo": "Vallejo",
        "demarcacion": "Mediapunta",
        "caracteristicas": "Dorsal 10 | Suplente / Convocado | Mediapunta creativo con visión entre líneas y último pase",
        "crop_src": "scratch_cristo/10_VALLEJO_PICON_RUBEN.png",
        "filename": "10_RUBEN_VALLEJO.png"
    },
    {
        "dorsal": 11,
        "nombre": "PRIETO PRESA, MIKEL",
        "apodo": "Mikel Prieto",
        "demarcacion": "Extremo",
        "caracteristicas": "Dorsal 11 | Titular | Extremo vertical, hábil en 1vs1 y centro preciso",
        "crop_src": "scratch_cristo/11_PRIETO_PRESA_MIKEL.png",
        "filename": "11_MIKEL_PRIETO.png"
    },
    {
        "dorsal": 12,
        "nombre": "ARENILLAS JIMENEZ, ALBERTO",
        "apodo": "Arenillas",
        "demarcacion": "Defensa Central",
        "caracteristicas": "Dorsal 12 | Plantilla | Central sobrio y disciplinado tácticamente",
        "crop_src": None,
        "filename": "12_ALBERTO_ARENILLAS.png"
    },
    {
        "dorsal": 13,
        "nombre": "ORTEGA RUBIO, DAVID",
        "apodo": "David Ortega",
        "demarcacion": "Portero",
        "caracteristicas": "Dorsal 13 | Suplente / Convocado | Guardameta con excelentes reflejos y colocación",
        "crop_src": "scratch_cristo/13_ORTEGA_RUBIO_DAVID.png",
        "filename": "13_DAVID_ORTEGA.png"
    },
    {
        "dorsal": 14,
        "nombre": "VILLARDON GARCIA, HUGO",
        "apodo": "Villardón",
        "demarcacion": "Defensa Lateral",
        "caracteristicas": "Dorsal 14 | Titular | Lateral con proyección ofensiva, intensidad y buen repliegue",
        "crop_src": "scratch_cristo/14_VILLARDON_GARCIA_HUGO.png",
        "filename": "14_HUGO_VILLARDON.png"
    },
    {
        "dorsal": 15,
        "nombre": "MORETA BORREGON, MARIO",
        "apodo": "Moreta",
        "demarcacion": "Mediocentro",
        "caracteristicas": "Dorsal 15 | Titular | Centrocampista dinámico, presión alta y apoyo en transiciones",
        "crop_src": "scratch_cristo/15_MORETA_BORREGON_MARIO.png",
        "filename": "15_MARIO_MORETA.png"
    },
    {
        "dorsal": 16,
        "nombre": "GARCIA MARTIN, GABRIEL",
        "apodo": "Gabri García",
        "demarcacion": "Interior",
        "caracteristicas": "Dorsal 16 | Suplente / Convocado | Centrocampista técnico con gran agilidad en espacios reducidos",
        "crop_src": "scratch_cristo/16_GARCIA_MARTIN_GABRIEL.png",
        "filename": "16_GABRIEL_GARCIA.png"
    },
    {
        "dorsal": 17,
        "nombre": "CITORES PAJARES, BRUNO",
        "apodo": "Citores",
        "demarcacion": "Delantero",
        "caracteristicas": "Dorsal 17 | Suplente / Convocado | Atacante incisivo con desmarque y velocidad",
        "crop_src": "scratch_cristo/17_CITORES_PAJARES_BRUNO.png",
        "filename": "17_BRUNO_CITORES.png"
    },
    {
        "dorsal": 18,
        "nombre": "GONZALEZ BERMEJO, ALVARO",
        "apodo": "Bermejo",
        "demarcacion": "Interior",
        "caracteristicas": "Dorsal 18 | Plantilla | Interior polivalente y generoso en el esfuerzo",
        "crop_src": None,
        "filename": "18_ALVARO_GONZALEZ.png"
    },
    {
        "dorsal": 19,
        "nombre": "ADRIAN",
        "apodo": "Adrián",
        "demarcacion": "Delantero",
        "caracteristicas": "Dorsal 19 | Titular | Delantero de movilidad, desmarques de ruptura y remate rápido",
        "crop_src": "scratch_cristo/19_ADRIAN.png",
        "filename": "19_ADRIAN.png"
    },
    {
        "dorsal": 20,
        "nombre": "SANCHEZ COLLANTES, JUAN",
        "apodo": "Juan Sánchez",
        "demarcacion": "Mediocentro",
        "caracteristicas": "Dorsal 20 | Titular | Centrocampista organizador, control de ritmo y distribución limpia",
        "crop_src": "scratch_cristo/20_SANCHEZ_COLLANTES_JUAN.png",
        "filename": "20_JUAN_SANCHEZ.png"
    },
    {
        "dorsal": 21,
        "nombre": "CLEMENTE LOPEZ, BRIAN",
        "apodo": "Clemente",
        "demarcacion": "Defensa Lateral",
        "caracteristicas": "Dorsal 21 | Suplente / Convocado | Lateral con contundencia en los duelos y buena pegada",
        "crop_src": "scratch_cristo/21_CLEMENTE_LOPEZ_BRIAN.png",
        "filename": "21_BRIAN_CLEMENTE.png"
    },
    {
        "dorsal": 22,
        "nombre": "HRECHANYI , MAKSYM",
        "apodo": "Maksym",
        "demarcacion": "Portero",
        "caracteristicas": "Dorsal 22 | Plantilla | Portero de gran envergadura y dominio del área",
        "crop_src": None,
        "filename": "22_MAKSYM_HRECHANYI.png"
    },
    {
        "dorsal": 23,
        "nombre": "COLLADO DIAZ, ANTONIO",
        "apodo": "Collado",
        "demarcacion": "Delantero",
        "caracteristicas": "Dorsal 23 | Titular | Atacante resolutivo en el área, potencia y buen remate",
        "crop_src": "scratch_cristo/23_COLLADO_DIAZ_ANTONIO.png",
        "filename": "23_ANTONIO_COLLADO.png"
    }
]

# Process and save all 23 player photos
for p in players_data:
    target_path = os.path.join(LOCAL_DIR, p["filename"])
    if p["crop_src"] and os.path.exists(p["crop_src"]):
        crop_img = Image.open(p["crop_src"]).convert("RGBA")
        avatar = Image.new("RGBA", (256, 256), (15, 23, 42, 255))
        w, h = crop_img.size
        scale = 256 / h
        new_w = int(w * scale)
        new_h = 256
        scaled = crop_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        offset_x = (256 - new_w) // 2
        avatar.paste(scaled, (offset_x, 0), scaled)
        avatar.save(target_path, "PNG")
    else:
        avatar = Image.new("RGBA", (256, 256), (109, 40, 217, 255))
        draw = ImageDraw.Draw(avatar)
        draw.ellipse([28, 28, 228, 228], fill=(30, 27, 75, 255), outline=(245, 158, 11, 255), width=6)
        draw.text((128, 128), str(p["dorsal"]), fill=(255, 255, 255, 255), anchor="mm")
        avatar.save(target_path, "PNG")
    print(f"Processed avatar: {p['filename']}")

# Upload to Supabase Storage
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

uploaded_players = []
encoded_bucket = urllib.parse.quote(BUCKET_NAME)

for p in players_data:
    local_file = os.path.join(LOCAL_DIR, p["filename"])
    storage_path = f"jugadores_equipo/{FOLDER_NAME}/{p['filename']}"
    
    with open(local_file, "rb") as f:
        file_bytes = f.read()
        
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{encoded_bucket}/{storage_path}"
    req = urllib.request.Request(upload_url, data=file_bytes, headers={**headers, "Content-Type": "image/png", "x-upsert": "true"}, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            pass
    except Exception as e:
        print(f"Upload warning for {p['filename']}: {e}")
        
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{encoded_bucket}/{storage_path}"
    p["foto_url"] = public_url

# Now update Database jugadores_equipo
# 1. Delete previous players for this team
del_url = f"{SUPABASE_URL}/rest/v1/jugadores_equipo?equipo_id=eq.{TEAM_ID}"
del_req = urllib.request.Request(del_url, headers=headers, method="DELETE")
try:
    with urllib.request.urlopen(del_req) as resp:
        print("Previous players cleared from database.")
except Exception as e:
    print("Delete error:", e)

# 2. Insert the 23 new players
records = []
for p in players_data:
    records.append({
        "equipo_id": TEAM_ID,
        "equipo_nombre": TEAM_NAME,
        "nombre": p["nombre"],
        "demarcacion": p["demarcacion"],
        "caracteristicas": p["caracteristicas"],
        "foto_url": p["foto_url"]
    })

insert_url = f"{SUPABASE_URL}/rest/v1/jugadores_equipo"
insert_data = json.dumps(records).encode("utf-8")
insert_req = urllib.request.Request(insert_url, data=insert_data, headers={**headers, "Content-Type": "application/json", "Prefer": "return=representation"}, method="POST")

try:
    with urllib.request.urlopen(insert_req) as resp:
        res_data = json.loads(resp.read().decode("utf-8"))
        print(f"Successfully inserted {len(res_data)} players in database!")
except Exception as e:
    print("Insert error:", e)

