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
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background: white; width: 100%; max-width: 450px; padding: 35px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); box-sizing: border-box; }
                .icon-box { width: 50px; height: 50px; background: #4f46e5; border-radius: 12px; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; color: white; font-size: 24px; }
                h2 { text-align: center; color: #111827; margin-bottom: 5px; }
                p.subtitle { text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 25px; }
                label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; text-transform: uppercase; }
                input, textarea { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 10px; box-sizing: border-box; font-size: 14px; background: #f9fafb; outline: none; transition: 0.3s; }
                input:focus, textarea:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .btn { background: #4f46e5; color: white; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: 0.3s; }
                .btn:hover { background: #4338ca; }
                .switch-text { text-align: center; margin-top: 20px; font-size: 13px; color: #6b7280; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
                .switch-text:hover { color: #4f46e5; }
                .hidden { display: none !important; }
                
                /* Dashboard Table */
                .dashboard-container { max-width: 800px !important; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: center; font-size: 14px; }
                th { background: #f9fafb; color: #374151; }
                .status-pending { color: #d97706; font-weight: bold; background: #fef3c7; padding: 4px 8px; border-radius: 6px; display: inline-block; }
                .status-success { color: #16a34a; font-weight: bold; background: #dcfce7; padding: 4px 8px; border-radius: 6px; display: inline-block; }
                .logout-btn { background: #ef4444; margin-top: 15px; }
                .logout-btn:hover { background: #dc2626; }
            </style>
        </head>
        <body>

            <!-- Login View -->
            <div class="card" id="login-card">
                <div class="icon-box">🛡️</div>
                <h2>Welcome</h2>
                <p class="subtitle">Login to your account</p>
                
                <label>Email Address</label>
                <input type="email" id="login-email" placeholder="name@example.com">
                
                <label>Password</label>
                <input type="password" id="login-pass" placeholder="••••••••">
                
                <button class="btn" onclick="loginUser()">LOGIN NOW</button>
                <div class="switch-text" onclick="showRegister()">Don't have an account? Register</div>
            </div>

            <!-- Register View -->
            <div class="card hidden" id="register-card">
                <div class="icon-box">👤+</div>
                <h2>New Account</h2>
                <p class="subtitle">Fill in the details to get started</p>
                
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

            <!-- User Dashboard -->
            <div class="card dashboard-container hidden" id="dashboard-card">
                <h2>Welcome, <span id="user-display-name" style="color: #4f46e5;"></span></h2>
                <p class="subtitle">Telegram: <span id="user-display-tg"></span></p>
                
                <label>Submit ID Details</label>
                <textarea id="id-details" rows="3" placeholder="Enter ID details here..."></textarea>
                <button class="btn" onclick="submitId()">Submit</button>

                <h3 style="margin-top: 30px; color: #111827;">Submission History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Details</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="user-subs-table"></tbody>
                </table>
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
                            tbody.innerHTML += \`<tr>
                                <td>\${new Date(s.date).toLocaleString()}</td>
                                <td>\${s.details}</td>
                                <td><span class="\${statusClass}">\${statusText}</span></td>
                            </tr>\`;
                        });
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
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background: white; width: 100%; max-width: 400px; padding: 35px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); box-sizing: border-box; }
                h2 { text-align: center; color: #111827; margin-bottom: 20px; }
                input { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 10px; box-sizing: border-box; font-size: 14px; background: #f9fafb; outline: none; }
                .btn { background: #4f46e5; color: white; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: 0.3s; }
                .btn:hover { background: #4338ca; }
                .hidden { display: none !important; }

                /* Google Sheet Table Style */
                .admin-container { max-width: 950px !important; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
                th, td { border: 1px solid #d1d5db; padding: 10px 15px; text-align: left; }
                th { background: #107c41; color: white; font-weight: 600; text-align: center; } /* Google Sheet Green Theme */
                td { background: #ffffff; color: #1f2937; }
                tr:nth-child(even) td { background: #f8fafc; }
                .received-btn { background: #107c41; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600; }
                .received-btn:hover { background: #0b5c31; }
                .received-text { color: #107c41; font-weight: bold; text-align: center; display: block; }
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
                <h2>Google Sheet Format - Submissions</h2>
                <div style="overflow-x: auto;">
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
                                : \`<button class="received-btn" onclick="markReceived('\${s.id}')">Received</button>\`;
                            
                            tbody.innerHTML += \`<tr>
                                <td style="text-align: center;">\${index + 1}</td>
                                <td>\${new Date(s.date).toLocaleString()}</td>
                                <td><strong>@\${s.username}</strong></td>
                                <td>\${s.details}</td>
                                <td style="text-align: center;">\${actionColumn}</td>
                            </tr>\`;
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
