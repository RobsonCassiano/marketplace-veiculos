export default function animation() {
  const animatedText = document.getElementById('animated-text');

  if (!animatedText) return;

  const words = [
    'Carros elétricos',
    'SUV',
    'Sedans',
    'Esportivos',
    'Hatchbacks',
    'Caminhonetes',
    'Luxo',
    'Compactos',
    'Familiares',
    'Conversiveis'
  ];

  let index = 0;

  function changeText() {
    animatedText.style.opacity = '0';

    setTimeout(() => {
      animatedText.textContent = words[index];
      animatedText.style.opacity = '1';
      index = (index + 1) % words.length;
    }, 300);
  }

  changeText();
  setInterval(changeText, 2500);
}
