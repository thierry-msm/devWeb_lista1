document.getElementById('imageForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const quantity = document.getElementById('quantity').value;
    const imageGrid = document.getElementById('imageGrid');

    // Limpar o grid antes de adicionar novas imagens
    imageGrid.innerHTML = '';

    // Validação básica em JavaScript
    if (width < 50 || height < 50 || quantity <= 0) {
        alert('Valores inválidos! Verifique os campos.');
        return;
    }

    // Buscar as imagens da API
    for (let i = 0; i < quantity; i++) {
        // Adicionar um parâmetro aleatório para garantir que cada imagem seja única
        const imgSrc = `https://picsum.photos/${width}/${height}.webp?random=${Math.random()}`;
        const fullHdSrc = `https://picsum.photos/1920/1080.webp?random=${Math.random()}`;

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Imagem aleatória ${i + 1}`;

        const downloadFullHdButton = document.createElement('button');
        downloadFullHdButton.textContent = 'Baixar em Full HD';
        downloadFullHdButton.onclick = () => downloadImage(fullHdSrc);

        const shareButton = document.createElement('button');
        shareButton.textContent = 'Compartilhar';
        shareButton.onclick = () => shareImage(imgSrc);

        imgContainer.appendChild(img);
        imgContainer.appendChild(downloadFullHdButton);  // Botão de download em Full HD
        imgContainer.appendChild(shareButton);  // Botão de compartilhar

        imageGrid.appendChild(imgContainer);
    }
});

function downloadImage(src) {
    const link = document.createElement('a');
    link.href = `${src}&dl=1`;  // Forçar o download
    link.download = 'image.webp';
    link.click();
}

function shareImage(src) {
    const text = `Confira esta imagem incrível: ${src}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}
