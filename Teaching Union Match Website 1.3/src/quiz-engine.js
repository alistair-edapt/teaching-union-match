// ─────────────────────────────────────────────────────────────────────────────
// Quiz questions + scoring (Schema v2 — April 2026)
//
// Structure:
//   R1 (role) → conditional R2/R3/R4 → R5 (nation) → Q1–Q9 (scored) → FTE slider
//
// Routing rules:
//   R1 = trainee → R2 (training type) → R5
//   R1 = teacher → R3 (years qualified) → R5
//   R1 = supply  → R5  (skip ECT branch)
//   R1 = support → R4 (support sub-role) → R5
//   R1 = leader  → R5  (skip ECT branch)
//
// Scoring axes (10):
//   collective, campaigning_education, campaigning_wider, protection, cpd,
//   affordability, leadership, apolitical, wellbeing, education_specialist
// ─────────────────────────────────────────────────────────────────────────────

window.QUIZ = (function () {

  // ── Routing questions (do not score) ─────────────────────────────────────
  // R1 — role. Mirrors the NEU joining-page structure: trainee, teacher,
  // supply/peripatetic, support, leader. The NEU question is the model.
  const R1_ROLE = {
    id: "role",
    routing: true,
    text: "Which best describes you?",
    subtitle: "This helps us show you only the options available to you.",
    type: "single",
    options: [
      { id: "trainee", label: "Student, trainee or apprentice teacher",
        desc: "On any route into teaching — university, school-based or apprenticeship." },
      { id: "teacher", label: "Teacher or lecturer",
        desc: "Including ECTs, Heads of Year/Department, advisory or consultant teachers, SENDCOs." },
      { id: "supply",  label: "Supply or peripatetic teacher",
        desc: "Day-to-day or long-term supply, or a visiting subject specialist." },
      { id: "support", label: "Support staff",
        desc: "Including teaching assistants, technicians, facilities, finance and admin staff." },
      { id: "leader",  label: "School leader",
        desc: "Head, Deputy, Assistant Head, middle leader or business manager." },
    ],
  };

  // R2 — trainee type. Only shown when role = trainee.
  const R2_TRAINING_TYPE = {
    id: "trainingType",
    routing: true,
    text: "Which type of teacher training are you doing?",
    subtitle: "We use this to show training-specific membership rates and routes.",
    type: "single",
    showIf: a => a.role === "trainee",
    options: [
      { id: "ug",        label: "Undergraduate degree (BEd, BA or BSc with QTS)" },
      { id: "pg",        label: "Postgraduate qualification (PGCE, Teach First, School Direct, Early Years ITT)" },
      { id: "ug_app",    label: "Undergraduate teaching apprenticeship" },
      { id: "pg_app",    label: "Postgraduate teaching apprenticeship (PGTA)" },
      { id: "aor",       label: "Assessment only route (AOR)" },
    ],
  };

  // R3 — years qualified. Only shown when role = teacher (not supply, not leader).
  // Drives ECT pricing display in the results.
  const R3_YEARS_QUALIFIED = {
    id: "yearsQualified",
    routing: true,
    text: "How long have you been qualified?",
    subtitle: "Some unions offer reduced rates for early-career teachers.",
    type: "single",
    showIf: a => a.role === "teacher",
    options: [
      { id: "ect1", label: "In my first year (ECT year 1)" },
      { id: "ect2", label: "In my second year" },
      { id: "ect3", label: "In my third year" },
      { id: "exp",  label: "More than three years" },
    ],
  };

  // R4 — support staff sub-role. Only shown when role = support.
  // Helps differentiate the four (now five) general unions; not currently
  // used in scoring but captured for future weighting and analytics.
  const R4_SUPPORT_ROLE = {
    id: "supportRole",
    routing: true,
    text: "What's your main role?",
    subtitle: "Helps us tailor what to show you.",
    type: "single",
    showIf: a => a.role === "support",
    options: [
      { id: "ta",         label: "Teaching assistant or HLTA" },
      { id: "admin",      label: "Admin, finance or office" },
      { id: "tech",       label: "Technician or IT" },
      { id: "facilities", label: "Facilities, caretaking or estates" },
      { id: "catering",   label: "Catering, midday or other" },
      { id: "multiple",   label: "Multiple roles" },
    ],
  };

  // R5 — nation. Always shown.
  const R5_NATION = {
    id: "nation",
    routing: true,
    text: "Where do you work?",
    subtitle: "Different unions and support organisations operate in different nations.",
    type: "single",
    options: [
      { id: "england",  label: "England",          flag: "assets/flags/england.svg" },
      { id: "scotland", label: "Scotland",         flag: "assets/flags/scotland.svg" },
      { id: "wales",    label: "Wales / Cymru",    flag: "assets/flags/wales.png" },
      { id: "ni",       label: "Northern Ireland", flag: "assets/flags/ni.jpg" },
    ],
  };

  // The full ordered routing set. Quiz.jsx filters by `showIf`.
  const ROUTING_QUESTIONS = [R1_ROLE, R2_TRAINING_TYPE, R3_YEARS_QUALIFIED, R4_SUPPORT_ROLE, R5_NATION];

  // ── Core scored questions ────────────────────────────────────────────────
  // Each answer carries weight deltas on character axes.
  const CORE_QUESTIONS = [
    {
      id: "priority",
      text: "What matters most to you in a union or support organisation?",
      subtitle: "Pick the one that's closest to how you'd describe it to a colleague.",
      type: "single",
      options: [
        { id: "protection",   label: "Personal protection if things go wrong",
          desc: "Legal advice, representation, someone in your corner for allegations or HR situations.",
          w: { protection: 3, apolitical: 1 } },
        { id: "collective",   label: "Strength in numbers",
          desc: "Collective bargaining, campaigns, and strike action when needed.",
          w: { collective: 3, campaigning_wider: 1, campaigning_education: 1 } },
        { id: "professional", label: "Professional development",
          desc: "CPD, career support, leadership development.",
          w: { cpd: 3, leadership: 1, protection: 1 } },
        { id: "affordable",   label: "Solid cover at the lowest cost",
          desc: "The basics done well without paying for extras you won't use.",
          w: { affordability: 3, protection: 1 } },
      ],
    },

    // Q2a — principled view on strikes in schools
    {
      id: "strike_rights",
      text: "Should teachers be able to go on strike?",
      subtitle: "Strikes in schools affect children's education as well as pay and conditions. We're asking about the principle here — we'll ask about personal participation next.",
      type: "single",
      options: [
        { id: "fundamental", label: "Yes, it's a fundamental right for any workforce",
          desc: "Teachers should have the same rights as any other workers.",
          w: { collective: 3, campaigning_wider: 1 } },
        { id: "concerned",   label: "Yes in principle, but I have concerns about the impact on children",
          desc: "I believe in the right but I'm conflicted about school-based action.",
          w: { collective: 1, protection: 1 } },
        { id: "extreme",     label: "Only in extreme circumstances — strikes should be rare",
          desc: "Unions should try everything else first. Strikes should be a last resort, not an early tool.",
          w: { collective: 1, protection: 2, apolitical: 1 } },
        { id: "not_schools", label: "No — I don't think striking belongs in schools",
          desc: "The cost to children's education isn't justified by what strikes typically achieve.",
          w: { apolitical: 3, protection: 2, collective: -2 } },
      ],
    },

    // Q2b — personal participation stance
    {
      id: "strike_participation",
      text: "If your union called a strike, how would you most likely respond?",
      subtitle: "Different orgs handle this differently. Edapt isn't a union and can't call strikes, but its members can still participate in strikes called by others.",
      type: "single",
      options: [
        { id: "strike_picket", label: "Join the strike and the picket line",
          desc: "Solidarity with colleagues matters to me.",
          w: { collective: 3, campaigning_wider: 1 } },
        { id: "strike_only",   label: "Join the strike but not the picket line",
          desc: "I'd stop work but wouldn't be on the line outside school.",
          w: { collective: 2 } },
        { id: "opt_out",       label: "Opt out of that particular action but stay a member",
          desc: "I'd want a union where I can decide case by case.",
          w: { collective: 1, protection: 1, apolitical: 1 } },
        { id: "non_member",    label: "I'd join strikes even if I'm not in the union that called them",
          desc: "I'd want support and protection from an organisation I trust, but I'd still stand with colleagues when they strike if I agreed with their cause.",
          w: { collective: 2, apolitical: 1, protection: 1 } },
        { id: "cross",         label: "Keep working as normal — I wouldn't take strike action",
          desc: "I'd prefer to keep teaching, even during action called by my own union.",
          w: { apolitical: 2, protection: 2, collective: -1 } },
        { id: "not_a_union",   label: "I'd rather not be in a union that can call strikes",
          desc: "I'd prefer to be in an organisation where this situation doesn't arise.",
          w: { apolitical: 3, protection: 2, collective: -2 } },
      ],
    },

    // Q3 — voice. April 2026 update: removed "narrow advocacy" option (too similar
    // to edu_policy option). Now 4 options covering the key distinctions:
    // edu policy only / edu + UK issues / full range / no campaigning.
    {
      id: "voice",
      text: "How would you like your organisation to use its voice?",
      subtitle: "This is a major differentiator between unions. Choose the statement closest to your view.",
      type: "single",
      options: [
        { id: "edu_policy",    label: "Mainly on education policy in the country and school that I work in",
          desc: "Pay, workload, funding, curriculum — focused tightly on the job.",
          w: { campaigning_education: 3, apolitical: 1 } },
        { id: "edu_plus_uk",   label: "On education policy and broader UK issues that affect teachers and schools",
          desc: "Child poverty, health services, local authority cuts — things that touch classrooms even if they're not education itself.",
          w: { campaigning_education: 2, campaigning_wider: 2, collective: 1 } },
        { id: "full_range",    label: "On the full range of social, political and international issues",
          desc: "Including foreign policy, party-political advocacy, global campaigns.",
          w: { campaigning_wider: 3, campaigning_education: 1, collective: 2 } },
        { id: "personal_only", label: "I'd rather they didn't campaign at all but just focused on supporting me personally",
          desc: "I want them focused on supporting me individually; campaigning isn't really why I'd join.",
          w: { apolitical: 3, protection: 2, campaigning_education: -1, campaigning_wider: -2 } },
      ],
    },

    // Q4 — caseworker vs rep (unchanged)
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

    // Q5 — education-specialist focus (unchanged)
    {
      id: "edu_focus",
      text: "How important is it that your organisation is education-specialist?",
      subtitle: "Some unions only cover education staff (NEU, NASUWT, ASCL, EIS etc.); others are general unions that happen to cover school staff (UNISON, GMB, Community, Unite).",
      type: "single",
      options: [
        { id: "very",     label: "Very important — I want education specialists",
          desc: "I want reps and caseworkers who genuinely understand schools and the sector.",
          w: { education_specialist: 3 } },
        { id: "helpful",  label: "Helpful but not essential",
          desc: "Useful if so, but I'd weigh other factors equally.",
          w: { education_specialist: 1 } },
        { id: "notfactor",label: "Not a factor for me",
          desc: "A general union with good cover is fine.",
          w: {} },
      ],
    },

    // Q6 — extra benefits (multi-select, replaces old Q6 wellbeing + Q7 CPD)
    // April 2026: removed "extra legal advice" option - not a relevant priority for most users
    {
      id: "benefits",
      type: "multi",
      text: "Beyond basic protection, which extra benefits would you value?",
      subtitle: "Tick any that matter to you — or none if you'd rather keep it simple and affordable.",
      options: [
        { id: "wellbeing",  label: "24/7 mental health and wellbeing support",
          desc: "Helplines, counselling referrals, mental-health-first-aid services.",
          w: { wellbeing: 3 } },
        { id: "cpd",        label: "CPD, training and career development",
          desc: "Courses, conferences, qualifications and career progression support.",
          w: { cpd: 3 } },
        { id: "resources",  label: "Classroom resources and teaching materials",
          desc: "Schemes of work, lesson ideas, curriculum guidance.",
          w: { cpd: 1, education_specialist: 1 } },
        { id: "none",       label: "None of these are priorities for me",
          desc: "I'd rather keep it simple and pay less.",
          w: { affordability: 1, protection: 1 } },
      ],
    },

    // Q7 — involvement (was Q8; kept, with gratuitous apolitical negative removed)
    {
      id: "involvement",
      text: "If you joined, how involved would you want to be?",
      type: "single",
      options: [
        { id: "passive",    label: "Passive — I just want the cover",
          desc: "I won't attend meetings or get involved.",
          w: { apolitical: 2, protection: 1 } },
        { id: "occasional", label: "Occasionally",
          desc: "I'd engage on things that directly affect me.",
          w: { collective: 1, protection: 1 } },
        { id: "active",     label: "Actively involved",
          desc: "I'd attend branch meetings and might become a rep one day.",
          w: { collective: 3, campaigning_wider: 1, campaigning_education: 1 } },
      ],
    },

    // Q8 — political funds & party affiliation (NEW)
    {
      id: "political_fund",
      text: "Most UK trade unions have a \"political fund\" that members pay into unless they opt out. How do you feel about this?",
      subtitle: "Some unions are formally affiliated to the Labour Party (e.g. Community, Unite). Others have a political fund that campaigns on policy but isn't tied to a party. Others have no political affiliation at all.",
      type: "single",
      options: [
        { id: "want_party",   label: "Fine — I'd pay in and want my union to support political parties that back workers",
          desc: "Unions should use their collective voice in party politics.",
          w: { party_politics: 3, campaigning_wider: 1 } },
        { id: "fine_opt_out", label: "Fine — but I'd opt out of the political levy",
          desc: "I'm okay joining a union with a political fund; I just wouldn't contribute to it myself.",
          w: { collective: 1 } },
        { id: "avoid_fund",   label: "I'd avoid unions with political funds if possible",
          desc: "I don't want my fees going anywhere near party politics, even with opt-outs.",
          w: { apolitical: 2, party_politics: -2 } },
        { id: "no_affiliation", label: "I'd want a union or organisation with no political affiliation at all",
          desc: "Independence from political parties is a requirement for me.",
          w: { apolitical: 3, party_politics: -3 } },
        { id: "dont_know",    label: "I'd need to learn more before deciding",
          desc: "This isn't something I've thought about enough to have a view.",
          w: {} },
      ],
    },

    // Q9 — cost (kept, still last)
    {
      id: "cost",
      text: "How much does cost matter to your decision?",
      subtitle: "Deliberately last so your values shape the result first.",
      type: "single",
      options: [
        { id: "very",    label: "Very — every pound counts",
          desc: "I need the cheapest option that still gives real protection.",
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

  // ── FTE slider (post-core, pre-results) ──────────────────────────────────
  const FTE_QUESTION = {
    id: "fte",
    type: "slider",
    routing: false,
    text: "What's your contracted hours, roughly?",
    subtitle: "Slide to your full-time equivalent. We'll use this to show approximate annual costs based on your role.",
    min: 0.1,
    max: 1.0,
    step: 0.1,
    default: 1.0,
    formatLabel: v => v >= 1.0 ? "Full-time (1.0)" : `${v.toFixed(1)} FTE (~${Math.round(v * 100)}%)`,
  };

  // ── Eligibility ──────────────────────────────────────────────────────────
  // Map each role keyword to which orgs are eligible. Trainees get the same
  // eligibility set as teachers (most teachers' unions accept trainees with
  // student/discounted rates).
  function eligibleOrgsFor(role, nation) {
    const orgs = window.ORGS;
    // Trainees: any org that lists either 'teacher' or 'trainee' in eligibility.
    const matches = role === "trainee"
      ? ([, o]) => (o.eligibility.includes("trainee") || o.eligibility.includes("teacher"))
      : ([, o]) => o.eligibility.includes(role);
    return Object.entries(orgs).filter(matches).filter(([, o]) => o.nations.includes(nation));
  }

  // ── Scoring ──────────────────────────────────────────────────────────────
  // ── Dynamic affordability ────────────────────────────────────────────────
  // Compute an affordability score (0–5) for each eligible org based on its
  // actual cost relative to other eligible orgs. Cheapest = 5, most expensive
  // = 0; everything else interpolates linearly. This replaces the static
  // `character.affordability` value at scoring time, so users see Edapt rated
  // as highly affordable for teachers (where it's cheapest) but mid-pack for
  // headteachers (where ASCL/NAHT are similar order of magnitude).
  //
  // Returns a map of { orgKey: dynamicAffordabilityScore }.
  function computeDynamicAffordability(eligibleEntries, role, answers) {
    // Helper: extract a comparable annual figure for an org. Uses the same
    // tier-matching logic as personalisedCost but always at FTE 1.0 so all
    // orgs are compared like-for-like. For orgs with a range (EIS/INTO/UTU/
    // Unite/UNISON), use the bottom of the range (best-case price).
    function comparableCost(org) {
      if (!org.costData) return null;
      // Map role to the right costData branch (trainees see teacher data)
      const branch = role === "trainee"
        ? (org.costData.trainee || org.costData.teacher)
        : org.costData[role];
      if (!branch) return null;

      // ECT bands take priority for teachers — use the actual ECT figure
      if (role === "teacher" && answers?.yearsQualified) {
        const yq = answers.yearsQualified;
        if (yq === "ect1" && branch.ect1 != null) return branch.ect1;
        if (yq === "ect2" && branch.ect2 != null) return branch.ect2;
        if (yq === "ect3" && branch.ect3 != null) return branch.ect3;
      }

      // Range orgs: use the low end as the comparable figure
      if (branch.ftRange) return branch.ftRange[0];
      if (branch.ft != null) return branch.ft;
      return null;
    }

    const costs = eligibleEntries
      .map(([key, org]) => ({ key, cost: comparableCost(org) }))
      .filter(c => c.cost != null && c.cost >= 0);

    if (costs.length < 2) {
      // Not enough data to compare — fall back to static scores
      return {};
    }

    const minCost = Math.min(...costs.map(c => c.cost));
    const maxCost = Math.max(...costs.map(c => c.cost));
    const range = Math.max(1, maxCost - minCost);

    const dyn = {};
    costs.forEach(({ key, cost }) => {
      // Linear scale: cheapest = 5, most expensive = 0
      const ratio = (maxCost - cost) / range;
      dyn[key] = Math.round(ratio * 5 * 10) / 10;  // round to 1 dp
    });

    // Orgs without comparable cost data keep their static score (handled by
    // the caller falling back when key not in dyn map).
    return dyn;
  }

  function score({ role, nation, answers }) {
    const pref = {
      collective: 0, campaigning_education: 0, campaigning_wider: 0, protection: 0,
      cpd: 0, affordability: 0, leadership: 0, apolitical: 0,
      wellbeing: 0, education_specialist: 0, party_politics: 0,
    };

    CORE_QUESTIONS.forEach(q => {
      const aid = answers[q.id];
      if (aid == null) return;

      // Multi-select: aid is an array of option IDs — sum weights from all.
      // Single-select: aid is a string — single option match.
      const selectedIds = q.type === "multi"
        ? (Array.isArray(aid) ? aid : [])
        : [aid];

      selectedIds.forEach(id => {
        const opt = q.options.find(o => o.id === id);
        if (!opt?.w) return;
        Object.entries(opt.w).forEach(([axis, delta]) => {
          pref[axis] = (pref[axis] || 0) + delta;
        });
      });
    });

    // Role-based axis tweaks (preserved from v1):
    //   Leaders: bump leadership axis (they care about specialist leadership cover).
    //   Support staff: zero out leadership (not relevant for them).
    if (role === "leader") pref.leadership += 2;
    if (role === "support") pref.leadership = 0;

    const eligible = eligibleOrgsFor(role, nation);

    // Compute dynamic affordability scores relative to the eligible set
    const dynAfford = computeDynamicAffordability(eligible, role, answers);

    // Raw dot-product score per org. Use dynamic affordability where available,
    // otherwise fall back to the static character score.
    let rawScores = eligible.map(([key, o]) => {
      let s = 0;
      Object.entries(pref).forEach(([axis, w]) => {
        const charValue = (axis === "affordability" && key in dynAfford)
          ? dynAfford[key]
          : (o.character[axis] || 0);
        s += w * charValue;
      });
      return { key, score: s, org: o };
    });

    if (rawScores.length === 0) return { ranked: [], maxScore: 1, reasons: {}, antiReasons: {} };

    // Normalise to 0–100 across the returned set
    const max = Math.max(...rawScores.map(r => r.score));
    const min = Math.min(...rawScores.map(r => r.score), 0);
    const range = Math.max(1, max - min);
    rawScores = rawScores.map(r => ({ ...r, pct: Math.round(((r.score - min) / range) * 100) }));

    // Reasons — top 3 axes by positive contribution per org.
    // Use the same dynamic-affordability override here so reasons match scoring.
    //
    // We compute two parallel lists per org:
    //   reasons      — axes that align with the user's prefs (org scores high
    //                  on something the user weighted positively).
    //   antiReasons  — axes where the user's prefs pull AGAINST the org
    //                  (user weighted axis positively but org scores low; OR
    //                  user weighted axis negatively but org scores high).
    //                  Surfaced for "Less likely fit" tier results so users
    //                  see *why* an org dropped to the bottom.
    const reasons = {};
    const antiReasons = {};
    rawScores.forEach(r => {
      const allContribs = Object.entries(pref)
        .map(([axis, w]) => {
          const charValue = (axis === "affordability" && r.key in dynAfford)
            ? dynAfford[r.key]
            : (r.org.character[axis] || 0);
          return { axis, contribution: w * charValue, w, char: charValue };
        });

      reasons[r.key] = allContribs
        .filter(c => c.contribution > 0)
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3);

      // Anti-reasons: gap = how much the user wanted this axis vs how much
      // the org delivers (or how much the user *didn't* want vs how much
      // the org leans into it). Higher gap = bigger mismatch.
      antiReasons[r.key] = allContribs
        .map(c => {
          if (c.w > 0 && c.char <= 2) {
            // User wanted it, org doesn't have it.
            return { ...c, gap: c.w * (5 - c.char), kind: "missing" };
          }
          if (c.w < 0 && c.char >= 3) {
            // User didn't want it, org leans into it.
            return { ...c, gap: -c.w * c.char, kind: "unwanted" };
          }
          return { ...c, gap: 0, kind: null };
        })
        .filter(c => c.gap > 0)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3);
    });

    rawScores.sort((a, b) => b.pct - a.pct);

    // Tension detection — flag when the user's answers contradict in ways
    // worth explaining. Specifically: pro-strike answers combined with
    // anti-political-fund answers produce results that can look wrong without
    // a narrative ("why is Edapt top when I said I'd strike?").
    //
    // Returns an array of tension objects, each with a `type` and a
    // human-readable explanation. The UI surfaces these on the results page.
    const tensions = detectTensions(answers, rawScores);

    return { ranked: rawScores, maxScore: 100, reasons, antiReasons, dynAfford, tensions };
  }

  // ── Tension detection ────────────────────────────────────────────────────
  // Given a user's answers, identify patterns where their preferences pull in
  // different directions. Each tension is a self-contained observation that
  // helps the user understand an apparent contradiction in their results.
  function detectTensions(answers, rawScores) {
    const tensions = [];

    // Pattern 1: Pro-strike + anti-political
    // Signal: strike_rights = fundamental or concerned, AND
    //         strike_participation = strike_picket, strike_only, or non_member, AND
    //         political_fund = avoid_fund or no_affiliation
    const proStrikeRights  = ["fundamental", "concerned"].includes(answers.strike_rights);
    const proStrikeAction  = ["strike_picket", "strike_only", "non_member"].includes(answers.strike_participation);
    const antiPolitical    = ["avoid_fund", "no_affiliation"].includes(answers.political_fund);

    if (proStrikeRights && proStrikeAction && antiPolitical) {
      tensions.push({
        type: "strike_vs_politics",
        title: "Pro-strike but anti-political-fund",
        body: "You've said you support strikes and would participate, but you'd also prefer an organisation without a political fund or party affiliation. These can pull in different directions — most strike-capable unions have political funds, and the most apolitical options (like Edapt and UTU) don't organise strikes themselves. You have two honest paths: (1) join a union and opt out of the political levy, or (2) join an apolitical organisation for day-to-day cover and participate in strikes as a non-member when your colleagues call them. Both are legitimate choices.",
      });
    }

    return tensions;
  }

  function tier(pct) {
    if (pct >= 80) return { label: "Strong match",      color: "#2F7D57", bg: "#E7F4EE" };
    if (pct >= 60) return { label: "Good match",        color: "#6E3B7E", bg: "#F2E7F5" };
    if (pct >= 40) return { label: "Worth considering", color: "#B7791F", bg: "#FBF2DF" };
    return            { label: "Less likely fit",     color: "#8E8292", bg: "#F3EEF5" };
  }

  // ── Personalised cost calculation ────────────────────────────────────────
  // Returns a string suitable for the results card, or null if we can't
  // compute one (e.g. UNISON's earnings-based fee). Quiz.jsx falls back
  // to rendering the qualitative `costs` table in that case.
  //
  // Inputs:
  //   org    — full org object from window.ORGS
  //   role   — 'teacher' | 'supply' | 'support' | 'leader' | 'trainee'
  //   nation — 'england' | 'scotland' | 'wales' | 'ni'
  //   answers — full answer object, used for yearsQualified (ECT bands)
  //   fte    — number 0.1–1.0
  //
  // Output shape: { display: "~£228/yr", note?: "...", min?, max? }
  //
  // Cost shape conventions in data.js:
  //   ft           — full-time annual figure
  //   ftRange      — [lo, hi] for orgs whose FT figure varies (e.g. EIS local subs)
  //   fte08, fte06, fte05, fte02 — explicit tier figures for orgs that band
  //                  rather than linear pro-rata (Edapt, UCAC, NAHT, AHDS).
  //                  Engine matches the user's FTE to the closest tier.
  //   ect1, ect2, ect3 — ECT-band overrides for teacher role
  //   localLevyPctRange — [lo, hi] applied multiplicatively for NEU
  function personalisedCost({ org, role, nation, answers, fte }) {
    if (!org.costData) return null;

    const fteSafe = Math.max(0.1, Math.min(1.0, fte || 1.0));

    // Helper: find the right tier figure for a given FTE, falling back to
    // ft × fte when no tier matches.
    function tieredOrLinear(roleData, fte) {
      if (!roleData) return null;
      // Tier matching: pick the band that brackets the user's FTE.
      // fte08 = 0.7–0.99 band; fte06 = 0.4–0.69 band; fte05 = ≤0.5 (GMB);
      // fte02 = ≤0.39 band (UCAC). Choose by FTE.
      if (fte >= 1.0 && roleData.ft != null) return roleData.ft;
      if (fte <= 0.39 && roleData.fte02 != null) return roleData.fte02;
      if (fte <= 0.5 && roleData.fte05 != null) return roleData.fte05;
      if (fte <= 0.69 && roleData.fte06 != null) return roleData.fte06;
      if (fte <= 0.99 && roleData.fte08 != null) return roleData.fte08;
      // No matching tier — fall back to linear if ft exists
      if (roleData.ft != null) return Math.round(roleData.ft * fte);
      return null;
    }

    // Helper: format a single annual figure with a monthly equivalent.
    // Prefers an explicit `monthly` field (where the org's actual monthly
    // billing rate differs from annual ÷ 12, e.g. Edapt's 10% discount).
    // Returns "£194/yr or £17.95/mo" or "£194/yr (£16.17/mo)".
    function withMonthly(annual, roleData, ftBand) {
      // Pick the right monthly figure for the FTE band, if explicit
      let monthly = null;
      if (roleData) {
        if (ftBand === "fte06" && roleData.monthly06 != null) monthly = roleData.monthly06;
        else if (ftBand === "fte08" && roleData.monthly08 != null) monthly = roleData.monthly08;
        else if (ftBand === "ft" && roleData.monthly != null) monthly = roleData.monthly;
      }
      if (monthly != null) {
        // Two real billing options — present them as alternatives
        return `£${annual}/yr or £${monthly.toFixed(2)}/mo`;
      }
      // Fall back to derived monthly equivalent
      const mo = (annual / 12).toFixed(2);
      return `£${annual}/yr (£${mo}/mo)`;
    }

    // Helper: identify which FTE band was used so withMonthly can pick the
    // right monthly figure.
    function fteBand(fte, roleData) {
      if (!roleData) return "ft";
      if (fte >= 1.0 && roleData.ft != null) return "ft";
      if (fte <= 0.39 && roleData.fte02 != null) return "fte02";
      if (fte <= 0.5 && roleData.fte05 != null) return "fte05";
      if (fte <= 0.69 && roleData.fte06 != null) return "fte06";
      if (fte <= 0.99 && roleData.fte08 != null) return "fte08";
      return "ft";
    }

    // Helper: append the annual-discount note where applicable. Edapt charges
    // 10% less if you pay annually vs monthly. The annual figure in costData
    // is the discounted one. Skip the note for free / £-figure ECT cases.
    function withDiscountNote(result, roleData, isSpecialBand) {
      if (!roleData?.annualDiscount || isSpecialBand) return result;
      const existingNote = result.note ? result.note + " " : "";
      return {
        ...result,
        note: existingNote + "Annual rate shown — 10% saving vs monthly billing.",
      };
    }

    // Trainees: nearly always free or nominal.
    if (role === "trainee") {
      const t = org.costData.trainee || org.costData.teacher;
      if (!t) return null;
      if (t.ft === 0) return { display: "Free during training" };
      const base = tieredOrLinear(t, fteSafe);
      return base != null ? { display: withMonthly(base, t, fteBand(fteSafe, t)) } : null;
    }

    // Teacher branch: respect ECT year if available.
    if (role === "teacher") {
      const t = org.costData.teacher;
      if (!t) return null;
      const yq = answers?.yearsQualified;
      if (yq === "ect1" && t.ect1 != null) {
        const display = t.ect1 === 0 ? "Free (qualifying year)" : `£${t.ect1} (year 1 post-qual)`;
        return { display };  // No discount note for special bands
      }
      if (yq === "ect2" && t.ect2 != null) {
        return { display: `£${t.ect2} (year 2 post-qual)` };
      }
      if (yq === "ect3" && t.ect3 != null) {
        return { display: `£${t.ect3} (year 3 post-qual)` };
      }
      // Standard tiered/linear scaling
      const base = tieredOrLinear(t, fteSafe);
      if (base == null) return null;

      // EIS / INTO / UTU style range: when ftRange is set, show the range
      if (t.ftRange && fteSafe >= 1.0) {
        const [lo, hi] = t.ftRange;
        const noteFor = {
          eis: "varies by Local Association",
          into: "based on 0.6% of gross salary",
          utu: "varies by pay scale (M2 to UPS3)",
        }[org.short?.toLowerCase()] || "range varies";
        return withDiscountNote({
          display: `£${lo}–£${hi}/yr`,
          note: noteFor,
        }, t, false);
      }
      // NEU-style local levy overlay — display the resulting range
      if (t.localLevyPctRange) {
        const [lo, hi] = t.localLevyPctRange;
        const min = Math.round(base * (1 + lo / 100));
        const max = Math.round(base * (1 + hi / 100));
        return { display: `£${min}–£${max}/yr`, note: "Range includes 5–20% local district subscription." };
      }
      return withDiscountNote({ display: withMonthly(base, t, fteBand(fteSafe, t)) }, t, false);
    }

    // Supply, support, leader: tiered/linear scaling.
    const roleData = org.costData[role];
    if (!roleData) return null;
    const base = tieredOrLinear(roleData, fteSafe);
    if (base == null) return null;

    if (roleData.ftRange && fteSafe >= 1.0) {
      const [lo, hi] = roleData.ftRange;
      const noteFor = {
        unite: "based on standard support-staff rate (≤£26k gross)",
        unison: "estimated for typical TA on ~£25k gross",
        into: "based on 0.6% of gross salary",
        utu: "varies by pay scale",
      }[org.short?.toLowerCase()] || "range varies";
      return withDiscountNote({
        display: `£${lo}–£${hi}/yr`,
        note: noteFor,
      }, roleData, false);
    }
    if (roleData.localLevyPctRange) {
      const [lo, hi] = roleData.localLevyPctRange;
      const min = Math.round(base * (1 + lo / 100));
      const max = Math.round(base * (1 + hi / 100));
      return { display: `£${min}–£${max}/yr`, note: "Range includes 5–20% local district subscription." };
    }
    return withDiscountNote({ display: withMonthly(base, roleData, fteBand(fteSafe, roleData)) }, roleData, false);
  }

  // ── Friendly axis labels ─────────────────────────────────────────────────
  const AXIS_LABELS = {
    collective:            "Collective strength",
    campaigning_education: "Campaigning on education policy",
    campaigning_wider:     "Wider social campaigning",
    protection:            "Individual casework & protection",
    cpd:                   "Professional development",
    affordability:         "Affordable cost",
    leadership:            "Leadership-specific support",
    apolitical:            "Apolitical focus",
    wellbeing:             "Wellbeing & mental health support",
    education_specialist:  "Education-specialist focus",
    party_politics:        "Party-political affiliation",
  };

  // ── Public API ───────────────────────────────────────────────────────────
  return {
    // Question sets
    ROUTING_QUESTIONS,
    CORE_QUESTIONS,
    FTE_QUESTION,

    // Individual routing questions exported for granular use if needed
    R1_ROLE, R2_TRAINING_TYPE, R3_YEARS_QUALIFIED, R4_SUPPORT_ROLE, R5_NATION,

    // Backward-compat: old code (and the share-link decoder in Quiz.jsx)
    // referenced NATION_QUESTION and ROLE_QUESTION. Map to the new equivalents
    // so any cached share links still resolve.
    NATION_QUESTION: R5_NATION,
    ROLE_QUESTION: R1_ROLE,

    // Scoring and presentation
    score,
    tier,
    AXIS_LABELS,
    personalisedCost,
    eligibleOrgsFor,
  };
})();
