const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Board = require("../models/Board");
const protect = require("../middleware/auth");

router.use(protect);

// @route GET /api/tasks/:boardId
router.get("/:boardId", async (req, res) => {
    try {
        const board = await Board.findOne({ _id: req.params.boardId, userId: req.user.id });
        if (!board) return res.status(404).json({ message: "Board not found" });

        const tasks = await Task.find({ boardId: req.params.boardId }).sort({ createdAt: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/tasks
router.post("/", async (req, res) => {
    const { title, description, tag, priority, column, due, progress, boardId } = req.body;

    if (!title || !boardId) {
        return res.status(400).json({ message: "Title and boardId are required" });
    }

    try {
        const board = await Board.findOne({ _id: boardId, userId: req.user.id });
        if (!board) return res.status(404).json({ message: "Board not found" });

        const task = await Task.create({
            title,
            description: description || "",
            tag: tag || "UI Design",
            priority: priority || "Medium",
            column: column || "Todo",
            due: due || "",
            progress: progress || 0,
            boardId,
            userId: req.user.id,
        });

        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// @route PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });

        const updates = req.body;
        Object.assign(task, updates);
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// @route DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });

        await task.deleteOne();
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;