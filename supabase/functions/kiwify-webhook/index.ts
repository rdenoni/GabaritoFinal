import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    
    // A validação de segurança da Kiwify deve ser implementada aqui se necessário
    // Por exemplo, verificando um token ou assinatura específica da Kiwify
    const kiwifySecret = Deno.env.get('KIWIFY_WEBHOOK_SECRET');
    const signature = req.headers.get('x-kiwify-signature');
    // if (!isValidKiwifySignature(signature, kiwifySecret)) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const email = payload.customer.email;
    const purchaseStatus = payload.order_status;

    console.log(`Webhook da Kiwify recebido para o email: ${email}, status: ${purchaseStatus}`);

    if (purchaseStatus === 'paid' || purchaseStatus === 'approved' || purchaseStatus === 'completed') {
      const supabaseAdmin = createClient(
        Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
        Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabaseAdmin
        .from('compradores')
        .upsert({ email: email, status_compra: purchaseStatus }, { onConflict: 'email' })
        .select()

      if (error) {
        throw new Error(error.message);
      }

      console.log('Comprador da Kiwify inserido/atualizado com sucesso:', data);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro no webhook da Kiwify:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});