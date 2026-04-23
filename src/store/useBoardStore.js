import { create } from "zustand";

// ── Initial fake data (same as before, now centralized) ──
const initialBoards = [
    { id: 1, name: "Project Alpha", emoji: "🚀", tasks: 7, members: 2, progress: 60 },
    { id: 2, name: "Job Prep Board", emoji: "💼", tasks: 5, members: 1, progress: 30 },
    { id: 3, name: "Portfolio Site", emoji: "🎨", tasks: 4, members: 1, progress: 75 },
];

const initialTasks = {
    1: {
        Todo: [
            { id: "1", title: "Design login page layout", tag: "UI Design", priority: "High", due: "Apr 10", comments: 3, progress: 45 },
            { id: "2", title: "Setup Express routes for auth", tag: "Backend", priority: "Medium", due: "Apr 14", comments: 1, progress: 20 },
            { id: "3", title: "Add Tailwind base styles", tag: "Frontend", priority: "Low", due: "Apr 15", comments: 0, progress: 0 },
        ],
        "In Progress": [
            { id: "4", title: "Build Kanban board UI with drag and drop", tag: "UI Design", priority: "High", due: "Apr 12", comments: 5, progress: 75 },
            { id: "5", title: "Design MongoDB schema for tasks", tag: "Database", priority: "Medium", due: "Apr 13", comments: 2, progress: 30 },
        ],
        Done: [
            { id: "6", title: "Initialize React + Vite project", tag: "Setup", priority: "Low", due: "Apr 1", comments: 0, progress: 100 },
            { id: "7", title: "Setup Tailwind CSS config", tag: "Config", priority: "Low", due: "Apr 2", comments: 1, progress: 100 },
        ],
    },
    2: {
        Todo: [
            { id: "8", title: "Update resume with new projects", tag: "Career", priority: "High", due: "Apr 20", comments: 0 },
            { id: "9", title: "Apply to 5 companies this week", tag: "Career", priority: "High", due: "Apr 21", comments: 0 },
        ],
        "In Progress": [
            { id: "10", title: "Prepare system design notes", tag: "Study", priority: "Medium", due: "Apr 18", comments: 1 },
        ],
        Done: [
            { id: "11", title: "Setup LinkedIn profile", tag: "Career", priority: "Low", due: "Apr 5", comments: 0 },
        ],
    },
    3: {
        Todo: [
            { id: "12", title: "Design portfolio homepage", tag: "UI Design", priority: "High", due: "Apr 25", comments: 0 },
            { id: "13", title: "Write about me section", tag: "Content", priority: "Medium", due: "Apr 26", comments: 0 },
        ],
        "In Progress": [
            { id: "14", title: "Setup Next.js project", tag: "Frontend", priority: "Medium", due: "Apr 22", comments: 2 },
        ],
        Done: [],
    },
};

const initialActivity = [
    { id: 1, initials: "AS", color: "#a855f7", text: "Moved Design login page to In Progress", time: "2m ago" },
    { id: 2, initials: "AS", color: "#ec4899", text: "Added comment on Kanban UI task", time: "18m ago" },
    { id: 3, initials: "AS", color: "#3b82f6", text: "Created task Setup MongoDB schema", time: "1h ago" },
    { id: 4, initials: "AS", color: "#22c55e", text: "Completed Tailwind CSS config", time: "3h ago" },
    { id: 5, initials: "AS", color: "#f97316", text: "Created board Job Prep Board", time: "1d ago" },
];

const useBoardStore = create((set, get) => ({
    // ── State ──
    boards: initialBoards,
    tasks: initialTasks,
    activity: initialActivity,

    // ── Board actions ──
    addBoard: (name, emoji) => {
        const newBoard = {
            id: Date.now(),
            name,
            emoji,
            tasks: 0,
            members: 1,
            progress: 0,
        };
        const emptyTasks = { Todo: [], "In Progress": [], Done: [] };
        set((state) => ({
            boards: [...state.boards, newBoard],
            tasks: { ...state.tasks, [newBoard.id]: emptyTasks },
        }));
    },

    deleteBoard: (boardId) => {
        set((state) => {
            const newTasks = { ...state.tasks };
            delete newTasks[boardId];
            return {
                boards: state.boards.filter((b) => b.id !== boardId),
                tasks: newTasks,
            };
        });
    },

    // ── Task actions ──
    addTask: (boardId, column, taskData) => {
        const newTask = {
            ...taskData,
            id: Date.now().toString(),
        };
        set((state) => ({
            tasks: {
                ...state.tasks,
                [boardId]: {
                    ...state.tasks[boardId],
                    [column]: [...state.tasks[boardId][column], newTask],
                },
            },
            // update task count on board
            boards: state.boards.map((b) =>
                b.id === boardId ? { ...b, tasks: b.tasks + 1 } : b
            ),
            // add to activity
            activity: [
                { id: Date.now(), initials: "AS", color: "#a855f7", text: `Created task "${taskData.title}"`, time: "just now" },
                ...state.activity.slice(0, 9),
            ],
        }));
    },

    deleteTask: (boardId, column, taskId) => {
        set((state) => ({
            tasks: {
                ...state.tasks,
                [boardId]: {
                    ...state.tasks[boardId],
                    [column]: state.tasks[boardId][column].filter((t) => t.id !== taskId),
                },
            },
            boards: state.boards.map((b) =>
                b.id === boardId ? { ...b, tasks: Math.max(0, b.tasks - 1) } : b
            ),
        }));
    },

    moveTask: (boardId, taskId, sourceCol, destCol) => {
        if (sourceCol === destCol) return;
        const state = get();
        const boardTasks = state.tasks[boardId];
        const draggedTask = boardTasks[sourceCol].find((t) => t.id === taskId);
        if (!draggedTask) return;

        set((state) => ({
            tasks: {
                ...state.tasks,
                [boardId]: {
                    ...state.tasks[boardId],
                    [sourceCol]: state.tasks[boardId][sourceCol].filter((t) => t.id !== taskId),
                    [destCol]: [...state.tasks[boardId][destCol], draggedTask],
                },
            },
            activity: [
                { id: Date.now(), initials: "AS", color: "#a855f7", text: `Moved "${draggedTask.title}" to ${destCol}`, time: "just now" },
                ...state.activity.slice(0, 9),
            ],
        }));
    },
}));

export default useBoardStore;