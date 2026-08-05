// Configura tus credenciales de Supabase aquí
const SUPABASE_URL = 'supabase link --project-ref evkrywrkptsitgijmexo
';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2a3J5d3JrcHRzaXRnaWptZXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjI5NzcsImV4cCI6MjEwMTQ5ODk3N30.nqzl6gOpJeXZm3xUW5N9sIjm8yQIHUlrwS-YXf1IvSk0';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('uploadForm');
const statusMessage = document.getElementById('statusMessage');
const galleryContainer = document.getElementById('galleryContainer');

// Contraseña secreta para poder borrar imágenes
const ADMIN_PASSWORD = '22185'; 

document.addEventListener('DOMContentLoaded', loadGallery);

// Subir imagen a Cloudinary y registrarla en Supabase
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cloudName = document.getElementById('cloudName').value.trim();
    const uploadPreset = document.getElementById('uploadPreset').value.trim();
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];

    if (!file) return;

    statusMessage.style.color = '#38bdf8';
    statusMessage.textContent = 'Subiendo imagen...';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message || 'Error al subir');

        // Guardar la URL en Supabase
        const { error } = await supabase
            .from('images')
            .insert([{ url: data.secure_url, likes: 0 }]);

        if (error) throw error;

        statusMessage.style.color = '#4ade80';
        statusMessage.textContent = '¡Imagen publicada con éxito!';
        form.reset();
        loadGallery();
    } catch (error) {
        statusMessage.style.color = '#f87171';
        statusMessage.textContent = `Error: ${error.message}`;
    }
});

// Cargar galería desde Supabase
async function loadGallery() {
    const { data: images, error } = await supabase
        .from('images')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error cargando galería:', error);
        return;
    }

    galleryContainer.innerHTML = '';

    if (images.length === 0) {
        galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8;">No hay imágenes todavía.</p>';
        return;
    }

    images.forEach(img => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${img.url}" alt="Imagen de galería">
            <div class="card-actions">
                <button class="action-btn like-btn" onclick="likeImage(${img.id}, ${img.likes})">
                    <i class="fa-solid fa-heart"></i> <span>${img.likes}</span>
                </button>
                <button class="action-btn share-btn" onclick="shareImage('${img.url}')">
                    <i class="fa-solid fa-share-nodes"></i> Compartir
                </button>
                <button class="action-btn delete-btn" onclick="deleteImage(${img.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        galleryContainer.appendChild(item);
    });
}

// Dar Like
async function likeImage(id, currentLikes) {
    const { error } = await supabase
        .from('images')
        .update({ likes: currentLikes + 1 })
        .eq('id', id);

    if (!error) loadGallery();
}

// Compartir enlace
function shareImage(url) {
    if (navigator.share) {
        navigator.share({
            title: 'Mira esta imagen',
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
    }
}

// Borrar protegido por contraseña (Solo para ti)
async function deleteImage(id) {
    const password = prompt('Introduce la contraseña de administrador para borrar:');
    if (password !== ADMIN_PASSWORD) {
        alert('Contraseña incorrecta.');
        return;
    }

    const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

    if (!error) {
        loadGallery();
    } else {
        alert('Error al eliminar la imagen.');
    }
}
