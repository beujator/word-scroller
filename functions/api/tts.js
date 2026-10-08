// Synthèse vocale des mots (Workers AI, MeloTTS), avec garde-fous de coût :
// - un mot n'est généré qu'une fois, puis servi depuis le KV ;
// - seuls les mots des listes en ligne (ou des listes par défaut) sont générés ;
// - plafond global de générations par jour (DAILY_LIMIT).
// Coût max sur un forfait payant : 300 mots/jour × ~2 s ≈ 10 min d'audio ≈ 0,002 $/jour.

const MODEL = '@cf/myshell-ai/melotts';
const MAX_LENGTH = 40;
const DAILY_LIMIT = 300;

// Mots par défaut des jeux qui parlent (dictee.html, donjon.html)
const DEFAULT_WORDS = [
  'maison', 'jardin', 'voiture', 'soleil', 'livre', 'fleur', 'arbre', 'eau', 'fête', 'ordinateur',
  'château', 'dragon', 'épée', 'trésor', 'clé', 'porte', 'bouclier', 'lapin', 'forêt'
];

const normalize = word => word.replace(/,/g, '').trim().normalize('NFC').toLowerCase();

function json(status, error) {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function audio(bytes) {
  return new Response(bytes, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

// Le mot fait-il partie d'une liste ? Évite de générer n'importe quel texte envoyé à l'API.
async function isKnownWord(env, word) {
  if (DEFAULT_WORDS.includes(word)) return true;
  const index = JSON.parse(await env.WORD_LISTS.get('lists:index') || '[]');
  for (const { name } of index) {
    const list = JSON.parse(await env.WORD_LISTS.get(`list:${name}`) || 'null');
    if (list?.words?.some(w => normalize(w) === word)) return true;
  }
  return false;
}

// MeloTTS renvoie soit { audio: base64 }, soit le MP3 brut
async function toBytes(result) {
  if (result instanceof ArrayBuffer || ArrayBuffer.isView(result)) return result;
  if (result instanceof ReadableStream) return new Response(result).arrayBuffer();
  if (typeof result?.audio === 'string') {
    return Uint8Array.from(atob(result.audio), c => c.charCodeAt(0));
  }
  throw new Error('Réponse TTS inattendue');
}

export async function onRequestGet({ request, env }) {
  const word = normalize(new URL(request.url).searchParams.get('w') || '');
  if (!word || word.length > MAX_LENGTH || !/^[\p{L}' -]+$/u.test(word)) {
    return json(400, 'Mot invalide');
  }

  const cacheKey = `tts:${word}`;
  const cached = await env.WORD_LISTS.get(cacheKey, 'arrayBuffer');
  if (cached) return audio(cached);

  if (!env.AI) return json(503, 'Synthèse vocale non configurée');
  if (!(await isKnownWord(env, word))) return json(404, 'Mot absent des listes');

  // ponytail: compteur KV approximatif (pas atomique), suffisant comme plafond de coût
  const dayKey = `tts:count:${new Date().toISOString().slice(0, 10)}`;
  const count = parseInt(await env.WORD_LISTS.get(dayKey)) || 0;
  if (count >= DAILY_LIMIT) return json(429, 'Limite quotidienne atteinte');
  await env.WORD_LISTS.put(dayKey, String(count + 1), { expirationTtl: 2 * 24 * 3600 });

  try {
    const bytes = await toBytes(await env.AI.run(MODEL, { prompt: word, lang: 'fr' }));
    await env.WORD_LISTS.put(cacheKey, bytes);
    return audio(bytes);
  } catch (error) {
    console.error('Erreur TTS:', error);
    return json(502, 'Erreur de synthèse vocale');
  }
}
