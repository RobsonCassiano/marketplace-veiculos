/* Submenus da navegacao */

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

  trigger.addEventListener('click', (e) => {
    e.preventDefault();

    const activeSubmenuId = trigger.getAttribute('data-submenu');
    const submenu = document.getElementById(`submenu-${activeSubmenuId}`);

    if (!submenu) return;

    const isActive = submenu.classList.contains('active');
    closeAllMenus();

    if (!isActive) {
      submenu.classList.add('active');
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});

function closeAllMenus() {
  document.querySelectorAll('.submenu.active').forEach(menu => {
    menu.classList.remove('active');
  });

  document.querySelectorAll('.nav-trigger.active').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  });

  if (loginDropdown) {
    loginDropdown.classList.remove('active');
  }

  if (loginBtn) {
    loginBtn.setAttribute('aria-expanded', 'false');
  }
}

document.addEventListener('click', (e) => {
  // Fecha menus se o clique for fora de um item de navegação ou do botão de login
  if (!e.target.closest('.nav-item') && !e.target.closest('.nav-right')) {
    closeAllMenus();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllMenus();
  }
});

/* Login dropdown */

if (loginBtn && loginDropdown) {
  loginBtn.setAttribute('aria-haspopup', 'true');
  loginBtn.setAttribute('aria-expanded', 'false');

  loginBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = loginDropdown.classList.contains('active');
    closeAllMenus();

    if (!isActive) {
      loginDropdown.classList.add('active');
      loginBtn.setAttribute('aria-expanded', 'true');
    }
  });
}

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
