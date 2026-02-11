import { Routes, Route } from "react-router-dom";
import CameraVerification from "./components/CameraVerification";
import ProfileSetup from "./components/ProfileSetup";
import Chat from "./components/chat"; // 👈 create this next

function App() {
  return (
    <Routes>
      <Route path="/verify-gender" element={<CameraVerification />} />
      <Route path="/profile" element={<ProfileSetup />} />
      <Route path="/chat" element={<Chat />} /> {/* ✅ ADD THIS */}
    </Routes>
  );
}

export default App;