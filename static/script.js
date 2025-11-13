document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. DEFINIÇÃO DE VARIÁVEIS E REFERÊNCIAS (Escopo Global do DOMContentLoaded)
    // ----------------------------------------------------
    
    const musica = document.getElementById('musicaFundo');
    const popup = document.getElementById('popupAtivarSom');
    const btnAtivarSom = document.getElementById('btnAtivarSom');
    const backgroundElement = document.getElementById('backgroundAnimado');
    
    // REFERÊNCIA CRÍTICA DO BOTÃO START (Seu ID no HTML é startButtonImg)
    const startButton = document.getElementById('startButtonImg'); 
    
    // ----------------------------------------------------
    // 2. LÓGICA DE ATIVAÇÃO DE MÚSICA (Pop-up)
    // ----------------------------------------------------
    
    if (popup) {
        popup.classList.remove('hidden'); 
    }

    if (btnAtivarSom && musica) {
        btnAtivarSom.addEventListener('click', function() {
            musica.play()
                .then(() => {
                    if (popup) {
                        popup.classList.add('hidden');
                    }
                })
                .catch(error => {
                    console.error("Erro ao tocar a música:", error);
                    if (popup) {
                        popup.classList.add('hidden');
                    }
                });
        });
    }

    // ----------------------------------------------------
    // 3. LÓGICA DE ANIMAÇÃO DE BACKGROUND (Frames)
    // ----------------------------------------------------
    
    const frames = [
        // Caminhos atualizados para a pasta hud
        '/static/hud/img-frame1.png', 
        '/static/hud/img-frame2.png',
        '/static/hud/img-frame3.png',
        '/static/hud/img-frame4.png',
        '/static/hud/img-frame5.png',
        '/static/hud/img-frame6.png',
        '/static/hud/img-frame7.png',
        '/static/hud/img-frame8.png',
        '/static/hud/img-frame9.png',
        '/static/hud/img-frame10.png'
    ];

    let currentFrameIndex = 0;
    const frameSpeed = 120;

    function updateFrame() {
        if (backgroundElement) {
            backgroundElement.style.backgroundImage = `url('${frames[currentFrameIndex]}')`;
            currentFrameIndex++;
            
            if (currentFrameIndex >= frames.length) {
                currentFrameIndex = 0;
            }
        }
    }
    
    // Inicia a animação se o elemento de fundo for encontrado
    if (backgroundElement) {
        setInterval(updateFrame, frameSpeed);
    }
    
    // ----------------------------------------------------
    // 4. LÓGICA DE REDIRECIONAMENTO PARA O JOGO (Solução do Erro de Escopo)
    // ----------------------------------------------------

    // Função que configura o botão, recebendo o elemento como parâmetro
    function setupStartButton(btnElement) {
        if (btnElement) {
            btnElement.style.cursor = 'pointer'; 

            btnElement.addEventListener('click', function() {
                console.log("Botão Start Clicado! Redirecionando para /jogo..."); 
                
                // Redireciona para a rota /jogo
                window.location.href = '/jogo'; 
            });
        } else {
            console.error("ERRO CRÍTICO: Elemento startButtonImg não foi encontrado no DOM (ID incorreto).");
        }
    }

    // Chamada da função, passando a variável 'startButton'
    setupStartButton(startButton); 

});