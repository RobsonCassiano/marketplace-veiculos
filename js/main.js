import animation from './animation.js';

document.addEventListener('DOMContentLoaded', () => {
    animation();
<<<<<<< HEAD
=======
    syncLoginState();
>>>>>>> 309e7ad (Ajuste dos links)
    initAccessibility();
    initRouter();
    initForms();
});

const VKEY = 'buscarauto_vehicles_v1';
const ACCESSIBILITY_KEY = 'buscarauto_accessibility_v1';
const DEFAULT_ACCESSIBILITY = { fontSize: 100, highContrast: false };
<<<<<<< HEAD
=======
const WKEY = 'buscarauto_wishlist_v1';
const SESSION_KEY = 'buscarauto_session_v1';
const PAGE_SIZE = 4;
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
    if (hash === '#marketplace-usados') return 'usados';
    if (hash === '#marketplace-seminovos') return 'seminovos';
    return null;
}

function matchesMarketplacePreset(vehicle, preset) {
    if (!preset) return true;

    const km = numericValue(vehicle.km);
    const year = Number(vehicle.year || 0);

    if (preset === '0km') {
        return km <= 1000 || (year >= 2023 && km <= 15000);
    }

    if (preset === 'usados') {
        return km > 1000 && (km >= 50000 || year <= 2020);
    }

    if (preset === 'seminovos') {
        return km > 1000 && km < 50000 && year >= 2021 && year <= 2024;
    }

    return true;
}
>>>>>>> 309e7ad (Ajuste dos links)

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
<<<<<<< HEAD
    if (v.some(vehicle => vehicle.id === 'seed-corolla')) return;
    saveVehicles(v.length ? [...seed, ...v] : seed);
}

=======
    if (v.some(vehicle => vehicle.id === 'seed-corolla')) {
        if (!v.some(vehicle => vehicle.id === 'seed-camaro')) {
            saveVehicles([seed[0], ...v]);
        }
        return;
    }
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
    }
    if (logout) {
        logout.hidden = !session;
    }
    if (dropdown && !session) {
        dropdown.classList.remove('session-active');
    }
}

