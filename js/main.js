import animation from './animation.js';
import { uploadParaCloudinary } from './cloudinary.js';
import * as db from './db.js';
import { CarCard } from './CarCard.js';

document.addEventListener('DOMContentLoaded', () => {
    animation();
    initAccessibility();
    initForms();
    initRoleOptionHighlighting();
    initVehicleLogic();
    initFinanceSimulator();
    initInsuranceSimulator();
    initRouter();
    initNotificationSystem();
    initNavigationHelper();
    initBackToTop();
});

const VKEY = 'buscarauto_vehicles_v1';
const ACCESSIBILITY_KEY = 'buscarauto_accessibility_v1';
const DEFAULT_ACCESSIBILITY = { fontSize: 100, highContrast: false };
const WKEY = 'buscarauto_wishlist_v1';
const SESSION_KEY = 'buscarauto_session_v1';
const CLIENTS_KEY = 'buscarauto_clients_v1';
const PROPOSALS_KEY = 'buscarauto_proposals_v1';
const REPORTS_KEY = 'buscarauto_reports_v1';
const LOGS_KEY = 'buscarauto_admin_logs_v1';
const STORES_KEY = 'buscarauto_stores_v1';
const INSURANCE_LEADS_KEY = 'buscarauto_insurance_leads_v1';
const FINANCE_LEADS_KEY = 'buscarauto_finance_leads_v1';
const MAX_CLIENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes
const MAX_FAVORITES = 3;
const PAGE_SIZE = 9;
const MOCK_STORE_LOGINS = [
    { id: 'store-1', storeName: 'Auto Norte Multimarcas', email: 'contato@autonorte.com', password: 'AutoNorte@123', city: 'Sao Paulo', state: 'SP', address: 'Av. Engenheiro Caetano Álvares, 5000' },
    { id: 'store-2', storeName: 'Prime Veiculos', email: 'contato@primeveiculos.com', password: 'Prime@123', city: 'Curitiba', state: 'PR', address: 'Rua General Mário Tourinho, 1500' },
    { id: 'store-3', storeName: 'BH Motors', email: 'contato@bhmotors.com', password: 'BHMotors@123', city: 'Belo Horizonte', state: 'MG', address: 'Av. Raja Gabáglia, 2000' },
    { id: 'store-4', storeName: 'Fast Car Multimarcas', email: 'contato@fastcar.com', password: 'FastCar@123', city: 'Campinas', state: 'SP', address: 'Av. José de Souza Campos, 800' },
    { id: 'store-5', storeName: 'Top Motors', email: 'contato@topmotors.com', password: 'TopMotors@123', city: 'Porto Alegre', state: 'RS', address: 'Av. Ipiranga, 3000' },
    { id: 'store-6', storeName: 'Via Norte Veiculos', email: 'contato@vianorte.com', password: 'ViaNorte@123', city: 'Manaus', state: 'AM', address: 'Av. Rodrigo Otávio, 500' },
    { id: 'store-7', storeName: 'Auto Leste', email: 'contato@autoleste.com', password: 'AutoLeste@123', city: 'Sao Paulo', state: 'SP', address: 'Av. Aricanduva, 5555' }
];
const REGION_STATES = {
    Sudeste: ['SP', 'RJ', 'MG', 'ES'],
    Sul: ['PR', 'SC', 'RS'],
    Nordeste: ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'],
    'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
    Norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO']
};
const DEFAULT_GALLERY = [
    'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/galeria-1.jpg',
    'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/galeria-2.jpg',
    'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/galeria-3.jpg',
    'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/galeria-4.jpg'
];

let currentPage = 1;
let currentDetailGallery = [];
let activeChatId = null;
let redirectAfterLogin = null;
let adminUserPage = 1;
let adminUserSort = 'name-asc';
let adminUserFilterActiveOnly = false;
let userToBan = null;
let currentReportPeriod = 30; // Padrão: 30 dias

/**
 * Controle da Barra de Progresso Global
 */
let progressInterval;
function startLoading() {
    const bar = document.getElementById('globalProgress');
    if (!bar) return;
    clearInterval(progressInterval);
    bar.classList.add('loading');
    bar.style.width = '0%';
    let width = 0;
    progressInterval = setInterval(() => {
        if (width < 90) {
            width += (90 - width) * 0.1;
            bar.style.width = width + '%';
        }
    }, 150);
}

function stopLoading() {
    const bar = document.getElementById('globalProgress');
    if (!bar) return;
    clearInterval(progressInterval);
    bar.style.width = '100%';
    setTimeout(() => {
        bar.classList.remove('loading');
        setTimeout(() => { bar.style.width = '0%'; }, 400);
    }, 200);
}

/**
 * Renderiza HTML em um container usando <template> e .content
 */
function renderHTML(container, htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    container.replaceChildren(template.content);
}

/**
 * Gera o HTML de comparação percentual para KPIs
  */
function calculateGrowthHtml(currentValue, label = "últimos 30 dias") {
    // Simulação para o protótipo: gera uma variação entre -5% e +25%
    const randomFactor = (Math.random() * 30) - 5;
    const isPositive = randomFactor >= 0;
    const sign = isPositive ? '↑ +' : '↓ ';
    const colorClass = isPositive ? 'text-growth-up' : 'text-growth-down';
    
    return `<small class="metric-growth ${colorClass}">${sign}${Math.abs(randomFactor).toFixed(1)}% <span class="text-muted fw-normal">vs ${label}</span></small>`;
}

/**
 * Efeito Count-up para números nos Dashboards
 */
function animateCountUp(el, duration = 1000) {
    const finalValue = parseInt(el.innerText.replace(/\D/g, ''), 10);
    if (isNaN(finalValue) || finalValue === 0) return;

    const hasSmall = el.querySelector('small');
    const smallHtml = hasSmall ? hasSmall.outerHTML : '';

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * finalValue);
        
        const formatted = current.toLocaleString('pt-BR');
        el.innerHTML = hasSmall ? `${formatted}${smallHtml}` : formatted;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Utilitário para evitar múltiplas execuções rápidas (Debounce)
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Auxiliar para navegação SPA: Fecha menus mobile e dropdowns ao clicar em links
 */
function initNavigationHelper() {
    const mainNavbar = document.getElementById('mainNavbar');
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
        if (link.classList.contains('dropdown-toggle')) return;
        link.addEventListener('click', () => {
            // Fecha o collapse do Bootstrap se estiver aberto (mobile)
            if (mainNavbar && mainNavbar.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(mainNavbar);
                if (bsCollapse) bsCollapse.hide();
            }
            // Fecha dropdowns se houver algum aberto
            document.querySelectorAll('.dropdown-menu.show').forEach(dd => {
                dd.classList.remove('show');
            });
        });
    });
}

/**
 * Inicializa o botão Voltar ao Topo
 */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.remove('d-none');
        } else {
            btn.classList.add('d-none');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Sistema de Notificações em tempo real (Simulado via LocalStorage)
 */
function initNotificationSystem() {
    let lastProposalCount = getProposals().length;

    // Monitora mudanças no storage (útil para múltiplas abas)
    window.addEventListener('storage', (e) => {
        if (e.key === PROPOSALS_KEY) {
            checkForNewProposals();
        }
    });

    // Polling de curto intervalo para detectar mudanças na mesma aba
    setInterval(() => {
        const currentProposals = getProposals();
        if (currentProposals.length > lastProposalCount) {
            checkForNewProposals(currentProposals);
            lastProposalCount = currentProposals.length;
        }
    }, 3000);
}

function checkForNewProposals(proposals = getProposals()) {
    const session = getSession();
    if (!session || session.role !== 'seller') return;

    const myNewUnread = proposals.filter(p => p.recipientEmail === session.email && p.unread);
    if (myNewUnread.length > 0) {
        const latest = myNewUnread[0];
        showToast('Nova Proposta!', `Você recebeu um novo interesse no veículo: ${latest.message.split('veículo ')[1]?.split('.')[0] || 'do seu estoque'}.`);
        
        // Se o lojista estiver no dashboard, atualiza a contagem visual
        if (location.hash === '#lojista' || location.hash === '#mensagens' || location.hash === '#relatorios') {
            renderLojistaDashboard();
        }
    }
}

function showToast(title, body) {
    const toastEl = document.getElementById('notificationToast');
    if (!toastEl) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastBody').textContent = body;
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
}

/**
 * Abre o simulador de financiamento, opcionalmente com um preço pré-definido
 */
function openFinanceSimulator(price = null) {
    const modalEl = document.getElementById('financeModal');
    if (!modalEl) return;
    
    const inputValor = document.getElementById('valorVeiculo');
    if (price && inputValor) {
        inputValor.value = numericValue(price);
    }
    
    document.getElementById('financeResults')?.classList.add('d-none');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

/**
 * Inicializa a lógica do formulário de simulação
 */
function initFinanceSimulator() {
    const form = document.getElementById('financeForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const valorTotal = Number(document.getElementById('valorVeiculo').value);
        const valorEntrada = Number(document.getElementById('valorEntrada').value);
        const taxaJuros = Number(document.getElementById('taxaJuros').value) / 100;
        const prazo = Number(document.getElementById('prazoMeses').value);
        
        const valorFinanciado = valorTotal - valorEntrada;
        if (valorFinanciado <= 0) {
            alert("A entrada deve ser menor que o valor do veículo.");
            return;
        }

        // Cálculo (Tabela Price)
        let parcela = (valorFinanciado * taxaJuros) / (1 - Math.pow(1 + taxaJuros, -prazo));
        if (taxaJuros === 0) parcela = valorFinanciado / prazo;

        const totalPago = parcela * prazo;
        const totalJuros = totalPago - valorFinanciado;

        document.getElementById('resFinanciado').textContent = `R$ ${valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('resParcelas').textContent = `${prazo}x de R$ ${parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('resTotalPago').textContent = `R$ ${totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('resTotalJuros').textContent = `R$ ${totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('financeResults').classList.remove('d-none');
    });
}

/**
 * Abre cotação de seguro
 */
function openInsuranceModal(vehicleId = null) {
    const modalEl = document.getElementById('insuranceModal');
    if (!modalEl) return;

    const inputVeiculoId = document.getElementById('seguroVeiculoId');
    if (inputVeiculoId) inputVeiculoId.value = vehicleId || '';

    // Pré-preenchimento básico se o usuário estiver logado
    const session = getSession();
    if (session) {
        const nomeField = document.getElementById('nome');
        const emailField = document.getElementById('email');
        if (nomeField && !nomeField.value) nomeField.value = session.name || '';
        if (emailField && !emailField.value) emailField.value = session.email || '';
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

/**
 * Inicializa a lógica do formulário de seguro
 */
function initInsuranceSimulator() {
    const form = document.getElementById('formSeguro');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dados = {
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            cep: document.getElementById('cep').value,
            nascimento: document.getElementById('nascimento').value,
            condutor: document.getElementById('condutor').value,
            veiculoId: document.getElementById('seguroVeiculoId').value
        };

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        startLoading();

        // Simulação de delay de envio (1.5 segundos)
        await new Promise(resolve => setTimeout(resolve, 1500));

        stopLoading();
        btn.disabled = false;
        btn.textContent = originalText;

        // Persistência de Lead de Seguro para o Admin
        const insuranceLeads = getInsuranceLeads();
        insuranceLeads.unshift({
            id: Date.now(),
            ...dados,
            date: new Date().toLocaleString('pt-BR'),
            status: 'Pendente'
        });
        saveInsuranceLeads(insuranceLeads);

        console.log('Solicitação de Seguro:', dados);
        alert("Solicitação enviada. Um corretor entrará em contato.");
        
        bootstrap.Modal.getInstance(document.getElementById('insuranceModal'))?.hide();
        form.reset();
    });
}

/**
 * Redimensiona uma imagem usando Canvas antes do upload
 */
async function resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                // Define a nova extensão baseada no tipo do blob retornado
                const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
                const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
                const newFileName = `${originalName}.${extension}`;

                resolve(new File([blob], newFileName, { type: blob.type }));
            }, 'image/webp', quality);
        };
        img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error("Erro ao processar imagem.")); };
    });
}

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

async function loadAccessibilitySettings() {
    try {
        const dbSettings = await db.getSetting(ACCESSIBILITY_KEY);
        if (dbSettings) return dbSettings;
        return JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY)) || DEFAULT_ACCESSIBILITY;
    } catch {
        return DEFAULT_ACCESSIBILITY;
    }
}

