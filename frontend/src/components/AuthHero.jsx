export default function AuthHero({ title, subtitle, activeDot = 0 }) {
  return (
    <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-[#8b7bff] via-[#6f5cff] to-[#4f46e5] lg:block">
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="flex h-full items-center justify-center p-10">
        <div className="relative w-full max-w-md rounded-[32px] bg-white/10 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/25 backdrop-blur-sm">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-white/20 via-white/5 to-transparent ring-1 ring-white/20">
            <svg viewBox="0 0 400 520" className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c4b9ff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6f5cff" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="lamp" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1f2937" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#fffbe6" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#fffbe6" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="400" height="520" fill="url(#sky)" />

              <g opacity="0.75">
                <path d="M40 50 h26 v8 h-26z M66 38 h10 v20 h-10z M76 46 h18 v12 h-18z" stroke="#ffffff" strokeWidth="0.6" fill="none" opacity="0.35" />
                <g fill="#ffffff" opacity="0.22">
                  <path d="M0 280 h40 v-50 h18 v-30 h22 v-40 h24 v70 h18 v-20 h22 v50 h30 v-30 h24 v40 h40 v-60 h22 v80 h20 v-30 h26 v40 h34 v20 h40 v40 H0 Z" />
                </g>
              </g>

              <g>
                <line x1="200" y1="0" x2="200" y2="110" stroke="#0f172a" strokeWidth="2" />
                <path d="M140 110 Q200 200 260 110 Z" fill="url(#lamp)" />
                <ellipse cx="200" cy="112" rx="60" ry="8" fill="#0f172a" />
                <circle cx="200" cy="180" r="70" fill="url(#glow)" />
              </g>

              <g opacity="0.35">
                <path d="M60 150 q12 -14 28 -6 q10 -14 26 -6 q14 4 14 16 q-4 8 -16 8 h-40 q-14 0 -14 -10 z" fill="#ffffff" />
                <path d="M260 200 q10 -12 24 -4 q10 -12 24 -4 q10 4 10 14 q-4 6 -14 6 h-36 q-10 0 -10 -10 z" fill="#ffffff" />
              </g>

              <g transform="translate(0 25)">
                <ellipse cx="200" cy="440" rx="170" ry="30" fill="#1e1b4b" opacity="0.25" />
                <path d="M60 360 C 80 300 160 275 200 275 C 240 275 320 300 340 360 C 348 400 300 430 200 435 C 100 430 52 400 60 360 Z" fill="#111827" />
                <path d="M90 345 C 110 310 165 295 200 295 C 235 295 290 310 310 345 C 315 370 275 395 200 398 C 125 395 85 370 90 345 Z" fill="#1f2937" />

                <path d="M168 200 C 165 180 180 160 200 160 C 220 160 235 180 232 200 L 232 220 L 168 220 Z" fill="#3f1d0a" />
                <circle cx="200" cy="215" r="32" fill="#f3c6a3" />
                <path d="M176 192 C 176 170 185 160 200 160 C 215 160 224 170 224 192 C 224 196 220 198 215 196 C 210 192 205 190 200 190 C 195 190 190 192 185 196 C 180 198 176 196 176 192 Z" fill="#3f1d0a" />
                <circle cx="190" cy="215" r="1.8" fill="#1f2937" />
                <circle cx="210" cy="215" r="1.8" fill="#1f2937" />

                <path d="M158 250 C 158 240 170 235 200 235 C 230 235 242 240 242 250 L 250 330 C 250 340 230 345 200 345 C 170 345 150 340 150 330 Z" fill="#475569" />

                <rect x="132" y="310" width="136" height="80" rx="8" fill="#e5e7eb" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x="140" y="318" width="120" height="58" rx="4" fill="#0f172a" />
                <rect x="148" y="326" width="50" height="4" rx="2" fill="#60a5fa" />
                <rect x="148" y="336" width="90" height="3" rx="1.5" fill="#334155" />
                <rect x="148" y="344" width="70" height="3" rx="1.5" fill="#334155" />
                <rect x="148" y="352" width="80" height="3" rx="1.5" fill="#334155" />
                <rect x="148" y="360" width="40" height="6" rx="3" fill="#22c55e" />
                <rect x="192" y="360" width="40" height="6" rx="3" fill="#f59e0b" />
                <rect x="124" y="388" width="152" height="6" rx="3" fill="#cbd5e1" />

                <rect x="148" y="340" width="32" height="70" rx="14" fill="#111827" transform="rotate(-18 164 375)" />
                <rect x="218" y="340" width="32" height="70" rx="14" fill="#111827" transform="rotate(18 234 375)" />
                <ellipse cx="150" cy="420" rx="22" ry="9" fill="#ffffff" />
                <ellipse cx="250" cy="420" rx="22" ry="9" fill="#ffffff" />
              </g>
            </svg>
          </div>

          <div className="mt-8 px-2 text-white">
            <h2 className="text-2xl font-bold leading-snug">{title}</h2>
            <p className="mt-2 text-sm text-white/80">{subtitle}</p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeDot ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
