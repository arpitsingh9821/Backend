const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/Config/dbconfig");
const portfolioRoutes = require("./src/Routes/PortfolioRoutes");
const profileRoutes = require("./src/Routes/profile");
const session = require('express-session');
dotenv.config();
const app = express();
const router = express.Router();
app.use(express.json());

app.use(session({
    secret: '1Lto5OXd4LxjVv9O',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 7200000
    }
}));

// Configure CORS once with options
app.use(cors({
    origin: 'https://ascms.netlify.app', // Your frontend origin
    credentials: true                // Allow credentials (cookies, sessions)
}));

// ✅ Connect to the database
connectDB();

// Routes
app.use("/api", portfolioRoutes);
app.use("/api", profileRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
