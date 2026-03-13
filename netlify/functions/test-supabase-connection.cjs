// netlify/functions/test-supabase-connection.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        const errorMsg = 'As variáveis de ambiente do Supabase não foram encontradas.';
        console.error(errorMsg);
        return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Tenta buscar as conquistas definidas (um teste simples de leitura)
        const { data, error } = await supabase.from('achievements').select('*').limit(1);

        if (error) {
            console.error('Erro de conexão do Supabase:', error);
            throw error;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Conexão com o Supabase bem-sucedida!',
                data: data,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Falha ao conectar ou buscar dados no Supabase.', details: error.message }),
        };
    }
};