import animation from './animation.js';
import { uploadParaCloudinary } from './cloudinary.js';

document.addEventListener('DOMContentLoaded', () => {
    animation();
    initAccessibility();
    initRouter();
    initForms();
});

const VKEY = 'buscarauto_vehicles_v1';
const ACCESSIBILITY_KEY = 'buscarauto_accessibility_v1';
const DEFAULT_ACCESSIBILITY = { fontSize: 100, highContrast: false };
const WKEY = 'buscarauto_wishlist_v1';
const SESSION_KEY = 'buscarauto_session_v1';
const CLIENTS_KEY = 'buscarauto_clients_v1';
const PROPOSALS_KEY = 'buscarauto_proposals_v1';
const MAX_CLIENTS = 5;
const MAX_FAVORITES = 3;
const PAGE_SIZE = 6;
const DEFAULT_GALLERY = [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79f84f?q=80&w=1200&auto=format&fit=crop'
];

let currentPage = 1;
let currentDetailGallery = [];

function getMarketplacePreset() {
    const hash = location.hash || '#marketplace';
    if (hash === '#marketplace-0km') return '0km';
    if (hash === '#marketplace-seminovos') return 'seminovos';
    if (hash === '#marketplace-todos') return 'todos';
    return null;
}

function matchesMarketplacePreset(vehicle, preset) {
    if (!preset) return true;

    const km = numericValue(vehicle.km);
    const year = Number(vehicle.year || 0);

    if (preset === '0km') {
        return km <= 0 || (year >= 2026 && km <= 0); // Permitir 0km com ano futuro, considerando pré-lançamentos e anúncios antecipados 
    }

    if (preset === 'seminovos') {
        return km > 1000 && (km >= 50000 || year <= 2025); // Permitir seminovos com até 50.000 km ou ano até 2025, considerando veículos mais rodados ou de anos anteriores que ainda são considerados seminovos no mercado brasileiro
    }

    if (preset === 'todos') {
        return true; // "Todos" não deve filtrar por KM ou Ano, apenas mostrar tudo o que está no banco
    }

    return true;
}

function loadAccessibilitySettings() {
    try {
        return JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY)) || DEFAULT_ACCESSIBILITY;
    } catch {
        return DEFAULT_ACCESSIBILITY;
    }
}

function saveAccessibilitySettings(settings) {
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
}

function applyAccessibilitySettings(settings) {
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
    document.body.classList.toggle('high-contrast', settings.highContrast);

    const contrastToggle = document.getElementById('contrastToggle');
    if (contrastToggle) {
        contrastToggle.setAttribute('aria-pressed', String(settings.highContrast));
    }

    const status = document.getElementById('accessibilityStatus');
    if (status) {
        status.textContent = `Tamanho da fonte ${settings.fontSize}%. ${settings.highContrast ? 'Modo de alto contraste ativado.' : 'Modo de alto contraste desativado.'}`;
    }
}

function updateFontSize(delta) {
    const settings = loadAccessibilitySettings();
    settings.fontSize = Math.min(140, Math.max(90, settings.fontSize + delta));
    saveAccessibilitySettings(settings);
    applyAccessibilitySettings(settings);
}

function toggleHighContrast() {
    const settings = loadAccessibilitySettings();
    settings.highContrast = !settings.highContrast;
    saveAccessibilitySettings(settings);
    applyAccessibilitySettings(settings);
}

function resetAccessibilityDefaults() {
    const settings = { ...DEFAULT_ACCESSIBILITY };
    saveAccessibilitySettings(settings);
    applyAccessibilitySettings(settings);
}

function initAccessibility() {
    const settings = loadAccessibilitySettings();
    applyAccessibilitySettings(settings);

    document.getElementById('fontIncrease')?.addEventListener('click', () => updateFontSize(10));
    document.getElementById('fontDecrease')?.addEventListener('click', () => updateFontSize(-10));
    document.getElementById('contrastToggle')?.addEventListener('click', () => toggleHighContrast());
    document.getElementById('resetAccessibility')?.addEventListener('click', () => resetAccessibilityDefaults());
}

function getVehicles() {
    return JSON.parse(localStorage.getItem(VKEY) || '[]');
}

function saveVehicles(arr) {
    localStorage.setItem(VKEY, JSON.stringify(arr));
}

function numericValue(value) {
    return Number(String(value || '').replace(/\D/g, '') || 0);
}

function formatMoney(value) {
    return numericValue(value).toLocaleString('pt-BR');
}

function formatKm(value) {
    return numericValue(value).toLocaleString('pt-BR');
}

