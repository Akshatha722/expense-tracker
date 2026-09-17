const express = require("express");
const mongoose = require("mongoose");
const transactionRoutes = require("./routes/transactionRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/transactions", transactionRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker API is running!"
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });