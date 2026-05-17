/* SUBMENUS DA NAVEGAÇÃO */

const navTriggers = document.querySelectorAll('.nav-trigger');

navTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    
    const submenuId = trigger.getAttribute('data-submenu');
    const submenu = document.getElementById(`submenu-${submenuId}`);
    
    if (submenu) {
      const isActive = submenu.classList.contains('active');
      
      // Fechar todos os outros submenus
      document.querySelectorAll('.submenu.active').forEach(menu => {
        menu.classList.remove('active');
      });
      
      document.querySelectorAll('.nav-trigger.active').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Abrir o atual se não estava aberto
      if (!isActive) {
        submenu.classList.add('active');
        trigger.classList.add('active');
      }
    }
  });
});

// Fechar submenus ao clicar fora
document.addEventListener('click', (e) => {
  const isNavItem = e.target.closest('.nav-item');
  
  if (!isNavItem) {
    document.querySelectorAll('.submenu.active').forEach(menu => {
      menu.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-trigger.active').forEach(btn => {
      btn.classList.remove('active');
    });
  }
});

/* LOGIN DROPDOWN */

const loginBtn = document.getElementById('loginBtn');
const loginDropdown = document.getElementById('loginDropdown');

if (loginBtn && loginDropdown) {
  loginBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    loginDropdown.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!loginBtn.contains(e.target) && !loginDropdown.contains(e.target)) {
      loginDropdown.classList.remove('active');
    }
  });
}

/* HAMBURGER MENU */

const hamburgerBtn = document.getElementById('hamburgerBtn');
const hamburgerMenu = document.getElementById('hamburgerMenu');

if (hamburgerBtn && hamburgerMenu) {
  hamburgerBtn.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!hamburgerBtn.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      hamburgerMenu.classList.remove('active');
    }
  });
}

/* TEXTO ANIMADO */

const animatedText = document.getElementById('animated-text');

const phrases = [
  'SUV até R$100 mil usado',
  'Carros elétricos',
  'Motos esportivas',
  'Picapes diesel'
];

let index = 0;

function changeText() {

  animatedText.style.opacity = 0;

  setTimeout(() => {

    animatedText.textContent = phrases[index];

    animatedText.style.opacity = 1;

    index = (index + 1) % phrases.length;

  }, 300);

}

changeText();

setInterval(changeText, 2500);

/* CAROUSEL */

const track = document.querySelector('.carousel-track');

document.querySelector('.next').addEventListener('click', () => {
  track.scrollLeft += 350;
});

document.querySelector('.prev').addEventListener('click', () => {
  track.scrollLeft -= 350;
});
