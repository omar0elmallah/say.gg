// إدارة متجر PlayStation
class StoreManager {
    constructor() {
        this.currentSection = 'featured';
        this.searchQuery = '';
        this.filteredGames = [];
        this.init();
    }

    async init() {
        await this.waitForGameData();
        this.setupStoreSections();
        this.renderStoreContent();
    }

    // الانتظار حتى تحميل بيانات الألعاب
    async waitForGameData() {
        let attempts = 0;
        while (!window.gameData && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.gameData) {
            console.warn('Game data not loaded, using fallback');
            window.gameData = [];
        }
    }

    // إعداد أقسام المتجر
    setupStoreSections() {
        document.querySelectorAll('.store-section').forEach(section => {
            section.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = e.currentTarget.dataset.section;
                this.switchSection(sectionName);
            });
        });
    }

    // تبديل القسم
    switchSection(sectionName) {
        // تحديث الأقسام النشطة
        document.querySelectorAll('.store-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.querySelector(`.store-section[data-section="${sectionName}"]`);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        this.currentSection = sectionName;
        this.renderStoreContent();
        window.psApp?.playSystemSound('click');
    }

    // عرض محتوى المتجر
    renderStoreContent() {
        this.updateFeaturedGame();
        this.updateGamesCatalog();
    }

    // تحديث اللعبة المميزة
    updateFeaturedGame() {
        const container = document.getElementById('featured-game');
        if (!container) return;

        const featured = window.gameData?.find(game => game.featured) || window.gameData?.[0];
        if (!featured) return;

        container.innerHTML = `
            <div class="featured-content">
                <div class="featured-info">
                    <h2>${featured.title}</h2>
                    <p class="featured-description">${featured.description}</p>
                    <div class="featured-meta">
                        <span>⭐ ${featured.rating}</span>
                        <span>👥 ${featured.players}</span>
                        <span>${featured.size}</span>
                    </div>
                    <div class="featured-actions">
                        <button class="ps-btn ps-btn-primary" onclick="window.consoleUI.playGame('${featured.id}')">
                            <i class="fas fa-play"></i> تشغيل مجاني
                        </button>
                        <button class="ps-btn ps-btn-outline" onclick="window.consoleUI.showGameDetails('${featured.id}')">
                            <i class="fas fa-info-circle"></i> التفاصيل
                        </button>
                    </div>
                </div>
                <div class="featured-image">
                    <img src="${featured.image}" alt="${featured.title}">
                </div>
            </div>
        `;
    }

    // تحديث كتالوج الألعاب
    updateGamesCatalog() {
        const container = document.getElementById('store-games');
        if (!container) return;

        // فلترة الألعاب حسب القسم
        let games = [...(window.gameData || [])];
        
        switch (this.currentSection) {
            case 'new':
                games = games.filter(game => game.new);
                break;
            case 'top':
                games = games.sort((a, b) => b.rating - a.rating);
                break;
            case 'free':
                games = games.filter(game => game.price === 0);
                break;
            case 'categories':
                // عرض حسب الفئات
                this.showCategories();
                return;
        }
        
        // تطبيق البحث
        if (this.searchQuery) {
            games = games.filter(game => 
                game.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                game.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                game.category.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        this.filteredGames = games;
        
        container.innerHTML = games.map(game => `
            <div class="store-game-card" data-game-id="${game.id}">
                <div class="store-game-image">
                    <img src="${game.image}" alt="${game.title}">
                    ${game.new ? '<span class="new-badge">جديد</span>' : ''}
                    ${game.discount ? `<span class="discount-badge">-${game.discount}%</span>` : ''}
                </div>
                <div class="store-game-info">
                    <h3>${game.title}</h3>
                    <p>${game.category}</p>
                    <div class="store-game-meta">
                        <span>⭐ ${game.rating}</span>
                        <span>${game.size}</span>
                    </div>
                    <div class="store-game-price">
                        ${game.price > 0 ? 
                            `<span class="price">${game.price} رس</span>` : 
                            '<span class="free">مجاني</span>'
                        }
                    </div>
                    <div class="store-game-actions">
                        <button class="store-action-btn" onclick="window.consoleUI.showGameDetails('${game.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="store-action-btn" onclick="window.consoleUI.playGame('${game.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="store-action-btn" onclick="this.addToLibrary('${game.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // عرض الفئات
    showCategories() {
        const container = document.getElementById('store-games');
        if (!container) return;

        const categories = [
            { id: 'action', name: 'أكشن', icon: 'fa-fist-raised', count: 12 },
            { id: 'adventure', name: 'مغامرة', icon: 'fa-mountain', count: 8 },
            { id: 'sports', name: 'رياضة', icon: 'fa-futbol', count: 6 },
            { id: 'racing', name: 'سباق', icon: 'fa-flag-checkered', count: 5 },
            { id: 'puzzle', name: 'ألغاز', icon: 'fa-puzzle-piece', count: 9 },
            { id: 'strategy', name: 'إستراتيجية', icon: 'fa-chess', count: 4 },
            { id: 'arcade', name: 'أركيد', icon: 'fa-gamepad', count: 15 },
            { id: 'simulation', name: 'محاكاة', icon: 'fa-plane', count: 7 }
        ];

        container.innerHTML = `
            <div class="categories-grid">
                ${categories.map(cat => `
                    <div class="category-card" onclick="window.storeManager.showCategory('${cat.id}')">
                        <div class="category-icon">
                            <i class="fas ${cat.icon}"></i>
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.count} لعبة</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // عرض ألعاب فئة معينة
    showCategory(categoryId) {
        const games = window.gameData?.filter(game => game.category === categoryId) || [];
        
        // إنشاء نافذة عرض الفئة
        const modal = document.createElement('div');
        modal.className = 'category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.getCategoryName(categoryId)}</h2>
                    <button class="modal-close" onclick="this.closeCategoryModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="category-games">
                        ${games.map(game => `
                            <div class="category-game">
                                <img src="${game.image}" alt="${game.title}">
                                <div class="category-game-info">
                                    <h3>${game.title}</h3>
                                    <p>${game.description}</p>
                                    <button class="ps-btn ps-btn-small" onclick="window.consoleUI.showGameDetails('${game.id}')">
                                        التفاصيل
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة وظيفة الإغلاق
        window.closeCategoryModal = () => {
            modal.remove();
        };
    }

    // البحث عن ألعاب
    searchGames(query) {
        this.searchQuery = query;
        this.renderStoreContent();
    }

    // إضافة لعبة إلى المكتبة
    addToLibrary(gameId) {
        if (!window.psApp?.userData) return;
        
        const game = window.gameData?.find(g => g.id === gameId);
        if (!game) return;
        
        // التحقق من وجود اللعبة في المكتبة
        if (!window.psApp.userData.library.includes(gameId)) {
            window.psApp.userData.library.push(gameId);
            window.psApp.saveUserData();
            
            // إظهار رسالة نجاح
            this.showNotification(`تمت إضافة ${game.title} إلى المكتبة`, 'success');
            
            // تحديث المكتبة إذا كانت مفتوحة
            if (window.libraryManager) {
                window.libraryManager.updateLibrary();
            }
        } else {
            this.showNotification('اللعبة موجودة بالفعل في المكتبة', 'info');
        }
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // إخفاء الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // الحصول على اسم الفئة
    getCategoryName(categoryId) {
        const categories = {
            'action': 'أكشن',
            'adventure': 'مغامرة',
            'sports': 'رياضة',
            'racing': 'سباق',
            'puzzle': 'ألغاز',
            'strategy': 'إستراتيجية',
            'arcade': 'أركيد',
            'simulation': 'محاكاة'
        };
        
        return categories[categoryId] || categoryId;
    }
}

// إضافة أنماط الإشعارات
const storeStyles = document.createElement('style');
storeStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: var(--ps-gray);
        border: 2px solid var(--ps-gray-light);
        border-radius: 10px;
        padding: 1rem 1.5rem;
        color: var(--ps-white);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        min-width: 300px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    
    .notification-success {
        background: rgba(0, 204, 0, 0.1);
        border-color: var(--ps-green);
    }
    
    .notification-info {
        background: rgba(0, 102, 204, 0.1);
        border-color: var(--ps-blue);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
    }
    
    .store-game-card {
        background: var(--gradient-game);
        border-radius: 15px;
        overflow: hidden;
        border: 1px solid var(--ps-gray-light);
        transition: all 0.3s ease;
    }
    
    .store-game-card:hover {
        transform: translateY(-5px);
        border-color: var(--ps-blue);
        box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
    }
    
    .store-game-image {
        position: relative;
        height: 150px;
        overflow: hidden;
    }
    
    .store-game-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .store-game-card:hover .store-game-image img {
        transform: scale(1.1);
    }
    
    .new-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--ps-blue);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .discount-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: var(--ps-red);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .store-game-info {
        padding: 1rem;
    }
    
    .store-game-meta {
        display: flex;
        justify-content: space-between;
        margin: 0.5rem 0;
        color: var(--ps-gray-lighter);
        font-size: 0.9rem;
    }
    
    .store-game-price {
        margin: 1rem 0;
    }
    
    .price {
        color: var(--ps-white);
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .free {
        color: var(--ps-green);
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .store-game-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }
    
    .store-action-btn {
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
    
    .store-action-btn:hover {
        background: var(--ps-blue);
        transform: scale(1.1);
    }
    
    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
        padding: 1rem;
    }
    
    .category-card {
        background: var(--gradient-game);
        border-radius: 15px;
        padding: 2rem 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid var(--ps-gray-light);
    }
    
    .category-card:hover {
        transform: translateY(-10px);
        border-color: var(--ps-blue);
        box-shadow: 0 15px 30px rgba(0, 102, 204, 0.3);
    }
    
    .category-icon {
        font-size: 3rem;
        color: var(--ps-blue-light);
        margin-bottom: 1rem;
    }
    
    .category-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .category-modal .modal-content {
        background: var(--gradient-dark);
        border-radius: 20px;
        width: 90%;
        max-width: 1000px;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid var(--ps-gray-light);
    }
    
    .category-games {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 2rem;
    }
    
    .category-game {
        display: flex;
        gap: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 1rem;
        border: 1px solid var(--ps-gray-light);
    }
    
    .category-game img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 10px;
    }
`;
document.head.appendChild(storeStyles);

// تهيئة مدير المتجر
window.addEventListener('DOMContentLoaded', () => {
    window.storeManager = new StoreManager();
});
