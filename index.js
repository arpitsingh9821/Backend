const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/Config/dbconfig"); 
const portfolioRoutes = require("./src/Routes/PortfolioRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Connect to the database
connectDB();

// Routes
app.use("/api", portfolioRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
