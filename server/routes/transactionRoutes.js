const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Add a new transaction
router.post("/", async (req, res) => {
    try {
        const transaction = new Transaction(req.body);

        const savedTransaction = await transaction.save();

        res.status(201).json(savedTransaction);

    } catch (error) {
        res.status(400).json({
            message: "Failed to add transaction",
            error: error.message
        });
    }
});

// Get all transactions
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });

        res.json(transactions);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get transactions",
            error: error.message
        });
    }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
            req.params.id
        );

        if (!deletedTransaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete transaction",
            error: error.message
        });
    }
});

// Update a transaction
router.put("/:id", async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTransaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json(updatedTransaction);

    } catch (error) {
        res.status(400).json({
            message: "Failed to update transaction",
            error: error.message
        });
    }
});

module.exports = router;