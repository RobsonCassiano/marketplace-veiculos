/* Submenus da navegacao */

const mainNavbar = document.getElementById('mainNavbar');
const loginBtn = document.getElementById('loginBtn');
const loginDropdown = document.getElementById('loginDropdown');

const navTriggers = document.querySelectorAll('.nav-trigger');

navTriggers.forEach(trigger => {
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');

  const submenuId = trigger.getAttribute('data-submenu');
  if (submenuId) {
    trigger.setAttribute('aria-controls', `submenu-${submenuId}`);
  }
});

function closeAllMenus() {
  // Fecha Dropdowns do Bootstrap
  const dropdowns = document.querySelectorAll('.dropdown-menu.show');
  dropdowns.forEach(dd => dd.classList.remove('show'));

  // Fecha o menu mobile do Bootstrap
  if (mainNavbar && mainNavbar.classList.contains('show')) {
    const bsCollapse = bootstrap.Collapse.getInstance(mainNavbar);
    if (bsCollapse) bsCollapse.hide();
  }
}

document.addEventListener('click', (e) => {
  // Fecha menus se o clique for fora de um item de navegação ou do botão de login
  if (!e.target.closest('.navbar-nav') && !e.target.closest('.nav-right') && !e.target.closest('.navbar-toggler')) {
    closeAllMenus();
  }
});

// Fecha menus ao clicar em qualquer link (melhoria UX para SPA)
document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
  if (link.classList.contains('dropdown-toggle')) return;
  link.addEventListener('click', () => {
    closeAllMenus();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllMenus();
  }
});

/* Carousel */

const track = document.querySelector('.carousel-track');
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');

if (track && nextButton && prevButton) {
  nextButton.addEventListener('click', () => {
    track.scrollLeft += 350;
  });

  prevButton.addEventListener('click', () => {
    track.scrollLeft -= 350;
  });
}
