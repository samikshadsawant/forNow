import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import LandingPage from "./pages/LandingPage";
import CameraVerification from "./components/CameraVerification";
import ProfileSetup from "./components/ProfileSetup";
import MoodSelect from "./components/MoodSelect";
import MatchWaiting from "./components/chat/MatchWaiting";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/camera" element={<CameraVerification />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/mood" element={<MoodSelect />} />
        <Route path="/waiting" element={<MatchWaiting />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
