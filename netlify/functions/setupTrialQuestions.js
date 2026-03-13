// netlify/functions/setupTrialQuestions.js
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer'); // Para enviar e-mail de boas-vindas, se desejar

// Inicializa o Supabase com a chave de service_role
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Chave de service_role
);

// Configura o Nodemailer para enviar e-mail de boas-vindas (opcional, mas recomendado)
const transporter = nodemailer.createTransport({
    host: process.env.MIGADU_SMTP_HOST, 
    port: parseInt(process.env.MIGADU_SMTP_PORT),
    secure: process.env.MIGADU_SMTP_PORT === '465', 
    auth: {
        user: process.env.MIGADU_SMTP_USER,
        pass: process.env.MIGADU_SMTP_PASS
    }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método Não Permitido' };
    }

    const { userId, email, name } = JSON.parse(event.body);

    if (!userId || !email || !name) {
        return { statusCode: 400, body: 'Dados insuficientes fornecidos.' };
    }

    try {
        // 1. Selecionar 10 questões de uma matéria aleatória para o trial
        const { data: allSubjectsData, error: subjectsError } = await supabase
            .from('questions')
            .select('subject')
            .limit(1000)
            .neq('subject', null);

        if (subjectsError) throw subjectsError;

        const uniqueSubjects = [...new Set(allSubjectsData.map(q => q.subject))];
        if (uniqueSubjects.length === 0) {
            throw new Error('Nenhuma matéria encontrada para o teste.');
        }

        const randomSubject = uniqueSubjects[Math.floor(Math.random() * uniqueSubjects.length)];

        const { data: trialQuestionsData, error: questionsError } = await supabase
            .from('questions')
            .select('id')
            .eq('subject', randomSubject)
            .limit(10);

        if (questionsError) throw questionsError;

        const trialQuestionIds = trialQuestionsData.map(q => q.id);

        // 2. Atualizar o perfil do usuário no Supabase com os dados do trial
        const { error: updateError } = await supabase.from('profiles').upsert({
            id: userId,
            username: name,
            is_trial_user: true,
            // A expiração do trial pode ser definida aqui ou na confirmação de e-mail (via webhook/trigger)
            trial_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira em 24h
            trial_subject: randomSubject,
            trial_question_ids: trialQuestionIds,
        });

        if (updateError) throw updateError;

        // 3. (Opcional) Enviar um e-mail de boas-vindas com o link direto para o quiz trial
        // O link de acesso direto ao quiz-trial (já logado via magic link ou senha)
        const quizTrialUrl = `${process.env.SITE_URL}/quiz-page`; // Ou /quiz-trial se você quiser uma rota específica para isso no frontend
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Bem-vindo ao seu Teste Gratuito do Gabarito Final!',
            html: `
                <p>Olá ${name},</p>
                <p>Sua conta de teste gratuito no Gabarito Final foi criada com sucesso! 🎉</p>
                <p>Para começar seu teste com 10 questões exclusivas, clique no link abaixo:</p>
                <p><a href="${quizTrialUrl}">${quizTrialUrl}</a></p>
                <p>Este teste estará disponível por 24 horas. Aproveite para conhecer a plataforma!</p>
                <p>Bons estudos!</p>
                <p>Atenciosamente,</p>
                <p>Equipe Gabarito Final</p>
                <p><small>Este é um e-mail automático, por favor, não responda.</small></p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail de boas-vindas de teste enviado com sucesso para:', email);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Configuração de trial concluída e e-mail enviado!' }),
        };

    } catch (error) {
        console.error('Erro na Netlify Function setupTrialQuestions:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message || 'Erro interno do servidor ao configurar o teste.' }),
        };
    }
};