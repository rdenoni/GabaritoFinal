// netlify/functions/createTrialLeadAndLink.js

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    const { name, email, phone } = JSON.parse(event.body);

    if (!name || !email) { // Telefone é opcional, mas nome e email são obrigatórios
        return { statusCode: 400, body: 'Nome e email são obrigatórios.' };
    }

    try {
        // 1. Verificar se o email já existe na tabela auth.users (para evitar duplicidade)
        const { data: { users }, error: fetchUserError } = await supabase.auth.admin.listUsers({
            email: email,
        });

        if (fetchUserError) throw fetchUserError;

        if (users.length > 0) {
            // Se o usuário já existe, tente logá-lo via magic link.
            // Não queremos criar um novo registro se ele já tem conta.
            // Apenas reenviaremos o magic link para ele acessar o trial novamente.
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${process.env.SITE_URL}/quiz-page`, // Redireciona para o quiz de teste
                    data: {
                        is_trial_user: true, // Garante que a flag de trial seja setada/mantida
                    }
                },
            });
            if (signInError) throw signInError;

            // Já que o usuário existe, vamos garantir que o perfil dele esteja atualizado como trial
            const existingUserId = users[0].id;
            await supabase.from('profiles').upsert({
                id: existingUserId,
                is_trial_user: true,
                trial_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });

            return { statusCode: 200, body: JSON.stringify({ message: 'Você já possui um cadastro. Um novo link de acesso ao teste foi enviado para seu e-mail!' }) };
        }
        
        // 2. Registrar o lead na nova tabela trial_leads
        const { data: leadData, error: leadError } = await supabase
            .from('trial_leads')
            .upsert({ name, email, phone }, { onConflict: 'email' }) // onConflict para atualizar se o email já existir como lead
            .select();

        if (leadError) throw leadError;
        console.log('Lead salvo em trial_leads:', leadData);

        // 3. Criar (ou obter) o usuário no Supabase Auth e iniciar o fluxo passwordless
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${process.env.SITE_URL}/quiz-page`, // Redireciona para o quiz de teste
                data: {
                    full_name: name,
                    phone: phone,
                    is_trial_user: true, // Marca como usuário de teste
                    trial_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira em 24h
                },
            },
        });

        if (authError) throw authError;

        // 4. (Opcional) Enviar um e-mail de boas-vindas com o link direto para o quiz trial
        const quizTrialUrl = authData.session?.url || `${process.env.SITE_URL}/quiz-page`; // Preferir a URL do magic link se disponível
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Seu Acesso de Teste Gratuito ao Gabarito Final!',
            html: `
                <p>Olá ${name},</p>
                <p>Seja bem-vindo(a) ao Gabarito Final! 🎉</p>
                <p>Seu acesso de teste gratuito de 24 horas foi ativado. Clique no link abaixo para começar a praticar 10 questões exclusivas:</p>
                <p><a href="${quizTrialUrl}">${quizTrialUrl}</a></p>
                <p>Este teste estará disponível por 24 horas. Aproveite para conhecer a plataforma!</p>
                <p>Bons estudos!</p>
                <p>Atenciosamente,</p>
                <p>Equipe Gabarito Final</p>
                <p><small>Este é um e-mail automático, por favor, não responda.</small></p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail de teste enviado com sucesso para:', email);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Seu link de acesso ao teste gratuito foi enviado para o seu e-mail!' }),
        };

    } catch (error) {
        console.error('Erro na Netlify Function createTrialLeadAndLink:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message || 'Erro interno do servidor ao configurar o teste.' }),
        };
    }
};