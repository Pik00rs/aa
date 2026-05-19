const Dashboard = {
  charts: {},

  render(container) {
    this.container = container;
    this._renderDashboard();
  },

  _renderDashboard() {
    const data = Storage.loadAll();
    
    // Stats globales
    const stats = this._computeStats(data);

    this.container.innerHTML = `
      <div class="space-y-5 mt-4">
        <h2 class="text-2xl font-light">📊 Tableau de bord</h2>

        <!-- Streaks -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 bg-slate-800 rounded-lg text-center">
            <div class="text-3xl font-light">${stats.morningStreak}</div>
            <div class="text-xs text-slate-400 mt-1">🌅 Streak matin</div>
          </div>
          <div class="p-4 bg-slate-800 rounded-lg text-center">
            <div class="text-3xl font-light">${stats.eveningStreak}</div>
            <div class="text-xs text-slate-400 mt-1">🌙 Streak soir</div>
          </div>
        </div>

        <!-- SOS résistance -->
        <div class="p-4 bg-slate-800 rounded-lg">
          <div class="flex justify-between items-baseline mb-3">
            <div class="text-sm text-slate-400">🆘 Résistance SOS</div>
            <div class="text-xs text-slate-500">${stats.sosResisted}/${stats.sosTotal}</div>
          </div>
          <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-green-500" style="width: ${stats.sosPct}%"></div>
          </div>
          <div class="text-xs text-slate-500 mt-2">${stats.sosPct}% des spirales gérées sans craquer</div>
        </div>

        <!-- Filtre messages -->
        <div class="p-4 bg-slate-800 rounded-lg">
          <div class="flex justify-between items-baseline mb-3">
            <div class="text-sm text-slate-400">📱 Messages filtrés</div>
            <div class="text-xs text-slate-500">${stats.filterTotal} total</div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="text-xl font-light text-red-400">${stats.filterWait}</div>
              <div class="text-xs text-slate-500">Attendus</div>
            </div>
            <div>
              <div class="text-xl font-light text-yellow-400">${stats.filterReformulate}</div>
              <div class="text-xs text-slate-500">Reformulés</div>
            </div>
            <div>
              <div class="text-xl font-light text-green-400">${stats.filterSend}</div>
              <div class="text-xs text-slate-500">Envoyés OK</div>
            </div>
          </div>
        </div>

        <!-- Activité 30 jours -->
        <div class="p-4 bg-slate-800 rounded-lg">
          <div class="text-sm text-slate-400 mb-3">📅 Activité 30 derniers jours</div>
          <canvas id="chart-activity" height="120"></canvas>
        </div>

        <!-- Intensité SOS au fil du temps -->
        ${stats.sosTotal > 0 ? `
        <div class="p-4 bg-slate-800 rounded-lg">
          <div class="text-sm text-slate-400 mb-3">🆘 Intensité SOS (chronologique)</div>
          <canvas id="chart-sos" height="120"></canvas>
        </div>
        ` : ''}

        <!-- Triggers fréquents -->
        ${stats.topTriggers.length > 0 ? `
        <div class="p-4 bg-slate-800 rounded-lg">
          <div class="text-sm text-slate-400 mb-3">⚡ Triggers les plus fréquents</div>
          <div class="space-y-2">
            ${stats.topTriggers.map(t => `
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>${this._escape(t.label)}</span>
                  <span class="text-slate-500">${t.count}</span>
                </div>
                <div class="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-500" style="width: ${(t.count / stats.topTriggers[0].count) * 100}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Exercices par catégorie -->
        ${stats.exercisesByCategory.length > 0 ? `
        <div class="p-4 bg-slate-800 rounded-lg">
          <div class="text-sm text-slate-400 mb-3">🎯 Exercices par catégorie</div>
          <canvas id="chart-exercises" height="160"></canvas>
        </div>
        ` : ''}

        <!-- Résumé chiffres -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-slate-800 rounded-lg text-center">
            <div class="text-xl font-light">${stats.totalMorning}</div>
            <div class="text-xs text-slate-400 mt-1">Matins faits</div>
          </div>
          <div class="p-3 bg-slate-800 rounded-lg text-center">
            <div class="text-xl font-light">${stats.totalEvening}</div>
            <div class="text-xs text-slate-400 mt-1">Soirs faits</div>
          </div>
          <div class="p-3 bg-slate-800 rounded-lg text-center">
            <div class="text-xl font-light">${stats.totalExercises}</div>
            <div class="text-xs text-slate-400 mt-1">Exercices</div>
          </div>
          <div class="p-3 bg-slate-800 rounded-lg text-center">
            <div class="text-xl font-light">${stats.daysSinceStart}</div>
            <div class="text-xs text-slate-400 mt-1">Jours d'usage</div>
          </div>
        </div>

      </div>
    `;

    // Charger Chart.js puis dessiner les graphes
    this._ensureChartJS(() => {
      this._drawActivityChart(stats);
      if (stats.sosTotal > 0) this._drawSosChart(stats);
      if (stats.exercisesByCategory.length > 0) this._drawExercisesChart(stats);
    });
  },

  // ============ CHARGEMENT CHART.JS ============
  _ensureChartJS(callback) {
    if (window.Chart) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  },

  // ============ CALCUL DES STATS ============
  _computeStats(data) {
    const stats = {
      totalMorning: (data.morning || []).length,
      totalEvening: (data.evening || []).length,
      totalExercises: (data.exercises || []).length,
      sosTotal: (data.sos || []).length,
      sosResisted: 0,
      sosPct: 0,
      filterTotal: (data.messageFilter || []).length,
      filterWait: 0,
      filterReformulate: 0,
      filterSend: 0,
      morningStreak: this._computeStreak(data.morning || []),
      eveningStreak: this._computeStreak(data.evening || []),
      daysSinceStart: 0,
      topTriggers: [],
      exercisesByCategory: [],
      activityByDay: {}
    };

    // SOS
    stats.sosResisted = (data.sos || []).filter(s => s.resisted === true).length;
    stats.sosPct = stats.sosTotal > 0 ? Math.round((stats.sosResisted / stats.sosTotal) * 100) : 0;

    // Filtre
    (data.messageFilter || []).forEach(m => {
      if (m.verdict === 'wait') stats.filterWait++;
      else if (m.verdict === 'reformulate') stats.filterReformulate++;
      else if (m.verdict === 'send') stats.filterSend++;
    });

    // Jours depuis création
    if (data.profile?.createdAt) {
      stats.daysSinceStart = Math.floor((Date.now() - data.profile.createdAt) / (24 * 60 * 60 * 1000)) + 1;
    }

    // Top triggers (depuis review du soir + SOS)
    const triggerCounts = {};
    (data.evening || []).forEach(e => {
      const t = e.review?.trigger;
      if (t && t.length > 3) {
        const key = t.toLowerCase().substring(0, 30);
        triggerCounts[key] = (triggerCounts[key] || 0) + 1;
      }
    });
    stats.topTriggers = Object.entries(triggerCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Exercices par catégorie
    const exByCategory = {};
    (data.exercises || []).forEach(e => {
      const k = e.categoryLabel || e.category || 'Autre';
      exByCategory[k] = (exByCategory[k] || 0) + 1;
    });
    stats.exercisesByCategory = Object.entries(exByCategory).map(([label, count]) => ({ label, count }));

    // Activité par jour (30 derniers jours)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      stats.activityByDay[key] = { morning: 0, evening: 0, exercises: 0, sos: 0 };
    }

    const fillActivity = (arr, type) => {
      (arr || []).forEach(item => {
        if (stats.activityByDay[item.date]) {
          stats.activityByDay[item.date][type]++;
        }
      });
    };
    fillActivity(data.morning, 'morning');
    fillActivity(data.evening, 'evening');
    fillActivity(data.exercises, 'exercises');
    fillActivity(data.sos, 'sos');

    return stats;
  },

  // Streak : jours consécutifs jusqu'à aujourd'hui ou hier
  _computeStreak(arr) {
    if (!arr.length) return 0;
    const dates = new Set(arr.map(x => x.date));
    let streak = 0;
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    
    // Si pas fait aujourd'hui, on regarde si fait hier (sinon streak = 0)
    const today = d.toISOString().split('T')[0];
    if (!dates.has(today)) {
      d.setDate(d.getDate() - 1);
    }

    while (true) {
      const key = d.toISOString().split('T')[0];
      if (dates.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  // ============ GRAPHIQUES ============
  _drawActivityChart(stats) {
    const ctx = document.getElementById('chart-activity');
    if (!ctx) return;
    if (this.charts.activity) this.charts.activity.destroy();

    const days = Object.keys(stats.activityByDay);
    const labels = days.map(d => {
      const dt = new Date(d);
      return `${dt.getDate()}/${dt.getMonth() + 1}`;
    });

    this.charts.activity = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Matin', data: days.map(d => stats.activityByDay[d].morning), backgroundColor: '#3b82f6' },
          { label: 'Soir', data: days.map(d => stats.activityByDay[d].evening), backgroundColor: '#6366f1' },
          { label: 'Exercices', data: days.map(d => stats.activityByDay[d].exercises), backgroundColor: '#10b981' },
          { label: 'SOS', data: days.map(d => stats.activityByDay[d].sos), backgroundColor: '#ef4444' }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 10 } } }
        },
        scales: {
          x: { stacked: true, ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 0 }, grid: { display: false } },
          y: { stacked: true, ticks: { color: '#64748b', font: { size: 9 }, stepSize: 1 }, grid: { color: '#334155' } }
        }
      }
    });
  },

  _drawSosChart(stats) {
    const ctx = document.getElementById('chart-sos');
    if (!ctx) return;
    if (this.charts.sos) this.charts.sos.destroy();

    const sos = Storage.get('sos') || [];
    const sorted = [...sos].sort((a, b) => a.timestamp - b.timestamp);
    
    this.charts.sos = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sorted.map((_, i) => `#${i + 1}`),
        datasets: [{
          label: 'Intensité',
          data: sorted.map(s => s.intensity || 0),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: sorted.map(s => s.resisted ? '#10b981' : '#ef4444'),
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { display: false } },
          y: { min: 0, max: 10, ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#334155' } }
        }
      }
    });
  },

  _drawExercisesChart(stats) {
    const ctx = document.getElementById('chart-exercises');
    if (!ctx) return;
    if (this.charts.exercises) this.charts.exercises.destroy();

    this.charts.exercises = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: stats.exercisesByCategory.map(e => e.label),
        datasets: [{
          data: stats.exercisesByCategory.map(e => e.count),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', font: { size: 10 }, padding: 8 }
          }
        }
      }
    });
  },

  _escape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
