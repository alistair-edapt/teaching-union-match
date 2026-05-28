// Quiz component. Renders the full multi-step quiz + results screen.
// Requires: window.ORGS, window.NATIONS, window.ROLES, window.QUIZ.
// Exposed as window.Quiz.

const { useState, useEffect, useMemo, useRef } = React;

// ── Small primitives ───────────────────────────────────────────────────────
function Progress({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ height: 4, background: "var(--c-border)", borderRadius: 2, overflow: "hidden", marginBottom: 28 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--c-primary), var(--c-accent))", transition: "width .45s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function OptionButton({ option, selected, onSelect, index }) {
  const sel = selected === option.id;
  const hasFlag = option.flag || option.emoji;
  return (
    <button
      onClick={() => onSelect(option.id)}
      className="quiz-option"
      style={{
        width: "100%", textAlign: "left", padding: "18px 20px",
        border: `1.5px solid ${sel ? "var(--c-primary)" : "var(--c-border)"}`,
        background: sel ? "var(--c-background-2)" : "var(--c-surface)",
        borderRadius: 14, cursor: "pointer", display: "flex", gap: 14, alignItems: "center",
        transition: "all .2s ease",
        animation: `fadeUp .35s ease ${index * 0.05}s both`,
        boxShadow: sel ? "0 0 0 4px rgba(110,59,126,0.08)" : "none",
      }}
    >
      {hasFlag ? (
        option.flag
          ? <img src={option.flag} alt="" className="flag-tile-img"/>
          : <span style={{
              width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 34, lineHeight: 1, flexShrink: 0,
              borderRadius: 8, background: "var(--c-background-2)",
            }}>{option.emoji}</span>
      ) : (
        <span style={{
          width: 20, height: 20, borderRadius: "50%",
          border: `2px solid ${sel ? "var(--c-primary)" : "var(--c-border-strong)"}`,
          background: sel ? "var(--c-primary)" : "transparent",
          flexShrink: 0, marginTop: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s ease",
        }}>
          {sel && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
      )}
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontWeight: 600, fontSize: 16, color: "var(--c-text)", marginBottom: option.desc ? 4 : 0 }}>{option.label}</span>
        {option.desc && <span style={{ display: "block", fontSize: 14, color: "var(--c-text-muted)", lineHeight: 1.55 }}>{option.desc}</span>}
      </span>
      {hasFlag && sel && (
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ color: "var(--c-primary)", flexShrink: 0 }}><path d="M4 9l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </button>
  );
}

// ── Slider input (for the FTE step) ────────────────────────────────────────
// Native range input styled to match the quiz design language. Unlike the
// option buttons, the slider does not auto-advance — the user gets a
// "Continue →" button so they can settle on a value before committing.
function SliderInput({ question, value, onChange, onContinue }) {
  const v = Number(value);
  const label = question.formatLabel ? question.formatLabel(v) : `${v.toFixed(1)} FTE`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "fadeUp .35s ease" }}>
      <div style={{
        padding: "20px 22px",
        background: "var(--c-background-2)",
        borderRadius: 14,
        border: "1px solid var(--c-border)",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "var(--f-serif)",
          fontSize: 36,
          color: "var(--c-primary)",
          lineHeight: 1.1,
          marginBottom: 4,
        }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: "var(--c-text-muted)" }}>
          Drag to adjust — defaults to full-time.
        </div>
      </div>

      <input
        type="range"
        min={question.min}
        max={question.max}
        step={question.step}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--c-primary)" }}
        aria-label={question.text}
      />

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--c-text-subtle)", marginTop: -14 }}>
        <span>{question.min.toFixed(1)} (very part-time)</span>
        <span>{question.max.toFixed(1)} (full-time)</span>
      </div>

      <button
        onClick={onContinue}
        className="btn btn-primary btn-lg"
        style={{ alignSelf: "flex-end" }}
      >
        See your results →
      </button>
    </div>
  );
}

