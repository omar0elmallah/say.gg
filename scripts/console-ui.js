// إدارة واجهة PlayStation Console
class ConsoleUI {
    constructor() {
        this.currentGame = null;
        this.gameEngine = null;
        this.init();
    }

    init() {
        this.setupGameCards();
        this.setupAnimations();
        this.setupGamePlayer();
    }

    // إعداد بطاقات الألعاب
    setupGameCards() {
        // الألعاب الأخيرة
        this.updateRecentGames();
        
        // الألعاب الموصى بها
        this.updateRecommendedGames();
        
        // إضافة مستمعي الأحداث للبطاقات
        document.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard) {
                const gameId = gameCard.dataset.gameId;
                this.showGameDetails(gameId);
            }
        });
    }

    // تحديث الألعاب الأخيرة
    updateRecentGames() {
        const container = document.getElementById('recent-games');
        if (!container || !window.gameData) return;

        const recentGames = window.gameData.slice(0, 5);
        
        container.innerHTML = recentGames.map(game => `
            <div class="game-card" data-game-id="${game.id}">
                <img src="${game.image}" alt="${game.title}" class="game-card-image">
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.title}</h3>
                    <div class="game-card-meta">
                        <span>${game.category}</span>
                        <div class="game-card-rating">
                            <i class="fas fa-star"></i>
                            <span>${game.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="game-card-actions">
                    <button class="game-card-action" onclick="window.consoleUI.playGame('${game.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="game-card-action" onclick="window.storeManager.addToLibrary('${game.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // تحديث الألعاب الموصى بها
    updateRecommendedGames() {
        const container = document.getElementById('recommended-games');
        if (!container || !window.gameData) return;

        const recommended = window.gameData
            .filter(game => game.featured)
            .slice(0, 6);
        
        container.innerHTML = recommended.map(game => `
            <div class="game-card" data-game-id="${game.id}">
                <img src="${game.image}" alt="${game.title}" class="game-card-image">
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.title}</h3>
                    <p class="game-card-description">${game.description}</p>
                    <div class="game-card-meta">
                        <span>${game.category}</span>
                        <div class="game-card-rating">
                            <i class="fas fa-star"></i>
                            <span>${game.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // إعداد الأنيميشن
    setupAnimations() {
        // تأثيرات التمرير
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // مراقبة العناصر لإضافة الأنيميشن
        document.querySelectorAll('.game-card, .stat-card, .quick-app').forEach(el => {
            observer.observe(el);
        });

        // تأثيرات CSS للأنيميشن
        const style = document.createElement('style');
        style.textContent = `
            .game-card, .stat-card, .quick-app {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .game-card.animate-in, 
            .stat-card.animate-in, 
            .quick-app.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .quick-app:nth-child(2) { transition-delay: 0.1s; }
            .quick-app:nth-child(3) { transition-delay: 0.2s; }
            .quick-app:nth-child(4) { transition-delay: 0.3s; }
            
            .game-card:nth-child(odd) { transition-delay: 0.1s; }
            .game-card:nth-child(even) { transition-delay: 0.2s; }
        `;
        document.head.appendChild(style);
    }

    // إعداد مشغل الألعاب
    setupGamePlayer() {
        // إغلاق اللعبة
        document.getElementById('close-game')?.addEventListener('click', () => {
            this.closeGame();
        });

        // إيقاف اللعبة
        document.getElementById('pause-game')?.addEventListener('click', () => {
            this.togglePause();
        });

        // ملء الشاشة
        document.getElementById('fullscreen-toggle')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // التحكم بالزراعة
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentGame) {
                this.closeGame();
            }
            
            if (e.key === ' ' && this.currentGame) {
                this.togglePause();
            }
            
            if (e.key === 'f' && this.currentGame) {
                this.toggleFullscreen();
            }
        });

        // أزرار الزراعة
        document.querySelectorAll('.overlay-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.id.replace('overlay-', '');
                this.handleOverlayAction(action);
            });
        });
    }

    // عرض تفاصيل اللعبة
    showGameDetails(gameId) {
        const game = window.gameData?.find(g => g.id === gameId);
        if (!game) return;

        // تحديث النافذة المنبثقة
        document.getElementById('modal-game-title').textContent = game.title;
        document.getElementById('modal-game-image').src = game.image;
        document.getElementById('modal-game-desc').textContent = game.description;
        document.getElementById('modal-game-rating').textContent = game.rating;
        document.getElementById('modal-game-size').textContent = game.size;
        document.getElementById('modal-game-players').textContent = game.players;
        document.getElementById('modal-game-category').textContent = game.category;

        // متطلبات النظام
        const requirements = document.getElementById('modal-game-requirements');
        if (requirements) {
            requirements.innerHTML = game.requirements?.map(req => `<li>${req}</li>`).join('') || 
                '<li>WebGL 2.0 متوافق</li><li>متصفح حديث</li>';
        }

        // أزرار الإجراءات
        document.getElementById('modal-play-game').onclick = () => this.playGame(gameId);
        document.getElementById('modal-add-library').onclick = () => window.storeManager.addToLibrary(gameId);
        document.getElementById('modal-download-game').onclick = () => this.downloadGame(gameId);

        // إظهار النافذة
        document.getElementById('game-details-modal').classList.remove('hidden');
        window.psApp?.playSystemSound('click');
    }

    // تشغيل لعبة
    playGame(gameId) {
        const game = window.gameData?.find(g => g.id === gameId);
        if (!game) return;

        this.currentGame = game;
        
        // تحديث واجهة المشغل
        document.getElementById('player-game-title').textContent = game.title;
        document.getElementById('player-game-icon').src = game.icon || game.image;
        
        // إظهار المشغل
        document.getElementById('game-player').classList.remove('hidden');
        
        // تحميل اللعبة
        this.loadGame(game);
        
        // تسجيل وقت اللعب
        this.startPlaySession(gameId);
    }

    // تحميل اللعبة
    loadGame(game) {
        const container = document.getElementById('game-container');
        container.innerHTML = '';

        // إنشاء عنصر اللعبة المناسب
        switch (game.type) {
            case 'runner':
                this.createRunnerGame(container, game);
                break;
            case 'space':
                this.createSpaceGame(container, game);
                break;
            case 'soccer':
                this.createSoccerGame(container, game);
                break;
            case 'puzzle':
                this.createPuzzleGame(container, game);
                break;
            default:
                this.createDefaultGame(container, game);
        }
    }

    // إنشاء لعبة الجري
    createRunnerGame(container, game) {
        container.innerHTML = `
            <div class="runner-game">
                <canvas class="runner-canvas" width="800" height="400"></canvas>
                <div class="runner-ui">
                    <p>🏃 ${game.title}</p>
                    <p id="runner-score">النقاط: 0</p>
                    <p>استخدم ⬅️ ➡️ للحركة | المسافة للقفز</p>
                </div>
            </div>
        `;
        
        // هنا يمكنك إضافة منطق لعبة الجري
        setTimeout(() => {
            this.startRunnerGame();
        }, 100);
    }

    // بدء لعبة الجري (مثال)
    startRunnerGame() {
        const canvas = document.querySelector('.runner-canvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('runner-score');
        
        let score = 0;
        let gameRunning = true;
        
        function gameLoop() {
            if (!gameRunning) return;
            
            // مسح الشاشة
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // رسم الأرض
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, 350, canvas.width, 50);
            
            // تحديث النقاط
            score++;
            if (scoreElement) {
                scoreElement.textContent = `النقاط: ${score}`;
            }
            
            requestAnimationFrame(gameLoop);
        }
        
        gameLoop();
        
        // التحكم بالمفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                // قفز
            }
        });
    }

    // إغلاق اللعبة
    closeGame() {
        if (this.currentGame) {
            // إيقاف جلسة اللعب
            this.endPlaySession(this.currentGame.id);
            
            // إخفاء المشغل
            document.getElementById('game-player').classList.add('hidden');
            
            // تنظيف
            this.currentGame = null;
            document.getElementById('game-container').innerHTML = '';
            
            // تحديث الواجهة
            window.psApp?.switchScreen('home');
        }
    }

    // تبديل الإيقاف
    togglePause() {
        const pauseBtn = document.getElementById('pause-game');
        const icon = pauseBtn.querySelector('i');
        
        if (icon.classList.contains('fa-pause')) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            // إيقاف اللعبة
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            // استئناف اللعبة
        }
    }

    // تبديل ملء الشاشة
    toggleFullscreen() {
        const gameContainer = document.getElementById('game-container');
        
        if (!document.fullscreenElement) {
            gameContainer.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // معالجة إجراءات الزراعة
    handleOverlayAction(action) {
        switch (action) {
            case 'home':
                this.closeGame();
                break;
            case 'screenshot':
                this.takeScreenshot();
                break;
            case 'record':
                this.toggleRecording();
                break;
            case 'settings':
                this.showGameSettings();
                break;
        }
    }

    // التقاط لقطة شاشة
    takeScreenshot() {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `screenshot-${Date.now()}.png`;
            link.href = dataURL;
            link.click();
        }
    }

    // تبديل التسجيل
    toggleRecording() {
        const recordBtn = document.getElementById('overlay-record');
        const icon = recordBtn.querySelector('i');
        
        if (icon.classList.contains('fa-video')) {
            icon.classList.remove('fa-video');
            icon.classList.add('fa-stop');
            // بدء التسجيل
        } else {
            icon.classList.remove('fa-stop');
            icon.classList.add('fa-video');
            // إيقاف التسجيل
        }
    }

    // عرض إعدادات اللعبة
    showGameSettings() {
        alert('إعدادات اللعبة - قريباً!');
    }

    // بدء جلسة لعب
    startPlaySession(gameId) {
        this.playSessionStart = Date.now();
        // يمكن حفظ هذا في localStorage أو إرساله للسيرفر
    }

    // إنهاء جلسة لعب
    endPlaySession(gameId) {
        if (this.playSessionStart) {
            const duration = Math.floor((Date.now() - this.playSessionStart) / 1000);
            console.log(`Play session ended: ${duration} seconds`);
            // تحديث إحصائيات المستخدم
            this.updateUserStats(gameId, duration);
        }
    }

    // تحديث إحصائيات المستخدم
    updateUserStats(gameId, duration) {
        if (window.psApp?.userData) {
            window.psApp.userData.totalPlayTime += duration;
            window.psApp.userData.gamesPlayed += 1;
            window.psApp.saveUserData();
        }
    }

    // تحميل اللعبة
    downloadGame(gameId) {
        const game = window.gameData?.find(g => g.id === gameId);
        if (!game) return;
        
        alert(`سيبدأ تحميل ${game.title} قريباً...`);
        // هنا يمكنك إضافة منطق التحميل الفعلي
    }
}

// تهيئة واجهة الكونسول
window.addEventListener('DOMContentLoaded', () => {
    window.consoleUI = new ConsoleUI();
});
