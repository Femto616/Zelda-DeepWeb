document.addEventListener('DOMContentLoaded', function() {
    // Referências dos elementos DOM
    const musica = document.getElementById('musicaFundo');
    const popup = document.getElementById('popupAtivarSom');
    const btnAtivarSom = document.getElementById('btnAtivarSom');
    const backgroundElement = document.getElementById('backgroundAnimado');

    // ----------------------------------------------------
    // 1. LÓGICA DE ATIVAÇÃO DE MÚSICA (Pop-up)
    // ----------------------------------------------------
    
    // Garante que o pop-up esteja visível ao carregar
    if (popup) {
        popup.classList.remove('hidden'); 
    }

    if (btnAtivarSom && musica) {
        btnAtivarSom.addEventListener('click', function() {
            // Tenta reproduzir a música
            musica.play()
                .then(() => {
                    // Esconde o pop-up
                    if (popup) {
                        popup.classList.add('hidden');
                    }
                })
                .catch(error => {
                    // Garante que o pop-up suma mesmo se houver falha de reprodução
                    console.error("Erro ao tentar tocar a música. O navegador pode estar bloqueando:", error);
                    if (popup) {
                        popup.classList.add('hidden');
                    }
                });
        });
    }

    // ----------------------------------------------------
    // 2. LÓGICA DE ANIMAÇÃO DE BACKGROUND (Frames)
    // ----------------------------------------------------

    // Caminhos Corrigidos: Relativos a static/ e nomes de img-frameX.png
    const frames = [
        'static/assets/img-frame1.png', 
        'static/assets/img-frame2.png',
        'static/assets/img-frame3.png',
        'static/assets/img-frame4.png',
        'static/assets/img-frame5.png',
        'static/assets/img-frame6.png',
        'static/assets/img-frame7.png',
        'static/assets/img-frame8.png',
        'static/assets/img-frame9.png',
        'static/assets/img-frame10.png'
    ];

    let currentFrameIndex = 0;
    const frameSpeed = 120; // 120ms para uma animação suave

    function updateFrame() {
        backgroundElement.style.backgroundImage = `url('${frames[currentFrameIndex]}')`;
        currentFrameIndex++;
        
        if (currentFrameIndex >= frames.length) {
            currentFrameIndex = 0;
        }
    }

    setInterval(updateFrame, frameSpeed);
});