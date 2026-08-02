const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

// Register API
app.post('/api/register', (req, res) => {
    const { firstName, lastName, telegram, email, password } = req.body;
    let data = loadData();
    
    const existing = data.users.find(u => u.email === email || u.telegram === telegram);
    if (existing) {
        return res.json({ success: false, message: 'Email or Telegram username already exists!' });
    }

    data.users.push({ firstName, lastName, telegram, email, password });
    saveData(data);
    res.json({ success: true });
});

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    let data = loadData();

    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, user: { email: user.email, telegram: user.telegram, name: user.firstName } });
    } else {
        res.json({ success: false, message: 'Invalid email or password!' });
    }
});

// Submit ID API
app.post('/api/submit-id', (req, res) => {
    const { email, telegram, content } = req.body;
    let data = loadData();

    const newSub = {
        id: Date.now(),
        email,
        telegram,
        content,
        date: new Date().toLocaleString(),
        status: 'Pending'
    };

    data.submissions.push(newSub);
    saveData(data);
    res.json({ success: true });
});

// Get User History
app.get('/api/history/:email', (req, res) => {
    let data = loadData();
    const userSubs = data.submissions.filter(s => s.email === req.params.email);
    res.json(userSubs);
});

// Admin Get All Submissions
app.get('/api/admin/submissions', (req, res) => {
    let data = loadData();
    res.json(data.submissions);
});

// Admin Mark as Received (Success)
app.post('/api/admin/receive/:id', (req, res) => {
    let data = loadData();
    const subId = Number(req.params.id);
    
    let sub = data.submissions.find(s => s.id === subId);
    if (sub) {
        sub.status = 'Success';
        saveData(data);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
