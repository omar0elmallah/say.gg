// التطبيق الرئيسي لموقع PlayStation Console
class PSConsoleApp {
    constructor() {
        this.currentScreen = 'home';
        this.userData = null;
        this.gamesData = [];
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadGamesData();
        this.setupEventListeners();
        this.startSystem();
        this.updateTime();
    }

    // تحميل بيانات المستخدم
    async loadUserData() {
        const savedData = localStorage.getItem('ps_console_user');
        
        if (savedData) {
            this.userData = JSON.parse(savedData);
        } else {
            // بيانات مستخدم ضيف افتراضية
            this.userData = {
                id: 'guest_' + Date.now(),
                username: 'ضيف',
                avatar: 'assets/images/default-avatar.png',
                level: 1,
                exp: 0,
                totalPlayTime: 0,
                gamesPlayed: 0,
                achievements: [],
                library: [],
                preferences: {
                    theme: 'dark',
                    volume: 80,
                    language: 'ar'
                }
            };
            this.saveUserData();
        }
        
        this.updateUserUI();
    }

    // حفظ بيانات المستخدم
    saveUserData() {
        localStorage.setItem('ps_console_user', JSON.stringify(this.userData));
    }

    // تحميل بيانات الألعاب
    async loadGamesData() {
        try {
            const response = await fetch('data/games.json');
            this.gamesData = await response.json();
            window.gameData = this.gamesData; // لجعلها متاحة عالمياً
        } catch (error) {
            console.error('Error loading games data:', error);
            this.gamesData = [];
        }
    }

    // بدء النظام
    startSystem() {
        const bootScreen = document.getElementById('boot-screen');
        const mainUI = document.getElementById('main-ui');
        
        // محاكاة تحميل النظام
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            mainUI.classList.remove('hidden');
            this.playSystemSound('boot');
        }, 3000);
    }

    // تحديث الوقت
    updateTime() {
        const updateClock = () => {
            const now = new Date();
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                const timeString = now.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                timeElement.textContent = timeString;
            }
        };
        
        updateClock();
        setInterval(updateClock, 60000);
    }

    // تحديث واجهة المستخدم
    updateUserUI() {
        // تحديث الصورة
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = this.userData.avatar;
        
        // تحديث الاسم
        const username = document.getElementById('username');
        if (username) username.textContent = this.userData.username;
        
        // تحديث الملف الشخصي
        const profileName = document.getElementById('profile-name');
        if (profileName) profileName.textContent = this.userData.username;
        
        const profileId = document.getElementById('profile-id');
        if (profileId) profileId.textContent = `ID: ${this.userData.id}`;
        
        // تحديث التفضيلات
        this.applyPreferences();
    }

    // تطبيق التفضيلات
    applyPreferences() {
        const theme = this.userData.preferences.theme || 'dark';
        document.body.className = `ps-theme ${theme}-theme`;
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.value = theme;
        
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) volumeSlider.value = this.userData.preferences.volume || 80;
        
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.value = this.userData.preferences.language || 'ar';
    }

    // تبديل الشاشات
    switchScreen(screenName) {
        // إخفاء جميع الشاشات
        document.querySelectorAll('.app-screen, .main-ui').forEach(el => {
            el.classList.add('hidden');
        });
        
        // إزالة النشاط من جميع أزرار القائمة
        document.querySelectorAll('.dock-app, .quick-app').forEach(el => {
            el.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        if (screenName === 'home') {
            document.getElementById('main-ui').classList.remove('hidden');
            document.querySelector('.dock-app[data-app="home"]').classList.add('active');
        } else {
            const screen = document.getElementById(`${screenName}-screen`);
            if (screen) {
                screen.classList.remove('hidden');
                document.querySelector(`.dock-app[data-app="${screenName}"]`).classList.add('active');
            }
        }
        
        this.currentScreen = screenName;
        this.playSystemSound('click');
    }

    // تشغيل الأصوات
    playSystemSound(soundName) {
        if (!this.userData.preferences.volume || this.userData.preferences.volume === 0) return;
        
        const sounds = {
            click: 'assets/sounds/click.mp3',
            boot: 'assets/sounds/boot.mp3',
            notification: 'assets/sounds/notification.mp3',
            success: 'assets/sounds/success.mp3'
        };
        
        if (sounds[soundName]) {
            const audio = new Audio(sounds[soundName]);
            audio.volume = this.userData.preferences.volume / 100;
            audio.play().catch(() => {}); // تجاهل الأخطاء الصوتية
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // التنقل بين الشاشات
        document.querySelectorAll('.dock-app, .quick-app').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const app = button.dataset.app;
                this.switchScreen(app);
            });
        });
        
        // أزرار الرجوع
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const target = button.dataset.back;
                this.switchScreen(target);
            });
        });
        
        // البحث في المتجر
        const storeSearch = document.getElementById('store-search');
        if (storeSearch) {
            storeSearch.addEventListener('input', (e) => {
                window.storeManager.searchGames(e.target.value);
            });
        }
        
        // تغيير المظهر
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.userData.preferences.theme = e.target.value;
                this.saveUserData();
                this.applyPreferences();
            });
        }
        
        // تغيير الصوت
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.userData.preferences.volume = e.target.value;
                this.saveUserData();
            });
        }
        
        // تغيير اللغة
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.userData.preferences.language = e.target.value;
                this.saveUserData();
                // هنا يمكن إضافة تغيير اللغة الديناميكي
            });
        }
        
        // تسجيل الخروج
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('هل تريد تسجيل الخروج؟')) {
                    localStorage.removeItem('ps_console_user');
                    location.reload();
                }
            });
        }
        
        // إيقاف التشغيل
        const powerOffBtn = document.getElementById('power-off');
        if (powerOffBtn) {
            powerOffBtn.addEventListener('click', () => {
                if (confirm('هل تريد إيقاف تشغيل النظام؟')) {
                    document.getElementById('main-ui').classList.add('hidden');
                    document.getElementById('boot-screen').classList.remove('hidden');
                    setTimeout(() => {
                        alert('النظام مغلق. قم بتحديث الصفحة لإعادة التشغيل.');
                    }, 1000);
                }
            });
        }
        
        // فتح/إغلاق القائمة الجانبية
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const sideMenu = document.getElementById('side-menu');
                if (sideMenu.classList.contains('open')) {
                    sideMenu.classList.remove('open');
                }
            }
        });
        
        // فتح القائمة الجانبية بالزر
        const menuButton = document.querySelector('.menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                document.getElementById('side-menu').classList.add('open');
            });
        }
        
        // إغلاق القائمة الجانبية
        document.querySelectorAll('.menu-close').forEach(button => {
            button.addEventListener('click', () => {
                document.getElementById('side-menu').classList.remove('open');
            });
        });
        
        // إغلاق النافذة المنبثقة
        document.getElementById('close-modal')?.addEventListener('click', () => {
            document.getElementById('game-details-modal').classList.add('hidden');
        });
    }
}

// تهيئة التطبيق
window.addEventListener('DOMContentLoaded', () => {
    window.psApp = new PSConsoleApp();
});
