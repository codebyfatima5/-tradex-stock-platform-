// Global state
let isLoggedIn = false;
let isLoginMode = true;
let userData = {
    username: '',
    email: '',
    balance: 24567.89,
    dailyGain: 1234.56,
    assets: 12,
    orders: 3
};

// DOM Elements
const profileBtn = document.getElementById('profileBtn');
const userStatus = document.getElementById('userStatus');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const authBtnText = document.getElementById('authBtnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const toggleAuth = document.getElementById('toggleAuth');
const dashboardContent = document.getElementById('dashboardContent');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    updateStats();
    startPriceAnimation();
});

// Event Listeners
function initEventListeners() {
    profileBtn.addEventListener('click', toggleAuthModal);
    authForm.addEventListener('submit', handleAuth);
    toggleAuth.addEventListener('click', toggleAuthMode);
    
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) closeModal();
    });
    
    hamburger.addEventListener('click', toggleMobileMenu);
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-buy')) handleBuyOrder(e.target.closest('.asset-card'));
        if (e.target.closest('.btn-sell')) handleSellOrder(e.target.closest('.asset-card'));
        if (e.target.closest('.asset-card')) showAssetDetails(e.target.closest('.asset-card'));
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
}

// Toggle Auth Modal
function toggleAuthModal() {
    if (isLoggedIn) {
        logout();
    } else {
        authModal.classList.toggle('active');
        if (authModal.classList.contains('active')) {
            if (isLoginMode) {
                emailInput.focus();
            } else {
                document.getElementById('username').focus();
            }
        }
    }
}

// Handle Login/Register
async function handleAuth(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const username = document.getElementById('username')?.value.trim();
    
    if (!email || !password) {
        showNotification('Please fill all required fields', 'warning');
        return;
    }
    
    if (!isLoginMode && (!username || username.length < 3)) {
        showNotification('Username must be at least 3 characters', 'warning');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        if (isLoginMode) {
            // LOGIN LOGIC
            const savedUser = localStorage.getItem('user_' + email);
            if (savedUser) {
                const user = JSON.parse(savedUser);
                if (user.password === password) {
                    loginSuccess(user.username || email.split('@')[0], email);
                } else {
                    showNotification('❌ Invalid password!', 'error');
                    showLoading(false);
                }
            } else {
                showNotification('❌ No account found with this email', 'error');
                showLoading(false);
            }
        } else {
            // REGISTER LOGIC
            const existingUser = localStorage.getItem('user_' + email);
            if (existingUser) {
                showNotification('❌ Email already registered!', 'error');
                showLoading(false);
                return;
            }
            
            // Save new user
            const newUser = {
                username: username,
                email: email,
                password: password
            };
            
            localStorage.setItem('user_' + email, JSON.stringify(newUser));
            
            showNotification('✅ Registration successful! Logging you in...', 'success');
            
            // AUTO LOGIN after registration
            setTimeout(() => {
                loginSuccess(username, email);
            }, 1500);
        }
    }, 1500);
}

// Login Success
function loginSuccess(username, email) {
    isLoggedIn = true;
    userData.username = username;
    userData.email = email;
    
    closeModal();
    updateUI();
    showNotification(`🎉 Welcome ${username}!`, 'success');
    showLoading(false);
}

// Logout
function logout() {
    isLoggedIn = false;
    userData = {
        username: '',
        email: '',
        balance: 24567.89,
        dailyGain: 1234.56,
        assets: 12,
        orders: 3
    };
    updateUI();
    showNotification('👋 Logged out successfully', 'info');
}

// Toggle Login/Register Mode
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        modalTitle.textContent = 'Login to your account';
        modalSubtitle.textContent = 'Enter your credentials to continue';
        authBtnText.textContent = 'Sign In';
        toggleAuth.innerHTML = "Don't have an account? <strong>Create one</strong>";
        document.querySelector('.username-group').style.display = 'none';
    } else {
        modalTitle.textContent = 'Create new account';
        modalSubtitle.textContent = 'Join TradeX and start trading today';
        authBtnText.textContent = 'Sign Up';
        toggleAuth.innerHTML = "Already have an account? <strong>Sign in</strong>";
        document.querySelector('.username-group').style.display = 'block';
    }
}

