// src/components/juegos/SpeedometerCluster.jsx
import React from "react";

export default function SpeedometerCluster({
  speed = 0,
  rpm = 1000,
  gear = 1,
  nitro = 100,
  nitroActive = false,
  distance = 0,
  time = 0,
  maxRPM = 9000,
  optimalRPMMin = 7200,
  optimalRPMMax = 8300,
  carName = "SPORT CLUSTER"
}) {
  const safeRPM = Math.max(0, Math.min(maxRPM, rpm));
  const rpmRatio = safeRPM / maxRPM;
  // Ángulo de aguja: -125° a +125°
  const needleAngle = -125 + rpmRatio * 250;

  const isShiftZone = rpm >= optimalRPMMin && rpm <= optimalRPMMax;
  const isOverRev = rpm > optimalRPMMax;

  // Marcas numéricas
  const ticks = [];
  const totalTicks = Math.floor(maxRPM / 1000);
  for (let i = 0; i <= totalTicks; i++) {
    const tickRatio = i / totalTicks;
    const angle = -125 + tickRatio * 250;
    const rad = (angle - 90) * (Math.PI / 180);
    const radius = 42;
    const textRadius = 31;
    const x1 = 50 + Math.cos(rad) * radius;
    const y1 = 50 + Math.sin(rad) * radius;
    const x2 = 50 + Math.cos(rad) * (radius - (i % 2 === 0 ? 5 : 3));
    const y2 = 50 + Math.sin(rad) * (radius - (i % 2 === 0 ? 5 : 3));
    const tx = 50 + Math.cos(rad) * textRadius;
    const ty = 50 + Math.sin(rad) * textRadius;
    const isRedline = i * 1000 >= optimalRPMMin;

    ticks.push({
      key: i,
      val: i,
      x1, y1, x2, y2, tx, ty,
      isRedline
    });
  }

  const shiftStage = Math.floor(rpmRatio * 5);

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-2.5 py-1.5 shadow-xl select-none">
      <div className="flex items-center justify-between gap-2">

        {/* 1. MÓDULO TURBO / NITRO IZQUIERDO */}
        <div className="w-24 sm:w-28 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 text-center shadow-inner">
          <div className="flex items-center justify-between text-[8px] font-bold">
            <span className="text-cyan-400">NOS BOOST</span>
            <span className={nitroActive ? "text-amber-400 animate-pulse font-black" : "text-gray-500"}>
              {nitroActive ? "⚡ INYECT" : `${Math.round(nitro)}%`}
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 my-1 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-75 ${
                nitroActive
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_#f59e0b]"
                  : "bg-gradient-to-r from-cyan-400 to-sky-500"
              }`}
              style={{ width: `${nitro}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[8px] text-gray-400 font-mono">
            <span>0 PSI</span>
            <span className="text-cyan-300 font-bold">{Math.round(nitro * 0.3)} PSI</span>
          </div>
        </div>

        {/* 2. TACÓMETRO ANALÓGICO COMPACTO ESTILO JDM */}
        <div className="flex items-center gap-2">
          {/* Esfera circular con aguja */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="clusterGradMini" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="#090d16" />
                  <stop offset="90%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </radialGradient>
              </defs>

              {/* Bisel */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="#334155" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="47" fill="none" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.6" />
              <circle cx="50" cy="50" r="46" fill="url(#clusterGradMini)" />

              {/* Arco Redline */}
              <path
                d="M 72 26 A 40 40 0 0 1 84 74"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Marcas numéricas */}
              {ticks.map((t) => (
                <g key={t.key}>
                  <line
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={t.isRedline ? "#ef4444" : "#94a3b8"}
                    strokeWidth={t.val % 2 === 0 ? "1.8" : "0.9"}
                  />
                  {t.val % 2 === 0 && (
                    <text
                      x={t.tx}
                      y={t.ty + 2}
                      fill={t.isRedline ? "#f87171" : "#cbd5e1"}
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {t.val}
                    </text>
                  )}
                </g>
              ))}

              {/* Aguja analógica giratoria */}
              <g
                transform={`rotate(${needleAngle} 50 50)`}
                className="transition-transform duration-75"
              >
                <polygon points="49,50 50,11 51,50" fill="#ef4444" />
                <circle cx="50" cy="12" r="1.5" fill="#fca5a5" />
                <circle cx="50" cy="50" r="7" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <circle cx="50" cy="50" r="3" fill="#ef4444" />
              </g>
            </svg>
          </div>

          {/* Velocímetro digital + Marcha + Shift lights */}
          <div className="flex flex-col justify-center">
            {/* Shift Lights LEDs */}
            <div className="flex items-center gap-1 mb-0.5">
              <div className={`w-2 h-1.5 rounded-xs transition ${shiftStage >= 1 ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-800"}`} />
              <div className={`w-2 h-1.5 rounded-xs transition ${shiftStage >= 2 ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-800"}`} />
              <div className={`w-2 h-1.5 rounded-xs transition ${shiftStage >= 3 ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" : "bg-slate-800"}`} />
              <div className={`w-2 h-1.5 rounded-xs transition ${shiftStage >= 4 ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" : "bg-slate-800"}`} />
              <div className={`px-1.5 py-0.5 rounded-xs font-black text-[7px] transition ${
                isShiftZone
                  ? "bg-emerald-400 text-slate-950 animate-ping font-extrabold shadow-[0_0_10px_#10b981]"
                  : isOverRev
                  ? "bg-rose-600 text-white animate-bounce"
                  : "bg-slate-800 text-gray-400"
              }`}>
                {isShiftZone ? "SHIFT" : isOverRev ? "REV" : "RPM"}
              </div>
            </div>

            {/* Velocidad digital grande y marcha */}
            <div className="flex items-baseline gap-2">
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight leading-none drop-shadow-[0_0_10px_#f59e0b]">
                  {Math.round(speed)}
                </span>
                <span className="text-[8px] font-black text-gray-400">KM/H</span>
              </div>

              {/* Indicador de marcha */}
              <div className="flex items-center gap-1 bg-slate-900 border border-cyan-400/60 rounded px-1.5 py-0.5">
                <span className="text-[8px] text-gray-400 font-bold">M</span>
                <span className="text-sm font-black text-cyan-300 font-mono leading-none">{gear}</span>
              </div>
            </div>

            {/* RPM numérico */}
            <span className={`text-[9px] font-mono font-bold leading-none mt-0.5 ${
              isShiftZone ? "text-emerald-400 animate-pulse" : isOverRev ? "text-rose-500" : "text-gray-400"
            }`}>
              {Math.round(rpm)} RPM
            </span>
          </div>
        </div>

        {/* 3. MÓDULO DISTANCIA 1 KM Y TIEMPO DERECHO */}
        <div className="w-24 sm:w-28 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 text-center shadow-inner">
          <div className="flex items-center justify-between text-[8px] font-bold text-gray-400">
            <span className="text-amber-400">1 KM DRAG</span>
            <span className="text-gray-500">{Math.min(1000, Math.round(distance))}m</span>
          </div>

          <div className="my-0.5">
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono leading-none block">
              {time.toFixed(2)}s
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-75"
              style={{ width: `${Math.min(100, (distance / 1000) * 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Nombre del vehículo seleccionado */}
      <div className="mt-1 flex items-center justify-between text-[9px] text-gray-400 px-1 border-t border-slate-800/80 pt-0.5">
        <span className="text-cyan-300 font-bold truncate max-w-[220px]">
          🚗 {carName}
        </span>
        <span className="text-gray-400">
          Redline: {maxRPM} RPM
        </span>
      </div>
    </div>
  );
}