function setSessionFromHref(href) {
    if (href === '#cliente') saveSession({ role: 'client', label: 'Cliente' });
    if (href === '#cadastro-veiculo') saveSession({ role: 'seller', label: 'Lojista' });
    if (href === '#admin') saveSession({ role: 'admin', label: 'Admin' });
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
    if (idx === -1) list.push(sid);
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

>>>>>>> 309e7ad (Ajuste dos links)
function renderMarketplace() {
    seedIfEmpty();
    const container = document.getElementById('vehiclesGrid');
    const countContainer = document.getElementById('resultCount');
<<<<<<< HEAD
    if (!container) return;

    const vehicles = getVehicles();
=======
    const subtitle = document.querySelector('.marketplace-subtitle');
    if (!container) return;

    const marketplacePreset = getMarketplacePreset();
    if (subtitle) {
        subtitle.textContent = marketplacePreset === '0km'
            ? 'Carros 0km.'
            : marketplacePreset === 'usados'
                ? 'Carros usados.'
                : marketplacePreset === 'seminovos'
                    ? 'Seminovos.'
                    : 'Carros usados, novos e seminovos.';
    }

    const vehicles = getFilteredVehicles();
>>>>>>> 309e7ad (Ajuste dos links)
    if (countContainer) {
        countContainer.textContent = vehicles.length;
    }

<<<<<<< HEAD
    container.innerHTML = '';
    vehicles.slice(0, 8).forEach(v => {
=======
    const { start, end } = getPaginationInfo(vehicles.length);

    container.innerHTML = '';
    vehicles.slice(start, end).forEach(v => {
>>>>>>> 309e7ad (Ajuste dos links)
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
<<<<<<< HEAD
=======
    updateWishlistButtons();
    renderPagination(vehicles.length);
>>>>>>> 309e7ad (Ajuste dos links)
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

<<<<<<< HEAD
=======
    currentDetailGallery = getVehicleGallery(v);

>>>>>>> 309e7ad (Ajuste dos links)
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
<<<<<<< HEAD
                <img src="${v.image || 'https://via.placeholder.com/1200x700'}" alt="${v.title}">
                <div class="vehicle-thumbs"><span></span><span></span><span></span><span></span></div>
=======
                <img id="vehicleMainImage" src="${currentDetailGallery[0] || v.image || 'https://via.placeholder.com/1200x700'}" alt="${v.title}">
                <div class="vehicle-thumbs" id="vehicleThumbs">
                    ${currentDetailGallery.map((image, index) => `<button type="button" class="vehicle-thumb-btn${index === 0 ? ' active' : ''}" data-image="${image}" aria-label="Ver imagem ${index + 1}"><img src="${image}" alt="Imagem ${index + 1} de ${v.title}"></button>`).join('')}
                </div>
>>>>>>> 309e7ad (Ajuste dos links)
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
                    <button class="btn btn-dark">Enviar mensagem</button>
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
                <button class="btn btn-sm btn-danger delete-vehicle" data-id="${v.id}">Excluir</button>
            </div>
        </div>
    `).join('');
}

function initForms() {
<<<<<<< HEAD
    const form = document.getElementById('cadastroForm');
    if (form) {
=======
    const anuncieForm = document.getElementById('anuncieForm');
    if (anuncieForm) {
        anuncieForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(anuncieForm);
            const email = String(fd.get('email') || '').trim();
            const role = String(fd.get('role') || 'client');
            const sessionRole = role === 'seller' ? 'seller' : 'client';
            saveSession({ role: sessionRole, label: sessionRole === 'seller' ? 'Lojista' : 'Cliente', email });
            syncLoginState();
            // redirect according to role
            if (sessionRole === 'seller') location.hash = '#cadastro-veiculo';
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

            if (password !== confirmPassword) {
                cadastroContaForm.querySelector('#cadastroConfirmacao')?.setCustomValidity('As senhas precisam ser iguais.');
                cadastroContaForm.reportValidity();
                cadastroContaForm.querySelector('#cadastroConfirmacao')?.setCustomValidity('');
                return;
            }

            const firstName = String(fd.get('firstName') || '').trim();
            const lastName = String(fd.get('lastName') || '').trim();
            const email = String(fd.get('email') || '').trim();
            const role = String(fd.get('role') || 'seller');
            const sessionRole = role === 'seller' ? 'seller' : 'client';

            saveSession({
                role: sessionRole,
                label: sessionRole === 'seller' ? 'Lojista' : 'Cliente',
                name: `${firstName} ${lastName}`.trim(),
                email
            });
            syncLoginState();
            // redirect according to chosen role
            if (sessionRole === 'seller') location.hash = '#cadastro-veiculo';
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
>>>>>>> 309e7ad (Ajuste dos links)
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const obj = Object.fromEntries(fd.entries());
            obj.features = fd.getAll('features');
            obj.id = Date.now();
            obj.agency = 'Auto Norte Multimarcas';
            obj.location = 'Sao Paulo - SP';

            const vehicles = getVehicles();
            vehicles.unshift(obj);
            saveVehicles(vehicles);
            form.reset();
            renderMarketplace();
            location.hash = `#veiculo-${obj.id}`;
        });
<<<<<<< HEAD
    }

    document.body.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-vehicle');
        if (viewBtn) {
            location.hash = `#veiculo-${viewBtn.dataset.id}`;
=======

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
            return;
        }

        if (href === '#cliente' || href === '#cadastro-veiculo' || href === '#admin') {
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

        const wishBtn = e.target.closest('.wishlist-btn');
        if (wishBtn) {
            e.preventDefault();
            toggleWishlist(wishBtn.dataset.id);
            updateWishlistButtons();
            return;
        }

        const viewBtn = e.target.closest('.view-vehicle');
        if (viewBtn) {
            location.hash = `#veiculo-${viewBtn.dataset.id}`;
            return;
>>>>>>> 309e7ad (Ajuste dos links)
        }

        const delBtn = e.target.closest('.delete-vehicle');
        if (delBtn) {
            const id = delBtn.dataset.id;
            const vehicles = getVehicles().filter(v => String(v.id) !== String(id));
            saveVehicles(vehicles);
            renderAdminList();
            renderMarketplace();
<<<<<<< HEAD
=======
            return;
>>>>>>> 309e7ad (Ajuste dos links)
        }
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
            showLanding();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case '#marketplace':
        case '#destaques':
<<<<<<< HEAD
        case '#particular':
        case '#lojas-credenciadas':
=======
        case '#marketplace-0km':
        case '#marketplace-usados':
        case '#marketplace-seminovos':
>>>>>>> 309e7ad (Ajuste dos links)
            seedIfEmpty();
            renderMarketplace();
            showLanding();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case '#cadastro':
<<<<<<< HEAD
        case '#cadastro-veiculo':
        case '#anuncie':
        case '#lojas-especializadas':
        case '#cadastre-loja':
            showView('cadastro-veiculo');
            break;
        case '#admin':
=======
        case '#anuncie':
            showView('anuncie');
            break;
        case '#criar-conta':
            showView('criar-conta');
            break;
        case '#cadastro-veiculo':
        case '#lojas-especializadas':
            setSessionFromHref('#cadastro-veiculo');
            showView('cadastro-veiculo');
            break;
        case '#cadastre-loja':
            showView('cadastre-loja');
            break;
        case '#admin':
            setSessionFromHref('#admin');
>>>>>>> 309e7ad (Ajuste dos links)
            showView('admin');
            renderAdminList();
            break;
        case '#cliente':
<<<<<<< HEAD
=======
            setSessionFromHref('#cliente');
>>>>>>> 309e7ad (Ajuste dos links)
            showView('cliente');
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
