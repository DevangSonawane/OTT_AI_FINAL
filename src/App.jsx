import ComingSoon from "./pages/ComingSoon.jsx";
import CinematicCursor from "./components/CinematicCursor.jsx";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#05050a] text-white selection:bg-fuchsia-500/30 selection:text-white">
      <CinematicCursor />
      <ComingSoon />
    </div>
  );
}