function seedIfEmpty() {
    const v = getVehicles();

    const seed = [
        { id: 'seed-camaro', title: 'Camaro ZL1', brand: 'Chevrolet', year: 2024, km: '0', fuel: 'Gasolina', transmission: 'Automatico', price: '420000', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop', description: 'Camaro topo de linha com pacote esportivo, interior premium e pronta entrega.', color: 'Amarelo', location: 'Sao Paulo - SP', agency: 'Auto Norte Multimarcas' },
        { id: 'seed-mercedes', title: 'Mercedes-Benz C300', brand: 'Mercedes-Benz', year: 2023, km: '12000', fuel: 'Flex', transmission: 'Automatico', price: '189900', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&auto=format&fit=crop', description: 'Sedan elegante, confortavel e com pacote completo de seguranca.', color: 'Prata', location: 'Curitiba - PR', agency: 'Prime Veiculos' },
        { id: 'seed-corolla', title: 'Toyota Corolla XEi 2.0', brand: 'Toyota', year: 2020, km: '48000', fuel: 'Flex', transmission: 'Automatico', price: '96900', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop', description: 'Unico dono, revisoes em dia, IPVA pago e pneus novos. Veiculo muito conservado para uso familiar.', color: 'Branco', location: 'Sao Paulo - SP', agency: 'Auto Norte Multimarcas' },
        { id: 'seed-civic', title: 'Honda Civic EXL 2.0', brand: 'Honda', year: 2019, km: '62000', fuel: 'Flex', transmission: 'Automatico', price: '104900', image: 'https://images.unsplash.com/photo-1549925862-990fe6564d16?q=80&w=1200&auto=format&fit=crop', description: 'Sedan completo, bancos em couro, central multimidia e excelente historico de manutencao.', color: 'Prata', location: 'Belo Horizonte - MG', agency: 'BH Motors' },
        { id: 'seed-toro', title: 'Fiat Toro Volcano 2.0 4x4', brand: 'Fiat', year: 2021, km: '35000', fuel: 'Diesel', transmission: 'Automatico', price: '119900', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop', description: 'Picape pratica, potente e pronta para estrada ou trabalho.', color: 'Preto', location: 'Campinas - SP', agency: 'Fast Car Multimarcas' },
        { id: 'seed-compass', title: 'Jeep Compass Limited 2.0', brand: 'Jeep', year: 2021, km: '28000', fuel: 'Flex', transmission: 'Automatico', price: '129900', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop', description: 'SUV versatil com pacote Limited, baixa quilometragem e revisoes na concessionaria.', color: 'Cinza', location: 'Porto Alegre - RS', agency: 'Top Motors' },
        { id: 'seed-gol', title: 'Volkswagen Gol 1.6', brand: 'Volkswagen', year: 2020, km: '45000', fuel: 'Gasolina', transmission: 'Manual', price: '69900', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop', description: 'Hatch acessivel, economico e com documentacao em dia.', color: 'Vermelho', location: 'Manaus - AM', agency: 'Via Norte Veiculos' },
        { id: 'seed-onix', title: 'Chevrolet Onix Plus LT 1.0', brand: 'Chevrolet', year: 2020, km: '15000', fuel: 'Gasolina', transmission: 'Automatico', price: '79900', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop', description: 'Compacto moderno, baixo consumo e otimo custo-beneficio.', color: 'Branco', location: 'Sao Paulo - SP', agency: 'Auto Leste' }
    ];
    if (v.some(vehicle => vehicle.id === 'seed-corolla')) return;
    saveVehicles(v.length ? [...seed, ...v] : seed);
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
        return null;
    }
}

function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function getClients() {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
}

function saveClients(arr) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(arr));
}

function getProposals() {
    return JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
}

function saveProposals(arr) {
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(arr));
}

function roleLabel(role) {
    if (role === 'admin') return 'Admin';
    if (role === 'seller') return 'Lojista';
    if (role === 'client') return 'Cliente';
    return 'Entrar';
}

function roleAvatar(role) {
    if (role === 'admin') return 'A';
    if (role === 'seller') return 'L';
    if (role === 'client') return 'C';
    return 'U';
}

function syncLoginState() {
    const session = getSession();
    const btn = document.getElementById('loginBtn');
    const label = document.getElementById('loginBtnLabel');
    const avatar = document.getElementById('loginAvatar');
    const dropdown = document.getElementById('loginDropdown');
    const logout = document.getElementById('logoutSessionLink');
    if (btn) {
        btn.setAttribute('data-role', session?.role || 'guest');
        btn.setAttribute('aria-label', session ? `Sessão atual: ${roleLabel(session.role)}. Abrir opções` : 'Abrir opções de login');
        btn.title = session ? `Sessão atual: ${roleLabel(session.role)}` : 'Abrir opções de login';
    }
    if (avatar) {
        avatar.textContent = roleAvatar(session?.role);
        avatar.setAttribute('data-role', session?.role || 'guest');
    }
    if (label) {
        label.textContent = session ? `Sessão: ${roleLabel(session.role)}` : 'Entrar';
        if (session && session.name) {
            const firstName = session.name.trim().split(' ')[0];
            label.textContent = `Olá, ${firstName}`;
        } else {
            label.textContent = session ? `Sessão: ${roleLabel(session.role)}` : 'Entrar';
        }
    }
    if (logout) {
        logout.hidden = !session;
    }
    if (dropdown && !session) {
        dropdown.classList.remove('session-active');
    }
}

function setSessionFromHref(href) {
    const current = getSession();
    // Só cria uma sessão genérica se não houver uma sessão ativa com dados reais
    if (current && current.name) return;

    if (href === '#cliente') saveSession({ role: 'client', label: 'Cliente', name: 'Usuário Cliente', email: 'cliente@exemplo.com' });
    if (href === '#lojista') saveSession({ role: 'seller', label: 'Lojista', name: 'Auto Norte', email: 'contato@autonorte.com' });
    if (href === '#cadastro-veiculo') saveSession({ role: 'seller', label: 'Lojista', name: 'Lojista', email: 'loja@exemplo.com' });
    if (href === '#admin') saveSession({ role: 'admin', label: 'Admin', name: 'Administrador' });
    syncLoginState();
}

function getVehicleGallery(vehicle) {
    if (Array.isArray(vehicle.gallery) && vehicle.gallery.length) {
        return vehicle.gallery;
    }

    if (vehicle.image) {
        return [vehicle.image, ...DEFAULT_GALLERY].slice(0, 4);
    }

    return DEFAULT_GALLERY.slice();
}

function buildPreviewData(form) {
    const fd = new FormData(form);
    const title = fd.get('title') || 'Toyota Corolla XEi 2.0';
    const brand = fd.get('brand') || 'Toyota';
    const year = fd.get('year') || '2020';
    const km = fd.get('km') || '48.000';
    const fuel = fd.get('fuel') || 'Flex';
    const transmission = fd.get('transmission') || 'Automatico';
    const price = fd.get('price') || '96900';
    const location = 'Sao Paulo - SP';
    const image = String(fd.get('image') || '').trim();

    return {
        title: String(title),
        brand: String(brand),
        specs: `${year}/${year} - ${km} km - ${fuel} - ${transmission}`,
        price: `R$ ${formatMoney(price)}`,
        location,
        image
    };
}

function updateFormPreview() {
    const form = document.getElementById('cadastroForm');
    if (!form) return;

    const preview = buildPreviewData(form);
    const previewTitle = document.getElementById('previewTitle');
    const previewSpecs = document.getElementById('previewSpecs');
    const previewPrice = document.getElementById('previewPrice');
    const previewLocation = document.getElementById('previewLocation');
    const previewImage = document.getElementById('previewImage');

    if (previewTitle) previewTitle.textContent = preview.title;
    if (previewSpecs) previewSpecs.textContent = preview.specs;
    if (previewPrice) previewPrice.textContent = preview.price;
    if (previewLocation) previewLocation.textContent = preview.location;
    if (previewImage) {
        previewImage.style.backgroundImage = preview.image ? `url('${preview.image}')` : '';
        previewImage.classList.toggle('has-image', Boolean(preview.image));
    }
}

function getPaginationInfo(totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    return { totalPages, start, end: start + PAGE_SIZE };
}

function renderPagination(totalItems) {
    const controls = document.getElementById('paginationControls');
    if (!controls) return;

    const { totalPages } = getPaginationInfo(totalItems);
    if (totalItems <= PAGE_SIZE) {
        controls.innerHTML = '';
        return;
    }

    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    controls.innerHTML = `
        <button class="pagination-btn" data-page="${currentPage - 1}" ${prevDisabled}>Anterior</button>
        <span class="pagination-status">Página ${currentPage} de ${totalPages}</span>
        <button class="pagination-btn" data-page="${currentPage + 1}" ${nextDisabled}>Próxima</button>
    `;
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WKEY) || '[]');
    } catch {
        return [];
    }
}

