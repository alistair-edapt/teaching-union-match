// scenes.jsx — Scene-level components for the explainer video.
// Each scene is self-contained and uses props {start, end} so the parent
// timeline can compose them. Scenes pull from window.* (animations.jsx).

const { Sprite, useSprite, useTime, Easing, interpolate, animate, clamp } = window;

// ── Brand tokens ─────────────────────────────────────────────────────────────
const COLOR = {
  primary:        "#6E3B7E",
  primaryDark:    "#5D316C",
  primaryDeeper:  "#3D2049",
  secondary:      "#B89AC9",
  secondarySoft:  "#E4D5EC",
  cream:          "#FCF8FD",
  cream2:         "#F5EDF6",
  text:           "#332733",
  textMuted:      "#6B6171",
  accent:         "#E07A5F",
  accentSoft:     "#FBE8E0",
  success:        "#2F7D57",
  successSoft:    "#E7F4EE",
  border:         "#E6D8EE",
};
const F_SERIF = '"Source Serif 4", Georgia, serif';
const F_SANS  = '"Public Sans", system-ui, sans-serif';

// ── Tiny helpers ─────────────────────────────────────────────────────────────

// Fade-in/out wrapper that uses sprite progress + entry/exit pads.
function FadeBox({ entryDur = 0.6, exitDur = 0.5, children, style }) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1, ty = 0;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t; ty = (1 - t) * 18;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t; ty = -t * 10;
  }
  return (
    <div style={{
      opacity,
      transform: `translateY(${ty}px)`,
      willChange: 'transform, opacity',
      ...style,
    }}>{children}</div>
  );
}

