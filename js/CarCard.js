import { bootstrapSheet } from './sharedStyles.js';

export class CarCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Adota o stylesheet do Bootstrap e o estilo local (opcional)
        this.shadowRoot.adoptedStyleSheets = [bootstrapSheet];
    }

    set vehicle(data) {
        this._data = data;
        this.render();
    }

    get vehicle() {
        return this._data;
    }

    set isFavorite(value) {
        this._isFavorite = value;
        const btn = this.shadowRoot.getElementById('wishBtn');
        if (btn) {
            btn.classList.toggle('active', value);
            btn.textContent = value ? '♥' : '♡';
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                .card {  
                    border-radius: 8px; 
                    overflow: hidden; 
                    font-family: Arial;
                }
                .image-container { position: relative; }
                img { width: 100%; height: 180px; object-fit: cover; display: block; }
                .wishlist-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    font-size: 1.2rem;
                    color: #666;
                    transition: color 0.2s;
                }
                .wishlist-btn.active { color: #e74c3c; }
                .content { padding: 16px; }
                h3 { font-size: 1rem; margin: 0 0 8px; color: #073b4c; }
                .price { color: #1f7a4d; font-weight: bold; font-size: 1.2rem; }
                button { 
                    background: none; border: 1px solid #073b4c; 
                    padding: 4px 12px; border-radius: 4px; cursor: pointer; 
                }
            </style>
            <div class="card shadow-sm">
                <div class="image-container">
                    <img src="${this._data.image}" class="card-img-top" alt="${this._data.title}">
                    <button id="wishBtn" class="wishlist-btn" aria-label="Favoritar">♡</button>
                </div>
                <div class="card-body">
                    <h5 class="card-title text-primary">${this._data.title}</h5>
                    <p class="card-text text-muted mb-1">${this._data.year} - ${this._data.km} km</p>
                    <div class="h4 text-success mb-3">R$ ${Number(this._data.price).toLocaleString('pt-BR')}</div>
                    <button id="viewBtn" class="btn btn-outline-primary w-100">Ver Detalhes</button>
                </div>
            </div>
        `;

        // Sincroniza estado visual inicial
        if (this._isFavorite !== undefined) this.isFavorite = this._isFavorite;

        this.shadowRoot.getElementById('viewBtn').addEventListener('click', () => {
            location.hash = `#veiculo-${this._data.id}`;
        });

        this.shadowRoot.getElementById('wishBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('toggle-favorite', {
                detail: { id: this._data.id },
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('car-card', CarCard);