function saveWishlist(arr) {
    localStorage.setItem(WKEY, JSON.stringify(arr));
}

function toggleWishlist(id) {
    const list = getWishlist();
    const sid = String(id);
    const idx = list.indexOf(sid);
    if (idx === -1) {
        if (list.length >= MAX_FAVORITES) {
            alert(`Limite de protótipo: Você pode favoritar apenas ${MAX_FAVORITES} veículos.`);
            return;
        }
        list.push(sid);
    }
    else list.splice(idx, 1);
    saveWishlist(list);
}

function isInWishlist(id) {
    return getWishlist().includes(String(id));
}

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const id = btn.dataset.id;
        const active = isInWishlist(id);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.textContent = active ? '♥' : 'Fav';
    });
}

function getFilteredVehicles() {
    const all = getVehicles();
    const search = (document.getElementById('searchInputMarca')?.value || document.getElementById('searchMarca')?.value || '').toLowerCase().trim();
    const priceMin = numericValue(document.getElementById('priceMin')?.value);
    const priceMaxRaw = document.getElementById('priceMax')?.value;
    const priceMax = priceMaxRaw ? numericValue(priceMaxRaw) : Infinity;
    const year = document.getElementById('filterYear')?.value || '';
    const transmission = document.getElementById('filterTransmission')?.value || '';
    const city = document.getElementById('filterCity')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'relevance';
    const marketplacePreset = getMarketplacePreset();

    let filtered = all.filter(v => {
        const title = (v.title || '').toLowerCase();
        const brand = (v.brand || '').toLowerCase();
        const price = numericValue(v.price);

        if (search) {
            if (!title.includes(search) && !brand.includes(search)) return false;
        }
        if (price && (price < priceMin || price > priceMax)) return false;
        if (year && String(v.year) !== String(year)) return false;
        if (transmission && v.transmission !== transmission) return false;
        if (city && v.location && !v.location.toLowerCase().includes(city.toLowerCase())) return false;
        if (!matchesMarketplacePreset(v, marketplacePreset)) return false;
        return true;
    });

    switch (sortBy) {
        case 'price-asc': filtered.sort((a,b) => numericValue(a.price) - numericValue(b.price)); break;
        case 'price-desc': filtered.sort((a,b) => numericValue(b.price) - numericValue(a.price)); break;
        case 'newest': filtered.sort((a,b) => (b.year||0) - (a.year||0)); break;
        default: break;
    }

    return filtered;
}

