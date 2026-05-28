// ─────────────────────────────────────────────────────────────────────────────
// Quiz questions + scoring.
// Everything is relative to the "character" axes defined on each org in data.js.
// Answers map to weights on those axes; the engine computes a match score.
// ─────────────────────────────────────────────────────────────────────────────

// Weight multipliers for how much each axis matters given the answer.
// Each answer's "weights" add to (or subtract from) a live preference vector.
// The vector is compared to each org's character vector via dot-product,
// then normalised by the best possible score for that role+nation set.

window.QUIZ = (function () {

  const NATION_QUESTION = {
    id: "nation",
    text: "Where do you work?",
    subtitle: "Different unions and support organisations operate in different nations. This makes sure we only show you what you can actually join.",
    type: "single",
    options: [
      { id: "england",  label: "England",          flag: "assets/flags/england.svg" },
      { id: "scotland", label: "Scotland",         flag: "assets/flags/scotland.svg" },
      { id: "wales",    label: "Wales / Cymru",    flag: "assets/flags/wales.svg" },
      { id: "ni",       label: "Northern Ireland", flag: "assets/flags/ni.jpg" },
    ],
  };

  const ROLE_QUESTION = {
    id: "role",
    text: "What best describes your role?",
    subtitle: "This helps us show you only the options available to you.",
    type: "single",
    options: [
      { id: "teacher", label: "Classroom teacher", desc: "Including ECTs, supply teachers and subject specialists." },
      { id: "support", label: "Support staff",     desc: "TAs, admin, caretakers, IT, finance, technicians." },
      { id: "leader",  label: "School leader",     desc: "Head, deputy, assistant head, middle leader or aspiring leader." },
    ],
  };

  // Core 5-question bank. Each answer carries weight deltas on character axes.
  // Axes: collective, campaigning, protection, cpd, affordability, leadership, apolitical
  const CORE_QUESTIONS = [
    {
      id: "priority",
      text: "What matters most to you in a union or support organisation?",
      subtitle: "Pick the one that's closest to how you'd describe it to a colleague.",
      type: "single",
      options: [
        { id: "protection",   label: "Personal protection if things go wrong",
          desc: "Legal advice, representation, someone in your corner for HR situations.",
          w: { protection: 3, apolitical: 1 } },
        { id: "collective",   label: "Strength in numbers",
          desc: "Collective bargaining, campaigns, and industrial action when needed.",
          w: { collective: 3, campaigning: 2 } },
        { id: "professional", label: "Professional development",
          desc: "CPD, career support, leadership development alongside basic protection.",
          w: { cpd: 3, leadership: 1, protection: 1 } },
        { id: "affordable",   label: "Solid cover at the lowest cost",
          desc: "The basics done well without paying for extras you won't use.",
          w: { affordability: 3, protection: 1 } },
      ],
    },
    {
      id: "industrial",
      text: "How do you feel about industrial action?",
      subtitle: "There's no right answer — your view shapes whether a trade union or an independent alternative fits better.",
      type: "single",
      options: [
        { id: "important",  label: "It's an important right",
          desc: "I want an organisation that will use it when members vote to.",
          w: { collective: 3, campaigning: 2 } },
        { id: "lastresort", label: "Only as a last resort",
          desc: "Negotiation first, but I accept it may sometimes be necessary.",
          w: { collective: 1, protection: 2 } },
        { id: "notforme",   label: "Not for me",
          desc: "I'd prefer not to take part — I just want individual support.",
          w: { apolitical: 3, protection: 2, collective: -2 } },
      ],
    },
    {
      id: "politics",
      text: "How important is it that your organisation campaigns on wider issues?",
      subtitle: "For example education policy, workload, pay, or broader social issues.",
      type: "single",
      options: [
        { id: "veryimportant", label: "Very important",
          desc: "I want a voice on the big issues affecting schools and society.",
          w: { campaigning: 3, collective: 2, apolitical: -2 } },
        { id: "nice",          label: "Nice to have, not essential",
          desc: "I appreciate it but it isn't the main reason I'd join.",
          w: { campaigning: 1, protection: 1 } },
        { id: "prefer_not",    label: "I'd rather they didn't",
          desc: "I want them focused on supporting me, not on campaigning.",
          w: { apolitical: 3, protection: 2, campaigning: -2 } },
      ],
    },
    {
      id: "support_type",
      text: "When something goes wrong, who would you rather hear from first?",
      type: "single",
      options: [
        { id: "caseworker", label: "A professional caseworker",
          desc: "Trained employment-support staff handling it end-to-end.",
          w: { protection: 3, apolitical: 1 } },
        { id: "schoolrep",  label: "An in-school rep",
          desc: "Someone in your building who knows the context.",
          w: { collective: 2, protection: 1 } },
        { id: "either",     label: "Either is fine",
          desc: "Not a deciding factor — I just want good support.",
          w: { protection: 1, collective: 1 } },
      ],
    },
    {
      id: "cost",
      text: "How much does cost matter to your decision?",
      type: "single",
      options: [
        { id: "very",    label: "Very — every pound counts",
          desc: "I need the cheapest option that still gives me real protection.",
          w: { affordability: 3, protection: 1 } },
        { id: "factor",  label: "It's a factor, not the main one",
          desc: "I'll pay a fair price for good support.",
          w: { affordability: 1, protection: 1 } },
        { id: "notmain", label: "Not my main concern",
          desc: "I'll pay what's needed for the right fit.",
          w: { cpd: 1, leadership: 1, protection: 1 } },
      ],
    },
  ];

  // Compute match scores for a given role, nation and answer set.
  function score({ role, nation, answers }) {
    const orgs = window.ORGS;
    const pref = { collective: 0, campaigning: 0, protection: 0, cpd: 0, affordability: 0, leadership: 0, apolitical: 0 };

    CORE_QUESTIONS.forEach(q => {
      const aid = answers[q.id];
      if (!aid) return;
      const opt = q.options.find(o => o.id === aid);
      if (!opt?.w) return;
      Object.entries(opt.w).forEach(([axis, delta]) => { pref[axis] = (pref[axis]||0) + delta; });
    });

    // Leadership boost: if the user is a leader, bump leadership axis.
    if (role === "leader") pref.leadership += 2;
    // Support staff don't need leadership axis at all.
    if (role === "support") pref.leadership = 0;

    const eligible = Object.entries(orgs).filter(([, o]) =>
      o.eligibility.includes(role) && o.nations.includes(nation)
    );

    // Raw dot-product score per org
    let rawScores = eligible.map(([key, o]) => {
      let s = 0;
      Object.entries(pref).forEach(([axis, w]) => {
        s += w * (o.character[axis] || 0);
      });
      return { key, score: s, org: o };
    });

    if (rawScores.length === 0) return { ranked: [], maxScore: 1, reasons: {} };

    // Normalise to 0–100 across the returned set
    const max = Math.max(...rawScores.map(r => r.score));
    const min = Math.min(...rawScores.map(r => r.score), 0);
    const range = Math.max(1, max - min);
    rawScores = rawScores.map(r => ({ ...r, pct: Math.round(((r.score - min) / range) * 100) }));

    // Reasons — for each org, pick the top 3 axes where (weight × char) contributes most.
    const reasons = {};
    rawScores.forEach(r => {
      const contribs = Object.entries(pref)
        .map(([axis, w]) => ({ axis, contribution: w * (r.org.character[axis] || 0), w, char: r.org.character[axis] || 0 }))
        .filter(c => c.contribution > 0)
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3);
      reasons[r.key] = contribs;
    });

    rawScores.sort((a, b) => b.pct - a.pct);
    return { ranked: rawScores, maxScore: 100, reasons };
  }

  function tier(pct) {
    if (pct >= 80) return { label: "Strong match",      color: "#2F7D57", bg: "#E7F4EE" };
    if (pct >= 60) return { label: "Good match",        color: "#6E3B7E", bg: "#F2E7F5" };
    if (pct >= 40) return { label: "Worth considering", color: "#B7791F", bg: "#FBF2DF" };
    return            { label: "Less likely fit",     color: "#8E8292", bg: "#F3EEF5" };
  }

  // Friendly labels for the "why this fits" panel
  const AXIS_LABELS = {
    collective:    "Collective strength",
    campaigning:   "Campaigning voice",
    protection:    "Individual casework & protection",
    cpd:           "Professional development",
    affordability: "Affordable cost",
    leadership:    "Leadership-specific support",
    apolitical:    "Apolitical focus",
  };

  return {
    NATION_QUESTION,
    ROLE_QUESTION,
    CORE_QUESTIONS,
    score,
    tier,
    AXIS_LABELS,
  };
})();
