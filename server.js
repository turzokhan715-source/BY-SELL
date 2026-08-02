const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

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

// యూজার প্যানেল পেজ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// অ্যাডমিন প্যানেল পেজ
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Endpoints
app.post('/api/login', (req, res) => {
    let { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username required' });
    
    username = username.trim().replace(/^@/, '');
    const data = loadData();
    let user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
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
