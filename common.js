// Suivi des mots par boîtes de Leitner, partagé par tous les jeux.
// Un mot réussi monte d'une boîte et revient plus tard ; raté, il retourne en boîte 1.
// ponytail: stocké dans le localStorage, donc propre à l'appareil ; synchro serveur si l'orthophoniste veut suivre à distance.

const Progress = (() => {
    const KEY = 'orthoProgress';
    const DAYS = [0, 0, 1, 3, 7, 14]; // délai avant révision, par boîte (1 à 5)
    const DAY = 24 * 60 * 60 * 1000;

    // « ba,teau » et « Bateau » désignent le même mot
    const key = word => word.replace(/,/g, '').trim().normalize('NFC').toLowerCase();

    function all() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || {};
        } catch {
            return {};
        }
    }

    function save(data) {
        try {
            localStorage.setItem(KEY, JSON.stringify(data));
        } catch {
            // stockage plein ou bloqué : le jeu continue sans suivi
        }
    }

    function record(word, success, game) {
        const data = all();
        const k = key(word);
        const entry = data[k] || { box: 1, ok: 0, ko: 0 };
        entry.box = success ? Math.min(entry.box + 1, 5) : 1;
        success ? entry.ok++ : entry.ko++;
        entry.last = Date.now();
        entry.due = entry.last + DAYS[entry.box] * DAY;
        entry.game = game;
        data[k] = entry;
        save(data);
    }

    function shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Ordonne la liste : d'abord les mots à revoir (jamais vus, ratés, échéance passée),
    // dans le désordre, puis les autres par échéance la plus proche.
    function order(words) {
        const data = all();
        const now = Date.now();
        const due = w => data[key(w)]?.due ?? 0;
        const toReview = shuffle(words.filter(w => due(w) <= now));
        const later = words.filter(w => due(w) > now).sort((a, b) => due(a) - due(b));
        return [...toReview, ...later];
    }

    // Prochain mot à jouer, différent du mot courant si possible
    function next(words, current) {
        const candidates = order(words.filter(w => w !== current));
        return candidates[0] ?? current;
    }

    function reset() {
        localStorage.removeItem(KEY);
    }

    return { all, record, order, next, reset, shuffle, DAYS };
})();