// Update UI
function updateUI() {
    if (isLoggedIn) {
        profileBtn.innerHTML = `
            <i class="fas fa-user-check"></i>
            <span>${userData.username}</span>
        `;
        userStatus.textContent = userData.username;
        dashboardContent.classList.add('active');
    } else {
        profileBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Login</span>
        `;
        dashboardContent.classList.remove('active');
    }
}

// Close Modal
function closeModal() {
    authModal.classList.remove('active');
    authForm.reset();
    showLoading(false);
    document.querySelector('.username-group').style.display = 'none';
}

// Show/Hide Loading
function showLoading(show) {
    loadingSpinner.style.display = show ? 'inline-block' : 'none';
    authBtnText.style.opacity = show ? '0.5' : '1';
}

// Update Stats
function updateStats() {
    document.getElementById('balance').textContent = `$${userData.balance.toLocaleString()}`;
    document.getElementById('dailyGain').textContent = `+$${userData.dailyGain.toLocaleString()}`;
    document.getElementById('totalAssets').textContent = userData.assets;
    document.getElementById('activeOrders').textContent = userData.orders;
}

// Buy/Sell Orders
function handleBuyOrder(assetCard) {
    const symbol = assetCard.dataset.symbol;
    showNotification(`✅ Buy order placed for ${symbol}!`, 'success');
    userData.assets++;
    userData.orders++;
    updateStats();
}

function handleSellOrder(assetCard) {
    const symbol = assetCard.dataset.symbol;
    showNotification(`⚠️ Sell order placed for ${symbol}!`, 'warning');
    userData.orders++;
    updateStats();
}

function showAssetDetails(assetCard) {
    const symbol = assetCard.dataset.symbol;
    console.log(`📊 Showing details for ${symbol}`);
}

// Mobile Menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Price Animation
function startPriceAnimation() {
    const priceElements = document.querySelectorAll('.asset-price');
    setInterval(() => {
        priceElements.forEach(priceEl => {
            const currentPrice = parseFloat(priceEl.textContent.replace(/[^0-9.-]+/g,""));
            const change = (Math.random() - 0.5) * 2;
            const newPrice = currentPrice + change;
            priceEl.innerHTML = `$${newPrice.toFixed(2)} <span class="price-change ${change > 0 ? 'positive' : 'negative'}">${change > 0 ? '+' : ''}${change.toFixed(2)}%</span>`;
        });
    }, 3000);
}

// Notification System
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getIcon(type)}"></i>
        ${message}
        <button class="close-notif">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 4000);
    
    notification.querySelector('.close-notif').addEventListener('click', () => {
        notification.remove();
    });
}

function getIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

// Rest of the code remains same (styles injection, etc.)
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(400px);
        animation: slideIn 0.3s ease forwards;
        max-width: 350px;
    }
    .notification.success { border-left: 4px solid var(--success); }
    .notification.error { border-left: 4px solid var(--danger); }
    .notification.warning { border-left: 4px solid var(--warning); }
    .notification.info { border-left: 4px solid var(--primary); }
    @keyframes slideIn { to { transform: translateX(0); } }
    .close-notif { background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: auto; color: #666; }
    @media (max-width: 768px) { .notification { right: 10px; left: 10px; max-width: none; } }
`;
document.head.appendChild(notificationStyle);

const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    @media (max-width: 768px) {
        .hamburger { display: flex; }
        .nav-menu { display: none; position: absolute; top: 100%; left: 0; width: 100%; background: white; flex-direction: column; padding: 1rem; box-shadow: var(--shadow); }
        .nav-menu.active { display: flex; }
        .nav-menu li { margin: 0.5rem 0; }
        .welcome-title { font-size: 2rem; }
        .stats-grid, .assets-grid { grid-template-columns: 1fr; }
        .action-buttons { flex-direction: column; }
        .dashboard { padding: 0 1rem; }
    }
`;
document.head.appendChild(mobileMenuStyle);

window.TradeX = { login: loginSuccess, logout, updateStats };
console.log('🚀 TradeX Platform loaded successfully!');

