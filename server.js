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

// ১. ইউজার প্যানেল (মূল লিঙ্ক: /)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Panel - ID Submission</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 30px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                input, textarea { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
                button { background: #4f46e5; color: white; border: none; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; }
                button:hover { background: #4338ca; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 14px; }
                th { background: #f9fafb; }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-success { color: #16a34a; font-weight: bold; }
                .hidden { display: none !important; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style="text-align: center; color: #1f2937;">ID Submission System</h2>
                
                <div id="login-section">
                    <h3>Telegram Login</h3>
                    <input type="text" id="username" placeholder="Enter Telegram Username (e.g., @username)">
                    <button onclick="loginUser()">Login</button>
                </div>

                <div id="dashboard-section" class="hidden">
                    <h3>Welcome, <span id="display-user" style="color: #4f46e5;"></span></h3>
                    <h4>Submit Your ID Details</h4>
                    <textarea id="id-details" rows="4" placeholder="Enter ID details here..."></textarea>
                    <button onclick="submitId()">Submit</button>
                    
                    <h3 style="margin-top: 30px;">Your Submissions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody id="user-subs-table"></tbody>
                    </table>
                </div>
            </div>

            <script>
                let currentUser = null;

                function loginUser() {
                    let val = document.getElementById('username').value.trim();
                    if(!val) return alert('Please enter username');
                    fetch('/api/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username: val})
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            currentUser = data.user.username;
                            document.getElementById('display-user').innerText = '@' + currentUser;
                            document.getElementById('login-section').classList.add('hidden');
                            document.getElementById('dashboard-section').classList.remove('hidden');
                            loadUserSubs();
                        }
                    });
                }

                function submitId() {
                    let details = document.getElementById('id-details').value.trim();
                    if(!details) return alert('Enter details');
                    fetch('/api/submit', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username: currentUser, details})
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
                    fetch('/api/user/' + currentUser)
                    .then(res => res.json())
                    .then(data => {
                        let tbody = document.getElementById('user-subs-table');
                        tbody.innerHTML = '';
                        data.submissions.forEach(s => {
                            tbody.innerHTML += \`<tr>
                                <td>\${s.details}</td>
                                <td class="status-\${s.status}">\${s.status.toUpperCase()}</td>
                                <td>\${new Date(s.date).toLocaleString()}</td>
                            </tr>\`;
                        });
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// ২. অ্যাডমিন প্যানেল (আলাদা লিঙ্ক: /admin)
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Panel - ID Submission</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; }
                .container { max-width: 800px; margin: 30px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
                button { background: #4f46e5; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 14px; }
                button:hover { background: #4338ca; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 14px; }
                th { background: #f9fafb; }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-success { color: #16a34a; font-weight: bold; }
                .hidden { display: none !important; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style="text-align: center; color: #1f2937;">Admin Management Panel</h2>
                
                <div id="admin-login-section">
                    <h3>Admin Login</h3>
                    <input type="password" id="admin-pass" placeholder="Enter Admin Password">
                    <button onclick="adminLogin()" style="width: 100%;">Login</button>
                </div>

                <div id="admin-dashboard-section" class="hidden">
                    <h3>All Submissions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="admin-subs-table"></tbody>
                    </table>
                </div>
            </div>

            <script>
                function adminLogin() {
                    let pass = document.getElementById('admin-pass').value;
                    if(pass === '@MYPANEL') {
                        document.getElementById('admin-login-section').classList.add('hidden');
                        document.getElementById('admin-dashboard-section').classList.remove('hidden');
                        loadAdminSubs();
                    } else {
                        alert('Wrong Password!');
                    }
                }

                function loadAdminSubs() {
                    fetch('/api/admin/submissions')
                    .then(res => res.json())
                    .then(data => {
                        let tbody = document.getElementById('admin-subs-table');
                        tbody.innerHTML = '';
                        data.submissions.forEach(s => {
                            let actionBtn = s.status === 'success' ? '<span style="color: green; font-weight: bold;">Received</span>' : \`<button onclick="markReceived('\${s.id}')">Mark Received</button>\`;
                            tbody.innerHTML += \`<tr>
                                <td>@\${s.username}</td>
                                <td>\${s.details}</td>
                                <td class="status-\${s.status}">\${s.status.toUpperCase()}</td>
                                <td>\${actionBtn}</td>
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

// API Endpoints
app.post('/api/login', (req, res) => {
    let { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username required' });
    
    username = username.trim().replace(/^@/, '');
    const data = loadData();
    let user = data.users.users ? data.users.find(u => u.username.toLowerCase() === username.toLowerCase()) : data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        user = { username, createdAt: new Date().toISOString() };
        data.users.push(user);
        saveData(data);
    }
    res.json({ success: true, user });
});

app.post('/api/submit', (req, res) => {
    const { username, details } = req.body;
    if (!username || !details) return res.status(400).json({ success: false, message: 'All fields required' });

    const data = loadData();
    const submission = {
        id: Date.now().toString(),
        username: username.trim().replace(/^@/, ''),
        details,
        status: 'pending',
        date: new Date().toISOString()
    };

    data.submissions.push(submission);
    saveData(data);
    res.json({ success: true, message: 'Submitted successfully' });
});

app.get('/api/user/:username', (req, res) => {
    const username = req.params.username.trim().replace(/^@/, '');
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
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });

    sub.status = 'success';
    saveData(data);
    res.json({ success: true, message: 'Updated to success' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
