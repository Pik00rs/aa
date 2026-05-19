const Morning = {
  state: {
    step: 0,           // 0: intro, 1: respi, 2: intention, 3: affirmation, 4: visu, 5: fin
    cycle: 0,          // cycle actuel (0-29)
    phase: 'inhale',   // inhale | exhale
    timerId: null,
    intention: '',
    affirmation: '',
  },

  CYCLES_TOTAL: 30,
  PHASE_DURATION: 5000, // 5 sec

  render(container) {
    this.container = container;
    this.state.step = 0;
    this._renderIntro();
  },

  // ============ ÉTAPE 0 : INTRO ============
  _renderIntro() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-2xl font-light">🌅 Routine matin</h2>
        <p class="text-slate-400">4 étapes, ~10 min :</p>
        <ol class="space-y-2 text-slate-300">
          <li>1. Cohérence cardiaque (5 min)</li>
          <li>2. Intention du jour</li>
          <li>3. Affirmation</li>
          <li>4. Visualisation</li>
        </ol>
        <button onclick="Morning._startBreathing()" class="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
          Commencer
        </button>
      </div>
    `;
  },

  // ============ ÉTAPE 1 : RESPIRATION ============
  _startBreathing() {
    this.state.step = 1;
    this.state.cycle = 0;
    this.state.phase = 'inhale';
    this._renderBreathing();
    this._tick();
  },

  _renderBreathing() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center space-y-8 mt-4">
        <div class="text-sm text-slate-400">
          Cycle <span id="cycle-count">1</span> / ${this.CYCLES_TOTAL}
        </div>
        
        <div class="relative w-72 h-72 flex items-center justify-center">
          <div id="breath-circle" class="absolute rounded-full bg-blue-500/30 border-2 border-blue-400 transition-all ease-in-out" 
               style="width: 80px; height: 80px; transition-duration: ${this.PHASE_DURATION}ms;">
          </div>
          <div id="breath-text" class="relative text-2xl font-light z-10">Inspire</div>
        </div>

        <div class="flex gap-3">
          <button onclick="Morning._skipBreathing()" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
            Passer
          </button>
          <button onclick="Morning._stopBreathing()" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
            Arrêter
          </button>
        </div>
      </div>
    `;
    // Lance première animation
    setTimeout(() => this._animateCircle(), 50);
  },

  _animateCircle() {
    const circle = document.getElementById('breath-circle');
    const text = document.getElementById('breath-text');
    if (!circle || !text) return;

    if (this.state.phase === 'inhale') {
      circle.style.width = '280px';
      circle.style.height = '280px';
      text.textContent = 'Inspire';
    } else {
      circle.style.width = '80px';
      circle.style.height = '80px';
      text.textContent = 'Expire';
    }
  },

  _tick() {
    this.state.timerId = setTimeout(() => {
      // Switch phase
      if (this.state.phase === 'inhale') {
        this.state.phase = 'exhale';
      } else {
        this.state.phase = 'inhale';
        this.state.cycle++;
        const counter = document.getElementById('cycle-count');
        if (counter) counter.textContent = this.state.cycle + 1;
      }

      // Fin ?
      if (this.state.cycle >= this.CYCLES_TOTAL) {
        this._goToIntention();
        return;
      }

      this._animateCircle();
      this._tick();
    }, this.PHASE_DURATION);
  },

  _skipBreathing() {
    clearTimeout(this.state.timerId);
    this._goToIntention();
  },

  _stopBreathing() {
    clearTimeout(this.state.timerId);
    Router.navigate('home');
  },

  // ============ ÉTAPE 2 : INTENTION ============
  _goToIntention() {
    clearTimeout(this.state.timerId);
    this.state.step = 2;
    this.container.innerHTML = `
      <div class="space-y-6 mt-8">
        <h2 class="text-xl font-light">Intention du jour</h2>
        <p class="text-slate-400 text-sm">1 à 3 mots qui guideront ta journée. Ex : "calme, présent, patient"</p>
        
        <input id="intention-input" type="text" placeholder="Tes mots..." 
               class="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-lg focus:border-blue-400 focus:outline-none">
        
        <button onclick="Morning._saveIntention()" class="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
          Continuer
        </button>
      </div>
    `;
    setTimeout(() => document.getElementById('intention-input')?.focus(), 100);
  },

  _saveIntention() {
    const input = document.getElementById('intention-input');
    this.state.intention = input.value.trim();
    if (!this.state.intention) {
      input.classList.add('border-red-500');
      return;
    }
    this._goToAffirmation();
  },

  // ============ ÉTAPE 3 : AFFIRMATION ============
  _goToAffirmation() {
    this.state.step = 3;
    
    // Suggestions d'affirmations
    const suggestions = [
      "Je mérite d'être aimé tel que je suis.",
      "Mes émotions sont valides et passagères.",
      "Je suis en sécurité dans le moment présent.",
      "Je peux être seul sans être en danger.",
      "Mon attachement ne définit pas ma valeur.",
      "Je choisis la paix plutôt que la peur."
    ];

    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Affirmation</h2>
        <p class="text-slate-400 text-sm">Choisis-en une ou écris la tienne. Tu la diras 3 fois à voix haute.</p>
        
        <div class="space-y-2">
          ${suggestions.map(s => `
            <button onclick="Morning._pickAffirmation(this)" data-aff="${s}" 
                    class="aff-btn w-full p-3 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition text-sm">
              ${s}
            </button>
          `).join('')}
        </div>

        <textarea id="aff-custom" placeholder="Ou écris la tienne..." rows="2"
                  class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-400 focus:outline-none text-sm"></textarea>
        
        <button onclick="Morning._confirmAffirmation()" class="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
          Continuer
        </button>
      </div>
    `;
  },

  _pickAffirmation(btn) {
    document.querySelectorAll('.aff-btn').forEach(b => b.classList.remove('bg-blue-700'));
    btn.classList.add('bg-blue-700');
    document.getElementById('aff-custom').value = '';
    this.state.affirmation = btn.dataset.aff;
  },

  _confirmAffirmation() {
    const custom = document.getElementById('aff-custom').value.trim();
    if (custom) this.state.affirmation = custom;
    if (!this.state.affirmation) return;
    this._showAffirmationRepeat();
  },

  _showAffirmationRepeat() {
    let count = 0;
    this.container.innerHTML = `
      <div class="flex flex-col items-center space-y-8 mt-12 text-center">
        <p class="text-slate-400 text-sm">Dis-le à voix haute</p>
        <p class="text-2xl font-light leading-relaxed">"${this.state.affirmation}"</p>
        <div class="text-slate-400">
          Répétition <span id="rep-count">1</span> / 3
        </div>
        <button id="rep-btn" onclick="Morning._countRepeat()" class="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
          Dit ✓
        </button>
      </div>
    `;
    this._repCount = 0;
  },

  _countRepeat() {
    this._repCount++;
    if (this._repCount >= 3) {
      this._goToVisualization();
    } else {
      document.getElementById('rep-count').textContent = this._repCount + 1;
    }
  },

  // ============ ÉTAPE 4 : VISUALISATION ============
  _goToVisualization() {
    this.state.step = 4;
    let secondsLeft = 120; // 2 min

    this.container.innerHTML = `
      <div class="space-y-6 mt-4 text-center">
        <h2 class="text-xl font-light">Visualisation</h2>
        <p class="text-slate-400 text-sm">Ferme les yeux. Visualise ta journée idéale, comme si elle était déjà accomplie.</p>
        
        <div class="my-12">
          <div id="visu-timer" class="text-5xl font-light">2:00</div>
        </div>

        <button onclick="Morning._finishVisu()" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">
          Terminer
        </button>
      </div>
    `;

    this._visuInterval = setInterval(() => {
      secondsLeft--;
      const m = Math.floor(secondsLeft / 60);
      const s = String(secondsLeft % 60).padStart(2, '0');
      const t = document.getElementById('visu-timer');
      if (t) t.textContent = `${m}:${s}`;
      if (secondsLeft <= 0) this._finishVisu();
    }, 1000);
  },

  _finishVisu() {
    clearInterval(this._visuInterval);
    this._finishSession();
  },

  // ============ FIN : SAUVEGARDE ============
  _finishSession() {
    Storage.append('morning', {
      intention: this.state.intention,
      affirmation: this.state.affirmation,
      completedSteps: ['breathing', 'intention', 'affirmation', 'visualization']
    });

    this.container.innerHTML = `
      <div class="space-y-6 mt-12 text-center">
        <div class="text-6xl">✓</div>
        <h2 class="text-2xl font-light">Routine terminée</h2>
        <div class="space-y-2 text-slate-400">
          <p>Intention : <span class="text-slate-200">${this.state.intention}</span></p>
          <p class="text-sm">"${this.state.affirmation}"</p>
        </div>
        <button onclick="Router.navigate('home')" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition">
          Retour
        </button>
      </div>
    `;
  }
};
