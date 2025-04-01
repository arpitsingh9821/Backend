const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/Config/dbconfig"); // ✅ Correct Import
const portfolioRoutes = require("./src/Routes/PortfolioRoutes");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Connect to the database
connectDB();

// Routes
app.use("/api", portfolioRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port http://localhost:${PORT}`));
