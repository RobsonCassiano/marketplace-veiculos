/**
 * Utilitário para carregar o Bootstrap como um Constructable Stylesheet
 */
export const bootstrapSheet = new CSSStyleSheet();

// Marca que o módulo foi carregado
window.__sharedStylesLoaded = true;

// Carrega o arquivo CSS local e preenche o stylesheet
const loadBootstrap = async () => {
    try {
        // Determinar o caminho base correto
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port ? ':' + window.location.port : '';
        const baseUrl = `${protocol}//${hostname}${port}/marketplace-veiculos`;
        
        const url = baseUrl + '/dist/css/bootstrap.min.css';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cssText = await response.text();
        bootstrapSheet.replaceSync(cssText);
        window.__bootstrapCSSLoaded = true;
    } catch (err) {
        window.__bootstrapCSSError = err.message;
        console.error('Falha ao carregar os estilos do Bootstrap:', err);
    }
};

// Inicia o carregamento imediatamente
loadBootstrap();