const STORAGE_KEY = 'monEspace_v1';

const Storage = {
  loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this._defaultData();
    try { return JSON.parse(raw); }
    catch (e) { console.error('Données corrompues', e); return this._defaultData(); }
  },

  saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  get(key) {
    return this.loadAll()[key];
  },

  set(key, value) {
    const all = this.loadAll();
    all[key] = value;
    this.saveAll(all);
  },

  append(key, entry) {
    const all = this.loadAll();
    if (!Array.isArray(all[key])) all[key] = [];
    all[key].push({
      ...entry,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    this.saveAll(all);
  },

  exportJSON() {
    const data = this.loadAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mon-espace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  _defaultData() {
    return {
      profile: { createdAt: Date.now(), version: 1 },
      morning: [],
      evening: [],
      sos: [],
      messageFilter: [],
      exercises: [],
      coachChats: [],
      library: { patterns: [], beliefs: [], triggers: [], values: [], wins: [], resources: [], letters: [] },
      moodLog: []
    };
  }
};
