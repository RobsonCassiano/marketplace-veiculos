export default function initAnimation() {
    const textElement = document.getElementById('animated-text');
    if (!textElement) return;

    const phrases = ["SUVs", "Carros Elétricos", "Seminovos", "Sedans", "Hatchbacks"];
    let i = 0;

    // Animação simples de troca de texto com fade
    setInterval(() => {
        textElement.style.opacity = 0;
        setTimeout(() => {
            i = (i + 1) % phrases.length;
            textElement.textContent = phrases[i];
            textElement.style.opacity = 1;
        }, 300);
    }, 3000);
}