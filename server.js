const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// JSON File Helper Functions
const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

const writeJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Auto-initialize files if not exists
if (!fs.existsSync('./users.json')) {
    writeJSON('./users.json', [{ username: "turzokhan59", balance: 220.00, withdrawHistory: [] }]);
}
if (!fs.existsSync('./adminRequests.json')) {
    writeJSON('./adminRequests.json', []);
}

// ------------------------------------
// 1. API: Get User Details
// ------------------------------------
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const users = readJSON('./users.json');
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
        success: true,
        balance: user.balance || 0,
        withdrawHistory: user.withdrawHistory || []
    });
});

// ------------------------------------
// 2. API: Handle Withdraw Request
// ------------------------------------
app.post('/api/withdraw', (req, res) => {
    const { username, method, phone, amount } = req.body;
    const withdrawAmount = parseFloat(amount);

    let users = readJSON('./users.json');
    let userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    let user = users[userIndex];

    // Validation Check
    if (!phone || phone.trim() === "") {
        return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (user.balance < withdrawAmount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // ১. ব্যালেন্স কাটা
    user.balance -= withdrawAmount;

    // ২. নতুন অবজেক্ট রেডি করা
    const withdrawRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        method: method,
        phone: phone,
        amount: withdrawAmount,
        status: "Pending"
    };

    // ৩. ইউজারের নিজস্ব History আপডেট
    if (!user.withdrawHistory) user.withdrawHistory = [];
    user.withdrawHistory.unshift(withdrawRecord);

    // ৪. Admin Panel List আপডেট
    let adminRequests = readJSON('./adminRequests.json');
    adminRequests.unshift({
        id: withdrawRecord.id,
        date: withdrawRecord.date,
        username: user.username,
        methodPhone: `${method} - ${phone}`,
        amount: withdrawAmount,
        status: "Pending"
    });

    // ডাটা সেভ
    writeJSON('./users.json', users);
    writeJSON('./adminRequests.json', adminRequests);

    res.json({
        success: true,
        message: "Withdraw request sent successfully",
        newBalance: user.balance,
        history: user.withdrawHistory
    });
});

// ------------------------------------
// 3. UI Dashboard Rendering (Single Page)
// ------------------------------------
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdraw Dashboard</title>
        <style>
            * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { background-color: #0b0f19; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #151c2c; padding: 30px; border-radius: 16px; width: 100%; max-width: 550px; border: 1px solid #222e47; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #222e47; padding-bottom: 15px; }
            .header h2 { margin: 0; font-size: 20px; color: #e2e8f0; }
            .balance { background: #064e3b; color: #34d399; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 16px; border: 1px solid #059669; }
            .form-group { margin-bottom: 18px; }
            label { display: block; margin-bottom: 8px; font-size: 11px; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; }
            input, select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #2a3854; background: #0b0f19; color: white; outline: none; transition: 0.3s; }
            input:focus, select:focus { border-color: #6366f1; }
            button { width: 100%; padding: 12px; background: #6366f1; border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; margin-top: 10px; transition: 0.2s; }
            button:hover { background: #4f46e5; }
            table { width: 100%; margin-top: 15px; border-collapse: collapse; text-align: left; }
            th, td { padding: 12px; border-bottom: 1px solid #222e47; font-size: 13px; }
            th { color: #64748b; font-weight: 600; }
            .status-pending { color: #fbbf24; font-weight: 600; }
        </style>
    </head>
    <body>

    <div class="card">
        <div class="header">
            <h2>Welcome, <span style="color:#818cf8;">Turzo Khan</span></h2>
            <div class="balance" id="userBalance">৳0.00</div>
        </div>

        <h3 style="margin-top:0; font-size: 18px;">Payment / Withdraw Request</h3>
        <p style="font-size: 12px; color: #64748b; margin-top: -8px; margin-bottom: 20px;">Request a payout to your mobile banking account.</p>

        <form id="withdrawForm">
            <div class="form-group">
                <label>SELECT PAYMENT METHOD</label>
                <select id="paymentMethod">
                    <option value="Bkash">Bkash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                </select>
            </div>

            <div class="form-group">
                <label>PHONE NUMBER</label>
                <input type="text" id="phoneNumber" placeholder="017xxxxxxxx" required>
            </div>

            <div class="form-group">
                <label>AMOUNT (BDT)</label>
                <input type="number" id="withdrawAmount" placeholder="0.00" min="1" step="any" required>
            </div>

            <button type="submit" id="submitBtn">Send Request</button>
        </form>

        <h3 style="margin-top: 35px; font-size: 16px;">Your Withdrawal History</h3>
        <table>
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Method</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="withdrawHistoryBody"></tbody>
        </table>
    </div>

    <script>
        const CURRENT_USER = "turzokhan59";

        async function loadUserData() {
            try {
                const res = await fetch(\`/api/user/\${CURRENT_USER}\`);
                const data = await res.json();
                if (data.success) {
                    document.getElementById('userBalance').innerText = \`৳\${data.balance.toFixed(2)}\`;
                    renderHistory(data.withdrawHistory);
                }
            } catch (err) {
                console.error("Data load error:", err);
            }
        }

        function renderHistory(history) {
            const tbody = document.getElementById('withdrawHistoryBody');
            tbody.innerHTML = '';

            if (!history || history.length === 0) {
                tbody.innerHTML = \`<tr><td colspan="5" style="text-align:center; color:#64748b;">No withdrawal history found.</td></tr>\`;
                return;
            }

            history.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${item.date}</td>
                    <td>\${item.method}</td>
                    <td>\${item.phone}</td>
                    <td>৳\${parseFloat(item.amount).toFixed(2)}</td>
                    <td><span class="status-pending">\${item.status}</span></td>
                \`;
                tbody.appendChild(row);
            });
        }

        document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const method = document.getElementById('paymentMethod').value;
            const phone = document.getElementById('phoneNumber').value;
            const amount = document.getElementById('withdrawAmount').value;

            try {
                const res = await fetch('/api/withdraw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: CURRENT_USER, method, phone, amount })
                });

                const data = await res.json();

                if (data.success) {
                    alert('Withdrawal request submitted!');
                    document.getElementById('userBalance').innerText = \`৳\${data.newBalance.toFixed(2)}\`;
                    renderHistory(data.history);
                    document.getElementById('phoneNumber').value = '';
                    document.getElementById('withdrawAmount').value = '';
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert("Failed to send request.");
            }
        });

        loadUserData();
    </script>
    </body>
    </html>
    `);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
