// ─────────────────────────────────────────────────────────────────────────────
// Which Teaching Union — core data
// 14 organisations across the four UK nations.
//
// Schema v2 (April 2026 — cost refresh applied from Union_Membership_Rates 2025-26):
//   - 10 character axes: collective, campaigning_education, campaigning_wider,
//     protection, cpd, affordability, leadership, apolitical, wellbeing,
//     education_specialist (split campaigning into _education and _wider; added
//     wellbeing and education_specialist).
//   - Added Unite as fifth general union for support staff.
//   - Cost data refreshed against verified 2025-26 rates for: NEU, NASUWT,
//     Edapt, ASCL, NAHT, GMB, EIS, AHDS, UCAC. UNISON shown as band-based
//     estimate (1.3% of gross). Unite, INTO, UTU still flagged unverified
//     pending Alistair's update.
//   - Added structured `costData` block alongside human-readable `costs` —
//     used by the FTE-aware cost calculation in quiz-engine.js. Some orgs
//     (Edapt, UCAC, AHDS) use tier-based FTE bands rather than linear
//     pro-rata; structured fields like fte08/fte06 capture this.
//   - Wellbeing scores verified April 2026: only Edapt and NAHT offer
//     specific wellbeing programmes (both score 5); all other orgs score 1.
//   - Affordability scores adjusted to match 2025-26 reality: EIS 2→4
//     (cheapest teacher option), UCAC 4→3 (now mid-pack).
// ─────────────────────────────────────────────────────────────────────────────

window.NATIONS = {
  england:     { label: "England",          short: "Eng" },
  scotland:    { label: "Scotland",         short: "Sco" },
  wales:       { label: "Wales",            short: "Cym" },
  ni:          { label: "Northern Ireland", short: "NI"  },
};

// Role groups. Eligibility arrays on each org reference these.
// `supply` is treated as a teacher variant for eligibility but skips the
// ECT (years-qualified) routing branch.
window.ROLES = {
  teacher: { label: "Classroom teacher",       hint: "Includes ECTs and subject specialists" },
  supply:  { label: "Supply / peripatetic",    hint: "Supply, peripatetic and visiting teachers" },
  support: { label: "Support staff",           hint: "TAs, admin, finance, caretaking, IT, technicians" },
  leader:  { label: "School leader",           hint: "Head, Deputy, Assistant Head, middle leader or aspiring" },
  trainee: { label: "Student / trainee",       hint: "ITT, PGCE, Teach First, apprenticeships" },
};

