import { createClient } from '@supabase/supabase-js';

// These will be replaced at build time via Vite's define
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'http://localhost:5173';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Message handler
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handler = messageHandlers[message.type];
  if (handler) {
    handler(message.payload).then(sendResponse);
    return true; // async response
  }
  return false;
});

const messageHandlers: Record<string, (payload: any) => Promise<any>> = {
  CHECK_PRODUCT: handleCheckProduct,
  DELAY_PURCHASE: handleDelayPurchase,
  CHECK_TRACKED: handleCheckTracked,
  PURCHASE_DETECTED: handlePurchaseDetected,
  GET_STATUS: handleGetStatus,
};

async function handleCheckProduct(payload: { price: number; url: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { action: 'none', reason: 'not_logged_in' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('spending_threshold, whitelisted_domains')
    .eq('id', session.user.id)
    .single();

  if (!profile) return { action: 'none' };

  // Check whitelist
  try {
    const url = new URL(payload.url);
    if (profile.whitelisted_domains.some((d: string) => url.hostname.includes(d))) {
      return { action: 'none', reason: 'whitelisted' };
    }
  } catch {
    // Invalid URL, continue with check
  }

  // Check threshold (price is in cents)
  if (payload.price < profile.spending_threshold) {
    return { action: 'none', reason: 'below_threshold' };
  }

  return { action: 'prompt', threshold: profile.spending_threshold };
}

async function handleDelayPurchase(payload: {
  productName: string;
  productPrice: number;
  productKeywords: string[];
  productUrl: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'not_logged_in' };

  const { data: token, error } = await supabase
    .from('tokens')
    .insert({
      user_id: session.user.id,
      source_product_name: payload.productName,
      source_product_price: payload.productPrice,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, token, webAppUrl: WEB_APP_URL };
}

async function handleCheckTracked(payload: { url: string; keywords: string[] }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { tracked: false };

  const { data: products } = await supabase
    .from('tracked_products')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active');

  if (!products || products.length === 0) return { tracked: false };

  for (const product of products) {
    // Check URL match
    if (product.tracked_urls.some((u: string) => payload.url.includes(u))) {
      return { tracked: true, product };
    }
    // Check keyword match (at least 2 keywords must match)
    const pageText = payload.keywords.join(' ').toLowerCase();
    const matchCount = product.product_keywords.filter(
      (kw: string) => pageText.includes(kw.toLowerCase())
    ).length;
    if (product.product_keywords.length > 0 && matchCount >= 2) {
      return { tracked: true, product };
    }
  }

  return { tracked: false };
}

async function handlePurchaseDetected(payload: { productId: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false };

  const { data: product } = await supabase
    .from('tracked_products')
    .select('egg_id')
    .eq('id', payload.productId)
    .single();

  if (product) {
    await supabase.from('eggs').update({ status: 'destroyed' }).eq('id', product.egg_id);
    await supabase.from('tracked_products').update({ status: 'violated' }).eq('id', payload.productId);
    await supabase.rpc('break_streak', { user_id_input: session.user.id });
  }

  return { success: true };
}

async function handleGetStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { isLoggedIn: false };

  const [eggsRes, tokensRes, savingsRes] = await Promise.all([
    supabase
      .from('eggs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'incubating')
      .order('incubation_end', { ascending: true }),
    supabase
      .from('tokens')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('used', false),
    supabase
      .from('savings_log')
      .select('amount_saved')
      .eq('user_id', session.user.id),
  ]);

  const totalSaved = (savingsRes.data ?? []).reduce((sum: number, s: any) => sum + s.amount_saved, 0);

  return {
    isLoggedIn: true,
    eggs: eggsRes.data ?? [],
    tokenCount: tokensRes.data?.length ?? 0,
    totalSaved,
    webAppUrl: WEB_APP_URL,
  };
}

// Alarm to check for eggs ready to hatch
chrome.alarms.create('check-eggs', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'check-eggs') return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: readyEggs } = await supabase
    .from('eggs')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('status', 'incubating')
    .lte('incubation_end', new Date().toISOString());

  if (readyEggs && readyEggs.length > 0) {
    chrome.action.setBadgeText({ text: `${readyEggs.length}` });
    chrome.action.setBadgeBackgroundColor({ color: '#f8d030' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
});
