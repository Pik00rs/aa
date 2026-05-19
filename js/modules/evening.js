const Evening = {
  state: {
    step: 0,
    review: { good: '', trigger: '', different: '' },
    gratitude: ['', '', ''],
    tomorrow: { trigger: '', response: '' }
  },

  render(container) {
    this.container = container;
    this.state = {
      step: 0,
      review: { good: '', trigger: '', different: '' },
      gratitude: ['', '', ''],
      tomorrow: { trigger: '', response: '' }
    };
    this._renderIntro();
  },

  // ============ INTRO ============
  _renderIntro() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-2xl font-light">🌙 Routine soir</h2>
        <p class="text-slate-400">4 étapes, ~10 min :</p>
        <ol class="space-y-2 text-slate-300">
          <li>1. Review du jour</li>
          <li>2. Gratitude</li>
          <li>3. Auto-compassion</li>
          <li>4. Préparer demain</li>
        </ol>
        <button onclick="Evening._startReview()" class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
          Commencer
        </button>
      </div>
    `;
  },

  // ============ ÉTAPE 1 : REVIEW ============
  _startReview() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Review du jour</h2>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">✓ Une chose que j'ai bien faite</label>
          <textarea id="rev-good" rows="2" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none"></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">⚡ Un trigger rencontré (et comment j'ai réagi)</label>
          <textarea id="rev-trigger" rows="2" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none"></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">↻ Ce que je ferais différemment</label>
          <textarea id="rev-diff" rows="2" class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none"></textarea>
        </div>

        <button onclick="Evening._saveReview()" class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
          Continuer
        </button>
      </div>
    `;
  },

  _saveReview() {
    this.state.review.good = document.getElementById('rev-good').value.trim();
    this.state.review.trigger = document.getElementById('rev-trigger').value.trim();
    this.state.review.different = document.getElementById('rev-diff').value.trim();
    this._startGratitude();
  },

  // ============ ÉTAPE 2 : GRATITUDE ============
  _startGratitude() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Gratitude</h2>
        <p class="text-slate-400 text-sm">3 choses, même petites, dont tu es reconnaissant aujourd'hui.</p>

        <div class="space-y-3">
          <input id="grat-1" type="text" placeholder="1." class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none">
          <input id="grat-2" type="text" placeholder="2." class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none">
          <input id="grat-3" type="text" placeholder="3." class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none">
        </div>

        <button onclick="Evening._saveGratitude()" class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
          Continuer
        </button>
      </div>
    `;
    setTimeout(() => document.getElementById('grat-1')?.focus(), 100);
  },

  _saveGratitude() {
    this.state.gratitude = [
      document.getElementById('grat-1').value.trim(),
      document.getElementById('grat-2').value.trim(),
      document.getElementById('grat-3').value.trim()
    ];
    this._startSelfCompassion();
  },

  // ============ ÉTAPE 3 : AUTO-COMPASSION (Kristin Neff) ============
  _startSelfCompassion() {
    this._compassionStep = 0;
    this._showCompassionStep();
  },

  _showCompassionStep() {
    const steps = [
      {
        title: "1. Pleine conscience",
        intro: "Reconnais ce que tu ressens, sans le fuir.",
        phrase: "C'est un moment de souffrance.",
        guidance: "Pose la main sur ton cœur. Respire. Dis-le doucement, à voix haute ou en pensée."
      },
      {
        title: "2. Humanité commune",
        intro: "Tu n'es pas seul à traverser ça.",
        phrase: "La souffrance fait partie de la vie. D'autres ressentent ce que je ressens.",
        guidance: "Pense aux millions d'autres qui, en ce moment, vivent quelque chose de similaire."
      },
      {
        title: "3. Bienveillance envers soi",
        intro: "Offre-toi la même douceur qu'à un ami.",
        phrase: "Puis-je être doux avec moi-même. Puis-je m'accepter tel que je suis.",
        guidance: "Reste avec cette intention quelques secondes."
      }
    ];

    const s = steps[this._compassionStep];
    const isLast = this._compassionStep === steps.length - 1;

    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Auto-compassion</h2>
        
        <div class="space-y-4">
          <div class="text-sm text-slate-400">${s.title}</div>
          <p class="text-slate-300">${s.intro}</p>
          <div class="p-4 bg-indigo-900/30 border border-indigo-800 rounded-lg">
            <p class="text-lg font-light italic">"${s.phrase}"</p>
          </div>
          <p class="text-sm text-slate-400">${s.guidance}</p>
        </div>

        <button onclick="Evening._nextCompassion()" class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
          ${isLast ? 'Continuer' : 'Suivant'}
        </button>
      </div>
    `;
  },

  _nextCompassion() {
    this._compassionStep++;
    if (this._compassionStep >= 3) {
      this._startTomorrow();
    } else {
      this._showCompassionStep();
    }
  },

  // ============ ÉTAPE 4 : PRÉPARER DEMAIN ============
  _startTomorrow() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Préparer demain</h2>
        <p class="text-slate-400 text-sm">Anticipe pour mieux répondre.</p>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">Trigger probable demain</label>
          <textarea id="tom-trigger" rows="2" placeholder="Ex: pas de message d'elle au réveil..." class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none"></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">Comment j'y répondrai</label>
          <textarea id="tom-response" rows="3" placeholder="Ex: respiration 5 min, pas de check du tel pendant 2h..." class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-400 focus:outline-none"></textarea>
        </div>

        <button onclick="Evening._finishSession()" class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
          Terminer
        </button>
      </div>
    `;
  },

  // ============ FIN ============
  _finishSession() {
    this.state.tomorrow.trigger = document.getElementById('tom-trigger').value.trim();
    this.state.tomorrow.response = document.getElementById('tom-response').value.trim();

    Storage.append('evening', {
      review: this.state.review,
      gratitude: this.state.gratitude.filter(g => g),
      tomorrow: this.state.tomorrow
    });

    this.container.innerHTML = `
      <div class="space-y-6 mt-12 text-center">
        <div class="text-6xl">✓</div>
        <h2 class="text-2xl font-light">Bonne nuit.</h2>
        <p class="text-slate-400 text-sm">Tu as fait le travail aujourd'hui.</p>
        <button onclick="Router.navigate('home')" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition">
          Retour
        </button>
      </div>
    `;
  }
};
