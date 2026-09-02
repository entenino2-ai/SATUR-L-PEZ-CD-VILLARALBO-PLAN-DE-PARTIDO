import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formacionLocal, formacionRival, caracteristicasRival, tipo } = body;

    if (!formacionLocal || !formacionRival) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: formacionLocal o formacionRival' },
        { status: 400 }
      );
    }

    // Si no hay API key, devolvemos un texto de prueba exhaustivo para que el usuario pueda ver la interfaz
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        analysis: `⚠️ **Aviso: Análisis en modo Demostración (Falta GEMINI_API_KEY)**
*Para generar análisis dinámicos según cada formación, debes añadir tu clave API de Google Gemini en el archivo .env.local*

---

### Análisis de Enfrentamiento: ${formacionLocal} vs ${formacionRival}

Como analista táctico, este es el desglose del emparejamiento de sistemas, asumiendo un choque de estilos estándar:

### Puntos fuertes
- **Superioridad en el mediocampo:** Al jugar con un pivote y dos interiores, tenemos facilidad para generar triángulos de pase en el carril central y superar su primera línea de presión.
- **Amplitud garantizada:** Nuestros extremos fijan a sus laterales, lo que permite que nuestros laterales tengan el carril libre para incorporarse al ataque desde segunda línea.
- **Presión tras pérdida:** Al tener las líneas juntas y ocupar racionalmente los carriles interiores, podemos asfixiar la salida de balón del rival nada más perder la posesión.

### Puntos débiles
- **Riesgo en transiciones defensivas:** Si nuestros laterales suben simultáneamente, los centrales quedan expuestos a situaciones de 2vs2 o 1vs1 si el rival lanza contraataques rápidos por banda.
- **Inferioridad numérica en banda:** Si el rival dobla laterales y extremos por fuera, nuestros extremos tendrán que hacer un gran esfuerzo en el repliegue, lo que mermará su frescura en ataque.
- **Espacio a la espalda del pivote:** Si la presión no es coordinada, el mediapunta rival puede recibir a la espalda de nuestro mediocentro defensivo.

### Espacios a explotar
- **Los intervalos (Half-spaces):** Los pasillos interiores entre el central y el lateral rival son la zona ideal para que nuestros interiores reciban el balón perfilados hacia la portería.
- **La espalda de la defensa:** Si el rival adelanta su línea para presionarnos, los balones largos a la ruptura de nuestros extremos o delantero centro pueden ser letales.
- **Zonas de finalización (Punto de penalti):** Los centros laterales con llegada de segunda línea (interiores) al área generarán confusión en los marcajes del rival.

### Recomendación táctica
1. **Salida de balón:** Iniciar con línea de 3 (pivote incrustado entre centrales) para atraer la presión y liberar a los interiores a la espalda de su línea de medios.
2. **Fase Defensiva:** Mantener un bloque medio compacto (4-1-4-1 en repliegue), priorizando cerrar pases interiores y obligando al rival a jugar por fuera, donde utilizaremos la línea de banda como un defensor más.
3. **Instrucción a Extremos:** Recibir abiertos pegados a la cal para ensanchar el campo, pero realizar diagonales hacia dentro sin balón cuando el lateral de su banda tenga la posesión.

*(Este es un informe plantilla de nivel UEFA Pro. Añade tu API Key para que la IA genere uno único y adaptado a cada combinación de formaciones exacta).*`
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let systemInstruction = `Eres un analista táctico de fútbol profesional de nivel UEFA Pro. Analiza el enfrentamiento entre CD VILLARALBO (${formacionLocal}) y el Rival (${formacionRival}) considerando las características del rival: ${caracteristicasRival || 'No especificadas'}. Proporciona: 
1. Dónde se generan las superioridades numéricas.
2. Riesgos defensivos.
3. Instrucciones clave para los mediocentros y extremos.
Responde de forma concisa y directa en formato Markdown estructurado.`;

    if (tipo === 'enfrentamiento') {
      systemInstruction = `Eres un analista táctico de fútbol profesional de nivel UEFA Pro. Analiza el enfrentamiento táctico puramente posicional entre la formación de nuestro equipo CD VILLARALBO (${formacionLocal}) y la formación del equipo Rival (${formacionRival}).
Debes proporcionar tu análisis estructurado estrictamente con los siguientes encabezados (en formato Markdown):

### Puntos fuertes
(Tus observaciones aquí)

### Puntos débiles
(Tus observaciones aquí)

### Espacios a explotar
(Tus observaciones aquí)

### Recomendación táctica
(Tus observaciones aquí)

Responde de forma concisa, directa y profesional.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemInstruction,
    });

    return NextResponse.json({
      analysis: response.text,
    });
  } catch (error: any) {
    console.error('Error in tactical-analysis API:', error);
    return NextResponse.json(
      { error: 'Error al generar el análisis táctico', details: error.message },
      { status: 500 }
    );
  }
}
