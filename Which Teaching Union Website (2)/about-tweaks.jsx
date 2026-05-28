// ─────────────────────────────────────────────────────────────────
// About page — Tweaks panel.
// Three expressive controls that reshape the feel of the page rather
// than nudge individual pixels:
//   • Type voice  — swap the entire serif/sans pairing
//   • Atmosphere  — palette + photo treatment preset
//   • Flourish    — restrained / editorial / full magazine treatment
// ─────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "font": "editorial",
  "atmosphere": "plum",
  "flourish": "plain"
}/*EDITMODE-END*/;

const FONT_OPTIONS = [
  { value: "editorial", label: "Editorial" },
  { value: "modern",    label: "Modern"    },
  { value: "classic",   label: "Classic"   },
];

const ATMOSPHERE_OPTIONS = [
  { value: "plum",  label: "Plum & coral",  swatch: ["#6E3B7E", "#E07A5F", "#F5EDF6"] },
  { value: "ink",   label: "Ink & moss",    swatch: ["#2E4053", "#7C9A8C", "#EAE6DC"] },
  { value: "cream", label: "Cream & rust",  swatch: ["#8B3A1F", "#C28840", "#F3E9D0"] },
];

const FLOURISH_OPTIONS = [
  { value: "plain",     label: "Plain"     },
  { value: "editorial", label: "Editorial" },
  { value: "magazine",  label: "Magazine"  },
];

function applyTweaks(t) {
  document.documentElement.setAttribute("data-font", t.font || "editorial");
  document.documentElement.setAttribute("data-atmosphere", t.atmosphere || "plum");
  document.body.setAttribute("data-flourish", t.flourish || "plain");
}

// Apply persisted defaults BEFORE the React tree mounts, so the first
// paint already reflects the user's last choice (no flash).
applyTweaks(TWEAK_DEFAULTS);

function AtmospherePicker({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {ATMOSPHERE_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            style={{
              background: active ? "#fff" : "rgba(255,255,255,0.6)",
              border: "1.5px solid " + (active ? "#111" : "rgba(0,0,0,0.14)"),
              borderRadius: 10,
              padding: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "stretch",
              transition: "border-color .15s ease, background .15s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                borderRadius: 6,
                overflow: "hidden",
                height: 28,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              {opt.swatch.map((c, i) => (
                <div key={i} style={{ flex: i === 0 ? 1.4 : 1, background: c }} />
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                textAlign: "center",
                fontWeight: 600,
                color: active ? "#111" : "#666",
                letterSpacing: "0.01em",
                lineHeight: 1.2,
              }}
            >
              {opt.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AboutTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    applyTweaks(t);
  }, [t.font, t.atmosphere, t.flourish]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Type voice">
        <TweakRadio
          label=""
          value={t.font}
          options={FONT_OPTIONS}
          onChange={(v) => setTweak("font", v)}
        />
        <div
          style={{
            fontSize: 11,
            color: "#888",
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          Swaps the whole serif + sans pairing across headings and body.
        </div>
      </TweakSection>

      <TweakSection label="Atmosphere">
        <AtmospherePicker
          value={t.atmosphere}
          onChange={(v) => setTweak("atmosphere", v)}
        />
        <div
          style={{
            fontSize: 11,
            color: "#888",
            marginTop: 8,
            lineHeight: 1.4,
          }}
        >
          Recolours the palette and the duotone wash on the hero portrait.
        </div>
      </TweakSection>

      <TweakSection label="Flourish">
        <TweakRadio
          label=""
          value={t.flourish}
          options={FLOURISH_OPTIONS}
          onChange={(v) => setTweak("flourish", v)}
        />
        <div
          style={{
            fontSize: 11,
            color: "#888",
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          Adds editorial treatments — drop cap, numbered sections, pull quote.
        </div>
      </TweakSection>
    </TweaksPanel>
  );
}

const _aboutTweaksMount = document.createElement("div");
document.body.appendChild(_aboutTweaksMount);
ReactDOM.createRoot(_aboutTweaksMount).render(<AboutTweaks />);