async function saveAccessibilitySettings(settings) {
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
    await db.setSetting(ACCESSIBILITY_KEY, settings);
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

async function updateFontSize(delta) {
    const settings = await loadAccessibilitySettings();
    settings.fontSize = Math.min(140, Math.max(90, settings.fontSize + delta));
    await saveAccessibilitySettings(settings);
    applyAccessibilitySettings(settings);
}

async function toggleHighContrast() {
    const settings = await loadAccessibilitySettings();
    settings.highContrast = !settings.highContrast;
    await saveAccessibilitySettings(settings);
    applyAccessibilitySettings(settings);
}

async function resetAccessibilityDefaults() {
    const settings = { ...DEFAULT_ACCESSIBILITY };
    await saveAccessibilitySettings(settings);
    applyAccessibilitySettings(settings);
}

async function initAccessibility() {
    const settings = await loadAccessibilitySettings();
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

function getStores() {
    let stores = JSON.parse(localStorage.getItem(STORES_KEY) || '[]');
    const storeSeeds = [
        { id: 'store-1', storeName: 'Auto Norte Multimarcas', email: 'contato@autonorte.com', city: 'Sao Paulo', state: 'SP', address: 'Av. Engenheiro Caetano Álvares, 5000' },
        { id: 'store-2', storeName: 'Prime Veiculos', email: 'contato@primeveiculos.com', city: 'Curitiba', state: 'PR', address: 'Rua General Mário Tourinho, 1500' },
        { id: 'store-3', storeName: 'BH Motors', email: 'contato@bhmotors.com', city: 'Belo Horizonte', state: 'MG', address: 'Av. Raja Gabáglia, 2000' },
        { id: 'store-4', storeName: 'Fast Car Multimarcas', email: 'contato@fastcar.com', city: 'Campinas', state: 'SP', address: 'Av. José de Souza Campos, 800' },
        { id: 'store-5', storeName: 'Top Motors', email: 'contato@topmotors.com', city: 'Porto Alegre', state: 'RS', address: 'Av. Ipiranga, 3000' },
        { id: 'store-6', storeName: 'Via Norte Veiculos', email: 'contato@vianorte.com', city: 'Manaus', state: 'AM', address: 'Av. Rodrigo Otávio, 500' },
        { id: 'store-7', storeName: 'Auto Leste', email: 'contato@autoleste.com', city: 'Sao Paulo', state: 'SP', address: 'Av. Aricanduva, 5555' }
    ];

    let updated = false;
    storeSeeds.forEach(storeSeed => {
        const index = stores.findIndex(s => s.email.toLowerCase() === storeSeed.email.toLowerCase());
        if (index === -1) {
            const mockLogin = MOCK_STORE_LOGINS.find(s => s.email.toLowerCase() === storeSeed.email.toLowerCase());
            stores.push({ ...storeSeed, password: mockLogin ? mockLogin.password : '123456' });
            updated = true;
        } else if (!stores[index].password) {
            const mockLogin = MOCK_STORE_LOGINS.find(s => s.email.toLowerCase() === storeSeed.email.toLowerCase());
            stores[index].password = mockLogin ? mockLogin.password : '123456';
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
    return stores;
}

function findStoreLogin(email) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    return getStores().find(store => String(store.email).toLowerCase() === normalizedEmail);
}

function createStoreSession(store) {
    return {
        role: 'seller',
        label: 'Lojista',
        id: store.id,
        name: store.storeName,
        email: store.email,
        city: store.city,
        state: store.state,
        address: store.address,
        image: store.image || null
    };
}

function renderMockStoreAccessList() {
    const container = document.getElementById('mockStoreAccessList');
    if (!container) return;

    renderHTML(container, getStores().map(store => `
        <button type="button" class="mock-store-login" data-email="${store.email}" data-password="${store.password}" aria-label="Usar acesso da loja ${store.storeName}">
            <span>
                <strong>${store.storeName}</strong>
                <small>${store.email}</small>
            </span>
            <code>${store.password}</code>
        </button>
    `).join(''));
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

    // Migração Completa: Garante que TODAS as sementes tenham o ownerEmail correto
    // Otimização: Só executa a migração se houver veículos e ainda não houver flag de migração
    if (v.length > 0 && !localStorage.getItem('buscarauto_migrated_v1')) {
    const migrationMap = {
        'seed-camaro': 'contato@autonorte.com',
        'seed-mercedes': 'contato@primeveiculos.com',
        'seed-corolla': 'contato@autonorte.com',
        'seed-civic': 'contato@bhmotors.com',
        'seed-toro': 'contato@fastcar.com',
        'seed-compass': 'contato@topmotors.com',
        'seed-gol': 'contato@vianorte.com',
        'seed-onix': 'contato@autoleste.com'
    };
    const migrated = v.map(veh => migrationMap[veh.id] ? { ...veh, ownerEmail: migrationMap[veh.id] } : veh);
    if (JSON.stringify(v) !== JSON.stringify(migrated)) saveVehicles(migrated);
    localStorage.setItem('buscarauto_migrated_v1', 'true');
}

    const seed = [
        { id: 'seed-camaro', ownerEmail: 'contato@autonorte.com', title: 'Camaro ZL1', brand: 'Chevrolet', year: 2024, km: '0', fuel: 'Gasolina', transmission: 'Automatico', price: '420000', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/camaro.jpg', description: 'Camaro topo de linha com pacote esportivo, interior premium e pronta entrega.', color: 'Amarelo', location: 'Sao Paulo - SP', agency: 'Auto Norte Multimarcas' },
        { id: 'seed-mercedes', ownerEmail: 'contato@primeveiculos.com', title: 'Mercedes-Benz C300', brand: 'Mercedes-Benz', year: 2023, km: '12000', fuel: 'Flex', transmission: 'Automatico', price: '189900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/mercedes.jpg', description: 'Sedan elegante, confortavel e com pacote completo de seguranca.', color: 'Prata', location: 'Curitiba - PR', agency: 'Prime Veiculos' },
        { id: 'seed-corolla', ownerEmail: 'contato@autonorte.com', title: 'Toyota Corolla XEi 2.0', brand: 'Toyota', year: 2020, km: '48000', fuel: 'Flex', transmission: 'Automatico', price: '96900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/corolla.jpg', description: 'Unico dono, revisoes em dia, IPVA pago e pneus novos. Veiculo muito conservado para uso familiar.', color: 'Branco', location: 'Sao Paulo - SP', agency: 'Auto Norte Multimarcas' },
        { id: 'seed-civic', ownerEmail: 'contato@bhmotors.com', title: 'Honda Civic EXL 2.0', brand: 'Honda', year: 2019, km: '62000', fuel: 'Flex', transmission: 'Automatico', price: '104900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/civic.jpg', description: 'Sedan completo, bancos em couro, central multimidia e excelente historico de manutencao.', color: 'Prata', location: 'Belo Horizonte - MG', agency: 'BH Motors' },
        { id: 'seed-toro', ownerEmail: 'contato@fastcar.com', title: 'Fiat Toro Volcano 2.0 4x4', brand: 'Fiat', year: 2021, km: '35000', fuel: 'Diesel', transmission: 'Automatico', price: '119900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/toro.jpg', description: 'Picape pratica, potente e pronta para estrada ou trabalho.', color: 'Preto', location: 'Campinas - SP', agency: 'Fast Car Multimarcas' },
        { id: 'seed-compass', ownerEmail: 'contato@topmotors.com', title: 'Jeep Compass Limited 2.0', brand: 'Jeep', year: 2021, km: '28000', fuel: 'Flex', transmission: 'Automatico', price: '129900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/compass.jpg', description: 'SUV versatil com pacote Limited, baixa quilometragem e revisoes na concessionaria.', color: 'Cinza', location: 'Porto Alegre - RS', agency: 'Top Motors' },
        { id: 'seed-gol', ownerEmail: 'contato@vianorte.com', title: 'Volkswagen Gol 1.6', brand: 'Volkswagen', year: 2020, km: '45000', fuel: 'Gasolina', transmission: 'Manual', price: '69900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/gol.jpg', description: 'Hatch acessivel, economico e com documentacao em dia.', color: 'Vermelho', location: 'Manaus - AM', agency: 'Via Norte Veiculos' },
        { id: 'seed-onix', ownerEmail: 'contato@autoleste.com', title: 'Chevrolet Onix Plus LT 1.0', brand: 'Chevrolet', year: 2020, km: '15000', fuel: 'Gasolina', transmission: 'Automatico', price: '79900', image: 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/veiculos/onix.jpg', description: 'Compacto moderno, baixo consumo e otimo custo-beneficio.', color: 'Branco', location: 'Sao Paulo - SP', agency: 'Auto Leste' }
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

function getReports() {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
}

function saveReports(arr) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(arr));
}

function getInsuranceLeads() { return JSON.parse(localStorage.getItem(INSURANCE_LEADS_KEY) || '[]'); }
function saveInsuranceLeads(arr) { localStorage.setItem(INSURANCE_LEADS_KEY, JSON.stringify(arr)); }
function getFinanceLeads() { return JSON.parse(localStorage.getItem(FINANCE_LEADS_KEY) || '[]'); }
function saveFinanceLeads(arr) { localStorage.setItem(FINANCE_LEADS_KEY, JSON.stringify(arr)); }

function getLogs() {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
}

function saveLogs(arr) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(arr));
}

/**
 * Registra uma ação administrativa no sistema de logs
 */
function addAdminLog(action, vehicleTitle, reason) {
    const session = getSession();
    const logs = getLogs();
    logs.unshift({
        id: Date.now(),
        adminName: session?.name || 'ADMIN',
        adminEmail: session?.email || 'admin@buscarauto.com',
        action,
        vehicleTitle,
        reason,
        date: new Date().toLocaleString('pt-BR')
    });
    saveLogs(logs.slice(0, 100)); // Mantém apenas os últimos 100 registros
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
    const entrarBtn = document.getElementById('entrarDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (entrarBtn) {
        if (session && session.name) {
            const firstName = session.name.trim().split(' ')[0];
            entrarBtn.textContent = `Olá, ${firstName}`;
        } else {
            entrarBtn.textContent = 'Entrar';
        }
    }

    if (logoutBtn) {
        const li = logoutBtn.closest('li');
        const divider = li?.previousElementSibling;
        const display = session ? 'block' : 'none';
        if (li) li.style.display = display;
        if (divider && divider.querySelector('.dropdown-divider')) divider.style.display = display;
    }
}

function setSessionFromHref(href) {
    const current = getSession();
    // Só cria uma sessão genérica se não houver uma sessão ativa com dados reais
    if (current && current.name) return;

    if (href === '#cliente') saveSession({ role: 'client', label: 'Cliente', name: 'Marina Rocha', email: 'cliente@exemplo.com' });
    if (href === '#lojista') saveSession(createStoreSession(getStores()[0]));
    if (['#cadastro-veiculo', '#anunciar'].includes(href)) saveSession(createStoreSession(getStores()[0]));
    if (href === '#lojista') saveSession({ role: 'seller', label: 'Lojista', name: 'Auto Norte Multimarcas', email: 'contato@autonorte.com' });
    if (['#cadastro-veiculo', '#anunciar'].includes(href)) saveSession({ role: 'seller', label: 'Lojista', name: 'Lojista', email: 'loja@exemplo.com' });
    if (href === '#admin') saveSession({ role: 'admin', label: 'Admin', name: 'ADMIN' });
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
        controls.replaceChildren();
        return;
    }

    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    renderHTML(controls, `
        <button class="pagination-btn" data-page="${currentPage - 1}" ${prevDisabled}>Anterior</button>
        <span class="pagination-status">Página ${currentPage} de ${totalPages}</span>
        <button class="pagination-btn" data-page="${currentPage + 1}" ${nextDisabled}>Próxima</button>
    `);
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
    // Botões no DOM normal (Detalhes, etc)
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const id = btn.dataset.id;
        const active = isInWishlist(id);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.textContent = active ? '♥' : 'Fav';
    });

    // Componentes Customizados
    document.querySelectorAll('car-card').forEach(card => {
        card.isFavorite = isInWishlist(card.vehicle?.id);
    });
}

function getSelectedBrands() {
    return Array.from(document.querySelectorAll('[data-filter="marca"]:checked'))
        .map(input => input.value);
}

function getLocationState(location = '') {
    const match = String(location).match(/\b([A-Z]{2})\b\s*$/);
    return match ? match[1] : '';
}

function vehicleMatchesRegion(vehicle, region) {
    if (!region) return true;
    const states = REGION_STATES[region] || [];
    return states.includes(getLocationState(vehicle.location));
}

function getYearRangeFilter() {
    const from = Number(document.getElementById('yearFromSelect')?.value || 0);
    const to = Number(document.getElementById('yearToSelect')?.value || 0);
    return {
        from: Number.isFinite(from) ? from : 0,
        to: Number.isFinite(to) ? to : 0
    };
}

function applyHeroSearchToSidebarFilters() {
    const [min = '', max = ''] = (document.getElementById('priceRangeSelect')?.value || '').split('-');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const searchMarca = document.getElementById('searchMarca');
    const searchInputMarca = document.getElementById('searchInputMarca');

    if (searchMarca && searchInputMarca) searchMarca.value = searchInputMarca.value.trim();
    if (priceMin) priceMin.value = min || '';
    if (priceMax) priceMax.value = max || '';
}

function getFilteredVehicles() {
    const all = getVehicles();
    const heroSearch = document.getElementById('searchInputMarca')?.value || '';
    const sidebarSearch = document.getElementById('searchMarca')?.value || '';
    const search = (sidebarSearch || heroSearch).toLowerCase().trim();
    const priceMin = numericValue(document.getElementById('priceMin')?.value);
    const priceMaxRaw = document.getElementById('priceMax')?.value;
    const priceMax = priceMaxRaw ? numericValue(priceMaxRaw) : Infinity;
    const year = document.getElementById('filterYear')?.value || '';
    const { from: yearFrom, to: yearTo } = getYearRangeFilter();
    const transmission = document.getElementById('filterTransmission')?.value || '';
    const city = document.getElementById('filterCity')?.value || '';
    const region = document.getElementById('regionSelect')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'relevance';
    const marketplacePreset = getMarketplacePreset();
    const selectedBrands = getSelectedBrands();

    let filtered = all.filter(v => {
        const title = (v.title || '').toLowerCase();
        const brand = (v.brand || '').toLowerCase();
        const price = numericValue(v.price);
        const vehicleYear = Number(v.year || 0);

        if (search) {
            if (!title.includes(search) && !brand.includes(search) && !(v.agency || '').toLowerCase().includes(search)) return false;
        }
        if (selectedBrands.length && !selectedBrands.includes(v.brand)) return false;
        if (price && (price < priceMin || price > priceMax)) return false;
        if (year && String(v.year) !== String(year)) return false;
        if (yearFrom && vehicleYear < yearFrom) return false;
        if (yearTo && vehicleYear > yearTo) return false;
        if (transmission && v.transmission !== transmission) return false;
        if (city && v.location && !v.location.toLowerCase().includes(city.toLowerCase())) return false;
        if (!vehicleMatchesRegion(v, region)) return false;
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

    container.replaceChildren();

    // Adiciona o listener de evento personalizado uma única vez no container
    if (!container.dataset.wishlistListener) {
        container.addEventListener('toggle-favorite', (e) => {
            const id = e.detail.id;
            toggleWishlist(id);
            // Atualiza apenas o componente que disparou o evento
            e.target.isFavorite = isInWishlist(id);
        });
        container.dataset.wishlistListener = 'true';
    }

    vehicles.slice(start, end).forEach(v => {
        const card = document.createElement('car-card');
        card.vehicle = v;
        card.isFavorite = isInWishlist(v.id);
        container.appendChild(card);
    });
    renderPagination(vehicles.length);
}

function renderVehicleDetail(id) {
    const vehicles = getVehicles();
    const v = vehicles.find(x => String(x.id) === String(id));
    const container = document.getElementById('veiculo-detail');
    if (!container) return;

    if (!v) {
        renderHTML(container, '<section class="panel"><p>Veiculo nao encontrado.</p><a class="btn btn-dark" href="#marketplace">Voltar para lista</a></section>');
        return;
    }

    currentDetailGallery = getVehicleGallery(v);
    const session = getSession();
    const btnLabel = session ? 'Enviar mensagem' : 'Entre para contatar';
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.title + ' ' + (v.location || 'Brasil'))}`;

    renderHTML(container, `
        <div class="page-heading">
            <div>
                <p class="eyebrow">Veiculo publicado</p>
                <h2 id="veiculo-title">${v.title}</h2>
                <p>
                    <a href="${mapUrl}" target="_blank" class="text-decoration-none text-muted">
                        📍 ${v.location || 'Sao Paulo - SP'} - Ver no mapa
                    </a>
                </p>
            </div>
            <a class="btn btn-outline-dark" href="#marketplace">Voltar para lista</a>
        </div>
        <div class="vehicle-detail-page">
            <div class="vehicle-gallery">
                <img src="${v.image || 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/placeholder-hero.jpg'}" alt="${v.title}">
                <div class="vehicle-thumbs"><span></span><span></span><span></span><span></span></div>
                <img id="vehicleMainImage" src="${currentDetailGallery[0] || v.image || 'https://res.cloudinary.com/seu-cloud-name/image/upload/v1/buscarauto/placeholder-hero.jpg'}" alt="${v.title}">
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
                    <div class="mt-3 pt-3 border-top"><button class="btn btn-sm btn-link text-danger p-0 report-vehicle-btn" data-id="${v.id}">🚩 Denunciar este anúncio</button></div>
                </section>
                <section class="panel contact-card">
                    <h3>Contato da agencia</h3>
                    <strong>${v.agency || 'Auto Norte Multimarcas'}</strong>
                    <span>WhatsApp: (11) 99999-9999</span>
                    <span>Telefone: (11) 3333-3333</span>
                    <button class="btn btn-dark contact-agency-btn w-100" data-agency="${v.agency || 'Auto Norte Multimarcas'}">${btnLabel}</button>
                    <button class="btn btn-success w-100 mt-2 finance-sim-btn" data-price="${v.price}">💰 Simular Financiamento</button>
                    <button class="btn btn-primary w-100 mt-2 insurance-quote-btn" data-id="${v.id}">🛡️ Cotar Seguro</button>
                </section>
            </aside>
        </div>
    `);

    // Seção de Veículos Relacionados (Mesma marca)
    let related = vehicles.filter(veh => String(veh.brand) === String(v.brand) && String(veh.id) !== String(v.id)).slice(0, 4);
    let sectionTitle = 'Veículos Relacionados';

    // Se não houver da mesma marca, busca por faixa de preço (+/- 15%)
    if (!related || related.length === 0) {
        const currentPrice = numericValue(v.price);
        const margin = currentPrice * 0.15;
        const minPrice = currentPrice - margin;
        const maxPrice = currentPrice + margin;

        related = vehicles.filter(veh => {
            const p = numericValue(veh.price);
            return p >= minPrice && p <= maxPrice && String(veh.id) !== String(v.id);
        }).slice(0, 4);
        
        sectionTitle = 'Veículos Similares por Preço';
    }

    if (related.length > 0) {
        const relatedSection = document.createElement('section');
        relatedSection.className = 'container mt-5 pt-5 border-top';
        relatedSection.innerHTML = `
            <h3 class="h4 fw-bold mb-4">${sectionTitle}</h3>
            <div class="vehicles-grid" id="relatedVehiclesGrid"></div>
        `;
        container.appendChild(relatedSection);
        const relatedGrid = relatedSection.querySelector('#relatedVehiclesGrid');
        related.forEach(rv => {
            const card = document.createElement('car-card');
            card.vehicle = rv;
            card.isFavorite = isInWishlist(rv.id);
            relatedGrid.appendChild(card);
        });
    }
}

/**
 * Renderiza a lista de revendas credenciadas
 */
function renderResellers() {
    const container = document.getElementById('resellers-grid');
    if (!container) return;

    const stores = getStores();
    const vehicles = getVehicles();

    renderHTML(container, stores.map(s => {
        const count = vehicles.filter(v => v.agency === s.storeName).length;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.storeName + ' ' + s.city + ' ' + (s.address || ''))}`;
        
        return `
            <article class="marketplace-card p-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="avatar" style="width: 64px; height: 64px; font-size: 1.5rem; background: var(--color-surface-soft); border: 1px solid var(--color-border);">
                        ${s.storeName[0]}
                    </div>
                    <div>
                        <h3 class="h5 mb-1" style="color: var(--color-primary);">${s.storeName}</h3>
                        <p class="small text-muted mb-0">📍 ${s.city} - ${s.state}</p>
                    </div>
                </div>
                <div class="mb-3">
                    <span class="badge bg-light text-dark border px-2 py-1">${count} veículos em estoque</span>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary w-100" onclick="document.getElementById('searchInputMarca').value='${s.storeName}'; location.hash='#marketplace';">Ver Estoque</button>
                    <a href="${mapUrl}" target="_blank" class="btn btn-outline-secondary" title="Ver no Google Maps">📍</a>
                </div>
            </article>
        `;
    }).join(''));
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

    renderHTML(rows, agencies.map(([name, city, plan, date]) => `
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
    `).join(''));
}

