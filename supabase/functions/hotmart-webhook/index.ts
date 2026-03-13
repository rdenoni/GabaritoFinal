import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    const hottok = req.headers.get('Hottok');

    // Validação de segurança
    if (hottok !== Deno.env.get('HOTMART_WEBHOOK_SECRET')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { email } = payload.data.buyer;
    const purchaseStatus = payload.data.purchase.status;

    console.log(`Webhook recebido para o email: ${email}, status: ${purchaseStatus}`);

    if (purchaseStatus === 'approved' || purchaseStatus === 'completed') {
      // CORRIGIDO: Usando os novos nomes das variáveis de ambiente
      const supabaseAdmin = createClient(
        Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
        Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Insere ou atualiza o email do comprador na tabela
      const { data, error } = await supabaseAdmin
        .from('compradores')
        .upsert({ email: email, status_compra: purchaseStatus }, { onConflict: 'email' })
        .select()

      if (error) {
        throw new Error(error.message);
      }

      console.log('Comprador inserido/atualizado com sucesso:', data);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro no webhook da Hotmart:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});