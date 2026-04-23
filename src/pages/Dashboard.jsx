import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useBoardStore from "../store/useBoardStore";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Plus,
  X,
} from "lucide-react";



// ── Sidebar link component ──
function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left"
      style={{
        background: active ? "rgba(168,85,247,0.18)" : "transparent",
        color: active ? "#c084fc" : "#94a3b8",
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { boards, activity, addBoard } = useBoardStore();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardEmoji, setNewBoardEmoji] = useState("📋");
  const fakeActivity = activity;

  const totalTasks = boards.reduce((sum, b) => sum + b.tasks, 0);
  const { tasks: allTasks } = useBoardStore();
  const inProgress = Object.values(allTasks).reduce(
    (sum, boardTasks) => sum + (boardTasks["In Progress"]?.length || 0), 0
  );
  const completed = Object.values(allTasks).reduce(
    (sum, boardTasks) => sum + (boardTasks["Done"]?.length || 0), 0
  );

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    addBoard(newBoardName.trim(), newBoardEmoji);
    setNewBoardName("");
    setNewBoardEmoji("📋");
    setShowNewBoard(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <div className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#0f172a" }}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            F
          </div>
          <span className="text-white font-semibold text-base">FlowBoard</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 py-4">
          <p className="text-xs px-3 mb-2" style={{ color: "#475569", letterSpacing: "0.08em" }}>
            MAIN MENU
          </p>
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active={true} />
          <SidebarLink icon={FolderKanban} label="Projects" onClick={() => { }} />
          <SidebarLink icon={CheckSquare} label="My Tasks" onClick={() => { }} />

          <p className="text-xs px-3 mt-5 mb-2" style={{ color: "#475569", letterSpacing: "0.08em" }}>
            STARRED
          </p>
          {boards.slice(0, 3).map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/board/${b.id}`)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
              style={{ color: "#94a3b8" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              <span style={{ fontSize: 14 }}>{b.emoji}</span>
              <span className="truncate">{b.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom user */}
        <div className="mt-auto px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 px-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            >
              AS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Ankit Saraswat</p>
              <p className="text-xs truncate" style={{ color: "#64748b" }}>ankit@email.com</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: "#e5e7eb" }}>
          <h1 className="text-base font-semibold text-gray-800">Dashboard</h1>
          <button
            onClick={() => setShowNewBoard(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            <Plus size={15} />
            New Board
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6">

          {/* Greeting */}
          <p className="text-xl font-semibold text-gray-800 mb-5">
            Good morning, Ankit 👋
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
              <p className="text-2xl font-semibold" style={{ color: "#a855f7" }}>{totalTasks}</p>
              <p className="text-xs text-green-500 mt-1">+3 this week</p>
              <div className="h-1 rounded-full bg-gray-100 mt-3">
                <div className="h-1 rounded-full" style={{ width: "70%", background: "linear-gradient(90deg, #a855f7, #ec4899)" }}></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <p className="text-xs text-gray-500 mb-1">In Progress</p>
              <p className="text-2xl font-semibold text-orange-500">{inProgress}</p>
              <p className="text-xs text-gray-400 mt-1">across {boards.length} boards</p>
              <div className="h-1 rounded-full bg-gray-100 mt-3">
                <div className="h-1 rounded-full bg-orange-400" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <p className="text-xs text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-semibold text-green-500">{completed}</p>
              <p className="text-xs text-green-500 mt-1">50% done</p>
              <div className="h-1 rounded-full bg-gray-100 mt-3">
                <div className="h-1 rounded-full bg-green-400" style={{ width: "50%" }}></div>
              </div>
            </div>
          </div>

          {/* Boards + Activity grid */}
          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>

            {/* Boards */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Your Boards</p>
              <div className="grid grid-cols-2 gap-4">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => navigate(`/board/${board.id}`)}
                    className="bg-white rounded-xl border p-4 cursor-pointer transition-all hover:border-purple-300 hover:shadow-sm"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: "#f3e8ff", fontSize: 18 }}
                    >
                      {board.emoji}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{board.name}</p>
                    <p className="text-xs text-gray-400">{board.tasks} tasks · {board.members} member{board.members > 1 ? "s" : ""}</p>
                    <div className="h-1 rounded-full bg-gray-100 mt-3">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${board.progress}%`, background: "linear-gradient(90deg, #a855f7, #ec4899)" }}
                      ></div>
                    </div>
                  </div>
                ))}

                {/* New board card */}
                <div
                  onClick={() => setShowNewBoard(true)}
                  className="rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-purple-300 hover:bg-purple-50"
                  style={{ borderColor: "#d1d5db", minHeight: 120 }}
                >
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-400">New Board</span>
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb", height: "fit-content" }}>
              <p className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</p>
              <div className="flex flex-col gap-3">
                {fakeActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      style={{ background: a.color }}
                    >
                      {a.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 leading-snug">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── New Board Modal ── */}
      {showNewBoard && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewBoard(false); }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Create New Board</h3>
              <button onClick={() => setShowNewBoard(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Board emoji</label>
                <input
                  type="text"
                  value={newBoardEmoji}
                  onChange={(e) => setNewBoardEmoji(e.target.value)}
                  maxLength={2}
                  className="w-16 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-center text-xl focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#a855f7" }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Board name</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Campaign"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": "#a855f7" }}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowNewBoard(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}