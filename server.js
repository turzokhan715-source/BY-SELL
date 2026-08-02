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

// ==================== ১. ইউজার প্যানেল (মূল লিঙ্ক: /) ====================
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
                body { font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); margin: 0; padding: 15px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                
                .card { background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(12px); width: 100%; max-width: 450px; padding: 35px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
                .icon-box { width: 60px; height: 60px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 16px; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; color: white; font-size: 28px; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3); }
                
                h2 { text-align: center; color: #111827; margin-bottom: 5px; font-weight: 700; }
                p.subtitle { text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 25px; }
                label { display: block; font-size: 12px; font-weight: 700; color: #4b5563; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
                
                input, textarea { width: 100%; padding: 14px 18px; margin-bottom: 18px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; background: #f9fafb; outline: none; transition: all 0.3s ease; }
                input:focus, textarea:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
                
                .btn { background: linear-gradient(135deg, #4f46e5, #6d28d9); color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; width: 100%; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
                
                .switch-text { text-align: center; margin-top: 20px; font-size: 13px; color: #4f46e5; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
                .switch-text:hover { text-decoration: underline; }
                .hidden { display: none !important; }
                
                /* Responsive Auto-Fitting Premium Dashboard Container */
                .dashboard-container { max-width: 1100px !important; width: 95% !important; padding: 35px !important; }
                .sheet-scroll-box { max-height: 450px; overflow-y: auto; overflow-x: auto; border: 1px solid #d1d5db; border-radius: 10px; margin-top: 15px; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                
                table { width: 100%; border-collapse: collapse; min-width: 850px; background: white; font-size: 14px; }
                th, td { border: 1px solid #d1d5db; padding: 14px 16px; text-align: left; white-space: nowrap; }
                th { background: #f8fafc; color: #374151; position: sticky; top: 0; z-index: 10; font-weight: 700; text-align: center; }
                td { color: #1f2937; }
                tr:nth-child(even) td { background: #f8fafc; }
                
                /* Google Sheet Style One-line Text Box with Horizontal Scroll */
                .sheet-details { max-width: 550px; overflow-x: auto; overflow-y: hidden; white-space: nowrap; font-family: monospace; background: #fdfdfd; padding: 8px; border-radius: 6px; border: 1px solid #eee; }
                .sheet-details::-webkit-scrollbar { height: 6px; }
                .sheet-details::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .status-pending { color: #d97706; font-weight: 700; background: #fef3c7; padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 12px; text-align: center; }
                .status-success { color: #16a34a; font-weight: 700; background: #dcfce7; padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 12px; text-align: center; }
                
                .delete-btn { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2); }
                .delete-btn:hover { transform: scale(1.05); }

                .logout-btn { background: linear-gradient(135deg, #ef4444, #dc2626); margin-top: 25px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); max-width: 200px; }
                .logout-btn:hover { box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }

                @media (max-width: 768px) {
                    body { padding: 10px; }
                    .card, .dashboard-container { padding: 20px !important; }
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

                <button class="btn" onclick="registerUser()">CREATE ACCOUNT</button>
                <div class="switch-text" onclick="showLogin()">Already have an account? Login</div>
            </div>

            <!-- User Dashboard -->
            <div class="card dashboard-container hidden" id="dashboard-card">
                <div>
                    <h2 style="text-align: left; margin: 0; font-size: 24px;">Welcome, <span id="user-display-name" style="color: #4f46e5;"></span></h2>
                    <p class="subtitle" style="text-align: left; margin: 5px 0 0 0;">Telegram: <span id="user-display-tg" style="font-weight: 600; color: #374151;"></span></p>
                </div>
                
                <div style="margin-top: 25px;">
                    <label>Submit ID Details / Cookies</label>
                    <textarea id="id-details" rows="4" placeholder="Paste your ID details or cookies here..."></textarea>
                    <button class="btn" onclick="submitId()" style="width: 220px;">Submit Now</button>
                </div>

                <h3 style="margin-top: 35px; color: #111827; font-size: 18px;">Google Sheet Format - History</h3>
                <div class="sheet-scroll-box">
                    <table>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>ID Details</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="user-subs-table"></tbody>
                    </table>
                </div>
                <button class="btn logout-btn" onclick="logout()">Logout</button>
            </div>

            <script>
                let currentUser = null;

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
                            loadUserSubs();
                        } else {
                            alert(data.message);
                        }
                    });
                }

                function submitId() {
                    const details = document.getElementById('id-details').value.trim();
                    if(!details) return alert('Please enter ID details!');

                    fetch('/api/submit', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ username: currentUser.username, details })
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
                    fetch('/api/user/' + currentUser.username)
                    .then(res => res.json())
                    .then(data => {
                        let tbody = document.getElementById('user-subs-table');
                        tbody.innerHTML = '';
                        data.submissions.forEach(s => {
                            let statusClass = s.status === 'success' ? 'status-success' : 'status-pending';
                            let statusText = s.status === 'success' ? 'SUCCESS' : 'PENDING';
                            let dateStr = new Date(s.date).toLocaleString();
                            tbody.innerHTML += '<tr><td>' + dateStr + '</td><td><div class="sheet-details">' + s.details + '</div></td><td style="text-align: center;"><span class="' + statusClass + '">' + statusText + '</span></td><td style="text-align: center;"><button class="delete-btn" onclick="deleteSub(\\\'' + s.id + '\\\')">Delete</button></td></tr>';
                        });
                    });
                }

                function deleteSub(id) {
                    if(!confirm('Are you sure you want to delete this ID?')) return;
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

// ==================== ২. অ্যাডমিন প্যানেল (লিঙ্ক: /admin) ====================
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Google Sheet Style Admin Panel</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background: white; width: 100%; max-width: 420px; padding: 40px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); }
                h2 { text-align: center; color: #111827; margin-bottom: 25px; font-weight: 700; }
                input { width: 100%; padding: 14px 18px; margin-bottom: 18px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; background: #f9fafb; outline: none; transition: 0.3s; }
                input:focus { border-color: #107c41; background: #fff; box-shadow: 0 0 0 4px rgba(16, 124, 65, 0.1); }
                .btn { background: linear-gradient(135deg, #107c41, #0b5c31); color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; width: 100%; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(16, 124, 65, 0.3); }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 124, 65, 0.4); }
                .hidden { display: none !important; }

                /* Google Sheet Style Admin Container */
                .admin-container { max-width: 1300px !important; width: 95% !important; padding: 30px !important; }
                .sheet-scroll-box { max-height: 600px; overflow-y: auto; overflow-x: auto; border: 1px solid #d1d5db; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); background: white; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 950px; background: white; }
                th, td { border: 1px solid #d1d5db; padding: 12px 16px; text-align: left; white-space: nowrap; }
                th { background: #107c41; color: white; font-weight: 600; text-align: center; position: sticky; top: 0; z-index: 10; }
                td { background: #ffffff; color: #1f2937; }
                tr:nth-child(even) td { background: #f8fafc; }
                
                .sheet-details { max-width: 500px; overflow-x: auto; overflow-y: hidden; white-space: nowrap; font-family: monospace; background: #fdfdfd; padding: 6px; border-radius: 4px; border: 1px solid #eee; }
                .sheet-details::-webkit-scrollbar { height: 6px; }
                .sheet-details::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .received-btn { background: #107c41; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.2s; box-shadow: 0 2px 6px rgba(16,124,65,0.2); }
                .received-btn:hover { background: #0b5c31; transform: scale(1.05); }
                .received-text { color: #107c41; font-weight: bold; text-align: center; display: block; background: #dcfce7; padding: 6px; border-radius: 6px; }

                @media (max-width: 768px) {
                    body { padding: 10px; }
                    .card, .admin-container { padding: 15px !important; }
                }
            </style>
        </head>
        <body>

            <!-- Admin Login -->
            <div class="card" id="admin-login-card">
                <h2>Admin Panel Login</h2>
                <input type="password" id="admin-pass" placeholder="Enter Password (@MYPANEL)">
                <button class="btn" onclick="adminLogin()">LOGIN</button>
            </div>

            <!-- Admin Sheet View -->
            <div class="card admin-container hidden" id="admin-dashboard-card">
                <h2 style="text-align: left; margin-bottom: 15px; color: #107c41;">Google Sheet Format - Submissions</h2>
                <div class="sheet-scroll-box">
                    <table>
                        <thead>
                            <tr>
                                <th>SL</th>
                                <th>Date & Time</th>
                                <th>Telegram Username</th>
                                <th>ID Details</th>
                                <th>Action / Status</th>
                            </tr>
                        </thead>
                        <tbody id="admin-subs-table"></tbody>
                    </table>
                </div>
            </div>

            <script>
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

                function loadAdminSubs() {
                    fetch('/api/admin/submissions')
                    .then(res => res.json())
                    .then(data => {
                        let tbody = document.getElementById('admin-subs-table');
                        tbody.innerHTML = '';
                        data.submissions.forEach((s, index) => {
                            let actionColumn = s.status === 'success' 
                                ? '<span class="received-text">RECEIVED</span>' 
                                : '<button class="received-btn" onclick="markReceived(\\'' + s.id + '\\')">Received</button>';
                            
                            let dateStr = new Date(s.date).toLocaleString();
                            tbody.innerHTML += '<tr><td style="text-align: center; font-weight: 600;">' + (index + 1) + '</td><td>' + dateStr + '</td><td><strong style="color: #4f46e5;">@' + s.username + '</strong></td><td><div class="sheet-details">' + s.details + '</div></td><td style="text-align: center;">' + actionColumn + '</td></tr>';
                        });
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
    const { username, details } = req.body;
    const data = loadData();
    
    const submission = {
        id: Date.now().toString(),
        username,
        details,
        status: 'pending',
        date: new Date().toISOString()
    };

    data.submissions.push(submission);
    saveData(data);
    res.json({ success: true });
});

app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    const data = loadData();
    const userSubs = data.submissions.filter(s => s.username.toLowerCase() === username.toLowerCase());
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
    const data.submissions = data.submissions || [];
    const dataObj = loadData();
    const sub = dataObj.submissions.find(s => s.id === id);
    if(sub) {
        sub.status = 'success';
        saveData(dataObj);
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