function renderMarketplace() {
    seedIfEmpty();
    const container = document.getElementById('vehiclesGrid');
    const countContainer = document.getElementById('resultCount');
    if (!container) return;

    const subtitle = document.querySelector('.marketplace-subtitle');
    const marketplacePreset = getMarketplacePreset();
    if (subtitle) {
        subtitle.textContent = marketplacePreset === '0km'
            ? 'Carros 0km.'
            : marketplacePreset === 'seminovos'
                ? 'Seminovos.'
                : 'Carros usados, novos e seminovos.';
    }

    const vehicles = getFilteredVehicles();
    if (countContainer) {
        countContainer.textContent = vehicles.length;
    }

    const { start, end } = getPaginationInfo(vehicles.length);

    container.innerHTML = '';
    vehicles.slice(start, end).forEach(v => {
        const card = document.createElement('article');
        card.className = 'marketplace-card';
        const locationDisplay = v.location || 'Sao Paulo - SP';

        card.innerHTML = `
            <div style="position: relative;">
                <img src="${v.image || 'https://via.placeholder.com/250x180'}" alt="${v.title}" class="marketplace-card-image">
                <button class="wishlist-btn" data-id="${v.id}" aria-label="Adicionar ${v.title} aos favoritos">Fav</button>
            </div>
            <div class="marketplace-card-content">
                <h3 class="marketplace-card-title">${v.title}</h3>
                <div class="marketplace-card-info">
                    <span class="marketplace-card-info-item">${v.year}</span>
                    <span class="marketplace-card-info-item">${formatKm(v.km)} km</span>
                </div>
                <div class="marketplace-card-price">R$ ${formatMoney(v.price)}</div>
                <div class="marketplace-card-details">
                    <span>${v.fuel || 'Flex'}</span> - <span>${v.transmission || 'Automatico'}</span>
                </div>
                <div class="marketplace-card-details" style="margin-bottom: 16px;">
                    ${locationDisplay}
                </div>
                <div class="marketplace-card-footer">
                    <small>${v.agency || 'Loja Credenciada'}</small>
                    <button class="btn btn-sm btn-outline-primary view-vehicle" data-id="${v.id}">Ver</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    updateWishlistButtons();
    renderPagination(vehicles.length);
}

function renderVehicleDetail(id) {
    const vehicles = getVehicles();
    const v = vehicles.find(x => String(x.id) === String(id));
    const container = document.getElementById('veiculo-detail');
    if (!container) return;

    if (!v) {
        container.innerHTML = '<section class="panel"><p>Veiculo nao encontrado.</p><a class="btn btn-dark" href="#marketplace">Voltar para lista</a></section>';
        return;
    }

    currentDetailGallery = getVehicleGallery(v);
    const session = getSession();
    const btnLabel = session ? 'Enviar mensagem' : 'Entre para contatar';

    container.innerHTML = `
        <div class="page-heading">
            <div>
                <p class="eyebrow">Veiculo publicado</p>
                <h2 id="veiculo-title">${v.title}</h2>
                <p>${v.location || 'Sao Paulo - SP'} - Loja credenciada</p>
            </div>
            <a class="btn btn-outline-dark" href="#marketplace">Voltar para lista</a>
        </div>
        <div class="vehicle-detail-page">
            <div class="vehicle-gallery">
                <img src="${v.image || 'https://via.placeholder.com/1200x700'}" alt="${v.title}">
                <div class="vehicle-thumbs"><span></span><span></span><span></span><span></span></div>
                <img id="vehicleMainImage" src="${currentDetailGallery[0] || v.image || 'https://via.placeholder.com/1200x700'}" alt="${v.title}">
                <div class="vehicle-thumbs" id="vehicleThumbs">
                    ${currentDetailGallery.map((image, index) => `<button type="button" class="vehicle-thumb-btn${index === 0 ? ' active' : ''}" data-image="${image}" aria-label="Ver imagem ${index + 1}"><img src="${image}" alt="Imagem ${index + 1} de ${v.title}"></button>`).join('')}
                </div>
            </div>
            <aside class="vehicle-summary">
                <section class="panel">
                    <h2>${v.title}</h2>
                    <p>${v.year}/${v.year} - ${formatKm(v.km)} km - ${v.fuel || 'Flex'} - ${v.transmission || 'Automatico'}</p>
                    <div class="vehicle-price-detail">R$ ${formatMoney(v.price)}</div>
                    <div class="spec-grid">
                        <div><span>Ano</span><strong>${v.year}</strong></div>
                        <div><span>Km</span><strong>${formatKm(v.km)}</strong></div>
                        <div><span>Cambio</span><strong>${v.transmission || '-'}</strong></div>
                        <div><span>Cor</span><strong>${v.color || 'Prata'}</strong></div>
                    </div>
                </section>
                <section class="panel">
                    <h3>Sobre o veiculo</h3>
                    <p>${v.description || 'Anuncio com informacoes completas, documentacao conferida e atendimento por agencia parceira.'}</p>
                    <span class="status-pill">Aceita troca</span>
                    <span class="status-pill">IPVA pago</span>
                </section>
                <section class="panel contact-card">
                    <h3>Contato da agencia</h3>
                    <strong>${v.agency || 'Auto Norte Multimarcas'}</strong>
                    <span>WhatsApp: (11) 99999-9999</span>
                    <span>Telefone: (11) 3333-3333</span>
                    <button class="btn btn-dark contact-agency-btn" data-agency="${v.agency || 'Auto Norte Multimarcas'}">${btnLabel}</button>
                </section>
            </aside>
        </div>
    `;
}

function renderAgencyApprovals() {
    const rows = document.getElementById('agencyApprovalRows');
    if (!rows) return;

    const agencies = [
        ['Auto Sul Motors', 'Curitiba / PR', 'Profissional', '14/05/2026'],
        ['Prime Veiculos', 'Belo Horizonte / MG', 'Basico', '14/05/2026'],
        ['Fast Car Multimarcas', 'Campinas / SP', 'Profissional', '13/05/2026'],
        ['Top Motors', 'Porto Alegre / RS', 'Premium', '13/05/2026'],
        ['Via Norte Veiculos', 'Manaus / AM', 'Basico', '12/05/2026']
    ];

    rows.innerHTML = agencies.map(([name, city, plan, date]) => `
        <tr>
            <td>${name}</td>
            <td>${city}</td>
            <td>${plan}</td>
            <td>${date}</td>
            <td><span class="status-pill">Pendente</span></td>
            <td>
                <button class="btn btn-sm btn-outline-dark">Aprovar</button>
                <button class="btn btn-sm btn-outline-dark">Ver cadastro</button>
            </td>
        </tr>
    `).join('');
}

function renderAdminList() {
    const container = document.getElementById('admin-list');
    if (!container) return;

    const vehicles = getVehicles();
    const vehicleCount = document.getElementById('adminVehicleCount');
    if (vehicleCount) {
        vehicleCount.textContent = vehicles.length.toLocaleString('pt-BR');
    }
    renderAgencyApprovals();

    container.innerHTML = vehicles.map(v => `
        <div class="admin-row-card">
            <div>
                <strong>${v.title}</strong>
                <p class="mb-0 text-muted">${v.agency || 'Auto Norte Multimarcas'} - ${v.year} - R$ ${formatMoney(v.price)}</p>
            </div>
            <div class="action-buttons">
                <a class="btn btn-sm btn-outline-dark" href="#veiculo-${v.id}">Ver</a>
                <button class="btn btn-sm btn-outline-dark edit-vehicle" data-id="${v.id}">Editar</button>
                <button class="btn btn-sm btn-danger delete-vehicle" data-id="${v.id}">Excluir</button>
            </div>
        </div>
    `).join('');
}

function renderLojistaDashboard() {
    const session = getSession();
    const container = document.getElementById('lojista');
    if (!container || !session) return;

    const allVehicles = getVehicles();
    const myVehicles = allVehicles.filter(v => v.agency === session.name || v.agency === 'Auto Norte Multimarcas');
    const myProposals = getProposals().filter(p => p.agency === session.name || p.agency === 'Auto Norte Multimarcas');
    const activeCount = myVehicles.length;
    const planLimit = 15;

    container.innerHTML = `
        <!-- Navegação Superior Estilo Wireframe -->
        <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3 mb-4">
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center" href="#inicio">
                    <div class="bg-light border p-2 me-2 d-flex align-items-center justify-content-center" style="width:45px;height:45px;border-radius:4px;">
                        <span style="font-size:1.2rem;">🏢</span>
                    </div>
                    <div>
                        <strong class="d-block" style="line-height:1.2; font-size:1.1rem;">${session.name}</strong>
                        <small class="text-muted" style="font-size:0.75rem; font-weight:600;">Agência</small>
                    </div>
                </a>
                <div class="ms-auto d-flex align-items-center gap-4">
                    <a href="#lojista" class="text-decoration-none text-dark fw-bold border-bottom border-dark border-2 pb-1">🚗 Meu Estoque</a>
                    <a href="#mensagens" class="text-decoration-none text-muted fw-semibold">💬 Mensagens <span class="badge bg-light text-dark border ms-1">${myProposals.length}</span></a>
                    <a href="#perfil" class="text-decoration-none text-muted fw-semibold">👤 Meu Perfil</a>
                    <a href="#inicio" id="logoutLojistaNav" class="text-decoration-none text-muted fw-semibold">↪️ Sair</a>
                </div>
            </div>
        </nav>

        <div class="container-fluid px-4">
            <!-- Cabeçalho de Boas-vindas -->
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h2 class="fw-bold mb-1" style="color: var(--color-primary);">Bem-vinda, Agência ${session.name}</h2>
                    <p class="text-muted">Acompanhe o desempenho dos seus anúncios e gerencie seu estoque.</p>
                </div>
                <a href="#cadastro-veiculo" class="btn btn-dark py-2 px-4 fw-bold">
                    <span class="me-2">+</span> Cadastrar Veículo
                </a>
            </div>

            <!-- Cards de Métricas -->
            <div class="row g-3 mb-5">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm p-3" style="border-radius:12px;">
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:48px;height:48px;">🚗</div>
                            <div>
                                <small class="text-muted d-block fw-semibold">Veículos Ativos</small>
                                <strong class="fs-4 d-block">${activeCount}</strong>
                                <small class="text-muted" style="font-size:0.75rem;">de ${planLimit} disponíveis</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm p-3" style="border-radius:12px;">
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:48px;height:48px;">👁️</div>
                            <div>
                                <small class="text-muted d-block fw-semibold">Visualizações no mês</small>
                                <strong class="fs-4 d-block">1.248</strong>
                                <small class="text-success fw-bold" style="font-size:0.75rem;">↗ +18% <span class="text-muted fw-normal">vs mês anterior</span></small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm p-3" style="border-radius:12px;">
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:48px;height:48px;">💬</div>
                            <div>
                                <small class="text-muted d-block fw-semibold">Mensagens recebidas</small>
                                <strong class="fs-4 d-block">${myProposals.length}</strong>
                                <small class="text-muted" style="font-size:0.75rem;">3 não lidas</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm p-3" style="border-radius:12px;">
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:48px;height:48px;">🛡️</div>
                            <div>
                                <small class="text-muted d-block fw-semibold">Status do Plano</small>
                                <strong class="fs-4 d-block">Profissional</strong>
                                <small class="text-muted" style="font-size:0.75rem;">Renova em 15/06/2026</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <!-- Tabela de Veículos (Lado Esquerdo) -->
                <div class="col-lg-9">
                    <div class="card border-0 shadow-sm border-radius-12 mb-4">
                        <div class="card-header bg-white border-0 py-4 px-4">
                            <h5 class="fw-bold mb-0">Meus Veículos</h5>
                        </div>
                        <div class="card-body px-4 pt-0">
                            <div class="d-flex gap-2 mb-4">
                                <input type="text" class="form-control w-25 shadow-none" placeholder="Buscar veículo">
                                <select class="form-select w-auto ms-auto shadow-none"><option>Status: Todos</option></select>
                                <select class="form-select w-auto shadow-none"><option>Ordenar: Mais recentes</option></select>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover align-middle border-top">
                                    <thead class="text-muted small text-uppercase fw-bold">
                                        <tr>
                                            <th>Veículo</th>
                                            <th>Ano</th>
                                            <th>Preço</th>
                                            <th>Status</th>
                                            <th>Visualizações</th>
                                            <th class="text-end">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${myVehicles.map(v => `
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center gap-3">
                                                        <img src="${v.image}" class="rounded shadow-sm" style="width:60px;height:40px;object-fit:cover;">
                                                        <div>
                                                            <div class="fw-bold text-dark">${v.title}</div>
                                                            <small class="text-muted">${v.fuel} • ${v.transmission}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="text-muted">${v.year}/${v.year}</td>
                                                <td class="fw-bold text-dark">R$ ${formatMoney(v.price)}</td>
                                                <td><span class="badge bg-success-soft text-success border px-3 py-2" style="background:#eef7f2; border-color:#d4e9df !important; border-radius:6px;">Ativo</span></td>
                                                <td class="text-muted">${Math.floor(Math.random() * 500)}</td>
                                                <td class="text-end">
                                                    <div class="d-flex gap-2 justify-content-end">
                                                        <button class="btn btn-outline-dark btn-sm px-3 edit-vehicle" data-id="${v.id}">Editar</button>
                                                        <button class="btn btn-light btn-sm border px-3">Pausar</button>
                                                        <button class="btn btn-light btn-sm border px-2">⋮</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Painéis Laterais (Lado Direito) -->
                <div class="col-lg-3">
                    <div class="card border-0 shadow-sm p-4 mb-4" style="border-radius:12px;">
                        <h6 class="fw-bold mb-3">Uso do Plano</h6>
                        <div class="d-flex justify-content-between mb-2">
                            <small class="fw-bold">${activeCount} / ${planLimit} anúncios</small>
                        </div>
                        <div class="progress mb-3" style="height: 10px; border-radius:5px;">
                            <div class="progress-bar bg-dark" style="width: ${(activeCount/planLimit)*100}%"></div>
                        </div>
                        <small class="text-muted d-block mb-3">Você pode cadastrar mais ${planLimit - activeCount} veículos.</small>
                        <button class="btn btn-outline-dark w-100 btn-sm fw-bold py-2">Ver detalhes do plano</button>
                    </div>

                    <div class="card border-0 shadow-sm p-4 mb-4" style="border-radius:12px;">
                        <h6 class="fw-bold mb-3">Atalhos Rápidos</h6>
                        <div class="d-grid gap-3">
                            <a href="#cadastro-veiculo" class="text-decoration-none text-dark small fw-semibold">+ Cadastrar Veículo</a>
                            <a href="#lojista" class="text-decoration-none text-dark small fw-semibold">🚗 Ver meu estoque</a>
                            <a href="#mensagens" class="text-decoration-none text-dark small fw-semibold">💬 Mensagens</a>
                            <a href="#desempenho" class="text-decoration-none text-dark small fw-semibold">📈 Desempenho</a>
                            <a href="#ajuda" class="text-decoration-none text-dark small fw-semibold">❓ Ajuda e Dúvidas</a>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm p-4 text-center" style="border-radius:12px; background: #fffaf5; border: 1px solid #ffe8d1 !important;">
                        <div class="mb-2" style="font-size:1.5rem;">💡</div>
                        <h6 class="fw-bold mb-2">Dicas para vender mais</h6>
                        <p class="small text-muted mb-3">Complete todas as informações do seu veículo e adicione boas fotos.</p>
                        <button class="btn btn-outline-dark btn-sm w-100 fw-bold">Ver dicas</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('logoutLojistaNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        syncLoginState();
        location.hash = '#inicio';
    });
}

function initForms() {
    const anuncieForm = document.getElementById('anuncieForm');
    if (anuncieForm) {
        anuncieForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(anuncieForm);
            const email = String(fd.get('email') || '').trim();
            const role = String(fd.get('role') || 'client');
            const sessionRole = role === 'seller' ? 'seller' : 'client';
            saveSession({ 
                role: sessionRole, 
                label: sessionRole === 'seller' ? 'Lojista' : 'Cliente', 
                email: email,
                name: email.split('@')[0], // Nome provisório baseado no e-mail
                image: null 
            });
            syncLoginState();
            // redirect according to role
            if (sessionRole === 'seller') location.hash = '#lojista';
            else location.hash = '#cliente';
        });
    }

    const cadastroContaForm = document.getElementById('cadastroContaForm');
    if (cadastroContaForm) {
        cadastroContaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(cadastroContaForm);
            const password = String(fd.get('password') || '');
            const confirmPassword = String(fd.get('confirmPassword') || '');

            const clients = getClients();
            const role = String(fd.get('role') || 'seller');
            if (role === 'client' && clients.length >= MAX_CLIENTS) {
                alert('Limite de 5 clientes atingido para este protótipo.');
                return;
            }

            if (password !== confirmPassword) {
                cadastroContaForm.querySelector('#cadastroConfirmacao')?.setCustomValidity('As senhas precisam ser iguais.');
                cadastroContaForm.reportValidity();
                cadastroContaForm.querySelector('#cadastroConfirmacao')?.setCustomValidity('');
                return;
            }

            const firstName = String(fd.get('firstName') || '').trim();
            const lastName = String(fd.get('lastName') || '').trim();
            const email = String(fd.get('email') || '').trim();
            const sessionRole = role === 'seller' ? 'seller' : 'client';

            const newUser = {
                role: sessionRole,
                label: sessionRole === 'seller' ? 'Lojista' : 'Cliente',
                name: `${firstName} ${lastName}`.trim(),
                email,
                image: null
            };

            if (sessionRole === 'client') {
                clients.push(newUser);
                saveClients(clients);
            }

            saveSession(newUser);
            syncLoginState();
            // redirect according to chosen role
            if (sessionRole === 'seller') location.hash = '#lojista';
            else location.hash = '#cliente';
        });
    }

    const cadastreLojaForm = document.getElementById('cadastreLojaForm');
    if (cadastreLojaForm) {
        cadastreLojaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(cadastreLojaForm);
            const obj = Object.fromEntries(fd.entries());
            // basic required validation handled by HTML, but ensure trimming
            obj.id = `store-${Date.now()}`;
            obj.registeredAt = new Date().toISOString();

            try {
                const key = 'buscarauto_stores_v1';
                const existing = JSON.parse(localStorage.getItem(key) || '[]');
                existing.unshift(obj);
                localStorage.setItem(key, JSON.stringify(existing));
            } catch (err) {
                console.error('Erro salvando loja', err);
            }

            // feedback simples e redirecionamento
            alert('Cadastro enviado com sucesso. Em breve nossa equipe entrará em contato.');
            location.hash = '#marketplace';
        });
    }

    const form = document.getElementById('cadastroForm');
    if (form) {
        updateFormPreview();
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const obj = Object.fromEntries(fd.entries());
            const editId = form.dataset.editId;
            
            obj.features = fd.getAll('features');
            obj.agency = 'Auto Norte Multimarcas';
            obj.location = 'Sao Paulo - SP';

            const slots = document.querySelectorAll('.photo-strip > div:not(.upload-tile)');
            const gallery = [];
            slots.forEach(slot => {
                const bg = slot.style.backgroundImage;
                if (bg) {
                    const url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                    gallery.push(url);
                }
            });
            obj.gallery = gallery;

            let vehicles = getVehicles();

            if (editId) {
                obj.id = editId;
                vehicles = vehicles.map(v => String(v.id) === String(editId) ? { ...v, ...obj } : v);
                delete form.dataset.editId;
                form.querySelector('button[type="submit"]').textContent = 'Publicar anuncio';
            } else {
                obj.id = Date.now();
                if (!obj.image && gallery.length > 0) obj.image = gallery[0];
                vehicles.unshift(obj);
            }

            saveVehicles(vehicles);
            
            form.reset();
            slots.forEach(slot => {
                slot.style.backgroundImage = '';
                slot.innerHTML = '';
            });

            renderMarketplace();
            location.hash = '#marketplace';
        });

        const uploadTile = document.getElementById('uploadTile');
        const fileInput = document.getElementById('vehicleImageFile');
        const imageInput = form.querySelector('input[name="image"]');

        if (uploadTile && fileInput) {
            uploadTile.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const originalText = uploadTile.textContent;
                    uploadTile.textContent = 'Enviando...';
                    try {
                        const result = await uploadParaCloudinary(file);
                        if (result.secure_url) {
                            // Encontrar a primeira caixa vazia para mostrar a imagem na Seção 3
                            const slots = document.querySelectorAll('.photo-strip > div:not(.upload-tile)');
                            for (let slot of slots) {
                                if (!slot.style.backgroundImage) {
                                    slot.style.backgroundImage = `url('${result.secure_url}')`;
                                    slot.style.backgroundSize = 'cover';
                                    slot.style.backgroundPosition = 'center';
                                    slot.style.position = 'relative';
                                    slot.innerHTML = '<button type="button" class="remove-img-btn" style="position:absolute; top:2px; right:2px; background:rgba(255,0,0,0.7); color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;">&times;</button>';
                                    break;
                                }
                            }

                            if (imageInput) {
                                if (!imageInput.value) imageInput.value = result.secure_url;
                                imageInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    } catch (err) {
                        console.error('Erro ao carregar para Cloudinary:', err);
                        alert('Ocorreu um erro ao carregar a imagem. Verifique a conexão.');
                    } finally {
                        uploadTile.textContent = originalText;
                    }
                }
            });
        }
    }

    // attach preview update handlers to the cadastro form
    if (form) {
        ['input', 'change'].forEach(eventName => {
            form.addEventListener(eventName, updateFormPreview);
        });
    }

    // Filters & controls: re-render on change
    ['searchInputMarca','searchMarca','priceMin','priceMax','filterYear','filterTransmission','filterCity','sortBy'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const ev = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? 'input' : 'change';
        el.addEventListener(ev, () => {
            currentPage = 1;
            renderMarketplace();
        });
    });

    document.getElementById('clearFilters')?.addEventListener('click', (e) => {
        e.preventDefault();
        // reset known controls
        ['searchInputMarca','searchMarca','priceMin','priceMax','filterYear','filterTransmission','filterCity','sortBy'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
        currentPage = 1;
        renderMarketplace();
    });

    document.getElementById('loginDropdown')?.addEventListener('click', (e) => {
        const item = e.target.closest('a');
        if (!item) return;

        const href = item.getAttribute('href');
        if (item.id === 'logoutSessionLink') {
            e.preventDefault();
            clearSession();
            syncLoginState();
            location.hash = '#inicio';
            return;
        }

        if (href === '#cliente' || href === '#lojista' || href === '#cadastro-veiculo' || href === '#admin') {
            setSessionFromHref(href);
        }
    });

    document.getElementById('paginationControls')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        const nextPage = Number(btn.dataset.page);
        if (Number.isNaN(nextPage)) return;
        currentPage = nextPage;
        renderMarketplace();
    });

    document.body.addEventListener('click', (e) => {
        const thumbBtn = e.target.closest('.vehicle-thumb-btn');
        if (thumbBtn) {
            const mainImage = document.getElementById('vehicleMainImage');
            if (mainImage && thumbBtn.dataset.image) {
                mainImage.src = thumbBtn.dataset.image;
                document.querySelectorAll('.vehicle-thumb-btn').forEach(btn => btn.classList.remove('active'));
                thumbBtn.classList.add('active');
            }
            return;
        }

        const contactBtn = e.target.closest('.contact-agency-btn');
        if (contactBtn) {
            const session = getSession();
            if (!session) {
                location.hash = '#anuncie';
                return;
            }
            
            const agency = contactBtn.dataset.agency;
            const vehicleTitle = document.getElementById('veiculo-title')?.textContent || 'Veículo';
            const proposals = getProposals();
            proposals.push({
                id: Date.now(),
                clientEmail: session.email,
                agency: agency,
                message: `Olá, tenho interesse no veículo ${vehicleTitle}. Por favor, entre em contato.`,
                date: new Date().toLocaleDateString()
            });
            saveProposals(proposals);
            alert(`Sua proposta para "${vehicleTitle}" foi enviada com sucesso!`);
            location.hash = '#cliente';
            return;
        }

        const wishBtn = e.target.closest('.wishlist-btn');
        if (wishBtn) {
            e.preventDefault();
            toggleWishlist(wishBtn.dataset.id);
            updateWishlistButtons();
            return;
        }

        const removeImgBtn = e.target.closest('.remove-img-btn');
        if (removeImgBtn) {
            const slot = removeImgBtn.parentElement;
            slot.style.backgroundImage = '';
            slot.innerHTML = '';
            updateFormPreview();
            return;
        }

        const editBtn = e.target.closest('.edit-vehicle');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const v = getVehicles().find(x => String(x.id) === String(id));
            if (v) {
                location.hash = '#cadastro-veiculo';
                const form = document.getElementById('cadastroForm');
                form.dataset.editId = v.id;
                
                // Preencher campos simples
                Object.keys(v).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input && input.type !== 'checkbox' && input.type !== 'file') {
                        input.value = v[key];
                    }
                });

                // Preencher checkboxes de features
                const features = v.features || [];
                form.querySelectorAll('input[name="features"]').forEach(ck => {
                    ck.checked = features.includes(ck.value);
                });

                form.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
                updateFormPreview();
            }
            return;
        }

        const viewBtn = e.target.closest('.view-vehicle');
        if (viewBtn) {
            location.hash = `#veiculo-${viewBtn.dataset.id}`;
            return;
        }

        const delBtn = e.target.closest('.delete-vehicle');
        if (delBtn) {
            const id = delBtn.dataset.id;
            const vehicles = getVehicles().filter(v => String(v.id) !== String(id));
            saveVehicles(vehicles);
            renderAdminList();
            renderMarketplace();
            return;
        }
    });
}

function renderClientDashboard() {
    const session = getSession();
    const container = document.getElementById('cliente'); 
    if (!container || !session) return;

    const wishlist = getWishlist();
    const allVehicles = getVehicles();
    const favVehicles = allVehicles.filter(v => wishlist.includes(String(v.id)));
    const favAgencies = [...new Set(favVehicles.map(v => v.agency || 'Auto Norte Multimarcas'))];
    const myProposals = getProposals().filter(p => p.clientEmail === session.email);
    const displayName = session.name || 'Usuário';

    container.innerHTML = `
        <div class="app-shell">
            <aside class="app-sidebar">
                <div class="app-brand-card">
                    <div class="avatar" id="profileAvatarDisplay">${session.image ? `<img src="${session.image}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : displayName[0].toUpperCase()}</div>
                    <div>
                        <strong>${displayName}</strong>
                        <small>${session.email}</small>
                    </div>
                </div>
                <nav>
                    <a href="#cliente" class="active">Meu Painel</a>
                    <a href="#marketplace">Buscar Veículos</a>
                    <a href="#inicio" id="logoutDashboard">Sair</a>
                </nav>
            </aside>

            <main class="app-main">
                <div class="page-heading">
                    <h2>Olá, ${displayName.split(' ')[0]}</h2>
                    <p>Gerencie seu perfil, favoritos e propostas.</p>
                </div>

                <div class="two-column-layout">
                    <section class="panel">
                        <div class="panel-header">
                            <h3>Editar Perfil</h3>
                        </div>
                        <form id="editProfileForm" class="auth-form">
                            <div class="auth-field">
                                <label>Foto de Perfil</label>
                                <input type="file" id="profilePhotoInput" class="form-control" accept="image/*">
                            </div>
                            <div class="auth-field">
                                <label>Nome Completo</label>
                                <input type="text" name="name" value="${displayName}" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-dark w-100">Atualizar Perfil</button>
                        </form>
                    </section>

                    <section class="panel">
                        <div class="panel-header">
                            <h3>Nova Proposta</h3>
                        </div>
                        <form id="proposalForm" class="auth-form">
                            <div class="auth-field">
                                <label>Lojista (Favoritados)</label>
                                <select name="agency" class="form-select" required>
                                    <option value="">Selecione uma loja...</option>
                                    ${favAgencies.map(a => `<option value="${a}">${a}</option>`).join('')}
                                </select>
                            </div>
                            <div class="auth-field">
                                <label>Mensagem</label>
                                <textarea name="message" class="form-control" placeholder="Tenho interesse no veículo..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100" ${favAgencies.length === 0 ? 'disabled' : ''}>
                                ${favAgencies.length === 0 ? 'Favorite um carro primeiro' : 'Enviar Proposta'}
                            </button>
                        </form>
                    </section>
                </div>

                <div class="two-column-layout">
                    <section class="panel">
                        <h3>Minhas Mensagens</h3>
                        <div class="activity-list" style="margin-top:15px;">
                            ${myProposals.length ? myProposals.map(p => `
                                <li>
                                    <div class="d-flex justify-content-between">
                                        <strong>Para: ${p.agency}</strong>
                                        <small class="status-pill">Respondida</small>
                                    </div>
                                    <p class="mb-1"><em>Sua proposta: ${p.message}</em></p>
                                    <p class="text-success"><strong>Loja:</strong> Olá! Recebemos sua proposta. O veículo está disponível para teste. Quando podemos agendar?</p>
                                </li>
                            `).join('') : '<p class="muted">Nenhuma proposta enviada.</p>'}
                        </div>
                    </section>

                    <section class="panel">
                        <h3>Favoritos (${wishlist.length}/${MAX_FAVORITES})</h3>
                        <div class="saved-vehicles" style="margin-top:15px;">
                            ${favVehicles.map(v => `
                                <article>
                                    <img src="${v.image}" alt="">
                                    <div>
                                        <strong>${v.title}</strong>
                                        <span>R$ ${formatMoney(v.price)}</span>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    `;

    // Eventos do Painel
    document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        const newName = e.target.name.value.trim();
        const fileInput = document.getElementById('profilePhotoInput');
        let imageUrl = session.image;

        if (fileInput.files[0]) {
            const res = await uploadParaCloudinary(fileInput.files[0]);
            imageUrl = res.secure_url;
        }

        const updatedSession = { ...session, name: newName, image: imageUrl };
        saveSession(updatedSession);
        
        const clients = getClients().map(c => c.email === session.email ? updatedSession : c);
        saveClients(clients);
        
        alert('Perfil atualizado!');
        syncLoginState();
        // Pequeno delay para garantir que o DOM atualize
        renderClientDashboard();
    });

    document.getElementById('proposalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const proposals = getProposals();
        proposals.push({
            id: Date.now(),
            clientEmail: session.email,
            agency: fd.get('agency'),
            message: fd.get('message'),
            date: new Date().toLocaleDateString()
        });
        saveProposals(proposals);
        alert('Proposta enviada com sucesso!');
        e.target.reset();
        renderClientDashboard();
    });

    document.getElementById('logoutDashboard')?.addEventListener('click', () => {
        clearSession();
        syncLoginState();
    });
}