function renderAdminStores() {
    const container = document.getElementById('admin-stores-list');
    if (!container) return;

    const stores = getStores();
    const vehicles = getVehicles();

    renderHTML(container, stores.map(s => {
        const storeVehicles = vehicles.filter(v => v.agency === s.storeName);
        return `
            <div class="admin-row-card">
                <div>
                    <strong>${s.storeName}</strong>
                    <p class="mb-0 text-muted">${s.city} / ${s.state} — ${storeVehicles.length} anúncios ativos</p>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="location.hash='#cadastro-veiculo'; setTimeout(() => { document.querySelector('[name=\\'agency\\']').value = '${s.storeName}'; }, 100)">+ Novo Anúncio</button>
                    <button class="btn btn-sm btn-outline-dark">Gerenciar Loja</button>
                </div>
            </div>
        `;
    }).join(''));
}

export function renderAdminClients() {
    const container = document.getElementById('admin-clients-list');
    if (!container) return;

    const searchTerm = document.getElementById('adminUserSearch')?.value || '';
    const clients = getClients(); // Puxa os clientes anunciantes particulares
    const vehicles = getVehicles();

    const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const processed = filtered.map(c => {
        const userVehicles = vehicles.filter(v => v.agency === c.name || v.ownerEmail === c.email);
        return {
            ...c,
            adCount: userVehicles.length,
            activeCount: userVehicles.filter(v => !v.status || v.status === 'Ativo').length
        };
    });

    let result = processed;
    if (adminUserFilterActiveOnly) {
        result = processed.filter(u => u.activeCount > 0);
    }

    result.sort((a, b) => {
        if (adminUserSort === 'name-asc') return a.name.localeCompare(b.name);
        if (adminUserSort === 'name-desc') return b.name.localeCompare(a.name);
        if (adminUserSort === 'ads-desc') return b.adCount - a.adCount;
        if (adminUserSort === 'ads-asc') return a.adCount - b.adCount;
        return 0;
    });

    const totalItems = result.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    
    // Garante que a página atual seja válida
    if (adminUserPage > totalPages) adminUserPage = totalPages;
    if (adminUserPage < 1) adminUserPage = 1;

    const start = (adminUserPage - 1) * PAGE_SIZE;
    const sliced = result.slice(start, start + PAGE_SIZE);

    if (totalItems === 0) {
        const msg = searchTerm ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum anunciante particular cadastrado.';
        renderHTML(container, `<p class="text-muted text-center py-3">${msg}</p>`);
        return;
    }

    const listHtml = sliced.map(c => `
        <div class="admin-row-card">
            <div>
                <strong>${c.name}</strong>
                <p class="mb-0 text-muted">${c.email} — ${c.adCount} anúncios</p>
            </div>
            <div class="action-buttons">
                <button class="btn btn-sm btn-outline-danger ban-user" data-email="${c.email}" data-name="${c.name}">Banir Usuário</button>
                <button class="btn btn-sm btn-outline-dark">Ver Histórico</button>
            </div>
        </div>
    `).join('');

    const paginationHtml = totalItems > PAGE_SIZE ? `
        <div class="pagination-controls mt-3" id="adminUserPagination">
            <button class="pagination-btn" data-page="${adminUserPage - 1}" ${adminUserPage === 1 ? 'disabled' : ''}>Anterior</button>
            <span class="pagination-status">Página ${adminUserPage} de ${totalPages}</span>
            <button class="pagination-btn" data-page="${adminUserPage + 1}" ${adminUserPage === totalPages ? 'disabled' : ''}>Próxima</button>
        </div>
    ` : '';

    renderHTML(container, listHtml + paginationHtml);

    // Listener para a paginação específica de usuários
    container.querySelector('#adminUserPagination')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        adminUserPage = Number(btn.dataset.page);
        renderAdminClients();
    });
}

