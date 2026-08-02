const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));

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

// API endpoint to get system state
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// API endpoint to save data updates
app.post('/api/data', (req, res) => {
    try {
        writeData(req.body);
        res.json({ success: true, message: 'Data updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
