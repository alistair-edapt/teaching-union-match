// explainer.jsx — composes the timeline for both 90s and 30s cuts.

const { Stage } = window;
const {
  SceneHook, SceneDecision, SceneReveal, SceneDifferences,
  SceneQuiz, SceneWhatYouGet, SceneTrust, SceneCTA,
  DynamicBackground,
} = window;

// ── Long cut (90 seconds) ────────────────────────────────────────────────────
// Scene timing:
//  0 –  8   Hook
//  8 – 18   Decision
// 18 – 32   Reveal (16 logos)
// 32 – 48   Differences
// 48 – 64   Quiz UI
// 64 – 78   What you get
// 78 – 86   Trust
// 86 – 90   CTA
function LongCut() {
  return (
    <>
      <DynamicBackground schedule={[
        { tint: 'cream',  until: 18 },
        { tint: 'purple', until: 32 },
        { tint: 'cream',  until: 64 },
        { tint: 'purple', until: 78 },
        { tint: 'cream',  until: 86 },
        { tint: 'white',  until: 999 },
      ]} />
      <SceneHook        start={0}  end={8} />
      <SceneDecision    start={8}  end={18} />
      <SceneReveal      start={18} end={32} />
      <SceneDifferences start={32} end={48} />
      <SceneQuiz        start={48} end={64} />
      <SceneWhatYouGet  start={64} end={78} />
      <SceneTrust       start={78} end={86} />
      <SceneCTA         start={86} end={90} />
    </>
  );
}

// ── Short cut (30 seconds) ───────────────────────────────────────────────────
// Compressed: hook → reveal → quiz → CTA.
//  0 – 5    Hook (compressed)
//  5 – 13   Reveal
// 13 – 25   Quiz
// 25 – 30   CTA
function ShortCut() {
  return (
    <>
      <DynamicBackground schedule={[
        { tint: 'cream',  until: 5 },
        { tint: 'purple', until: 13 },
        { tint: 'cream',  until: 25 },
        { tint: 'white',  until: 999 },
      ]} />
      <SceneHook    start={0}  end={5} />
      <SceneReveal  start={5}  end={13} />
      <SceneQuiz    start={13} end={25} />
      <SceneCTA     start={25} end={30} />
    </>
  );
}

// ── Mount ────────────────────────────────────────────────────────────────────
function App() {
  // Read cut from URL hash so switcher persists across reloads.
  const [cut, setCut] = React.useState(() => {
    const h = window.location.hash.replace('#', '');
    return h === 'short' ? 'short' : 'long';
  });

  React.useEffect(() => {
    // Wire the top-right cut switcher.
    const buttons = document.querySelectorAll('#cutSwitcher button');
    const onClick = (e) => {
      const c = e.currentTarget.getAttribute('data-cut');
      setCut(c);
      window.location.hash = c;
      buttons.forEach(b => b.classList.toggle('active', b.getAttribute('data-cut') === c));
    };
    buttons.forEach(b => {
      b.addEventListener('click', onClick);
      b.classList.toggle('active', b.getAttribute('data-cut') === cut);
    });
    return () => buttons.forEach(b => b.removeEventListener('click', onClick));
  }, [cut]);

  const duration = cut === 'short' ? 30 : 90;

  return (
    <Stage
      key={cut} /* remount + reset playhead on switch */
      width={1920}
      height={1080}
      duration={duration}
      background="#FCF8FD"
      autoplay={true}
      loop={true}
      persistKey={`explainer:${cut}`}
    >
      {cut === 'short' ? <ShortCut /> : <LongCut />}
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
