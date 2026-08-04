const form = document.getElementById('uploadForm');
const statusMessage = document.getElementById('statusMessage');
const galleryContainer = document.getElementById('galleryContainer');

// Manejar la subida de la imagen
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = document.getElementById('githubToken').value.trim();
    const repo = document.getElementById('repoName').value.trim(); // Formato: "usuario/repositorio"
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];

    if (!file) return;

    statusMessage.style.color = '#38bdf8';
    statusMessage.textContent = 'Subiendo imagen a GitHub...';

    // Convertir la imagen a Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = `images/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const url = `https://api.github.com/repos/${repo}/contents/${fileName}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Sube nueva imagen: ${file.name}`,
                    content: base64Content
                })
            });

            if (response.ok) {
                statusMessage.style.color = '#4ade80';
                statusMessage.textContent = '¡Imagen subida con éxito! GitHub Pages tardará un minuto en reflejarla.';
                form.reset();
                loadGallery(repo);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al subir la imagen');
            }
        } catch (error) {
            statusMessage.style.color = '#f87171';
            statusMessage.textContent = `Error: ${error.message}`;
        }
    };
});

// Función para cargar automáticamente las imágenes de la carpeta "images/" del repositorio
async function loadGallery(repoDefault = '') {
    // Si ya tienes un repo predeterminado puedes ponerlo aquí para no escribirlo siempre, ej: "tu-usuario/tu-repo"
    const repoInput = document.getElementById('repoName').value.trim() || repoDefault;
    if (!repoInput) return;

    const url = `https://api.github.com/repos/${repoInput}/contents/images`;

    try {
        const response = await fetch(url);
        if (!response.ok) return; // Si la carpeta no existe aún, no hace nada
        
        const files = await response.json();
        galleryContainer.innerHTML = ''; // Limpiar galería

        // Filtrar solo archivos de imagen
        const images = files.filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file.name));

        if (images.length === 0) {
            galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8;">No hay imágenes todavía.</p>';
            return;
        }

        images.forEach(img => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            // Usamos la URL raw de GitHub para mostrar la imagen en alta calidad
            item.innerHTML = `<img src="${img.download_url}" alt="${img.name}">`;
            galleryContainer.appendChild(item);
        });
    } catch (error) {
        console.error('No se pudo cargar la galería automáticamente:', error);
    }
}

// Opcional: Si quieres que cargue la galería automáticamente al entrar, 
// puedes rellenar tu "usuario/repositorio" aquí abajo:
// window.addEventListener('DOMContentLoaded', () => loadGallery("tu-usuario/nombre-de-tu-repo"));
              