// Animated word-by-word reveal of a sentence.
function StaggerText({ text, x, y, size = 56, color = COLOR.text, font = F_SERIF, weight = 400, lineHeight = 1.1, maxWidth = 1800, align = 'left', stagger = 0.06, entryDelay = 0, exitDur = 0.4 }) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  const exiting = localTime > exitStart;
  const exitT = exiting ? Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1)) : 0;

  const words = text.split(' ');
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      maxWidth, fontFamily: font, fontSize: size, fontWeight: weight,
      color, lineHeight, letterSpacing: '-0.012em',
      textAlign: align,
      whiteSpace: 'nowrap',
      transform: align === 'center' ? 'translateX(-50%)' : undefined,
      opacity: 1 - exitT, willChange: 'opacity',
    }}>
      {words.map((w, i) => {
        const wStart = entryDelay + i * stagger;
        const wDur = 0.45;
        const t = Easing.easeOutCubic(clamp((localTime - wStart) / wDur, 0, 1));
        const isLast = i === words.length - 1;
        return (
          <React.Fragment key={i}>
            <span style={{
              display: 'inline-block',
              opacity: t,
              transform: `translateY(${(1 - t) * 16}px)`,
              willChange: 'transform, opacity',
            }}>{w}</span>
            {!isLast && '\u00A0'}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Eyebrow chip (small uppercase label)
function Eyebrow({ x, y, text, color = COLOR.primary, align = 'left' }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      fontFamily: F_SANS, fontSize: 18, fontWeight: 600,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color, display: 'inline-flex', alignItems: 'center', gap: 12,
      transform: align === 'center' ? 'translateX(-50%)' : undefined,
    }}>
      <span style={{ width: 28, height: 1.5, background: color, display: 'inline-block' }} />
      {text}
    </div>
  );
}

// ── Scene 1: Hook — "When you started teaching, you joined a union." ─────────
function SceneHook({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => (
        <>
          {/* Subtle vignette circle behind */}
          <div style={{
            position: 'absolute', left: 960, top: 540,
            width: 1400, height: 1400, borderRadius: '50%',
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle, ${COLOR.cream2} 0%, ${COLOR.cream} 70%)`,
            opacity: Easing.easeOutCubic(clamp(localTime / 0.8, 0, 1)),
          }} />
          <Eyebrow x={960} y={280} text="" align="center" />
          <StaggerText
            text="When you started working in schools,"
            x={960} y={380} align="center"
            size={76} weight={400} color={COLOR.text}
            entryDelay={0.3} stagger={0.07}
          />
          <StaggerText
            text="you were probably told that you"
            x={960} y={500} align="center"
            size={76} weight={400} color={COLOR.text}
            entryDelay={1.0} stagger={0.07}
          />
          <StaggerText
            text="should join a union."
            x={960} y={600} align="center"
            size={76} weight={400} color={COLOR.primary}
            entryDelay={1.7} stagger={0.07}
          />
          {/* Cursor tick mark on a tiny join-form sketch */}
          <FormSketch x={960} y={800} appearAt={2.8} />
        </>
      )}
    </Sprite>
  );
}

// Clipart classroom scene — female teacher at a chalkboard with three pupils.
function FormSketch({ x, y, appearAt = 0 }) {
  const { localTime } = useSprite();
  const t = clamp(localTime - appearAt, 0, 99);
  const op = Easing.easeOutCubic(clamp(t / 0.6, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: 'translate(-50%, -50%)',
      opacity: op,
    }}>
      <svg width="520" height="240" viewBox="0 0 520 240" fill="none">
        {/* Floor line */}
        <line x1="20" y1="218" x2="500" y2="218" stroke={COLOR.secondarySoft} strokeWidth="2" />

        {/* Chalkboard */}
        <rect x="40" y="30" width="200" height="130" rx="8" fill="#2F4F3A" stroke={COLOR.text} strokeWidth="2.5" />
        <rect x="36" y="156" width="208" height="10" rx="3" fill="#9B7E5A" />
        {/* "ABC" on board */}
        <text x="140" y="100" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="44" fill="#F8F4E8">ABC</text>
        <text x="140" y="138" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="22" fill="#F8F4E8">1 + 2 = 3</text>

        {/* Female teacher */}
        <g transform="translate(280 60)">
          {/* Skirt/dress body */}
          <path d="M-20 158 L-32 100 Q-32 70 0 70 Q32 70 32 100 L20 158 Z" fill={COLOR.accent} />
          {/* Arms */}
          <rect x="-32" y="80" width="14" height="50" rx="6" fill="#F2D5C6" />
          <rect x="18" y="80" width="14" height="50" rx="6" fill="#F2D5C6" />
          {/* Pointer stick */}
          <line x1="-20" y1="106" x2="-78" y2="78" stroke={COLOR.text} strokeWidth="3" strokeLinecap="round" />
          {/* Neck */}
          <rect x="-6" y="58" width="12" height="14" fill="#F2D5C6" />
          {/* Hair back */}
          <path d="M-26 60 Q-26 12 0 8 Q26 12 26 60 L24 78 L-24 78 Z" fill={COLOR.primaryDeeper} />
          {/* Face */}
          <circle cx="0" cy="42" r="22" fill="#F2D5C6" />
          {/* Hair fringe */}
          <path d="M-22 36 Q-20 14 0 12 Q20 14 22 36 Q14 26 0 30 Q-14 26 -22 36 Z" fill={COLOR.primaryDeeper} />
          {/* Eyes */}
          <circle cx="-7" cy="44" r="1.4" fill={COLOR.text} />
          <circle cx="7"  cy="44" r="1.4" fill={COLOR.text} />
          {/* Smile */}
          <path d="M-5 54 Q0 58 5 54" stroke={COLOR.text} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <circle cx="-12" cy="50" r="2.5" fill={COLOR.accent} opacity="0.35" />
          <circle cx="12"  cy="50" r="2.5" fill={COLOR.accent} opacity="0.35" />
        </g>

        {/* Pupil 1 (left, with raised hand) */}
        <g transform="translate(360 130)">
          {/* Body */}
          <path d="M-18 88 L-22 50 Q-22 32 0 32 Q22 32 22 50 L18 88 Z" fill={COLOR.primary} />
          {/* Raised arm */}
          <path d="M-12 36 L-22 -10" stroke="#F2D5C6" strokeWidth="9" strokeLinecap="round" />
          {/* Other arm */}
          <rect x="14" y="40" width="10" height="32" rx="5" fill="#F2D5C6" />
          {/* Head */}
          <circle cx="0" cy="14" r="16" fill="#F2D5C6" />
          {/* Pigtails */}
          <path d="M-16 12 Q-22 4 -20 -8 L-12 -4 Z" fill={COLOR.primaryDeeper} />
          <path d="M16 12 Q22 4 20 -8 L12 -4 Z" fill={COLOR.primaryDeeper} />
          {/* Hair top */}
          <path d="M-14 8 Q-12 -8 0 -10 Q12 -8 14 8 Q8 0 0 2 Q-8 0 -14 8 Z" fill={COLOR.primaryDeeper} />
          {/* Eyes */}
          <circle cx="-5" cy="14" r="1.2" fill={COLOR.text} />
          <circle cx="5"  cy="14" r="1.2" fill={COLOR.text} />
          {/* Smile */}
          <path d="M-3 22 Q0 25 3 22" stroke={COLOR.text} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>

        {/* Pupil 2 (right, sitting at desk) */}
        <g transform="translate(440 140)">
          {/* Desk */}
          <rect x="-30" y="50" width="60" height="6" fill="#9B7E5A" />
          <rect x="-26" y="56" width="6" height="22" fill="#9B7E5A" />
          <rect x="20"  y="56" width="6" height="22" fill="#9B7E5A" />
          {/* Body */}
          <path d="M-15 50 L-18 22 Q-18 8 0 8 Q18 8 18 22 L15 50 Z" fill={COLOR.success} />
          {/* Arms forward (writing) */}
          <rect x="-14" y="30" width="10" height="20" rx="5" fill="#F2D5C6" />
          <rect x="4"   y="30" width="10" height="20" rx="5" fill="#F2D5C6" />
          {/* Head */}
          <circle cx="0" cy="-4" r="14" fill="#F2D5C6" />
          {/* Hair (short) */}
          <path d="M-14 -6 Q-12 -22 0 -22 Q12 -22 14 -6 Q8 -14 0 -12 Q-8 -14 -14 -6 Z" fill={COLOR.primaryDeeper} />
          {/* Eyes */}
          <circle cx="-4" cy="-4" r="1.2" fill={COLOR.text} />
          <circle cx="4"  cy="-4" r="1.2" fill={COLOR.text} />
          {/* Smile */}
          <path d="M-3 3 Q0 5 3 3" stroke={COLOR.text} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>

        {/* Apple on teacher's "desk" */}
        <g transform="translate(245 200)">
          <circle r="8" fill={COLOR.accent} />
          <path d="M0 -8 Q3 -12 7 -10" stroke={COLOR.primaryDeeper} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

// ── Scene 2: The decision — "Probably the first one a colleague mentioned." ─
function SceneDecision({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime }) => (
        <>
          <StaggerText
            text="But how much thought"
            x={1080} y={380}
            size={68} weight={400} color={COLOR.text}
            entryDelay={0.2} stagger={0.07}
          />
          <StaggerText
            text="did you give it at the time?"
            x={1080} y={480}
            size={68} weight={400} color={COLOR.primary}
            entryDelay={0.9} stagger={0.07}
          />
          <p style={{
            position: 'absolute', left: 1080, top: 600, margin: 0,
            maxWidth: 600, fontFamily: F_SANS, fontSize: 26, lineHeight: 1.55,
            color: COLOR.textMuted,
            opacity: Easing.easeOutCubic(clamp((localTime - 1.8) / 0.6, 0, 1)),
            transform: `translateY(${(1 - Easing.easeOutCubic(clamp((localTime - 1.8) / 0.6, 0, 1))) * 12}px)`,
          }}>
            Most teachers join the same union for their entire career — without ever comparing what's out there.
          </p>
          {/* Avatar with multiple thought bubbles */}
          <TeacherAvatar x={400} y={620} appearAt={0.1} />
          <ThoughtLogo x={620} y={300} size={180} logo="../assets/logos/neu.png"        appearAt={1.0} />
          <ThoughtLogo x={830} y={210} size={170} logo="../assets/logos/nasuwt.png"     appearAt={1.4} />
          <ThoughtLogo x={620} y={490} size={170} logo="../assets/logos/edapt.jpg"      appearAt={1.8} />
          <ThoughtLogo x={830} y={400} size={170} logo="../assets/logos/community.png"  appearAt={2.2} />
        </>
      )}
    </Sprite>
  );
}

function TeacherAvatar({ x, y, appearAt = 0 }) {
  const { localTime } = useSprite();
  const t = clamp(localTime - appearAt, 0, 99);
  const op = Easing.easeOutCubic(clamp(t / 0.6, 0, 1));
  const bob = Math.sin(localTime * 1.4) * 4;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateY(${bob}px)`, opacity: op }}>
      <svg width="280" height="380" viewBox="0 0 280 380" fill="none">
        {/* Body / blouse */}
        <path d="M48 380 L48 248 Q48 198 140 198 Q232 198 232 248 L232 380 Z" fill={COLOR.accent} />
        {/* Soft scarf / collar */}
        <path d="M100 198 Q140 232 180 198 L168 250 Q140 268 112 250 Z" fill={COLOR.accentSoft} />
        {/* Earrings */}
        <circle cx="86"  cy="156" r="4" fill={COLOR.primary} />
        <circle cx="194" cy="156" r="4" fill={COLOR.primary} />
        {/* Hair (back) — longer, frames the face down to shoulders */}
        <path d="M70 152 Q66 76 140 64 Q214 76 210 152 L222 240 Q210 220 200 200 L195 158 Q200 110 140 100 Q80 110 85 158 L80 200 Q70 220 58 240 Z" fill={COLOR.primaryDeeper} />
        {/* Face */}
        <circle cx="140" cy="138" r="60" fill="#F2D5C6" />
        {/* Hair fringe */}
        <path d="M84 124 Q88 80 140 76 Q192 80 196 124 Q186 102 162 100 Q150 96 140 102 Q130 96 118 100 Q94 102 84 124 Z" fill={COLOR.primaryDeeper} />
        {/* Eyes */}
        <ellipse cx="120" cy="142" rx="3.5" ry="5" fill={COLOR.text} />
        <ellipse cx="160" cy="142" rx="3.5" ry="5" fill={COLOR.text} />
        {/* Eyelashes */}
        <path d="M114 136 L112 132 M120 134 L120 130 M126 136 L128 132" stroke={COLOR.text} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M154 136 L152 132 M160 134 L160 130 M166 136 L168 132" stroke={COLOR.text} strokeWidth="1.5" strokeLinecap="round" />
        {/* Cheeks */}
        <circle cx="108" cy="160" r="6" fill={COLOR.accent} opacity="0.35" />
        <circle cx="172" cy="160" r="6" fill={COLOR.accent} opacity="0.35" />
        {/* Smile */}
        <path d="M124 170 Q140 180 156 170" stroke={COLOR.text} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function ThoughtLogo({ x, y, appearAt = 0, size = 240, logo = "../assets/logos/neu.png" }) {
  const { localTime } = useSprite();
  const t = clamp(localTime - appearAt, 0, 99);
  const op = Easing.easeOutCubic(clamp(t / 0.5, 0, 1));
  const sc = 0.7 + 0.3 * Easing.easeOutBack(clamp(t / 0.6, 0, 1));
  const bobAmp = 4;
  const bob = Math.sin((localTime + appearAt) * 1.3) * bobAmp;
  const w = size, h = size * 0.62;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: op, transform: `translateY(${bob}px) scale(${sc})`, transformOrigin: 'left top' }}>
      {/* Thought bubble trail (smaller dots, scaled with size) */}
      <div style={{ position: 'absolute', left: -22, top: h * 0.85, width: 14, height: 14, borderRadius: 999, background: '#fff', border: `2px solid ${COLOR.border}` }} />
      <div style={{ position: 'absolute', left: -38, top: h * 1.05, width: 9,  height: 9,  borderRadius: 999, background: '#fff', border: `2px solid ${COLOR.border}` }} />
      <div style={{ width: w, height: h, background: '#fff', border: `2px solid ${COLOR.border}`, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, boxSizing: 'border-box', boxShadow: '0 6px 20px -10px rgba(61,32,73,.25)' }}>
        <img src={logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
    </div>
  );
}

// ── Scene 3: The reveal — 16 logos ───────────────────────────────────────────
const ALL_LOGOS = [
  { src: "../assets/logos/neu.png",      name: "NEU" },
  { src: "../assets/logos/nasuwt.png",   name: "NASUWT" },
  { src: "../assets/logos/edapt.jpg",    name: "Edapt" },
  { src: "../assets/logos/ascl.png",     name: "ASCL" },
  { src: "../assets/logos/naht.png",     name: "NAHT" },
  { src: "../assets/logos/community.png",name: "Community" },
  { src: "../assets/logos/gmb.png",      name: "GMB" },
  { src: "../assets/logos/unison.png",   name: "UNISON" },
  { src: "../assets/logos/unite.png",    name: "Unite" },
  { src: "../assets/logos/eis.jpg",      name: "EIS" },
  { src: "../assets/logos/ahds.svg",     name: "AHDS" },
  { src: "../assets/logos/sls.png",      name: "SLS" },
  { src: "../assets/logos/ssta.png",     name: "SSTA" },
  { src: "../assets/logos/into.jpg",     name: "INTO" },
  { src: "../assets/logos/utu.png",      name: "UTU" },
  { src: "../assets/logos/ucac.png",     name: "UCAC" },
];

function SceneReveal({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const exitStart = duration - 0.6;
        const exiting = localTime > exitStart;
        const exitT = exiting ? Easing.easeInCubic(clamp((localTime - exitStart) / 0.6, 0, 1)) : 0;
        return (
          <>
            <Eyebrow x={960} y={120} text="Did you know?" align="center" color="#FFFFFF" />
            <StaggerText
              text="There are 16 organisations"
              x={960} y={180} align="center"
              size={84} weight={400} color="#FFFFFF"
              entryDelay={0.1} stagger={0.05}
            />
            <StaggerText
              text="supporting school staff in the UK."
              x={960} y={290} align="center"
              size={84} weight={400} color={COLOR.secondarySoft}
              entryDelay={0.7} stagger={0.05}
            />
            {/* Logo grid: 4 cols × 4 rows, centered */}
            <LogoGrid baseDelay={1.6} exitT={exitT} />
          </>
        );
      }}
    </Sprite>
  );
}

