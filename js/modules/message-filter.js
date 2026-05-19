const MessageFilter = {
  state: {
    recipient: '',
    motivation: '',
    message: '',
    regretNotSending: null,
    regretSending: null,
    verdict: null
  },

  render(container) {
    this.container = container;
    this.state = {
      recipient: '',
      motivation: '',
      message: '',
      regretNotSending: null,
      regretSending: null,
      verdict: null
    };
    this._renderRecipient();
  },

  // ============ ÉTAPE 1 : À QUI ============
  _renderRecipient() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-2xl font-light">📱 Filtre de messages</h2>
        <p class="text-slate-400 text-sm">Avant d'envoyer. Pas après.</p>

        <div class="space-y-2">
          <label class="text-sm text-slate-400">À qui veux-tu écrire ?</label>
          <input id="msg-recipient" type="text" placeholder="Prénom..." 
                 class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-yellow-400 focus:outline-none">
        </div>

        <button onclick="MessageFilter._saveRecipient()" class="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition text-slate-900">
          Continuer
        </button>
      </div>
    `;
    setTimeout(() => document.getElementById('msg-recipient')?.focus(), 100);
  },

  _saveRecipient() {
    const v = document.getElementById('msg-recipient').value.trim();
    if (!v) return;
    this.state.recipient = v;
    this._renderMotivation();
  },

  // ============ ÉTAPE 2 : POURQUOI ============
  _renderMotivation() {
    const options = [
      { id: 'anxiety', label: '😰 Anxiété / besoin de réassurance', flag: 'anxious' },
      { id: 'desire', label: '💛 Vrai désir de partager / connecter', flag: 'genuine' },
      { id: 'need', label: '❓ J\'attends une réponse précise', flag: 'genuine' },
      { id: 'habit', label: '🔁 Habitude / check compulsif', flag: 'anxious' },
      { id: 'anger', label: '🔥 Colère / besoin de répondre', flag: 'anxious' },
      { id: 'practical', label: '📋 Truc pratique (logistique)', flag: 'genuine' }
    ];

    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <h2 class="text-xl font-light">Pourquoi maintenant ?</h2>
        <p class="text-slate-400 text-sm">Sois honnête. C'est pour toi.</p>

        <div class="space-y-2">
          ${options.map(o => `
            <button onclick="MessageFilter._pickMotivation('${o.id}', '${o.flag}', '${o.label.replace(/'/g, "\\'")}')" 
                    class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
              ${o.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  _pickMotivation(id, flag, label) {
    this.state.motivation = label;
    this.state.motivationFlag = flag;
    this._renderMessage();
  },

  // ============ ÉTAPE 3 : LE MESSAGE ============
  _renderMessage() {
    this.container.innerHTML = `
      <div class="space-y-4 mt-4">
        <h2 class="text-xl font-light">Le message</h2>
        <p class="text-slate-400 text-sm">Écris ce que tu veux envoyer. Comme tu l'enverrais vraiment.</p>

        <textarea id="msg-text" rows="8" placeholder="Tape ton message..." 
                  class="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"></textarea>

        <button onclick="MessageFilter._saveMessage()" class="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition text-slate-900">
          Continuer
        </button>
      </div>
    `;
  },

  _saveMessage() {
    const v = document.getElementById('msg-text').value.trim();
    if (!v) return;
    this.state.message = v;
    this._renderRegretNot();
  },

  // ============ ÉTAPE 4 : REGRET DE NE PAS ENVOYER ============
  _renderRegretNot() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Projection 24h</h2>
        <p class="text-slate-400 text-sm">Imagine demain, à la même heure.</p>

        <div class="p-4 bg-slate-800 rounded-lg">
          <p class="text-lg font-light">Si je ne l'envoie PAS,<br>vais-je le regretter ?</p>
        </div>

        <div class="space-y-2">
          <button onclick="MessageFilter._setRegretNot(3)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Oui clairement, je vais m'en vouloir
          </button>
          <button onclick="MessageFilter._setRegretNot(2)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Peut-être un peu
          </button>
          <button onclick="MessageFilter._setRegretNot(1)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Non, j'aurais zappé
          </button>
          <button onclick="MessageFilter._setRegretNot(0)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Au contraire, je serais soulagé
          </button>
        </div>
      </div>
    `;
  },

  _setRegretNot(score) {
    this.state.regretNotSending = score;
    this._renderRegretYes();
  },

  // ============ ÉTAPE 5 : REGRET D'ENVOYER ============
  _renderRegretYes() {
    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <h2 class="text-xl font-light">Projection 24h</h2>

        <div class="p-4 bg-slate-800 rounded-lg">
          <p class="text-lg font-light">Si je l'envoie,<br>vais-je le regretter ?</p>
        </div>

        <div class="space-y-2">
          <button onclick="MessageFilter._setRegretYes(3)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Oui, je vais me sentir mal
          </button>
          <button onclick="MessageFilter._setRegretYes(2)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Probablement un peu
          </button>
          <button onclick="MessageFilter._setRegretYes(1)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Non, ça ira
          </button>
          <button onclick="MessageFilter._setRegretYes(0)" class="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Pas du tout, c'est légitime
          </button>
        </div>
      </div>
    `;
  },

  _setRegretYes(score) {
    this.state.regretSending = score;
    this._computeVerdict();
  },

  // ============ ÉTAPE 6 : VERDICT ============
  _computeVerdict() {
    const r1 = this.state.regretNotSending; // regret de ne PAS envoyer
    const r2 = this.state.regretSending;    // regret d'envoyer
    const isAnxious = this.state.motivationFlag === 'anxious';

    let verdict, color, advice;

    if (isAnxious && r1 <= 1 && r2 >= 2) {
      // Anxieux + peu de regret de ne pas + risque de regret en envoyant
      verdict = 'wait';
      color = 'red';
      advice = "Pulsion anxieuse. Tu ne regretterais pas de ne pas envoyer, mais tu pourrais regretter d'envoyer. Attends 2h minimum. Reviens dans le filtre après.";
    } else if (isAnxious && r2 >= 2) {
      verdict = 'wait';
      color = 'orange';
      advice = "Motivation anxieuse + risque de regret. Attends 2h. Si tu veux toujours, reformule en cherchant ton vrai besoin.";
    } else if (!isAnxious && r1 >= 2 && r2 <= 1) {
      verdict = 'send';
      color = 'green';
      advice = "Désir authentique, peu de risque de regret. Vas-y. Relis avant d'envoyer.";
    } else if (r1 >= 2 && r2 >= 2) {
      verdict = 'reformulate';
      color = 'yellow';
      advice = "Tu regretteras dans les deux cas. Le message tel qu'il est ne va pas. Reformule : cherche ce que tu veux VRAIMENT exprimer.";
    } else {
      verdict = 'reformulate';
      color = 'yellow';
      advice = "Pas évident. Reformule plus calmement : qu'est-ce que tu veux que cette personne sache ou comprenne ?";
    }

    this.state.verdict = verdict;

    const colors = {
      red: 'bg-red-950/40 border-red-800',
      orange: 'bg-orange-950/40 border-orange-800',
      yellow: 'bg-yellow-950/40 border-yellow-800',
      green: 'bg-green-950/40 border-green-800'
    };

    const titles = {
      wait: '⏸️ Attends',
      send: '✓ Tu peux envoyer',
      reformulate: '↻ Reformule'
    };

    this.container.innerHTML = `
      <div class="space-y-6 mt-4">
        <div class="p-6 ${colors[color]} border rounded-lg space-y-3">
          <h2 class="text-2xl font-light">${titles[verdict]}</h2>
          <p class="text-sm leading-relaxed">${advice}</p>
        </div>

        <div class="p-4 bg-slate-800 rounded-lg space-y-2">
          <p class="text-xs text-slate-400">Ton message :</p>
          <p class="text-sm whitespace-pre-wrap">${this.state.message}</p>
        </div>

        <div class="space-y-2">
          <button onclick="MessageFilter._finish(true)" class="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm">
            J'écoute le verdict (je n'envoie pas)
          </button>
          <button onclick="MessageFilter._finish(false)" class="w-full py-2 text-xs text-slate-500 hover:text-slate-300">
            J'ai quand même envoyé
          </button>
        </div>
      </div>
    `;
  },

  // ============ FIN ============
  _finish(followed) {
    Storage.append('messageFilter', {
      recipient: this.state.recipient,
      motivation: this.state.motivation,
      motivationFlag: this.state.motivationFlag,
      message: this.state.message,
      regretNotSending: this.state.regretNotSending,
      regretSending: this.state.regretSending,
      verdict: this.state.verdict,
      followed: followed
    });

    this._showStats(followed);
  },

  _showStats(followed) {
    const all = Storage.get('messageFilter') || [];
    const total = all.length;
    const wouldHaveRegretted = all.filter(m => 
      m.verdict !== 'send' && m.followed === true
    ).length;

    this.container.innerHTML = `
      <div class="space-y-6 mt-4 text-center">
        <div class="text-6xl">${followed ? '🙏' : '💙'}</div>
        <h2 class="text-2xl font-light">
          ${followed ? 'Bien joué.' : 'Pas de jugement.'}
        </h2>
        <p class="text-slate-400 text-sm">
          ${followed ? 'Tu apprends à séparer pulsion et action.' : 'L\'important c\'est que tu sois passé par le filtre.'}
        </p>

        <div class="p-6 bg-slate-800 rounded-lg space-y-2">
          <div class="text-3xl font-light">${wouldHaveRegretted}</div>
          <div class="text-sm text-slate-400">messages que tu aurais regrettés et n'as pas envoyés</div>
        </div>

        <div class="text-xs text-slate-500">Total filtres : ${total}</div>

        <button onclick="Router.navigate('home')" class="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
          Retour
        </button>
      </div>
    `;
  }
};
