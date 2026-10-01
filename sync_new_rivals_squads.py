import os
import sys
import json
import re
import unicodedata
import urllib.request
from PIL import Image, ImageDraw, ImageFont

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Supabase configuration
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

    # Background gradient circle or rounded rect
    margin = 10
    draw.ellipse([margin, margin, size[0] - margin, size[1] - margin], fill=primary_color, outline=secondary_color, width=8)

    # Secondary inner accent
    inner_m = 24
    draw.ellipse([inner_m, inner_m, size[0] - inner_m, size[1] - inner_m], outline=(255, 255, 255, 120), width=3)

    # Draw stylish silhouette body/head
    head_center = (180, 130)
    head_radius = 50
    draw.ellipse([head_center[0] - head_radius, head_center[1] - head_radius, head_center[0] + head_radius, head_center[1] + head_radius], fill=(245, 245, 245, 230))

    # Shoulders / torso
    draw.chord([60, 190, 300, 390], 180, 360, fill=(245, 245, 245, 230))
    # Shirt collar
    draw.polygon([(150, 195), (180, 225), (210, 195)], fill=primary_color)

    # Jersey dorsal circle at bottom right
    d_center = (280, 275)
    d_radius = 42
    draw.ellipse([d_center[0] - d_radius, d_center[1] - d_radius, d_center[0] + d_radius, d_center[1] + d_radius], fill=secondary_color, outline=(255, 255, 255), width=4)

    # Try default font
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 38)
        font_med = ImageFont.truetype("arialbd.ttf", 22)
        font_small = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_med = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw dorsal number
    d_str = str(dorsal) if dorsal else "-"
    draw.text(d_center, d_str, fill=(255, 255, 255), font=font_large, anchor="mm")

    # Position badge at bottom left
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

    # Save
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
        print(f"Upload error {e.code} for {storage_path}: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Exception uploading {storage_path}: {e}")
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

