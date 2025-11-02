// API Worker pour gérer les listes de mots en ligne
// Cloudflare Pages Function avec KV storage

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Clé pour stocker l'index de toutes les listes
const INDEX_KEY = 'lists:index';

// Vérifie le token admin pour les opérations d'écriture
function isAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  // Le token admin doit être défini dans les variables d'environnement Cloudflare
  return token === env.ADMIN_TOKEN;
}

// Récupère l'index de toutes les listes
async function getIndex(env) {
  const indexData = await env.WORD_LISTS.get(INDEX_KEY);
  return indexData ? JSON.parse(indexData) : [];
}

// Met à jour l'index
async function updateIndex(env, index) {
  await env.WORD_LISTS.put(INDEX_KEY, JSON.stringify(index));
}

// Gère GET /api/lists - Liste toutes les listes disponibles
async function handleListAll(env) {
  const index = await getIndex(env);
  return new Response(JSON.stringify({
    success: true,
    lists: index
  }), {
    headers: CORS_HEADERS
  });
}

// Gère GET /api/lists/:name - Récupère une liste spécifique
async function handleGetList(env, name) {
  const listData = await env.WORD_LISTS.get(`list:${name}`);

  if (!listData) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Liste non trouvée'
    }), {
      status: 404,
      headers: CORS_HEADERS
    });
  }

  return new Response(JSON.stringify({
    success: true,
    list: JSON.parse(listData)
  }), {
    headers: CORS_HEADERS
  });
}

// Gère POST /api/lists/:name - Crée ou met à jour une liste
async function handleCreateOrUpdateList(request, env, name) {
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Non autorisé'
    }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: 'JSON invalide'
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  // Validation des données
  if (!body.words || !Array.isArray(body.words) || body.words.length === 0) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Le champ "words" est requis et doit être un tableau non vide'
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  // Vérifier si la liste existe déjà
  const existingList = await env.WORD_LISTS.get(`list:${name}`);
  const isUpdate = !!existingList;

  // Créer l'objet liste
  const now = new Date().toISOString();
  const listData = {
    name: name,
    description: body.description || '',
    game: body.game || 'all',
    words: body.words,
    createdAt: isUpdate ? JSON.parse(existingList).createdAt : now,
    updatedAt: now
  };

  // Sauvegarder la liste
  await env.WORD_LISTS.put(`list:${name}`, JSON.stringify(listData));

  // Mettre à jour l'index
  let index = await getIndex(env);
  const existingIndex = index.findIndex(item => item.name === name);

  const indexEntry = {
    name: name,
    description: listData.description,
    game: listData.game,
    wordCount: listData.words.length,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    index[existingIndex] = indexEntry;
  } else {
    index.push(indexEntry);
  }

  await updateIndex(env, index);

  return new Response(JSON.stringify({
    success: true,
    message: isUpdate ? 'Liste mise à jour' : 'Liste créée',
    list: listData
  }), {
    status: isUpdate ? 200 : 201,
    headers: CORS_HEADERS
  });
}

// Gère DELETE /api/lists/:name - Supprime une liste
async function handleDeleteList(request, env, name) {
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Non autorisé'
    }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  // Vérifier si la liste existe
  const existingList = await env.WORD_LISTS.get(`list:${name}`);
  if (!existingList) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Liste non trouvée'
    }), {
      status: 404,
      headers: CORS_HEADERS
    });
  }

  // Supprimer la liste
  await env.WORD_LISTS.delete(`list:${name}`);

  // Mettre à jour l'index
  let index = await getIndex(env);
  index = index.filter(item => item.name !== name);
  await updateIndex(env, index);

  return new Response(JSON.stringify({
    success: true,
    message: 'Liste supprimée'
  }), {
    headers: CORS_HEADERS
  });
}

// Point d'entrée principal
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Gérer les requêtes OPTIONS pour CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: CORS_HEADERS
    });
  }

  // Extraire le chemin après /api/lists/
  const path = url.pathname.replace(/^\/api\/lists\/?/, '');

  try {
    // Route : GET /api/lists (liste toutes les listes)
    if (request.method === 'GET' && (!path || path === '')) {
      return await handleListAll(env);
    }

    // Route : GET /api/lists/:name (récupère une liste)
    if (request.method === 'GET' && path) {
      const listName = decodeURIComponent(path);
      return await handleGetList(env, listName);
    }

    // Route : POST /api/lists/:name (crée/met à jour une liste)
    if (request.method === 'POST' && path) {
      const listName = decodeURIComponent(path);
      return await handleCreateOrUpdateList(request, env, listName);
    }

    // Route : DELETE /api/lists/:name (supprime une liste)
    if (request.method === 'DELETE' && path) {
      const listName = decodeURIComponent(path);
      return await handleDeleteList(request, env, listName);
    }

    // Méthode non supportée
    return new Response(JSON.stringify({
      success: false,
      error: 'Méthode non supportée'
    }), {
      status: 405,
      headers: CORS_HEADERS
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur serveur',
      details: error.message
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
