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

    // Definir uma página aleatória para variar as imagens
    const randomPage = Math.floor(Math.random() * 100) + 1;

    try {
        const response = await fetch(`https://picsum.photos/v2/list?page=${randomPage}&limit=${quantity}`);
        const images = await response.json();

        images.forEach((image, index) => {
            const imageId = image.id;
            const imgSrc = `https://picsum.photos/id/${imageId}/${width}/${height}.webp`;
            const fullHdSrc = `https://picsum.photos/id/${imageId}/1920/1080.webp`;

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `Imagem aleatória ${index + 1}`;

            const threeDotsButton = document.createElement('button');
            threeDotsButton.classList.add('three-dots');
            threeDotsButton.textContent = '...';

            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');

            const downloadFullHdButton = document.createElement('button');
            downloadFullHdButton.textContent = 'Baixar em Full HD';
            downloadFullHdButton.onclick = () => downloadImage(fullHdSrc, `image-${imageId}.webp`);

            const shareButton = document.createElement('button');
            shareButton.textContent = 'Compartilhar';
            shareButton.onclick = () => shareImage(imgSrc);

            optionsDiv.appendChild(downloadFullHdButton);
            optionsDiv.appendChild(shareButton);

            imgContainer.appendChild(img);
            imgContainer.appendChild(threeDotsButton);
            imgContainer.appendChild(optionsDiv);

            imageGrid.appendChild(imgContainer);
        });
    } catch (error) {
        console.error('Erro ao buscar imagens:', error);
    }
});

function downloadImage(src, fileName) {
    const link = document.createElement('a');
    link.href = src;  // Apenas a URL da imagem sem parâmetros extras
    link.download = fileName;  // Definir o nome correto do arquivo com extensão
    link.click();
}

function shareImage(src) {
    const text = `Confira esta imagem incrível: ${src}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}