function renderAdminDashboard() {
    const container = document.getElementById('admin-dashboard-dynamic');
    if (!container) return;

    const vehicles = getVehicles();
    const stores = getStores();
    const clients = getClients();
    const proposals = getProposals();
    const reports = getReports();
    const logs = getLogs();
    const fLeads = getFinanceLeads();
    const iLeads = getInsuranceLeads();

    const totalUsers = stores.length + clients.length;
    const activeAds = vehicles.filter(v => !v.status || v.status === 'Ativo').length;
    const soldAds = vehicles.filter(v => v.status === 'Vendido').length;
    const vehicleRevenue = vehicles.filter(v => v.status === 'Vendido').reduce((acc, v) => acc + numericValue(v.price), 0);
    const leadRevenue = [...fLeads, ...iLeads].filter(l => l.status === 'Vendido').reduce((acc, l) => acc + (l.monetizationValue || 0), 0);
    const totalRevenue = vehicleRevenue + leadRevenue;
    const totalLeads = fLeads.length + iLeads.length;

    renderHTML(container, `
        <div class="page-heading">
            <div>
                <p class="eyebrow">Painel Administrativo</p>
                <h2 id="admin-title">Dashboard Admin</h2>
                <p>Gestão completa da plataforma BuscarAuto.</p>
            </div>
        </div>

        <div class="metric-grid admin-metrics mb-4">
            <article class="metric-card">
                <span class="metric-icon">👥</span>
                <p>Usuários cadastrados</p>
                <strong>${totalUsers}</strong>
                ${calculateGrowthHtml(totalUsers)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">🏢</span>
                <p>Lojistas cadastrados</p>
                <strong>${stores.length}</strong>
                ${calculateGrowthHtml(stores.length)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">🚗</span>
                <p>Anúncios ativos</p>
                <strong>${activeAds}</strong>
                ${calculateGrowthHtml(activeAds)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">💰</span>
                <p>Anúncios vendidos</p>
                <strong>${soldAds}</strong>
                ${calculateGrowthHtml(soldAds)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">📩</span>
                <p>Mensagens enviadas</p>
                <strong>${proposals.length}</strong>
                ${calculateGrowthHtml(proposals.length)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">🎯</span>
                <p>Leads Finance/Seguro</p>
                <strong>${totalLeads}</strong>
                <small class="text-success">↑ +${totalLeads} novas oportunidades</small>
            </article>
            <article class="metric-card">
                <span class="metric-icon">🚩</span>
                <p>Denúncias pendentes</p>
                <strong class="text-danger">${reports.length}</strong>
                <small class="text-muted">Ações requeridas</small>
            </article>
            <article class="metric-card">
                <span class="metric-icon">💵</span>
                <p>Receita Total</p>
                <strong style="font-size: 1.4rem;">R$ ${totalRevenue.toLocaleString('pt-BR')}</strong>
                <small class="text-muted d-block" style="font-size:0.7rem;">Venda de Leads: R$ ${leadRevenue.toLocaleString('pt-BR')}</small>
                ${calculateGrowthHtml(totalRevenue)}
            </article>
        </div>

        <section class="panel mb-4">
            <div class="panel-header"><h3>🚩 Moderação de Denúncias</h3></div>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th>Veículo</th>
                            <th>Motivo</th>
                            <th>Data</th>
                            <th class="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reports.length ? reports.map(r => {
                            const v = vehicles.find(veh => String(veh.id) === String(r.vehicleId));
                            return `
                            <tr>
                                <td><strong>${v ? v.title : 'Veículo Removido'}</strong></td>
                                <td><span class="badge bg-danger-soft">${r.reason}</span></td>
                                <td>${r.date}</td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-secondary dismiss-report" data-id="${r.id}">Ignorar</button>
                                    <button class="btn btn-sm btn-danger delete-report-ad" data-vehicle-id="${r.vehicleId}" data-id="${r.id}">Remover Anúncio</button>
                                </td>
                            </tr>
                            `;
                        }).join('') : '<tr><td colspan="4" class="text-center py-3 text-muted">Nenhuma denúncia pendente.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </section>

        <section class="panel mb-4">
            <div class="panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h3>👥 Gestão de Usuários (Particulares)</h3>
                <div class="d-flex align-items-center gap-3">
                    <div class="form-check form-switch mb-0">
                        <input class="form-check-input" type="checkbox" id="adminUserFilterActiveOnly" ${adminUserFilterActiveOnly ? 'checked' : ''}>
                        <label class="form-check-label small fw-bold text-muted mb-0" for="adminUserFilterActiveOnly">Com anúncios ativos</label>
                    </div>
                    <select id="adminUserSort" class="form-select form-select-sm w-auto shadow-none">
                        <option value="name-asc" ${adminUserSort === 'name-asc' ? 'selected' : ''}>Nome (A-Z)</option>
                        <option value="name-desc" ${adminUserSort === 'name-desc' ? 'selected' : ''}>Nome (Z-A)</option>
                        <option value="ads-desc" ${adminUserSort === 'ads-desc' ? 'selected' : ''}>Anúncios (Maior)</option>
                        <option value="ads-asc" ${adminUserSort === 'ads-asc' ? 'selected' : ''}>Anúncios (Menor)</option>
                    </select>
                    <input type="text" id="adminUserSearch" class="form-control form-control-sm w-auto" style="min-width: 250px;" placeholder="Buscar por nome ou e-mail...">
                </div>
            </div>
            <div id="admin-clients-list"></div>
        </section>

        <section class="panel mb-4">
            <div class="panel-header"><h3>Gestão de Lojas Parceiras</h3></div>
            <div id="admin-stores-list"></div>
        </section>

        <section class="panel mb-4">
            <div class="panel-header"><h3>📋 Logs de Auditoria (Remoções)</h3></div>
            <div class="table-responsive">
                <table class="table table-sm table-hover align-middle">
                    <thead class="bg-light">
                        <tr class="small text-uppercase">
                            <th>Data</th>
                            <th>Administrador</th>
                            <th>Veículo</th>
                            <th>Motivo</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        ${logs.length ? logs.map(l => `
                            <tr>
                                <td class="text-muted">${l.date}</td>
                                <td><strong>${l.adminName}</strong><br><small>${l.adminEmail}</small></td>
                                <td>${l.vehicleTitle}</td>
                                <td><span class="text-danger">${l.reason}</span></td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" class="text-center py-3">Nenhum log registrado.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </section>
    `);

    renderAdminStores();
    renderAdminClients();
    updateAdminSidebarActive('#admin');
    container.querySelectorAll('.metric-card strong').forEach(el => animateCountUp(el));

    document.getElementById('adminUserSearch')?.addEventListener('input', () => {
        adminUserPage = 1; // Reseta para a primeira página ao buscar
        renderAdminClients();
    });

    document.getElementById('adminUserSort')?.addEventListener('change', (e) => {
        adminUserSort = e.target.value;
        adminUserPage = 1; // Reseta para a primeira página ao mudar ordenação
        renderAdminClients();
    });

    document.getElementById('adminUserFilterActiveOnly')?.addEventListener('change', (e) => {
        adminUserFilterActiveOnly = e.target.checked;
        adminUserPage = 1; // Reseta para a primeira página ao mudar filtro
        renderAdminClients();
    });

    document.getElementById('logoutAdmin')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        syncLoginState();
        location.hash = '#inicio';
    });
}

/**
 * Renderiza a listagem de Leads (Financiamento ou Seguro) no Dashboard Admin
 */
function renderAdminLeads(type) {
    const container = document.getElementById('admin-dashboard-dynamic');
    if (!container) return;
    
    const isFinance = type === '#admin-leads-finance';
    const leads = isFinance ? getFinanceLeads() : getInsuranceLeads();
    const title = isFinance ? 'Simulações de Financiamento' : 'Cotações de Seguro';
    
    renderHTML(container, `
        <div class="page-heading">
            <div>
                <p class="eyebrow">Gestão de Leads</p>
                <h2>${title}</h2>
                <p>Gerencie as solicitações recebidas para monetização e encaminhamento para parceiros.</p>
            </div>
        </div>
        <section class="panel">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th>Data</th>
                            <th>Lead / Contato</th>
                            ${isFinance ? '<th>Veículo / Financiamento</th>' : '<th>Dados para Cotação</th>'}
                            <th>Status</th>
                            <th class="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leads.map(l => `
                            <tr>
                                <td><small class="text-muted">${l.date}</small></td>
                                <td>
                                    <strong>${l.userName || l.nome}</strong><br>
                                    <small class="text-muted">${l.userEmail || l.email}</small>
                                </td>
                                <td>
                                    ${isFinance ? 
                                        `R$ ${formatMoney(l.valorVeiculo)}<br><small class="text-success">${l.prazo}x de R$ ${formatMoney(l.parcela)}</small>` : 
                                        `CEP: ${l.cep} • Condutor: ${l.condutor}<br><small>Nasc: ${l.nascimento}</small>`
                                    }
                                </td>
                                <td><span class="status-badge ${l.status === 'Vendido' ? 'bg-success-soft text-success border-success' : 'bg-warning-soft'}">${l.status || 'Pendente'}</span></td>
                                <td class="text-end">
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-success monetize-lead" data-id="${l.id}" data-type="${type}" title="Marcar como Vendido" ${l.status === 'Vendido' ? 'disabled' : ''}>💰</button>
                                        <button class="btn btn-sm btn-outline-primary" title="Encaminhar para Parceiro">➡️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" class="text-center py-5 text-muted">Nenhum lead registrado até o momento.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </section>
    `);
    updateAdminSidebarActive(type);
}

/**
 * Sincroniza o estado visual da sidebar do administrador
 */
function updateAdminSidebarActive(hash) {
    const nav = document.querySelector('#admin .app-sidebar nav');
    if (!nav) return;
    nav.querySelectorAll('a').forEach(a => {
        const aHash = a.getAttribute('href');
        a.classList.toggle('active', aHash === hash);
    });
}

function renderLojistaDashboard() {
    const session = getSession();
    const container = document.getElementById('lojista-content');
    if (!container || !session) return;

    const allVehicles = getVehicles();
    // Filtragem agora é por e-mail para garantir isolamento
    const myVehicles = allVehicles.filter(v => String(v.ownerEmail).toLowerCase() === String(session.email).toLowerCase());
    const rawProposals = getProposals().filter(p => p.recipientEmail === session.email);

    // Filtragem de Leads por período
    const myProposals = rawProposals.filter(p => {
        if (currentReportPeriod === 'all') return true;
        const parts = p.date.split('/');
        if (parts.length !== 3) return true;
        const [day, month, year] = parts.map(Number);
        const proposalDate = new Date(year, month - 1, day);
        const diffTime = Math.abs(new Date() - proposalDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= currentReportPeriod;
    });

    // Contar propostas não lidas
    const unreadCount = myProposals.filter(p => p.unread).length;

    // Carregar rascunhos de forma assíncrona
    db.getDraftsByEmail(session.email).then(drafts => {
        const draftContainer = document.getElementById('drafts-list-container');
        if (!draftContainer) return;
        if (drafts.length === 0) {
            renderHTML(draftContainer, '<p class="text-muted small">Nenhum rascunho salvo.</p>');
        } else {
            renderHTML(draftContainer, drafts.map(d => `
                <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                    <div>
                        <span class="fw-bold d-block">${d.title || '(Sem título)'}</span>
                        <small class="text-muted">Editado em: ${new Date(d.updatedAt).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-sm btn-link load-draft" data-id="${d.id}">Retomar</button>
                </div>
            `).join(''));
        }
    });

    const activeCount = myVehicles.filter(v => v.status !== 'Vendido').length;
    const soldCount = myVehicles.filter(v => v.status === 'Vendido').length;
    const totalViews = myVehicles.reduce((acc, v) => acc + (v.views || 0), 0);
    const planLimit = 15;
    
    const hash = location.hash;
    const isReportsView = hash === '#relatorios';
    const isInventoryView = hash === '#lojista-estoque';
    const isSettingsView = hash === '#perfil';

    const periodSelector = `
        <div class="d-flex align-items-center gap-2 mb-4">
            <label class="small fw-bold text-muted">Período:</label>
            <select id="reportPeriodSelect" class="form-select form-select-sm w-auto shadow-none">
                <option value="7" ${currentReportPeriod == 7 ? 'selected' : ''}>Últimos 7 dias</option>
                <option value="15" ${currentReportPeriod == 15 ? 'selected' : ''}>Últimos 15 dias</option>
                <option value="30" ${currentReportPeriod == 30 ? 'selected' : ''}>Últimos 30 dias</option>
                <option value="all" ${currentReportPeriod === 'all' ? 'selected' : ''}>Todo o período</option>
            </select>
        </div>`;

    // Relatórios: Veículos mais vistos
    const topVehicles = [...myVehicles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
    const maxViews = Math.max(...topVehicles.map(v => v.views || 0), 1);

    const kpiSection = `
        <div class="metric-grid metric-grid-5 mb-5">
            <article class="metric-card">
                <span class="metric-icon">🚗</span>
                <p>Total de veículos</p>
                <strong>${myVehicles.length}</strong>
                ${calculateGrowthHtml(myVehicles.length)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">💰</span>
                <p>Veículos vendidos</p>
                <strong>${soldCount}</strong>
                ${calculateGrowthHtml(soldCount)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">💬</span>
                <p>Mensagens recebidas</p>
                <strong>${myProposals.length}</strong>
                ${calculateGrowthHtml(myProposals.length)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">⏱️</span>
                <p>Tempo médio</p>
                <strong>14<small style="display:inline; font-size:1rem;"> dias</small></strong>
                <small class="metric-growth text-growth-up">↓ -2 dias <span class="text-muted fw-normal">agilidade</span></small>
            </article>
            <article class="metric-card">
                <span class="metric-icon">👁️</span>
                <p>Visualizações</p>
                <strong>${totalViews.toLocaleString()}</strong>
                ${calculateGrowthHtml(totalViews)}
            </article>
        </div>
    `;

    const reportsContent = `
        <div class="row g-4">
            <div class="col-12">${periodSelector}</div>
            <div class="col-md-6">
                <section class="panel h-100">
                    <div class="panel-header"><h3>Desempenho por Veículo</h3></div>
                    <div class="report-chart-container mt-3">
                        ${topVehicles.map(v => {
                            const height = ((v.views || 0) / maxViews) * 100;
                            return `
                            <div class="report-bar-group">
                                <div class="report-bar" style="height: ${height}%" title="${v.views || 0} visualizações"></div>
                                <small class="text-truncate w-100 text-center mt-2" title="${v.title}">${v.title.split(' ')[0]}</small>
                                <strong class="small">${v.views || 0}</strong>
                            </div>
                            `;
                        }).join('')}
                    </div>
                    <p class="text-muted small mt-3 text-center">Visualizações dos 3 veículos mais populares da sua loja.</p>
                </section>
            </div>
            <div class="col-md-6">
                <section class="panel h-100">
                    <div class="panel-header"><h3>Métricas de Conversão</h3></div>
                    <div class="p-3">
                        <div class="mb-4">
                            <small class="text-muted d-block">Tempo médio de venda</small>
                            <span class="report-value">22 dias</span>
                        </div>
                        <div class="mb-4">
                            <small class="text-muted d-block">Taxa de conversão (Leads)</small>
                            <span class="report-value">4.8%</span>
                        </div>
                        <div>
                            <small class="text-muted d-block">Leads recebidos (Total)</small>
                            <span class="report-value">${myProposals.length}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;

    renderHTML(container, `
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
                    <a href="#lojista" class="text-decoration-none ${!isReportsView && !isInventoryView && !isSettingsView ? 'text-dark fw-bold border-bottom border-dark border-2 pb-1' : 'text-muted fw-semibold'}">🏠 Dashboard</a>
                    <a href="#lojista-estoque" class="text-decoration-none ${isInventoryView ? 'text-dark fw-bold border-bottom border-dark border-2 pb-1' : 'text-muted fw-semibold'}">🚗 Veículos</a>
                    <a href="#mensagens" class="text-decoration-none text-muted fw-semibold">📩 Propostas</a>
                    <a href="#mensagens" class="text-decoration-none text-muted fw-semibold">💬 Mensagens ${unreadCount > 0 ? `<span class="badge bg-danger ms-1">${unreadCount}</span>` : `<span class="badge bg-light text-dark border ms-1">${myProposals.length}</span>`}</a>
                    <a href="#relatorios" class="text-decoration-none ${isReportsView ? 'text-dark fw-bold border-bottom border-dark border-2 pb-1' : 'text-muted fw-semibold'}">📊 Relatórios</a>
                    <a href="#perfil" class="text-decoration-none ${isSettingsView ? 'text-dark fw-bold border-bottom border-dark border-2 pb-1' : 'text-muted fw-semibold'}">⚙️ Configurações</a>
                </div>
            </div>
        </nav>

        <div class="container-fluid px-4">
            <!-- Cabeçalho de Boas-vindas -->
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h2 class="fw-bold mb-1" style="color: var(--color-primary);">${isReportsView ? 'Relatórios de Desempenho' : isInventoryView ? 'Gestão de Estoque' : isSettingsView ? 'Configurações da Agência' : 'Dashboard Lojista'}</h2>
                    <p class="text-muted">${isReportsView ? 'Análise detalhada de conversão e visualizações.' : isInventoryView ? 'Gerencie seus anúncios e acompanhe seus resultados.' : isSettingsView ? 'Atualize as informações e a logo da sua agência.' : 'Gerencie seus anúncios e acompanhe seus resultados.'}</p>
                </div>
                <a href="#cadastro-veiculo" class="btn btn-dark py-2 px-4 fw-bold">
                    <span class="me-2">+</span> Cadastrar Veículo
                </a>
            </div>

            ${isReportsView ? '' : kpiSection}

            <div class="row g-4">
                <div class="${isReportsView ? 'col-12' : 'col-lg-9'}">
                    ${isReportsView ? reportsContent : `
                    <div class="card border-0 shadow-sm border-radius-12 mb-4">
                        <div class="card-header bg-white border-0 py-4 px-4">
                            <h5 class="fw-bold mb-0">${isInventoryView ? 'Estoque Completo' : 'Últimos Veículos'}</h5>
                        </div>
                        <div class="card-body px-4 pt-0">
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
                                                <td class="text-muted">${v.views || 0}</td>
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
                        <div class="card-footer bg-white py-3 px-4 border-top">
                            <h6 class="fw-bold mb-3"><span class="me-2">📝</span> Meus Rascunhos (Offline)</h6>
                            <div id="drafts-list-container">
                                <p class="text-muted small">Carregando rascunhos...</p>
                            </div>
                        </div>
                    </div>
                    `}
                </div>
                
                ${isReportsView ? '' : `
                <div class="col-lg-3">
                    <form id="editLojistaProfileForm" class="card border-0 shadow-sm p-4 mb-4" style="border-radius:12px;">
                        <h6 class="fw-bold mb-3">👤 Perfil da Agência</h6>
                        <div class="mb-3">
                            <label class="small fw-bold text-muted">Logo da Loja</label>
                            <input type="file" id="lojistaLogoInput" class="form-control form-control-sm" accept="image/*">
                        </div>
                        <div class="mb-3">
                            <label class="small fw-bold text-muted">Nome de Exibição</label>
                            <input type="text" name="name" value="${session.name}" class="form-control form-control-sm" required>
                        </div>
                        <button type="submit" class="btn btn-dark btn-sm w-100 fw-bold">Atualizar Dados</button>
                    </form>

                    <div class="card border-0 shadow-sm p-4 mb-4" style="border-radius:12px;">
                        <h6 class="fw-bold mb-3">Atalhos Rápidos</h6>
                        <div class="d-grid gap-3">
                            <a href="#cadastro-veiculo" class="text-decoration-none text-dark small fw-semibold">+ Cadastrar Veículo</a>
                            <a href="#lojista-estoque" class="text-decoration-none text-dark small fw-semibold">🚗 Estoque Completo</a>
                            <a href="#mensagens" class="text-decoration-none text-dark small fw-semibold">📩 Ver Propostas</a>
                            <a href="#relatorios" class="text-decoration-none text-dark small fw-semibold">📈 Relatórios</a>
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
                `}
            </div>
        </div>
    `);

    // Dispara animação nos KPIs do Lojista
    container.querySelectorAll('.metric-card strong').forEach(el => animateCountUp(el));

    document.getElementById('editLojistaProfileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Salvando...';
        const newName = e.target.name.value.trim();
        const fileInput = document.getElementById('lojistaLogoInput');
        let imageUrl = session.image;

        if (fileInput.files[0]) {
            if (fileInput.files[0].size > MAX_FILE_SIZE) {
                alert('A logo da loja não pode exceder 10MB.');
                btn.disabled = false;
                btn.textContent = 'Atualizar Dados';
                return;
            }
            const resizedFile = await resizeImage(fileInput.files[0], 400, 400);
            const res = await uploadParaCloudinary(resizedFile);
            imageUrl = res.secure_url;
        }
        const updatedSession = { ...session, name: newName, image: imageUrl };
        saveSession(updatedSession);
        
        // Atualiza a loja no banco de lojas também
        const stores = getStores().map(s => s.email === session.email ? { ...s, storeName: newName, image: imageUrl } : s);
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        
        alert('Perfil da agência atualizado!');
        syncLoginState();
        renderLojistaDashboard();
    });

    document.getElementById('logoutLojistaNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        syncLoginState();
        location.hash = '#inicio';
    });

    document.getElementById('reportPeriodSelect')?.addEventListener('change', (e) => {
        const val = e.target.value;
        currentReportPeriod = val === 'all' ? 'all' : Number(val);
        renderLojistaDashboard();
    });
}

function initForms() {
    renderMockStoreAccessList();

    document.getElementById('mockStoreAccessList')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.mock-store-login');
        if (!btn) return;

        const form = document.getElementById('anuncieForm');
        if (!form) return;

        form.email.value = btn.dataset.email || '';
        form.password.value = btn.dataset.password || '';
        const sellerRole = form.querySelector('input[name="role"][value="seller"]');
        if (sellerRole) {
            sellerRole.checked = true;
            sellerRole.dispatchEvent(new Event('change', { bubbles: true }));
        }
        form.email.focus();
    });

    const anuncieForm = document.getElementById('anuncieForm');
    if (anuncieForm) {
        anuncieForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(anuncieForm);
            const email = String(fd.get('email') || '').trim();
            const password = String(fd.get('password') || '');
            const role = String(fd.get('role') || 'client');
            const sessionRole = role === 'seller' ? 'seller' : 'client';
            
            if (sessionRole === 'seller') {
                const matchedStore = findStoreLogin(email);
                if (!matchedStore) {
                    alert('Revendedor mock nÃ£o encontrado. Use um dos 7 acessos de lojas parceiras.');
                    return;
                }

                if (matchedStore.password !== password) {
                    alert('Senha mock incorreta para esta loja parceira.');
                    return;
                }
            }

            const storeData = findStoreLogin(email);
            const displayName = storeData ? storeData.storeName : email.split('@')[0];

            saveSession({ 
                role: sessionRole, 
                label: sessionRole === 'seller' ? 'Lojista' : 'Cliente', 
                email: email,
                name: displayName,
                image: storeData?.image || null 
            });
            syncLoginState();

            if (redirectAfterLogin) {
                location.hash = redirectAfterLogin;
                redirectAfterLogin = null;
            } else {
                if (sessionRole === 'seller') location.hash = '#lojista';
                else location.hash = '#cliente';
            }
        });
    }

    const recuperarSenhaForm = document.getElementById('recuperarSenhaForm');
    if (recuperarSenhaForm) {
        recuperarSenhaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = recuperarSenhaForm.email.value;
            const btn = recuperarSenhaForm.querySelector('button');
            const alertSucesso = document.getElementById('recuperarSucesso');
            const originalText = btn.textContent;
            
            btn.disabled = true;
            btn.textContent = 'Enviando...';
            startLoading();

            // Simulação de delay de rede (2 segundos)
            await new Promise(resolve => setTimeout(resolve, 2000));

            stopLoading();
            btn.disabled = false;
            btn.textContent = originalText;
            
            recuperarSenhaForm.classList.add('d-none');
            alertSucesso.classList.remove('d-none');
            
            console.log(`[SIMULAÇÃO] E-mail de recuperação enviado para: ${email}`);
        });
    }

    const cadastroContaForm = document.getElementById('cadastroContaForm');
    if (cadastroContaForm) {
        // Lógica de alternância de campos PF/PJ
        cadastroContaForm.querySelectorAll('input[name="role"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isLojista = e.target.value === 'seller';
                document.getElementById('pf-fields').style.display = isLojista ? 'none' : 'block';
                document.getElementById('pj-fields').style.display = isLojista ? 'block' : 'none';
                
                // Ajusta obrigatoriedade
                document.querySelectorAll('#pf-fields input').forEach(i => i.required = !isLojista);
                document.querySelectorAll('#pj-fields input').forEach(i => i.required = isLojista);
            });
        });

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

            const roleValue = role;
            let displayName = '';
            if (roleValue === 'seller') {
                displayName = String(fd.get('storeName') || fd.get('responsibleName') || '').trim();
            } else {
                displayName = String(fd.get('name') || '').trim();
            }
            const email = String(fd.get('email') || '').trim();

            const newUser = {
                role: roleValue,
                label: roleValue === 'seller' ? 'Lojista' : 'Cliente',
                name: displayName,
                email,
                image: null
            };

            if (roleValue === 'client') {
                clients.push(newUser);
                saveClients(clients);
            }

            saveSession(newUser);
            syncLoginState();

            if (redirectAfterLogin) {
                location.hash = redirectAfterLogin;
                redirectAfterLogin = null;
            } else {
                if (roleValue === 'seller') location.hash = '#lojista';
                else location.hash = '#cliente';
            }
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
            alert(`Cadastro do plano ${obj.plan} enviado com sucesso! Em breve nossa equipe entrará em contato.`);
            location.hash = '#marketplace';
        });
    }
}

