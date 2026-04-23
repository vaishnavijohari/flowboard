import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    LogOut,
    Plus,
    X,
    Calendar,
    MessageSquare,
    Search,
    ClipboardList,
} from "lucide-react";
import useBoardStore from "../store/useBoardStore";
import toast, { Toaster } from "react-hot-toast";

// ── Constants ──
const COLUMNS = ["Todo", "In Progress", "Done"];

const tagColors = {
    "UI Design": { bg: "#f3e8ff", text: "#7c3aed" },
    Backend: { bg: "#dbeafe", text: "#1d4ed8" },
    Frontend: { bg: "#dcfce7", text: "#15803d" },
    Database: { bg: "#ffedd5", text: "#c2410c" },
    Setup: { bg: "#dcfce7", text: "#15803d" },
    Config: { bg: "#dbeafe", text: "#1d4ed8" },
    Career: { bg: "#fce7f3", text: "#be185d" },
    Study: { bg: "#e0f2fe", text: "#0369a1" },
    Content: { bg: "#fef9c3", text: "#854d0e" },
};

const priorityStyles = {
    High: { bg: "#fee2e2", text: "#b91c1c" },
    Medium: { bg: "#ffedd5", text: "#c2410c" },
    Low: { bg: "#dcfce7", text: "#15803d" },
};

const colDotColor = {
    Todo: "#94a3b8",
    "In Progress": "#a855f7",
    Done: "#22c55e",
};

const colBgColor = {
    Todo: "#f8fafc",
    "In Progress": "#faf5ff",
    Done: "#f0fdf4",
};

// ── Droppable Column ──
function DroppableColumn({ id, children, bg }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef}
            className="flex flex-col gap-3 flex-1 min-h-[100px] rounded-xl p-2 transition-colors"
            style={{ background: bg || "transparent" }}>
            {children}
        </div>
    );
}

// ── Task Card ──
function TaskCard({ task, column, onDelete, onSelect }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id, data: { column } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };

    const tag = tagColors[task.tag] || { bg: "#f3f4f6", text: "#374151" };
    const pri = priorityStyles[task.priority] || priorityStyles.Low;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-xl border border-gray-100 p-3 cursor-grab active:cursor-grabbing group hover:border-purple-200 hover:shadow-sm transition-all"
            {...attributes}
            {...listeners}
            onClick={() => onSelect && onSelect(task)}
        >
            {/* Tags row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: tag.bg, color: tag.text }}>
                        {task.tag}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: pri.bg, color: pri.text }}>
                        {task.priority}
                    </span>
                </div>
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id, column); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                >
                    <X size={13} />
                </button>
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-gray-800 leading-snug mb-3">{task.title}</p>

            {/* Description preview */}
            {task.description && (
                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{task.description}</p>
            )}

            {/* Progress bar */}
            {task.progress > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-medium" style={{ color: "#a855f7" }}>{task.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                                width: `${task.progress}%`,
                                background: task.progress === 100
                                    ? "#22c55e"
                                    : "linear-gradient(90deg, #a855f7, #ec4899)"
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {task.due && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={11} />{task.due}
                        </span>
                    )}
                    {task.comments > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageSquare size={11} />{task.comments}
                        </span>
                    )}
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", fontSize: 9 }}>
                    AS
                </div>
            </div>
        </div>
    );
}

// ── Sidebar Link ──
function SidebarLink({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left"
            style={{ background: active ? "rgba(168,85,247,0.18)" : "transparent", color: active ? "#c084fc" : "#94a3b8" }}>
            <Icon size={16} />{label}
        </button>
    );
}