function setLandingVisible(isVisible) {
    document.querySelectorAll('.hero, .marketplace-section').forEach(section => {
        section.toggleAttribute('hidden', !isVisible);
    });
}

function showView(id) {
    setLandingVisible(false);
    document.querySelectorAll('section.view').forEach(s => {
        if (s.id === id) {
            s.removeAttribute('hidden');
        } else {
            s.setAttribute('hidden', '');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLanding() {
    document.querySelectorAll('section.view').forEach(s => s.setAttribute('hidden', ''));
    setLandingVisible(true);
}

function router() {
    const hash = location.hash || '#inicio';

    if (hash.startsWith('#veiculo-')) {
        const id = hash.replace('#veiculo-', '');
        showView('visualizacao-veiculo');
        renderVehicleDetail(id);
        return;
    }

    switch (hash) {
        case '#inicio':
            renderMarketplace();
            showLanding();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case '#marketplace':
        case '#marketplace-todos':
        case '#destaques':
        case '#particular':
        case '#lojas-credenciadas':
        case '#marketplace-0km':
        case '#marketplace-seminovos':
            seedIfEmpty();
            renderMarketplace();
            showLanding();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case '#cadastro':
        case '#cadastro-veiculo':
            showView('cadastro-veiculo');
            break;
        case '#anuncie':
            showView('anuncie'); // Agora redireciona para a tela de login/auth
            break;
        case '#lojas-especializadas':
        case '#cadastre-loja':
            showView('cadastre-loja');
            break;
        case '#criar-conta':
            showView('criar-conta');
            break;
        case '#admin':
            setSessionFromHref('#admin');
            showView('admin');
            renderAdminList();
            break;
        case '#lojista':
            setSessionFromHref('#lojista');
            showView('lojista');
            renderLojistaDashboard();
            break;
        case '#cliente':
            setSessionFromHref('#cliente');
            showView('cliente');
            renderClientDashboard();
            break;
        case '#sobre':
            showView('sobre');
            break;
        default:
            showLanding();
    }
}

function initRouter() {
    window.addEventListener('hashchange', router);
    seedIfEmpty();
    renderMarketplace();
    router();
}
