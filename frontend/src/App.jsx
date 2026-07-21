import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watch from "./pages/Watch";
import Channel from "./pages/Channel";
import UploadVideo from "./pages/UploadVideo";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/watch/:videoId" element={
          <ProtectedRoute>
            <Watch />
          </ProtectedRoute>} />
        <Route path="/channel/:username" element={
          <ProtectedRoute>
            <Channel />
          </ProtectedRoute>} />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadVideo />
          </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App