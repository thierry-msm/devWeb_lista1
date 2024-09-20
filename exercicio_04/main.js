document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const locationBtn = document.getElementById('get-location-btn');
    const manualLocationBtn = document.getElementById('manual-location-btn');
    const manualLocationInput = document.getElementById('manual-location-input');
    const savePhotoBtn = document.getElementById('save-photo-btn');
    const photoTableBody = document.querySelector('#photo-table tbody');
    const mapContainer = document.getElementById('map-container');
    let map;  // Variável global para o mapa

    let photoData = JSON.parse(localStorage.getItem('photos')) || [];
    let currentLocation = null;
    let editId = null;
    let currentPhotoURL = null;

    // Acessar a câmera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => video.srcObject = stream)
            .catch(() => alert('Câmera não encontrada ou acesso negado.'));
    }

    // Função para exibir a foto no canvas e ocultar o vídeo
    function displayPhoto(photoURL) {
        canvas.style.display = 'block';
        video.style.display = 'none';
        const context = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = photoURL;
    }

    // Tirar foto
    captureBtn.addEventListener('click', () => {
        if (video.srcObject) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            currentPhotoURL = canvas.toDataURL('image/png');
            displayPhoto(currentPhotoURL);
            alert('Foto capturada com sucesso!');
        } else {
            alert('Câmera não está disponível.');
        }
    });

    // Upload de foto
    uploadBtn.addEventListener('click', () => {
        document.getElementById('upload-photo').click();
    });

    document.getElementById('upload-photo').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);
                    currentPhotoURL = canvas.toDataURL('image/png');
                    displayPhoto(currentPhotoURL);
                    alert('Foto carregada com sucesso!');
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // Marcar localização atual
    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                document.getElementById('location-info').textContent = `Localização: ${currentLocation.lat}, ${currentLocation.lon}`;
            }, () => alert('Não foi possível acessar a localização, insira manualmente.'));
        } else {
            alert('Geolocalização não suportada, insira manualmente.');
        }
    });

    // Inserir localização manualmente
    manualLocationBtn.addEventListener('click', () => {
        if (manualLocationInput.style.display === 'none' || manualLocationInput.style.display === '') {
            manualLocationInput.style.display = 'block';
            manualLocationInput.focus();
        } else {
            manualLocationInput.style.display = 'none';
        }
    });

    manualLocationInput.addEventListener('blur', () => {
        const inputValue = manualLocationInput.value.trim();
        if (inputValue) {
            const [lat, lon] = inputValue.split(',').map(coord => parseFloat(coord.trim()));
            if (!isNaN(lat) && !isNaN(lon)) {
                currentLocation = { lat, lon };
                document.getElementById('location-info').textContent = `Localização manual: ${currentLocation.lat}, ${currentLocation.lon}`;
                manualLocationInput.style.display = 'none';
            } else {
                alert('Coordenadas inválidas. Use o formato: "latitude, longitude".');
            }
        }
    });

    // Salvar foto com informações
    savePhotoBtn.addEventListener('click', () => {
        const title = document.getElementById('photo-title').value.trim();
        const description = document.getElementById('photo-description').value.trim();

        if (!title) {
            alert('Título é obrigatório');
            return;
        }

        if (!currentPhotoURL) {
            alert('Por favor, tire ou faça upload de uma foto antes de salvar.');
            return;
        }

        if (!currentLocation) {
            alert('Por favor, marque a localização antes de salvar.');
            return;
        }

        const date = new Date().toLocaleString();
        const location = `${currentLocation.lat}, ${currentLocation.lon}`;

        if (editId !== null) {
            const photoIndex = photoData.findIndex(p => p.id === editId);
            if (photoIndex !== -1) {
                photoData[photoIndex] = { ...photoData[photoIndex], title, description, location, photoURL: currentPhotoURL };
                editId = null;
                alert('Foto editada com sucesso!');
            }
        } else {
            const id = photoData.length > 0 ? photoData[photoData.length - 1].id + 1 : 1;
            const newPhoto = { id, title, description, location, date, photoURL: currentPhotoURL };
            photoData.push(newPhoto);
            alert('Foto salva com sucesso!');
        }

        localStorage.setItem('photos', JSON.stringify(photoData));
        displayPhotos();
        clearForm();
        canvas.style.display = 'none';
        video.style.display = 'block';
    });

    function displayPhotos() {
        photoTableBody.innerHTML = '';
        photoData.forEach(photo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${photo.id}</td>
                <td>${photo.title}</td>
                <td>${photo.description}</td>
                <td>
                    <button class="map-btn" data-lat="${photo.location.split(',')[0]}" data-lon="${photo.location.split(',')[1]}" title="Ver Mapa">🗺️</button>
                </td>
                <td>${photo.date}</td>
                <td>
                    <button class="view-btn" data-id="${photo.id}">Visualizar</button>
                    <button class="edit-btn" data-id="${photo.id}">Editar</button>
                    <button class="delete-btn" data-id="${photo.id}">Excluir</button>
                </td>
            `;
            photoTableBody.appendChild(row);
        });

        // Adicionar eventos de clique sobre os botões de mapa
        document.querySelectorAll('.map-btn').forEach(btn => {
            btn.addEventListener('click', function(event) {
                const lat = parseFloat(this.getAttribute('data-lat').trim());
                const lon = parseFloat(this.getAttribute('data-lon').trim());

                if (mapContainer.style.display === 'block') {
                    mapContainer.style.display = 'none';  // Esconde o mapa se já estiver visível
                } else {
                    if (!isNaN(lat) && !isNaN(lon)) {
                        showMap(lat, lon, event);  // Exibe o mapa se não estiver visível
                    }
                }
            });
        });

        // Adicionar eventos aos botões de visualizar, editar e excluir
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', viewPhoto);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editPhoto);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deletePhoto);
        });
    }

    // Função para exibir o mapa quando o mouse passa sobre o botão de localização
    function showMap(lat, lon, event) {
        if (map) {
            map.remove();
        }
        map = L.map(mapContainer).setView([lat, lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([lat, lon]).addTo(map);

        mapContainer.style.display = 'block';
        mapContainer.style.top = `${event.pageY}px`;
        mapContainer.style.left = `${event.pageX + 15}px`;
    }

    function viewPhoto(e) {
        const id = Number(e.target.getAttribute('data-id'));
        const photo = photoData.find(p => p.id === id);
        if (photo) {
            const newTab = window.open();
            newTab.document.body.innerHTML = `<img src="${photo.photoURL}" alt="Foto" style="max-width: 100%;">`;
        }
    }

    function editPhoto(e) {
        const id = Number(e.target.getAttribute('data-id'));
        const photo = photoData.find(p => p.id === id);
        if (photo) {
            document.getElementById('photo-title').value = photo.title;
            document.getElementById('photo-description').value = photo.description;
            currentLocation = {
                lat: parseFloat(photo.location.split(',')[0]),
                lon: parseFloat(photo.location.split(',')[1])
            };
            document.getElementById('location-info').textContent = `Localização: ${currentLocation.lat}, ${currentLocation.lon}`;
            editId = id;
            currentPhotoURL = photo.photoURL;
            displayPhoto(currentPhotoURL);
        }
    }

    function deletePhoto(e) {
        const id = Number(e.target.getAttribute('data-id'));
        const index = photoData.findIndex(p => p.id === id);
        if (index !== -1) {
            photoData.splice(index, 1);
            localStorage.setItem('photos', JSON.stringify(photoData));
            displayPhotos();
            alert('Foto excluída com sucesso!');
        }
    }

    function clearForm() {
        document.getElementById('photo-title').value = '';
        document.getElementById('photo-description').value = '';
        document.getElementById('location-info').textContent = 'Localização não marcada';
        currentLocation = null;
        currentPhotoURL = null;
    }

    displayPhotos();
});