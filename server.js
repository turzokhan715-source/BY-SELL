require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 10000;

// ==============================
// Middlewares
// ==============================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    session({
        secret: "premium_panel_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// ==============================
// Static Files
// ==============================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// ==============================
// Database File
// ==============================

const DB = path.join(__dirname, "data.json");

function loadDB() {

    if (!fs.existsSync(DB)) {

        const data = {

            users: [],
            submissions: [],
            withdrawals: [],
            reports: [],
            categories: [],
            settings: {}

        };

        fs.writeFileSync(DB, JSON.stringify(data, null, 2));
    }

    return JSON.parse(fs.readFileSync(DB));

}

function saveDB(data) {

    fs.writeFileSync(DB, JSON.stringify(data, null, 2));

}

// ==============================
// Routes
// ==============================

app.get("/", (req, res) => {

    res.render("index");

});

app.get("/dashboard", (req, res) => {

    res.render("dashboard");

});

app.get("/admin", (req, res) => {

    res.render("admin");

});

// এখানে পরে User API,
// Admin API,
// Payment API,
// UID Checker,
// Report System,
// Balance System,
// Login/Register
// সব যোগ করা হবে।

// ==============================

app.listen(PORT, () => {

    console.log(`Server Running : http://localhost:${PORT}`);

});
