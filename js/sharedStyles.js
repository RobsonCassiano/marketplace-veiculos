/**
 * Utilitário para carregar o Bootstrap como um Constructable Stylesheet
 */
export const bootstrapSheet = new CSSStyleSheet();

// Marca que o módulo foi carregado
window.__sharedStylesLoaded = true;

// Carrega o arquivo CSS local e preenche o stylesheet
const loadBootstrap = async () => {
    try {
        // Usar caminho relativo ao invés de absoluto fixo para evitar erros em diferentes domínios/subpastas
        const url = './dist/css/bootstrap.min.css';
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