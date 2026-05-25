import animation from './animation.js';

document.addEventListener('DOMContentLoaded', () => {
    animation();
    initAccessibility();
    initRouter();
    initForms();
});

const VKEY = 'buscarauto_vehicles_v1';
const ACCESSIBILITY_KEY = 'buscarauto_accessibility_v1';
const DEFAULT_ACCESSIBILITY = { fontSize: 100, highContrast: false };

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

function renderMarketplace() {
    seedIfEmpty();
    const container = document.getElementById('vehiclesGrid');
    const countContainer = document.getElementById('resultCount');
    if (!container) return;

    const vehicles = getVehicles();
    if (countContainer) {
        countContainer.textContent = vehicles.length;
    }

    container.innerHTML = '';
    vehicles.slice(0, 8).forEach(v => {
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
    const form = document.getElementById('cadastroForm');
    if (form) {
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
    }

    document.body.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-vehicle');
        if (viewBtn) {
            location.hash = `#veiculo-${viewBtn.dataset.id}`;
        }

        const delBtn = e.target.closest('.delete-vehicle');
        if (delBtn) {
            const id = delBtn.dataset.id;
            const vehicles = getVehicles().filter(v => String(v.id) !== String(id));
            saveVehicles(vehicles);
            renderAdminList();
            renderMarketplace();
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
        case '#particular':
        case '#lojas-credenciadas':
            seedIfEmpty();
            renderMarketplace();
            showLanding();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case '#cadastro':
        case '#cadastro-veiculo':
        case '#anuncie':
        case '#lojas-especializadas':
        case '#cadastre-loja':
            showView('cadastro-veiculo');
            break;
        case '#admin':
            showView('admin');
            renderAdminList();
            break;
        case '#cliente':
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
