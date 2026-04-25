const express = require("express");
const router = express.Router();
const Board = require("../models/Board");
const Task = require("../models/Task");
const protect = require("../middleware/auth");

// All board routes are protected
router.use(protect);

// @route GET /api/boards
router.get("/", async (req, res) => {
    try {
        const boards = await Board.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(boards);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/boards
router.post("/", async (req, res) => {
    const { name, emoji } = req.body;
    if (!name) return res.status(400).json({ message: "Board name is required" });

    try {
        const board = await Board.create({
            name,
            emoji: emoji || "📋",
            userId: req.user.id,
        });
        res.status(201).json(board);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// @route DELETE /api/boards/:id
router.delete("/:id", async (req, res) => {
    try {
        const board = await Board.findOne({ _id: req.params.id, userId: req.user.id });
        if (!board) return res.status(404).json({ message: "Board not found" });

        await Task.deleteMany({ boardId: req.params.id });
        await board.deleteOne();

        res.json({ message: "Board deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;