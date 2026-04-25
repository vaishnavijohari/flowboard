const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        tag: {
            type: String,
            default: "UI Design",
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },
        column: {
            type: String,
            enum: ["Todo", "In Progress", "Done"],
            default: "Todo",
        },
        due: {
            type: String,
            default: "",
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        boardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);