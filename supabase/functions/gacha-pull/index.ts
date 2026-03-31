// supabase/functions/gacha-pull/index.ts
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

  let tokenId: string;
  try {
    ({ tokenId } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Verify token belongs to user and is unused
  const { data: token, error: tokenError } = await supabase
    .from('tokens')
    .select('*')
    .eq('id', tokenId)
    .eq('user_id', user.id)
    .eq('used', false)
    .single();

  if (tokenError || !token) {
    return new Response(JSON.stringify({ error: 'Invalid or used token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Get user profile for threshold
  const { data: profile } = await supabase
    .from('profiles')
    .select('spending_threshold, incubation_days')
    .eq('id', user.id)
    .single();

  const threshold = profile?.spending_threshold ?? 5000;
  const incubationDays = profile?.incubation_days ?? 14;

  // Calculate rarity weights
  const priceAboveThreshold = Math.max(0, token.source_product_price - threshold);
  const hundreds = priceAboveThreshold / 10000;

  const weights: Record<number, number> = {
    1: 50,
    2: 25,
    3: 15 + hundreds * 1,
    4: 8 + hundreds * 0.5,
    5: 2 + hundreds * 0.2,
  };

  // Weighted random selection
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let rarity = 1;
  for (const [r, w] of Object.entries(weights)) {
    roll -= w;
    if (roll <= 0) { rarity = Number(r); break; }
  }

  // Pick random non-safari creature of this rarity
  const { data: creatures } = await supabase
    .from('creature_defs')
    .select('id')
    .eq('rarity', rarity)
    .eq('safari_only', false);

  if (!creatures || creatures.length === 0) {
    return new Response(JSON.stringify({ error: 'No creatures available for this rarity' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  const creature = creatures[Math.floor(Math.random() * creatures.length)];

  // Calculate incubation end
  const incubationEnd = new Date();
  incubationEnd.setDate(incubationEnd.getDate() + incubationDays);

  // Mark token as used FIRST — worst case is token consumed but no egg (recoverable),
  // rather than egg created with token still reusable (double-spend).
  const { error: tokenUpdateError } = await supabase
    .from('tokens')
    .update({ used: true })
    .eq('id', tokenId);

  if (tokenUpdateError) {
    return new Response(JSON.stringify({ error: 'Failed to consume token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Create egg
  const { data: egg, error: eggError } = await supabase
    .from('eggs')
    .insert({
      user_id: user.id,
      creature_id: creature.id,
      rarity,
      source_product_name: token.source_product_name,
      source_product_price: token.source_product_price,
      incubation_end: incubationEnd.toISOString(),
    })
    .select()
    .single();

  if (eggError) {
    return new Response(JSON.stringify({ error: 'Failed to create egg' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
    });
  }

  // Create tracked product
  await supabase.from('tracked_products').insert({
    user_id: user.id,
    egg_id: egg.id,
    product_name: token.source_product_name,
    product_keywords: [],
    tracked_urls: [],
    product_price: token.source_product_price,
    tracking_until: incubationEnd.toISOString(),
  });

  return new Response(JSON.stringify({
    egg: {
      id: egg.id,
      rarity,
      incubationEnd: incubationEnd.toISOString(),
    },
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': getCorsOrigin(req) },
  });
});