# SQUADS DEFINITION
TEAMS_DATA = [
    {
        "team_id": "f05ccc83-7f62-4d08-b920-01871c8c8ac2",
        "team_name": "Atlético Astorga FC",
        "folder": "Atletico_Astorga",
        "primary_color": (22, 101, 52), # Forest Green
        "secondary_color": (234, 179, 8), # Gold / Yellow
        "players": [
            (1, "LLAMAZARES, PABLO", "Portero", "Dorsal 1 | Titular | Portero seguro bajo palos y mando aéreo"),
            (2, "MANSO, JAVIER", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho con recorrido y centros medidos"),
            (3, "MATALLANA, SERGIO", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo contundente en duelos 1vs1"),
            (4, "HERRERO, ALBERTO", "Defensa Central", "Dorsal 4 | Titular | Central expeditivo, fortaleza por alto"),
            (5, "CEBALLOS, VÍCTOR", "Defensa Central", "Dorsal 5 | Titular | Central líder defensivo y salida aseada"),
            (6, "QUINTANA, DAVID", "Mediocentro", "Dorsal 6 | Titular | Pivote defensivo, especialista en robos y equilibrio"),
            (7, "JIVI, JORGE", "Extremo", "Dorsal 7 | Titular | Extremo rápido, desborde por banda derecha"),
            (8, "CRESPO, CHRISTIAN", "Mediocentro", "Dorsal 8 | Titular | Mediocentro organizador, visión de juego"),
            (9, "AMOR, DIEGO", "Delantero", "Dorsal 9 | Titular | Delantero centro de área, remate de primeras"),
            (10, "PELÁEZ, ROBERTO", "Mediapunta", "Dorsal 10 | Titular | Mediapunta talentoso con gran golpeo a balón parado"),
            (11, "LORENZO, ADRIÁN", "Extremo", "Dorsal 11 | Titular | Extremo zurdo habilidoso y diagonales al área"),
            (13, "MARTÍN, SERGIO", "Portero", "Dorsal 13 | Suplente | Guardameta ágil de buenos reflejos"),
            (14, "ÁLVAREZ, MARIO", "Defensa Central", "Dorsal 14 | Suplente | Central corrector en transiciones rivales"),
            (15, "BLANCO, HUGO", "Interior", "Dorsal 15 | Suplente | Interior dinámico con llegada desde segunda línea"),
            (16, "FERNÁNDEZ, ALEX", "Mediocentro", "Dorsal 16 | Suplente | Centrocampista de despliegue físico"),
            (17, "SÁNCHEZ, DANIEL", "Extremo", "Dorsal 17 | Suplente | Extremo vertical revulsivo"),
            (18, "RODRÍGUEZ, PABLO", "Delantero", "Dorsal 18 | Suplente | Delantero de choque y presión alta"),
            (19, "VEGA, HÉCTOR", "Defensa Lateral", "Dorsal 19 | Suplente | Lateral polivalente que puede jugar a pie cambiado")
        ]
    },
    {
        "team_id": "3d2d1ec0-7cd1-4720-bce8-76e324c9d0ec",
        "team_name": "Atlético Tordesillas",
        "folder": "Atletico_Tordesillas",
        "primary_color": (185, 28, 28), # Red
        "secondary_color": (30, 41, 59), # Dark Slate
        "players": [
            (1, "FAROLO, ÁLVARO", "Portero", "Dorsal 1 | Titular | Portero seguro, gran comunicación defensiva"),
            (2, "VILLA, JOSÉ LUIS", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho con proyección ofensiva"),
            (3, "ABRAHAM, RODRÍGUEZ", "Defensa Lateral", "Dorsal 3 | Titular | Lateral izquierdo sólido en marcas"),
            (4, "COLINHA, ANDERSON", "Defensa Central", "Dorsal 4 | Titular | Central de poderío físico y anticipación"),
            (5, "CÓRDOBA, HÉCTOR", "Defensa Central", "Dorsal 5 | Titular | Central diestro con jerarquía en balón parado"),
            (6, "CONTE, FÉLIX", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de contención y coberturas"),
            (7, "CHATÚ, JESÚS", "Extremo", "Dorsal 7 | Titular | Extremo eléctrico y desequilibrante"),
            (8, "MIGUEL, FERRERAS", "Interior", "Dorsal 8 | Titular | Interior con buena conducción y último pase"),
            (9, "TORRES, SAMUEL", "Delantero", "Dorsal 9 | Titular | Referencia ofensiva, descarga de espaldas"),
            (10, "UNAI, BLANCO", "Mediapunta", "Dorsal 10 | Titular | Mediapunta con gran golpeo de media distancia"),
            (11, "CAMILO, DÍAZ", "Extremo", "Dorsal 11 | Titular | Extremo rápido de centros precisos"),
            (13, "ROBERTO, LÓPEZ", "Portero", "Dorsal 13 | Suplente | Portero suplente solvente"),
            (14, "HERRERO, VÍCTOR", "Defensa Central", "Dorsal 14 | Suplente | Central zurdo con buen pase largo"),
            (15, "CANO, JAVIER", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista equilibrado"),
            (16, "GUTIÉRREZ, DANIEL", "Interior", "Dorsal 16 | Suplente | Interior con trabajo defensivo"),
            (17, "REVILLA, MARCOS", "Extremo", "Dorsal 17 | Suplente | Extremo con regate en espacios cortos"),
            (18, "AYLLÓN, DANIEL", "Delantero", "Dorsal 18 | Suplente | Delantero de zancada y velocidad")
        ]
    },
    {
        "team_id": "0d209155-3149-427b-90f2-db84b2feedc7",
        "team_name": "C.D. Palencia Cristo Atlético",
        "folder": "Palencia_Cristo_Atletico",
        "primary_color": (109, 40, 217), # Purple
        "secondary_color": (245, 158, 11), # Amber
        "players": [
            (1, "GUILLERMO, GARCÍA", "Portero", "Dorsal 1 | Titular | Portero con gran juego de pies"),
            (2, "ADRIÁN, PÉREZ", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro con despliegue físico"),
            (3, "SELLÉS, JORGE", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de largo recorrido"),
            (4, "YAGO, GONZÁLEZ", "Defensa Central", "Dorsal 4 | Titular | Central sobrio y resolutivo"),
            (5, "HEVIA, JAVIER", "Defensa Central", "Dorsal 5 | Titular | Central con gran salto e inicio de juego"),
            (6, "DIEGO, MENA", "Mediocentro", "Dorsal 6 | Titular | Pivote organizador, pase filtrado"),
            (7, "ADEVA, ÁLVARO", "Delantero", "Dorsal 7 | Titular | Atacante potente y rematador"),
            (8, "RUBÉN, SÁNCHEZ", "Interior", "Dorsal 8 | Titular | Interior llegador con gol"),
            (9, "HUGO, DE BUSTOS", "Delantero", "Dorsal 9 | Titular | Delantero rápido al espacio"),
            (10, "JAVI, BUENO", "Mediapunta", "Dorsal 10 | Titular | Director de juego con gran técnica"),
            (11, "DAVID, MARTÍNEZ", "Extremo", "Dorsal 11 | Titular | Extremo zurdo de 1vs1 constante"),
            (13, "ALEJANDRO, RIVAS", "Portero", "Dorsal 13 | Suplente | Guardameta de reflejos bajo palos"),
            (14, "DÍEZ, SERGIO", "Defensa Central", "Dorsal 14 | Suplente | Central contundente"),
            (15, "ISMAEL, CALVO", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista recuperador"),
            (16, "VÍCTOR, MORENO", "Extremo", "Dorsal 16 | Suplente | Extremo veloz en contragolpe"),
            (17, "FABIO, CONDE", "Delantero", "Dorsal 17 | Suplente | Delantero oportunista en área")
        ]
    },
    {
        "team_id": "b053b68b-066f-4318-8400-d08617d3dc3c",
        "team_name": "Palencia C.F. S.A.D.",
        "folder": "Palencia_CF_SAD",
        "primary_color": (88, 28, 135), # Deep Purple
        "secondary_color": (15, 23, 42), # Black / Slate
        "players": [
            (1, "TONI, CASANOVA", "Portero", "Dorsal 1 | Titular | Portero seguro, veterano y líder"),
            (2, "ASTRAY, PABLO", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho con buena pegada"),
            (3, "CARITG, JORDI", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo muy disciplinado"),
            (4, "IGLESIAS, MARCOS", "Defensa Central", "Dorsal 4 | Titular | Central fuerte en el choque"),
            (5, "BAJO, ÁNGEL", "Defensa Central", "Dorsal 5 | Titular | Central contundente en el juego aéreo"),
            (6, "CAPI, RUBÉN", "Mediocentro", "Dorsal 6 | Titular | Pivote de balance defensivo"),
            (7, "EDIPO, RODRÍGUEZ", "Extremo", "Dorsal 7 | Titular | Extremo internacional de gran velocidad"),
            (8, "CHOMBO, JESÚS", "Interior", "Dorsal 8 | Titular | Centrocampista con llegada y dinámica"),
            (9, "GIANLUCA, SIMEONE", "Delantero", "Dorsal 9 | Titular | Delantero de máxima intensidad y definición"),
            (10, "VALLEJO, DIEGO", "Mediapunta", "Dorsal 10 | Titular | Mediapunta creativo con visión entre líneas"),
            (11, "JESÚS, TORRES", "Extremo", "Dorsal 11 | Titular | Extremo incisivo en banda izquierda"),
            (13, "MAXI, VELÁZQUEZ", "Portero", "Dorsal 13 | Suplente | Guardameta de buena estatura"),
            (14, "MORA, CARLOS", "Defensa Central", "Dorsal 14 | Suplente | Central marcador"),
            (15, "SITO, CASTRO", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista de distribución"),
            (16, "MIGUEL, ÁNGEL", "Extremo", "Dorsal 16 | Suplente | Banda zurda ágil"),
            (17, "KAUAN, SILVA", "Delantero", "Dorsal 17 | Suplente | Delantero brasileño potente")
        ]
    },
    {
        "team_id": "6f2f2dd5-4292-4a43-9986-95ace73fba02",
        "team_name": "C.D. Becerril",
        "folder": "CD_Becerril",
        "primary_color": (30, 58, 138), # Navy Blue
        "secondary_color": (220, 38, 38), # Red
        "players": [
            (1, "SEVILLANO, ÁNGEL", "Portero", "Dorsal 1 | Titular | Portero héroe local, reflejos felinos"),
            (2, "DIEGO, MARTÍN", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro con garra y entrega"),
            (3, "RICARDO, BLANCO", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de contención"),
            (4, "DIÉGUEZ, VÍCTOR", "Defensa Central", "Dorsal 4 | Titular | Central expeditivo, fortaleza en balones largos"),
            (5, "MERINO, CARLOS", "Defensa Central", "Dorsal 5 | Titular | Capitán y baluarte en el juego aéreo"),
            (6, "CARLOS, FERNÁNDEZ", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de esfuerzo y recuperaciones"),
            (7, "KIKÍN, ENRIQUE", "Extremo", "Dorsal 7 | Titular | Extremo veloz en transiciones rápidas"),
            (8, "BLANCO, VÍCTOR", "Interior", "Dorsal 8 | Titular | Interior con buen golpeo y llegada"),
            (9, "MIKEL, PRIETO", "Delantero", "Dorsal 9 | Titular | Goleador de referencia, remate de cabeza"),
            (10, "ROCHÉ, DAVID", "Mediapunta", "Dorsal 10 | Titular | Calidad técnica y lanzador a balón parado"),
            (11, "PELAYO, GARCÍA", "Extremo", "Dorsal 11 | Titular | Extremo trabajador de ida y vuelta"),
            (13, "MIGUEL, ÁNGEL", "Portero", "Dorsal 13 | Suplente | Guardameta suplente seguro"),
            (14, "NACHO, HERRERO", "Defensa Central", "Dorsal 14 | Suplente | Central suplente fiable"),
            (15, "SANTOS, JORGE", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista de corte defensivo"),
            (16, "TOMÁS, FRAILE", "Delantero", "Dorsal 16 | Suplente | Delantero revulsivo")
        ]
    },
    {
        "team_id": "014cd0d6-594a-4cef-bb25-53d295edb7f7",
        "team_name": "Atlético Bembibre",
        "folder": "Atletico_Bembibre",
        "primary_color": (194, 65, 12), # Orange / Red
        "secondary_color": (30, 41, 59), # Dark Slate
        "players": [
            (1, "IVANILDO, RODRIGUES", "Portero", "Dorsal 1 | Titular | Guardameta con amplia trayectoria"),
            (2, "ALEX, CONTRERAS", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho sobrio y rápido"),
            (3, "LUCHO, VEGA", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo ofensivo"),
            (4, "FANDIÑO, ALBERTO", "Defensa Central", "Dorsal 4 | Titular | Central expeditivo en duelos terrestres"),
            (5, "IGOR, CEBRIÁN", "Defensa Central", "Dorsal 5 | Titular | Central líder en balones aéreos"),
            (6, "WILLY, GUILLERMO", "Mediocentro", "Dorsal 6 | Titular | Pivote de control y primer pase"),
            (7, "GIOVANNI, SEVILLANO", "Extremo", "Dorsal 7 | Titular | Extremo hábil de regate desbordante"),
            (8, "DEL VALLE, CHRISTIAN", "Interior", "Dorsal 8 | Titular | Centrocampista polivalente"),
            (9, "JAIME, DE CASTRO", "Delantero", "Dorsal 9 | Titular | Delantero de desmarques de ruptura"),
            (10, "SANTI, FLÓREZ", "Mediapunta", "Dorsal 10 | Titular | Pasador de calidad suprema"),
            (11, "GABRIEL, PÉREZ", "Extremo", "Dorsal 11 | Titular | Extremo rápido por banda zurda"),
            (13, "HUGO, CRESPO", "Portero", "Dorsal 13 | Suplente | Portero ágil en estiradas"),
            (14, "SEBAS, MARTÍNEZ", "Defensa Central", "Dorsal 14 | Suplente | Central corrector"),
            (15, "ÁLVARO, ÁLVAREZ", "Mediocentro", "Dorsal 15 | Suplente | Mediocentro de contención"),
            (16, "OSCAR, CRESPO", "Delantero", "Dorsal 16 | Suplente | Delantero oportunista")
        ]
    },
    {
        "team_id": "0811b466-d4e4-4abe-bad3-cda4b99579b7",
        "team_name": "Júpiter Leonés",
        "folder": "Jupiter_Leones",
        "primary_color": (220, 38, 38), # Red
        "secondary_color": (255, 255, 255), # White
        "players": [
            (1, "DIEGO, RODRÍGUEZ", "Portero", "Dorsal 1 | Titular | Filial Cultural Leonesa, reflejos y estirada"),
            (2, "KIRIAN, RAMOS", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho muy veloz"),
            (3, "GARCÍA, SAMUEL", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de profundidad"),
            (4, "RODRÍGUEZ, DAVID", "Defensa Central", "Dorsal 4 | Titular | Central técnico con salida limpia"),
            (5, "BLAS, MARCOS", "Defensa Central", "Dorsal 5 | Titular | Central de poderío físico"),
            (6, "FERRERAS, MIGUEL", "Mediocentro", "Dorsal 6 | Titular | Mediocentro creativo del filial"),
            (7, "VALLECILLO, ÁNGEL", "Extremo", "Dorsal 7 | Titular | Extremo con velocidad punta endiablada"),
            (8, "ÁLVAREZ, DARÍO", "Interior", "Dorsal 8 | Titular | Interior de dinamismo y toque"),
            (9, "GEORGES, NTOUTOUMOU", "Delantero", "Dorsal 9 | Titular | Delantero internacional sub-23, potencia pura"),
            (10, "GUZMÁN, CARLOS", "Mediapunta", "Dorsal 10 | Titular | El '10' del equipo, visión y regate"),
            (11, "FERNÁNDEZ, HUGO", "Extremo", "Dorsal 11 | Titular | Extremo asociativo y con gol"),
            (13, "HOLGADO, SERGIO", "Portero", "Dorsal 13 | Suplente | Portero de gran proyección"),
            (14, "GUTIÉRREZ, LUCAS", "Defensa Central", "Dorsal 14 | Suplente | Central seguro"),
            (15, "MORENO, HUGO", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista táctico"),
            (16, "PABLO, DÍAZ", "Delantero", "Dorsal 16 | Suplente | Delantero rematador")
        ]
    },
    {
        "team_id": "f64fc679-863d-4069-8688-54a5929e2e37",
        "team_name": "Ciudad Rodrigo C.F.",
        "folder": "Ciudad_Rodrigo_CF",
        "primary_color": (30, 41, 59), # Black / Slate
        "secondary_color": (255, 255, 255), # White
        "players": [
            (1, "PEPI, DAVID", "Portero", "Dorsal 1 | Titular | Portero emblemático en Francisco Mateos"),
            (2, "ADRIÁN, MORIÑIGO", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro con veteranía y orden"),
            (3, "ZAZO, MARCOS", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo batallador"),
            (4, "ROBER, PÉREZ", "Defensa Central", "Dorsal 4 | Titular | Central mariscal en balones divididos"),
            (5, "MAMBO, CARLOS", "Defensa Central", "Dorsal 5 | Titular | Central fuerte y seguro al corte"),
            (6, "JORGE, GARCÍA", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de equilibrio táctico"),
            (7, "ALBERTO, GARCÍA", "Extremo", "Dorsal 7 | Titular | Extremo rápido con centros al segundo palo"),
            (8, "SERGI, GONZÁLEZ", "Interior", "Dorsal 8 | Titular | Interior con pegada y sacrificio"),
            (9, "BELDA, CARLOS", "Delantero", "Dorsal 9 | Titular | Delantero referencia y máximo goleador"),
            (10, "JANI, MANUEL", "Mediapunta", "Dorsal 10 | Titular | Mediapunta mágico con el balón en pies"),
            (11, "MURIEL, DAVID", "Extremo", "Dorsal 11 | Titular | Extremo con descaro y verticalidad"),
            (13, "RODRÍGUEZ, DANIEL", "Portero", "Dorsal 13 | Suplente | Portero de garantías"),
            (14, "CRESPO, LUIS", "Defensa Central", "Dorsal 14 | Suplente | Central suplente contundente"),
            (15, "MEDINA, PABLO", "Mediocentro", "Dorsal 15 | Suplente | Mediocentro defensivo"),
            (16, "SÁNCHEZ, MARIO", "Delantero", "Dorsal 16 | Suplente | Delantero joven e impetuoso")
        ]
    },
    {
        "team_id": "888ef303-ee67-4af3-8c6c-826c56cf24ef",
        "team_name": "C.D. Colegios Diocesanos",
        "folder": "Colegios_Diocesanos",
        "primary_color": (234, 179, 8), # Yellow
        "secondary_color": (29, 78, 216), # Blue
        "players": [
            (1, "MARIO, VELAYOS", "Portero", "Dorsal 1 | Titular | Portero abulense de gran agilidad"),
            (2, "NACHO, SÁNCHEZ", "Defensa Lateral", "Dorsal 2 | Titular | Lateral diestro con subidas continuas"),
            (3, "JOSUÉ, BLANCO", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de pierna fuerte"),
            (4, "HÉCTOR, POSE", "Defensa Central", "Dorsal 4 | Titular | Central corrector y atento"),
            (5, "CHRIS, MONTERO", "Defensa Central", "Dorsal 5 | Titular | Central fuerte por arriba en córners"),
            (6, "FERNANDO, BLÁZQUEZ", "Mediocentro", "Dorsal 6 | Titular | Mediocentro ancla del equipo"),
            (7, "PABLO, NEGRO", "Extremo", "Dorsal 7 | Titular | Extremo con regate y desborde"),
            (8, "ANGEL, ENCINAR", "Interior", "Dorsal 8 | Titular | Interior con buena lectura de juego"),
            (9, "MAYORGA, PABLO", "Delantero", "Dorsal 9 | Titular | Delantero de área y presión incansable"),
            (10, "MINI, DAVID", "Mediapunta", "Dorsal 10 | Titular | El cerebro del ataque colegial"),
            (11, "CAMILO, JORGE", "Extremo", "Dorsal 11 | Titular | Extremo incisivo por banda izquierda"),
            (13, "GARCÍA, DARÍO", "Portero", "Dorsal 13 | Suplente | Guardameta joven y elástico"),
            (14, "GÓMEZ, DANIEL", "Defensa Central", "Dorsal 14 | Suplente | Central suplente de garantías"),
            (15, "RODRÍGUEZ, SERGIO", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista de contención"),
            (16, "VICENTE, ÁLVARO", "Delantero", "Dorsal 16 | Suplente | Delantero suplente veloz")
        ]
    },
    {
        "team_id": "88f93804-cb96-40ae-9895-d8c1309a130f",
        "team_name": "Salamanca UDS",
        "folder": "Salamanca_UDS_Primer_Equipo",
        "primary_color": (15, 23, 42), # Black / White
        "secondary_color": (255, 255, 255), # White
        "players": [
            (1, "JON, VILLANUEVA", "Portero", "Dorsal 1 | Titular | Portero de gran envergadura y liderazgo en el Helmántico"),
            (2, "MURIEL, MIGUEL", "Defensa Lateral", "Dorsal 2 | Titular | Lateral derecho con gran recorrido y centros"),
            (3, "SOULEY, GASSAMA", "Defensa Lateral", "Dorsal 3 | Titular | Lateral zurdo de enorme potencia física"),
            (4, "MANSOUROU, AMADOU", "Defensa Central", "Dorsal 4 | Titular | Central de poderío físico y anticipación"),
            (5, "CASADO, CASADO", "Defensa Central", "Dorsal 5 | Titular | Central mariscal y organizador de la zaga"),
            (6, "CRISTETO, DIEGO", "Mediocentro", "Dorsal 6 | Titular | Mediocentro de tremenda calidad y pase largo"),
            (7, "ALVARITO, ÁLVAREZ", "Extremo", "Dorsal 7 | Titular | Extremo zurdo eléctrico de 1vs1 demoledor"),
            (8, "AMARO, ANTONIO", "Interior", "Dorsal 8 | Titular | Capitán eterno, corazón y despliegue del centro del campo"),
            (9, "FASSANI, MARTÍN", "Delantero", "Dorsal 9 | Titular | Delantero uruguayo matador en el área de cabeza y remate"),
            (10, "JUGAR, JAVI", "Mediapunta", "Dorsal 10 | Titular | Mediapunta exquisito con último pase milimétrico"),
            (11, "CARAMELO, JESÚS", "Extremo", "Dorsal 11 | Titular | Extremo rápido y con disparo con rosca"),
            (13, "LEO, SANTOS", "Portero", "Dorsal 13 | Suplente | Portero de grandes reflejos"),
            (14, "PABLO, ESPINA", "Mediapunta", "Dorsal 14 | Suplente | Jugador contrastado con gol y talento"),
            (15, "TREJO, MARTÍN", "Mediocentro", "Dorsal 15 | Suplente | Centrocampista de equilibrio táctico"),
            (16, "MAIKEL, MESA", "Delantero", "Dorsal 16 | Suplente | Delantero revulsivo al contragolpe"),
            (17, "GALVÁN, IKER", "Extremo", "Dorsal 17 | Suplente | Extremo con regate directo"),
            (18, "GUSTAVO, HERNÁNDEZ", "Defensa Central", "Dorsal 18 | Suplente | Central contundente")
        ]
    }
]

def main():
    print("========================================================================")
    print("SINCRONIZANDO NUEVAS PLANTILLAS Y FOTOS DE EQUIPOS RIVALES EN SUPABASE")
    print("========================================================================\n")

    temp_dir = os.path.join(os.getcwd(), "scratch_avatars")
    os.makedirs(temp_dir, exist_ok=True)

    total_inserted = 0

    for team in TEAMS_DATA:
        team_id = team["team_id"]
        team_name = team["team_name"]
        folder = team["folder"]
        prim_col = team["primary_color"]
        sec_col = team["secondary_color"]
        players = team["players"]

        print(f"\n--- Procesando: {team_name} ({len(players)} jugadores) ---")

        # 1. Clean existing players for this team to avoid duplicates if re-running
        try:
            del_url = f"{SUPABASE_URL}/rest/v1/jugadores_equipo?equipo_id=eq.{team_id}"
            req_del = urllib.request.Request(del_url, method='DELETE', headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            })
            with urllib.request.urlopen(req_del) as d_resp:
                pass
        except Exception as e:
            print(f"Nota limpieza: {e}")

        for dorsal, name, pos, carac in players:
            dorsal_str = f"{dorsal:02d}" if dorsal else "00"
            clean_name = slugify(name)
            filename = f"{dorsal_str}_{clean_name}.png"
            local_path = os.path.join(temp_dir, folder, filename)
            storage_path = f"jugadores_equipo/{folder}/{filename}"

            # Create avatar
            create_player_avatar(dorsal, name, pos, team_name, prim_col, sec_col, local_path)

            # Upload to Supabase Storage
            uploaded = upload_file_to_supabase(local_path, storage_path)
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/FOTOS%20JUGADORES/{storage_path}"

            # Insert to DB
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
                print(f"  ✓ [{dorsal_str}] {name} ({pos}) -> BD & Storage OK")
            else:
                print(f"  ✗ Error insertando a {name}")

    print(f"\n========================================================================")
    print(f"¡PROCESO COMPLETADO! Se sincronizaron {total_inserted} jugadores en total.")
    print(f"========================================================================")

if __name__ == "__main__":
    main()
