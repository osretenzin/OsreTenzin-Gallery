const form = document.getElementById('uploadForm');
const statusMessage = document.getElementById('statusMessage');
const galleryContainer = document.getElementById('galleryContainer');

// Cargar las imágenes guardadas al abrir la página
document.addEventListener('DOMContentLoaded', loadGalleryFromStorage);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cloudName = document.getElementById('cloudName').value.trim();
    const uploadPreset = document.getElementById('uploadPreset').value.trim();
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];

    if (!file) return;

    statusMessage.style.color = '#38bdf8';
    statusMessage.textContent = 'Subiendo imagen a Cloudinary...';

    // Preparar los datos para enviarlos a Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            statusMessage.style.color = '#4ade80';
            statusMessage.textContent = '¡Imagen subida con éxito!';
            
            // Guardar la URL segura que nos da Cloudinary
            saveImageToStorage(data.secure_url);
            
            form.reset();
            loadGalleryFromStorage();
        } else {
            throw new Error(data.error.message || 'Error al subir la imagen');
        }
    } catch (error) {
        statusMessage.style.color = '#f87171';
        statusMessage.textContent = `Error: ${error.message}`;
    }
});

// Guardar URLs en el almacenamiento local del navegador para mantener la galería
function saveImageToStorage(url) {
    let images = JSON.parse(localStorage.getItem('cloudinary_images')) || [];
    images.unshift(url); // Añadir al inicio
    localStorage.setItem('cloudinary_images', JSON.stringify(images));
}

// Cargar y mostrar las imágenes en la galería
function loadGalleryFromStorage() {
    let images = JSON.parse(localStorage.getItem('cloudinary_images')) || [];
    galleryContainer.innerHTML = '';

    if (images.length === 0) {
        galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8;">No hay imágenes todavía.</p>';
        return;
    }

    images.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Imagen de galería">`;
        galleryContainer.appendChild(item);
    });
}
