import React from "react";
import { Camera } from "lucide-react";

function AppLoader({ fullScreen = true, message = "" }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white px-4 py-12 select-none animate-in fade-in duration-200"
    : "flex min-h-[60vh] w-full flex-col items-center justify-center p-8 select-none";

  return (
    <div className={containerClasses} role="status" aria-label="Loading Snapzy">
      {/* Top spacer (for balanced vertical alignment in fullScreen) */}
      <div className="h-6 w-full" />

      {/* Center Brand Hero */}
      <div className="flex flex-col items-center text-center">
        {/* Animated Icon with gradient glow */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Subtle pulsating ambient glow */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 opacity-25 blur-xl animate-pulse" />

          {/* Logo container */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-xl shadow-pink-500/25 transition-transform duration-300 hover:scale-105">
            <Camera
              size={40}
              strokeWidth={2.2}
              className="text-white drop-shadow-xs"
            />
          </div>
        </div>

        {/* Brand Wordmark */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
          Snapzy
        </h1>

        {/* Modern Minimalist Loading Bar */}
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-gray-100">
          <div className="absolute inset-y-0 left-0 w-20 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 animate-[snapzySlide_1.4s_ease-in-out_infinite]" />
        </div>

        {message && (
          <p className="mt-3 text-xs font-medium text-gray-400">
            {message}
          </p>
        )}
      </div>

      {/* Bottom Footer (Instagram / Threads style branding) */}
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          from
        </span>
        <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-sm font-extrabold tracking-widest text-transparent uppercase">
          Snapzy
        </span>
      </div>
    </div>
  );
}

export default AppLoader;