/**
 * Adiciona destaque visual às opções de rádio decoradas (.role-option)
 * quando selecionadas (ex: escolha de planos no cadastro de lojista).
 */
function initRoleOptionHighlighting() {
    const inputs = document.querySelectorAll('.role-option input');
    const planInfo = {
        'Basico': { name: 'Plano Básico', price: 'R$ 99,00' },
        'Intermediario': { name: 'Plano Intermediário', price: 'R$ 199,00' },
        'Premium': { name: 'Plano Premium', price: 'R$ 399,00' }
    };

    inputs.forEach(input => {
        const updateVisuals = () => {
            const groupInputs = input.type === 'radio' 
                ? document.querySelectorAll(`input[name="${input.name}"]`)
                : [input];
            groupInputs.forEach(i => {
                const card = i.closest('.role-option');
                if (!card) return;
                const details = card.querySelector('.plan-details');
                const check = card.querySelector('.plan-check');
                if (i.checked) {
                    card.classList.add('border-primary', 'bg-light', 'shadow-sm');
                    details?.classList.remove('d-none');
                    check?.classList.remove('d-none');
                    if (i.name === 'plan') {
                        const summary = document.getElementById('planSummary');
                        const nameEl = document.getElementById('summaryPlanName');
                        const priceEl = document.getElementById('summaryPlanPrice');
                        const info = planInfo[i.value];
                        if (summary && nameEl && priceEl && info) {
                            nameEl.textContent = info.name;
                            priceEl.textContent = info.price;
                            summary.classList.remove('d-none');
                        }
                    }
                } else {
                    card.classList.remove('border-primary', 'bg-light', 'shadow-sm');
                    details?.classList.add('d-none');
                    check?.classList.add('d-none');
                }
            });
        };
        input.addEventListener('change', updateVisuals);
        if (input.checked) updateVisuals();
    });
}

