import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import AppNavbar from "../components/AppNavbar";

const API    = "http://localhost:5000";
const SOCKET = API;

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Avatar({ user, size = "w-10 h-10", text = "text-sm" }) {
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  return user?.profilePicUrl ? (
    <img src={user.profilePicUrl} alt={user.name} className={`${size} rounded-full object-cover border border-purple/20 shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-purple/15 border border-purple/20 flex items-center justify-center text-purple font-bold ${text} shrink-0`}>
      {initials}
    </div>
  );
}

// ── Status styling helpers ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { text: "Pending",   dot: "bg-amber-400",  badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ACTIVE:    { text: "Approved",  dot: "bg-green-400",  badge: "text-green-400 bg-green-500/10 border-green-500/20" },
  COMPLETED: { text: "Completed", dot: "bg-blue-400",   badge: "text-blue-400 bg-blue-500/10 border-blue-500/20"   },
  CANCELLED: { text: "Cancelled", dot: "bg-muted",      badge: "text-muted bg-surface border-border"               },
};

// ── Conversation list item ────────────────────────────────────────────────────
function ConvItem({ conv, currentUserId, isActive, onClick }) {
  const isBuyer = conv.buyerId === currentUserId;
  const other   = isBuyer ? conv.listing?.seller : conv.buyer;
  const lastMsg = conv.messages?.[0];
  const sc      = STATUS_CONFIG[conv.status] ?? STATUS_CONFIG.PENDING;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-border/50 transition-all duration-150
        ${isActive ? "bg-purple/8 border-l-2 border-l-purple" : "hover:bg-surface/60"}`}
    >
      <Avatar user={other} size="w-10 h-10" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5 gap-2">
          <p className="text-sm font-semibold text-primary truncate">{other?.name}</p>
          {lastMsg && <span className="text-[10px] text-muted/40 shrink-0">{timeAgo(lastMsg.createdAt)}</span>}
        </div>
        <p className="text-xs text-muted truncate">{conv.listing?.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          <span className="text-[10px] text-muted/50">{sc.text}</span>
          {lastMsg && (
            <span className="text-[11px] text-muted/40 truncate">
              · {lastMsg.sender?.id === currentUserId ? "You: " : ""}{lastMsg.content}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender?.id === currentUserId || msg.senderId === currentUserId;
  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {!isMine && <Avatar user={msg.sender} size="w-7 h-7" text="text-xs" />}
      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
        ${isMine ? "bg-purple text-white rounded-br-sm" : "bg-surface border border-border text-primary rounded-bl-sm"}`}
      >
        {msg.content}
        <p className={`text-[10px] mt-1 ${isMine ? "text-white/50 text-right" : "text-muted/40"}`}>
          {timeAgo(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ── Request / Approval panel ──────────────────────────────────────────────────
function RequestPanel({ conv, currentUserId, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const isBuyer  = conv.buyerId === currentUserId;
  const isSeller = conv.listing?.seller?.id === currentUserId;
  const { status } = conv;

  const updateStatus = async (newStatus) => {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/api/transactions/${conv.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStatusChange(conv.id, newStatus);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "PENDING") {
    if (isSeller) {
      return (
        <div className="mx-4 mt-3 mb-1 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">New Request</p>
                <p className="text-xs text-muted mt-0.5">
                  <span className="font-medium text-primary">{conv.buyer?.name}</span> wants to{" "}
                  {conv.type === "BUY" ? "purchase" : "rent"}{" "}
                  <span className="font-medium text-primary">{conv.listing?.title}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={loading}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/8 transition-all disabled:opacity-40"
              >
                Decline
              </button>
              <button
                onClick={() => updateStatus("ACTIVE")}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-all disabled:opacity-40"
              >
                {loading ? "…" : "✓ Approve"}
              </button>
            </div>
          </div>
          {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
        </div>
      );
    }

    if (isBuyer) {
      return (
        <div className="mx-4 mt-3 mb-1 bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-400">Awaiting Approval</p>
                <p className="text-xs text-muted mt-0.5">Your request is pending seller approval. Chat to discuss details.</p>
              </div>
            </div>
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={loading}
              className="text-xs text-muted/60 hover:text-red-400 border border-border hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all shrink-0 disabled:opacity-40"
            >
              Withdraw
            </button>
          </div>
          {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
        </div>
      );
    }
  }

  if (status === "ACTIVE") {
    return (
      <div className="mx-4 mt-3 mb-1 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-green-500/15 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-green-400">Request Approved!</p>
          <p className="text-xs text-muted">
            {isSeller ? "You approved this request." : "The seller approved your request."}{" "}
            The listing is now marked as{" "}
            <span className="font-medium text-primary">{conv.type === "BUY" ? "Sold" : "Rented"}</span>.
          </p>
        </div>
        {isSeller && (
          <button
            onClick={() => updateStatus("COMPLETED")}
            disabled={loading}
            className="text-xs text-muted/60 hover:text-primary border border-border px-3 py-1.5 rounded-lg transition-all shrink-0"
          >
            Mark Complete
          </button>
        )}
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="mx-4 mt-3 mb-1 bg-blue-500/8 border border-blue-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs text-blue-300 font-medium">Transaction Completed 🎉</p>
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="mx-4 mt-3 mb-1 bg-surface border border-border/60 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-border flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-xs text-muted/60">This request was cancelled.</p>
      </div>
    );
  }

  return null;
}

// ── Empty states ──────────────────────────────────────────────────────────────
function NoConversations({ onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </div>
      <p className="text-primary font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>No messages yet</p>
      <p className="text-muted text-sm max-w-xs mb-5">
        Find an item and click "Contact Seller" to start a request and open a chat.
      </p>
      <button onClick={onBrowse} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white transition-all">
        Browse listings
      </button>
    </div>
  );
}

function NoChatSelected() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </div>
      <p className="text-primary font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Select a conversation</p>
      <p className="text-muted text-sm">Choose a conversation from the list to start chatting.</p>
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────
function ChatPanel({ conv, currentUserId, socket, onStatusChange }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const endRef = useRef(null);
  const token  = localStorage.getItem("token");

  const isBuyer = conv.buyerId === currentUserId;
  const other   = isBuyer ? conv.listing?.seller : conv.buyer;

  // Load messages + join socket room
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API}/api/messages/conversations/${conv.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data.messages);
      } catch { /* silent */ }
    };
    load();
    socket?.emit("join-conversation", conv.id);
    return () => socket?.emit("leave-conversation", conv.id);
  }, [conv.id, socket, token]);

  // New messages via socket
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("new-message", handler);
    return () => socket.off("new-message", handler);
  }, [socket]);

  // Transaction status updates via socket
  useEffect(() => {
    if (!socket) return;
    const handler = ({ transactionId, status }) => {
      if (transactionId === conv.id) onStatusChange(transactionId, status);
    };
    socket.on("transaction-update", handler);
    return () => socket.off("transaction-update", handler);
  }, [socket, conv.id, onStatusChange]);

  // Scroll to bottom
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      const optimistic = {
        id: `opt-${Date.now()}`,
        content:   text,
        senderId:  currentUserId,
        sender:    { id: currentUserId },
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      await axios.post(
        `${API}/api/messages/conversations/${conv.id}`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const canChat = conv.status !== "CANCELLED" && conv.status !== "COMPLETED";

  return (
    <div className="flex flex-col h-full">

      {/* ── Chat header ── */}
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 bg-bg/60 shrink-0">
        <button onClick={() => navigate(`/listing/${conv.listingId}`)} className="shrink-0">
          <Avatar user={other} size="w-9 h-9" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{other?.name}</p>
          <button
            onClick={() => navigate(`/listing/${conv.listingId}`)}
            className="text-xs text-muted hover:text-purple transition-colors truncate max-w-full text-left block"
          >
            {conv.listing?.title}
          </button>
        </div>
        {/* Status badge */}
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0
          ${STATUS_CONFIG[conv.status]?.badge ?? ""}`}>
          {STATUS_CONFIG[conv.status]?.text ?? conv.status}
        </span>
      </div>

      {/* ── Request / Approval panel ── */}
      <RequestPanel conv={conv} currentUserId={currentUserId} onStatusChange={onStatusChange} />

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted/40 text-sm italic">No messages yet.</p>
            <p className="text-muted/30 text-xs mt-1">Say hi to start the conversation! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input ── */}
      {canChat ? (
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-border flex items-end gap-3 shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all resize-none max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-purple hover:bg-purple/90 disabled:bg-purple/30 disabled:cursor-not-allowed text-white transition-all"
          >
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
      ) : (
        <div className="px-5 py-3 border-t border-border text-center">
          <p className="text-xs text-muted/40 italic">
            {conv.status === "CANCELLED" ? "This conversation is closed." : "Transaction completed."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const convParam = searchParams.get("conv");

  const raw  = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const [conversations, setConvs] = useState([]);
  const [activeConv,    setActive]  = useState(null);
  const [loading,       setLoading] = useState(true);
  const [socket,        setSocket]  = useState(null);

  // Connect socket
  useEffect(() => {
    const s = io(SOCKET, { transports: ["polling", "websocket"] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      try {
        const token    = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConvs(data.conversations);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Auto-select from ?conv=
  useEffect(() => {
    if (!convParam || conversations.length === 0) return;
    const match = conversations.find((c) => c.id === convParam);
    if (match) setActive(match);
  }, [convParam, conversations]);

  // Handle status change — update both the list and active conv in real-time
  const handleStatusChange = (transactionId, newStatus) => {
    setConvs((prev) =>
      prev.map((c) => (c.id === transactionId ? { ...c, status: newStatus } : c))
    );
    setActive((prev) =>
      prev?.id === transactionId ? { ...prev, status: newStatus } : prev
    );
    // Broadcast to other party via socket
    socket?.emit("broadcast-transaction-update", { transactionId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-bg text-primary flex flex-col">
      <AppNavbar />

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-6 gap-5" style={{ height: "calc(100vh - 3.5rem - 1px)" }}>

        {/* ── Conversation sidebar ── */}
        <div className={`bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shrink-0
          ${activeConv ? "hidden md:flex" : "flex"} md:w-80 lg:w-96`}
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-bold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>Messages</h2>
            <p className="text-xs text-muted mt-0.5">
              {loading ? "Loading…" : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-border/40 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-border/40 rounded w-2/3" />
                      <div className="h-2.5 bg-border/40 rounded w-4/5" />
                      <div className="h-2 bg-border/40 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <NoConversations onBrowse={() => navigate("/browse")} />
            ) : (
              conversations.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  currentUserId={user?.id}
                  isActive={activeConv?.id === conv.id}
                  onClick={() => setActive(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Chat / empty ── */}
        <div className={`bg-surface border border-border rounded-2xl flex-1 overflow-hidden flex flex-col
          ${!activeConv ? "hidden md:flex" : "flex"}`}
        >
          {activeConv ? (
            <>
              <div className="md:hidden px-4 pt-3 shrink-0">
                <button onClick={() => setActive(null)} className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  All messages
                </button>
              </div>
              <ChatPanel
                conv={activeConv}
                currentUserId={user?.id}
                socket={socket}
                onStatusChange={handleStatusChange}
              />
            </>
          ) : (
            <NoChatSelected />
          )}
        </div>

      </div>
    </div>
  );
}
