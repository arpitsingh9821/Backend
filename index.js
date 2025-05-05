const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/Config/dbconfig"); 
const portfolioRoutes = require("./src/Routes/PortfolioRoutes");

dotenv.config();
const app = express();

// Parse JSON bodies
app.use(express.json());

// Fix CORS error when using credentials
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Connect to the database
connectDB();

// Routes
app.use("/api", portfolioRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