/**
 * Lógica do formulário de cadastro de veículos e filtros
 */
function initVehicleLogic() {
    const form = document.getElementById('cadastroForm');
    if (form) {
        updateFormPreview();
        document.getElementById('saveDraftBtn')?.addEventListener('click', async () => {
            const session = getSession();
            if (!session) return alert('Você precisa estar logado para salvar rascunhos.');
            const fd = new FormData(form);
            const data = Object.fromEntries(fd.entries());
            data.ownerEmail = session.email;
            startLoading();
            await db.saveDraft(data);
            stopLoading();
            alert('Rascunho salvo offline com sucesso!');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const obj = Object.fromEntries(fd.entries());
            const editId = form.dataset.editId;
            const session = getSession();
            obj.features = fd.getAll('features');
            obj.agency = session.role === 'admin' ? fd.get('agency') : (session.name || 'Auto Norte Multimarcas');
            obj.ownerEmail = session.email;
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
                form.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
            } else {
                obj.id = Date.now();
                if (!obj.image && gallery.length > 0) obj.image = gallery[0];
                vehicles.unshift(obj);
            }
            saveVehicles(vehicles);
            form.reset();
            slots.forEach(slot => { slot.style.backgroundImage = ''; slot.textContent = ''; });
            renderMarketplace();
            location.hash = '#marketplace';
        });

        const uploadTile = document.getElementById('uploadTile');
        const fileInput = document.getElementById('vehicleImageFile');
        const imageInput = form.querySelector('input[name="image"]');
        if (uploadTile && fileInput) {
            uploadTile.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                const slots = Array.from(document.querySelectorAll('.photo-strip > div:not(.upload-tile)'));
                const emptySlotsCount = slots.filter(slot => !slot.style.backgroundImage).length;
                if (files.length > emptySlotsCount) {
                    alert(`Você pode selecionar no máximo mais ${emptySlotsCount} fotos.`);
                    fileInput.value = '';
                    return;
                }
                const originalText = uploadTile.textContent;
                uploadTile.textContent = 'Enviando...';
                const totalFiles = files.length;
                let currentFileIndex = 0;
                startLoading();
                try {
                    for (const file of files) {
                        currentFileIndex++;
                        if (file.size > MAX_FILE_SIZE) {
                            alert(`O arquivo "${file.name}" excede o limite de 10MB e será ignorado.`);
                            continue;
                        }
                        uploadTile.textContent = `Enviando ${currentFileIndex} de ${totalFiles}...`;
                        const currentSlots = Array.from(document.querySelectorAll('.photo-strip > div:not(.upload-tile)'));
                        const slotToFill = currentSlots.find(slot => !slot.style.backgroundImage);
                        if (!slotToFill) break;
                        const resizedFile = await resizeImage(file);
                        const result = await uploadParaCloudinary(resizedFile);
                        if (result.secure_url) {
                            slotToFill.style.backgroundImage = `url('${result.secure_url}')`;
                            slotToFill.style.backgroundSize = 'cover';
                            slotToFill.style.backgroundPosition = 'center';
                            slotToFill.style.position = 'relative';
                            renderHTML(slotToFill, '<button type="button" class="remove-img-btn" style="position:absolute; top:2px; right:2px; background:rgba(255,0,0,0.7); color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;">&times;</button>');
                            if (imageInput) {
                                if (!imageInput.value) imageInput.value = result.secure_url;
                                imageInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    }
                } catch (err) {
                    console.error('Erro ao carregar para Cloudinary:', err);
                    alert('Ocorreu um erro ao carregar uma das imagens. Verifique a conexão.');
                } finally {
                    stopLoading();
                    uploadTile.textContent = originalText;
                    fileInput.value = '';
                }
            });
        }
        ['input', 'change'].forEach(eventName => {
            form.addEventListener(eventName, updateFormPreview);
        });
    }

    document.querySelector('.search-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        applyHeroSearchToSidebarFilters();
        currentPage = 1;
        renderMarketplace();
        if (location.hash !== '#marketplace') {
            location.hash = '#marketplace';
        } else {
            showLanding(false);
            document.querySelector('.marketplace-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Filtros & controles: re-renderizar ao mudar
    ['searchInputMarca','searchMarca','priceMin','priceMax','priceRangeSelect','regionSelect','yearFromSelect','yearToSelect','filterYear','filterTransmission','filterCity','sortBy'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const ev = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? 'input' : 'change';
        el.addEventListener(ev, () => {
            if (['priceRangeSelect'].includes(id)) applyHeroSearchToSidebarFilters();
        
            // Aplica Debounce de 300ms na busca para evitar travamento ao digitar
            currentPage = 1;
            renderMarketplace();
        });
    });

    document.querySelectorAll('[data-filter="marca"]').forEach(input => {
        input.addEventListener('change', () => {
            currentPage = 1;
            renderMarketplace();
        });
    });

    document.getElementById('clearFilters')?.addEventListener('click', (e) => {
        e.preventDefault();
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
        document.querySelectorAll('[data-filter="marca"]').forEach(input => {
            input.checked = false;
        });
        currentPage = 1;
        renderMarketplace();
    });

    const extraBrands = document.getElementById('extraBrandsCollapse');
    const toggleBtn = document.getElementById('toggleBrandsBtn');
    if (extraBrands && toggleBtn) {
        extraBrands.addEventListener('show.bs.collapse', () => { toggleBtn.textContent = '- Ver menos'; });
        extraBrands.addEventListener('hide.bs.collapse', () => { toggleBtn.textContent = '+ Ver todas'; });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        syncLoginState();
        location.hash = '#inicio';
        alert('Você saiu da conta com sucesso.');
    });

    document.getElementById('paginationControls')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        const nextPage = Number(btn.dataset.page);
        if (!Number.isNaN(nextPage)) {
            currentPage = nextPage;
            renderMarketplace();
        }
    });

    document.body.addEventListener('click', async (e) => {
        const monetizeLeadBtn = e.target.closest('.monetize-lead');
        if (monetizeLeadBtn) {
            const id = monetizeLeadBtn.dataset.id;
            const type = monetizeLeadBtn.dataset.type;
            const val = prompt("Por quanto este Lead foi vendido para o parceiro? (R$):", "50");
            
            if (val !== null) {
                const amount = numericValue(val);
                if (type === '#admin-leads-finance') {
                    const leads = getFinanceLeads();
                    saveFinanceLeads(leads.map(l => String(l.id) === String(id) ? { ...l, status: 'Vendido', monetizationValue: amount } : l));
                } else {
                    const leads = getInsuranceLeads();
                    saveInsuranceLeads(leads.map(l => String(l.id) === String(id) ? { ...l, status: 'Vendido', monetizationValue: amount } : l));
                }
                
                addAdminLog('Monetização Lead', `Lead #${id}`, `Vendido por R$ ${formatMoney(amount)}`);
                alert("Lead monetizado com sucesso!");
                renderAdminLeads(type);
            }
            return;
        }

        const loadDraftBtn = e.target.closest('.load-draft');
        if (loadDraftBtn) {
            const id = loadDraftBtn.dataset.id;
            
            // Ativa feedback visual de carregamento
            const originalHTML = loadDraftBtn.innerHTML;
            loadDraftBtn.disabled = true;
            renderHTML(loadDraftBtn, '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
            startLoading();

            let draft;
            try {
                draft = await db.getDraftById(id);
            } finally {
                stopLoading();
                loadDraftBtn.disabled = false;
                renderHTML(loadDraftBtn, originalHTML);
            }

            if (draft) {
                location.hash = '#cadastro-veiculo';
                const targetForm = document.getElementById('cadastroForm');
                if (targetForm) {
                    targetForm.reset();
                    const photoSlots = document.querySelectorAll('.photo-strip > div:not(.upload-tile)');
                    photoSlots.forEach(s => { s.style.backgroundImage = ''; s.replaceChildren(); });

                    // Preenche campos de texto, select e textarea
                    Object.keys(draft).forEach(key => {
                        const input = targetForm.querySelector(`[name="${key}"]`);
                        if (input && input.type !== 'checkbox' && input.type !== 'file') {
                            input.value = draft[key];
                        }
                    });

                    // Preenche as checkboxes (features)
                    if (Array.isArray(draft.features)) {
                        targetForm.querySelectorAll('input[name="features"]').forEach(ck => {
                            ck.checked = draft.features.includes(ck.value);
                        });
                    }

                    // Restaura a imagem no primeiro slot se houver
                    if (draft.image) {
                        const firstSlot = document.querySelector('.photo-strip > div:not(.upload-tile)');
                        if (firstSlot) {
                            firstSlot.style.backgroundImage = `url('${draft.image}')`;
                            firstSlot.style.backgroundSize = 'cover';
                            firstSlot.style.backgroundPosition = 'center';
                            firstSlot.style.position = 'relative';
                            renderHTML(firstSlot, '<button type="button" class="remove-img-btn" style="position:absolute; top:2px; right:2px; background:rgba(255,0,0,0.7); color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;">&times;</button>');
                        }
                    }
                    updateFormPreview();
                }
            }
            return;
        }

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
            const vehicle = getVehicles().find(v => v.title === vehicleTitle);

            proposals.push({
                id: Date.now(),
                clientEmail: session.email,
                recipientEmail: vehicle?.ownerEmail || 'contato@autonorte.com', // Definindo destino
                agency: agency, // Mantido para compatibilidade visual
                message: `Olá, tenho interesse no veículo ${vehicleTitle}. Por favor, entre em contato.`,
                date: new Date().toLocaleDateString(),
                unread: true
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
            slot.textContent = '';
            updateFormPreview();
            return;
        }

        const insuranceQuoteBtn = e.target.closest('.insurance-quote-btn');
        if (insuranceQuoteBtn) {
            openInsuranceModal(insuranceQuoteBtn.dataset.id);
            return;
        }

        const banUserBtn = e.target.closest('.ban-user');
        if (banUserBtn) {
            const email = banUserBtn.dataset.email;
            const name = banUserBtn.dataset.name;
            userToBan = { email, name };
            
            // Preenche o modal visualmente
            document.getElementById('banUserNameDisplay').textContent = name;
            document.getElementById('banUserEmailDisplay').textContent = email;
            document.getElementById('banReasonInput').value = '';
            
            // Abre o modal do Bootstrap
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('banUserModal'));
            modal.show();
            return;
        }

        const reportVehicleBtn = e.target.closest('.report-vehicle-btn');
        if (reportVehicleBtn) {
            const id = reportVehicleBtn.dataset.id;
            const reason = prompt("Por que você deseja denunciar este anúncio? (Ex: Fraude, Veículo já vendido, Conteúdo ofensivo)");
            if (reason) {
                const reports = getReports();
                reports.push({
                    id: Date.now(),
                    vehicleId: id,
                    reason: reason,
                    date: new Date().toLocaleDateString(),
                    status: 'Pendente'
                });
                saveReports(reports);
                alert("Denúncia enviada com sucesso. Nossa equipe irá analisar.");
            }
            return;
        }

        const dismissReportBtn = e.target.closest('.dismiss-report');
        if (dismissReportBtn) {
            const id = dismissReportBtn.dataset.id;
            const reports = getReports().filter(r => String(r.id) !== String(id));
            saveReports(reports);
            renderAdminDashboard();
            return;
        }

        const deleteReportAdBtn = e.target.closest('.delete-report-ad');
        if (deleteReportAdBtn) {
            const vehicleId = deleteReportAdBtn.dataset.vehicleId;
            const reportId = deleteReportAdBtn.dataset.id;
            const report = getReports().find(r => String(r.id) === String(reportId));
            const vehicle = getVehicles().find(v => String(v.id) === String(vehicleId));
            
            if (confirm("Tem certeza que deseja remover este anúncio permanentemente?")) {
                if (vehicle) {
                    addAdminLog('Remoção via Denúncia', vehicle.title, report?.reason || 'Denúncia aceita');
                }

                const vehicles = getVehicles().filter(v => String(v.id) !== String(vehicleId));
                saveVehicles(vehicles);
                
                // Remove todas as denúncias vinculadas a este veículo
                const reports = getReports().filter(r => String(r.vehicleId) !== String(vehicleId));
                saveReports(reports);
                
                renderAdminDashboard();
            }
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
                document.getElementById('cadastro-title').textContent = 'Editar Veículo';
                form.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
                
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

        const financeBtn = e.target.closest('.finance-sim-btn');
        if (financeBtn) {
            const price = financeBtn.dataset.price;
            openFinanceSimulator(price);
            return;
        }

        const chatItem = e.target.closest('.chat-list-item');
        if (chatItem) {
            const id = chatItem.dataset.id;
            activeChatId = id;
            
            // Marca a conversa como lida ao clicar
            const allProposals = getProposals();
            const updated = allProposals.map(p => 
                String(p.id) === String(id) ? { ...p, unread: false } : p
            );
            saveProposals(updated);

            // Re-renderiza o dashboard para atualizar a área de chat
            renderClientDashboard();
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
            const vehicle = getVehicles().find(v => String(v.id) === String(id));
            
            const reason = prompt(`Confirme o motivo da exclusão do veículo: ${vehicle?.title}`);
            if (reason) {
                addAdminLog('Exclusão Direta', vehicle.title, reason);
                const vehicles = getVehicles().filter(v => String(v.id) !== String(id));
                saveVehicles(vehicles);
                
                renderAdminDashboard();
                renderMarketplace();
            }
            return;
        }

        const pauseBtn = e.target.closest('.pause-vehicle');
        if (pauseBtn) {
            const id = pauseBtn.dataset.id;
            let vehicles = getVehicles();
            vehicles = vehicles.map(v => {
                if (String(v.id) === String(id)) {
                    return { ...v, status: v.status === 'Pausado' ? 'Ativo' : 'Pausado' };
                }
                return v;
            });
            saveVehicles(vehicles);
            renderClientDashboard();
            return;
        }

        const soldBtn = e.target.closest('.sold-vehicle');
        if (soldBtn) {
            const id = soldBtn.dataset.id;
            let vehicles = getVehicles();
            vehicles = vehicles.map(v => String(v.id) === String(id) ? { ...v, status: 'Vendido' } : v);
            saveVehicles(vehicles);
            renderClientDashboard();
            return;
        }
    });

    // Listener para o botão de confirmação dentro do Modal de Banimento
    document.getElementById('confirmBanBtn')?.addEventListener('click', () => {
        if (!userToBan) return;
        
        const reason = document.getElementById('banReasonInput').value.trim();
        if (!reason) {
            alert('Por favor, informe o motivo do banimento para prosseguir.');
            return;
        }

        // 1. Registrar a ação no Log de Auditoria
        addAdminLog('Banimento Global', `Usuário: ${userToBan.name} (${userToBan.email})`, reason);

        // 2. Remover todos os veículos vinculados a este e-mail
        const vehicles = getVehicles().filter(v => String(v.ownerEmail).toLowerCase() !== String(userToBan.email).toLowerCase());
        saveVehicles(vehicles);

        // 3. Remover o usuário da lista de clientes
        const clients = getClients().filter(c => String(c.email).toLowerCase() !== String(userToBan.email).toLowerCase());
        saveClients(clients);

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('banUserModal'));
        modal.hide();

        alert(`Usuário ${userToBan.name} foi banido com sucesso.`);
        userToBan = null;
        
        renderAdminDashboard();
        renderMarketplace();
    });
}

