import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateVideo from "./pages/CreateVideo";
import VideoDetail from "./pages/VideoDetail";
import VideoList from "./pages/VideoList";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/video/create" element={<CreateVideo />} />
    <Route path="/video/list" element={<VideoList />} />
    <Route path="/video/:id" element={<VideoDetail />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
