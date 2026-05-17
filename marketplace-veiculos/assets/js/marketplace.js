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
