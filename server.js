// ==============================
// Login API
// ==============================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const db = loadDB();

    const user = db.users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {

        return res.json({
            success: false,
            message: "Invalid Username or Password"
        });

    }

    req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role || "user"
    };

    res.json({
        success: true
    });

});

// ==============================
// Register API
// ==============================

app.post("/register", (req, res) => {

    const { username, password } = req.body;

    const db = loadDB();

    const exists = db.users.find(
        u => u.username === username
    );

    if (exists) {

        return res.json({
            success: false,
            message: "Username already exists"
        });

    }

    db.users.push({
        id: uuidv4(),
        username,
        password,
        balance: 0,
        role: "user",
        createdAt: new Date().toISOString()
    });

    saveDB(db);

    res.json({
        success: true
    });

});
