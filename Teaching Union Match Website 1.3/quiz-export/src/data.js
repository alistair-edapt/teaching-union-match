// ─────────────────────────────────────────────────────────────────────────────
// Teaching Union Match — core data
// 17 organisations across the four UK nations.
// Costs flagged as {needsVerification: true} should be refreshed from the
// pricing spreadsheet when supplied. Figures here are working estimates only.
// ─────────────────────────────────────────────────────────────────────────────

window.NATIONS = {
  england:     { label: "England",          short: "Eng" },
  scotland:    { label: "Scotland",         short: "Sco" },
  wales:       { label: "Wales",            short: "Cym" },
  ni:          { label: "Northern Ireland", short: "NI"  },
};

// Role groups. Eligibility arrays on each org reference these.
window.ROLES = {
  teacher: { label: "Classroom teacher",    hint: "Includes ECTs, supply, subject specialists" },
  support: { label: "Support staff",        hint: "TAs, admin, finance, caretaking, IT, technicians" },
  leader:  { label: "School leader",        hint: "Head, Deputy, Assistant Head, middle leader or aspiring" },
};

// Each organisation:
//   logo       — path to a real logo file
//   logoBg     — suggested card background when placed on white
//   type       — short categorisation
//   nations    — which of the four nations this org serves
//   eligibility— which role groups it covers
//   character  — scoring axes, 0–5 on each dimension. Used by the quiz engine.
//   costs      — dictionary of {plan name: string amount}
//   description, strengths, considerations, website — UI copy.
window.ORGS = {
  neu: {
    name: "National Education Union",
    short: "NEU",
    logo: "assets/logos/neu.png",
    type: "Trade union",
    nations: ["england", "wales"],
    eligibility: ["teacher", "support", "leader"],
    character: { collective: 5, campaigning: 5, protection: 3, cpd: 3, affordability: 2, leadership: 2, apolitical: 0 },
    costs: {
      "Teacher (full-time)":      "~£228/yr + 5–20% local subs",
      "Teacher (part-time)":      "~£57–£114/yr + local subs",
      "Support staff (FT)":       "~£118/yr + local subs",
      "Leadership":               "~£261/yr + local subs",
      "ECT (first year)":         "£1",
      "Student":                  "Free",
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
    eligibility: ["teacher", "leader"],
    character: { collective: 4, campaigning: 3, protection: 4, cpd: 3, affordability: 3, leadership: 3, apolitical: 1 },
    costs: {
      "Teacher (full-time)":      "~£242/yr (no local subs)",
      "Teacher (part-time)":      "~£61–£121/yr",
      "Leadership":               "~£242/yr",
      "ECT (first year)":         "£2, then discounted yrs 2–3",
      "Student":                  "Free during training",
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
    eligibility: ["teacher", "support", "leader"],
    character: { collective: 0, campaigning: 0, protection: 5, cpd: 2, affordability: 4, leadership: 3, apolitical: 5 },
    costs: {
      "Teacher":        "From ~£6.99/month",
      "Support staff":  "From ~£3.49/month",
      "Leadership":     "From ~£6.99/month",
      "ECT":            "Discounted rates available",
      "Student":        "Free/discounted during training",
    },
    description:
      "An independent, apolitical alternative to a teaching union for people working in schools and colleges in England and Wales. Focuses on individual employment support rather than campaigning or industrial action.",
    strengths: [
      "Professional caseworkers — not volunteer reps",
      "Apolitical — no campaigning or political affiliation",
      "24/7 mental health support line",
      "Often lower monthly cost than traditional unions",
    ],
    considerations: [
      "Cannot organise industrial action on your behalf",
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
    character: { collective: 3, campaigning: 3, protection: 4, cpd: 5, affordability: 1, leadership: 5, apolitical: 3 },
    costs: {
      "Headteacher/Principal":  "~£483/yr",
      "Deputy/Vice Principal":  "~£390/yr",
      "Assistant Head":         "~£291/yr",
      "Business Manager":       "~£266/yr",
      "Professional Associate": "~£229/yr",
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
    character: { collective: 3, campaigning: 3, protection: 4, cpd: 4, affordability: 2, leadership: 5, apolitical: 2 },
    costs: {
      "Executive leader":        "~£43/month",
      "Head/Principal":          "~£40/month",
      "Deputy Head":             "~£33/month",
      "Assistant Head":          "~£23/month",
      "Middle leader":           "~£17/month",
      "School business leader":  "~£23/month",
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
    character: { collective: 3, campaigning: 2, protection: 3, cpd: 1, affordability: 5, leadership: 0, apolitical: 0 },
    costs: {
      "Support staff":  "From ~£5/month",
      "Part-time":      "Reduced rates available",
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
    character: { collective: 4, campaigning: 3, protection: 4, cpd: 1, affordability: 3, leadership: 0, apolitical: 1 },
    costs: {
      "Support staff (FT)":   "~£14–£16/month",
      "Part-time / low paid": "Reduced rates available",
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
    character: { collective: 5, campaigning: 4, protection: 4, cpd: 2, affordability: 3, leadership: 0, apolitical: 1 },
    costs: {
      "Support staff":  "~1.3% of gross pay",
      "Minimum":        "~£1.30/month",
      "Maximum (high earners)": "Capped",
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

  // ── Scotland-specific ──
  eis: {
    name: "Educational Institute of Scotland",
    short: "EIS",
    logo: "assets/logos/eis.jpg",
    type: "Trade union",
    nations: ["scotland"],
    eligibility: ["teacher", "leader"],
    character: { collective: 5, campaigning: 4, protection: 4, cpd: 3, affordability: 2, leadership: 3, apolitical: 0 },
    costs: {
      "Teacher (full-time)":    "~£232/yr",
      "Teacher (part-time)":    "Pro-rata",
      "Leadership":             "~£232/yr",
      "Student":                "Free",
      "Probationer":            "Reduced",
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
    character: { collective: 3, campaigning: 3, protection: 5, cpd: 4, affordability: 3, leadership: 5, apolitical: 3 },
    costs: {
      "Head Teacher":     "~£270/yr",
      "Depute":           "~£210/yr",
      "Principal Teacher":"~£165/yr",
      "Probationer":      "Reduced",
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
      "Primary / special / nursery leadership focus",
      "Smaller membership than general unions",
    ],
    website: "ahds.org.uk",
  },

  // ── Northern Ireland-specific ──
  into: {
    name: "Irish National Teachers' Organisation",
    short: "INTO",
    logo: "assets/logos/into.jpg",
    type: "Trade union",
    nations: ["ni"],
    eligibility: ["teacher", "leader"],
    character: { collective: 4, campaigning: 3, protection: 4, cpd: 3, affordability: 3, leadership: 3, apolitical: 2 },
    costs: {
      "Teacher (full-time)":  "~£220/yr",
      "Leadership":           "~£240/yr",
      "Student":              "Free",
    },
    description:
      "The largest teachers' union on the island of Ireland. In Northern Ireland, it covers primary teachers and principals, with strong casework and professional development.",
    strengths: [
      "Strong in NI primary schools",
      "Cross-border expertise and scale",
      "Dedicated professional learning",
    ],
    considerations: [
      "Primary-focused in NI",
      "Teachers and leaders only",
    ],
    website: "into.ie",
  },

  utu: {
    name: "Ulster Teachers' Union",
    short: "UTU",
    logo: "assets/logos/utu.png",
    type: "Trade union",
    nations: ["ni"],
    eligibility: ["teacher", "leader"],
    character: { collective: 3, campaigning: 2, protection: 5, cpd: 3, affordability: 3, leadership: 3, apolitical: 4 },
    costs: {
      "Teacher (full-time)":  "~£200/yr",
      "Leadership":           "~£215/yr",
      "Student":              "Free",
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
    eligibility: ["teacher", "leader"],
    character: { collective: 3, campaigning: 3, protection: 4, cpd: 3, affordability: 4, leadership: 3, apolitical: 3 },
    costs: {
      "Teacher (full-time)":  "~£195/yr",
      "Leadership":           "~£215/yr",
      "Student":              "Free",
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
