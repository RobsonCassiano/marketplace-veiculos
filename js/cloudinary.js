const CLOUD_NAME = 'dhduuabvu'
const PRESENT_NAME = 'fotos_contato'

export async function uploadParaCloudinary(file) {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', PRESENT_NAME)

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const options = {
        method: 'POST',
        body: data
    }

    const response = await fetch(url, options)
    return await response.json()
}