// ── Add Task Modal ──
function AddTaskModal({ column, onClose, onAdd }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState("UI Design");
    const [priority, setPriority] = useState("Medium");
    const [due, setDue] = useState("");
    const [progress, setProgress] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd({ title: title.trim(), description: description.trim(), tag, priority, due, progress, comments: 0 });
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                        Add task to <span style={{ color: "#a855f7" }}>{column}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Task title</label>
                        <input autoFocus type="text" placeholder="What needs to be done?"
                            value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2"
                            style={{ "--tw-ring-color": "#a855f7" }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Tag</label>
                            <select value={tag} onChange={(e) => setTag(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2"
                                style={{ "--tw-ring-color": "#a855f7" }}>
                                {Object.keys(tagColors).map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2"
                                style={{ "--tw-ring-color": "#a855f7" }}>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Due date (optional)</label>
                        <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2"
                            style={{ "--tw-ring-color": "#a855f7" }} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Description (optional)</label>
                        <textarea placeholder="Add more details about this task..."
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 resize-none"
                            style={{ "--tw-ring-color": "#a855f7" }} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">
                            Progress — <span style={{ color: "#a855f7" }}>{progress}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                    </div>

                    <div className="flex gap-3 mt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Task Detail Side Panel ──
function TaskDetailPanel({ task, onClose }) {
    if (!task) return null;
    const tag = tagColors[task.tag] || { bg: "#f3f4f6", text: "#374151" };
    const pri = priorityStyles[task.priority] || priorityStyles.Low;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white h-full shadow-2xl flex flex-col" style={{ width: 380, zIndex: 10 }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: tag.bg, color: tag.text }}>{task.tag}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: pri.bg, color: pri.text }}>{task.priority}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
                    <h2 className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</h2>

                    {/* Meta */}
                    <div className="flex flex-col gap-3">
                        {task.due && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-20">Due date</span>
                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                    <Calendar size={13} className="text-gray-400" />{task.due}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-20">Assignee</span>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold"
                                    style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", fontSize: 9 }}>AS</div>
                                <span className="text-sm text-gray-700">Ankit Saraswat</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t" style={{ borderColor: "#f1f5f9" }} />

                    {/* Progress */}
                    {(task.progress > 0) && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Progress</p>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex-1 h-2 rounded-full bg-gray-100 mr-3">
                                    <div className="h-2 rounded-full transition-all"
                                        style={{
                                            width: `${task.progress}%`,
                                            background: task.progress === 100 ? "#22c55e" : "linear-gradient(90deg, #a855f7, #ec4899)"
                                        }} />
                                </div>
                                <span className="text-sm font-semibold" style={{ color: "#a855f7" }}>{task.progress}%</span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                        {task.description ? (
                            <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No description added.</p>
                        )}
                    </div>

                    <div className="border-t" style={{ borderColor: "#f1f5f9" }} />

                    {/* Comments */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Comments ({task.comments || 0})
                        </p>
                        {task.comments > 0 ? (
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: task.comments }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold"
                                            style={{ background: "#a855f7", fontSize: 9 }}>AS</div>
                                        <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                                            <p className="text-xs text-gray-500">Comment {i + 1} — full comments available after backend is connected.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No comments yet.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t bg-gray-50" style={{ borderColor: "#e5e7eb" }}>
                    <p className="text-xs text-gray-400 text-center">Full editing available after backend is connected</p>
                </div>
            </div>
        </div>
    );
}

// ── Empty Column State ──
function EmptyColumn({ col, onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{ background: "#f8fafc" }}>
                <ClipboardList size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No tasks yet</p>
            <p className="text-xs text-gray-300">Click below to add your first task</p>
        </div>
    );
}

// ── Main Board Page ──
export default function Board() {
    const navigate = useNavigate();
    const { id } = useParams();
    const boardId = Number(id);
    const { tasks: allTasks, moveTask, addTask, deleteTask, boards } = useBoardStore();
    const tasks = allTasks[boardId] || { Todo: [], "In Progress": [], Done: [] };

    const [addingToCol, setAddingToCol] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    // ── Keyboard shortcut: press N to add task ──
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "n" || e.key === "N") {
                if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
                e.preventDefault();
                setTimeout(() => setAddingToCol("Todo"), 10);
            }
            if (e.key === "Escape") {
                setAddingToCol(null);
                setSelectedTask(null);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    }));

    // ── Filtered tasks for search ──
    const filteredTasks = searchQuery.trim()
        ? Object.fromEntries(
            COLUMNS.map((col) => [
                col,
                tasks[col].filter((t) =>
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (t.tag && t.tag.toLowerCase().includes(searchQuery.toLowerCase()))
                ),
            ])
        )
        : tasks;

    // ── Drag handlers ──
    const handleDragStart = (event) => {
        const sourceCol = event.active.data.current?.column;
        if (!sourceCol) return;
        const task = tasks[sourceCol].find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;
        const sourceCol = active.data.current?.column;
        const destCol = over.data.current?.column || over.id;
        const validColumns = ["Todo", "In Progress", "Done"];
        if (!validColumns.includes(destCol)) return;
        if (!sourceCol || sourceCol === destCol) return;
        moveTask(boardId, active.id, sourceCol, destCol);
        toast.success(`Moved to ${destCol}`, { duration: 1500 });
    };

    const handleDragCancel = () => setActiveTask(null);

    // ── Task handlers ──
    const handleAddTask = (column, taskData) => {
        addTask(boardId, column, taskData);
        toast.success(`Task added to ${column}!`);
    };

    const handleDeleteTask = (taskId, column) => {
        deleteTask(boardId, column, taskId);
        toast.error("Task deleted", { duration: 1500 });
    };

    const currentBoard = boards.find((b) => b.id === boardId);
    const boardName = currentBoard ? `${currentBoard.emoji} ${currentBoard.name}` : "My Board";
    const totalCount = Object.values(tasks).reduce((s, col) => s + col.length, 0);

    return (
        <div className="flex h-screen bg-gray-50">
            <Toaster position="bottom-right" toastOptions={{
                style: { fontSize: "13px", borderRadius: "10px" },
            }} />

            {/* ── Sidebar ── */}
            <div className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#0f172a" }}>
                <div className="flex items-center gap-2 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>F</div>
                    <span className="text-white font-semibold text-base">FlowBoard</span>
                </div>

                <nav className="flex flex-col gap-1 px-2 py-4">
                    <p className="text-xs px-3 mb-2" style={{ color: "#475569", letterSpacing: "0.08em" }}>MAIN MENU</p>
                    <SidebarLink icon={LayoutDashboard} label="Dashboard" onClick={() => navigate("/dashboard")} />
                    <SidebarLink icon={FolderKanban} label="Projects" active={true} />
                    <SidebarLink icon={CheckSquare} label="My Tasks" />

                    <p className="text-xs px-3 mt-5 mb-2" style={{ color: "#475569", letterSpacing: "0.08em" }}>STARRED</p>
                    {boards.slice(0, 5).map((b) => (
                        <button key={b.id} onClick={() => navigate(`/board/${b.id}`)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
                            style={{
                                color: boardId === b.id ? "#c084fc" : "#94a3b8",
                                background: boardId === b.id ? "rgba(168,85,247,0.18)" : "transparent",
                            }}>
                            <span style={{ fontSize: 13 }}>{b.emoji}</span>
                            <span className="truncate">{b.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>AS</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">Ankit Saraswat</p>
                            <p className="text-xs truncate" style={{ color: "#64748b" }}>ankit@email.com</p>
                        </div>
                        <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-300 transition-colors" title="Logout">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Topbar */}
                <div className="bg-white border-b px-6 pt-3 pb-0" style={{ borderColor: "#e5e7eb" }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                Dashboard
                            </button>
                            <span className="text-gray-300">/</span>
                            <span className="text-sm font-semibold text-gray-800">{boardName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search tasks..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 w-44"
                                    style={{ "--tw-ring-color": "#a855f7" }} />
                            </div>
                            <button onClick={() => setAddingToCol("Todo")}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
                                <Plus size={15} />Add Task
                            </button>
                        </div>
                    </div>

                    {/* Board stats row */}
                    <div className="flex items-center gap-6 pb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">Total</span>
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-full">{totalCount}</span>
                        </div>
                        {COLUMNS.map((col) => (
                            <div key={col} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: colDotColor[col] }} />
                                <span className="text-xs text-gray-400">{col}</span>
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{ background: "#f1f5f9", color: "#475569" }}>
                                    {tasks[col].length}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kanban Board */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <div className="flex gap-5 p-6 overflow-x-auto flex-1">
                        {COLUMNS.map((col) => (
                            <div key={col} className="w-72 flex-shrink-0 flex flex-col">

                                {/* Column header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: colDotColor[col] }} />
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{col}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: "#f1f5f9", color: "#64748b" }}>
                                            {filteredTasks[col].length}
                                        </span>
                                    </div>
                                    <button onClick={() => setAddingToCol(col)}
                                        className="text-gray-400 hover:text-purple-500 transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Cards */}
                                <SortableContext
                                    items={filteredTasks[col].map((t) => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <DroppableColumn id={col} bg={colBgColor[col]}>
                                        {filteredTasks[col].length === 0 && !searchQuery ? (
                                            <EmptyColumn col={col} onAdd={() => setAddingToCol(col)} />
                                        ) : filteredTasks[col].length === 0 && searchQuery ? (
                                            <p className="text-xs text-gray-300 text-center py-8">No matches</p>
                                        ) : (
                                            filteredTasks[col].map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    column={col}
                                                    onDelete={handleDeleteTask}
                                                    onSelect={setSelectedTask}
                                                />
                                            ))
                                        )}
                                    </DroppableColumn>
                                </SortableContext>

                                {/* Add task button */}
                                <button onClick={() => setAddingToCol(col)}
                                    className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-sm text-gray-400 hover:text-purple-500 hover:border-purple-300 transition-colors"
                                    style={{ borderColor: "#d1d5db" }}>
                                    <Plus size={14} />Add task
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Drag Overlay — ghost card that follows cursor */}
                    <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
                        {activeTask ? (
                            <div className="bg-white rounded-xl p-3 shadow-2xl rotate-2"
                                style={{ width: 272, border: "2px solid #a855f7", opacity: 0.95 }}>
                                <div className="flex gap-1.5 mb-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                            background: tagColors[activeTask.tag]?.bg || "#f3f4f6",
                                            color: tagColors[activeTask.tag]?.text || "#374151"
                                        }}>
                                        {activeTask.tag}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                            background: priorityStyles[activeTask.priority]?.bg,
                                            color: priorityStyles[activeTask.priority]?.text
                                        }}>
                                        {activeTask.priority}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 leading-snug">{activeTask.title}</p>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Add Task Modal */}
            {addingToCol && (
                <AddTaskModal
                    column={addingToCol}
                    onClose={() => setAddingToCol(null)}
                    onAdd={(data) => handleAddTask(addingToCol, data)}
                />
            )}

            {/* Task Detail Side Panel */}
            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
}
