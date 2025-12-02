// إدارة الملف الشخصي
class ProfileManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.waitForUserData();
        this.setupEventListeners();
        this.loadProfileData();
        this.setupAvatarUpload();
    }

    // الانتظار حتى تحميل بيانات المستخدم
    async waitForUserData() {
        let attempts = 0;
        while (!window.psApp?.userData && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    // تحميل بيانات الملف الشخصي
    loadProfileData() {
        if (!window.psApp?.userData) return;

        const user = window.psApp.userData;
        
        // تحديث الإحصائيات
        this.updateStats(user);
        
        // تحديث الإنجازات
        this.updateAchievements(user.achievements || []);
        
        // تحديث تاريخ اللعب
        this.updatePlayHistory();
    }

    // تحديث الإحصائيات
    updateStats(user) {
        // وقت اللعب
        const playTime = document.getElementById('play-time');
        if (playTime) {
            const hours = Math.floor(user.totalPlayTime / 3600);
            const minutes = Math.floor((user.totalPlayTime % 3600) / 60);
            playTime.textContent = `${hours} س ${minutes} د`;
        }
        
        // عدد الألعاب
        const ownedGames = document.getElementById('owned-games');
        if (ownedGames) {
            ownedGames.textContent = user.library?.length || 0;
        }
        
        // الإنجازات
        const achievements = document.getElementById('achievements');
        if (achievements) {
            achievements.textContent = user.achievements?.length || 0;
        }
        
        // التقييم
        const playerRating = document.getElementById('player-rating');
        if (playerRating) {
            // حساب التقييم بناءً على الإحصائيات
            const rating = this.calculatePlayerRating(user);
            playerRating.textContent = rating;
        }
        
        // المستوى والخبرة
        this.updateLevelProgress(user);
    }

    // حساب تقييم اللاعب
    calculatePlayerRating(user) {
        let rating = 5.0;
        
        if (user.totalPlayTime > 100) rating += 1;
        if (user.achievements?.length > 10) rating += 1;
        if (user.library?.length > 20) rating += 1;
        
        return rating.toFixed(1);
    }

    // تحديث شريط المستوى
    updateLevelProgress(user) {
        const levelBar = document.querySelector('.level-bar');
        const levelText = document.querySelector('.level-text');
        
        if (levelBar && levelText) {
            const exp = user.exp || 0;
            const level = user.level || 1;
            const expNeeded = level * 1000;
            const progress = Math.min((exp / expNeeded) * 100, 100);
            
            levelBar.style.width = `${progress}%`;
            levelText.textContent = `المستوى ${level}`;
        }
    }

    // تحديث الإنجازات
    updateAchievements(achievements) {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        if (!achievements || achievements.length === 0) {
            container.innerHTML = `
                <div class="no-achievements">
                    <i class="fas fa-trophy"></i>
                    <p>لا توجد إنجازات بعد</p>
                    <small>العب الألعاب لتحصل على إنجازات</small>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon || 'trophy'}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-date">${achievement.date}</span>
                </div>
            </div>
        `).join('');
    }

    // تحديث تاريخ اللعب
    updatePlayHistory() {
        const container = document.getElementById('play-history');
        if (!container) return;

        // بيانات وهمية للتاريخ
        const history = [
            { game: 'Space Runner', time: '2h 30m', date: 'اليوم' },
            { game: 'Puzzle Master', time: '1h 15m', date: 'أمس' },
            { game: 'Soccer Champs', time: '3h 45m', date: 'قبل يومين' },
            { game: 'Car Racing', time: '45m', date: 'الأسبوع الماضي' }
        ];

        container.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-game">${item.game}</div>
                <div class="history-time">${item.time}</div>
                <div class="history-date">${item.date}</div>
            </div>
        `).join('');
    }

    // إعداد تحميل الصورة
    setupAvatarUpload() {
        const changeAvatarBtn = document.querySelector('.change-avatar');
        if (!changeAvatarBtn) return;

        changeAvatarBtn.addEventListener('click', () => {
            this.showAvatarUploadDialog();
        });
    }

    // عرض نافذة تحميل الصورة
    showAvatarUploadDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'avatar-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>تغيير الصورة الشخصية</h3>
                <div class="avatar-options">
                    <div class="avatar-option" data-avatar="default">
                        <img src="assets/images/default-avatar.png" alt="افتراضي">
                        <span>افتراضي</span>
                    </div>
                    <div class="avatar-option" data-avatar="avatar1">
                        <img src="assets/images/avatars/avatar1.png" alt="صورة 1">
                        <span>صورة 1</span>
                    </div>
                    <div class="avatar-option" data-avatar="avatar2">
                        <img src="assets/images/avatars/avatar2.png" alt="صورة 2">
                        <span>صورة 2</span>
                    </div>
                    <div class="avatar-option" data-avatar="avatar3">
                        <img src="assets/images/avatars/avatar3.png" alt="صورة 3">
                        <span>صورة 3</span>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="ps-btn ps-btn-secondary" id="cancel-avatar">إلغاء</button>
                    <button class="ps-btn ps-btn-primary" id="save-avatar">حفظ</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // إضافة مستمعي الأحداث
        document.getElementById('cancel-avatar').addEventListener('click', () => {
            dialog.remove();
        });

        document.getElementById('save-avatar').addEventListener('click', () => {
            const selected = document.querySelector('.avatar-option.selected');
            if (selected) {
                const avatar = selected.dataset.avatar;
                this.changeAvatar(avatar);
            }
            dialog.remove();
        });

        // اختيار الصورة
        dialog.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                dialog.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });
    }

    // تغيير الصورة الشخصية
    changeAvatar(avatarName) {
        if (!window.psApp?.userData) return;

        let avatarUrl = 'assets/images/default-avatar.png';
        
        switch (avatarName) {
            case 'avatar1':
                avatarUrl = 'assets/images/avatars/avatar1.png';
                break;
            case 'avatar2':
                avatarUrl = 'assets/images/avatars/avatar2.png';
                break;
            case 'avatar3':
                avatarUrl = 'assets/images/avatars/avatar3.png';
                break;
        }

        // تحديث بيانات المستخدم
        window.psApp.userData.avatar = avatarUrl;
        window.psApp.saveUserData();
        window.psApp.updateUserUI();

        window.storeManager?.showNotification('تم تغيير الصورة الشخصية', 'success');
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // فتح إعدادات الملف
        document.getElementById('profile-settings-btn')?.addEventListener('click', () => {
            this.showProfileSettings();
        });
    }

    // عرض إعدادات الملف الشخصي
    showProfileSettings() {
        alert('إعدادات الملف الشخصي - قريباً!');
    }
}

// إضافة أنماط الملف الشخصي
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .no-achievements {
        text-align: center;
        padding: 2rem;
        color: var(--ps-gray-lighter);
    }
    
    .no-achievements i {
        font-size: 3rem;
        color: var(--ps-gray-light);
        margin-bottom: 1rem;
        display: block;
    }
    
    .achievement-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        margin-bottom: 1rem;
        border: 1px solid var(--ps-gray-light);
    }
    
    .achievement-icon {
        width: 60px;
        height: 60px;
        background: var(--gradient-ps);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
    }
    
    .achievement-info {
        flex: 1;
    }
    
    .achievement-info h4 {
        margin-bottom: 0.5rem;
        color: var(--ps-white);
    }
    
    .achievement-date {
        color: var(--ps-gray-lighter);
        font-size: 0.9rem;
        display: block;
        margin-top: 0.5rem;
    }
    
    .history-item {
        display: flex;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid var(--ps-gray-light);
    }
    
    .history-item:last-child {
        border-bottom: none;
    }
    
    .avatar-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .dialog-content {
        background: var(--gradient-dark);
        border-radius: 20px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        border: 1px solid var(--ps-gray-light);
    }
    
    .avatar-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .avatar-option {
        text-align: center;
        cursor: pointer;
        padding: 1rem;
        border-radius: 10px;
        border: 2px solid transparent;
        transition: all 0.2s ease;
    }
    
    .avatar-option:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .avatar-option.selected {
        border-color: var(--ps-blue);
        background: rgba(0, 102, 204, 0.1);
    }
    
    .avatar-option img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 0.5rem;
        border: 3px solid var(--ps-gray-light);
    }
    
    .dialog-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
`;
document.head.appendChild(profileStyles);

// تهيئة مدير الملف الشخصي
window.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});
