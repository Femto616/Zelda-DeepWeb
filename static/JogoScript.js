/**
 * JogoScript.js - Sistema de Jogo 2D com Sprites
 * Versão melhorada com classes ES6, tratamento de erros e otimizações
 */

// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================
const CONFIG = {
    TILE_SIZE: 32,
    CANVAS_WIDTH: 512,
    CANVAS_HEIGHT: 288,
    MOVE_SPEED: 1,
    ANIMATION_FRAME_RATE: 8,
    DEBUG_MODE: false // Ative para ver logs de debug
};

// ============================================
// CLASSE: SpriteManager - Gerencia carregamento de sprites
// ============================================
class SpriteManager {
    constructor() {
        this.loadedSprites = {};
        this.loadingPromises = new Map();
    }

    /**
     * Carrega todas as sprites definidas no objeto de configuração
     * @param {Object} spritePaths - Objeto com caminhos das sprites
     * @returns {Promise} Promise que resolve quando todas as sprites são carregadas
     */
    async loadAll(spritePaths) {
        const spriteKeys = Object.keys(spritePaths);
        const pathsToLoad = [];

        // Prepara lista de sprites para carregar
        spriteKeys.forEach(key => {
            const paths = spritePaths[key];
            if (Array.isArray(paths)) {
                this.loadedSprites[key] = [];
                paths.forEach(path => {
                    pathsToLoad.push({ key, path, type: 'array' });
                });
            } else {
                pathsToLoad.push({ key, path: paths, type: 'single' });
            }
        });

        if (pathsToLoad.length === 0) {
            return Promise.resolve();
        }

        // Carrega todas as imagens em paralelo
        const loadPromises = pathsToLoad.map(item => this.loadImage(item));
        
        try {
            await Promise.all(loadPromises);
            this.sortAnimationFrames();
            if (CONFIG.DEBUG_MODE) {
                console.log('✅ Todas as sprites carregadas com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar sprites:', error);
            throw error;
        }
    }

    /**
     * Carrega uma única imagem
     * @param {Object} item - Objeto com key, path e type
     * @returns {Promise} Promise que resolve quando a imagem é carregada
     */
    loadImage(item) {
        // Evita carregar a mesma imagem múltiplas vezes
        if (this.loadingPromises.has(item.path)) {
            return this.loadingPromises.get(item.path);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    if (item.type === 'single') {
                        this.loadedSprites[item.key] = img;
                    } else {
                        this.loadedSprites[item.key].push(img);
                    }
                    resolve(img);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                console.warn(`⚠️ Falha ao carregar sprite: ${item.path}`);
                reject(new Error(`Falha ao carregar: ${item.path}`));
            };

            img.src = item.path;
        });

        this.loadingPromises.set(item.path, promise);
        return promise;
    }

    /**
     * Ordena os frames de animação por nome do arquivo
     */
    sortAnimationFrames() {
        Object.keys(this.loadedSprites).forEach(key => {
            if (Array.isArray(this.loadedSprites[key])) {
                this.loadedSprites[key].sort((a, b) => 
                    a.src.localeCompare(b.src)
                );
            }
        });
    }

    /**
     * Obtém o array completo de frames de uma animação
     * @param {string} key - Chave da animação
     * @returns {Array|null} Array de frames ou null se não encontrado
     */
    getAnimationFrames(key) {
        const sprite = this.loadedSprites[key];
        
        if (!sprite) {
            if (CONFIG.DEBUG_MODE) {
                console.warn(`Animação não encontrada: ${key}`);
            }
            return null;
        }

        if (Array.isArray(sprite)) {
            return sprite.length > 0 ? sprite : null;
        }

        // Se não é array, retorna null (é um sprite único, não uma animação)
        return null;
    }

    /**
     * Obtém um sprite específico
     * @param {string} key - Chave do sprite
     * @param {number} frame - Frame da animação (opcional)
     * @returns {Image|null} Imagem do sprite ou null se não encontrado
     */
    getSprite(key, frame = null) {
        const sprite = this.loadedSprites[key];
        
        if (!sprite) {
            if (CONFIG.DEBUG_MODE) {
                console.warn(`Sprite não encontrado: ${key}`);
            }
            return null;
        }

        if (Array.isArray(sprite)) {
            if (sprite.length === 0) {
                return null;
            }
            
            // Se frame foi especificado, valida e retorna
            if (frame !== null && typeof frame === 'number') {
                // Garante que o frame está dentro dos limites válidos
                const validFrame = Math.max(0, Math.min(frame, sprite.length - 1));
                return sprite[validFrame] || sprite[0] || null;
            }
            
            // Se frame não foi especificado, retorna o primeiro frame
            return sprite[0] || null;
        }

        return sprite;
    }
}