// ── Multi-select input (tick as many as apply) ────────────────────────────
// Used for questions where more than one answer can be true — e.g. "Which
// extra benefits would you value?". Does not auto-advance; user commits via
// an explicit Continue button so they can settle on their ticks. The "none"
// option (where present) is exclusive — ticking it clears the others and
// vice versa.
function MultiSelectInput({ question, selected, onChange, onContinue }) {
  const toggle = (id) => {
    const isNone = id === "none";
    const currentlyHasNone = selected.includes("none");

    if (isNone) {
      // Toggle "none" exclusively — either becomes the only selection or clears.
      onChange(selected.includes("none") ? [] : ["none"]);
      return;
    }

    // Ticking any real option clears "none" if it was set
    const withoutNone = selected.filter(x => x !== "none");
    if (withoutNone.includes(id)) {
      onChange(withoutNone.filter(x => x !== id));
    } else {
      onChange([...withoutNone, id]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp .35s ease" }}>
      {question.options.map((o, i) => {
        const isChecked = selected.includes(o.id);
        return (
          <button
            key={o.id}
            onClick={() => toggle(o.id)}
            className="quiz-option"
            style={{
              width: "100%", textAlign: "left", padding: "18px 20px",
              border: `1.5px solid ${isChecked ? "var(--c-primary)" : "var(--c-border)"}`,
              background: isChecked ? "var(--c-background-2)" : "var(--c-surface)",
              borderRadius: 14, cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start",
              transition: "all .2s ease",
              animation: `fadeUp .35s ease ${i * 0.05}s both`,
              boxShadow: isChecked ? "0 0 0 4px rgba(110,59,126,0.08)" : "none",
            }}
          >
            {/* Checkbox — square not circle, to make the multi-select semantics visually distinct */}
            <span style={{
              width: 20, height: 20, borderRadius: 4,
              border: `2px solid ${isChecked ? "var(--c-primary)" : "var(--c-border-strong)"}`,
              background: isChecked ? "var(--c-primary)" : "transparent",
              flexShrink: 0, marginTop: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s ease",
            }}>
              {isChecked && (
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 16, color: "var(--c-text)", marginBottom: o.desc ? 4 : 0 }}>{o.label}</span>
              {o.desc && <span style={{ display: "block", fontSize: 14, color: "var(--c-text-muted)", lineHeight: 1.55 }}>{o.desc}</span>}
            </span>
          </button>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{ fontSize: 13, color: "var(--c-text-muted)" }}>
          {selected.length === 0 ? "Tick any that apply — or none." : `${selected.length} selected`}
        </span>
        <button
          onClick={onContinue}
          className="btn btn-primary"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}


// Filter a costs object down to entries relevant to the user's role.
// Classifies each cost line-item by a set of keyword rules, then returns only
// items tagged with the user's role (plus universal items like offers).
// Falls back to ALL entries if the user's role yields nothing (defensive).
function filterCostsByRole(costs, role) {
  const all = Object.entries(costs || {});
  if (!role) return all;
  const matches = [];
  for (const [k, v] of all) {
    const key = k.toLowerCase();
    const isTeacher   = /teacher|teaching staff|nqt|qualifying|ect|post-qual|probation|\bm[0-9]\b|ups|mps/.test(key);
    const isLeader    = /lead|head|deput|principal|ceo|exec|assistant head|vice|faculty|middle leader|bursar|business (leader|manager)|children's centre|senior postholder|professional associate/.test(key);
    const isSupport   = /support staff|school support|\bta\b|admin|apprentice|>21|≤21|>20|≤20|full-time \(>|part-time \(≤/.test(key);
    const isTrainee   = /trainee|student|pgce|itt|new member offer|newly qualified|first year|new entrant/.test(key);
    const isSupply    = /supply|peripatetic|part-time \/ job|job[- ]share/.test(key);
    // Universal items always shown (pricing notes, offers with no role marker)
    const isUniversal = /offer/.test(key) && !isTeacher && !isLeader && !isSupport && !isTrainee;

    const roleMatch = (
      (role === 'teacher' && isTeacher) ||
      (role === 'leader'  && isLeader) ||
      (role === 'support' && isSupport) ||
      (role === 'trainee' && (isTrainee || isTeacher)) ||
      (role === 'supply'  && (isSupply || isTeacher))
    );
    if (roleMatch || isUniversal) matches.push([k, v]);
  }
  // If role-filtering removed everything (unusual org schema), fall back to all
  return matches.length ? matches : all;
}

function ResultCard({ entry, reasons, antiReasons, rank, isTop, defaultOpen, personalCost, userRole }) {
  const [open, setOpen] = useState(defaultOpen);
  const o = entry.org;
  const tier = window.QUIZ.tier(entry.pct);
  // "Less likely fit" tier — show the gap analysis instead of the positive
  // reasons section, so users understand why this org dropped to the bottom.
  const isLessLikely = tier.label === "Less likely fit";

  return (
    <article className="card" style={{ overflow: "hidden", borderColor: isTop ? "var(--c-primary)" : "var(--c-border)" }}>
      <header
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 18, padding: "18px 22px",
          cursor: "pointer", background: isTop ? "var(--c-background-2)" : "var(--c-surface)",
        }}
      >
        <div style={{
          width: 72, height: 56, flexShrink: 0,
          background: "#fff", border: "1px solid var(--c-border)", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 6,
        }}>
          <img src={o.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
            <h3 style={{ fontSize: 20, fontFamily: "var(--f-serif)", margin: 0 }}>{o.short}</h3>
            {isTop && <span className="chip" style={{ background: "var(--c-accent-soft)", color: "var(--c-accent-hover)", borderColor: "var(--c-accent-soft)" }}>#{rank+1} · Closest to your answers</span>}
            {!isTop && <span className="tag">#{rank+1}</span>}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--c-text-muted)" }}>{o.type} · {o.name}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 999,
            background: tier.bg, color: tier.color,
            fontWeight: 600, fontSize: 13.5,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: tier.color }} />
            {tier.label}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", color: "var(--c-text-subtle)" }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </header>

      {open && (
        <div style={{ padding: "4px 22px 22px", borderTop: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
          <p style={{ marginTop: 18, fontSize: 15, color: "var(--c-text)", lineHeight: 1.6 }}>{o.description}</p>

          {o.politicalStance && (() => {
            const t = o.politicalStance.tier;
            const palette = t === "fully_apolitical"
              ? { bg: "rgba(46, 160, 67, 0.10)", border: "rgba(46, 160, 67, 0.35)", dot: "var(--c-success)" }
              : t === "neutral_no_fund"
              ? { bg: "rgba(99, 102, 241, 0.10)", border: "rgba(99, 102, 241, 0.35)", dot: "#6366f1" }
              : t === "fund_no_party"
              ? { bg: "rgba(234, 179, 8, 0.10)", border: "rgba(234, 179, 8, 0.40)", dot: "#eab308" }
              : { bg: "rgba(220, 38, 38, 0.10)", border: "rgba(220, 38, 38, 0.35)", dot: "#dc2626" };
            return (
              <section style={{ marginTop: 16, padding: "14px 16px", background: palette.bg, border: "1px solid " + palette.border, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: palette.dot, flexShrink: 0 }}></span>
                  <span style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, color: "var(--c-text-muted)" }}>Political stance</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>{o.politicalStance.label}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--c-text)", lineHeight: 1.55 }}>{o.politicalStance.summary}</p>
              </section>
            );
          })()}

          {/* Why this fits / why it doesn't — concise, no formula exposition.
              For "Less likely fit" results we show the gap analysis instead. */}
          {isLessLikely && antiReasons && antiReasons.length > 0 ? (
            <section style={{ marginTop: 22, padding: "16px 18px", background: "rgba(142, 130, 146, 0.10)", borderRadius: 12, border: "1px solid rgba(142, 130, 146, 0.30)" }}>
              <div style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, color: "#6E5F71", marginBottom: 10 }}>
                Why this is a less likely fit
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {antiReasons.map(r => (
                  <li key={r.axis} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.5 }}>
                    <span style={{ fontSize: 16, color: "#8E8292", flexShrink: 0, lineHeight: 1.2 }}>✕</span>
                    <span style={{ color: "var(--c-text)" }}>
                      {r.kind === "missing"
                        ? <>You wanted <b>{window.QUIZ.AXIS_LABELS[r.axis].toLowerCase()}</b> — not a strong area for {o.short}.</>
                        : <>You'd prefer to avoid <b>{window.QUIZ.AXIS_LABELS[r.axis].toLowerCase()}</b> — {o.short} leans into this.</>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (reasons && reasons.length > 0 && (
            <section style={{ marginTop: 22, padding: "16px 18px", background: "var(--c-background)", borderRadius: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, color: "var(--c-primary)", marginBottom: 10 }}>
                Why this suits your answers
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {reasons.map(r => (
                  <li key={r.axis} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <span style={{ fontSize: 16, color: "var(--c-primary)" }}>✓</span>
                    <span style={{ color: "var(--c-text)" }}>{window.QUIZ.AXIS_LABELS[r.axis]}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 22 }} className="result-split">
            <div>
              <h4 style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-text-muted)", marginBottom: 10 }}>What they offer</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {o.strengths.map((s, i) => <li key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--c-text)", lineHeight: 1.55 }}><span style={{ color: "var(--c-success)" }}>✓</span>{s}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-text-muted)", marginBottom: 10 }}>Things to weigh up</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {o.considerations.map((s, i) => <li key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--c-text-muted)", lineHeight: 1.55 }}><span style={{ color: "var(--c-warning)" }}>•</span>{s}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 22, padding: "16px 18px", background: "var(--c-background-2)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <h4 style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-primary)" }}>Indicative costs</h4>
              <span className="mono" style={{ fontSize: 11, color: "var(--c-text-subtle)" }}>verify on their site</span>
            </div>

            {/* Personalised band — shown when the engine can compute a real
                figure from role + nation + FTE + (optionally) ECT year. Falls
                through to just the qualitative table when null (e.g. UNISON). */}
            {personalCost && (
              <div style={{
                marginBottom: 12, padding: "12px 14px",
                background: "var(--c-surface)", border: "1px solid var(--c-border)",
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--c-text-muted)", marginBottom: 4 }}>
                  Estimated for your situation
                </div>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, color: "var(--c-text)", lineHeight: 1.15 }}>
                  {personalCost.display}
                </div>
                {personalCost.note && (
                  <div style={{ fontSize: 12.5, color: "var(--c-text-subtle)", marginTop: 4 }}>
                    {personalCost.note}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filterCostsByRole(o.costs, userRole).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", borderBottom: "1px dashed var(--c-border)" }}>
                  <span style={{ color: "var(--c-text-muted)" }}>{k}</span>
                  <span style={{ color: "var(--c-text)", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <a href={`https://www.${o.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" data-outbound={entry.key}>
              Visit {o.website}
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 2h6v6M10 2L2 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </a>
            <a href={`https://www.${o.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-outbound={entry.key}>
              See joining options
            </a>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Main quiz app ──────────────────────────────────────────────────────────
function Quiz() {
  const [stage, setStage] = useState("intro"); // intro | quiz | results
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { nation, role, priority, ... }
  const scrollRef = useRef(null);

  // Restore from URL hash (for share link) or localStorage. Saved sessions
  // are tagged with the current schema version; mismatches are discarded
  // rather than restored (prevents v1 sessions referencing the now-removed
  // 'politics' question from breaking the engine).
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#r=")) {
        const data = JSON.parse(atob(decodeURIComponent(hash.slice(3))));
        if (data.answers && data.answers.nation && data.answers.role
            && data.v === window.WTU_SCHEMA_VERSION) {
          setAnswers(data.answers);
          setStage("results");
          return;
        }
      }
      const saved = localStorage.getItem("wtu_quiz");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.stage && d.v === window.WTU_SCHEMA_VERSION) {
          setStage(d.stage);
          setAnswers(d.answers || {});
          setQIndex(d.qIndex || 0);
        } else if (d.stage) {
          // Schema mismatch: drop the stale session silently.
          localStorage.removeItem("wtu_quiz");
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wtu_quiz", JSON.stringify({
        stage, answers, qIndex, v: window.WTU_SCHEMA_VERSION,
      }));
    } catch {}
  }, [stage, answers, qIndex]);

  // Question list — built dynamically so conditional routing branches show/hide
  // based on what the user has already answered. Routing flow:
  //   R1 (role) → conditional R2/R3/R4 → R5 (nation) → Q1–Q9 → FTE slider
  // The list is recomputed whenever answers change so progress + back behave
  // sensibly when a previous answer rules a downstream routing question
  // in or out (e.g. switching from teacher to supply hides the years-qualified
  // step).
  const questions = useMemo(() => {
    const routing = window.QUIZ.ROUTING_QUESTIONS.filter(q => !q.showIf || q.showIf(answers));
    return [...routing, ...window.QUIZ.CORE_QUESTIONS, window.QUIZ.FTE_QUESTION];
  }, [answers]);

  const totalQuestions = questions.length;
  const currentQ = questions[qIndex];

  // If the live question list shrinks beneath the current index (e.g. user
  // went back and changed R1 from teacher → supply, removing R3 from the
  // flow), clamp qIndex back into bounds. Without this the user can land on
  // an undefined question and crash the render.
  useEffect(() => {
    if (qIndex >= questions.length) {
      setQIndex(Math.max(0, questions.length - 1));
    }
  }, [questions.length, qIndex]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [qIndex, stage]);

  const setAnswer = (qid, aid) => setAnswers(p => ({ ...p, [qid]: aid }));

  const handleSelect = (aid) => {
    setAnswer(currentQ.id, aid);
    window.WTU_ANALYTICS?.event('quiz_answer', { question: currentQ.id, answer: aid, step: qIndex + 1 });
    // Auto-advance for option questions only. Sliders need an explicit
    // Continue press so the user can drag, settle on a value, then commit.
    if (currentQ.type === "slider") return;
    setTimeout(() => {
      if (qIndex < totalQuestions - 1) setQIndex(qIndex + 1);
      else setStage("results");
    }, 260);
  };

  // Explicit commit for the FTE slider — moves to the next step (results,
  // since FTE is the last question) without an auto-advance race.
  const handleSliderContinue = () => {
    // Make sure the slider's current value is captured even if the user
    // never moved it from the default.
    if (currentQ.type === "slider" && answers[currentQ.id] == null) {
      setAnswer(currentQ.id, currentQ.default);
    }
    window.WTU_ANALYTICS?.event('quiz_answer', {
      question: currentQ.id,
      answer: answers[currentQ.id] ?? currentQ.default,
      step: qIndex + 1,
    });
    if (qIndex < totalQuestions - 1) setQIndex(qIndex + 1);
    else setStage("results");
  };

  // Multi-select commit — same flow as slider, but also handles the case
  // where the user hasn't ticked anything yet (allowed — records empty
  // array so scoring treats them as not having indicated any preference).
  const handleMultiContinue = () => {
    if (currentQ.type === "multi" && answers[currentQ.id] == null) {
      setAnswer(currentQ.id, []);
    }
    window.WTU_ANALYTICS?.event('quiz_answer', {
      question: currentQ.id,
      answer: (answers[currentQ.id] || []).join(","),
      step: qIndex + 1,
    });
    if (qIndex < totalQuestions - 1) setQIndex(qIndex + 1);
    else setStage("results");
  };

  const back = () => {
    if (qIndex === 0) setStage("intro");
    else setQIndex(qIndex - 1);
  };

  const restart = () => {
    setStage("intro");
    setAnswers({});
    setQIndex(0);
    try { localStorage.removeItem("wtu_quiz"); } catch {}
    window.history.replaceState(null, "", window.location.pathname);
  };

  const results = useMemo(() => {
    if (stage !== "results" || !answers.nation || !answers.role) return null;
    return window.QUIZ.score({ role: answers.role, nation: answers.nation, answers });
  }, [stage, answers]);

  // Fire analytics when results appear + bind outbound links once rendered
  useEffect(() => {
    if (stage === "results" && results?.ranked?.length) {
      const top = results.ranked[0];
      window.WTU_ANALYTICS?.event('quiz_complete', {
        nation: answers.nation,
        role: answers.role,
        top_match: top?.key,
        top_match_tier: window.QUIZ.tier(top?.pct).label,
        result_count: results.ranked.length,
      });
      // Log each result view (limit to the top 5 so we don't pollute)
      results.ranked.slice(0, 5).forEach((entry, i) => {
        window.WTU_ANALYTICS?.event('result_view', {
          org_slug: entry.key,
          rank: i + 1,
          tier: window.QUIZ.tier(entry.pct).label,
          nation: answers.nation,
          role: answers.role,
        });
      });
      // Wire outbound tracking on the freshly rendered links
      setTimeout(() => window.WTU_ANALYTICS?.bindOutboundLinks(), 50);
    }
  }, [stage, results]);

  // Share link (encodes answers into URL hash — no server). Schema version
  // is included so a stale link from a previous version is silently ignored
  // by the decoder rather than producing garbage results.
  const [copyText, setCopyText] = useState("Copy share link");
  const shareLink = () => {
    const encoded = btoa(JSON.stringify({ answers, v: window.WTU_SCHEMA_VERSION }));
    const url = `${window.location.origin}${window.location.pathname}#r=${encoded}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopyText("Link copied ✓");
      setTimeout(() => setCopyText("Copy share link"), 2200);
    });
  };

  // ── Intro ──
  if (stage === "intro") {
    return (
      <div ref={scrollRef} style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="card" style={{ padding: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>Compare your options</div>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", marginBottom: 16, lineHeight: 1.1 }}>
            A few questions, then your options — side by side.
          </h1>
          <p style={{ fontSize: 17, color: "var(--c-text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
            A short set of questions, around two minutes. No sign-up, no email, no tracking. Your answers stay in your browser.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }} className="intro-stats">
            {[
              { n: "All", l: "the major options compared" },
              { n: "4",   l: "UK nations covered" },
              { n: "0",   l: "bits of personal data collected" },
            ].map((s, i) => (
              <div key={i} style={{ padding: 16, background: "var(--c-background-2)", borderRadius: 12 }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 28, color: "var(--c-primary)", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "var(--c-text-muted)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => { window.WTU_ANALYTICS?.event('quiz_start'); setStage("quiz"); }}>
            Start the quiz →
          </button>
          <p style={{ fontSize: 12.5, color: "var(--c-text-subtle)", marginTop: 20 }}>
            You can stop any time. We'll remember your place in this browser only.
          </p>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  if (stage === "quiz") {
    return (
      <div ref={scrollRef} style={{ maxWidth: 680, margin: "0 auto" }}>
        <Progress step={qIndex + 1} total={totalQuestions} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span className="tag">Question {qIndex + 1} of {totalQuestions}</span>
          {(answers.role || answers.nation) && qIndex > 0 && (
            <span className="tag">
              {[
                answers.role && window.ROLES[answers.role]?.label,
                answers.nation && window.NATIONS[answers.nation]?.label,
              ].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        <div className="card" style={{ padding: 36, animation: "fadeUp .35s ease" }} key={currentQ.id}>
          <h2 style={{ fontSize: "clamp(24px, 2.6vw, 32px)", marginBottom: 10, lineHeight: 1.2 }}>{currentQ.text}</h2>
          {currentQ.subtitle && <p style={{ fontSize: 15, color: "var(--c-text-muted)", marginBottom: 24, lineHeight: 1.55 }}>{currentQ.subtitle}</p>}
          {currentQ.type === "slider" ? (
            <SliderInput
              question={currentQ}
              value={answers[currentQ.id] ?? currentQ.default}
              onChange={(v) => setAnswer(currentQ.id, v)}
              onContinue={handleSliderContinue}
            />
          ) : currentQ.type === "multi" ? (
            <MultiSelectInput
              question={currentQ}
              selected={answers[currentQ.id] || []}
              onChange={(arr) => setAnswer(currentQ.id, arr)}
              onContinue={handleMultiContinue}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentQ.options.map((o, i) => (
                <OptionButton key={o.id} option={o} selected={answers[currentQ.id]} onSelect={handleSelect} index={i} />
              ))}
            </div>
          )}
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
          <button onClick={back} className="btn-ghost" style={{ background: "transparent", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: "10px 4px", fontSize: 14 }}>← Back</button>
          <button onClick={restart} style={{ background: "transparent", border: "none", color: "var(--c-text-subtle)", cursor: "pointer", fontSize: 13 }}>Start over</button>
        </div>
      </div>
    );
  }

  // ── Results ──
  const nationLabel = window.NATIONS[answers.nation]?.label;
  const roleLabel   = window.ROLES[answers.role]?.label;

  return (
    <div ref={scrollRef} style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span className="chip" style={{ marginBottom: 14 }}><span className="dot" />{nationLabel} · {roleLabel}</span>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", marginBottom: 10 }}>
          Your options, ranked by how well they match your answers.
        </h1>
        <p style={{ fontSize: 16, color: "var(--c-text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          These are a starting point, not a final answer. Tap any card to see strengths, trade-offs, costs and how this rank was calculated.
        </p>
        <p style={{ fontSize: 16, color: "var(--c-text-muted)", maxWidth: 560, margin: "12px auto 0", lineHeight: 1.6 }}>
          Matches are graded relative to other available options rather than an absolute match.
        </p>
      </div>

      {/* Controls: share / restart */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
        <button onClick={shareLink} className="btn btn-secondary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 4l-3 3M7 7l3 3M7 7H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {copyText}
        </button>
        <button onClick={restart} className="btn btn-ghost">Start over</button>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 24, fontSize: 12, color: "var(--c-text-muted)" }}>
        {[
          { l: "Strong match", c: "#2F7D57" },
          { l: "Good match", c: "#6E3B7E" },
          { l: "Worth considering", c: "#B7791F" },
          { l: "Less likely fit", c: "#8E8292" },
        ].map(t => (
          <span key={t.l} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.c }}/>{t.l}
          </span>
        ))}
      </div>

      {/* Cards */}
      {results && results.ranked.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {results.ranked.map((entry, i) => {
            const personalCost = window.QUIZ.personalisedCost({
              org: entry.org,
              role: answers.role,
              nation: answers.nation,
              answers,
              fte: answers.fte ?? 1.0,
            });
            return (
              <ResultCard
                key={entry.key}
                entry={entry}
                reasons={results.reasons[entry.key]}
                antiReasons={results.antiReasons?.[entry.key] || []}
                rank={i}
                isTop={i === 0}
                defaultOpen={false}
                personalCost={personalCost}
                userRole={answers.role}
              />
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p>No matching organisations for this combination of role and nation.</p>
        </div>
      )}

      {/* Tensions — surfaced when user's answers pull in opposing directions.
          The engine flags patterns like pro-strike + anti-political-fund so
          users can understand why an apparently-odd top result may actually
          be a legitimate fit for someone with their specific combination of
          views. Each tension is self-contained prose, not decorative. */}
      {results?.tensions?.length > 0 && (
        <aside
          className="card"
          style={{
            padding: 24,
            marginTop: 28,
            borderColor: "var(--c-accent)",
            borderLeftWidth: 4,
          }}
        >
          <div style={{
            fontSize: 12,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "var(--c-accent-hover)",
            marginBottom: 10,
          }}>
            Worth understanding
          </div>
          {results.tensions.map((t, i) => (
            <div key={i} style={{ marginBottom: i < results.tensions.length - 1 ? 18 : 0 }}>
              <h3 style={{ fontSize: 17, marginBottom: 8, fontFamily: "var(--f-serif)" }}>
                {t.title}
              </h3>
              <p style={{ fontSize: 14.5, color: "var(--c-text)", lineHeight: 1.6, margin: 0 }}>
                {t.body}
              </p>
            </div>
          ))}
        </aside>
      )}

      {/* Reflection prompts */}
      <aside className="card" style={{ padding: 28, marginTop: 32, background: "var(--c-background-2)" }}>
        <h3 style={{ fontSize: 20, marginBottom: 14 }}>Before you decide</h3>
        <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 14 }}>A few things worth a think:</p>
        <ol style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Have colleagues mentioned their experience of a union or support provider? It might be worth asking them to get a better idea of how that organisation works in your context. If you're not sure have a look for online reviews that may be relevant.",
            "Does your school already have active reps for any of these organisations? Are they the type of person that you would go to for support and advice?",
            "How many members are there in your school for that organisation? Some people prefer to have strength in numbers. Although don't forget to consider the wider values of the organisation and whether they match with your own.",
            "Most organisations will have a quick conversation with you for free and they can answer any questions you might have about the union. Try to contact them and see what your experience is like. Actions can speak louder than words!",
          ].map((q, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.6 }}>
              <span style={{ color: "var(--c-primary)", fontWeight: 700 }}>{i+1}.</span>{q}
            </li>
          ))}
        </ol>
      </aside>

      <p style={{ marginTop: 32, fontSize: 12, color: "var(--c-text-subtle)", textAlign: "center", lineHeight: 1.6 }}>
        Guidance only. Membership costs and features change — please verify directly with each organisation before joining.
      </p>
    </div>
  );
}

Object.assign(window, { Quiz });
