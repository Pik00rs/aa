const Router = {
  currentRoute: null,

  navigate(route) {
    const container = document.getElementById('app');
    container.innerHTML = '';
    container.classList.remove('fade-in');
    void container.offsetWidth;
    container.classList.add('fade-in');

    this.currentRoute = route;

    switch (route) {
      case 'home': this._renderHome(container); break;
      case 'morning': Morning.render(container); break;
      case 'evening': Evening.render(container); break;
      case 'sos': SOS.render(container); break;
      case 'filter': MessageFilter.render(container); break;
      default: this._renderHome(container);
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('text-blue-400', btn.dataset.route === route);
    });
  },

  _renderHome(container) {
    const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    container.innerHTML = `
      <div class="space-y-6 mt-8">
        <div class="text-center">
          <p class="text-slate-400 text-sm">${date}</p>
          <h2 class="text-2xl font-light mt-2">Bienvenue.</h2>
        </div>
        
        <div class="grid gap-3">
          <button onclick="Router.navigate('morning')" class="p-6 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition">
            <div class="text-2xl">🌅</div>
            <div class="font-medium mt-2">Routine matin</div>
            <div class="text-sm text-slate-400">~10 min</div>
          </button>

          <button onclick="Router.navigate('evening')" class="p-6 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition">
            <div class="text-2xl">🌙</div>
            <div class="font-medium mt-2">Routine soir</div>
            <div class="text-sm text-slate-400">~10 min</div>
          </button>

          <button onclick="Router.navigate('filter')" class="p-6 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition border border-yellow-900/50">
            <div class="text-2xl">📱</div>
            <div class="font-medium mt-2">Filtre de messages</div>
            <div class="text-sm text-slate-400">Avant d'envoyer</div>
          </button>

          <button onclick="Router.navigate('sos')" class="p-6 bg-red-950/50 hover:bg-red-900/50 rounded-lg text-left transition border border-red-900/50">
            <div class="text-2xl">🆘</div>
            <div class="font-medium mt-2">Spirale en cours</div>
            <div class="text-sm text-slate-400">Aide immédiate</div>
          </button>
        </div>

        <div class="text-center mt-12">
          <button onclick="Storage.exportJSON()" class="text-xs text-slate-500 hover:text-slate-300 underline">
            Exporter mes données
          </button>
        </div>
      </div>
    `;
  }
};