// ============================================
// CLASSE: Player - Gerencia estado e movimento do jogador
// ============================================
class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isMoving = false;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.currentAnimation = 'idle_down';
        this.facing = 'down';
        this.velocity = { x: 0, y: 0 };
    }

    /**
     * Atualiza a posição do jogador baseado nas teclas pressionadas
     * @param {Object} keys - Objeto com estado das teclas
     */
    updatePosition(keys) {
        let moved = false;
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Calcula movimento
        if (keys['ArrowLeft']) {
            this.velocity.x = -CONFIG.MOVE_SPEED;
            moved = true;
            this.facing = 'left';
        }
        if (keys['ArrowRight']) {
            this.velocity.x = CONFIG.MOVE_SPEED;
            moved = true;
            this.facing = 'right';
        }
        if (keys['ArrowUp']) {
            this.velocity.y = -CONFIG.MOVE_SPEED;
            moved = true;
            this.facing = 'up';
        }
        if (keys['ArrowDown']) {
            this.velocity.y = CONFIG.MOVE_SPEED;
            moved = true;
            this.facing = 'down';
        }

        // Aplica movimento
        if (moved) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }

        // Atualiza estado de animação
        this.updateAnimationState(moved);

        // Limita posição dentro dos bounds do canvas
        this.clampToBounds();
    }

    /**
     * Atualiza o estado da animação baseado no movimento
     * @param {boolean} moved - Se o jogador se moveu
     */
    updateAnimationState(moved) {
        this.isMoving = moved;

        let newAnimation;
        
        if (moved) {
            // Define animação de caminhada baseada na direção
            if (this.facing === 'down') {
                newAnimation = 'walk_down';
            } else if (this.facing === 'up') {
                newAnimation = 'walk_up';
            } else if (this.facing === 'right' || this.facing === 'left') {
                newAnimation = 'walk_right';
            }
        } else {
            // Define sprite de idle baseado na direção
            if (this.facing === 'down') {
                newAnimation = 'idle_down';
            } else if (this.facing === 'up') {
                newAnimation = 'idle_up';
            } else if (this.facing === 'right' || this.facing === 'left') {
                newAnimation = 'idle_right';
            }
        }

        // Se a animação mudou, reseta o frame para evitar frames inválidos
        if (newAnimation && newAnimation !== this.currentAnimation) {
            this.currentAnimation = newAnimation;
            this.currentFrame = 0;
            this.frameTimer = 0;
        } else if (newAnimation) {
            this.currentAnimation = newAnimation;
        }

        // Se parou de se mover, reseta frame
        if (!moved) {
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    /**
     * Atualiza o frame da animação
     * @param {Array} frames - Array de frames da animação atual
     */
    updateAnimation(frames) {
        if (!this.isMoving || !frames || frames.length === 0) {
            this.frameTimer = 0;
            return;
        }

        // Garante que o frame atual está dentro dos limites válidos
        if (this.currentFrame < 0 || this.currentFrame >= frames.length) {
            this.currentFrame = 0;
        }

        this.frameTimer++;
        
        if (this.frameTimer >= CONFIG.ANIMATION_FRAME_RATE) {
            this.frameTimer = 0;
            // Incrementa o frame e faz loop quando chega ao final
            this.currentFrame = (this.currentFrame + 1) % frames.length;
        }
    }

    /**
     * Limita a posição do jogador dentro dos bounds do canvas
     */
    clampToBounds() {
        this.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(CONFIG.CANVAS_HEIGHT - this.height, this.y));
    }

    /**
     * Reseta o jogador para posição inicial
     */
    reset() {
        this.x = CONFIG.TILE_SIZE * 5;
        this.y = CONFIG.TILE_SIZE * 3;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.currentAnimation = 'idle_down';
        this.facing = 'down';
        this.isMoving = false;
    }
}

// ============================================
// CLASSE: InputManager - Gerencia entrada do teclado
// ============================================
class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    /**
     * Configura os event listeners do teclado
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
            // Previne comportamento padrão para teclas de seta
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });

        // Limpa teclas quando a janela perde foco
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }

    /**
     * Verifica se uma tecla está pressionada
     * @param {string} key - Código da tecla
     * @returns {boolean}
     */
    isKeyPressed(key) {
        return !!this.keys[key];
    }

    /**
     * Retorna o objeto de teclas (para compatibilidade)
     * @returns {Object}
     */
    getKeys() {
        return this.keys;
    }
}

