import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Inicializar el SDK de Gemini. Toma automáticamente GEMINI_API_KEY del entorno
const ai = new GoogleGenAI({});

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
