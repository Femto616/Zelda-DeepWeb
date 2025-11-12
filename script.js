document.addEventListener('DOMContentLoaded', function() {
    //arrai com o caminho das imagens para animação
    const frames = [
        'assets/img-frame1.png',
        'assets/img-frame2.png',
        'assets/img-frame3.png',
        'assets/img-frame4.png',
        'assets/img-frame5.png',
        'assets/img-frame6.png',
        'assets/img-frame7.png',
        'assets/img-frame8.png',
        'assets/img-frame9.png',
        'assets/img-frame10.png'
    ];

const backgroundElement = document.getElementById('backgroundAnimado');
    let currentFrameIndex = 0;
    
    // valor em 500 pq são só 10 img ai fica mt rapido
    const frameSpeed = 500
    ; 

    function updateFrame() {
        backgroundElement.style.backgroundImage = `url('${frames[currentFrameIndex]}')`;
        currentFrameIndex++;
        if (currentFrameIndex >= frames.length) {
            currentFrameIndex = 0;
        }
    }

    setInterval(updateFrame, frameSpeed);
});

document.addEventListener('DOMContentLoaded', function() {
    // Referências dos elementos
    const musica = document.getElementById('musicaFundo');
    const popup = document.getElementById('popupAtivarSom');
    const btnAtivarSom = document.getElementById('btnAtivarSom');

    // 1. Mostrar o Pop-up na inicialização (Já é visível por padrão, mas bom ter o controle)
    if (popup) {
        popup.classList.remove('hidden');
    }

    // 2. Evento para Iniciar a Música e Fechar o Pop-up
    if (btnAtivarSom && musica) {
        btnAtivarSom.addEventListener('click', function() {
            // Tenta reproduzir a música (isso funciona porque o clique é uma interação)
            musica.play()
                .then(() => {
                    // Esconde o pop-up após o sucesso
                    if (popup) {
                        popup.classList.add('hidden');
                    }
                })
                .catch(error => {
                    console.error("Erro ao tentar tocar a música:", error);
                    // Opcional: Mostrar uma mensagem de erro ao usuário se a reprodução falhar
                });
        });
    }

    // ... (Mantenha o resto do seu código de animação do background aqui) ...
});