function LogoGrid({ baseDelay = 0, exitT = 0 }) {
  const { localTime } = useSprite();
  const cols = 4, rows = 4;
  const cellW = 260, cellH = 120, gap = 24;
  const totalW = cols * cellW + (cols - 1) * gap;
  const totalH = rows * cellH + (rows - 1) * gap;
  const startX = 960 - totalW / 2;
  // Push grid down so it sits below the headline (which spans y=180-360)
  const startY = 460;

  return (
    <>
      {ALL_LOGOS.map((logo, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = startX + c * (cellW + gap);
        const y = startY + r * (cellH + gap);
        const delay = baseDelay + i * 0.07;
        const t = Easing.easeOutCubic(clamp((localTime - delay) / 0.5, 0, 1));
        return (
          <div key={logo.name} style={{
            position: 'absolute', left: x, top: y,
            width: cellW, height: cellH,
            background: '#fff',
            borderRadius: 18,
            border: `1.5px solid ${COLOR.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 22, boxSizing: 'border-box',
            opacity: t * (1 - exitT),
            transform: `translateY(${(1 - t) * 22}px) scale(${0.92 + 0.08 * t})`,
            boxShadow: `0 6px 20px -10px rgba(61, 32, 73, .25)`,
            willChange: 'transform, opacity',
          }}>
            <img src={logo.src} alt={logo.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        );
      })}
    </>
  );
}

// ── Scene 4: Differences — chips for nation/role/cost/politics ───────────────
function SceneDifferences({ start, end }) {
  const groups = [
    { label: "Where they operate", color: COLOR.primary,     icon: <UkMapIcon color={COLOR.primary} />,    items: ["England", "Scotland", "Wales / Cymru", "Northern Ireland"] },
    { label: "Who they support",   color: COLOR.accent,      icon: <PeopleIcon color={COLOR.accent} />,    items: ["Teachers", "ECTs & NQTs", "School leaders", "Support staff", "Supply"] },
    { label: "How much it costs",  color: COLOR.success,     icon: <CoinIcon color={COLOR.success} />,     items: ["Income-banded", "ECT discounts", "Free trainee membership"] },
    { label: "What they focus on", color: COLOR.primaryDark, icon: <MegaphoneIcon color={COLOR.primaryDark} />, items: ["Campaigning", "Casework & protection", "Collective action", "Leadership issues"] },
  ];
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const exitT = Easing.easeInCubic(clamp((localTime - (duration - 0.6)) / 0.6, 0, 1));
        return (
          <>
            <Eyebrow x={960} y={140} text="And they differ in ways that matter" align="center" />
            {groups.map((g, gi) => (
              <ChipRow
                key={g.label}
                y={310 + gi * 165}
                label={g.label}
                color={g.color}
                items={g.items}
                icon={g.icon}
                groupDelay={0.6 + gi * 0.4}
                exitT={exitT}
              />
            ))}
          </>
        );
      }}
    </Sprite>
  );
}

// Small inline icons used by Scene 4 chip rows. ~64px square.
function UkMapIcon({ color }) {
  // Tinted PNG silhouette of GB + NI. The image is a single-color silhouette
  // with transparency, so we use it as a CSS mask and fill it with `color`.
  const url = 'assets/uk-map.png';
  return (
    <div
      aria-hidden="true"
      style={{
        width: 64,
        height: 64,
        backgroundColor: color,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}

function PeopleIcon({ color }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
      {/* Three little stick people, varying heights */}
      <circle cx="14" cy="22" r="6" fill={color} />
      <path d="M6 50 L6 38 Q6 32 14 32 Q22 32 22 38 L22 50 Z" fill={color} />
      <circle cx="32" cy="18" r="7" fill={`${color}cc`} />
      <path d="M22 52 L22 36 Q22 28 32 28 Q42 28 42 36 L42 52 Z" fill={`${color}cc`} />
      <circle cx="50" cy="24" r="5" fill={`${color}99`} />
      <path d="M42 50 L42 38 Q42 33 50 33 Q58 33 58 38 L58 50 Z" fill={`${color}99`} />
      <line x1="2" y1="56" x2="62" y2="56" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CoinIcon({ color }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
      {/* Stack of coins */}
      <ellipse cx="32" cy="50" rx="24" ry="6" fill={color} />
      <rect x="8" y="38" width="48" height="12" fill={`${color}cc`} />
      <ellipse cx="32" cy="38" rx="24" ry="6" fill={color} />
      <rect x="8" y="26" width="48" height="12" fill={`${color}aa`} />
      <ellipse cx="32" cy="26" rx="24" ry="6" fill={color} />
      <rect x="8" y="14" width="48" height="12" fill={`${color}88`} />
      <ellipse cx="32" cy="14" rx="24" ry="6" fill={color} />
      {/* £ glyph */}
      <text x="32" y="20" textAnchor="middle" fontFamily="serif" fontSize="14" fontWeight="700" fill="#fff">£</text>
    </svg>
  );
}

function MegaphoneIcon({ color }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
      {/* Megaphone */}
      <path d="M8 30 L8 38 L24 40 L48 52 L48 16 L24 28 Z" fill={color} />
      <rect x="48" y="22" width="6" height="24" rx="2" fill={`${color}cc`} />
      <line x1="58" y1="22" x2="62" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="34" x2="62" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="46" x2="62" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ChipRow({ y, label, color, items, groupDelay, exitT, icon }) {
  const { localTime } = useSprite();
  const labelT = Easing.easeOutCubic(clamp((localTime - groupDelay) / 0.4, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: 200, top: y, right: 200,
      display: 'flex', alignItems: 'center', gap: 24,
      opacity: 1 - exitT,
    }}>
      {icon ? (
        <div style={{
          width: 64, height: 64, flexShrink: 0,
          opacity: labelT,
          transform: `scale(${0.6 + 0.4 * labelT})`,
          transformOrigin: 'center',
        }}>{icon}</div>
      ) : null}
      <div style={{
        fontFamily: F_SANS, fontSize: 16, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color, width: 220, flexShrink: 0,
        lineHeight: 1.25,
        opacity: labelT,
        transform: `translateX(${(1 - labelT) * -16}px)`,
      }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {items.map((item, i) => {
          const t = Easing.easeOutBack(clamp((localTime - groupDelay - 0.15 - i * 0.08) / 0.45, 0, 1));
          return (
            <div key={item} style={{
              padding: '14px 22px',
              background: '#fff',
              border: `1.5px solid ${color}33`,
              borderRadius: 999,
              fontFamily: F_SANS, fontSize: 22, fontWeight: 500,
              color: COLOR.text,
              opacity: clamp(t, 0, 1),
              transform: `scale(${0.6 + 0.4 * clamp(t, 0, 1)})`,
              transformOrigin: 'center',
              willChange: 'transform, opacity',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: color, marginRight: 10, verticalAlign: 'middle' }} />
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Scene 5: The quiz — UI demonstration ─────────────────────────────────────
function SceneQuiz({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const exitT = Easing.easeInCubic(clamp((localTime - (duration - 0.6)) / 0.6, 0, 1));
        return (
          <>
            <Eyebrow x={140} y={140} text="We made it easy to find the one that matches your values" />
            <StaggerText
              text="A 2-minute quiz."
              x={140} y={200}
              size={72} weight={400} color={COLOR.text}
              entryDelay={0.1} stagger={0.06}
            />
            <StaggerText
              text="Free, independent, no sign-up."
              x={140} y={290}
              size={32} weight={400} color={COLOR.textMuted} font={F_SANS}
              entryDelay={0.7} stagger={0.04}
            />
            {/* Bullet annotations */}
            <BulletList x={140} y={420} startAt={1.4} exitT={exitT} items={[
              "Tell us where you work and what your role is",
              "What is important to you",
              "We'll rank the 16 organisations against your answers",
            ]}/>
            {/* Laptop frame on right */}
            <LaptopMock x={1340} y={560} startAt={0.5} exitT={exitT} />
          </>
        );
      }}
    </Sprite>
  );
}

function BulletList({ x, y, startAt, items, exitT = 0 }) {
  const { localTime } = useSprite();
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: 1 - exitT }}>
      {items.map((item, i) => {
        const t = Easing.easeOutCubic(clamp((localTime - startAt - i * 0.35) / 0.5, 0, 1));
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 18,
            marginBottom: 28,
            opacity: t,
            transform: `translateX(${(1 - t) * -20}px)`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: COLOR.accent,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F_SANS, fontSize: 16, fontWeight: 700,
              flexShrink: 0, marginTop: 2,
            }}>{i + 1}</div>
            <div style={{ fontFamily: F_SANS, fontSize: 28, lineHeight: 1.45, color: COLOR.text, maxWidth: 600 }}>
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Laptop/screen mock — drives an internal mini-storyboard:
//   t=0.5 → quiz question card slides in
//   t=2.5 → an answer gets highlighted (cursor)
//   t=3.5 → results page slides in
function LaptopMock({ x, y, startAt = 0, exitT = 0 }) {
  const { localTime } = useSprite();
  const t = localTime - startAt;
  // Frame entry
  const frameT = Easing.easeOutCubic(clamp(t / 0.6, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) scale(${0.96 + 0.04 * frameT})`,
      opacity: frameT * (1 - exitT),
      willChange: 'transform, opacity',
    }}>
      {/* Laptop body */}
      <div style={{
        width: 980, height: 620,
        background: '#1a1418',
        borderRadius: 18,
        padding: 22,
        boxShadow: '0 30px 80px -20px rgba(61, 32, 73, .55)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: COLOR.cream,
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <QuizScreen t={t} />
        </div>
      </div>
      {/* Laptop base */}
      <div style={{
        width: 1100, height: 16,
        background: '#1a1418',
        borderRadius: '0 0 14px 14px',
        margin: '0 auto',
        marginTop: -2,
        position: 'relative',
        left: -60,
      }}>
        <div style={{
          width: 140, height: 8,
          background: '#0e0a10',
          borderRadius: '0 0 8px 8px',
          margin: '0 auto',
        }} />
      </div>
    </div>
  );
}

function QuizScreen({ t }) {
  // Storyboard timing inside the laptop:
  //   q1 in:    0.7 → 1.2
  //   q1 out:   2.4 → 2.8
  //   q2 in:    2.8 → 3.2
  //   q2 out:   4.6 → 5.0
  //   results:  5.0 → ...
  const Q1 = { in: 0.7, sel: 1.6, out: 2.6 };
  const Q2 = { in: 2.9, sel: 3.8, out: 4.8 };
  const RES = { in: 5.0 };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Top bar */}
      <div style={{
        height: 56, background: '#fff', borderBottom: `1px solid ${COLOR.border}`,
        display: 'flex', alignItems: 'center', padding: '0 28px',
        fontFamily: F_SANS, fontWeight: 600, fontSize: 18, color: COLOR.primary,
      }}>
        <span style={{ display: 'inline-block', width: 22, height: 22, background: COLOR.primary, borderRadius: 6, marginRight: 12 }} />
        Teaching Union Match
      </div>

      {/* Slot 1 — question card */}
      <CardSlot
        showStart={Q1.in} showEnd={Q2.in - 0.1} t={t} exitStart={Q1.out}
      >
        <QuizQuestion
          eyebrow="Question 3 of 7"
          title="If your union called a strike, what would you do?"
          options={[
            { label: "Join the strike and the picket line" },
            { label: "Join the strike but not the picket line", picked: t > Q1.sel },
            { label: "Opt out but stay a member" },
            { label: "I'd rather not strike" },
          ]}
        />
      </CardSlot>

      {/* Slot 2 — second question */}
      <CardSlot showStart={Q2.in} showEnd={RES.in - 0.1} t={t} exitStart={Q2.out}>
        <QuizQuestion
          eyebrow="Question 5 of 7"
          title="What matters most to you in a union?"
          options={[
            { label: "Personal protection if things go wrong", picked: t > Q2.sel },
            { label: "Strength in numbers" },
            { label: "Professional development" },
            { label: "Solid cover at the lowest cost" },
          ]}
        />
      </CardSlot>

      {/* Slot 3 — results page */}
      <CardSlot showStart={RES.in} showEnd={99} t={t}>
        <QuizResults t={t - RES.in} />
      </CardSlot>
    </div>
  );
}

// CardSlot — slide a child in from the right and out to the left, based on
// the parent t. Hides outside the visible window.
function CardSlot({ showStart, showEnd, exitStart, t, children }) {
  const visible = t >= showStart && t < showEnd;
  if (!visible) return null;
  // Entry: slide in from right
  const inT = Easing.easeOutCubic(clamp((t - showStart) / 0.45, 0, 1));
  // Exit: slide out left (only if exitStart provided)
  const exiting = exitStart != null && t > exitStart;
  const outT = exiting ? Easing.easeInCubic(clamp((t - exitStart) / 0.4, 0, 1)) : 0;
  const x = (1 - inT) * 80 + outT * -80;
  const op = inT * (1 - outT);
  return (
    <div style={{
      position: 'absolute', inset: '56px 0 0 0',
      transform: `translateX(${x}px)`,
      opacity: op,
      willChange: 'transform, opacity',
      padding: 32, boxSizing: 'border-box',
    }}>{children}</div>
  );
}

function QuizQuestion({ eyebrow, title, options = [], slider, sliderValue = 3, sliderActive = false }) {
  return (
    <div>
      <div style={{ fontFamily: F_SANS, fontSize: 13, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLOR.primary, marginBottom: 14 }}>
        {eyebrow}
      </div>
      <div style={{ fontFamily: F_SERIF, fontSize: 38, color: COLOR.text, lineHeight: 1.15, marginBottom: 28, maxWidth: 920 }}>
        {title}
      </div>
      {!slider && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt, i) => (
            <div key={i} style={{
              padding: '16px 22px',
              background: opt.picked ? COLOR.cream2 : '#fff',
              border: `1.5px solid ${opt.picked ? COLOR.primary : COLOR.border}`,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: F_SANS, fontSize: 20, color: COLOR.text,
              transition: 'all .2s',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${opt.picked ? COLOR.primary : '#ccc'}`,
                background: opt.picked ? COLOR.primary : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {opt.picked && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                )}
              </span>
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {slider && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F_SANS, fontSize: 16, color: COLOR.textMuted, marginBottom: 14 }}>
            <span>Not important</span>
            <span>Essential</span>
          </div>
          <div style={{ position: 'relative', height: 8, background: COLOR.border, borderRadius: 999 }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: sliderActive ? `${(sliderValue / 5) * 100}%` : '0%',
              background: COLOR.accent,
              borderRadius: 999,
              transition: 'width .5s ease',
            }} />
            <div style={{
              position: 'absolute', top: '50%',
              left: sliderActive ? `${(sliderValue / 5) * 100}%` : '0%',
              transform: 'translate(-50%, -50%)',
              width: 26, height: 26, borderRadius: '50%',
              background: '#fff', border: `3px solid ${COLOR.accent}`,
              transition: 'left .5s ease',
              boxShadow: '0 4px 10px rgba(0,0,0,.15)',
            }} />
          </div>
          <div style={{ marginTop: 50, fontFamily: F_SANS, fontSize: 18, color: COLOR.textMuted }}>
            Move the slider to weight this priority.
          </div>
        </div>
      )}
    </div>
  );
}

function QuizResults({ t }) {
  const cards = [
    { rank: 1, name: "NEU",    tier: "Strong match",      color: COLOR.success,    bg: COLOR.successSoft, logo: "../assets/logos/neu.png",     price: "£228 / yr",  why: "Largest teaching union — strong on collective action and casework support." },
    { rank: 2, name: "NASUWT", tier: "Good match",        color: COLOR.primary,    bg: COLOR.cream2,      logo: "../assets/logos/nasuwt.png",  price: "£242 / yr",  why: "Teacher-only union with focused casework and a workload-first agenda." },
    { rank: 3, name: "Edapt",  tier: "Worth considering", color: "#B7791F",        bg: "#FAF1E0",         logo: "../assets/logos/edapt.jpg",   price: "£194 / yr",  why: "Apolitical alternative — individual employment support without strikes." },
  ];
  return (
    <div>
      <div style={{ fontFamily: F_SANS, fontSize: 13, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: COLOR.primary, marginBottom: 12 }}>Your results</div>
      <div style={{ fontFamily: F_SERIF, fontSize: 34, color: COLOR.text, marginBottom: 20 }}>
        Rankings based on your answers.
      </div>
      {cards.map((c, i) => {
        const cT = Easing.easeOutCubic(clamp((t - 0.3 - i * 0.35) / 0.5, 0, 1));
        // Expand the "why" panel a beat after the row settles
        const exT = Easing.easeOutCubic(clamp((t - 0.9 - i * 0.35) / 0.5, 0, 1));
        return (
          <div key={c.name} style={{
            background: '#fff',
            border: `1.5px solid ${i === 0 ? c.color : COLOR.border}`,
            borderRadius: 16,
            marginBottom: 10,
            opacity: cT,
            transform: `translateX(${(1 - cT) * 30}px)`,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontFamily: F_SERIF, fontSize: 26, color: COLOR.primary, width: 32 }}>#{c.rank}</div>
              <div style={{ width: 64, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={c.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F_SERIF, fontSize: 20, color: COLOR.text }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: F_SANS, fontSize: 13, color: c.color, padding: '3px 10px', background: c.bg, borderRadius: 999, fontWeight: 600 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: c.color }} />
                    {c.tier}
                  </div>
                  <div style={{ fontFamily: F_SANS, fontSize: 13, color: COLOR.textMuted, fontWeight: 500 }}>
                    {c.price}
                  </div>
                </div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: COLOR.cream2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLOR.primary, fontFamily: F_SANS, fontWeight: 700,
                transform: `rotate(${exT * 180}deg)`,
                transition: 'transform .3s',
                fontSize: 14,
              }}>▾</div>
            </div>
            {/* Expanding "why" panel */}
            <div style={{
              maxHeight: exT * 80,
              opacity: exT,
              transition: 'opacity .3s',
              padding: exT > 0.05 ? '0 18px 14px 78px' : '0 18px 0 78px',
              boxSizing: 'border-box',
            }}>
              <div style={{
                paddingTop: 10,
                borderTop: `1px solid ${COLOR.border}`,
                fontFamily: F_SANS, fontSize: 14, lineHeight: 1.5, color: COLOR.textMuted,
              }}>
                {c.why}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Scene 6: What you get — three callouts ───────────────────────────────────
function SceneWhatYouGet({ start, end }) {
  const cards = [
    { eyebrow: "Match scores", title: "How well each organisation fits your priorities.", icon: "M" },
    { eyebrow: "Personal cost", title: "What it'll actually cost you, not the headline rate.", icon: "£" },
    { eyebrow: "Pros & cons", title: "What they offer, and what to consider.", icon: "⚖" },
  ];
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const exitT = Easing.easeInCubic(clamp((localTime - (duration - 0.6)) / 0.6, 0, 1));
        return (
          <>
            <Eyebrow x={960} y={160} text="What you get" align="center" color="#FFFFFF" />
            <StaggerText
              text="Honest, personalised comparison."
              x={960} y={220} align="center"
              size={72} weight={400} color="#FFFFFF"
              entryDelay={0.1} stagger={0.05}
            />
            <div style={{
              position: 'absolute', left: 160, top: 460, right: 160,
              display: 'flex', gap: 36, opacity: 1 - exitT,
            }}>
              {cards.map((c, i) => {
                const cT = Easing.easeOutCubic(clamp((localTime - 0.9 - i * 0.3) / 0.6, 0, 1));
                return (
                  <div key={i} style={{
                    flex: 1,
                    background: '#fff',
                    border: `1.5px solid ${COLOR.border}`,
                    borderRadius: 24,
                    padding: 36,
                    boxShadow: `0 12px 36px -16px rgba(61, 32, 73, .25)`,
                    opacity: cT,
                    transform: `translateY(${(1 - cT) * 30}px)`,
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 16,
                      background: COLOR.accentSoft,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: F_SERIF, fontSize: 36, color: COLOR.accent, fontWeight: 500,
                      marginBottom: 24,
                    }}>{c.icon}</div>
                    <div style={{ fontFamily: F_SANS, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLOR.primary, marginBottom: 12 }}>
                      {c.eyebrow}
                    </div>
                    <div style={{ fontFamily: F_SERIF, fontSize: 32, color: COLOR.text, lineHeight: 1.2 }}>
                      {c.title}
                    </div>
                  </div>
                );
              })}
            </div>
            <HandWithPhone x={960} y={970} appearAt={2.0} exitT={exitT} />
          </>
        );
      }}
    </Sprite>
  );
}

// Clipart hand holding a phone, with quiz results on the screen. Decorative.
function HandWithPhone({ x, y, appearAt = 0, exitT = 0 }) {
  const { localTime } = useSprite();
  const t = clamp(localTime - appearAt, 0, 99);
  const op = Easing.easeOutCubic(clamp(t / 0.6, 0, 1)) * (1 - exitT);
  const rise = (1 - Easing.easeOutCubic(clamp(t / 0.6, 0, 1))) * 24;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) translateY(${rise}px)`,
      opacity: op,
    }}>
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none">
        {/* Phone shadow */}
        <ellipse cx="130" cy="190" rx="80" ry="6" fill={COLOR.primary} opacity="0.15" />
        {/* Hand / forearm */}
        <path d="M40 180 Q60 120 100 110 L100 180 Z" fill="#F2D5C6" />
        <path d="M180 180 L180 130 Q200 130 210 160 L210 180 Z" fill="#F2D5C6" />
        {/* Cuff */}
        <rect x="36" y="172" width="68" height="14" rx="6" fill={COLOR.primary} />
        {/* Phone body */}
        <rect x="78" y="20" width="104" height="160" rx="14" fill="#1a1418" />
        <rect x="84" y="32" width="92" height="138" rx="6" fill={COLOR.cream} />
        {/* Top status bar */}
        <rect x="84" y="32" width="92" height="14" rx="6" fill="#fff" />
        <circle cx="130" cy="39" r="2" fill="#1a1418" />
        {/* Screen content — mini results */}
        <rect x="92" y="56" width="76" height="6" rx="2" fill={COLOR.primary} opacity="0.6" />
        <rect x="92" y="68" width="60" height="4" rx="2" fill={COLOR.textMuted} opacity="0.5" />
        {/* Three result rows */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(92 ${82 + i * 28})`}>
            <rect width="76" height="22" rx="4" fill="#fff" stroke={COLOR.border} strokeWidth="1" />
            <text x="6" y="15" fontFamily="serif" fontSize="9" fontWeight="700" fill={COLOR.primary}>#{i + 1}</text>
            <rect x="18" y="6" width="22" height="10" rx="2" fill={i === 0 ? COLOR.success : i === 1 ? COLOR.primary : "#B7791F"} opacity="0.8" />
            <rect x="44" y="9" width="26" height="3" rx="1.5" fill={COLOR.text} opacity="0.6" />
            <rect x="44" y="14" width="18" height="2.5" rx="1" fill={COLOR.textMuted} opacity="0.5" />
          </g>
        ))}
        {/* Home indicator */}
        <rect x="115" y="172" width="30" height="3" rx="1.5" fill="#1a1418" />
      </svg>
    </div>
  );
}

// ── Scene 7: Trust line ──────────────────────────────────────────────────────
function SceneTrust({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime }) => (
        <>
          <StaggerText
            text="The tool is free and independent."
            x={960} y={300} align="center"
            size={84} weight={400} color={COLOR.text}
            entryDelay={0.1} stagger={0.08}
          />
          <StaggerText
            text="No account creation needed."
            x={960} y={420} align="center"
            size={84} weight={400} color={COLOR.primary}
            entryDelay={0.9} stagger={0.06}
          />
          <p style={{
            position: 'absolute', left: 960, top: 540, transform: 'translateX(-50%)', margin: 0,
            fontFamily: F_SANS, fontSize: 26, color: COLOR.textMuted,
            opacity: Easing.easeOutCubic(clamp((localTime - 1.8) / 0.6, 0, 1)),
            textAlign: 'center', maxWidth: 1100,
          }}>
            Built by teachers for teachers.
          </p>
        </>
      )}
    </Sprite>
  );
}

// Clipart female teacher with a speech-bubble quote.
function TeacherTestimonial({ x, y, appearAt = 0 }) {
  const { localTime } = useSprite();
  const t = clamp(localTime - appearAt, 0, 99);
  const op = Easing.easeOutCubic(clamp(t / 0.6, 0, 1));
  const bubbleT = Easing.easeOutBack(clamp((t - 0.3) / 0.6, 0, 1));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: op }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        {/* Mini female teacher avatar */}
        <svg width="160" height="180" viewBox="0 0 160 180" fill="none">
          <path d="M30 180 L30 122 Q30 100 80 100 Q130 100 130 122 L130 180 Z" fill={COLOR.accent} />
          {/* Hair back */}
          <path d="M40 88 Q40 36 80 30 Q120 36 120 88 L122 110 L38 110 Z" fill={COLOR.primaryDeeper} />
          <circle cx="80" cy="76" r="32" fill="#F2D5C6" />
          {/* Hair fringe */}
          <path d="M50 70 Q52 38 80 36 Q108 38 110 70 Q100 56 80 60 Q60 56 50 70 Z" fill={COLOR.primaryDeeper} />
          {/* Eyes */}
          <ellipse cx="68" cy="80" rx="2.5" ry="3.5" fill={COLOR.text} />
          <ellipse cx="92" cy="80" rx="2.5" ry="3.5" fill={COLOR.text} />
          {/* Cheeks */}
          <circle cx="60" cy="92" r="4" fill={COLOR.accent} opacity="0.35" />
          <circle cx="100" cy="92" r="4" fill={COLOR.accent} opacity="0.35" />
          {/* Smile */}
          <path d="M70 100 Q80 108 90 100" stroke={COLOR.text} strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        {/* Speech bubble with testimonial */}
        <div style={{
          position: 'relative',
          background: '#fff',
          border: `2px solid ${COLOR.border}`,
          borderRadius: 22,
          padding: '24px 32px',
          maxWidth: 720,
          boxShadow: '0 12px 32px -16px rgba(61,32,73,.25)',
          transform: `scale(${0.85 + 0.15 * bubbleT})`,
          transformOrigin: 'left center',
          opacity: bubbleT,
        }}>
          {/* Bubble tail */}
          <div style={{
            position: 'absolute', left: -16, top: 50,
            width: 0, height: 0,
            borderTop: '12px solid transparent',
            borderBottom: '12px solid transparent',
            borderRight: `16px solid ${COLOR.border}`,
          }} />
          <div style={{
            position: 'absolute', left: -13, top: 52,
            width: 0, height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: `14px solid #fff`,
          }} />
          <div style={{ fontFamily: F_SERIF, fontSize: 28, color: COLOR.text, lineHeight: 1.35, fontStyle: 'italic' }}>
            "Wish I'd had this when I was choosing my first union."
          </div>
          <div style={{ fontFamily: F_SANS, fontSize: 16, color: COLOR.textMuted, marginTop: 8 }}>
            — A teacher, somewhere
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scene 8: CTA ─────────────────────────────────────────────────────────────
function SceneCTA({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime }) => {
        const t = Easing.easeOutBack(clamp(localTime / 0.7, 0, 1));
        const pulse = 1 + Math.sin(localTime * 4) * 0.015;
        return (
          <>
            <div style={{
              position: 'absolute', left: 960, top: 380,
              transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * t})`,
              opacity: t,
              display: 'flex', alignItems: 'center', gap: 22,
            }}>
              <img src="../assets/brand/wtu-mark.png" alt="" style={{ height: 110 }} />
              <div style={{
                fontFamily: F_SERIF, fontSize: 80, color: COLOR.primary,
                fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1,
              }}>
                Teaching Union Match
              </div>
            </div>
            <div style={{
              position: 'absolute', left: 960, top: 580,
              transform: 'translate(-50%, -50%)',
              fontFamily: F_SERIF, fontSize: 60, color: COLOR.text, textAlign: 'center',
              opacity: Easing.easeOutCubic(clamp((localTime - 0.6) / 0.5, 0, 1)),
              maxWidth: 1500, lineHeight: 1.2,
            }}>
              Find your fit in 2 minutes.
            </div>
            <div style={{
              position: 'absolute', left: 960, top: 760,
              transform: `translate(-50%, -50%) scale(${pulse})`,
              padding: '22px 44px', borderRadius: 999,
              background: COLOR.accent, color: '#fff',
              fontFamily: F_SANS, fontSize: 32, fontWeight: 600,
              boxShadow: '0 12px 32px -8px rgba(224, 122, 95, .55)',
              opacity: Easing.easeOutCubic(clamp((localTime - 1.2) / 0.5, 0, 1)),
            }}>
              teachingunionmatch.com
            </div>
          </>
        );
      }}
    </Sprite>
  );
}

// ── Background — soft animated gradient bg used between scenes ───────────────
function StageBackground({ tint = 'cream' }) {
  const time = useTime();
  const drift = Math.sin(time * 0.15) * 40;
  const bg =
    tint === 'purple'
      ? `radial-gradient(circle at ${50 + drift / 10}% ${30 + drift / 20}%, ${COLOR.primary} 0%, ${COLOR.primaryDeeper} 100%)`
    : tint === 'white'
      ? '#FFFFFF'
      : `radial-gradient(circle at ${50 + drift / 8}% ${50 + drift / 10}%, ${COLOR.cream} 0%, ${COLOR.cream2} 100%)`;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: bg,
      transition: 'background .8s ease',
    }} />
  );
}

// Picks the right background tint per second of the timeline.
function DynamicBackground({ schedule }) {
  // schedule = [{ tint, until }, ...] sorted by `until`
  const time = useTime();
  let tint = schedule[schedule.length - 1].tint;
  for (const s of schedule) {
    if (time < s.until) { tint = s.tint; break; }
  }
  return <StageBackground tint={tint} />;
}

Object.assign(window, {
  COLOR, F_SERIF, F_SANS,
  FadeBox, StaggerText, Eyebrow,
  SceneHook, SceneDecision, SceneReveal, SceneDifferences,
  SceneQuiz, SceneWhatYouGet, SceneTrust, SceneCTA,
  StageBackground, DynamicBackground,
});
