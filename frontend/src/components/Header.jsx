import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-white fixed top-0 left-0 h-16 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        
        {/* Logo */}
        <div
          className="text-[25px] font-bold tracking-tight cursor-pointer"
          style={{
            fontFamily: "Farro, sans-serif",
            color: "#124511",
          }}
        >
          FORNOW!
        </div>

        {/* Help */}
        <button
            
            className="text-lg text-slate-700 hover:text-slate-900 transition"
            
        >
          Help
        </button>

      </div>
    </header>
  );
}