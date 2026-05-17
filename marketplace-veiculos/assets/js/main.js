/**
 * MARKETPLACE VEICULOS - SCRIPT PRINCIPAL
 * Mantem utilitarios antigos sem manipular HTML por string.
 */
import animation from './animation.js';

document.addEventListener('DOMContentLoaded', function() {
    animation();
    initializeFormValidation();
});

function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(this)) event.preventDefault();
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

function loadPage(url) {
    window.location.href = url;
}
const track = document.querySelector(".carousel-track");

document.querySelector(".next").addEventListener("click", () => {
  track.scrollLeft += 350;
});

document.querySelector(".prev").addEventListener("click", () => {
  track.scrollLeft -= 350;
});