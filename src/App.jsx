import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import UpdateProfile from "./pages/UpdateProfile";
import Browse from "./pages/Browse";
import MyListings from "./pages/MyListings";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import ListingDetail from "./pages/ListingDetail";
import Messages from "./pages/Messages";

// ── Guard ─────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
      <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
      <Route path="/listings/new" element={<ProtectedRoute><NewListing /></ProtectedRoute>} />
      <Route path="/listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
      <Route path="/listing/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
      <Route path="/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}