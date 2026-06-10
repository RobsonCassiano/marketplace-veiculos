const CLOUD_NAME = 'dhduuabvu'
const PRESENT_NAME = 'carros_mkt'
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 segundo

export async function uploadParaCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    let delay = INITIAL_DELAY;

    for (let i = 0; i < MAX_RETRIES; i++) {
        const data = new FormData()
        data.append('file', file)
        data.append('upload_preset', PRESENT_NAME)

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: data
            });

            if (!response.ok) {
                // Se for um erro de cliente (4xx)
                if (response.status >= 400 && response.status < 500) {
                    const errorData = await response.json();
                    throw new Error(`Cloudinary Client Error (${response.status}): ${errorData.error?.message || response.statusText}`);
                }
                // Erros de servidor (5xx) caem aqui
                throw new Error(`Server Error (${response.status})`);
            }

            const result = await response.json();
            console.log('Upload concluído com sucesso:', result);
            return result;

        } catch (error) {
            const isLastAttempt = i === MAX_RETRIES - 1;
            const isClientError = error.message.includes('Cloudinary Client Error');

            // Se for erro de configuração/cliente ou a última tentativa, desiste e lança o erro
            if (isClientError || isLastAttempt) {
                console.error(`Falha definitiva no upload após ${i + 1} tentativa(s):`, error);
                throw error;
            }

            console.warn(`Tentativa ${i + 1} falhou. Retentando em ${delay}ms...`, error);
            
            // Aguarda antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Aumenta o tempo de espera exponencialmente
        }
    }
}