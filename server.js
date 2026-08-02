const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to read data.json safely
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = { users: [], submissions: [], categories: [] };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { users: [], submissions: [], categories: [] };
    }
}

// Helper to write data.json safely
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API endpoints for persistence
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/api/data', (req, res) => {
    try {
        writeData(req.body);
        res.json({ success: true, message: 'Data updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Single-File Frontend Route (HTML + CSS + JS)
app.get('*', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ID Submission & Payment Portal</title>
    <style>
        :root {
            --bg-color: #0d1117;
            --card-bg: #161b22;
            --border-color: #30363d;
            --text-primary: #f0f6fc;
            --text-secondary: #8b949e;
            --accent-blue: #3b82f6;
            --accent-blue-hover: #2563eb;
            --danger: #ef4444;
            --success: #10b981;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 850px;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .user-info h2 {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 5px;
        }

        .user-info p {
            color: var(--text-secondary);
            font-size: 14px;
        }

        .balance-badge {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: var(--success);
            padding: 10px 18px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .nav-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }

        .tab-btn {
            background-color: #21262d;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .tab-btn:hover {
            background-color: #30363d;
        }

        .tab-btn.active {
            background-color: var(--accent-blue);
            border-color: var(--accent-blue);
            color: white;
        }

        .content-section {
            display: none;
        }

        .content-section.active {
            display: block;
        }

        h3.section-title {
            font-size: 18px;
            margin-bottom: 10px;
            color: var(--text-primary);
        }

        p.section-desc {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 20px;
        }

        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }

        .category-card {
            background-color: #21262d;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }

        .category-card:hover {
            border-color: var(--accent-blue);
            transform: translateY(-2px);
        }

        .category-card.selected {
            border-color: var(--accent-blue);
            background: rgba(59, 130, 246, 0.1);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: var(--text-secondary);
        }

        .form-control {
            width: 100%;
            padding: 12px 15px;
            background-color: #0d1117;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 14px;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--accent-blue);
        }

        .btn-primary {
            background-color: var(--accent-blue);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
        }

        .btn-primary:hover {
            background-color: var(--accent-blue-hover);
        }

        .btn-danger {
            background-color: var(--danger);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
        }

        .footer-action {
            margin-top: 30px;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid var(--success);
            color: var(--success);
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            font-size: 14px;
            display: none;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header-section">
            <div class="user-info">
                <h2 id="userNameDisplay">Welcome, Turzo Khan</h2>
                <p>Telegram: <span id="userTelegramDisplay">@turzokhan59</span></p>
            </div>
            <div class="balance-badge">
                💰 Balance: <span id="userBalanceDisplay">৳0.00</span>
            </div>
        </div>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('submitTab', event)">🎮 Submit IDs</button>
            <button class="tab-btn" onclick="switchTab('checkerTab', event)">🔍 UID Checker & Auto Claim</button>
            <button class="tab-btn" onclick="switchTab('withdrawTab', event)">💸 Withdraw / Payment</button>
        </div>

        <div id="submitTab" class="content-section active">
            <h3 class="section-title">Select Category to Submit ID</h3>
            <p class="section-desc">Choose a category below to proceed with your submission.</p>
            
            <div class="category-grid">
                <div class="category-card" onclick="selectCategory('Instagram 2FA', this)">
                    <h4>📸 Instagram 2FA</h4>
                    <p>Submit secure 2FA accounts</p>
                </div>
                <div class="category-card" onclick="selectCategory('Facebook/Hotmail Cookies', this)">
                    <h4>🍪 FB / Hotmail Cookies</h4>
                    <p>Submit active browser cookies</p>
                </div>
            </div>

            <div id="submissionFormArea" style="display: none;">
                <div class="form-group">
                    <label id="selectedCategoryLabel">Enter Submission Data:</label>
                    <input type="text" id="submissionInputId" class="form-control" placeholder="Paste ID / Token / Data here...">
                </div>
                <button class="btn-primary" onclick="submitUserGameId()">Submit Now</button>
                <div id="submitAlert" class="alert-success">ID submitted successfully! Balance updated.</div>
            </div>
        </div>

        <div id="checkerTab" class="content-section">
            <h3 class="section-title">UID Checker & Auto Claim</h3>
            <p class="section-desc">Verify your UID status instantly and claim available rewards.</p>
            <div class="form-group">
                <label>Enter UID to Check:</label>
                <input type="text" id="checkUidInput" class="form-control" placeholder="Enter UID...">
            </div>
            <button class="btn-primary" onclick="checkUidStatus()">Check & Claim</button>
            <div id="checkerResult" style="margin-top: 15px; font-size: 14px;"></div>
        </div>

        <div id="withdrawTab" class="content-section">
            <h3 class="section-title">Withdraw / Payment Request</h3>
            <p class="section-desc">Request payouts directly to your bKash, Nagad, or Rocket account.</p>
            <div class="form-group">
                <label>Select Payment Method:</label>
                <select class="form-control" id="payMethod">
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                </select>
            </div>
            <div class="form-group">
                <label>Account Number:</label>
                <input type="text" id="payNumber" class="form-control" placeholder="01XXXXXXXXX">
            </div>
            <div class="form-group">
                <label>Amount (BDT):</label>
                <input type="number" id="payAmount" class="form-control" placeholder="0.00">
            </div>
            <button class="btn-primary" onclick="requestWithdrawal()">Confirm Withdrawal</button>
            <div id="withdrawAlert" class="alert-success">Withdrawal request submitted successfully!</div>
        </div>

        <div class="footer-action">
            <button class="btn-danger" onclick="logoutUser()">Logout</button>
        </div>
    </div>

    <script>
        const AppState = {
            user: {
                name: "Turzo Khan",
                telegram: "@turzokhan59",
                balance: parseFloat(localStorage.getItem('user_balance')) || 0.00
            },
            selectedCategory: localStorage.getItem('selected_category') || null,
            activeTab: localStorage.getItem('active_tab') || 'submitTab'
        };

        window.addEventListener('DOMContentLoaded', () => {
            updateBalanceDisplay();

            if (AppState.activeTab) {
                const tabBtn = document.querySelector(\`[onclick*="\${AppState.activeTab}"]\`);
                if (tabBtn) {
                    switchTab(AppState.activeTab, {currentTarget: tabBtn}, false);
                }
            }

            if (AppState.selectedCategory) {
                document.querySelectorAll('.category-card').forEach(card => {
                    if (card.querySelector('h4').innerText.includes(AppState.selectedCategory)) {
                        card.classList.add('selected');
                        document.getElementById('submissionFormArea').style.display = 'block';
                        document.getElementById('selectedCategoryLabel').innerText = \`Enter \${AppState.selectedCategory}:\`;
                    }
                });
            }
        });

        function updateBalanceDisplay() {
            document.getElementById('userBalanceDisplay').innerText = \`৳\${AppState.user.balance.toFixed(2)}\`;
            localStorage.setItem('user_balance', AppState.user.balance);
        }

        function switchTab(tabId, event, save = true) {
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

            document.getElementById(tabId).classList.add('active');
            if (event && event.currentTarget) {
                event.currentTarget.classList.add('active');
            }

            if (save) {
                AppState.activeTab = tabId;
                localStorage.setItem('active_tab', tabId);
            }
        }

        function selectCategory(categoryName, element) {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
            element.classList.add('selected');

            AppState.selectedCategory = categoryName;
            localStorage.setItem('selected_category', categoryName);

            document.getElementById('submissionFormArea').style.display = 'block';
            document.getElementById('selectedCategoryLabel').innerText = \`Enter \${categoryName}:\`;
        }

        function submitUserGameId() {
            const inputVal = document.getElementById('submissionInputId').value.trim();
            if(!inputVal) {
                alert('দয়া করে আপনার আইডি বা কুকি লিখুন!');
                return;
            }

            AppState.user.balance += 50.00;
            updateBalanceDisplay();

            const alertBox = document.getElementById('submitAlert');
            alertBox.style.display = 'block';
            setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
            document.getElementById('submissionInputId').value = '';
        }

        function checkUidStatus() {
            const uid = document.getElementById('checkUidInput').value.trim();
            const resBox = document.getElementById('checkerResult');
            if(!uid) {
                resBox.innerText = 'দয়া করে চেক করার জন্য UID দিন।';
                resBox.style.color = 'var(--danger)';
                return;
            }
            resBox.style.color = 'var(--success)';
            resBox.innerText = \`UID (\${uid}) সফলভাবে লাইভ পাওয়া গেছে এবং রিওয়ার্ড যোগ করা হয়েছে!\`;
            AppState.user.balance += 20.00;
            updateBalanceDisplay();
        }

        function requestWithdrawal() {
            const num = document.getElementById('payNumber').value.trim();
            const amt = parseFloat(document.getElementById('payAmount').value) || 0;
            const wAlert = document.getElementById('withdrawAlert');

            if(!num || amt <= 0) {
                alert('সঠিক অ্যাকাউন্ট নম্বর এবং পরিমাণ দিন!');
                return;
            }
            if(amt > AppState.user.balance) {
                alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
                return;
            }

            AppState.user.balance -= amt;
            updateBalanceDisplay();

            wAlert.style.display = 'block';
            setTimeout(() => { wAlert.style.display = 'none'; }, 3000);
            document.getElementById('payNumber').value = '';
            document.getElementById('payAmount').value = '';
        }

        function logoutUser() {
            if(confirm('আপনি কি সত্যিই লগআউট করতে চান?')) {
                localStorage.clear();
                alert('লগআউট সফল হয়েছে!');
                location.reload();
            }
        }
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
