// netlify/functions/listMyModels.js

exports.handler = async function () {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'A chave de API do Google não está configurada no servidor.' }),
    };
  }

  // URL para LISTAR os modelos disponíveis
  const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

  try {
    const response = await fetch(listModelsUrl); // É uma requisição GET, não precisa de mais nada

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Erro ao listar modelos:", errorBody);
      throw new Error(`A API do Google respondeu com o status: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    // Retorna a lista de modelos que a API enviou
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Erro na função de diagnóstico:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};