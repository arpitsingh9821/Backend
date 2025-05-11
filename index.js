const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/Config/dbconfig");
const portfolioRoutes = require("./src/Routes/PortfolioRoutes");
const profileRoutes = require("./src/Routes/profile");
const session = require("express-session");

dotenv.config();
const app = express();

// ✅ Use cors before session and routes
app.use(cors({
    origin: 'https://ascms.netlify.app',
    credentials: true
}));

// ✅ Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Express session
app.use(session({
    secret: '1Lto5OXd4LxjVv9O',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production", // true only in production
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    }
}));

// ✅ Connect to DB
connectDB();

// ✅ Routes
app.use("/api", portfolioRoutes);
app.use("/api", profileRoutes);

// ✅ Health check route
app.get("/api/test", (req, res) => {
    res.status(200).json({ message: "Backend is running!" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
