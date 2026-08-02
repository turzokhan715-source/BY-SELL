const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { users: [], submissions: [], withdrawals: [], adminReports: {}, categoryPrizes: {}, claimedUids: {}, archivedSubmissions: [] };
    }
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!data.withdrawals) data.withdrawals = [];
    if (!data.adminReports) data.adminReports = {};
    if (!data.categoryPrizes) data.categoryPrizes = {};
    if (!data.claimedUids) data.claimedUids = {};
    if (!data.archivedSubmissions) data.archivedSubmissions = [];
    return data;
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// সাবমিট ক্যাটেগরি লিস্ট
const CATEGORIES = [
    { id: 'instagram_2fa', name: 'Instagram 2FA ID', icon: '📸', gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { id: 'fb_page_cookies', name: 'Facebook Page Cookies', icon: '📄', gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)' },
    { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🍪', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '✉️', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)' }
];

// রিপোর্ট সেকশনের ক্যাটেগরি লিস্ট (নাম আপডেট করা হয়েছে)
const REPORT_CATEGORIES = [
    { id: 'instagram_2fa', name: '2FA Report', icon: '🛡️', gradient: 'linear-gradient(135deg, #f09433 0%, #dc2743 100%)' },
    { id: 'fb_page_cookies', name: 'Instagram Report', icon: '🌐', gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)' },
    { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🔑', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '💎', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)' }
];

// ==================== ১. ইউজার প্যানেল ====================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VoltX SMS - Premium Portal</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-dark: #121212;
                    --sidebar-bg: #181818;
                    --card-bg: #1e1e1e;
                    --primary-neon: #00E676;
                    --text-main: #ffffff;
                    --text-muted: #a0a0a0;
                    --border-color: #2a2a2a;
                }
                * { box-sizing: border-box; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-dark); color: var(--text-main); margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                
                .card { background-color: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 540px; padding: 35px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .icon-box { width: 60px; height: 60px; background: rgba(0, 230, 118, 0.1); border-radius: 12px; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; color: var(--primary-neon); font-size: 28px; border: 1px solid rgba(0, 230, 118, 0.3); }
                
                h2 { text-align: center; color: var(--text-main); margin-bottom: 8px; font-weight: 700; font-size: 24px; }
                p.subtitle { text-align: center; color: var(--text-muted); font-size: 14px; margin-bottom: 25px; }
                label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
                
                input, textarea, select { width: 100%; padding: 14px 18px; margin-bottom: 20px; border: 2px solid var(--border-color); border-radius: 10px; font-size: 15px; background: rgba(18, 18, 18, 0.8); color: #fff; outline: none; transition: all 0.3s ease; font-family: inherit; }
                input:focus, textarea:focus, select:focus { border-color: var(--primary-neon); background: rgba(18, 18, 18, 1); box-shadow: 0 0 0 4px rgba(0, 230, 118, 0.15); }
                select option { background: #181818; color: #fff; }
                
                .btn { background-color: var(--primary-neon); color: #000; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 15px; font-weight: 700; width: 100%; transition: all 0.3s ease; font-family: inherit; }
                .btn:hover { opacity: 0.9; transform: translateY(-2px); }
                
                .switch-text { text-align: center; margin-top: 20px; font-size: 13px; color: var(--primary-neon); font-weight: 600; cursor: pointer; letter-spacing: 0.5px; }
                .switch-text:hover { text-decoration: underline; }
                .hidden { display: none !important; }
                
                .dashboard-container { max-width: 950px !important; padding: 35px !important; }
                
                .top-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; margin-bottom: 25px; gap: 15px; }
                .balance-badge { background: rgba(0, 230, 118, 0.1); border: 1px solid rgba(0, 230, 118, 0.3); padding: 10px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; }
                .balance-amount { font-size: 20px; font-weight: 800; color: var(--primary-neon); }

                .user-nav-tabs { display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap; }
                .nav-tab-btn { background: #181818; border: 1px solid var(--border-color); color: var(--text-muted); padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s; font-family: inherit; }
                .nav-tab-btn.active { background: rgba(0, 230, 118, 0.15); color: var(--primary-neon); border-color: var(--primary-neon); }

                .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 20px; margin-top: 25px; }
                .cat-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; }
                .cat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--accent-gradient); }
                .cat-card:hover { transform: translateY(-4px); border-color: var(--primary-neon); }
                .cat-icon { font-size: 40px; margin-bottom: 15px; display: block; }
                .cat-title { font-weight: 700; color: var(--text-main); font-size: 15px; }

                .back-btn { background: #2a2a2a; color: #fff; width: auto; padding: 10px 20px; margin-bottom: 20px; font-size: 13px; border: 1px solid var(--border-color); }
                .back-btn:hover { background: #333; transform: none; }

                .sheet-scroll-box { max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 10px; margin-top: 20px; background: rgba(18, 18, 18, 0.5); }
                table { width: 100%; border-collapse: collapse; min-width: 700px; font-size: 14px; }
                th, td { border-bottom: 1px solid var(--border-color); padding: 14px 18px; text-align: left; white-space: nowrap; }
                th { background: #181818; color: var(--text-muted); position: sticky; top: 0; z-index: 10; font-weight: 700; }
                td { color: var(--text-main); }
                
                .sheet-details { max-width: 320px; overflow-x: auto; white-space: nowrap; font-family: monospace; background: rgba(0, 0, 0, 0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--primary-neon); }
                
                .status-pending { color: #ffb74d; font-weight: 700; background: rgba(255, 183, 77, 0.15); padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 12px; border: 1px solid rgba(255, 183, 77, 0.3); }
                .status-success { color: var(--primary-neon); font-weight: 700; background: rgba(0, 230, 118, 0.15); padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 12px; border: 1px solid rgba(0, 230, 118, 0.3); }
                
                .delete-btn { background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; }
                .delete-btn:hover { opacity: 0.9; }

                .logout-btn { background: #ef4444; color: #fff; margin-top: 30px; max-width: 160px; }

                .checker-box { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px; margin-top: 20px; }
                .checker-title { text-align: center; font-size: 20px; font-weight: 800; color: var(--primary-neon); margin-bottom: 20px; }
                
                .uid-result-row { display: flex; justify-content: space-between; align-items: center; background: rgba(18, 18, 18, 0.6); padding: 10px 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border-color); }
                .uid-text { font-family: monospace; font-weight: 600; font-size: 14px; }
                .badge-live { color: var(--primary-neon); background: rgba(0,230,118,0.15); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                .badge-die { color: #f87171; background: rgba(248,113,113,0.15); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                .badge-claimed { color: var(--text-muted); background: rgba(160,160,160,0.15); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                
                .claim-btn { background-color: var(--primary-neon); color: #000; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: 0.2s; }
                .claim-btn:hover { opacity: 0.9; }

                .claim-all-btn { background: linear-gradient(135deg, #00E676, #00b0ff); color: #000; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 700; width: 100%; margin-bottom: 15px; transition: 0.2s; }
                .claim-all-btn:hover { opacity: 0.9; }

                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .card { padding: 20px; }
                    .dashboard-container { padding: 20px !important; }
                    .category-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>

            <!-- Login View -->
            <div class="card" id="login-card">
                <div class="icon-box">⚡</div>
                <h2>VOLTX SMS.</h2>
                <p class="subtitle">Secure ID Submission & Report Portal</p>
                
                <label>Email Address</label>
                <input type="email" id="login-email" placeholder="name@example.com">
                
                <label>Password</label>
                <input type="password" id="login-pass" placeholder="••••••••">
                
                <button class="btn" onclick="loginUser()">LOGIN TO PORTAL</button>
                <div class="switch-text" onclick="showRegister()">Don't have an account? Register Now</div>
            </div>

            <!-- Register View -->
            <div class="card hidden" id="register-card">
                <div class="icon-box">⚡</div>
                <h2>Create Account</h2>
                <p class="subtitle">Join VoltX SMS exclusive platform</p>
                
                <div style="display: flex; gap: 12px;">
                    <div>
                        <label>First Name</label>
                        <input type="text" id="reg-firstname" placeholder="John">
                    </div>
                    <div>
                        <label>Last Name</label>
                        <input type="text" id="reg-lastname" placeholder="Doe">
                    </div>
                </div>

                <label>Telegram Username</label>
                <input type="text" id="reg-username" placeholder="@username">

                <label>Email Address</label>
                <input type="email" id="reg-email" placeholder="name@example.com">

                <label>Password</label>
                <input type="password" id="reg-pass" placeholder="••••••••">

                <button class="btn" onclick="registerUser()">REGISTER ACCOUNT</button>
                <div class="switch-text" onclick="showLogin()">Already have an account? Login</div>
            </div>

            <!-- User Dashboard -->
            <div class="card dashboard-container hidden" id="dashboard-card">
                <div class="top-bar">
                    <div>
                        <h2 style="text-align: left; margin: 0; font-size: 22px;">Welcome, <span id="user-display-name" style="color: var(--primary-neon);"></span></h2>
                        <p class="subtitle" style="text-align: left; margin: 5px 0 0 0;">Telegram: <span id="user-display-tg" style="font-weight: 600; color: #fff;"></span></p>
                    </div>
                    <div class="balance-badge">
                        <span>💰 Balance:</span>
                        <span class="balance-amount" id="user-balance-display">৳0.00</span>
                    </div>
                </div>

                <div class="user-nav-tabs">
                    <button class="nav-tab-btn active" id="tab-btn-submit" onclick="switchUserTab('submit')">📥 Submit IDs</button>
                    <button class="nav-tab-btn" id="tab-btn-report" onclick="switchUserTab('report')">🔍 UID Checker & Claim</button>
                    <button class="nav-tab-btn" id="tab-btn-withdraw" onclick="switchUserTab('withdraw')">💸 Withdraw / Payment</button>
                </div>

                <!-- Submit IDs Section -->
                <div id="user-section-submit">
                    <div id="category-selection-view">
                        <h3 style="margin: 0 0 5px 0; color: #fff; font-size: 18px;">Select Category to Submit ID</h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Choose a category below to proceed with your submission.</p>
                        
                        <div class="category-grid">
                            ${CATEGORIES.map(cat => `
                                <div class="cat-card" style="--accent-gradient: ${cat.gradient};" onclick="openCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', 'submit')">
                                    <span class="cat-icon">${cat.icon}</span>
                                    <div class="cat-title">${cat.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div id="category-form-view" class="hidden">
                        <button class="btn back-btn" onclick="backToCategories()">⬅️ Back to Categories</button>
                        <h3 id="active-category-title" style="color: var(--primary-neon); margin-bottom: 15px; font-size: 20px;"></h3>
                        
                        <div style="background: var(--sidebar-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                            <label>Submit Details / Cookies</label>
                            <textarea id="id-details" rows="3" placeholder="Paste details or cookies here..."></textarea>
                            <button class="btn" onclick="submitId()" style="width: 180px;">Submit Now</button>
                        </div>

                        <h4 style="margin: 30px 0 15px 0; color: #fff; font-size: 16px;">Your Submissions History</h4>
                        <div class="sheet-scroll-box">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Details</th>
                                        <th style="text-align: center;">Status</th>
                                        <th style="text-align: center;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="user-subs-table"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Report & UID Checker Section -->
                <div id="user-section-report" class="hidden">
                    <div id="report-category-selection-view">
                        <h3 style="margin: 0 0 5px 0; color: #fff; font-size: 18px;">Select Report Category for UID Checker & Claim</h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Check live UIDs and claim your rewards.</p>
                        
                        <div class="category-grid">
                            ${REPORT_CATEGORIES.map(cat => `
                                <div class="cat-card" style="--accent-gradient: ${cat.gradient};" onclick="openCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', 'report')">
                                    <span class="cat-icon">${cat.icon}</span>
                                    <div class="cat-title">${cat.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div id="report-checker-view" class="hidden">
                        <button class="btn back-btn" onclick="backToCategories()">⬅️ Back to Categories</button>
                        <h3 id="active-report-category-title" style="color: var(--primary-neon); margin-bottom: 15px; font-size: 20px;"></h3>

                        <div class="checker-box">
                            <div class="checker-title">UID Scanner & Auto Claim Portal</div>
                            
                            <label>Paste UIDs (One UID per line)</label>
                            <textarea id="checker-input-uids" rows="5" placeholder="61592634719749&#10;61592262077319"></textarea>
                            
                            <button class="btn" onclick="runUidChecker()">START SCANNER</button>

                            <div style="margin-top: 25px;">
                                <div id="checker-output-box" style="min-height: 100px; max-height: 300px; overflow-y: auto;">
                                    <div style="color: var(--text-muted); text-align: center; padding: 30px;">No UIDs scanned yet.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Withdraw Section -->
                <div id="user-section-withdraw" class="hidden">
                    <h3 style="margin: 0 0 5px 0; color: #fff; font-size: 18px;">Withdraw Request / Payment</h3>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Request a payout to your mobile banking account.</p>

                    <div style="background: var(--sidebar-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color); max-width: 500px;">
                        <label>Select Payment Method</label>
                        <select id="withdraw-method">
                            <option value="Bkash">Bkash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                        </select>

                        <label>Phone Number</label>
                        <input type="text" id="withdraw-phone" placeholder="017xxxxxxxx">

                        <label>Amount (BDT)</label>
                        <input type="number" id="withdraw-amount" placeholder="0.00">

                        <button class="btn" onclick="sendWithdrawRequest()">Send Request</button>
                    </div>

                    <h4 style="margin: 30px 0 15px 0; color: #fff; font-size: 16px;">Your Withdrawal History</h4>
                    <div class="sheet-scroll-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Method</th>
                                    <th>Phone</th>
                                    <th>Amount</th>
                                    <th style="text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody id="user-withdraw-table"></tbody>
                        </table>
                    </div>
                </div>

                <button class="btn logout-btn" onclick="logout()">Logout</button>
            </div>

            <script>
                let currentUser = null;
                let activeCategory = null;
                let activeMode = 'submit';

                window.onload = function() {
                    const savedUser = localStorage.getItem('portal_current_user');
                    if(savedUser) {
                        currentUser = JSON.parse(savedUser);
                        document.getElementById('login-card').classList.add('hidden');
                        document.getElementById('dashboard-card').classList.remove('hidden');
                        updateUserUI();
                        switchUserTab('submit');
                    }
                };

                function showRegister() {
                    document.getElementById('login-card').classList.add('hidden');
                    document.getElementById('register-card').classList.remove('hidden');
                }

                function showLogin() {
                    document.getElementById('register-card').classList.add('hidden');
                    document.getElementById('login-card').classList.remove('hidden');
                }

                function registerUser() {
                    const firstName = document.getElementById('reg-firstname').value.trim();
                    const lastName = document.getElementById('reg-lastname').value.trim();
                    const username = document.getElementById('reg-username').value.trim();
                    const email = document.getElementById('reg-email').value.trim();
                    const password = document.getElementById('reg-pass').value.trim();

                    if(!firstName || !username || !email || !password) return alert('Please fill all required fields!');

                    fetch('/api/register', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ firstName, lastName, username, email, password })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert('Account created successfully! Please login.');
                            showLogin();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function loginUser() {
                    const email = document.getElementById('login-email').value.trim();
                    const password = document.getElementById('login-pass').value.trim();

                    if(!email || !password) return alert('Please enter email and password!');

                    fetch('/api/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ email, password })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            currentUser = data.user;
                            localStorage.setItem('portal_current_user', JSON.stringify(currentUser));
                            updateUserUI();
                            document.getElementById('login-card').classList.add('hidden');
                            document.getElementById('dashboard-card').classList.remove('hidden');
                            switchUserTab('submit');
                            backToCategories();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function updateUserUI() {
                    document.getElementById('user-display-name').innerText = currentUser.firstName + ' ' + currentUser.lastName;
                    document.getElementById('user-display-tg').innerText = '@' + currentUser.username;
                    document.getElementById('user-balance-display').innerText = '৳' + Number(currentUser.balance || 0).toFixed(2);
                }

                function refreshUserData() {
                    fetch('/api/user/refresh/' + currentUser.username)
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            currentUser = data.user;
                            localStorage.setItem('portal_current_user', JSON.stringify(currentUser));
                            updateUserUI();
                        }
                    });
                }

                function switchUserTab(tab) {
                    document.getElementById('tab-btn-submit').classList.remove('active');
                    document.getElementById('tab-btn-report').classList.remove('active');
                    document.getElementById('tab-btn-withdraw').classList.remove('active');

                    document.getElementById('user-section-submit').classList.add('hidden');
                    document.getElementById('user-section-report').classList.add('hidden');
                    document.getElementById('user-section-withdraw').classList.add('hidden');

                    if(tab === 'submit') {
                        document.getElementById('tab-btn-submit').classList.add('active');
                        document.getElementById('user-section-submit').classList.remove('hidden');
                        backToCategories();
                    } else if(tab === 'report') {
                        document.getElementById('tab-btn-report').classList.add('active');
                        document.getElementById('user-section-report').classList.remove('hidden');
                        backToCategories();
                    } else {
                        document.getElementById('tab-btn-withdraw').classList.add('active');
                        document.getElementById('user-section-withdraw').classList.remove('hidden');
                        loadUserWithdraws();
                    }
                }

                function openCategory(catId, catName, mode) {
                    activeCategory = catId;
                    activeMode = mode;
                    if(mode === 'submit') {
                        document.getElementById('active-category-title').innerText = catName;
                        document.getElementById('category-selection-view').classList.add('hidden');
                        document.getElementById('category-form-view').classList.remove('hidden');
                        loadUserSubs();
                    } else {
                        document.getElementById('active-report-category-title').innerText = catName + ' - Checker & Claim';
                        document.getElementById('report-category-selection-view').classList.add('hidden');
                        document.getElementById('report-checker-view').classList.remove('hidden');
                        document.getElementById('checker-input-uids').value = '';
                        document.getElementById('checker-output-box').innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 30px;">No UIDs scanned yet.</div>';
                    }
                }

                function backToCategories() {
                    activeCategory = null;
                    document.getElementById('category-form-view').classList.add('hidden');
                    document.getElementById('category-selection-view').classList.remove('hidden');
                    document.getElementById('report-checker-view').classList.add('hidden');
                    document.getElementById('report-category-selection-view').classList.remove('hidden');
                    refreshUserData();
                }

                function runUidChecker() {
                    const text = document.getElementById('checker-input-uids').value.trim();
                    if(!text) return alert('Please enter UIDs to check!');

                    const userUids = text.split('\\n').map(u => u.trim()).filter(u => u.length > 0);

                    fetch('/api/user/check-uids', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ category: activeCategory, uids: userUids, username: currentUser.username })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            const results = data.results; 
                            let outputBox = document.getElementById('checker-output-box');
                            outputBox.innerHTML = '';

                            const unclaimableLiveCount = results.filter(r => r.isLive && !r.isClaimed).length;
                            if(unclaimableLiveCount > 0) {
                                const totalLivePrize = unclaimableLiveCount * (results[0].prize || 0);
                                outputBox.innerHTML += \`<button class="claim-all-btn" onclick="claimAllUids()">🔥 ALL CLAIM LIVE UIDs (\${unclaimableLiveCount} IDs - ৳\${totalLivePrize})</button>\`;
                            }

                            results.forEach(r => {
                                let badgeHtml = '';
                                if(r.isClaimed) {
                                    badgeHtml = '<span class="badge-claimed">ALREADY CLAIMED</span>';
                                } else if(r.isLive) {
                                    badgeHtml = '<button class="claim-btn" onclick="claimUid(\\'' + r.uid + '\\')">CLAIM ৳' + r.prize + '</button>';
                                } else {
                                    badgeHtml = '<span class="badge-die">DIE</span>';
                                }

                                outputBox.innerHTML += \`
                                    <div class="uid-result-row">
                                        <span class="uid-text">\${r.uid}</span>
                                        \${badgeHtml}
                                    </div>
                                \`;
                            });
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function claimUid(uid) {
                    fetch('/api/user/claim-uid', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ category: activeCategory, uid, username: currentUser.username })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert(data.message);
                            runUidChecker();
                            refreshUserData();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function claimAllUids() {
                    fetch('/api/user/claim-all', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ category: activeCategory, username: currentUser.username })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert(data.message);
                            runUidChecker();
                            refreshUserData();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function submitId() {
                    const details = document.getElementById('id-details').value.trim();
                    if(!details) return alert('Please enter details!');

                    fetch('/api/submit', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ username: currentUser.username, category: activeCategory, details })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert('Submitted successfully!');
                            document.getElementById('id-details').value = '';
                            loadUserSubs();
                        }
                    });
                }

                function loadUserSubs() {
                    fetch('/api/user/' + currentUser.username + '/' + activeCategory)
                    .then(res => res.json())
                    .then(data => {
                        let tbody = document.getElementById('user-subs-table');
                        tbody.innerHTML = '';
                        if(data.submissions.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 25px;">No submissions found in this category.</td></tr>';
                            return;
                        }
                        data.submissions.forEach(s => {
                            let statusClass = s.status === 'success' ? 'status-success' : 'status-pending';
                            let statusText = s.status === 'success' ? 'SUCCESS' : 'PENDING';
                            let dateStr = new Date(s.date).toLocaleString();
                            tbody.innerHTML += '<tr><td>' + dateStr + '</td><td><div class="sheet-details">' + s.details + '</div></td><td style="text-align: center;"><span class="' + statusClass + '">' + statusText + '</span></td><td style="text-align: center;"><button class="delete-btn" onclick="deleteSub(\\'' + s.id + '\\')">Delete</button></td></tr>';
                        });
                    });
                }

                function deleteSub(id) {
                    if(!confirm('Are you sure you want to delete this?')) return;
                    fetch('/api/delete/' + id, { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadUserSubs();
                        }
                    });
                }

                function sendWithdrawRequest() {
                    const method = document.getElementById('withdraw-method').value;
                    const phone = document.getElementById('withdraw-phone').value.trim();
                    const amount = parseFloat(document.getElementById('withdraw-amount').value);

                    if(!phone || !amount || amount <= 0) return alert('Please fill valid phone and amount!');
                    if(amount > currentUser.balance) return alert('Insufficient balance!');

                    fetch('/api/withdraw', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ username: currentUser.username, method, phone, amount })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert('Withdrawal request sent successfully!');
                            document.getElementById('withdraw-phone').value = '';
                            document.getElementById('withdraw-amount').value = '';
                            refreshUserData();
                            loadUserWithdraws();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function loadUserWithdraws() {
                    fetch('/api/user/withdrawals/' + currentUser.username)
                    .then(res => res.json())
                    .then(data => {
                        let tbody = document.getElementById('user-withdraw-table');
                        tbody.innerHTML = '';
                        if(data.withdrawals.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 25px;">No withdrawal requests found.</td></tr>';
                            return;
                        }
                        data.withdrawals.forEach(w => {
                            let statusClass = w.status === 'success' ? 'status-success' : 'status-pending';
                            let statusText = w.status === 'success' ? 'SUCCESS' : 'PENDING';
                            let dateStr = new Date(w.date).toLocaleString();
                            tbody.innerHTML += '<tr><td>' + dateStr + '</td><td>' + w.method + '</td><td>' + w.phone + '</td><td style="color: var(--primary-neon); font-weight: bold;">৳' + w.amount + '</td><td style="text-align: center;"><span class="' + statusClass + '">' + statusText + '</span></td></tr>';
                        });
                    });
                }

                function logout() {
                    currentUser = null;
                    localStorage.removeItem('portal_current_user');
                    document.getElementById('dashboard-card').classList.add('hidden');
                    document.getElementById('login-card').classList.remove('hidden');
                }
            </script>
        </body>
        </html>
    `);
});

// ==================== ২. অ্যাডমিন প্যানেল ====================
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VoltX SMS - Admin Dashboard</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-dark: #121212;
                    --sidebar-bg: #181818;
                    --card-bg: #1e1e1e;
                    --primary-neon: #00E676;
                    --text-main: #ffffff;
                    --text-muted: #a0a0a0;
                    --border-color: #2a2a2a;
                }
                * { box-sizing: border-box; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-dark); color: var(--text-main); margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background-color: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 440px; padding: 35px; border-radius: 16px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
                h2 { text-align: center; color: var(--text-main); margin-bottom: 25px; font-weight: 700; font-size: 22px; }
                input, textarea { width: 100%; padding: 14px 18px; margin-bottom: 20px; border: 2px solid var(--border-color); border-radius: 10px; font-size: 15px; background: rgba(18, 18, 18, 0.8); color: #fff; outline: none; transition: 0.3s; font-family: inherit; }
                input:focus, textarea:focus { border-color: var(--primary-neon); background: rgba(18, 18, 18, 1); box-shadow: 0 0 0 4px rgba(0, 230, 118, 0.15); }
                .btn { background-color: var(--primary-neon); color: #000; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 15px; font-weight: 700; width: 100%; transition: all 0.3s ease; font-family: inherit; }
                .btn:hover { opacity: 0.9; transform: translateY(-2px); }
                .hidden { display: none !important; }

                .admin-container { max-width: 1350px !important; padding: 35px !important; border-radius: 16px; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                
                .category-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; }
                .tab-btn { background: #181818; color: var(--text-muted); border: 1px solid var(--border-color); padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.3s; font-family: inherit; }
                .tab-btn.active { background: rgba(0, 230, 118, 0.15); color: var(--primary-neon); border-color: var(--primary-neon); }

                .admin-sub-nav { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
                .sub-nav-btn { background: #181818; border: 1px solid var(--border-color); color: var(--text-muted); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
                .sub-nav-btn.active { background: rgba(0, 230, 118, 0.15); color: var(--primary-neon); border-color: var(--primary-neon); }

                .header-btns { display: flex; gap: 10px; flex-wrap: wrap; }
                .action-global-btn { background: #2a2a2a; color: #fff; border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.3s; display: flex; align-items: center; gap: 6px; font-family: inherit; }
                .action-global-btn:hover { border-color: var(--primary-neon); color: var(--primary-neon); }
                
                .clear-btn { background: #ef4444 !important; border-color: #ef4444 !important; color: #fff !important; }
                .clear-btn:hover { opacity: 0.9 !important; color: #fff !important; }

                .sheet-scroll-box { max-height: 520px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 10px; background: rgba(18, 18, 18, 0.4); }
                table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 950px; background: transparent; }
                th, td { border-bottom: 1px solid var(--border-color); padding: 14px 18px; text-align: left; white-space: nowrap; }
                th { background: #181818; color: var(--text-muted); font-weight: 600; text-align: center; position: sticky; top: 0; z-index: 10; }
                td { background: transparent; color: var(--text-main); }
                
                .sheet-details { max-width: 300px; overflow-x: auto; white-space: nowrap; font-family: monospace; background: rgba(0,0,0,0.4); padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-color); color: var(--primary-neon); }
                
                .action-cell-flex { display: flex; align-items: center; gap: 8px; justify-content: center; }
                .balance-input { width: 85px !important; padding: 6px 8px !important; margin-bottom: 0 !important; font-size: 13px !important; text-align: center; }
                .received-btn { background-color: var(--primary-neon); color: #000; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s; }
                .received-btn:hover { opacity: 0.9; }
                .received-text { color: var(--primary-neon); font-weight: bold; text-align: center; display: inline-block; background: rgba(0,230,118,0.15); padding: 6px 10px; border-radius: 6px; font-size: 12px; border: 1px solid rgba(0,230,118,0.3); }

                .row-download-btn { background: #2a2a2a; color: #fff; border: 1px solid var(--border-color); padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 6px; }

                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .card { padding: 20px; }
                    .admin-container { padding: 15px !important; }
                }
            </style>
        </head>
        <body>

            <!-- Admin Login -->
            <div class="card" id="admin-login-card">
                <h2>Admin Login</h2>
                <input type="password" id="admin-pass" placeholder="Enter Password (@MYPANEL)">
                <button class="btn" onclick="adminLogin()">LOGIN TO DASHBOARD</button>
            </div>

            <!-- Admin Dashboard -->
            <div class="card admin-container hidden" id="admin-dashboard-card">
                <div class="header-flex">
                    <h2 style="margin: 0; color: #fff; font-size: 20px;">📊 VoltX Admin Panel - Control Center</h2>
                    <div class="header-btns" id="admin-top-btns">
                        <button class="action-global-btn" onclick="downloadCategoryCSV()">📥 Download Tab (CSV)</button>
                        <button class="action-global-btn clear-btn" onclick="clearCategorySubmissions()">🗑️ Clear Tab & Archive</button>
                    </div>
                </div>

                <div class="category-tabs" id="admin-tabs-container">
                    ${CATEGORIES.map((cat, index) => `
                        <button class="tab-btn ${index === 0 ? 'active' : ''}" onclick="switchAdminTab('${cat.id}', this)">${cat.name}</button>
                    `).join('')}
                    <button class="tab-btn" onclick="switchAdminTab('withdrawals', this)">💸 Payment Requests</button>
                    <button class="tab-btn" onclick="switchAdminTab('archives', this)" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; border-color: rgba(139, 92, 246, 0.3);">📦 Archived UIDs / IDs</button>
                </div>

                <!-- Admin Sub View Toggle -->
                <div class="admin-sub-nav" id="admin-sub-nav-container">
                    <button class="sub-nav-btn active" id="sub-view-subs" onclick="switchAdminSubView('submissions')">📥 User Submissions</button>
                    <button class="sub-nav-btn" id="sub-view-report" onclick="switchAdminSubView('report')">⚙️ Manage Report UIDs & Prize</button>
                </div>

                <!-- Submissions View Box -->
                <div id="admin-submissions-view">
                    <div class="sheet-scroll-box">
                        <table>
                            <thead>
                                <tr id="table-header-row">
                                    <th>SL</th>
                                    <th>Date & Time</th>
                                    <th>Telegram Username</th>
                                    <th>Details / Cookies</th>
                                    <th>Action & Add Balance</th>
                                </tr>
                            </thead>
                            <tbody id="admin-subs-table"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Report UIDs & Prize Management Box -->
                <div id="admin-report-view" class="hidden">
                    <div style="background: var(--sidebar-bg); padding: 25px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <h3 style="margin-top: 0; color: var(--primary-neon); font-size: 18px;" id="admin-report-title">Manage Report Box UIDs & Auto Prize</h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">Set the prize amount and add/append new live UIDs. Saved UIDs will stay in history below.</p>
                        
                        <label>Category Prize Amount (BDT)</label>
                        <input type="number" id="admin-category-prize" placeholder="e.g. 50">

                        <label>Add New UIDs (One UID per line)</label>
                        <textarea id="admin-report-textarea" rows="4" placeholder="Paste new UIDs here..."></textarea>
                        
                        <button class="btn" onclick="saveAdminReportAndPrize()" style="max-width: 220px; margin-bottom: 25px;">Save & Append UIDs</button>

                        <h4 style="color: #fff; margin-bottom: 10px;">Saved UID History (<span id="saved-uids-count">0</span>)</h4>
                        <div class="sheet-scroll-box" style="max-height: 250px;">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 60px; text-align: center;">SL</th>
                                        <th>UID</th>
                                        <th style="text-align: center; width: 100px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-saved-uids-table"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Archive Box View -->
                <div id="admin-archive-view" class="hidden">
                    <h3 style="color: #a78bfa; margin-bottom: 15px;">Archived / Cleared ID History Box</h3>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">Cleared or archived entries from previous dates are safely stored here in file format.</p>
                    <div class="sheet-scroll-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>SL</th>
                                    <th>Archived Date</th>
                                    <th>Category</th>
                                    <th>Username</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody id="admin-archive-table"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <script>
                let allSubmissions = [];
                let allWithdrawals = [];
                let adminReports = {};
                let categoryPrizes = {};
                let archivedSubmissions = [];
                let activeAdminCategory = '${CATEGORIES[0].id}';
                let activeAdminSubView = 'submissions';

                function adminLogin() {
                    const pass = document.getElementById('admin-pass').value;
                    
                    fetch('/api/admin/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ password: pass })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            document.getElementById('admin-login-card').classList.add('hidden');
                            document.getElementById('admin-dashboard-card').classList.remove('hidden');
                            loadAdminData();
                        } else {
                            alert('Wrong Password! Use @MYPANEL');
                        }
                    });
                }

                function switchAdminTab(catId, btnElement) {
                    activeAdminCategory = catId;
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btnElement.classList.add('active');

                    if(catId === 'withdrawals' || catId === 'archives') {
                        document.getElementById('admin-sub-nav-container').classList.add('hidden');
                        document.getElementById('admin-top-btns').classList.add('hidden');
                        if(catId === 'archives') {
                            document.getElementById('admin-submissions-view').classList.add('hidden');
                            document.getElementById('admin-report-view').classList.add('hidden');
                            document.getElementById('admin-archive-view').classList.remove('hidden');
                            renderArchiveTable();
                            return;
                        } else {
                            document.getElementById('admin-archive-view').classList.add('hidden');
                        }
                        switchAdminSubView('submissions');
                    } else {
                        document.getElementById('admin-archive-view').classList.add('hidden');
                        document.getElementById('admin-sub-nav-container').classList.remove('hidden');
                        document.getElementById('admin-top-btns').classList.remove('hidden');
                        switchAdminSubView('submissions');
                    }
                    renderAdminTable();
                }

                function switchAdminSubView(view) {
                    activeAdminSubView = view;
                    document.getElementById('sub-view-subs').classList.remove('active');
                    document.getElementById('sub-view-report').classList.remove('active');
                    document.getElementById('admin-archive-view').classList.add('hidden');

                    if(view === 'submissions') {
                        document.getElementById('sub-view-subs').classList.add('active');
                        document.getElementById('admin-submissions-view').classList.remove('hidden');
                        document.getElementById('admin-report-view').classList.add('hidden');
                        document.getElementById('admin-top-btns').classList.remove('hidden');
                    } else {
                        document.getElementById('sub-view-report').classList.add('active');
                        document.getElementById('admin-submissions-view').classList.add('hidden');
                        document.getElementById('admin-report-view').classList.remove('hidden');
                        document.getElementById('admin-top-btns').classList.add('hidden');
                        
                        document.getElementById('admin-report-textarea').value = '';
                        document.getElementById('admin-category-prize').value = categoryPrizes[activeAdminCategory] || '';
                        renderSavedUidsHistory();
                    }
                }

                function loadAdminData() {
                    fetch('/api/admin/data')
                    .then(res => res.json())
                    .then(data => {
                        allSubmissions = data.submissions;
                        allWithdrawals = data.withdrawals;
                        adminReports = data.adminReports || {};
                        categoryPrizes = data.categoryPrizes || {};
                        archivedSubmissions = data.archivedSubmissions || [];
                        renderAdminTable();
                        if(activeAdminSubView === 'report') {
                            renderSavedUidsHistory();
                        }
                        if(activeAdminCategory === 'archives') {
                            renderArchiveTable();
                        }
                    });
                }

                function renderAdminTable() {
                    let theadRow = document.getElementById('table-header-row');
                    let tbody = document.getElementById('admin-subs-table');
                    tbody.innerHTML = '';

                    if(activeAdminCategory === 'withdrawals') {
                        theadRow.innerHTML = '<th>SL</th><th>Date & Time</th><th>Username</th><th>Method & Phone</th><th>Amount</th><th>Status / Action</th>';
                        
                        if(allWithdrawals.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 25px;">No payment requests found.</td></tr>';
                            return;
                        }

                        allWithdrawals.forEach((w, index) => {
                            let actionCol = w.status === 'success' 
                                ? '<span class="received-text">SUCCESS</span>' 
                                : '<button class="received-btn" onclick="approveWithdraw(\\'' + w.id + '\\')">Approve / Pay</button>';
                            
                            let dateStr = new Date(w.date).toLocaleString();
                            tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: var(--primary-neon);">@' + w.username + '</strong></td><td>' + w.method + ' - <strong>' + w.phone + '</strong></td><td style="color: var(--primary-neon); font-weight: bold;">৳' + w.amount + '</td><td style="text-align: center;">' + actionCol + '</td></tr>';
                        });

                    } else if(activeAdminCategory === 'archives') {
                        return;
                    } else {
                        theadRow.innerHTML = '<th>SL</th><th>Date & Time</th><th>Telegram Username</th><th>Details / Cookies</th><th>Action & Add Balance</th>';
                        
                        let filtered = allSubmissions.filter(s => s.category === activeAdminCategory);

                        if(filtered.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 25px;">No submissions found in this category.</td></tr>';
                            return;
                        }

                        filtered.forEach((s, index) => {
                            let actionColumn = '';
                            if(s.status === 'success') {
                                actionColumn = '<span class="received-text">RECEIVED</span>';
                            } else {
                                actionColumn = '<div class="action-cell-flex"><input type="number" id="bal-' + s.id + '" class="balance-input" placeholder="Amount"><button class="received-btn" onclick="markReceivedAndAddBal(\\'' + s.id + '\\', \\'' + s.username + '\\')">Received & Pay</button></div>';
                            }
                            
                            let rowDownloadBtn = '<button class="row-download-btn" onclick="downloadSingleRow(\\'' + s.username + '\\', \\'' + s.id + '\\')">📥</button>';
                            let dateStr = new Date(s.date).toLocaleString();
                            
                            tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: var(--primary-neon);">@' + s.username + '</strong></td><td><div style="display: flex; align-items: center; justify-content: space-between;"><div class="sheet-details">' + s.details + '</div>' + rowDownloadBtn + '</div></td><td style="text-align: center;">' + actionColumn + '</td></tr>';
                        });
                    }
                }

                function renderArchiveTable() {
                    let tbody = document.getElementById('admin-archive-table');
                    tbody.innerHTML = '';
                    if(archivedSubmissions.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 25px;">No archived records found.</td></tr>';
                        return;
                    }
                    archivedSubmissions.forEach((arc, index) => {
                        let dateStr = new Date(arc.date).toLocaleString();
                        tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td>' + arc.category + '</td><td><strong style="color: var(--primary-neon);">@' + arc.username + '</strong></td><td><div class="sheet-details">' + arc.details + '</div></td></tr>';
                    });
                }

                function renderSavedUidsHistory() {
                    let uidsList = adminReports[activeAdminCategory] || [];
                    document.getElementById('saved-uids-count').innerText = uidsList.length;
                    let tbody = document.getElementById('admin-saved-uids-table');
                    tbody.innerHTML = '';

                    if(uidsList.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">No saved UIDs in history.</td></tr>';
                        return;
                    }

                    uidsList.forEach((uid, index) => {
                        tbody.innerHTML += \`
                            <tr>
                                <td style="text-align: center; font-weight: 600;">\${index + 1}</td>
                                <td style="font-family: monospace; color: var(--primary-neon);">\${uid}</td>
                                <td style="text-align: center;"><button class="delete-btn" onclick="deleteSavedUid('\${uid}')">Delete</button></td>
                            </tr>
                        \`;
                    });
                }

                function saveAdminReportAndPrize() {
                    const text = document.getElementById('admin-report-textarea').value.trim();
                    const prize = parseFloat(document.getElementById('admin-category-prize').value) || 0;
                    const newUids = text ? text.split('\\n').map(u => u.trim()).filter(u => u.length > 0) : [];

                    fetch('/api/admin/save-report', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ category: activeAdminCategory, newUids, prize })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            adminReports = data.adminReports;
                            categoryPrizes = data.categoryPrizes;
                            document.getElementById('admin-report-textarea').value = '';
                            renderSavedUidsHistory();
                            alert('Settings saved and UIDs appended successfully!');
                        } else {
                            alert('Failed to save!');
                        }
                    });
                }

                function deleteSavedUid(uid) {
                    if(!confirm('Are you sure you want to delete this UID from history?')) return;

                    fetch('/api/admin/delete-uid', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ category: activeAdminCategory, uid })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            adminReports = data.adminReports;
                            renderSavedUidsHistory();
                        }
                    });
                }

                function markReceivedAndAddBal(id, username) {
                    const amountInput = document.getElementById('bal-' + id);
                    const amount = parseFloat(amountInput.value) || 0;

                    fetch('/api/admin/update-submission', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ id, username, amount })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadAdminData();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function approveWithdraw(id) {
                    if(!confirm('Mark this payment request as success?')) return;
                    fetch('/api/admin/approve-withdraw/' + id, {method: 'POST'})
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadAdminData();
                        }
                    });
                }

                function downloadSingleRow(username, id) {
                    let sub = allSubmissions.find(s => s.id === id);
                    if(!sub) return alert('Data not found!');

                    let csvContent = "data:text/csv;charset=utf-8,Date,Telegram Username,Category,Details,Status\\r\\n";
                    let row = [
                        '"' + new Date(sub.date).toLocaleString() + '"',
                        '"@' + sub.username + '"',
                        '"' + sub.category + '"',
                        '"' + sub.details.replace(/"/g, '""') + '"',
                        '"' + sub.status.toUpperCase() + '"'
                    ];
                    csvContent += row.join(",") + "\\r\\n";

                    let encodedUri = encodeURI(csvContent);
                    let link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", username + "_" + sub.category + ".csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                function downloadCategoryCSV() {
                    if(activeAdminCategory === 'withdrawals' || activeAdminCategory === 'archives') return alert('Cannot download CSV for this section.');
                    let filtered = allSubmissions.filter(s => s.category === activeAdminCategory);
                    if(filtered.length === 0) return alert('No data available to download in this category!');
                    
                    let csvContent = "data:text/csv;charset=utf-8,SL,Date,Telegram Username,Details,Status\\r\\n";
                    filtered.forEach((s, index) => {
                        let row = [
                            index + 1,
                            '"' + new Date(s.date).toLocaleString() + '"',
                            '"@' + s.username + '"',
                            '"' + s.details.replace(/"/g, '""') + '"',
                            '"' + s.status.toUpperCase() + '"'
                        ];
                        csvContent += row.join(",") + "\\r\\n";
                    });

                    let encodedUri = encodeURI(csvContent);
                    let link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", activeAdminCategory + "_submissions.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                function clearCategorySubmissions() {
                    if(activeAdminCategory === 'withdrawals' || activeAdminCategory === 'archives') return alert('Cannot clear from here.');
                    if(!confirm('Are you sure you want to clear and archive all submissions in this category?')) return;
                    
                    fetch('/api/admin/clear/' + activeAdminCategory, {method: 'POST'})
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadAdminData();
                            alert('Cleared successfully and moved to Archive History box!');
                        }
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// ==================== API ENDPOINTS ====================
app.post('/api/register', (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    const data = loadData();
    
    let existingUser = data.users.find(u => u.email === email || u.username === username);
    if(existingUser) {
        return res.json({ success: false, message: 'Email or Username already exists!' });
    }

    data.users.push({ firstName, lastName, username: username.replace(/^@/, ''), email, password, balance: 0 });
    saveData(data);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const data = loadData();
    
    let user = data.users.find(u => u.email === email && u.password === password);
    if(!user) {
        return res.json({ success: false, message: 'Invalid email or password!' });
    }

    res.json({ success: true, user });
});

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if(password === '@MYPANEL') {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/user/refresh/:username', (req, res) => {
    const { username } = req.params;
    const data = loadData();
    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if(!user) return res.json({ success: false });
    res.json({ success: true, user });
});

app.post('/api/submit', (req, res) => {
    const { username, category, details } = req.body;
    const data = loadData();
    
    const submission = {
        id: Date.now().toString(),
        username,
        category: category || 'instagram_2fa',
        details,
        status: 'pending',
        date: new Date().toISOString()
    };

    data.submissions.push(submission);
    saveData(data);
    res.json({ success: true });
});

app.get('/api/user/:username/:category', (req, res) => {
    const { username, category } = req.params;
    const data = loadData();
    const userSubs = data.submissions.filter(s => s.username.toLowerCase() === username.toLowerCase() && s.category === category);
    res.json({ success: true, submissions: userSubs });
});

app.post('/api/delete/:id', (req, res) => {
    const { id } = req.params;
    const data = loadData();
    let sub = data.submissions.find(s => s.id === id);
    if(sub) {
        if(!data.archivedSubmissions) data.archivedSubmissions = [];
        data.archivedSubmissions.push(sub);
    }
    data.submissions = data.submissions.filter(s => s.id !== id);
    saveData(data);
    res.json({ success: true });
});

app.post('/api/user/check-uids', (req, res) => {
    const { category, uids } = req.body;
    const data = loadData();
    const adminUids = (data.adminReports && data.adminReports[category]) || [];
    const claimedList = (data.claimedUids && data.claimedUids[category]) || [];
    const prize = (data.categoryPrizes && data.categoryPrizes[category]) || 0;

    const results = uids.map(uid => {
        const isLive = adminUids.includes(uid);
        const isClaimed = claimedList.includes(uid);
        return { uid, isLive, isClaimed, prize };
    });

    res.json({ success: true, results });
});

app.post('/api/user/claim-uid', (req, res) => {
    const { category, uid, username } = req.body;
    const data = loadData();

    const adminUids = (data.adminReports && data.adminReports[category]) || [];
    if (!adminUids.includes(uid)) {
        return res.json({ success: false, message: 'Invalid or non-live UID!' });
    }

    if (!data.claimedUids) data.claimedUids = {};
    if (!data.claimedUids[category]) data.claimedUids[category] = [];

    if (data.claimedUids[category].includes(uid)) {
        return res.json({ success: false, message: 'This ID has already been claimed!' });
    }

    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
        return res.json({ success: false, message: 'User not found!' });
    }

    const prize = parseFloat(data.categoryPrizes[category]) || 0;
    user.balance = (user.balance || 0) + prize;

    data.claimedUids[category].push(uid);
    saveData(data);

    res.json({ success: true, message: `Successfully claimed ৳${prize} added to your balance!` });
});

app.post('/api/user/claim-all', (req, res) => {
    const { category, username } = req.body;
    const data = loadData();

    const adminUids = (data.adminReports && data.adminReports[category]) || [];
    if (!data.claimedUids) data.claimedUids = {};
    if (!data.claimedUids[category]) data.claimedUids[category] = [];

    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
        return res.json({ success: false, message: 'User not found!' });
    }

    const prize = parseFloat(data.categoryPrizes[category]) || 0;
    let unclaimedLiveUids = adminUids.filter(uid => !data.claimedUids[category].includes(uid));

    if (unclaimedLiveUids.length === 0) {
        return res.json({ success: false, message: 'No unclaimed live UIDs available!' });
    }

    let totalReward = unclaimedLiveUids.length * prize;
    user.balance = (user.balance || 0) + totalReward;

    data.claimedUids[category].push(...unclaimedLiveUids);
    saveData(data);

    res.json({ success: true, message: `Successfully claimed ${unclaimedLiveUids.length} UIDs! Total ৳${totalReward} added to your balance.` });
});

app.post('/api/withdraw', (req, res) => {
    const { username, method, phone, amount } = req.body;
    const data = loadData();
    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if(!user || user.balance < amount) {
        return res.json({ success: false, message: 'Insufficient balance!' });
    }

    user.balance -= amount;

    const withdrawal = {
        id: Date.now().toString(),
        username,
        method,
        phone,
        amount,
        status: 'pending',
        date: new Date().toISOString()
    };

    data.withdrawals.push(withdrawal);
    saveData(data);
    res.json({ success: true });
});

app.get('/api/user/withdrawals/:username', (req, res) => {
    const { username } = req.params;
    const data = loadData();
    const userWithdraws = data.withdrawals.filter(w => w.username.toLowerCase() === username.toLowerCase());
    res.json({ success: true, withdrawals: userWithdraws });
});

app.get('/api/admin/data', (req, res) => {
    const data = loadData();
    res.json({ 
        success: true, 
        submissions: data.submissions, 
        withdrawals: data.withdrawals,
        adminReports: data.adminReports || {},
        categoryPrizes: data.categoryPrizes || {},
        archivedSubmissions: data.archivedSubmissions || []
    });
});

app.post('/api/admin/save-report', (req, res) => {
    const { category, newUids, prize } = req.body;
    const data = loadData();
    if(!data.adminReports) data.adminReports = {};
    if(!data.categoryPrizes) data.categoryPrizes = {};
    
    let existingUids = data.adminReports[category] || [];
    let combinedUids = Array.from(new Set([...existingUids, ...newUids]));

    data.adminReports[category] = combinedUids;
    data.categoryPrizes[category] = prize;
    saveData(data);
    res.json({ success: true, adminReports: data.adminReports, categoryPrizes: data.categoryPrizes });
});

app.post('/api/admin/delete-uid', (req, res) => {
    const { category, uid } = req.body;
    const data = loadData();
    if(data.adminReports && data.adminReports[category]) {
        data.adminReports[category] = data.adminReports[category].filter(u => u !== uid);
        saveData(data);
    }
    res.json({ success: true, adminReports: data.adminReports });
});

app.post('/api/admin/update-submission', (req, res) => {
    const { id, username, amount } = req.body;
    const data = loadData();
    
    let sub = data.submissions.find(s => s.id === id);
    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if(sub) {
        sub.status = 'success';
    }
    if(user && amount > 0) {
        user.balance = (user.balance || 0) + parseFloat(amount);
    }

    saveData(data);
    res.json({ success: true });
});

app.post('/api/admin/approve-withdraw/:id', (req, res) => {
    const { id } = req.params;
    const data = loadData();
    let w = data.withdrawals.find(item => item.id === id);
    if(w) {
        w.status = 'success';
        saveData(data);
    }
    res.json({ success: true });
});

app.post('/api/admin/clear/:category', (req, res) => {
    const { category } = req.params;
    const data = loadData();
    let subsToClear = data.submissions.filter(s => s.category === category);
    
    if(!data.archivedSubmissions) data.archivedSubmissions = [];
    data.archivedSubmissions.push(...subsToClear);

    data.submissions = data.submissions.filter(s => s.category !== category);
    saveData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
