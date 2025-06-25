// netlify/functions/getExplanation.js

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nenhum prompt foi fornecido.' }) };
    }
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Chave de API não configurada.' }) };
    }

    // --- CORREÇÃO FINAL USANDO O MODELO DA SUA LISTA ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Erro da API do Google:", errorBody);
        throw new Error(`A API do Google respondeu com o status: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
        console.error("Resposta inesperada da API:", result);
        throw new Error("A API não retornou candidatos na resposta.");
    }

    const text = result.candidates[0]?.content?.parts[0]?.text || "Não foi possível obter uma explicação da IA.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explanation: text }),
    };

  } catch (error) {
    console.error('Erro na função serverless:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};