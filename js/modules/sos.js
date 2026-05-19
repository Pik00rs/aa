const SOS = {
  state: {
    intensity: 0,
    situation: '',
    autoThought: '',
    evidence: '',
    alternatives: ['', '', ''],
    chosenOption: '',
    timerSeconds: 0,
    timerStartedAt: 0,
    timerId: null,
    resisted: null,
    sessionId: null
  },

  render(container) {
    this.container = container;
    this._reset();
    this._renderIntensity();
  },

  _reset() {
    this.state = {
      intensity: 0,
      situation: '',
      autoThought: '',
      evidence: '',
      alternatives: ['', '', ''],
      chosenOption: '',
      timerSeconds: 0,
      timerStartedAt: 0,
      timerId: null,
      resisted: null,
      sessionId: Date.now()
    };
  },

  // ============ ÉTAPE 1 : INTENSITÉ ============
  _renderIntensity() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <div class="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
          <h2 class="text-xl font-light">🆘 Spirale en cours</h2>
          <p class="text-slate-400 text-sm mt-2">Respire. Tu es là. C'est déjà bien.</p>
        </div>

        <div class="space-y-3">
          <label class="text-sm text-slate-400">Sur 10, à quel point tu es activé ?</label>
          <div class="grid grid-cols-5 gap-2">
            ${[1,2,3,4,5,6,7,8,9,10].map(n => `
              <button onclick="SOS._setIntensity(${n})" data-int="${n}" 
                      class="int-btn py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition">
                ${n}
              </button>
            `).join('')}
          </div>
        </div>

        <button onclick="SOS._startBreathing()" id="int-next" disabled
                class="w-full py-4 bg-slate-700 disabled:opacity-30 rounded-lg font-medium transition">
          Continuer
        </button>
      </div>
    `;
  },

  _setIntensity(n) {
    this.state.intensity = n;
    document.querySelectorAll('.int-btn').forEach(b => {
      b.classList.toggle('bg-red-700', parseInt(b.dataset.int) === n);
      b.classList.toggle('bg-slate-800', parseInt(b.dataset.int) !== n);
    });
    const btn = document.getElementById('int-next');
    btn.disabled = false;
    btn.classList.remove('bg-slate-700');
    btn.classList.add('bg-red-600', 'hover:bg-red-500');
  },

  // ============ ÉTAPE 2 : COHÉRENCE CARDIAQUE 2 MIN ============
  _startBreathing() {
    this._breathCycle = 0;
    this._breathPhase = 'inhale';
    const CYCLES = 12; // 12 cycles x 10s = 2 min

    this.container.innerHTML = `
      <div class="flex flex-col items-center space-y-6 mt-4">
        <div class="text-sm text-slate-400">Stop physique — 2 min</div>
        <div class="text-xs text-slate-500">Cycle <span id="b-count">1</span> / ${CYCLES}</div>
        
        <div class="relative w-64 h-64 flex items-center justify-center">
          <div id="b-circle" class="absolute rounded-full bg-red-500/30 border-2 border-red-400" 
               style="width: 80px; height: 80px; transition: all 5000ms ease-in-out;">
          </div>
          <div id="b-text" class="relative text-xl font-light z-10">Inspire</div>
        </div>

        <button onclick="SOS._skipBreath()" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
          Passer
        </button>
      </div>
    `;

    setTimeout(() => this._animateBreath(), 50);
    this._breathTick(CYCLES);
  },

  _animateBreath() {
    const c = document.getElementById('b-circle');
    const t = document.getElementById('b-text');
    if (!c || !t) return;
    if (this._breathPhase === 'inhale') {
      c.style.width = '240px';
      c.style.height = '240px';
      t.textContent = 'Inspire';
    } else {
      c.style.width = '80px';
      c.style.height = '80px';
      t.textContent = 'Expire';
    }
  },

  _breathTick(total) {
    this.state.timerId = setTimeout(() => {
      if (this._breathPhase === 'inhale') {
        this._breathPhase = 'exhale';
      } else {
        this._breathPhase = 'inhale';
        this._breathCycle++;
        const el = document.getElementById('b-count');
        if (el) el.textContent = this._breathCycle + 1;
      }
      if (this._breathCycle >= total) {
        this._startMentalization();
        return;
      }
      this._animateBreath();
      this._breathTick(total);
    }, 5000);
  },

  _skipBreath() {
    clearTimeout(this.state.timerId);
    this._startMentalization();
  },

  // ============ ÉTAPE 3 : MENTALISATION ============
  _startMentalization() {
    clearTimeout(this.state.timerId);
    this.container.innerHTML = `
      <div class="space-y-5 mt-4">
        <h2 class="text-xl font-light">Mentalisation</h2>
        <p class="text-slate-400 text-sm">Mets des mots. C'est ce qui te ramène au cortex.</p>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">1. Que s'est-il passé ? (faits)</label>
          <textarea id="m-situation" rows="2" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none text-sm"></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">2. Pensée automatique qui surgit</label>
          <textarea id="m-thought" rows="2" placeholder="Ex: elle va me quitter..." class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none text-sm"></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">3. Preuve CONCRÈTE de cette pensée (faits, pas suppositions)</label>
          <textarea id="m-evidence" rows="2" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none text-sm"></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">4. Trois autres explications possibles</label>
          <input id="m-alt1" type="text" placeholder="Alternative 1" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none text-sm">
          <input id="m-alt2" type="text" placeholder="Alternative 2" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none text-sm">
          <input id="m-alt3" type="text" placeholder="Alternative 3" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none text-sm">
        </div>

        <button onclick="SOS._saveMentalization()" class="w-full py-4 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition">
          Continuer
        </button>
      </div>
    `;
  },

  _saveMentalization() {
    this.state.situation = document.getElementById('m-situation').value.trim();
    this.state.autoThought = document.getElementById('m-thought').value.trim();
    this.state.evidence = document.getElementById('m-evidence').value.trim();
    this.state.alternatives = [
      document.getElementById('m-alt1').value.trim(),
      document.getElementById('m-alt2').value.trim(),
      document.getElementById('m-alt3').value.trim()
    ];
    this._showOptions();
  },

  // ============ ÉTAPE 4 : OPTIONS ============
  _showOptions() {
    const options = [
      { id: 'message', label: '📱 Envoyer un message', warning: true },
      { id: 'journal', label: '📓 Écrire dans le journal' },
      { id: 'pote', label: '☎️ Appeler un pote' },
      { id: 'sortir', label: '🚶 Sortir / bouger' },
      { id: 'mediter', label: '🧘 Méditer' },
      { id: 'rien', label: '⏸️ Ne rien faire (attendre)' }
    ];

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <h2 class="text-xl font-light">Tes options</h2>
        <p class="text-slate-400 text-sm">Choisis ce que tu veux faire. Aucune n'est mauvaise.</p>

        <div class="space-y-2">
          ${options.map(o => `
            <button onclick="SOS._pickOption('${o.id}', '${o.label.replace(/'/g, "\\'")}')" 
                    class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition ${o.warning ? 'border border-yellow-700/50' : ''}">
              ${o.label}
              ${o.warning ? '<div class="text-xs text-yellow-500 mt-1">⚠️ Passe par le filtre de messages</div>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  _pickOption(id, label) {
    this.state.chosenOption = label;
    this._startTimer();
  },

  // ============ ÉTAPE 5 : TIMER DE PROTECTION ============
  _startTimer() {
    // Durée selon intensité
    let minutes;
    if (this.state.intensity <= 3) minutes = 15;
    else if (this.state.intensity <= 6) minutes = 30;
    else minutes = 60;

    this.state.timerSeconds = minutes * 60;
    this.state.timerStartedAt = Date.now();
    this._renderTimer();
    this._tickTimer();
  },

  _renderTimer() {
    const m = Math.floor(this.state.timerSeconds / 60);
    const s = String(this.state.timerSeconds % 60).padStart(2, '0');
    
    this.container.innerHTML = `
      <div class="space-y-6 mt-4 text-center">
        <div class="p-4 bg-slate-800 rounded-lg">
          <p class="text-sm text-slate-400">Tu as choisi :</p>
          <p class="font-medium mt-1">${this.state.chosenOption}</p>
        </div>

        <p class="text-slate-400 text-sm">Avant d'agir, on attend. C'est ça la protection.</p>

        <div class="my-8">
          <div id="timer-display" class="text-6xl font-light">${m}:${s}</div>
          <p class="text-xs text-slate-500 mt-2">Reste avec ce que tu ressens. Ça passe.</p>
        </div>

        <div class="space-y-2">
          <button onclick="SOS._finishTimer()" class="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">
            J'ai tenu, terminer maintenant
          </button>
          <button onclick="SOS._abandonTimer()" class="w-full py-2 text-xs text-slate-500 hover:text-slate-300">
            Abandonner le timer
          </button>
        </div>
      </div>
    `;
  },

  _tickTimer() {
    this.state.timerId = setInterval(() => {
      this.state.timerSeconds--;
      const m = Math.floor(this.state.timerSeconds / 60);
      const s = String(this.state.timerSeconds % 60).padStart(2, '0');
      const el = document.getElementById('timer-display');
      if (el) el.textContent = `${m}:${s}`;
      if (this.state.timerSeconds <= 0) {
        clearInterval(this.state.timerId);
        this._reevaluation();
      }
    }, 1000);
  },

  _finishTimer() {
    clearInterval(this.state.timerId);
    this._reevaluation();
  },

  _abandonTimer() {
    clearInterval(this.state.timerId);
    this.state.resisted = false;
    this._save({ abandoned: true });
    this._showStats();
  },

  // ============ ÉTAPE 6 : RÉ-ÉVALUATION ============
  _reevaluation() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4 text-center">
        <h2 class="text-xl font-light">Re-évaluation</h2>
        <p class="text-slate-400 text-sm">L'envie initiale est-elle toujours là ?</p>

        <div class="space-y-3 mt-8">
          <button onclick="SOS._setResisted(true)" class="w-full py-4 bg-green-700 hover:bg-green-600 rounded-lg transition">
            Non, ça s'est calmé ✓
          </button>
          <button onclick="SOS._setResisted(true, true)" class="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
            Atténuée, mais je vais quand même agir (raisonné)
          </button>
          <button onclick="SOS._setResisted(false)" class="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
            Toujours forte, j'agis sur l'impulsion
          </button>
        </div>
      </div>
    `;
  },

  _setResisted(resisted, reasoned = false) {
    this.state.resisted = resisted;
    this._save({ reasoned });
    this._showStats();
  },

  // ============ SAUVEGARDE ============
  _save(extra = {}) {
    Storage.append('sos', {
      intensity: this.state.intensity,
      situation: this.state.situation,
      autoThought: this.state.autoThought,
      evidence: this.state.evidence,
      alternatives: this.state.alternatives.filter(a => a),
      chosenOption: this.state.chosenOption,
      resisted: this.state.resisted,
      ...extra
    });
  },

  // ============ STATS ============
  _showStats() {
    const all = Storage.get('sos') || [];
    const total = all.length;
    const resisted = all.filter(s => s.resisted === true).length;
    const pct = total > 0 ? Math.round((resisted / total) * 100) : 0;

    this.container.innerHTML = `
      <div class="space-y-6 mt-4 text-center">
        <div class="text-6xl">${this.state.resisted ? '🙏' : '💙'}</div>
        <h2 class="text-2xl font-light">
          ${this.state.resisted ? 'Tu as tenu.' : 'Tu as fait ce que tu as pu.'}
        </h2>
        <p class="text-slate-400 text-sm">
          ${this.state.resisted ? 'Chaque fois compte. Ton cerveau apprend.' : 'Pas de jugement. Demain est un autre jour.'}
        </p>

        <div class="p-6 bg-slate-800 rounded-lg space-y-2">
          <div class="text-3xl font-light">${resisted} / ${total}</div>
          <div class="text-sm text-slate-400">SOS résistés (${pct}%)</div>
        </div>

        <button onclick="Router.navigate('home')" class="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
          Retour
        </button>
      </div>
    `;
  }
};
