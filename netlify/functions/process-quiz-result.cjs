// netlify/functions/process-quiz-result.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    if (!supabaseUrl || !supabaseKey) {
        const errorMessage = 'Variáveis de ambiente do Supabase não encontradas.';
        return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    try {
        const { quizResult, userId } = JSON.parse(event.body);

        if (!quizResult || !userId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Dados do quiz ou ID do usuário ausentes.' }) };
        }
        
        // Objeto final para inserção, garantindo que a chave corresponde à coluna do DB.
        const { error: historyError } = await supabaseAdmin.from('quiz_history').insert({
            user_id: userId,
            subject: quizResult.subject,
            contest: quizResult.contest,
            score: quizResult.score,
            total_questions: quizResult.total_questions,
            time_spent_seconds: Math.round((quizResult.endTime - quizResult.startTime) / 1000),
            user_answers: quizResult.userAnswers 
        });

        if (historyError) {
            console.error('Erro do Supabase ao salvar histórico:', historyError);
            throw historyError;
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };

    } catch (error) {
        console.error('Erro na função process-quiz-result:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};