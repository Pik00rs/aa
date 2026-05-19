const Exercises = {
  // Rotation : lundi=regulation, mardi=cognitive, mercredi=trauma, jeudi=learning, vendredi=action
  // Samedi/dimanche = choix libre
  rotation: ['regulation', 'cognitive', 'trauma', 'learning', 'action'],
  
  data: null,
  state: {
    currentCategory: null,
    currentExercise: null
  },

  async render(container) {
    this.container = container;
    if (!this.data) {
      try {
        const res = await fetch('data/exercises.json');
        this.data = await res.json();
      } catch (e) {
        container.innerHTML = `<p class="text-red-400">Erreur chargement exercices. Vérifie data/exercises.json</p>`;
        return;
      }
    }
    this._renderToday();
  },

  // ============ AUJOURD'HUI ============
  _renderToday() {
    const day = new Date().getDay(); // 0=dim, 1=lun, ..., 6=sam
    const todayKey = (day >= 1 && day <= 5) ? this.rotation[day - 1] : null;
    const dayName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day];

    let todayHTML = '';
    if (todayKey) {
      const cat = this.data[todayKey];
      todayHTML = `
        <div class="p-5 bg-slate-800 rounded-lg border border-blue-900/50">
          <div class="text-xs text-slate-400">${dayName} — Jour ${cat.label}</div>
          <div class="text-2xl mt-2">${cat.icon}</div>
          <div class="font-medium mt-1">${cat.label}</div>
          <div class="text-sm text-slate-400 mt-1">${cat.description}</div>
          <button onclick="Exercises._pickExercise('${todayKey}')" class="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition">
            Voir l'exercice du jour
          </button>
        </div>
      `;
    } else {
      todayHTML = `
        <div class="p-5 bg-slate-800 rounded-lg">
          <div class="text-xs text-slate-400">${dayName} — Week-end</div>
          <div class="font-medium mt-2">Choix libre</div>
          <div class="text-sm text-slate-400 mt-1">Pioche dans la catégorie que tu veux travailler.</div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <h2 class="text-2xl font-light">🎯 Exercices</h2>
        
        ${todayHTML}

        <div class="pt-4">
          <h3 class="text-sm text-slate-400 mb-2">Toutes les catégories</h3>
          <div class="space-y-2">
            ${Object.entries(this.data).map(([key, cat]) => `
              <button onclick="Exercises._openCategory('${key}')" 
                      class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-xl">${cat.icon}</span>
                  <div>
                    <div class="text-sm font-medium">${cat.label}</div>
                    <div class="text-xs text-slate-500">${cat.exercises.length} exercices</div>
                  </div>
                </div>
                <span class="text-slate-500">›</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="pt-4">
          <button onclick="Exercises._showStats()" class="w-full py-2 text-xs text-slate-500 hover:text-slate-300 underline">
            Voir mes stats
          </button>
        </div>
      </div>
    `;
  },

  // ============ EXERCICE DU JOUR (random dans la catégorie) ============
  _pickExercise(categoryKey) {
    const cat = this.data[categoryKey];
    const idx = Math.floor(Math.random() * cat.exercises.length);
    this.state.currentCategory = categoryKey;
    this.state.currentExercise = idx;
    this._renderExercise();
  },

  // ============ LISTE DES EXERCICES D'UNE CATÉGORIE ============
  _openCategory(key) {
    const cat = this.data[key];
    this.state.currentCategory = key;

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <button onclick="Exercises._renderToday()" class="text-sm text-slate-400 hover:text-slate-200">← Retour</button>
        
        <div>
          <div class="text-2xl">${cat.icon}</div>
          <h2 class="text-xl font-light">${cat.label}</h2>
          <p class="text-sm text-slate-400">${cat.description}</p>
        </div>

        <div class="space-y-2">
          ${cat.exercises.map((ex, idx) => `
            <button onclick="Exercises._showExercise(${idx})" 
                    class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
              <div class="text-sm font-medium">${ex.title}</div>
              <div class="text-xs text-slate-500 mt-1">⏱ ${ex.duration}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  _showExercise(idx) {
    this.state.currentExercise = idx;
    this._renderExercise();
  },

  // ============ AFFICHAGE EXERCICE ============
  _renderExercise() {
    const cat = this.data[this.state.currentCategory];
    const ex = cat.exercises[this.state.currentExercise];

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <button onclick="Exercises._openCategory('${this.state.currentCategory}')" class="text-sm text-slate-400 hover:text-slate-200">← Retour</button>

        <div>
          <div class="text-xs text-slate-400">${cat.icon} ${cat.label}</div>
          <h2 class="text-xl font-light mt-1">${ex.title}</h2>
          <div class="text-xs text-slate-500 mt-1">⏱ ${ex.duration}</div>
        </div>

        <div class="p-4 bg-slate-800 rounded-lg space-y-3">
          <ol class="space-y-3">
            ${ex.steps.map((step, i) => `
              <li class="flex gap-3">
                <span class="text-blue-400 text-sm font-medium">${i + 1}.</span>
                <span class="text-sm flex-1">${this._escape(step)}</span>
              </li>
            `).join('')}
          </ol>
        </div>

        <div class="space-y-2">
          <textarea id="ex-notes" rows="3" placeholder="Notes après l'exercice (optionnel)..." 
                    class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-400 focus:outline-none text-sm"></textarea>
          
          <button onclick="Exercises._markDone()" class="w-full py-3 bg-green-700 hover:bg-green-600 rounded-lg text-sm transition">
            ✓ J'ai fait l'exercice
          </button>
        </div>
      </div>
    `;
  },

  _markDone() {
    const notes = document.getElementById('ex-notes').value.trim();
    const cat = this.data[this.state.currentCategory];
    const ex = cat.exercises[this.state.currentExercise];

    Storage.append('exercises', {
      category: this.state.currentCategory,
      categoryLabel: cat.label,
      exerciseTitle: ex.title,
      notes
    });

    this.container.innerHTML = `
      <div class="space-y-6 mt-12 text-center">
        <div class="text-6xl">✓</div>
        <h2 class="text-2xl font-light">Bien joué.</h2>
        <p class="text-slate-400 text-sm">Tu construis, brique par brique.</p>
        <button onclick="Exercises._renderToday()" class="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
          Retour
        </button>
      </div>
    `;
  },

  // ============ STATS ============
  _showStats() {
    const all = Storage.get('exercises') || [];
    const total = all.length;
    
    // Compteur par catégorie
    const byCategory = {};
    Object.keys(this.data).forEach(k => byCategory[k] = 0);
    all.forEach(e => {
      if (byCategory[e.category] !== undefined) byCategory[e.category]++;
    });

    // Cette semaine
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = all.filter(e => e.timestamp > weekAgo).length;

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <button onclick="Exercises._renderToday()" class="text-sm text-slate-400 hover:text-slate-200">← Retour</button>
        
        <h2 class="text-xl font-light">Stats exercices</h2>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 bg-slate-800 rounded-lg text-center">
            <div class="text-3xl font-light">${total}</div>
            <div class="text-xs text-slate-400 mt-1">Total</div>
          </div>
          <div class="p-4 bg-slate-800 rounded-lg text-center">
            <div class="text-3xl font-light">${thisWeek}</div>
            <div class="text-xs text-slate-400 mt-1">Cette semaine</div>
          </div>
        </div>

        <div class="space-y-2">
          ${Object.entries(byCategory).map(([key, count]) => {
            const cat = this.data[key];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return `
              <div class="p-3 bg-slate-800 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <div class="text-sm">${cat.icon} ${cat.label}</div>
                  <div class="text-xs text-slate-400">${count}</div>
                </div>
                <div class="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
