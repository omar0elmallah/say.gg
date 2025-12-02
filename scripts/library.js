// إدارة مكتبة الألعاب
class LibraryManager {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.waitForUserData();
        this.setupEventListeners();
        this.updateLibrary();
        this.updateStats();
    }

    // الانتظار حتى تحميل بيانات المستخدم
    async waitForUserData() {
        let attempts = 0;
        while (!window.psApp?.userData && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // فلاتر المكتبة
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.setFilter(e.currentTarget.dataset.filter);
            });
        });
    }

    // تعيين الفلتر
    setFilter(filter) {
        this.currentFilter = filter;
        
        // تحديث أزرار الفلاتر
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.updateLibrary();
        window.psApp?.playSystemSound('click');
    }

    // تحديث المكتبة
    updateLibrary() {
        if (!window.psApp?.userData || !window.gameData) return;

        const container = document.getElementById('library-games');
        if (!container) return;

        // الحصول على ألعاب المكتبة
        let libraryGames = window.psApp.userData.library
            .map(gameId => window.gameData.find(game => game.id === gameId))
            .filter(game => game); // إزالة القيم غير المعرفة

        // تطبيق الفلتر
        switch (this.currentFilter) {
            case 'installed':
                // يمكنك إضافة منطق التحقق من التثبيت
                libraryGames = libraryGames.filter(game => game.installed);
                break;
            case 'recent':
                libraryGames = libraryGames.slice(0, 10); // آخر 10 ألعاب
                break;
            case 'favorites':
                libraryGames = libraryGames.filter(game => game.favorite);
                break;
            case 'webgl':
                libraryGames = libraryGames.filter(game => game.type === 'webgl');
                break;
            // 'all' لا يوجد فلتر
        }

        if (libraryGames.length === 0) {
            container.innerHTML = `
                <div class="empty-library">
                    <div class="empty-icon">
                        <i class="fas fa-gamepad"></i>
                    </div>
                    <h3>المكتبة فارغة</h3>
                    <p>اذهب إلى المتجر وأضف بعض الألعاب إلى مكتبتك</p>
                    <button class="ps-btn ps-btn-primary" onclick="window.psApp.switchScreen('store')">
                        <i class="fas fa-store"></i> زيارة المتجر
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = libraryGames.map(game => `
            <div class="library-game-item" data-game-id="${game.id}">
                <div class="library-game-icon">
                    <img src="${game.image}" alt="${game.title}">
                </div>
                <div class="library-game-info">
                    <h3 class="library-game-title">${game.title}</h3>
                    <div class="library-game-meta">
                        <span>${game.category}</span>
                        <span>${game.size}</span>
                        <span>⭐ ${game.rating}</span>
                    </div>
                    <div class="library-game-progress">
                        <div class="library-game-progress-bar" style="width: ${game.progress || 0}%"></div>
                    </div>
                    <div class="library-game-actions">
                        <button class="library-action-btn" onclick="window.consoleUI.playGame('${game.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="library-action-btn" onclick="this.removeFromLibrary('${game.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="library-action-btn" onclick="this.toggleFavorite('${game.id}')">
                            <i class="fas fa-heart ${game.favorite ? 'favorited' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // تحديث الإحصائيات
    updateStats() {
        if (!window.psApp?.userData || !window.gameData) return;

        const userData = window.psApp.userData;
        const library = userData.library || [];
        
        // عدد الألعاب
        const totalGames = document.getElementById('total-games');
        if (totalGames) {
            totalGames.textContent = `${library.length} ألعاب`;
        }
        
        // الحجم الإجمالي
        const totalSize = document.getElementById('total-size');
        if (totalSize) {
            const size = library.reduce((sum, gameId) => {
                const game = window.gameData.find(g => g.id === gameId);
                return sum + (parseInt(game?.size) || 0);
            }, 0);
            totalSize.textContent = `${(size / 1000).toFixed(1)} GB`;
        }
        
        // تحديث صفحة الملف الشخصي
        this.updateProfileStats();
    }

    // تحديث إحصائيات الملف الشخصي
    updateProfileStats() {
        if (!window.psApp?.userData) return;

        const userData = window.psApp.userData;
        
        // وقت اللعب
        const playTime = document.getElementById('play-time');
        if (playTime) {
            const hours = Math.floor(userData.totalPlayTime / 3600);
            playTime.textContent = `${hours} ساعة`;
        }
        
        // الإنجازات
        const achievements = document.getElementById('achievements');
        if (achievements) {
            achievements.textContent = userData.achievements?.length || 0;
        }
        
        // الألعاب المملوكة
        const ownedGames = document.getElementById('owned-games');
        if (ownedGames) {
            ownedGames.textContent = userData.library?.length || 0;
        }
    }

    // إزالة لعبة من المكتبة
    removeFromLibrary(gameId) {
        if (!window.psApp?.userData) return;
        
        const userData = window.psApp.userData;
        const index = userData.library.indexOf(gameId);
        
        if (index > -1) {
            userData.library.splice(index, 1);
            window.psApp.saveUserData();
            
            const game = window.gameData?.find(g => g.id === gameId);
            if (game) {
                window.storeManager?.showNotification(`تمت إزالة ${game.title} من المكتبة`, 'info');
            }
            
            this.updateLibrary();
            this.updateStats();
        }
    }

    // تبديل المفضلة
    toggleFavorite(gameId) {
        if (!window.gameData) return;
        
        const game = window.gameData.find(g => g.id === gameId);
        if (game) {
            game.favorite = !game.favorite;
            window.storeManager?.showNotification(
                game.favorite ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة',
                'info'
            );
            this.updateLibrary();
        }
    }

    // تحميل اللعبة
    downloadGame(gameId) {
        const game = window.gameData?.find(g => g.id === gameId);
        if (!game) return;
        
        // محاكاة التحميل
        this.showDownloadProgress(gameId);
        
        // هنا يمكنك إضافة منطق التحميل الفعلي
        setTimeout(() => {
            window.storeManager?.showNotification(`تم تحميل ${game.title}`, 'success');
            this.hideDownloadProgress(gameId);
        }, 2000);
    }

    // عرض شريط التحميل
    showDownloadProgress(gameId) {
        const gameItem = document.querySelector(`.library-game-item[data-game-id="${gameId}"]`);
        if (gameItem) {
            const progressBar = gameItem.querySelector('.library-game-progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.classList.add('downloading');
                
                // محاكاة التقدم
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 2;
                    progressBar.style.width = `${progress}%`;
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        progressBar.classList.remove('downloading');
                    }
                }, 50);
            }
        }
    }

    // إخفاء شريط التحميل
    hideDownloadProgress(gameId) {
        const gameItem = document.querySelector(`.library-game-item[data-game-id="${gameId}"]`);
        if (gameItem) {
            const progressBar = gameItem.querySelector('.library-game-progress-bar');
            if (progressBar) {
                progressBar.classList.remove('downloading');
            }
        }
    }
}

// إضافة أنماط المكتبة
const libraryStyles = document.createElement('style');
libraryStyles.textContent = `
    .empty-library {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--ps-gray-lighter);
    }
    
    .empty-icon {
        font-size: 4rem;
        color: var(--ps-gray-light);
        margin-bottom: 2rem;
    }
    
    .empty-library h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: var(--ps-white);
    }
    
    .empty-library p {
        margin-bottom: 2rem;
    }
    
    .library-game-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .library-action-btn {
        width: 40px;
        height: 40px;
        background: var(--ps-gray-light);
        border: none;
        border-radius: 50%;
        color: var(--ps-white);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .library-action-btn:hover {
        background: var(--ps-blue);
        transform: scale(1.1);
    }
    
    .library-action-btn .favorited {
        color: var(--ps-red);
    }
    
    .library-game-progress-bar.downloading {
        background: linear-gradient(90deg, var(--ps-blue), var(--ps-green));
        animation: downloading 2s linear infinite;
    }
    
    @keyframes downloading {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
`;
document.head.appendChild(libraryStyles);

// تهيئة مدير المكتبة
window.addEventListener('DOMContentLoaded', () => {
    window.libraryManager = new LibraryManager();
});
