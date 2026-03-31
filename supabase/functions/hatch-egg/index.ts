// supabase/functions/hatch-egg/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:5173').split(',');

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req) });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  let eggId: string;
  try {
    ({ eggId } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Get egg
  const { data: egg } = await supabase
    .from('eggs')
    .select('*')
    .eq('id', eggId)
    .eq('user_id', user.id)
    .eq('status', 'incubating')
    .single();

  if (!egg) {
    return new Response(JSON.stringify({ error: 'Egg not found or not incubating' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Check incubation complete
  if (new Date(egg.incubation_end) > new Date()) {
    return new Response(JSON.stringify({ error: 'Egg is still incubating' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Check tracked product not violated
  const { data: trackedProduct } = await supabase
    .from('tracked_products')
    .select('status')
    .eq('egg_id', eggId)
    .single();

  if (trackedProduct?.status === 'violated') {
    // Destroy the egg
    await supabase.from('eggs').update({ status: 'destroyed' }).eq('id', eggId);
    return new Response(JSON.stringify({ error: 'Product was purchased, egg destroyed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Mark egg as hatched FIRST — worst case is egg consumed but creature not yet added
  // (recoverable), rather than creature added with egg still re-hatchable.
  const { error: hatchError } = await supabase
    .from('eggs')
    .update({ status: 'hatched' })
    .eq('id', eggId);

  if (hatchError) {
    return new Response(JSON.stringify({ error: 'Failed to hatch egg' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Add creature to collection
  const { data: userCreature } = await supabase
    .from('user_creatures')
    .insert({
      user_id: user.id,
      creature_id: egg.creature_id,
      hatched_from_egg: eggId,
      found_via: 'egg',
    })
    .select()
    .single();

  // Get creature definition
  const { data: creatureDef } = await supabase
    .from('creature_defs')
    .select('*')
    .eq('id', egg.creature_id)
    .single();

  // Mark tracked product complete
  await supabase
    .from('tracked_products')
    .update({ status: 'completed' })
    .eq('egg_id', eggId);

  // Log savings
  await supabase.from('savings_log').insert({
    user_id: user.id,
    product_name: egg.source_product_name,
    amount_saved: egg.source_product_price,
  });

  // Add virtual currency
  await supabase.rpc('increment_currency', {
    user_id_input: user.id,
    amount: egg.source_product_price,
  });

  // Increment streak
  await supabase.rpc('increment_streak', { user_id_input: user.id });

  return new Response(JSON.stringify({
    creature: {
      ...userCreature,
      creature_def: creatureDef,
    },
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
  });
});
