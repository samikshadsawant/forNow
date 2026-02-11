import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/chat/MatchWaiting.css";

export default function MatchWaiting() {
  const navigate = useNavigate();

  useEffect(() => {
  const t = setTimeout(() => {
    navigate("/chat");
  }, 2500);

  return () => clearTimeout(t);
}, []);

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="waiting-screen">
          <div className="waiting-center">
            <div className="loader">
              <span></span><span></span><span></span>
            </div>
            <h2>Looking for your match…</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
