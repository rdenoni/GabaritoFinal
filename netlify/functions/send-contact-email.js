import nodemailer from 'nodemailer';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido.' }),
    };
  }

  const {
    MIGADU_SMTP_USER,
    MIGADU_SMTP_PASS,
    MIGADU_SMTP_HOST,
    EMAIL_FROM,
  } = process.env;

  if (!MIGADU_SMTP_USER || !MIGADU_SMTP_PASS || !MIGADU_SMTP_HOST || !EMAIL_FROM) {
    console.error('Variáveis de ambiente de e-mail não configuradas.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro de configuração do servidor de e-mail.' }),
    };
  }

  try {
    // --- ALTERAÇÃO AQUI ---
    // Agora esperamos 'name', 'message', e 'sessionEmail'
    const { name, message, sessionEmail } = JSON.parse(event.body);

    if (!name || !message || !sessionEmail) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ error: 'Dados do formulário incompletos.' }),
        };
    }

    const transporter = nodemailer.createTransport({
      host: MIGADU_SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: MIGADU_SMTP_USER,
        pass: MIGADU_SMTP_PASS,
      },
    });

    // --- ALTERAÇÃO AQUI ---
    const mailOptions = {
      from: `"${name}" <${EMAIL_FROM}>`,
      to: 'suporte@gabaritofinal.app', // E-mail de destino do suporte
      replyTo: sessionEmail, // O e-mail do utilizador logado para facilitar a resposta
      subject: `Nova mensagem de contato de: ${name} (${sessionEmail})`,
      html: `
        <h2>Nova Mensagem do Formulário de Contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email do Utilizador Logado:</strong> ${sessionEmail}</p>
        <hr>
        <h3>Mensagem:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mensagem enviada com sucesso!' }),
    };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao enviar a mensagem.' }),
    };
  }
};