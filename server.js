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
        return { 
            users: [], 
            submissions: [], 
            withdrawals: [], 
            adminReports: {}, 
            categoryPrizes: {}, 
            claimedUids: {}, 
            archivedSubmissions: [],
            categories: [
                { id: 'instagram_2fa', name: 'Instagram 2FA ID', icon: '📸', gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
                { id: 'fb_page_cookies', name: 'Facebook Page Cookies', icon: '📄', gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)' },
                { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🍪', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
                { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '✉️', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)' }
            ]
        };
    }
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!data.withdrawals) data.withdrawals = [];
    if (!data.adminReports) data.adminReports = {};
    if (!data.categoryPrizes) data.categoryPrizes = {};
    if (!data.claimedUids) data.claimedUids = {};
    if (!data.archivedSubmissions) data.archivedSubmissions = [];
    if (!data.categories) {
        data.categories = [
            { id: 'instagram_2fa', name: 'Instagram 2FA ID', icon: '📸', gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
            { id: 'fb_page_cookies', name: 'Facebook Page Cookies', icon: '📄', gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)' },
            { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🍪', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
            { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '✉️', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)' }
        ];
    }
    return data;
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==================== ১. ইউজার প্যানেল ====================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Premium User Panel - Sidebar Portal</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0f172a; background-image: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%); margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #f8fafc; }
                
                .card { background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; max-width: 540px; padding: 35px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .icon-box { width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; color: white; font-size: 28px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                
                h2 { text-align: center; color: #f8fafc; margin-bottom: 8px; font-weight: 700; font-size: 24px; }
                p.subtitle { text-align: center; color: #94a3b8; font-size: 14px; margin-bottom: 25px; }
                label { display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
                
                input, textarea, select { width: 100%; padding: 14px 18px; margin-bottom: 20px; border: 2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 15px; background: rgba(15, 23, 42, 0.6); color: #fff; outline: none; transition: all 0.3s ease; font-family: inherit; }
                input:focus, textarea:focus, select:focus { border-color: #6366f1; background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
                select option { background: #0f172a; color: #fff; }
                
                .btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 700; width: 100%; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); font-family: inherit; }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.6); }
                
                .switch-text { text-align: center; margin-top: 20px; font-size: 13px; color: #818cf8; font-weight: 600; cursor: pointer; letter-spacing: 0.5px; }
                .switch-text:hover { text-decoration: underline; }
                .hidden { display: none !important; }
                
                .dashboard-container { max-width: 950px !important; padding: 35px !important; }
                
                /* Sidebar & Header Navbar */
                .navbar-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 25px; gap: 15px; }
                .menu-toggle-btn { background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); width: 50px; height: 50px; border-radius: 14px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
                .menu-toggle-btn:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.15); }
                .menu-toggle-btn span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; }

                /* Sidebar Overlay & Content */
                .sidebar-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); z-index: 998; opacity: 0; visibility: hidden; transition: 0.3s ease; }
                .sidebar-overlay.active { opacity: 1; visibility: visible; }

                .sidebar { position: fixed; top: 0; left: -300px; width: 280px; height: 100%; background: #1e293b; border-right: 1px solid rgba(255,255,255,0.1); z-index: 999; transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1); padding: 30px 20px; display: flex; flex-direction: column; box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
                .sidebar.active { left: 0; }
                .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; }
                .sidebar-close { background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; }
                .sidebar-close:hover { color: #fff; }

                .sidebar-menu-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; color: #cbd5e1; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
                .sidebar-menu-item:hover, .sidebar-menu-item.active { background: #6366f1; color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(99,102,241,0.4); }
                .sidebar-menu-item.logout { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.3); margin-top: auto; }
                .sidebar-menu-item.logout:hover { background: #ef4444; color: white; }

                .balance-badge { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2)); border: 1px solid rgba(16, 185, 129, 0.4); padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 20px rgba(16,185,129,0.15); }
                .balance-amount { font-size: 18px; font-weight: 800; color: #4ade80; }

                .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 20px; margin-top: 25px; }
                .cat-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 25px 20px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative; overflow: hidden; }
                .cat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--accent-gradient); }
                .cat-card:hover { transform: translateY(-6px); border-color: rgba(99, 102, 241, 0.5); background: rgba(30, 41, 59, 0.8); box-shadow: 0 20px 40px rgba(99,102,241,0.2); }
                .cat-icon { font-size: 40px; margin-bottom: 15px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
                .cat-title { font-weight: 700; color: #f1f5f9; font-size: 15px; }

                .back-btn { background: rgba(255, 255, 255, 0.1); width: auto; padding: 10px 20px; margin-bottom: 20px; font-size: 13px; box-shadow: none; border: 1px solid rgba(255, 255, 255, 0.1); }
                .back-btn:hover { background: rgba(255, 255, 255, 0.2); transform: none; }

                .sheet-scroll-box { max-height: 400px; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; margin-top: 20px; background: rgba(15, 23, 42, 0.5); }
                table { width: 100%; border-collapse: collapse; min-width: 700px; font-size: 14px; }
                th, td { border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding: 14px 18px; text-align: left; white-space: nowrap; }
                th { background: rgba(15, 23, 42, 0.8); color: #cbd5e1; position: sticky; top: 0; z-index: 10; font-weight: 700; }
                td { color: #e2e8f0; }
                
                .sheet-details { max-width: 320px; overflow-x: auto; white-space: nowrap; font-family: monospace; background: rgba(0, 0, 0, 0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); color: #38bdf8; }
                
                .status-pending { color: #fbbf24; font-weight: 700; background: rgba(251, 191, 36, 0.15); padding: 6px 12px; border-radius: 30px; display: inline-block; font-size: 12px; border: 1px solid rgba(251, 191, 36, 0.3); }
                .status-success { color: #4ade80; font-weight: 700; background: rgba(74, 222, 128, 0.15); padding: 6px 12px; border-radius: 30px; display: inline-block; font-size: 12px; border: 1px solid rgba(74, 222, 128, 0.3); }
                
                .delete-btn { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
                .delete-btn:hover { transform: scale(1.05); }

                .checker-box { background: #0b0f19; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 25px; margin-top: 20px; }
                .checker-title { text-align: center; font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; letter-spacing: 0.5px; }
                
                .uid-result-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); }
                .uid-text { font-family: monospace; font-weight: 600; font-size: 14px; }
                .badge-live { color: #4ade80; background: rgba(74,222,128,0.15); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                .badge-die { color: #f87171; background: rgba(248,113,113,0.15); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                .badge-claimed { color: #cbd5e1; background: rgba(148,163,184,0.15); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                
                .claim-btn { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; transition: 0.2s; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
                .claim-btn:hover { transform: scale(1.05); }

                .claim-all-btn { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 700; width: 100%; margin-bottom: 15px; box-shadow: 0 8px 20px rgba(245,158,11,0.3); transition: 0.2s; }
                .claim-all-btn:hover { transform: translateY(-2px); }

                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .card { padding: 20px; border-radius: 20px; }
                    .dashboard-container { padding: 20px !important; }
                    .category-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>

            <!-- Login View -->
            <div class="card" id="login-card">
                <div class="icon-box">🔐</div>
                <h2>Welcome Back</h2>
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
                <p class="subtitle">Join our exclusive platform</p>
                
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

            <!-- Sidebar Overlay -->
            <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>

            <!-- Sidebar -->
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div>
                        <h4 style="margin: 0; color: #f8fafc; font-size: 16px;" id="sidebar-user-name">User Portal</h4>
                        <span style="font-size: 12px; color: #38bdf8;" id="sidebar-user-tg">@username</span>
                    </div>
                    <button class="sidebar-close" onclick="toggleSidebar()">✕</button>
                </div>

                <div class="sidebar-menu-item active" id="sb-home" onclick="switchSidebarTab('home')">
                    🏠 Home / Submit IDs
                </div>
                <div class="sidebar-menu-item" id="sb-report" onclick="switchSidebarTab('report')">
                    🔍 Report File (UID Checker)
                </div>
                <div class="sidebar-menu-item" id="sb-withdraw" onclick="switchSidebarTab('withdraw')">
                    💸 Payment / Withdraw
                </div>
                
                <div class="sidebar-menu-item logout" onclick="logout()">
                    🚪 Logout
                </div>
            </div>

            <!-- User Dashboard -->
            <div class="card dashboard-container hidden" id="dashboard-card">
                <div class="navbar-top">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="menu-toggle-btn" onclick="toggleSidebar()">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div>
                            <h2 style="text-align: left; margin: 0; font-size: 20px;">Welcome, <span id="user-display-name" style="color: #818cf8;"></span></h2>
                        </div>
                    </div>
                    <div class="balance-badge">
                        <span>💰</span>
                        <span class="balance-amount" id="user-balance-display">৳0.00</span>
                    </div>
                </div>

                <!-- 1. Home / Submit IDs Section -->
                <div id="user-section-home">
                    <div id="category-selection-view">
                        <h3 style="margin: 0 0 5px 0; color: #f8fafc; font-size: 18px;">Home - ID Submit Categories</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Choose a category below to submit your IDs.</p>
                        
                        <div class="category-grid" id="user-submit-category-grid"></div>
                    </div>

                    <div id="category-form-view" class="hidden">
                        <button class="btn back-btn" onclick="backToCategories()">⬅️ Back to Categories</button>
                        <h3 id="active-category-title" style="color: #818cf8; margin-bottom: 15px; font-size: 20px;"></h3>
                        
                        <div style="background: rgba(15, 23, 42, 0.4); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
                            <label>Submit Details / Cookies</label>
                            <textarea id="id-details" rows="3" placeholder="Paste details or cookies here..."></textarea>
                            <button class="btn" onclick="submitId()" style="width: 180px;">Submit Now</button>
                        </div>

                        <h4 style="margin: 30px 0 15px 0; color: #f8fafc; font-size: 16px;">Your Submissions History</h4>
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

                <!-- 2. Report File & UID Checker Section -->
                <div id="user-section-report" class="hidden">
                    <div id="report-category-selection-view">
                        <h3 style="margin: 0 0 5px 0; color: #f8fafc; font-size: 18px;">Report Files - Select Category</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Select admin uploaded report category to check live UIDs and claim rewards.</p>
                        
                        <div class="category-grid" id="user-report-category-grid"></div>
                    </div>

                    <div id="report-checker-view" class="hidden">
                        <button class="btn back-btn" onclick="backToCategories()">⬅️ Back to Categories</button>
                        <h3 id="active-report-category-title" style="color: #38bdf8; margin-bottom: 15px; font-size: 20px;"></h3>

                        <div class="checker-box">
                            <div class="checker-title">UID Scanner & Auto Claim Portal</div>
                            
                            <label>Paste UIDs (One UID per line)</label>
                            <textarea id="checker-input-uids" rows="5" placeholder="61592634719749&#10;61592262077319"></textarea>
                            
                            <button class="btn" onclick="runUidChecker()">START SCANNER</button>

                            <div style="margin-top: 25px;">
                                <div id="checker-output-box" style="min-height: 100px; max-height: 300px; overflow-y: auto;">
                                    <div style="color: #64748b; text-align: center; padding: 30px;">No UIDs scanned yet.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Payment / Withdraw Section -->
                <div id="user-section-withdraw" class="hidden">
                    <h3 style="margin: 0 0 5px 0; color: #f8fafc; font-size: 18px;">Payment / Withdraw Request</h3>
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Request a payout to your mobile banking account.</p>

                    <div style="background: rgba(15, 23, 42, 0.4); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); max-width: 500px;">
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

                    <h4 style="margin: 30px 0 15px 0; color: #f8fafc; font-size: 16px;">Your Withdrawal History</h4>
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
            </div>

            <script>
                let currentUser = null;
                let activeCategory = null;
                let activeNavTab = 'home';
                let dynamicCategories = [];

                window.onload = function() {
                    loadCategoriesAndInit();
                    const savedUser = localStorage.getItem('portal_current_user');
                    if(savedUser) {
                        currentUser = JSON.parse(savedUser);
                        document.getElementById('login-card').classList.add('hidden');
                        document.getElementById('dashboard-card').classList.remove('hidden');
                        updateUserUI();
                        switchSidebarTab('home');
                    }
                };

                function loadCategoriesAndInit(callback) {
                    fetch('/api/categories')
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            dynamicCategories = data.categories;
                            renderUserCategoryGrids();
                            if(callback) callback();
                        }
                    });
                }

                function renderUserCategoryGrids() {
                    let submitGrid = document.getElementById('user-submit-category-grid');
                    let reportGrid = document.getElementById('user-report-category-grid');
                    
                    submitGrid.innerHTML = '';
                    reportGrid.innerHTML = '';

                    dynamicCategories.forEach(cat => {
                        submitGrid.innerHTML += \`
                            <div class="cat-card" style="--accent-gradient: \${cat.gradient};" onclick="openCategory('\${cat.id}', '\${cat.name.replace(/'/g, "\\\\'")}', 'home')">
                                <span class="cat-icon">\${cat.icon}</span>
                                <div class="cat-title">\${cat.name}</div>
                            </div>
                        \`;
                        reportGrid.innerHTML += \`
                            <div class="cat-card" style="--accent-gradient: \${cat.gradient};" onclick="openCategory('\${cat.id}', '\${cat.name.replace(/'/g, "\\\\'")}', 'report')">
                                <span class="cat-icon">\${cat.icon}</span>
                                <div class="cat-title">\${cat.name}</div>
                            </div>
                        \`;
                    });
                }

                function toggleSidebar() {
                    document.getElementById('sidebar').classList.toggle('active');
                    document.getElementById('sidebar-overlay').classList.toggle('active');
                }

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
                            switchSidebarTab('home');
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function updateUserUI() {
                    document.getElementById('user-display-name').innerText = currentUser.firstName + ' ' + currentUser.lastName;
                    document.getElementById('sidebar-user-name').innerText = currentUser.firstName + ' ' + currentUser.lastName;
                    document.getElementById('sidebar-user-tg').innerText = '@' + currentUser.username;
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

                function switchSidebarTab(tab) {
                    toggleSidebar();
                    loadCategoriesAndInit();
                    activeNavTab = tab;

                    document.getElementById('sb-home').classList.remove('active');
                    document.getElementById('sb-report').classList.remove('active');
                    document.getElementById('sb-withdraw').classList.remove('active');

                    document.getElementById('user-section-home').classList.add('hidden');
                    document.getElementById('user-section-report').classList.add('hidden');
                    document.getElementById('user-section-withdraw').classList.add('hidden');

                    if(tab === 'home') {
                        document.getElementById('sb-home').classList.add('active');
                        document.getElementById('user-section-home').classList.remove('hidden');
                        backToCategories();
                    } else if(tab === 'report') {
                        document.getElementById('sb-report').classList.add('active');
                        document.getElementById('user-section-report').classList.remove('hidden');
                        backToCategories();
                    } else if(tab === 'withdraw') {
                        document.getElementById('sb-withdraw').classList.add('active');
                        document.getElementById('user-section-withdraw').classList.remove('hidden');
                        loadUserWithdraws();
                    }
                }

                function openCategory(catId, catName, mode) {
                    activeCategory = catId;
                    if(mode === 'home') {
                        document.getElementById('active-category-title').innerText = catName;
                        document.getElementById('category-selection-view').classList.add('hidden');
                        document.getElementById('category-form-view').classList.remove('hidden');
                        loadUserSubs();
                    } else {
                        document.getElementById('active-report-category-title').innerText = catName + ' - Report File & Checker';
                        document.getElementById('report-category-selection-view').classList.add('hidden');
                        document.getElementById('report-checker-view').classList.remove('hidden');
                        document.getElementById('checker-input-uids').value = '';
                        document.getElementById('checker-output-box').innerHTML = '<div style="color: #64748b; text-align: center; padding: 30px;">No UIDs scanned yet.</div>';
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
                                outputBox.innerHTML += \`<button class="claim-all-btn" onclick="claimAllUids()">🔥 CLAIM ALL LIVE UIDs (\${unclaimableLiveCount} IDs - ৳\${totalLivePrize})</button>\`;
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
                            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 25px;">No submissions found in this category.</td></tr>';
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
                            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 25px;">No withdrawal requests found.</td></tr>';
                            return;
                        }
                        data.withdrawals.forEach(w => {
                            let statusClass = w.status === 'success' ? 'status-success' : 'status-pending';
                            let statusText = w.status === 'success' ? 'SUCCESS' : 'PENDING';
                            let dateStr = new Date(w.date).toLocaleString();
                            tbody.innerHTML += '<tr><td>' + dateStr + '</td><td>' + w.method + '</td><td>' + w.phone + '</td><td style="color: #4ade80; font-weight: bold;">৳' + w.amount + '</td><td style="text-align: center;"><span class="' + statusClass + '">' + statusText + '</span></td></tr>';
                        });
                    });
                }

                function logout() {
                    currentUser = null;
                    localStorage.removeItem('portal_current_user');
                    document.getElementById('dashboard-card').classList.add('hidden');
                    document.getElementById('login-card').classList.remove('hidden');
                    toggleSidebar();
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
            <title>Premium Admin Dashboard</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0b0f19; margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #f8fafc; }
                .card { background: rgba(17, 24, 39, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); width: 100%; max-width: 440px; padding: 35px; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
                h2 { text-align: center; color: #f8fafc; margin-bottom: 25px; font-weight: 700; font-size: 22px; }
                input, textarea, select { width: 100%; padding: 14px 18px; margin-bottom: 20px; border: 2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 15px; background: rgba(3, 7, 18, 0.6); color: #fff; outline: none; transition: 0.3s; font-family: inherit; }
                input:focus, textarea:focus, select:focus { border-color: #10b981; background: rgba(3, 7, 18, 0.9); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
                .btn { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 700; width: 100%; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); font-family: inherit; }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(16, 185, 129, 0.6); }
                .hidden { display: none !important; }

                .admin-container { max-width: 1350px !important; padding: 35px !important; border-radius: 24px; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                
                .category-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.08); padding-bottom: 12px; align-items: center; }
                .tab-btn { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05); padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.3s; font-family: inherit; }
                .tab-btn.active { background: linear-gradient(135deg, #10b981, #059669); color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(16,185,129,0.4); }

                .add-cat-tab-btn { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
                .delete-cat-btn { background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; margin-left: 8px; }

                .admin-sub-nav { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
                .sub-nav-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
                .sub-nav-btn.active { background: #3b82f6; color: white; border-color: transparent; }

                .header-btns { display: flex; gap: 10px; flex-wrap: wrap; }
                .action-global-btn { background: #3b82f6; color: white; border: none; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.3s; box-shadow: 0 4px 15px rgba(59,130,246,0.3); display: flex; align-items: center; gap: 6px; font-family: inherit; }
                .action-global-btn:hover { background: #2563eb; transform: translateY(-2px); }
                
                .clear-btn { background: #ef4444 !important; box-shadow: 0 4px 15px rgba(239,68,68,0.3) !important; }
                .clear-btn:hover { background: #dc2626 !important; }

                .sheet-scroll-box { max-height: 520px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; background: rgba(3, 7, 18, 0.4); }
                table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 950px; background: transparent; }
                th, td { border-bottom: 1px solid rgba(255,255,255,0.06); padding: 14px 18px; text-align: left; white-space: nowrap; }
                th { background: rgba(3, 7, 18, 0.8); color: #cbd5e1; font-weight: 600; text-align: center; position: sticky; top: 0; z-index: 10; }
                td { background: transparent; color: #cbd5e1; }
                
                .sheet-details { max-width: 300px; overflow-x: auto; white-space: nowrap; font-family: monospace; background: rgba(0,0,0,0.4); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); color: #38bdf8; }
                
                .action-cell-flex { display: flex; align-items: center; gap: 8px; justify-content: center; }
                .balance-input { width: 85px !important; padding: 6px 8px !important; margin-bottom: 0 !important; font-size: 13px !important; text-align: center; }
                .received-btn { background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s; box-shadow: 0 4px 10px rgba(16,185,129,0.3); }
                .received-btn:hover { background: #059669; }
                .received-text { color: #4ade80; font-weight: bold; text-align: center; display: inline-block; background: rgba(74,222,128,0.15); padding: 6px 10px; border-radius: 6px; font-size: 12px; border: 1px solid rgba(74,222,128,0.3); }

                .row-download-btn { background: #6366f1; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 6px; }

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
                    <h2 style="margin: 0; color: #f8fafc; font-size: 20px;">📊 Admin Panel - Dynamic Category & Control</h2>
                    <div class="header-btns" id="admin-top-btns">
                        <button class="action-global-btn" onclick="downloadCategoryCSV()">📥 Download Tab (CSV)</button>
                        <button class="action-global-btn clear-btn" onclick="clearCategorySubmissions()">🗑️ Clear Tab & Archive</button>
                    </div>
                </div>

                <div class="category-tabs" id="admin-tabs-container"></div>

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
                    <div style="background: rgba(3, 7, 18, 0.5); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
                        <h3 style="margin-top: 0; color: #38bdf8; font-size: 18px;" id="admin-report-title">Manage Report Box UIDs & Auto Prize</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Set the prize amount and add/append new live UIDs. Saved UIDs will stay in history below.</p>
                        
                        <label>Category Prize Amount (BDT)</label>
                        <input type="number" id="admin-category-prize" placeholder="e.g. 50">

                        <label>Add New UIDs (One UID per line)</label>
                        <textarea id="admin-report-textarea" rows="4" placeholder="Paste new UIDs here..."></textarea>
                        
                        <button class="btn" onclick="saveAdminReportAndPrize()" style="max-width: 220px; margin-bottom: 25px;">Save & Append UIDs</button>

                        <h4 style="color: #f8fafc; margin-bottom: 10px;">Saved UID History (<span id="saved-uids-count">0</span>)</h4>
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
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Cleared or archived entries from previous dates are safely stored here in file format.</p>
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
                let dynamicCategories = [];
                let activeAdminCategory = '';
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

                function loadAdminData(callback) {
                    fetch('/api/admin/data')
                    .then(res => res.json())
                    .then(data => {
                        allSubmissions = data.submissions;
                        allWithdrawals = data.withdrawals;
                        adminReports = data.adminReports || {};
                        categoryPrizes = data.categoryPrizes || {};
                        archivedSubmissions = data.archivedSubmissions || [];
                        dynamicCategories = data.categories || [];

                        if(!activeAdminCategory && dynamicCategories.length > 0) {
                            activeAdminCategory = dynamicCategories[0].id;
                        }

                        renderAdminTabs();
                        renderAdminTable();
                        if(activeAdminSubView === 'report') {
                            renderSavedUidsHistory();
                        }
                        if(activeAdminCategory === 'archives') {
                            renderArchiveTable();
                        }
                        if(callback) callback();
                    });
                }

                function renderAdminTabs() {
                    let container = document.getElementById('admin-tabs-container');
                    container.innerHTML = '';

                    dynamicCategories.forEach(cat => {
                        let isActive = (activeAdminCategory === cat.id) ? 'active' : '';
                        container.innerHTML += \`
                            <button class="tab-btn \${isActive}" onclick="switchAdminTab('\${cat.id}', this)">
                                \${cat.name}
                                <span onclick="event.stopPropagation(); deleteCategory('\${cat.id}')" class="delete-cat-btn" title="Delete Category">❌</span>
                            </button>
                        \`;
                    });

                    let isWithActive = (activeAdminCategory === 'withdrawals') ? 'active' : '';
                    let isArcActive = (activeAdminCategory === 'archives') ? 'active' : '';

                    container.innerHTML += \`
                        <button class="tab-btn \${isWithActive}" onclick="switchAdminTab('withdrawals', this)">💸 Payment Requests</button>
                        <button class="tab-btn \${isArcActive}" onclick="switchAdminTab('archives', this)" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);">📦 Archived UIDs / IDs</button>
                        <button class="add-cat-tab-btn" onclick="addNewCategoryPrompt()">➕ Add Category</button>
                    \`;
                }

                function addNewCategoryPrompt() {
                    let catName = prompt('Enter new category name:');
                    if(!catName) return;
                    let icon = prompt('Enter emoji icon (e.g. 📁 or 💡):', '📁');

                    fetch('/api/admin/add-category', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ name: catName, icon })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadAdminData(() => {
                                alert('Category added successfully!');
                            });
                        }
                    });
                }

                function deleteCategory(catId) {
                    if(dynamicCategories.length <= 1) return alert('You must keep at least one category!');
                    if(!confirm('Are you sure you want to delete this category? All submissions under it may be affected.')) return;

                    fetch('/api/admin/delete-category', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ id: catId })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            dynamicCategories = data.categories;
                            activeAdminCategory = dynamicCategories[0].id;
                            loadAdminData();
                            alert('Category deleted successfully!');
                        }
                    });
                }

                function switchAdminTab(catId, btnElement) {
                    activeAdminCategory = catId;
                    renderAdminTabs();

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

                function renderAdminTable() {
                    let theadRow = document.getElementById('table-header-row');
                    let tbody = document.getElementById('admin-subs-table');
                    tbody.innerHTML = '';

                    if(activeAdminCategory === 'withdrawals') {
                        theadRow.innerHTML = '<th>SL</th><th>Date & Time</th><th>Username</th><th>Method & Phone</th><th>Amount</th><th>Status / Action</th>';
                        
                        if(allWithdrawals.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 25px;">No payment requests found.</td></tr>';
                            return;
                        }

                        allWithdrawals.forEach((w, index) => {
                            let actionCol = w.status === 'success' 
                                ? '<span class="received-text">SUCCESS</span>' 
                                : '<button class="received-btn" onclick="approveWithdraw(\\'' + w.id + '\\')">Approve / Pay</button>';
                            
                            let dateStr = new Date(w.date).toLocaleString();
                            tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: #38bdf8;">@' + w.username + '</strong></td><td>' + w.method + ' - <strong>' + w.phone + '</strong></td><td style="color: #4ade80; font-weight: bold;">৳' + w.amount + '</td><td style="text-align: center;">' + actionCol + '</td></tr>';
                        });

                    } else if(activeAdminCategory === 'archives') {
                        return;
                    } else {
                        theadRow.innerHTML = '<th>SL</th><th>Date & Time</th><th>Telegram Username</th><th>Details / Cookies</th><th>Action & Add Balance</th>';
                        
                        let filtered = allSubmissions.filter(s => s.category === activeAdminCategory);

                        if(filtered.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 25px;">No submissions found in this category.</td></tr>';
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
                            
                            tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: #38bdf8;">@' + s.username + '</strong></td><td><div style="display: flex; align-items: center; justify-content: space-between;"><div class="sheet-details">' + s.details + '</div>' + rowDownloadBtn + '</div></td><td style="text-align: center;">' + actionColumn + '</td></tr>';
                        });
                    }
                }

                function renderArchiveTable() {
                    let tbody = document.getElementById('admin-archive-table');
                    tbody.innerHTML = '';
                    if(archivedSubmissions.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 25px;">No archived records found.</td></tr>';
                        return;
                    }
                    archivedSubmissions.forEach((arc, index) => {
                        let dateStr = new Date(arc.date).toLocaleString();
                        tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td>' + arc.category + '</td><td><strong style="color: #38bdf8;">@' + arc.username + '</strong></td><td><div class="sheet-details">' + arc.details + '</div></td></tr>';
                    });
                }

                function renderSavedUidsHistory() {
                    let uidsList = adminReports[activeAdminCategory] || [];
                    document.getElementById('saved-uids-count').innerText = uidsList.length;
                    let tbody = document.getElementById('admin-saved-uids-table');
                    tbody.innerHTML = '';

                    if(uidsList.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 20px;">No saved UIDs in history.</td></tr>';
                        return;
                    }

                    uidsList.forEach((uid, index) => {
                        tbody.innerHTML += \`
                            <tr>
                                <td style="text-align: center; font-weight: 600;">\${index + 1}</td>
                                <td style="font-family: monospace; color: #38bdf8;">\${uid}</td>
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
app.get('/api/categories', (req, res) => {
    const data = loadData();
    res.json({ success: true, categories: data.categories });
});

app.post('/api/admin/add-category', (req, res) => {
    const { name, icon } = req.body;
    const data = loadData();
    
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const gradients = [
        'linear-gradient(135deg, #f09433 0%, #dc2743 100%)',
        'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)',
        'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
        'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newCat = { id, name, icon: icon || '📁', gradient: randomGradient };
    
    data.categories.push(newCat);
    saveData(data);
    res.json({ success: true, categories: data.categories });
});

app.post('/api/admin/delete-category', (req, res) => {
    const { id } = req.body;
    const data = loadData();
    
    data.categories = data.categories.filter(c => c.id !== id);
    saveData(data);
    res.json({ success: true, categories: data.categories });
});

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
        category: category,
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

// ==================== পেমেন্ট / উইথড্র রিকোয়েস্ট API ====================
app.post('/api/withdraw', (req, res) => {
    const { username, method, phone, amount } = req.body;
    const data = loadData();
    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if(!user || (user.balance || 0) < amount) {
        return res.json({ success: false, message: 'Insufficient balance!' });
    }

    // উইথড্র রিকোয়েস্ট তৈরি (Status: pending)
    const withdrawal = {
        id: Date.now().toString(),
        username,
        method,
        phone,
        amount: parseFloat(amount),
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
        archivedSubmissions: data.archivedSubmissions || [],
        categories: data.categories || []
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

// ==================== অ্যাডমিন অনুমোদন ও ব্যালেন্স কাটার API ====================
app.post('/api/admin/approve-withdraw/:id', (req, res) => {
    const { id } = req.params;
    const data = loadData();
    let w = data.withdrawals.find(item => item.id === id);
    
    if(w && w.status !== 'success') {
        let user = data.users.find(u => u.username.toLowerCase() === w.username.toLowerCase());
        
        // অ্যাডমিন অ্যাপ্রুভ করার সাথে সাথে ব্যালেন্স কাটা হবে এবং স্ট্যাটাস success করা হবে
        if(user) {
            user.balance = Math.max(0, (user.balance || 0) - w.amount);
        }
        
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
