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
    { id: 'instagram_2fa', name: 'Instagram 2FA ID', icon: '📸', color: '#e1306c' },
    { id: 'fb_page_cookies', name: 'Facebook Page Cookies', icon: '📄', color: '#1877f2' },
    { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🍪', color: '#0084ff' },
    { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '✉️', color: '#00a4ef' }
];

// ==================== ১. ইউজার প্যানেল ====================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Panel - ID Submission</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); margin: 0; padding: 10px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                
                .card { background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(12px); width: 100%; max-width: 480px; padding: 25px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
                .icon-box { width: 50px; height: 50px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 14px; margin: 0 auto 15px; display: flex; justify-content: center; align-items: center; color: white; font-size: 24px; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3); }
                
                h2 { text-align: center; color: #111827; margin-bottom: 5px; font-weight: 700; font-size: 22px; }
                p.subtitle { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 20px; }
                label { display: block; font-size: 11px; font-weight: 700; color: #4b5563; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
                
                input, textarea { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; background: #f9fafb; outline: none; transition: all 0.3s ease; }
                input:focus, textarea:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
                
                .btn { background: linear-gradient(135deg, #4f46e5, #6d28d9); color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; width: 100%; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
                
                .switch-text { text-align: center; margin-top: 15px; font-size: 12px; color: #4f46e5; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
                .switch-text:hover { text-decoration: underline; }
                .hidden { display: none !important; }
                
                .dashboard-container { max-width: 900px !important; width: 100% !important; padding: 25px !important; }
                
                /* Category Boxes Style */
                .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
                .cat-card { background: white; border: 2px solid #e5e7eb; border-radius: 14px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .cat-card:hover { transform: translateY(-3px); border-color: #4f46e5; box-shadow: 0 10px 20px rgba(79,70,229,0.15); }
                .cat-icon { font-size: 32px; margin-bottom: 10px; display: block; }
                .cat-title { font-weight: 700; color: #1f2937; font-size: 14px; }

                .back-btn { background: #6b7280; width: auto; padding: 8px 16px; margin-bottom: 15px; font-size: 12px; box-shadow: none; }
                .back-btn:hover { background: #4b5563; }

                .sheet-scroll-box { max-height: 350px; overflow-y: auto; overflow-x: auto; border: 1px solid #d1d5db; border-radius: 10px; margin-top: 15px; background: white; }
                table { width: 100%; border-collapse: collapse; min-width: 650px; background: white; font-size: 13px; }
                th, td { border: 1px solid #d1d5db; padding: 12px 14px; text-align: left; white-space: nowrap; }
                th { background: #f8fafc; color: #374151; position: sticky; top: 0; z-index: 10; font-weight: 700; text-align: center; }
                td { color: #1f2937; }
                tr:nth-child(even) td { background: #f8fafc; }
                
                .sheet-details { max-width: 300px; overflow-x: auto; overflow-y: hidden; white-space: nowrap; font-family: monospace; background: #fdfdfd; padding: 6px; border-radius: 6px; border: 1px style solid #eee; }
                .sheet-details::-webkit-scrollbar { height: 5px; }
                .sheet-details::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .status-pending { color: #d97706; font-weight: 700; background: #fef3c7; padding: 5px 10px; border-radius: 20px; display: inline-block; font-size: 11px; text-align: center; }
                .status-success { color: #16a34a; font-weight: 700; background: #dcfce7; padding: 5px 10px; border-radius: 20px; display: inline-block; font-size: 11px; text-align: center; }
                
                .delete-btn { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: 0.2s; }
                .delete-btn:hover { transform: scale(1.05); }

                .logout-btn { background: linear-gradient(135deg, #ef4444, #dc2626); margin-top: 25px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); max-width: 150px; }

                @media (max-width: 600px) {
                    body { padding: 5px; }
                    .card { padding: 15px; border-radius: 16px; }
                    .dashboard-container { padding: 15px !important; }
                    .category-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>

            <!-- Login View -->
            <div class="card" id="login-card">
                <div class="icon-box">🛡️</div>
                <h2>Welcome Back</h2>
                <p class="subtitle">Secure ID Submission Portal</p>
                
                <label>Email Address</label>
                <input type="email" id="login-email" placeholder="name@example.com">
                
                <label>Password</label>
                <input type="password" id="login-pass" placeholder="••••••••">
                
                <button class="btn" onclick="loginUser()">LOGIN NOW</button>
                <div class="switch-text" onclick="showRegister()">Don't have an account? Register</div>
            </div>

            <!-- Register View -->
            <div class="card hidden" id="register-card">
                <div class="icon-box">✨</div>
                <h2>Create Account</h2>
                <p class="subtitle">Join our platform today</p>
                
                <div style="display: flex; gap: 10px;">
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

                <button class="btn" onclick="registerUser()">CREATE ACCOUNT</button>
                <div class="switch-text" onclick="showLogin()">Already have an account? Login</div>
            </div>

            <!-- User Dashboard (Category Selection View) -->
            <div class="card dashboard-container hidden" id="dashboard-card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                        <h2 style="text-align: left; margin: 0; font-size: 20px;">Welcome, <span id="user-display-name" style="color: #4f46e5;"></span></h2>
                        <p class="subtitle" style="text-align: left; margin: 3px 0 0 0;">Telegram: <span id="user-display-tg" style="font-weight: 600; color: #374151;"></span></p>
                    </div>
                </div>

                <div id="category-selection-view">
                    <h3 style="margin-top: 25px; color: #111827; font-size: 16px;">Select Category to Submit ID</h3>
                    <div class="category-grid">
                        ${CATEGORIES.map(cat => `
                            <div class="cat-card" onclick="openCategory('${cat.id}', '${cat.name}')">
                                <span class="cat-icon">${cat.icon}</span>
                                <div class="cat-title">${cat.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Specific Category Submission & History View -->
                <div id="category-form-view" class="hidden">
                    <button class="btn back-btn" onclick="backToCategories()">⬅️ Back to Categories</button>
                    <h3 id="active-category-title" style="color: #4f46e5; margin-bottom: 15px;"></h3>
                    
                    <div>
                        <label>Submit Details / Cookies</label>
                        <textarea id="id-details" rows="3" placeholder="Paste details or cookies here..."></textarea>
                        <button class="btn" onclick="submitId()" style="width: 160px;">Submit Now</button>
                    </div>

                    <h4 style="margin-top: 25px; color: #111827; font-size: 15px;">Your Submissions for this Category</h4>
                    <div class="sheet-scroll-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>Action</th>
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
                            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 15px;">No submissions in this category.</td></tr>';
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
            <title>Admin Dashboard - Category Wise</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; margin: 0; padding: 10px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background: white; width: 100%; max-width: 400px; padding: 30px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); }
                h2 { text-align: center; color: #1e293b; margin-bottom: 20px; font-weight: 700; font-size: 20px; }
                input { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc; outline: none; transition: 0.3s; }
                input:focus { border-color: #059669; background: #fff; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1); }
                .btn { background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; width: 100%; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4); }
                .hidden { display: none !important; }

                /* Admin Container & Tabs */
                .admin-container { max-width: 1300px !important; width: 100% !important; padding: 25px !important; border-radius: 14px; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
                
                .category-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                .tab-btn { background: #e2e8f0; color: #334155; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.2s; }
                .tab-btn.active { background: #059669; color: white; box-shadow: 0 2px 6px rgba(5,150,105,0.3); }

                .header-btns { display: flex; gap: 8px; flex-wrap: wrap; }
                .action-global-btn { background: #2563eb; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s; box-shadow: 0 2px 6px rgba(37,99,235,0.3); display: flex; align-items: center; gap: 5px; }
                .action-global-btn:hover { background: #1d4ed8; }
                
                .clear-btn { background: #dc2626 !important; }
                .clear-btn:hover { background: #b91c1c !important; }

                .sheet-scroll-box { max-height: 500px; overflow-y: auto; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: white; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 950px; background: white; }
                th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; white-space: nowrap; }
                th { background: #0f172a; color: white; font-weight: 600; text-align: center; position: sticky; top: 0; z-index: 10; }
                td { background: #ffffff; color: #334155; }
                tr:nth-child(even) td { background: #f8fafc; }
                
                .sheet-details { max-width: 320px; overflow-x: auto; overflow-y: hidden; white-space: nowrap; font-family: monospace; background: #f1f5f9; padding: 5px 8px; border-radius: 6px; border: 1px solid #cbd5e1; }
                .sheet-details::-webkit-scrollbar { height: 4px; }
                .sheet-details::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
                
                .received-btn { background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s; }
                .received-btn:hover { background: #047857; transform: scale(1.05); }
                .received-text { color: #047857; font-weight: bold; text-align: center; display: inline-block; background: #d1fae5; padding: 4px 10px; border-radius: 6px; font-size: 11px; }

                .row-download-btn { background: #4f46e5; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 6px; }
                .row-download-btn:hover { background: #4338ca; }

                @media (max-width: 600px) {
                    body { padding: 5px; }
                    .card { padding: 20px; }
                    .admin-container { padding: 12px !important; }
                    .sheet-details { max-width: 180px; }
                }
            </style>
        </head>
        <body>

            <!-- Admin Login -->
            <div class="card" id="admin-login-card">
                <h2>Admin Login</h2>
                <input type="password" id="admin-pass" placeholder="Enter Password (@MYPANEL)">
                <button class="btn" onclick="adminLogin()">LOGIN</button>
            </div>

            <!-- Admin Dashboard -->
            <div class="card admin-container hidden" id="admin-dashboard-card">
                <div class="header-flex">
                    <h2 style="margin: 0; color: #0f172a; font-size: 18px;">📊 Admin Panel - Category Wise Submissions</h2>
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
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">No submissions found in this category.</td></tr>';
                        return;
                    }

                    filtered.forEach((s, index) => {
                        let actionColumn = s.status === 'success' 
                            ? '<span class="received-text">RECEIVED</span>' 
                            : '<button class="received-btn" onclick="markReceived(\\'' + s.id + '\\')">Received</button>';
                        
                        let rowDownloadBtn = '<button class="row-download-btn" onclick="downloadSingleRow(\\'' + s.username + '\\', \\'' + s.id + '\\')">📥 Download</button>';

                        let dateStr = new Date(s.date).toLocaleString();
                        tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: #4f46e5;">@' + s.username + '</strong></td><td><div style="display: flex; align-items: center; justify-content: space-between;"><div class="sheet-details">' + s.details + '</div>' + rowDownloadBtn + '</div></td><td style="text-align: center;">' + actionColumn + '</td></tr>';
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