// Each organisation:
//   logo       — path to a real logo file
//   type       — short categorisation
//   nations    — which of the four nations this org serves
//   eligibility— which role groups it covers (uses ROLES keys above)
//   character  — 10 scoring axes, 0–5 on each. Used by the quiz engine.
//   wellbeing_verified — false until Alistair confirms 24/7 MH support
//   cost_verified — false where pricing is on the fact-check list
//   costs      — human-readable {plan name: string amount} for display
//   costData   — structured numeric data for personalised £ calculations
//                (optional — falls back to `costs` strings when missing)
//   description, strengths, considerations, website — UI copy.
//
// On `costData` shape:
//   teacher: { ft: <annual £>, ect1, ect2, ect3, student, localLevyPctRange: [lo,hi] }
//   support: { ft: <annual £>, lowPaid, ... }
//   leader:  { head, deputy, assistant, middle, business, ... }
//   FTE scaling is applied by the engine to whichever annual figure applies.
window.ORGS = {
  neu: {
    name: "National Education Union",
    short: "NEU",
    logo: "assets/logos/neu.png",
    type: "Trade union",
    nations: ["england", "wales"],
    eligibility: ["teacher", "supply", "support", "leader", "trainee"],
    character: { collective: 5, campaigning_education: 5, campaigning_wider: 5, protection: 3, cpd: 3, affordability: 2, leadership: 2, apolitical: 0, wellbeing: 1, education_specialist: 5, party_politics: 4 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Teacher (full-time)":      "£239–£274/yr (incl. 5–20% local sub)",
      "Teacher (part-time)":      "Pro-rata + local sub",
      "Support staff (FT)":       "£124–£142/yr (incl. local sub)",
      "Leadership":               "£274–£313/yr (incl. local sub)",
      "ECT (year 1 post-qual)":   "£1",
      "Student / trainee":        "Free (except AOR)",
    },
    costData: {
      teacher: { ft: 228, ect1: 1, student: 0, localLevyPctRange: [5, 20] },
      supply:  { ft: 114, localLevyPctRange: [5, 20] },
      support: { ft: 118, localLevyPctRange: [5, 20] },
      leader:  { ft: 261, localLevyPctRange: [5, 20] },
      trainee: { ft: 0 },
    },
    description:
      "The largest education union in the UK and a TUC affiliate. Known for collective action, national campaigning and a strong in-school rep network. Covers teachers, leaders and support staff across England and Wales.",
    strengths: [
      "Largest education union — strongest collective voice",
      "Active on pay, workload and education policy",
      "In-school reps in most secondary and many primary schools",
      "Covers teachers and support staff in the same union",
    ],
    considerations: [
      "Politically active — campaigns beyond narrow employment issues",
      "Local branch subs added on top of the national rate",
      "With size comes less personalised casework in some areas",
    ],
    website: "neu.org.uk",
  },

  nasuwt: {
    name: "NASUWT — The Teachers' Union",
    short: "NASUWT",
    logo: "assets/logos/nasuwt.png",
    type: "Trade union",
    nations: ["england", "wales", "scotland", "ni"],
    altLogos: {
      wales:    "assets/logos/nasuwt-wales.png",
      scotland: "assets/logos/nasuwt-scotland.jpeg",
      ni:       "assets/logos/nasuwt-ni.png",
    },
    eligibility: ["teacher", "supply", "leader", "trainee"],
    character: { collective: 4, campaigning_education: 4, campaigning_wider: 3, protection: 4, cpd: 3, affordability: 3, leadership: 3, apolitical: 2, wellbeing: 1, education_specialist: 5, party_politics: 2 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Teacher (full-time)":          "£242/yr (no local subs)",
      "Teacher (part-time)":          "Pro-rata",
      "Leadership":                   "£242/yr",
      "Qualifying year":              "Free",
      "Year 1 post-qualification":    "£1",
      "Year 2 post-qualification":    "~£81/yr (⅓ rate)",
      "Year 3 post-qualification":    "~£162/yr (⅔ rate)",
      "Student / trainee":            "Free during training",
    },
    costData: {
      // R3 maps onto NASUWT's calendar-year ladder. NASUWT uses calendar
      // years (qualifying year = free; year +1 = £1; year +2 = ⅓; year +3 =
      // ⅔; year +4+ = full). R3 asks the user about academic years (Sep–Aug),
      // which doesn't map cleanly. We use the latter-half-of-the-academic-year
      // interpretation: someone in their "first year" is in their second
      // calendar year post-qual = £1; "second year" = ⅓ rate; etc.
      // This understates costs for users early in an academic year and
      // overstates for those later in it. Acceptable approximation.
      teacher: { ft: 242, ect1: 1, ect2: 81, ect3: 162, student: 0 },
      supply:  { ft: 121 },
      leader:  { ft: 242 },
      trainee: { ft: 0 },
    },
    description:
      "A teachers' union and TUC affiliate covering all four UK nations. Focuses on workplace rights, pay and conditions. Known for strong individual casework and willingness to take industrial action. Teachers and leaders only.",
    strengths: [
      "One transparent fee — no local levies",
      "Strong track record on individual casework",
      "Active across England, Wales, Scotland and Northern Ireland",
      "Member of the TUC",
    ],
    considerations: [
      "Teachers and leaders only — not open to support staff",
      "Smaller than NEU in many English schools",
      "Has a political fund (opt-in / opt-out)",
    ],
    website: "nasuwt.org.uk",
  },

  edapt: {
    name: "Edapt",
    short: "Edapt",
    logo: "assets/logos/edapt.jpg",
    type: "Independent organisation (not a union)",
    nations: ["england", "wales"],
    eligibility: ["teacher", "supply", "support", "leader", "trainee"],
    character: { collective: 0, campaigning_education: 0, campaigning_wider: 0, protection: 5, cpd: 2, affordability: 4, leadership: 3, apolitical: 5, wellbeing: 5, education_specialist: 5, party_politics: 0 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Teaching staff (full-time)":   "£194/yr (£17.95/mo) — annual saves ~10%",
      "Teaching staff (0.8 FTE)":     "£155/yr (£14.36/mo)",
      "Teaching staff (0.6 FTE)":     "£116/yr (£10.77/mo)",
      "Support staff (full-time)":    "£119/yr (£11.00/mo) — annual saves ~10%",
      "Support staff (0.8 FTE)":      "£95/yr (£8.80/mo)",
      "Support staff (0.6 FTE)":      "£71/yr (£6.60/mo)",
      "CEO / Exec Head":              "£416/yr (£38.50/mo)",
      "Headteacher":                  "£346/yr (£32.00/mo)",
      "Deputy / Assistant Head":      "£230/yr (£21.25/mo)",
      "Business Manager":             "£216/yr (£20.00/mo)",
      "Student / trainee":            "Free during training",
    },
    costData: {
      // Edapt uses tiered FTE bands rather than linear pro-rata. Tier figures
      // are stored explicitly. The annual-vs-monthly 10% discount applies to
      // every category EXCEPT students and ECT1s. The engine's display layer
      // adds a note about this discount where applicable.
      teacher: { ft: 194, fte08: 155, fte06: 116, monthly: 17.95, monthly08: 14.36, monthly06: 10.77, annualDiscount: true },
      supply:  { ft: 194, fte08: 155, fte06: 116, monthly: 17.95, monthly08: 14.36, monthly06: 10.77, annualDiscount: true },
      support: { ft: 119, fte08: 95,  fte06: 71,  monthly: 11.00, monthly08: 8.80,  monthly06: 6.60,  annualDiscount: true },
      // Leadership: Edapt has flat-rate grades (no FTE bands published).
      // Use Headteacher rate as the FT default; specific grades available
      // via head/deputy/assistant/business fields if R3 ever distinguishes
      // leader sub-grades.
      leader:  { ft: 346, executive: 416, head: 346, deputy: 230, assistant: 230, business: 216, monthly: 32.00, annualDiscount: true },
      trainee: { ft: 0 },
    },
    description:
      "An independent, apolitical alternative to a teaching union for people working in schools and colleges in England and Wales. Focuses on individual employment support rather than campaigning or industrial action.",
    strengths: [
      "Professional caseworkers — not volunteer reps",
      "Apolitical — no campaigning or political affiliation",
      "24/7 mental health support line",
      "Members can still join strikes as non-union participants",
      "Often lower monthly cost than traditional unions",
    ],
    considerations: [
      "Cannot organise or ballot for industrial action",
      "No in-school rep presence",
      "No collective bargaining",
    ],
    website: "edapt.org.uk",
  },

  ascl: {
    name: "Association of School and College Leaders",
    short: "ASCL",
    logo: "assets/logos/ascl.png",
    type: "Leadership union",
    nations: ["england", "wales", "ni"],
    eligibility: ["leader"],
    character: { collective: 3, campaigning_education: 5, campaigning_wider: 2, protection: 4, cpd: 5, affordability: 1, leadership: 5, apolitical: 3, wellbeing: 1, education_specialist: 5, party_politics: 1 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Executive Head/CEO":              "£501.60/yr",
      "Headteacher/Principal":           "£483.00/yr",
      "Deputy/Vice Principal":           "£390.12/yr",
      "Assistant Head/Senior Postholder":"£291.00/yr",
      "Business Manager / Senior Support":"£266.28/yr",
      "Professional Associate":          "~£229/yr (aspiring leaders)",
    },
    costData: {
      // Professional Associate (aspiring leaders) figure carried over from
      // earlier data — not in latest verified list, may need refresh.
      leader: { executive: 502, head: 483, deputy: 390, assistant: 291, business: 266, associate: 229, ft: 390 },
    },
    description:
      "A leadership-focused union for senior leaders in schools and colleges. Offers specialist CPD, legal support and policy influence tailored to senior roles. Covers England, Wales and Northern Ireland.",
    strengths: [
      "Specialist leadership expertise and CPD",
      "Strong policy influence at government level",
      "Tailored legal advice for leadership roles",
      "Professional Associate grade for aspiring leaders",
    ],
    considerations: [
      "Leaders only — not open to classroom teachers or support staff",
      "Higher fees reflecting seniority",
      "Not a TUC affiliate",
    ],
    website: "ascl.org.uk",
  },

  naht: {
    name: "National Association of Head Teachers",
    short: "NAHT",
    logo: "assets/logos/naht.png",
    type: "Leadership union",
    nations: ["england", "wales", "ni"],
    altLogos: { ni: "assets/logos/naht-ni.png" },
    eligibility: ["leader"],
    character: { collective: 3, campaigning_education: 5, campaigning_wider: 2, protection: 4, cpd: 4, affordability: 2, leadership: 5, apolitical: 2, wellbeing: 5, education_specialist: 5, party_politics: 2 },
    wellbeing_verified: true, // per Alistair's note — needs direct confirm
    cost_verified: true,
    costs: {
      "Executive leader":          "£42.67/mo (~£512/yr)",
      "Head teacher / Principal":  "£40.47/mo (~£486/yr)",
      "Deputy Head / Vice Principal":"£32.93/mo (~£395/yr)",
      "Assistant Head":            "£23.16/mo (~£278/yr)",
      "Middle leader":             "£17.07/mo (~£205/yr)",
      "School business leader":    "£23.16/mo (~£278/yr)",
      "Children's Centre Leader":  "£23.16/mo (~£278/yr)",
      "Part-time (0.6 FTE)":       "40% reduction across all grades",
    },
    costData: {
      // FT figures = monthly × 12. Engine's FTE scaling will under-estimate
      // the 0.6 PT figure slightly (NAHT applies a flat 40% reduction at
      // 0.6 FTE rather than linear). Acceptable approximation.
      leader: { executive: 512, head: 486, deputy: 395, assistant: 278, middle: 205, business: 278, ft: 395 },
    },
    description:
      "A union and TUC affiliate for school leaders at all levels, including middle and aspiring leaders. Active on school funding, accountability and headteacher-specific issues.",
    strengths: [
      "Covers middle leaders upwards — broad leadership eligibility",
      "Strong on headteacher-specific issues",
      "Good CPD offer",
      "Specialist legal support for leadership",
    ],
    considerations: [
      "Leadership only",
      "Higher fees for senior roles",
      "Separate NAHT NI branch for Northern Ireland",
    ],
    website: "naht.org.uk",
  },

  community: {
    name: "Community Union",
    short: "Community",
    logo: "assets/logos/community.png",
    type: "General trade union",
    nations: ["england", "wales", "scotland", "ni"],
    eligibility: ["support"],
    character: { collective: 3, campaigning_education: 1, campaigning_wider: 4, protection: 3, cpd: 1, affordability: 5, leadership: 0, apolitical: 0, wellbeing: 1, education_specialist: 1, party_politics: 5 },
    wellbeing_verified: true,
    cost_verified: false, // refresh needed per fact-check list
    costs: {
      "Support staff":  "From ~£5/month",
      "Part-time":      "Reduced rates available",
    },
    costData: {
      support: { ft: 60 },   // ~£5 × 12 — refresh on verification
    },
    description:
      "A general trade union and TUC affiliate covering workers across many sectors, including school support staff. Affiliated to the Labour Party. An affordable way to get full trade union protections.",
    strengths: [
      "Affordable membership fees",
      "Full trade union protections",
      "Member of the TUC",
      "Covers support staff across the UK",
    ],
    considerations: [
      "Not education-specific — less specialist knowledge",
      "Support staff only",
      "Affiliated to the Labour Party",
    ],
    website: "community-tu.org",
  },

  gmb: {
    name: "GMB Union",
    short: "GMB",
    logo: "assets/logos/gmb.png",
    type: "General trade union",
    nations: ["england", "wales", "scotland", "ni"],
    eligibility: ["support"],
    character: { collective: 4, campaigning_education: 1, campaigning_wider: 4, protection: 4, cpd: 1, affordability: 3, leadership: 0, apolitical: 1, wellbeing: 1, education_specialist: 1, party_politics: 3 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Full-time (>20 hrs/week)": "£15.18/mo (~£182/yr)",
      "Part-time (≤20 hrs/week)": "£8.57/mo (~£103/yr)",
      "Apprentice":                "£3.00/mo",
      "Student (non-working)":     "£1.00/mo",
    },
    costData: {
      // Note: GMB defines part-time as ≤20 hrs/week, not by FTE band, so
      // engine FTE scaling is approximate. PT rate is closer to a flat
      // figure than linear pro-rata. Schools members are advised to check
      // local GMB office for current rates.
      support: { ft: 182, fte05: 103 },
    },
    description:
      "One of the UK's largest general unions and a TUC affiliate. Covers school support staff — TAs, caretakers, admin, technicians. Strong on public sector pay and workplace rights.",
    strengths: [
      "Large union with collective bargaining power",
      "Strong public sector presence",
      "Good legal and employment support",
      "Covers support staff across all four nations",
    ],
    considerations: [
      "Not education-specific",
      "Support staff only",
      "Reps may not be education specialists",
    ],
    website: "gmb.org.uk",
  },

  unison: {
    name: "UNISON",
    short: "UNISON",
    logo: "assets/logos/unison.png",
    type: "Public sector union",
    nations: ["england", "wales", "scotland", "ni"],
    eligibility: ["support"],
    character: { collective: 5, campaigning_education: 2, campaigning_wider: 5, protection: 4, cpd: 2, affordability: 3, leadership: 0, apolitical: 1, wellbeing: 1, education_specialist: 2, party_politics: 3 },
    wellbeing_verified: true,
    cost_verified: false, // earnings-based; estimate only
    costs: {
      "Support staff":              "1.3% of gross pay",
      "Typical TA (~£20k–£25k)":    "~£260–£325/yr",
      "Minimum":                    "~£15/yr (£1.30/mo)",
      "Maximum (high earners)":     "Capped",
    },
    costData: {
      // Earnings-based, so this is a reasonable estimate for a typical TA
      // on around £25k gross. Real figure varies materially with salary —
      // the qualitative table below tells the user that.
      support: { ft: 325 },
    },
    description:
      "The UK's largest public sector union and a TUC affiliate. Strong presence in schools for support staff — TAs, admin, caretakers — with a dedicated education sector team.",
    strengths: [
      "Largest public sector union — significant bargaining power",
      "Dedicated education sector team",
      "Strong local authority / school presence",
      "Fees scale with earnings — low-paid staff pay little",
    ],
    considerations: [
      "Support staff only",
      "Not teaching-specific",
      "Earnings-based fees can be higher for better-paid roles",
    ],
    website: "unison.org.uk",
  },

  unite: {
    name: "Unite the Union",
    short: "Unite",
    logo: "assets/logos/unite.png",
    type: "General trade union",
    nations: ["england", "wales", "scotland", "ni"],
    eligibility: ["support"],
    character: { collective: 4, campaigning_education: 1, campaigning_wider: 5, protection: 4, cpd: 1, affordability: 3, leadership: 0, apolitical: 0, wellbeing: 1, education_specialist: 1, party_politics: 5 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "School support (low pay ≤£26k)": "£148–£176/yr (£12.35–£14.69/mo)",
      "Full-time (>21 hrs/week)":       "£223–£266/yr (£18.59–£22.18/mo)",
      "Part-time (≤21 hrs/week)":       "£136–£159/yr (£11.35–£13.22/mo)",
      "Apprentice":                     "£65–£74/yr (£5.41–£6.15/mo)",
    },
    costData: {
      // Most school TAs / admin / catering staff earn ≤£26k, so the Low Pay
      // band is the right default. We use the "From monthly" figure (cheaper
      // end) as the headline; range covers the From–Approx spread.
      // Full Time band noted in qualitative table for higher earners.
      support: { ft: 148, ftRange: [148, 176] },
    },
    description:
      "One of the UK's largest general unions, with members across many sectors including some school support staff. Covers TAs, admin, facilities and similar roles. Politically active and a Labour Party affiliate.",
    strengths: [
      "Large general union with significant bargaining power",
      "Active on pay and conditions across the public sector",
      "Member of the TUC; affiliated to the Labour Party",
      "Covers support staff across all four nations",
    ],
    considerations: [
      "Not education-specific — limited specialist schools knowledge",
      "Few in-school reps compared to NEU and NASUWT — most school members are reached through general regional structures rather than dedicated school presence",
      "Support staff only",
      "Politically active and affiliated to the Labour Party",
    ],
    website: "unitetheunion.org",
  },

  // ── Scotland-specific ──
  eis: {
    name: "Educational Institute of Scotland",
    short: "EIS",
    logo: "assets/logos/eis.jpg",
    type: "Trade union",
    nations: ["scotland"],
    eligibility: ["teacher", "supply", "leader", "trainee"],
    character: { collective: 5, campaigning_education: 5, campaigning_wider: 3, protection: 4, cpd: 3, affordability: 4, leadership: 3, apolitical: 1, wellbeing: 1, education_specialist: 5, party_politics: 2 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Teacher (full-time, DD)":    "£169–£187/yr (national £156 + local sub by council)",
      "Teacher (full-time, other)": "£202–£220/yr (no DD discount)",
      "Teacher / supply (part-time, ≤50%)": "£86–£95/yr",
      "Leadership":                 "£169–£187/yr",
      "Student / probationer":      "Reduced",
    },
    costData: {
      // National £155.64/yr direct debit + Local Association sub varies by
      // council band (A–E: £13.20–£30.00). Range reflects this. Part-time =
      // employed for 50% or less of normal week (or supply teacher).
      teacher: { ft: 178, ftRange: [169, 187], student: 0 },
      supply:  { ft: 91,  ftRange: [86, 95] },
      leader:  { ft: 178, ftRange: [169, 187] },
      trainee: { ft: 0 },
    },
    description:
      "Scotland's largest teaching union and a founding STUC affiliate. Covers teachers and lecturers across Scottish schools, colleges and universities. Very active on pay and conditions in Scotland.",
    strengths: [
      "Largest union in Scottish education",
      "Strong collective bargaining in Scotland's SNCT",
      "Active on pay, workload and policy",
      "Dense in-school rep network",
    ],
    considerations: [
      "Scotland only",
      "Teachers / lecturers / leaders — not support staff",
      "Politically active",
    ],
    website: "eis.org.uk",
  },

  ahds: {
    name: "Association of Headteachers and Deputes in Scotland",
    short: "AHDS",
    logo: "assets/logos/ahds.svg",
    type: "Leadership union",
    nations: ["scotland"],
    eligibility: ["leader"],
    character: { collective: 3, campaigning_education: 4, campaigning_wider: 2, protection: 5, cpd: 4, affordability: 3, leadership: 5, apolitical: 4, wellbeing: 1, education_specialist: 5, party_politics: 0 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Head / Depute":              "£26.00/mo (£312/yr)",
      "Principal Teacher":          "£18.00/mo (£216/yr)",
      "Head / Depute (≤0.6 FTE)":   "£15.60/mo (~£187/yr)",
      "Principal Teacher (≤0.6 FTE)":"£10.80/mo (~£130/yr)",
    },
    costData: {
      // 40% reduction at ≤0.6 FTE for both grades. Engine FTE × ft handles
      // this approximately — true PT figures are slightly higher than linear
      // would predict (£187 vs £312 × 0.6 = £187 — actually exact).
      leader: { head: 312, deputy: 312, principal: 216, ft: 312 },
    },
    description:
      "The professional association and recognised trade union for primary, special and nursery school leaders in Scotland. Specialist casework, CPD and representation for Scottish school leaders.",
    strengths: [
      "Specialist support for Scottish primary and special-school leaders",
      "Dedicated casework for leadership situations",
      "Seat at Scottish negotiating tables",
    ],
    considerations: [
      "Scotland only",
      "Primary, special and nursery leaders only — not secondary (Scottish secondary leaders should look at School Leaders Scotland)",
      "Smaller membership than general unions",
    ],
    website: "ahds.org.uk",
  },

  // ── Scotland-specific (continued) ──
  sls: {
    name: "School Leaders Scotland",
    short: "SLS",
    logo: "assets/logos/sls.png",
    type: "Leadership association",
    nations: ["scotland"],
    eligibility: ["leader"],
    character: { collective: 3, campaigning_education: 4, campaigning_wider: 1, protection: 5, cpd: 4, affordability: 3, leadership: 5, apolitical: 4, wellbeing: 1, education_specialist: 5, party_politics: 0 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Headteacher":                       "£446.40/yr (£37.20/mo)",
      "Depute":                            "£343.80/yr (£28.65/mo)",
      "Faculty Head / PT / Bursar / BM":   "£253.20/yr (£21.10/mo)",
    },
    costData: {
      // Scottish secondary leadership grades. Default `ft` uses the Depute
      // figure as the typical mid-grade reference for FTE-aware cost display.
      leader: { head: 446, deputy: 344, principal: 253, business: 253, ft: 344 },
    },
    description:
      "The professional association and recognised trade union for secondary school leaders in Scotland — present in over 90% of Scottish secondary schools and representing around 75% of headteachers. Fully affiliated to ASCL, which gives members full trade union rights and access to ASCL's wider legal infrastructure. Sits alongside AHDS (which serves primary, special and nursery leaders).",
    strengths: [
      "Specialist support for Scottish secondary school leaders",
      "Dedicated field officer support and leadership-specific casework",
      "Policy access in Scottish secondary education — parliamentary bulletins, position statements",
      "ASCL affiliation provides expert legal advice and broader trade union backing",
      "Notably apolitical professional association",
    ],
    considerations: [
      "Scotland only",
      "Secondary leaders only — Scottish primary leaders should look at AHDS",
      "Less industrial-action presence than larger teacher unions",
    ],
    website: "sls-scotland.org.uk",
  },

  ssta: {
    name: "Scottish Secondary Teachers' Association",
    short: "SSTA",
    logo: "assets/logos/ssta.png",
    type: "Trade union",
    nations: ["scotland"],
    eligibility: ["teacher", "supply", "trainee"],
    character: { collective: 4, campaigning_education: 4, campaigning_wider: 2, protection: 4, cpd: 3, affordability: 4, leadership: 2, apolitical: 2, wellbeing: 1, education_specialist: 5, party_politics: 1 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Full-time (annual, by 31 Jan)":     "£212.08/yr",
      "Full-time (after 31 Jan)":          "£231.36/yr",
      "Full-time (monthly DD)":            "£19.28/mo",
      "Part-time / job-share / supply":    "£106.04/yr (£9.64/mo)",
      "New entrant / NQT":                 "Free for 16 months from August of qualifying year",
    },
    costData: {
      // SSTA uses a flat ~50% discount for part-time / job-share / supply
      // (identical to EIS's structure). Annual figure (£212) is what users see
      // if they pay annually by 31 Jan — most do. Monthly DD billing is
      // £19.28/mo, which works out to £231.36 over the year (~9% premium for
      // monthly). The new-entrant 16-month free window is broadly equivalent
      // to NASUWT's "free in qualifying year" — so we map ect1 = 0.
      teacher: { ft: 212, monthly: 19.28, fte05: 106, monthly05: 9.64, ect1: 0, student: 0 },
      supply:  { ft: 106, monthly: 9.64 },
      trainee: { ft: 0 },
    },
    description:
      "Scotland's only specialist union for secondary teachers, founded in 1944. Twin aims are to advance Scottish education and safeguard secondary teachers' interests, especially on pay and conditions. Active in SNCT pay negotiations alongside EIS and NASUWT — and active in industrial action when negotiation fails (recent ballots over pay 2022 and over class contact time 2025–26).",
    strengths: [
      "Secondary-specific focus in Scotland",
      "Casework escalates to professional staff — similar model to NEU/NASUWT",
      "Free legal advice on professional matters; extended legal service via Thompsons",
      "16 months free for new entrants — generous trainee/NQT offer",
      "Willing to ballot for industrial action when negotiation fails",
    ],
    considerations: [
      "Scotland only",
      "Secondary teachers (and trainees) only — not for leaders or primary teachers",
      "Smaller than EIS — less broad sector representation",
      "Has a political fund framework, though no public evidence of party donations",
    ],
    website: "ssta.org.uk",
  },

  // ── Northern Ireland-specific ──
  into: {
    name: "Irish National Teachers' Organisation",
    short: "INTO",
    logo: "assets/logos/into.jpg",
    type: "Trade union",
    nations: ["ni"],
    eligibility: ["teacher", "supply", "leader", "trainee"],
    character: { collective: 4, campaigning_education: 4, campaigning_wider: 3, protection: 4, cpd: 3, affordability: 3, leadership: 3, apolitical: 2, wellbeing: 1, education_specialist: 5, party_politics: 2 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Permanent teacher":             "£198–£296/yr (0.6% of gross salary)",
      "Voluntary Grammar (FT)":        "£240/yr (£20/mo flat rate)",
      "Voluntary Grammar (PT/supply)": "£120/yr (£10/mo flat rate)",
      "Supply / part-time":            "Pro-rata on days worked (0.6% of pay)",
      "Newly qualified (first year)":  "Free until end of August",
      "Student / trainee":             "Free",
      "New member offer":              "First 6 months free (non-NQT)",
    },
    costData: {
      // INTO is salary-based: 0.6% of gross, deducted by Department of
      // Education from payroll. Min £16.46/mo (£198/yr) on lowest pay,
      // max £24.69/mo (£296/yr) at the cap. Range reflects this.
      // Voluntary Grammar schools have separate flat rates that we surface
      // in the qualitative table only — R-questions don't ask school type.
      teacher: { ft: 247, ftRange: [198, 296], student: 0 },
      supply:  { ft: 178, ftRange: [120, 296] },  // includes max £29.63/mo for supply
      leader:  { ft: 247, ftRange: [198, 296] },
      trainee: { ft: 0 },
    },
    description:
      "The largest teachers' union on the island of Ireland. In Northern Ireland it represents teachers and principals across both primary and post-primary (secondary) schools, with strong casework and professional development.",
    strengths: [
      "Cross-border presence — strong in NI primary, post-primary and special schools",
      "Salary-based subscription deducted directly from payroll",
      "Dedicated professional learning offer",
      "Free for trainees and newly qualified teachers in the first year",
    ],
    considerations: [
      "Northern Ireland only (separate INTO branches operate in Republic of Ireland)",
      "Teachers and leaders only — not for non-teaching support staff",
      "Salary-based fee means cost rises with pay scale",
    ],
    website: "into.ie",
  },

  utu: {
    name: "Ulster Teachers' Union",
    short: "UTU",
    logo: "assets/logos/utu.png",
    type: "Trade union",
    nations: ["ni"],
    eligibility: ["teacher", "supply", "leader", "trainee"],
    character: { collective: 3, campaigning_education: 2, campaigning_wider: 1, protection: 5, cpd: 3, affordability: 3, leadership: 3, apolitical: 4, wellbeing: 1, education_specialist: 5, party_politics: 0 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Teacher (M2 — entry)":          "£190/yr (£15.83/mo)",
      "Teacher (M5)":                  "£235/yr (£19.57/mo)",
      "Teacher (M6 — top of MPS)":     "£253/yr (£21.07/mo)",
      "Teacher / leader (UPS1+)":      "£273–£294/yr (£22.78–£24.46/mo)",
      "Part-time / job share":         "Pro-rata (0.6% of gross salary)",
      "Students / first-year NQT":     "Free",
    },
    costData: {
      // UTU pricing is salary-banded across the NI teaching pay scale
      // (M2 to UPS3), at roughly 0.6% of gross salary. Mid-band M5/M6 is
      // ~£245/yr. Range reflects entry-to-cap.
      teacher: { ft: 245, ftRange: [190, 294], student: 0 },
      supply:  { ft: 122, ftRange: [95, 147] },
      leader:  { ft: 280, ftRange: [273, 294] },
      trainee: { ft: 0 },
    },
    description:
      "A Northern Ireland teaching union with a focus on individual member support and a notably apolitical stance. Covers teachers and school leaders across NI.",
    strengths: [
      "Strong individual casework tradition",
      "Notably apolitical",
      "Personal service — small membership",
    ],
    considerations: [
      "Northern Ireland only",
      "Smaller than INTO or NASUWT NI",
      "Teachers and leaders only",
    ],
    website: "utu.edu",
  },

  // ── Wales-specific ──
  ucac: {
    name: "Undeb Cenedlaethol Athrawon Cymru",
    short: "UCAC",
    logo: "assets/logos/ucac.png",
    type: "Trade union",
    nations: ["wales"],
    eligibility: ["teacher", "supply", "leader", "trainee"],
    character: { collective: 3, campaigning_education: 4, campaigning_wider: 2, protection: 4, cpd: 3, affordability: 3, leadership: 3, apolitical: 3, wellbeing: 1, education_specialist: 5, party_politics: 1 },
    wellbeing_verified: true,
    cost_verified: true,
    costs: {
      "Teacher / leader (full-time)":   "£19.38/mo (£233/yr)",
      "Teacher (0.7–0.99 FTE)":         "£16.24/mo (£195/yr)",
      "Teacher (0.4–0.69 FTE)":         "£13.42/mo (£161/yr)",
      "Teacher (≤0.39 FTE)":            "£10.82/mo (£130/yr)",
      "Trainee / Newly Qualified":      "Free",
    },
    costData: {
      // UCAC uses tiered FTE bands rather than linear pro-rata. Tier figures
      // are stored explicitly and personalisedCost matches FTE to band.
      teacher: { ft: 233, fte08: 195, fte05: 161, fte02: 130, student: 0 },
      supply:  { ft: 233, fte08: 195, fte05: 161, fte02: 130 },
      leader:  { ft: 233, fte08: 195, fte05: 161, fte02: 130 },
      trainee: { ft: 0 },
    },
    description:
      "The Welsh-medium and Wales-focused teaching union. Bilingual service, strong on Welsh education policy, and casework delivered through the medium of Welsh or English.",
    strengths: [
      "Bilingual support (Welsh / English)",
      "Specialist voice in Welsh education policy",
      "Personal, locally-rooted service",
    ],
    considerations: [
      "Wales only",
      "Smaller than NEU Cymru or NASUWT Cymru",
      "Teachers and leaders only",
    ],
    website: "ucac.cymru",
  },
};

// Convenience arrays
window.ORG_KEYS = Object.keys(window.ORGS);

// Schema version — bumped to 2 for the 10-axis split. quiz-engine.js uses
// this to invalidate stale localStorage from earlier sessions.
window.WTU_SCHEMA_VERSION = 2;
