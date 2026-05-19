document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.route));
  });
  Router.navigate('home');
  console.log('Mon Espace lancé. Données :', Storage.loadAll());
});
