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
        return { users: [], submissions: [] };
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ক্যাটেগরি লিস্ট
const CATEGORIES = [
    { id: 'instagram_2fa', name: 'Instagram 2FA ID', icon: '📸', gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { id: 'fb_page_cookies', name: 'Facebook Page Cookies', icon: '📄', gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)' },
    { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🍪', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '✉️', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)' }
];

// ==================== ১. ইউজার প্যানেল ====================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Premium User Panel - ID Submission</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0f172a; background-image: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%); margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #f8fafc; }
                
                .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; max-width: 520px; padding: 35px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .icon-box { width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; color: white; font-size: 28px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                
                h2 { text-align: center; color: #f8fafc; margin-bottom: 8px; font-weight: 700; font-size: 24px; }
                p.subtitle { text-align: center; color: #94a3b8; font-size: 14px; margin-bottom: 25px; }
                label { display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
                
                input, textarea { width: 100%; padding: 14px 18px; margin-bottom: 20px; border: 2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 15px; background: rgba(15, 23, 42, 0.6); color: #fff; outline: none; transition: all 0.3s ease; font-family: inherit; }
                input:focus, textarea:focus { border-color: #6366f1; background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
                
                .btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 700; width: 100%; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); font-family: inherit; }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.6); }
                
                .switch-text { text-align: center; margin-top: 20px; font-size: 13px; color: #818cf8; font-weight: 600; cursor: pointer; letter-spacing: 0.5px; }
                .switch-text:hover { text-decoration: underline; }
                .hidden { display: none !important; }
                
                .dashboard-container { max-width: 950px !important; padding: 35px !important; }
                
                /* Premium Category Cards Style */
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
                tr:hover td { background: rgba(255, 255, 255, 0.02); }
                
                .sheet-details { max-width: 320px; overflow-x: auto; white-space: nowrap; font-family: monospace; background: rgba(0, 0, 0, 0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); color: #38bdf8; }
                .sheet-details::-webkit-scrollbar { height: 6px; }
                .sheet-details::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
                
                .status-pending { color: #fbbf24; font-weight: 700; background: rgba(251, 191, 36, 0.15); padding: 6px 12px; border-radius: 30px; display: inline-block; font-size: 12px; border: 1px solid rgba(251, 191, 36, 0.3); }
                .status-success { color: #4ade80; font-weight: 700; background: rgba(74, 222, 128, 0.15); padding: 6px 12px; border-radius: 30px; display: inline-block; font-size: 12px; border: 1px solid rgba(74, 222, 128, 0.3); }
                
                .delete-btn { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
                .delete-btn:hover { transform: scale(1.05); }

                .logout-btn { background: linear-gradient(135deg, #ef4444, #dc2626); margin-top: 30px; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4); max-width: 160px; }

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
                <p class="subtitle">Secure ID Submission Portal</p>
                
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

            <!-- User Dashboard -->
            <div class="card dashboard-container hidden" id="dashboard-card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 25px;">
                    <div>
                        <h2 style="text-align: left; margin: 0; font-size: 22px;">Welcome, <span id="user-display-name" style="color: #818cf8;"></span></h2>
                        <p class="subtitle" style="text-align: left; margin: 5px 0 0 0;">Telegram: <span id="user-display-tg" style="font-weight: 600; color: #38bdf8;"></span></p>
                    </div>
                </div>

                <div id="category-selection-view">
                    <h3 style="margin: 0 0 5px 0; color: #f8fafc; font-size: 18px;">Select Category to Submit ID</h3>
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Choose a category below to proceed with your submission.</p>
                    
                    <div class="category-grid">
                        ${CATEGORIES.map(cat => `
                            <div class="cat-card" style="--accent-gradient: ${cat.gradient};" onclick="openCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}')">
                                <span class="cat-icon">${cat.icon}</span>
                                <div class="cat-title">${cat.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Specific Category Form & History -->
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

                <button class="btn logout-btn" onclick="logout()">Logout</button>
            </div>

            <script>
                let currentUser = null;
                let activeCategory = null;

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
                            document.getElementById('user-display-name').innerText = currentUser.firstName + ' ' + currentUser.lastName;
                            document.getElementById('user-display-tg').innerText = '@' + currentUser.username;
                            
                            document.getElementById('login-card').classList.add('hidden');
                            document.getElementById('dashboard-card').classList.remove('hidden');
                            backToCategories();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function openCategory(catId, catName) {
                    activeCategory = catId;
                    document.getElementById('active-category-title').innerText = catName;
                    document.getElementById('category-selection-view').classList.add('hidden');
                    document.getElementById('category-form-view').classList.remove('hidden');
                    loadUserSubs();
                }

                function backToCategories() {
                    activeCategory = null;
                    document.getElementById('category-form-view').classList.add('hidden');
                    document.getElementById('category-selection-view').classList.remove('hidden');
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

                function logout() {
                    currentUser = null;
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
            <title>Premium Admin Dashboard</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0b0f19; margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #f8fafc; }
                .card { background: rgba(17, 24, 39, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); width: 100%; max-width: 440px; padding: 35px; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
                h2 { text-align: center; color: #f8fafc; margin-bottom: 25px; font-weight: 700; font-size: 22px; }
                input { width: 100%; padding: 14px 18px; margin-bottom: 20px; border: 2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 15px; background: rgba(3, 7, 18, 0.6); color: #fff; outline: none; transition: 0.3s; font-family: inherit; }
                input:focus { border-color: #10b981; background: rgba(3, 7, 18, 0.9); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
                .btn { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 700; width: 100%; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); font-family: inherit; }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(16, 185, 129, 0.6); }
                .hidden { display: none !important; }

                .admin-container { max-width: 1350px !important; padding: 35px !important; border-radius: 24px; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                
                .category-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.08); padding-bottom: 12px; }
                .tab-btn { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05); padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.3s; font-family: inherit; }
                .tab-btn.active { background: linear-gradient(135deg, #10b981, #059669); color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(16,185,129,0.4); }

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
                tr:hover td { background: rgba(255, 255, 255, 0.02); }
                
                .sheet-details { max-width: 350px; overflow-x: auto; white-space: nowrap; font-family: monospace; background: rgba(0,0,0,0.4); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); color: #38bdf8; }
                .sheet-details::-webkit-scrollbar { height: 5px; }
                .sheet-details::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
                
                .received-btn { background: #10b981; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s; box-shadow: 0 4px 10px rgba(16,185,129,0.3); }
                .received-btn:hover { background: #059669; transform: scale(1.05); }
                .received-text { color: #4ade80; font-weight: bold; text-align: center; display: inline-block; background: rgba(74,222,128,0.15); padding: 6px 12px; border-radius: 6px; font-size: 12px; border: 1px solid rgba(74,222,128,0.3); }

                .row-download-btn { background: #6366f1; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 8px; transition: 0.2s; }
                .row-download-btn:hover { background: #4f46e5; }

                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .card { padding: 20px; }
                    .admin-container { padding: 15px !important; }
                    .sheet-details { max-width: 180px; }
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
                    <h2 style="margin: 0; color: #f8fafc; font-size: 20px;">📊 Admin Panel - Category Wise Submissions</h2>
                    <div class="header-btns">
                        <button class="action-global-btn" onclick="downloadCategoryCSV()">📥 Download Tab (CSV)</button>
                        <button class="action-global-btn clear-btn" onclick="clearCategorySubmissions()">🗑️ Clear Tab Data</button>
                    </div>
                </div>

                <!-- Category Tabs -->
                <div class="category-tabs" id="admin-tabs-container">
                    ${CATEGORIES.map((cat, index) => `
                        <button class="tab-btn ${index === 0 ? 'active' : ''}" onclick="switchAdminTab('${cat.id}', this)">${cat.name}</button>
                    `).join('')}
                </div>

                <div class="sheet-scroll-box">
                    <table>
                        <thead>
                            <tr>
                                <th>SL</th>
                                <th>Date & Time</th>
                                <th>Telegram Username</th>
                                <th>Details / Cookies</th>
                                <th>Action / Status</th>
                            </tr>
                        </thead>
                        <tbody id="admin-subs-table"></tbody>
                    </table>
                </div>
            </div>

            <script>
                let allSubmissions = [];
                let activeAdminCategory = '${CATEGORIES[0].id}';

                function adminLogin() {
                    const pass = document.getElementById('admin-pass').value;
                    if(pass === '@MYPANEL') {
                        document.getElementById('admin-login-card').classList.add('hidden');
                        document.getElementById('admin-dashboard-card').classList.remove('hidden');
                        loadAdminSubs();
                    } else {
                        alert('Wrong Password! Use @MYPANEL');
                    }
                }

                function switchAdminTab(catId, btnElement) {
                    activeAdminCategory = catId;
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btnElement.classList.add('active');
                    renderAdminTable();
                }

                function loadAdminSubs() {
                    fetch('/api/admin/submissions')
                    .then(res => res.json())
                    .then(data => {
                        allSubmissions = data.submissions;
                        renderAdminTable();
                    });
                }

                function renderAdminTable() {
                    let tbody = document.getElementById('admin-subs-table');
                    tbody.innerHTML = '';
                    
                    let filtered = allSubmissions.filter(s => s.category === activeAdminCategory);

                    if(filtered.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 25px;">No submissions found in this category.</td></tr>';
                        return;
                    }

                    filtered.forEach((s, index) => {
                        let actionColumn = s.status === 'success' 
                            ? '<span class="received-text">RECEIVED</span>' 
                            : '<button class="received-btn" onclick="markReceived(\\'' + s.id + '\\')">Received</button>';
                        
                        let rowDownloadBtn = '<button class="row-download-btn" onclick="downloadSingleRow(\\'' + s.username + '\\', \\'' + s.id + '\\')">📥 Download</button>';

                        let dateStr = new Date(s.date).toLocaleString();
                        tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: #38bdf8;">@' + s.username + '</strong></td><td><div style="display: flex; align-items: center; justify-content: space-between;"><div class="sheet-details">' + s.details + '</div>' + rowDownloadBtn + '</div></td><td style="text-align: center;">' + actionColumn + '</td></tr>';
                    });
                }

                function markReceived(id) {
                    fetch('/api/admin/update/' + id, {method: 'POST'})
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadAdminSubs();
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
                    if(!confirm('Are you sure you want to clear all submissions in this category?')) return;
                    
                    fetch('/api/admin/clear/' + activeAdminCategory, {method: 'POST'})
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            loadAdminSubs();
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

    data.users.push({ firstName, lastName, username: username.replace(/^@/, ''), email, password });
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
    data.submissions = data.submissions.filter(s => s.id !== id);
    saveData(data);
    res.json({ success: true });
});

app.get('/api/admin/submissions', (req, res) => {
    const data = loadData();
    res.json({ success: true, submissions: data.submissions });
});

app.post('/api/admin/update/:id', (req, res) => {
    const { id } = req.params;
    const data = loadData();
    const sub = data.submissions.find(s => s.id === id);
    if(sub) {
        sub.status = 'success';
        saveData(data);
    }
    res.json({ success: true });
});

app.post('/api/admin/clear/:category', (req, res) => {
    const { category } = req.params;
    const data = loadData();
    data.submissions = data.submissions.filter(s => s.category !== category);
    saveData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