function renderClientDashboard() {
    const session = getSession();
    const container = document.getElementById('cliente'); 
    if (!container || !session) return;
    
    const wishlist = getWishlist();
    const allVehicles = getVehicles();
    const myVehicles = allVehicles.filter(v => String(v.ownerEmail).toLowerCase() === String(session.email).toLowerCase());
    const favVehicles = allVehicles.filter(v => wishlist.includes(String(v.id)));
    const myProposals = getProposals().filter(p => p.clientEmail === session.email || p.recipientEmail === session.email);
    const displayName = session.name || 'Usuário';

    // Cálculos de métricas PF
    const activeAds = myVehicles.filter(v => !v.status || v.status === 'Ativo').length;
    const soldAds = myVehicles.filter(v => v.status === 'Vendido').length;
    const totalViews = myVehicles.reduce((acc, v) => acc + (v.views || 0), 0);
    const unreadCount = myProposals.filter(p => p.unread).length;
    
    const isMessagesView = location.hash === '#mensagens';
    const isSettingsView = location.hash === '#perfil';

    // Determina qual proposta exibir no chat
    const activeProposal = myProposals.find(p => String(p.id) === String(activeChatId)) || myProposals[0];
    if (activeProposal && !activeChatId) activeChatId = activeProposal.id;

    // Se a proposta ativa estiver sendo exibida e estiver não lida, marca como lida automaticamente
    if (isMessagesView && activeProposal && activeProposal.unread) {
        activeProposal.unread = false;
        const allProposals = getProposals();
        const updated = allProposals.map(p => String(p.id) === String(activeProposal.id) ? { ...p, unread: false } : p);
        saveProposals(updated);
    }

    // Conteúdo Principal do Dashboard
    const dashboardContent = `
        <div class="metric-grid mb-4">
            <article class="metric-card">
                <span class="metric-icon">🚗</span>
                <p>Anúncios ativos</p>
                <strong>${activeAds}</strong>
                ${calculateGrowthHtml(activeAds)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">💰</span>
                <p>Anúncios vendidos</p>
                <strong>${soldAds}</strong>
                ${calculateGrowthHtml(soldAds)}
            </article>
            <article class="metric-card">
                <span class="metric-icon">💬</span>
                        <p>Mensagens</p>
                <strong>${myProposals.length}</strong>
                        ${unreadCount > 0 ? `<small style="color: var(--color-accent); font-weight: bold;">${unreadCount} não lidas</small>` : '<small class="text-muted">Todas lidas</small>'}
            </article>
            <article class="metric-card">
                <span class="metric-icon">👁️</span>
                <p>Visualizações</p>
                <strong>${totalViews.toLocaleString()}</strong>
                ${calculateGrowthHtml(totalViews)}
            </article>
        </div>

        <section class="panel">
            <div class="panel-header">
                <h3>Meus Anúncios</h3>
                <a href="#cadastro-veiculo" class="btn btn-sm btn-dark">+ Novo Anúncio</a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th>Foto</th>
                            <th>Título</th>
                            <th>Preço</th>
                            <th>Status</th>
                            <th>Visualizações</th>
                            <th class="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myVehicles.length ? myVehicles.map(v => {
                            const statusClass = v.status === 'Vendido' ? 'bg-secondary-soft' : 
                                               v.status === 'Pausado' ? 'bg-warning-soft' : 'bg-success-soft';
                            return `
                            <tr>
                                <td><img src="${v.image}" class="rounded" style="width:60px;height:45px;object-fit:cover;"></td>
                                <td><strong>${v.title}</strong></td>
                                <td>R$ ${formatMoney(v.price)}</td>
                                <td><span class="status-badge ${statusClass}">${v.status || 'Ativo'}</span></td>
                                <td>${v.views || 0}</td>
                                <td class="text-end">
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-dark edit-vehicle" data-id="${v.id}">✏️</button>
                                        <button class="btn btn-sm btn-outline-dark pause-vehicle" data-id="${v.id}">⏸️</button>
                                        <button class="btn btn-sm btn-outline-success sold-vehicle" data-id="${v.id}">💰</button>
                                        <button class="btn btn-sm btn-outline-danger delete-vehicle" data-id="${v.id}">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                            `;
                        }).join('') : '<tr><td colspan="6" class="text-center py-4 text-muted">Você ainda não possui anúncios.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </section>
    `;

    // Conteúdo de Configurações (Perfil)
    const settingsContent = `
        <section class="panel">
            <div class="panel-header">
                <h3>Editar Perfil</h3>
            </div>
            <form id="editProfileForm" class="auth-form">
                <div class="auth-field mb-3 text-center">
                    <div class="avatar mx-auto mb-3" style="width:96px;height:96px;overflow:hidden;border-radius:50%;background:#f2f2f2;display:flex;align-items:center;justify-content:center;">
                        ${session.image ? `<img src="${session.image}" alt="Logo da loja" style="width:100%;height:100%;object-fit:cover;">` : displayName[0].toUpperCase()}
                    </div>
                </div>
                <div class="auth-field mb-3">
                    <label class="fw-bold">Foto de Perfil</label>
                    <input type="file" id="profilePhotoInput" class="form-control" accept="image/*">
                </div>
                <div class="auth-field mb-3">
                    <label class="fw-bold">Nome Completo</label>
                    <input type="text" name="name" value="${displayName}" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-dark w-100 py-2">Salvar Alterações</button>
            </form>
        </section>
    `;

    // Conteúdo da Visualização de Mensagens (Chat)
    const messagesContent = `
        <div class="chat-container">
            <aside class="chat-sidebar">
                <div class="p-3 border-bottom bg-light">
                    <input type="text" class="form-control form-control-sm" placeholder="Buscar conversas...">
                </div>
                <div class="chat-list">
                    ${myProposals.length ? myProposals.map((p, idx) => `
                        <div class="chat-list-item ${String(p.id) === String(activeChatId) ? 'active' : ''}" data-id="${p.id}">
                            <div class="d-flex justify-content-between mb-1">
                                <strong class="d-flex align-items-center">
                                    ${p.agency}
                                    ${p.unread ? '<span class="unread-dot" title="Mensagem não lida"></span>' : ''}
                                </strong>
                                <small class="text-muted">${p.date}</small>
                            </div>
                            <p class="mb-0 text-muted small text-truncate">${p.message}</p>
                        </div>
                    `).join('') : '<p class="p-4 text-center text-muted">Nenhuma conversa encontrada.</p>'}
                </div>
            </aside>
            <main class="chat-main">
                ${activeProposal ? `
                    <div class="p-3 border-bottom d-flex align-items-center justify-content-between bg-white">
                        <strong>${activeProposal.agency}</strong>
                        <button class="btn btn-sm btn-outline-dark">Ver anúncio</button>
                    </div>
                    <div class="chat-history">
                        <div class="chat-bubble received">Olá, ${displayName.split(' ')[0]}! Recebemos seu interesse. O carro ainda está disponível em nossa loja em São Paulo. Gostaria de agendar uma visita?</div>
                        <div class="chat-bubble sent">${activeProposal.message}</div>
                        <div class="chat-bubble received">Perfeito. Estamos abertos até as 18h. Precisa de uma simulação de financiamento?</div>
                    </div>
                    <div class="p-3 border-top bg-white">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Digite sua mensagem...">
                            <button class="btn btn-primary">Enviar</button>
                        </div>
                    </div>
                ` : `
                    <div class="h-100 d-flex align-items-center justify-content-center text-muted">
                        Selecione uma conversa para visualizar
                    </div>
                `}
            </main>
        </div>
    `;

    renderHTML(container, `
        <div class="app-shell">
            <aside class="app-sidebar">
                <div class="app-brand-card">
                    <div class="avatar" id="profileAvatarDisplay">${session.image ? `<img src="${session.image}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : displayName[0].toUpperCase()}</div>
                    <div>
                        <strong>${displayName}</strong>
                        <small>Pessoa Física</small>
                    </div>
                </div>
                <nav>
                    <a href="#cliente" class="${!isMessagesView && !isSettingsView ? 'active' : ''}">🏠 Dashboard</a>
                    <a href="#cliente">🚗 Meus anúncios</a>
                    <a href="#cadastro-veiculo">➕ Novo anúncio</a>
                    <a href="#mensagens" class="${isMessagesView ? 'active' : ''}">💬 Mensagens</a>
                    <a href="#marketplace">⭐ Favoritos</a>
                    <a href="#perfil" class="${isSettingsView ? 'active' : ''}">⚙️ Configurações</a>
                    <hr class="mx-3">
                    <a href="#inicio" id="logoutDashboard">↪️ Sair</a>
                </nav>
            </aside>

            <main class="app-content">
                <div class="page-heading">
                    <div>
                        <p class="eyebrow">${isMessagesView ? 'Central de Mensagens' : isSettingsView ? 'Configurações' : 'Area do Usuário'}</p>
                        <h2>${isMessagesView ? 'Minhas Conversas' : isSettingsView ? 'Meu Perfil' : 'Painel de Controle'}</h2>
                    </div>
                </div>

                ${isMessagesView ? messagesContent : isSettingsView ? settingsContent : dashboardContent}
            </main>
        </div>
    `);

    // Dispara animação nos KPIs do Cliente
    container.querySelectorAll('.metric-card strong').forEach(el => animateCountUp(el));

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
            if (fileInput.files[0].size > MAX_FILE_SIZE) {
                alert('A foto de perfil não pode exceder 10MB.');
                btn.disabled = false;
                btn.textContent = originalText;
                return;
            }

            startLoading();
            const resizedFile = await resizeImage(fileInput.files[0], 400, 400);
            const res = await uploadParaCloudinary(resizedFile);
            stopLoading();
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

function setLandingVisible(isVisible, showHero = true) {
    const hero = document.querySelector('.hero');
    const marketplace = document.querySelector('.marketplace-section');
    hero?.toggleAttribute('hidden', !isVisible || !showHero);
    marketplace?.toggleAttribute('hidden', !isVisible);
}

function showView(id) {
    setLandingVisible(false);
    startLoading();
    document.querySelectorAll('section.view').forEach(s => {
        if (s.id === id) {
            s.removeAttribute('hidden');
        } else {
            s.setAttribute('hidden', '');
        }
    });
    setTimeout(stopLoading, 300); // Simula o tempo de renderização da view
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLanding(showHero = true) {
    document.querySelectorAll('section.view').forEach(s => s.setAttribute('hidden', ''));
    setLandingVisible(true, showHero);
}

/**
 * Atualiza os breadcrumbs baseando-se no hash atual
 */
function updateBreadcrumbs(hash) {
    // Garante que os veículos existam para que o breadcrumb consiga pegar o nome do modelo
    seedIfEmpty();
    
    const container = document.getElementById('breadcrumb-nav');
    if (!container) return;

    if (hash === '#inicio' || !hash || hash === '') {
        container.classList.add('d-none');
        return;
    }

    container.classList.remove('d-none');
    const crumbs = [{ label: 'Início', link: '#inicio' }];

    // Mapeamento de rótulos estáticos
    const labels = {
        '#marketplace': 'Marketplace',
        '#marketplace-todos': 'Marketplace',
        '#marketplace-0km': 'Carros 0km',
        '#marketplace-seminovos': 'Seminovos',
        '#revendas': 'Revendas Credenciadas',
        '#cadastro-veiculo': 'Anunciar Veículo',
        '#anuncie': 'Login',
        '#criar-conta': 'Cadastro',
        '#sobre': 'Sobre',
        '#termos': 'Termos de Uso',
        '#ajuda': 'Ajuda e Contato',
        '#lojista': 'Painel do Lojista',
        '#cliente': 'Área do Cliente',
        '#admin': 'Administração'
    };

    if (hash.startsWith('#veiculo-')) {
        crumbs.push({ label: 'Marketplace', link: '#marketplace' });
        const id = hash.replace('#veiculo-', '');
        const v = getVehicles().find(x => String(x.id) === String(id));
        crumbs.push({ label: v ? v.title : 'Detalhes', link: hash });
    } else if (labels[hash]) {
        crumbs.push({ label: labels[hash], link: hash });
    }

    const breadcrumbList = container.querySelector('.breadcrumb');
    breadcrumbList.innerHTML = crumbs.map((c, i) => 
        i === crumbs.length - 1 
        ? `<li class="breadcrumb-item active" aria-current="page">${c.label}</li>`
        : `<li class="breadcrumb-item"><a href="${c.link}" class="text-decoration-none">${c.label}</a></li>`
    ).join('');
}

function router() {
    const hash = location.hash || '#inicio';
    updateBreadcrumbs(hash);

    if (hash.startsWith('#veiculo-')) {
        const id = hash.replace('#veiculo-', '');
        showView('visualizacao-veiculo');
        renderVehicleDetail(id);
        return;
    }

    // Limpa a intenção de redirecionamento se o usuário navegar para fora do fluxo de autenticação/anúncio
    if (hash !== '#anuncie' && hash !== '#criar-conta' && !hash.startsWith('#cadastro-veiculo')) {
        redirectAfterLogin = null;
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
        case '#anunciar':
        case '#cadastro':
        case '#cadastro-veiculo':
            const sessionAnnounce = getSession();
            if (!sessionAnnounce) {
                redirectAfterLogin = hash;
                location.hash = '#anuncie';
                return;
            }
            
            const cadForm = document.getElementById('cadastroForm');
            const isEditMode = cadForm?.dataset.editId;
            if (cadForm && !isEditMode) {
                // Reseta o formulário para modo de cadastro normal
                cadForm.reset();
                delete cadForm.dataset.editId;
                document.getElementById('cadastro-title').textContent = 'Cadastrar Veiculo';
                cadForm.querySelector('button[type="submit"]').textContent = 'Publicar anuncio';
                // Limpa visualização de fotos
                document.querySelectorAll('.photo-strip > div:not(.upload-tile)').forEach(s => { 
                    s.style.backgroundImage = ''; 
                    s.replaceChildren(); 
                });
                updateFormPreview();
            } else if (cadForm && isEditMode) {
                document.getElementById('cadastro-title').textContent = 'Editar Veículo';
                cadForm.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
                updateFormPreview();
            }
            showView('cadastro-veiculo');
            
            const agencySelect = document.getElementById('agencySelect');
            const agencyLabel = agencySelect?.closest('label');
            if (agencySelect && agencyLabel) {
                if (sessionAnnounce.role === 'admin') {
                    agencyLabel.style.display = 'block';
                    const stores = getStores();
                    renderHTML(agencySelect, '<option value="">Selecione a loja</option>' + 
                        stores.map(s => `<option value="${s.storeName}">${s.storeName}</option>`).join(''));
                } else {
                    agencyLabel.style.display = 'none';
                    const agencyName = sessionAnnounce.role === 'seller' ? sessionAnnounce.name : 'Particular';
                    renderHTML(agencySelect, `<option value="${agencyName}" selected>${agencyName}</option>`);
                }
            }
            break;
        case '#login':
        case '#anuncie':
            const sAnuncie = getSession();
            if (sAnuncie) {
                // Se já estiver logado, leva para o painel correspondente
                if (sAnuncie.role === 'seller') location.hash = '#lojista';
                else location.hash = '#cliente';
            } else {
                showView('anuncie');
                // Exibe o aviso se o usuário foi redirecionado ao tentar realizar uma ação restrita
                const loginAlert = document.getElementById('login-alert');
                if (loginAlert) {
                    loginAlert.classList.toggle('d-none', !redirectAfterLogin);
                }
            }
            break;
        case '#revendas':
            showView('revendas-lista');
            renderResellers();
            break;
        case '#lojas-especializadas':
        case '#cadastre-loja':
            showView('cadastre-loja');
            break;
        case '#criar-conta':
            showView('criar-conta');
            break;
        case '#recuperar-senha':
            showView('recuperar-senha');
            // Reseta o estado da view caso o usuário retorne após uma tentativa
            const recForm = document.getElementById('recuperarSenhaForm');
            const recAlert = document.getElementById('recuperarSucesso');
            if (recForm) recForm.classList.remove('d-none');
            if (recAlert) recAlert.classList.add('d-none');
            break;
        case '#simular-financiamento':
            openFinanceSimulator();
            break;
        case '#cotar-seguro':
            openInsuranceModal();
            break;
        case '#admin':
            setSessionFromHref('#admin');
            showView('admin');
            renderAdminDashboard();
            break;
        case '#mensagens':
        case '#perfil':
            const sDashboard = getSession();
            if (sDashboard?.role === 'seller') {
                showView('lojista');
                renderLojistaDashboard();
                document.getElementById(hash === '#perfil' ? 'editLojistaProfileForm' : 'lojista')?.scrollIntoView({ behavior: 'smooth' });
            } else if (sDashboard?.role === 'client') {
                showView('cliente');
                renderClientDashboard();
                document.getElementById(hash === '#perfil' ? 'editProfileForm' : 'cliente')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                location.hash = '#inicio';
            }
            break;
        case '#lojista':
        case '#relatorios':
        case '#lojista-estoque':
            setSessionFromHref('#lojista');
            showView('lojista');
            renderLojistaDashboard();
            break;
        case '#cliente':
            setSessionFromHref('#cliente');
            showView('cliente');
            renderClientDashboard();
            break;
        case '#simular-servico':
            alert('Módulo de financiamento e seguros disponível em breve.');
            location.hash = '#inicio';
            break;
        case '#sobre-section':
        case '#sobre':
            showView('sobre');
            break;
        case '#termos':
            showView('termos');
            break;
        case '#ajuda':
            showView('ajuda');
            break;
        default:
            showLanding();
    }
}

function initRouter() {
    window.addEventListener('hashchange', router);
    seedIfEmpty();
    renderMarketplace();
    if (!location.hash) {
        history.replaceState(null, '', `${location.pathname}${location.search}#inicio`);
    }
    router();
}