// ============================================
// CLASSE: GameRenderer - Gerencia renderização do jogo
// ============================================
class GameRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    /**
     * Limpa o canvas e desenha o fundo
     */
    clear() {
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.ctx.fillStyle = '#808080'; // Gray
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    /**
     * Desenha o jogador na tela
     * @param {Player} player - Instância do jogador
     * @param {SpriteManager} spriteManager - Gerenciador de sprites
     */
    drawPlayer(player, spriteManager) {
        const sprite = spriteManager.getSprite(
            player.currentAnimation,
            player.isMoving ? player.currentFrame : null
        );

        if (!sprite || !sprite.complete) {
            // Fallback: desenha retângulo verde
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(player.x, player.y, player.width, player.height);
            return;
        }

        // Desenha sprite espelhado se estiver virado para esquerda
        if (player.facing === 'left') {
            this.ctx.save();
            this.ctx.translate(player.x + player.width, player.y);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                sprite,
                0,
                0,
                player.width,
                player.height
            );
            this.ctx.restore();
        } else {
            // Desenho normal (down, up, right)
            this.ctx.drawImage(
                sprite,
                player.x,
                player.y,
                player.width,
                player.height
            );
        }
    }

    /**
     * Renderiza um frame completo do jogo
     * @param {Player} player - Instância do jogador
     * @param {SpriteManager} spriteManager - Gerenciador de sprites
     */
    render(player, spriteManager) {
        this.clear();
        this.drawPlayer(player, spriteManager);
    }
}

// ============================================
// CLASSE: Game - Classe principal do jogo
// ============================================
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas com ID '${canvasId}' não encontrado`);
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Não foi possível obter contexto 2D do canvas');
        }

        // Inicializa componentes
        this.spriteManager = new SpriteManager();
        this.inputManager = new InputManager();
        this.renderer = new GameRenderer(this.canvas, this.ctx);
        
        this.player = new Player(
            CONFIG.TILE_SIZE * 5,
            CONFIG.TILE_SIZE * 3,
            CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE
        );

        this.isRunning = false;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
    }

    /**
     * Inicializa o jogo carregando recursos
     */
    async init() {
        try {
            if (CONFIG.DEBUG_MODE) {
                console.log('🎮 Inicializando jogo...');
            }

            // Define caminhos das sprites
            const spritePaths = {
                'idle_down': '/static/assets/link-sprite1.png',
                'idle_right': '/static/assets/r-link-sprite1.png',
                'idle_up': '/static/assets/u-link-sprite1.png',
                'walk_down': [
                    '/static/assets/link-sprite2.png',
                    '/static/assets/link-sprite3.png',
                    '/static/assets/link-sprite4.png',
                    '/static/assets/link-sprite5.png',
                    '/static/assets/link-sprite6.png',
                    '/static/assets/link-sprite7.png',
                    '/static/assets/link-sprite8.png',
                    '/static/assets/link-sprite9.png'
                ],
                'walk_right': [
                    '/static/assets/r-link-sprite1.png',
                    '/static/assets/r-link-sprite2.png',
                    '/static/assets/r-link-sprite3.png',
                    '/static/assets/r-link-sprite4.png'
                ],
                'walk_up': [
                    '/static/assets/u-link-sprite1.png',
                    '/static/assets/u-link-sprite2.png',
                    '/static/assets/u-link-sprite3.png',
                    '/static/assets/u-link-sprite4.png',
                    '/static/assets/u-link-sprite5.png',
                    '/static/assets/u-link-sprite6.png',
                    '/static/assets/u-link-sprite7.png',
                    '/static/assets/u-link-sprite8.png',
                    '/static/assets/u-link-sprite9.png'
                ]
            };

            await this.spriteManager.loadAll(spritePaths);
            
            if (CONFIG.DEBUG_MODE) {
                console.log('✅ Jogo inicializado com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar jogo:', error);
            throw error;
        }
    }

    /**
     * Loop principal do jogo
     * @param {number} currentTime - Timestamp atual
     */
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        // Atualiza lógica do jogo
        this.update();

        // Renderiza frame
        this.render();

        // Agenda próximo frame
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Atualiza a lógica do jogo
     */
    update() {
        const keys = this.inputManager.getKeys();
        
        // Atualiza posição do jogador
        this.player.updatePosition(keys);

        // Atualiza animação - obtém o array completo de frames
        const frames = this.spriteManager.getAnimationFrames(this.player.currentAnimation);
        if (frames && frames.length > 0) {
            this.player.updateAnimation(frames);
        }
    }

    /**
     * Renderiza o frame atual
     */
    render() {
        this.renderer.render(this.player, this.spriteManager);
    }

    /**
     * Inicia o jogo
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Jogo já está rodando');
            return;
        }

        this.isRunning = true;
        this.gameLoop();
        
        if (CONFIG.DEBUG_MODE) {
            console.log('🚀 Loop do jogo iniciado');
        }
    }

    /**
     * Para o jogo
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Reinicia o jogo
     */
    reset() {
        this.player.reset();
    }
}

// ============================================
// INICIALIZAÇÃO DO JOGO
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const game = new Game('gameCanvas');
        await game.init();
        game.start();
        
        // Expõe game globalmente para debug (opcional)
        if (CONFIG.DEBUG_MODE) {
            window.game = game;
            console.log('💡 Modo debug ativado. Use window.game para acessar a instância do jogo.');
        }
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar o jogo:', error);
        // Poderia mostrar uma mensagem de erro ao usuário aqui
    }
});
