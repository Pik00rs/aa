const Library = {
  sections: {
    patterns: { label: 'Mes patterns identifiés', icon: '🔄', hint: 'Ex: je projette mes peurs sur l\'autre quand elle met du temps à répondre' },
    beliefs: { label: 'Croyances toxiques + reformulations', icon: '💭', hint: 'Croyance: "Si elle ne répond pas, c\'est qu\'elle me quitte" / Reformulation: "Son silence n\'est pas un message"', dual: true },
    triggers: { label: 'Mes triggers + stratégies', icon: '⚡', hint: 'Trigger: pas de message au réveil / Stratégie: ne pas check le tel 1h, faire respiration', dual: true },
    values: { label: 'Mes valeurs en couple', icon: '💎', hint: 'Ex: communication directe, autonomie, présence, respect des espaces' },
    wins: { label: 'Mes succès', icon: '🏆', hint: 'Ex: 3 jours sans check WhatsApp compulsivement' },
    resources: { label: 'Mes phrases ressources', icon: '✨', hint: 'Ex: "Je peux être seul sans être en danger"' },
    letters: { label: 'Mes lettres', icon: '✉️', hint: 'À moi, à mon père, à mon ex... pas envoyées, juste écrites' }
  },

  state: {
    currentSection: null,
    editingId: null
  },

  render(container) {
    this.container = container;
    this.state.currentSection = null;
    this._renderIndex();
  },

  // ============ INDEX ============
  _renderIndex() {
    const lib = Storage.get('library') || {};
    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <h2 class="text-2xl font-light">📚 Bibliothèque</h2>
        <p class="text-slate-400 text-sm">Ton travail, accessible quand t'en as besoin.</p>

        <div class="space-y-2">
          ${Object.entries(this.sections).map(([key, s]) => {
            const count = (lib[key] || []).length;
            return `
              <button onclick="Library._openSection('${key}')" 
                      class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-xl">${s.icon}</span>
                  <span class="text-sm">${s.label}</span>
                </div>
                <span class="text-xs text-slate-500">${count}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ============ SECTION ============
  _openSection(key) {
    this.state.currentSection = key;
    this._renderSection();
  },

  _renderSection() {
    const key = this.state.currentSection;
    const section = this.sections[key];
    const lib = Storage.get('library') || {};
    const items = lib[key] || [];

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <button onclick="Library._renderIndex()" class="text-sm text-slate-400 hover:text-slate-200">
          ← Retour
        </button>

        <div>
          <h2 class="text-xl font-light">${section.icon} ${section.label}</h2>
          <p class="text-xs text-slate-500 mt-1">${section.hint}</p>
        </div>

        <button onclick="Library._newItem()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition">
          + Ajouter
        </button>

        <div class="space-y-2">
          ${items.length === 0 ? '<p class="text-slate-500 text-sm text-center py-8">Rien pour l\'instant.</p>' : ''}
          ${items.map((item, idx) => this._renderItem(item, idx, section.dual)).join('')}
        </div>
      </div>
    `;
  },

  _renderItem(item, idx, dual) {
    if (dual) {
      return `
        <div class="p-4 bg-slate-800 rounded-lg space-y-2">
          <div>
            <div class="text-xs text-slate-500 mb-1">Trigger / Croyance</div>
            <div class="text-sm">${this._escape(item.a || '')}</div>
          </div>
          <div class="pt-2 border-t border-slate-700">
            <div class="text-xs text-slate-500 mb-1">Stratégie / Reformulation</div>
            <div class="text-sm text-blue-300">${this._escape(item.b || '')}</div>
          </div>
          <div class="flex gap-2 pt-2">
            <button onclick="Library._editItem(${idx})" class="text-xs text-slate-400 hover:text-slate-200">✎ Modifier</button>
            <button onclick="Library._deleteItem(${idx})" class="text-xs text-red-400 hover:text-red-300">✕ Supprimer</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="p-4 bg-slate-800 rounded-lg space-y-2">
        <div class="text-sm whitespace-pre-wrap">${this._escape(item.text || '')}</div>
        <div class="flex justify-between items-center pt-2">
          <div class="text-xs text-slate-500">${item.date || ''}</div>
          <div class="flex gap-2">
            <button onclick="Library._editItem(${idx})" class="text-xs text-slate-400 hover:text-slate-200">✎</button>
            <button onclick="Library._deleteItem(${idx})" class="text-xs text-red-400 hover:text-red-300">✕</button>
          </div>
        </div>
      </div>
    `;
  },

  // ============ NEW / EDIT ============
  _newItem() {
    this.state.editingId = null;
    this._renderForm();
  },

  _editItem(idx) {
    this.state.editingId = idx;
    this._renderForm();
  },

  _renderForm() {
    const key = this.state.currentSection;
    const section = this.sections[key];
    const lib = Storage.get('library') || {};
    const items = lib[key] || [];
    const editing = this.state.editingId !== null;
    const item = editing ? items[this.state.editingId] : {};

    if (section.dual) {
      this.container.innerHTML = `
        <div class="space-y-4 mt-4">
          <button onclick="Library._renderSection()" class="text-sm text-slate-400 hover:text-slate-200">← Retour</button>
          
          <h2 class="text-xl font-light">${editing ? 'Modifier' : 'Ajouter'}</h2>

          <div class="space-y-2">
            <label class="text-sm text-slate-400">${key === 'beliefs' ? 'Croyance toxique' : 'Trigger'}</label>
            <textarea id="item-a" rows="3" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-400 focus:outline-none text-sm">${this._escape(item.a || '')}</textarea>
          </div>

          <div class="space-y-2">
            <label class="text-sm text-slate-400">${key === 'beliefs' ? 'Reformulation' : 'Stratégie'}</label>
            <textarea id="item-b" rows="3" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-400 focus:outline-none text-sm">${this._escape(item.b || '')}</textarea>
          </div>

          <button onclick="Library._saveItem()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition">
            ${editing ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      `;
    } else {
      this.container.innerHTML = `
        <div class="space-y-4 mt-4">
          <button onclick="Library._renderSection()" class="text-sm text-slate-400 hover:text-slate-200">← Retour</button>
          
          <h2 class="text-xl font-light">${editing ? 'Modifier' : 'Ajouter'}</h2>

          <textarea id="item-text" rows="8" placeholder="${section.hint}" 
                    class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-400 focus:outline-none text-sm">${this._escape(item.text || '')}</textarea>

          <button onclick="Library._saveItem()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition">
            ${editing ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      `;
    }
  },

  _saveItem() {
    const key = this.state.currentSection;
    const section = this.sections[key];
    const lib = Storage.get('library') || {};
    if (!Array.isArray(lib[key])) lib[key] = [];

    let newItem;
    if (section.dual) {
      const a = document.getElementById('item-a').value.trim();
      const b = document.getElementById('item-b').value.trim();
      if (!a && !b) return;
      newItem = { a, b, date: new Date().toISOString().split('T')[0] };
    } else {
      const text = document.getElementById('item-text').value.trim();
      if (!text) return;
      newItem = { text, date: new Date().toISOString().split('T')[0] };
    }

    if (this.state.editingId !== null) {
      lib[key][this.state.editingId] = { ...lib[key][this.state.editingId], ...newItem };
    } else {
      lib[key].push(newItem);
    }

    Storage.set('library', lib);
    this._renderSection();
  },

  _deleteItem(idx) {
    if (!confirm('Supprimer ?')) return;
    const key = this.state.currentSection;
    const lib = Storage.get('library') || {};
    lib[key].splice(idx, 1);
    Storage.set('library', lib);
    this._renderSection();
  },

  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
