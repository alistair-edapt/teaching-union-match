import { useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const ORGANISATIONS = {
  neu: {
    name: "National Education Union (NEU)",
    shortName: "NEU",
    color: "#2ea8da",
    accent: "#2D3540",
    type: "Trade Union",
    eligibility: ["teacher", "support", "leader"],
    description:
      "The largest education union in the UK and a member of the TUC. Strong on collective action, campaigning, and political engagement. Covers teachers, leaders, and support staff.",
    costs: {
      "Teacher (full-time)": "~£228/yr + 5–20% local subs",
      "Teacher (part-time)": "~£57–£114/yr + local subs",
      "Support staff (full-time)": "~£118/yr + local subs",
      "Support staff (part-time)": "~£29–£59/yr + local subs",
      "Leadership": "~£261/yr + local subs",
      "ECT (first year)": "£1",
      "Student": "Free",
    },
    strengths: [
      "Largest education union — strong collective voice",
      "Member of the TUC",
      "Active campaigning on pay, workload, and education policy",
      "In-school reps in most schools",
      "Industrial action capability",
      "Covers teachers AND support staff",
      "Wide range of CPD and resources",
    ],
    considerations: [
      "Politically active — campaigns on education policy and wider social issues",
      "Local subs (5–20%) added to national rate",
      "Large membership means less personalised support in some areas",
    ],
    website: "neu.org.uk",
  },
  nasuwt: {
    name: "NASUWT – The Teachers' Union",
    shortName: "NASUWT",
    color: "#1c174a",
    accent: "#bfd630",
    type: "Trade Union",
    eligibility: ["teacher", "leader"],
    description:
      "A teachers' union and TUC member focused on workplace rights, pay, and conditions. Known for strong casework support and willingness to take industrial action. Teachers only — does not cover support staff.",
    costs: {
      "Teacher (full-time)": "~£242/yr (no local subs)",
      "Teacher (part-time)": "~£61–£121/yr",
      "Leadership": "~£242/yr",
      "ECT (first year)": "£2, then discounted yrs 2–3",
      "Student": "Free during training",
    },
    strengths: [
      "No hidden local levies — one transparent fee",
      "Strong track record on casework and individual support",
      "Member of the TUC",
      "Industrial action capability",
      "Dedicated to teachers' employment rights",
      "Active on pay campaigns and workload",
    ],
    considerations: [
      "Teachers only — not available to support staff or TAs",
      "Smaller than NEU so fewer in-school reps in some areas",
      "Has a political fund (opt-in/out)",
    ],
    website: "nasuwt.org.uk",
  },
  edapt: {
    name: "Edapt",
    shortName: "Edapt",
    color: "#151F3B",
    accent: "#FED02F",
    type: "Independent Organisation (not a union)",
    eligibility: ["teacher", "support", "leader"],
    description:
      "An independent, apolitical alternative to a teaching union for people working in schools and colleges in England and Wales. Focuses on individual employment support and protection rather than campaigning, lobbying, or organising industrial action.",
    costs: {
      "Teacher": "From ~£6.99/month",
      "Support staff": "From ~£3.49/month",
      "Leadership": "From ~£6.99/month",
      "ECT": "Discounted rates available",
      "Student": "Free/discounted during training",
    },
    strengths: [
      "Professional caseworkers — not volunteers or workplace reps",
      "Apolitical — no campaigning or political affiliation",
      "Members can still join other unions' industrial action with same protections",
      "24/7 mental health support line",
      "Benefits hub and large free knowledge base",
      "Focused purely on individual employment support",
      "Often more affordable than traditional unions",
    ],
    considerations: [
      "Cannot organise industrial action on your behalf",
      "No in-school rep presence",
      "No collective bargaining power",
      "Smaller community compared to large unions",
    ],
    website: "edapt.org.uk",
  },
  ascl: {
    name: "Association of School and College Leaders (ASCL)",
    shortName: "ASCL",
    color: "#1f3e75",
    accent: "#ed028c",
    type: "Trade Union (Leadership)",
    eligibility: ["leader"],
    description:
      "A leadership-focused union for senior leaders in schools and colleges. Offers specialist professional development, legal support, and policy influence tailored to those in senior positions.",
    costs: {
      "Headteacher/Principal": "~£483/yr",
      "Deputy/Vice Principal": "~£390/yr",
      "Assistant Head": "~£291/yr",
      "Business Manager": "~£266/yr",
      "Professional Associate": "~£229/yr",
    },
    strengths: [
      "Specialist leadership support and expertise",
      "Strong policy influence at government level",
      "High-quality CPD for senior leaders",
      "Tailored legal and employment advice for leadership roles",
      "Professional Associate grade for aspiring leaders",
    ],
    considerations: [
      "Only for school/college leaders — not classroom teachers or support staff",
      "Higher fees reflecting seniority",
      "Smaller membership means less in-school presence",
      "Not a member of the TUC",
    ],
    website: "ascl.org.uk",
  },
  naht: {
    name: "National Association of Head Teachers (NAHT)",
    shortName: "NAHT",
    color: "#041948",
    accent: "#58b0e3",
    type: "Trade Union (Leadership)",
    eligibility: ["leader"],
    description:
      "A union and TUC member for school leaders at all levels, including middle leaders and aspiring leaders. Strong on headteacher-specific issues, professional development, and representation.",
    costs: {
      "Executive leader": "~£43/month",
      "Head/Principal": "~£40/month",
      "Deputy Head": "~£33/month",
      "Assistant Head": "~£23/month",
      "Middle leader": "~£17/month",
      "School business leader": "~£23/month",
    },
    strengths: [
      "Covers middle leaders upwards — broader leadership eligibility",
      "Member of the TUC",
      "Strong on headteacher-specific issues",
      "Good professional development offer",
      "Specialist legal support for leadership",
      "Active on school funding and accountability policy",
    ],
    considerations: [
      "Only for those in leadership roles",
      "Not available to classroom teachers or support staff",
      "Higher fees for senior roles",
    ],
    website: "naht.org.uk",
  },
  community: {
    name: "Community Union",
    shortName: "Community",
    color: "#E6007E",
    accent: "#FFFFFF",
    type: "Trade Union (General)",
    eligibility: ["support"],
    description:
      "A general trade union and TUC member (not education-specific) that covers workers across many sectors including education support staff. Affiliated to the Labour Party. An affordable option with trade union protections.",
    costs: {
      "Support staff": "From ~£5/month",
      "Part-time": "Reduced rates available",
    },
    strengths: [
      "Affordable membership fees",
      "Full trade union protections and rights",
      "Member of the TUC",
      "Industrial action capability",
      "Covers support staff in education",
    ],
    considerations: [
      "Not education-specific — less specialist knowledge",
      "Only suitable for support staff roles",
      "Unlikely to have in-school reps",
      "Less education-focused CPD and resources",
      "Affiliated to the Labour Party",
    ],
    website: "community-tu.org",
  },
  gmb: {
    name: "GMB Union",
    shortName: "GMB",
    color: "#f16714",
    accent: "#1c1c1a",
    type: "Trade Union (General)",
    eligibility: ["support"],
    description:
      "One of the UK's largest general unions and a TUC member. Covers school support staff including TAs, caretakers, admin staff, and more. Strong on workplace rights and public sector pay.",
    costs: {
      "Support staff (full-time)": "~£14–£16/month",
      "Part-time/low paid": "Reduced rates available",
    },
    strengths: [
      "Large union with significant collective bargaining power",
      "Member of the TUC",
      "Strong public sector presence — reps in many councils/schools",
      "Industrial action capability",
      "Good legal and employment support",
      "Active on public sector pay campaigns",
    ],
    considerations: [
      "Not education-specific",
      "Only suitable for support staff roles",
      "Reps may not be education specialists",
    ],
    website: "gmb.org.uk",
  },
  unison: {
    name: "UNISON",
    shortName: "UNISON",
    color: "#43165E",
    accent: "#4C832C",
    type: "Trade Union (Public Sector)",
    eligibility: ["support"],
    description:
      "The UK's largest public sector union and a TUC member. Strong presence in schools for support staff. Covers TAs, admin, caretakers, and other support roles with dedicated education sector support.",
    costs: {
      "Support staff": "Based on earnings — ~1.3% of gross pay",
      "Minimum": "~£1.30/month for lowest earners",
    },
    strengths: [
      "Largest public sector union — significant bargaining power",
      "Member of the TUC",
      "Dedicated education sector team",
      "Strong local authority/school presence for support staff",
      "Industrial action capability",
      "Good legal support and representation",
      "Active on public sector pay and conditions",
    ],
    considerations: [
      "Only suitable for support staff roles",
      "Not teaching-specific",
      "Fees based on earnings (could be higher for better-paid support roles)",
    ],
    website: "unison.org.uk",
  },
};

// ─── Match tier ──────────────────────────────────────────────────────────────

function getMatchTier(score, maxScore) {
  const r = score / maxScore;
  if (r >= 0.85) return { label: "Strong match", bg: "#E8F5EC", border: "#4A7C6F", dot: "#4A7C6F" };
  if (r >= 0.65) return { label: "Good match", bg: "#EBF3FC", border: "#5B8DB8", dot: "#5B8DB8" };
  if (r >= 0.4) return { label: "Worth considering", bg: "#FFF8EB", border: "#C8A050", dot: "#C8A050" };
  return { label: "Less likely fit", bg: "#F5F3F1", border: "#C8C4C0", dot: "#A8A4A0" };
}

// ─── SVG Logo Tiles ──────────────────────────────────────────────────────────

const OrgLogo = ({ orgKey }) => {
  const s = 44;
  const logos = {
    neu: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#2ea8da"/><text x="22" y="24" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">NEU</text></svg>
    ),
    nasuwt: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#1c174a"/><rect x="4" y="34" width="36" height="3" rx="1.5" fill="#bfd630"/><text x="22" y="20" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="7.5" letterSpacing="0.3">NASUWT</text></svg>
    ),
    edapt: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#151F3B"/><text x="22" y="24" textAnchor="middle" dominantBaseline="middle" fill="#FED02F" fontFamily="Georgia,serif" fontWeight="400" fontSize="14" letterSpacing="0.3">edapt</text></svg>
    ),
    ascl: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#1f3e75"/><text x="22" y="22" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.5">ASCL</text><rect x="4" y="33" width="36" height="3" rx="1.5" fill="#ed028c"/></svg>
    ),
    naht: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#041948"/><text x="22" y="22" textAnchor="middle" dominantBaseline="middle" fill="#58b0e3" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.5">NAHT</text><rect x="4" y="33" width="17" height="3" rx="1.5" fill="#58b0e3"/><rect x="23" y="33" width="17" height="3" rx="1.5" fill="#6a489e"/></svg>
    ),
    community: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#E6007E"/><text x="22" y="24" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="19" letterSpacing="-0.5">C</text></svg>
    ),
    gmb: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#1c1c1a"/><text x="22" y="24" textAnchor="middle" dominantBaseline="middle" fill="#f16714" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">GMB</text></svg>
    ),
    unison: (
      <svg width={s} height={s} viewBox="0 0 44 44"><rect width="44" height="44" rx="9" fill="#43165E"/><text x="22" y="22" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="8" letterSpacing="0.3">UNISON</text><rect x="4" y="32" width="36" height="3" rx="1.5" fill="#4C832C"/></svg>
    ),
  };
  return logos[orgKey] || null;
};

// ─── Questions ───────────────────────────────────────────────────────────────

const ROLE_QUESTION = {
  id: "role", text: "What best describes your role?",
  subtitle: "This helps us show you only the options that are available to you.",
  options: [
    { id: "teacher", label: "Classroom Teacher", desc: "Including ECTs, supply teachers, and subject specialists" },
    { id: "support", label: "Support Staff", desc: "TAs, admin, caretakers, IT, finance, and other support roles" },
    { id: "leader", label: "School Leader", desc: "Head, Deputy, Assistant Head, middle leader, or aspiring leader" },
  ],
};

const QUICK_QUESTIONS = [
  { id: "priority", text: "What matters most to you?", subtitle: "Choose the statement that best reflects your priorities.", type: "single",
    options: [
      { id: "protection", label: "Personal protection", desc: "I mainly want support if something goes wrong — legal advice, representation, casework" },
      { id: "collective", label: "Collective strength", desc: "I want to be part of something bigger — collective bargaining, campaigns, and industrial action if needed" },
      { id: "professional", label: "Professional development", desc: "I want career support, CPD, and leadership development alongside basic protection" },
      { id: "affordable", label: "Affordable cover", desc: "I want solid basic protection at the lowest possible cost" },
    ],
    scoring: { protection: { edapt: 4, nasuwt: 2, neu: 1, ascl: 1, naht: 1, community: 1, gmb: 1, unison: 1 }, collective: { neu: 4, nasuwt: 3, gmb: 3, unison: 3, community: 2, naht: 2, ascl: 2, edapt: 0 }, professional: { ascl: 4, naht: 4, edapt: 2, neu: 2, nasuwt: 1, community: 0, gmb: 0, unison: 0 }, affordable: { edapt: 3, community: 4, gmb: 2, unison: 2, neu: 1, nasuwt: 1, ascl: 0, naht: 0 } },
  },
  { id: "industrial", text: "How do you feel about industrial action (e.g. strikes)?", subtitle: "There's no right or wrong answer — this helps match you to the right type of organisation.", type: "single",
    options: [
      { id: "important", label: "It's an important right", desc: "I believe strike action is a vital tool and I want an organisation that will use it when needed" },
      { id: "lastresort", label: "Only as a last resort", desc: "I'd prefer negotiation first, but I accept it may sometimes be necessary" },
      { id: "notforme", label: "Not for me", desc: "I'd prefer not to be involved in industrial action — I just want personal support" },
    ],
    scoring: { important: { neu: 4, nasuwt: 4, gmb: 3, unison: 3, community: 2, naht: 1, ascl: 1, edapt: 0 }, lastresort: { nasuwt: 3, neu: 2, naht: 3, ascl: 3, gmb: 2, unison: 2, community: 2, edapt: 2 }, notforme: { edapt: 5, ascl: 2, naht: 2, community: 1, gmb: 0, unison: 0, neu: 0, nasuwt: 0 } },
  },
  { id: "politics", text: "How important is it that your organisation campaigns on wider issues?", subtitle: "For example, education policy, global issues, or social justice.", type: "single",
    options: [
      { id: "veryimportant", label: "Very important", desc: "I want my organisation to have a voice on the big issues affecting education and society" },
      { id: "nice", label: "Nice to have, not essential", desc: "I appreciate it but it's not the main reason I'd join" },
      { id: "prefer_not", label: "I'd prefer they didn't", desc: "I want my organisation to stay focused on supporting me, not political campaigning" },
    ],
    scoring: { veryimportant: { neu: 5, nasuwt: 3, gmb: 2, unison: 3, community: 1, naht: 2, ascl: 2, edapt: 0 }, nice: { nasuwt: 2, neu: 2, naht: 2, ascl: 2, gmb: 1, unison: 1, community: 1, edapt: 2 }, prefer_not: { edapt: 5, community: 2, gmb: 1, unison: 1, ascl: 1, naht: 1, nasuwt: 0, neu: 0 } },
  },
  { id: "support_type", text: "When it comes to support, which would you value more?", type: "single",
    options: [
      { id: "professional_casework", label: "Professional caseworkers", desc: "Dedicated, trained professionals handling my case — I want expertise" },
      { id: "school_rep", label: "An in-school rep", desc: "Someone in my building who knows the context and can be a first port of call" },
      { id: "either", label: "I don't mind either way", desc: "Both approaches have merits — it's not a deciding factor for me" },
    ],
    scoring: { professional_casework: { edapt: 5, ascl: 3, naht: 3, nasuwt: 2, neu: 1, community: 1, gmb: 1, unison: 1 }, school_rep: { neu: 4, nasuwt: 3, unison: 3, gmb: 2, community: 1, naht: 1, ascl: 1, edapt: 0 }, either: { neu: 2, nasuwt: 2, edapt: 2, ascl: 2, naht: 2, gmb: 2, unison: 2, community: 2 } },
  },
  { id: "cost", text: "How important is cost when choosing?", type: "single",
    options: [
      { id: "very", label: "Very important", desc: "I need to keep costs as low as possible" },
      { id: "factor", label: "It's a factor", desc: "I'll pay a fair price for good support, but I don't want to overpay" },
      { id: "notmain", label: "Not my main concern", desc: "I'll pay whatever it costs for the right fit" },
    ],
    scoring: { very: { edapt: 3, community: 4, gmb: 2, unison: 2, nasuwt: 2, neu: 1, naht: 0, ascl: 0 }, factor: { nasuwt: 3, edapt: 3, neu: 2, gmb: 2, unison: 2, community: 2, naht: 1, ascl: 1 }, notmain: { ascl: 3, naht: 3, neu: 2, nasuwt: 2, edapt: 2, gmb: 2, unison: 2, community: 2 } },
  },
];

const DETAILED_EXTRAS = [
  { id: "statements", text: "Which statement best describes you?", type: "single",
    options: [
      { id: "just_protect", label: "\"I just want protection in case something goes wrong\"", desc: "" },
      { id: "voice", label: "\"I want to be part of an organisation that gives staff a collective voice\"", desc: "" },
      { id: "leader_support", label: "\"I need specialist support for the unique challenges of leadership\"", desc: "" },
      { id: "best_value", label: "\"I want the best value for money — solid cover without the extras\"", desc: "" },
    ],
    scoring: { just_protect: { edapt: 5, community: 2, nasuwt: 2, neu: 1, gmb: 1, unison: 1, ascl: 1, naht: 1 }, voice: { neu: 5, nasuwt: 4, gmb: 3, unison: 3, community: 2, naht: 1, ascl: 1, edapt: 0 }, leader_support: { ascl: 5, naht: 5, edapt: 2, neu: 1, nasuwt: 1, community: 0, gmb: 0, unison: 0 }, best_value: { edapt: 3, community: 4, nasuwt: 3, gmb: 2, unison: 2, neu: 1, naht: 0, ascl: 0 } },
  },
  { id: "wellbeing", text: "How important are wellbeing and mental health support services?", type: "single",
    options: [
      { id: "very_well", label: "Very important", desc: "I'd like 24/7 access to mental health support as part of my membership" },
      { id: "nice_well", label: "Nice to have", desc: "It's a bonus but not what I'm mainly looking for" },
      { id: "not_well", label: "Not a factor", desc: "I have other support channels — this wouldn't influence my choice" },
    ],
    scoring: { very_well: { edapt: 4, neu: 2, nasuwt: 2, ascl: 2, naht: 2, gmb: 1, unison: 1, community: 1 }, nice_well: { edapt: 2, neu: 2, nasuwt: 2, ascl: 2, naht: 2, gmb: 1, unison: 1, community: 1 }, not_well: { neu: 2, nasuwt: 2, edapt: 2, ascl: 2, naht: 2, gmb: 2, unison: 2, community: 2 } },
  },
  { id: "size", text: "Does the size of the organisation matter to you?", type: "single",
    options: [
      { id: "big", label: "Bigger is better", desc: "I want the strength in numbers and influence that comes with a large membership" },
      { id: "small", label: "Smaller can be better", desc: "I'd prefer a more personalised, focused service even from a smaller organisation" },
      { id: "dont_mind", label: "Doesn't matter", desc: "The quality of support matters more than how many members they have" },
    ],
    scoring: { big: { neu: 4, unison: 3, gmb: 3, nasuwt: 3, community: 1, naht: 2, ascl: 2, edapt: 0 }, small: { edapt: 4, ascl: 3, naht: 3, community: 2, nasuwt: 1, gmb: 1, unison: 1, neu: 0 }, dont_mind: { neu: 2, nasuwt: 2, edapt: 2, ascl: 2, naht: 2, gmb: 2, unison: 2, community: 2 } },
  },
  { id: "rank_values", text: "Rank these from most to least important to you:", type: "rank",
    options: [
      { id: "legal_protection", label: "Legal protection and representation" },
      { id: "collective_bargaining", label: "Collective bargaining and industrial action" },
      { id: "cpd_career", label: "CPD and career development" },
      { id: "policy_influence", label: "Influencing education policy" },
    ],
    scoring: { legal_protection: { edapt: 4, nasuwt: 3, ascl: 3, naht: 3, neu: 2, gmb: 2, unison: 2, community: 2 }, collective_bargaining: { neu: 4, nasuwt: 4, gmb: 3, unison: 3, community: 2, naht: 1, ascl: 1, edapt: 0 }, cpd_career: { ascl: 4, naht: 4, edapt: 2, neu: 2, nasuwt: 1, gmb: 0, unison: 0, community: 0 }, policy_influence: { neu: 4, ascl: 3, naht: 3, nasuwt: 2, unison: 2, gmb: 1, edapt: 0, community: 0 } },
  },
];

const REFLECTION_QUESTIONS = [
  "Have you spoken to colleagues about their experiences with different unions or associations?",
  "Does your school already have active reps for any of these organisations? That can make a practical difference.",
  "Are you planning to stay in your current role type, or might you move into leadership (or out of it) soon?",
  "Have you checked whether your employer has any existing recognition agreements with particular unions?",
  "Would you benefit from talking to each organisation directly before committing? Most offer a free introductory conversation.",
];

// ─── Shared components ───────────────────────────────────────────────────────

const ProgressBar = ({ current, total }) => (
  <div style={{ width: "100%", height: 6, background: "#E8E4E0", borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
    <div style={{ width: `${(current / total) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4A7C6F, #6BA58F)", borderRadius: 3, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }} />
  </div>
);

const OptionCard = ({ option, selected, onSelect, index }) => {
  const sel = selected === option.id;
  return (
    <button onClick={() => onSelect(option.id)} style={{
      width: "100%", padding: "16px 20px", border: sel ? "2px solid #4A7C6F" : "2px solid #E8E4E0",
      borderRadius: 12, background: sel ? "#F0F7F4" : "#FAFAF8", cursor: "pointer", textAlign: "left",
      transition: "all 0.2s", opacity: 0, animation: `fadeSlideIn 0.35s ease ${index * 0.07}s forwards`,
      display: "flex", alignItems: "flex-start", gap: 14,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: sel ? "2px solid #4A7C6F" : "2px solid #C8C4C0", background: sel ? "#4A7C6F" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        {sel && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 15, color: "#2D2926", marginBottom: option.desc ? 4 : 0 }}>{option.label}</div>
        {option.desc && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B6560", lineHeight: 1.5 }}>{option.desc}</div>}
      </div>
    </button>
  );
};

const RankableItem = ({ item, index, total, onUp, onDown }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#FAFAF8", border: "2px solid #E8E4E0", borderRadius: 10, opacity: 0, animation: `fadeSlideIn 0.35s ease ${index * 0.07}s forwards` }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: index === 0 ? "#4A7C6F" : "#C8C4C0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{index + 1}</div>
    <div style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#2D2926", fontWeight: 500 }}>{item.label}</div>
    <div style={{ display: "flex", gap: 4 }}>
      <button onClick={onUp} disabled={index === 0} style={{ width: 30, height: 30, border: "1px solid #DDD", borderRadius: 6, background: index === 0 ? "#F5F5F5" : "#FFF", cursor: index === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: index === 0 ? 0.4 : 1 }}><svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2L2 7h8z" fill="#666"/></svg></button>
      <button onClick={onDown} disabled={index === total - 1} style={{ width: 30, height: 30, border: "1px solid #DDD", borderRadius: 6, background: index === total - 1 ? "#F5F5F5" : "#FFF", cursor: index === total - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: index === total - 1 ? 0.4 : 1 }}><svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 10L2 5h8z" fill="#666"/></svg></button>
    </div>
  </div>
);

const ResultCard = ({ org, score, maxScore, rank, isTop }) => {
  const d = ORGANISATIONS[org];
  const tier = getMatchTier(score, maxScore);
  const [open, setOpen] = useState(isTop);
  return (
    <div style={{ border: `2px solid ${isTop ? d.color : "#E8E4E0"}`, borderRadius: 14, overflow: "hidden", background: "#FFF", opacity: 0, animation: `fadeSlideIn 0.4s ease ${rank * 0.1}s forwards` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "14px 16px", background: isTop ? `${d.color}0D` : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <OrgLogo orgKey={org} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, color: "#2D2926", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {d.shortName}
            {isTop && <span style={{ fontSize: 11, fontWeight: 600, background: d.color, color: "#FFF", padding: "2px 8px", borderRadius: 20 }}>Best match</span>}
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#8B8580", marginTop: 2 }}>{d.type}</div>
        </div>
        <div style={{ padding: "5px 12px", borderRadius: 20, background: tier.bg, border: `1.5px solid ${tier.border}`, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, color: tier.dot, whiteSpace: "nowrap" }}>{tier.label}</div>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}><path d="M4 6l4 4 4-4" stroke="#999" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #F0EDEA" }}>
          <div style={{ paddingTop: 16 }}>
            <div style={{ width: "100%", height: 4, borderRadius: 2, marginBottom: 16, background: `linear-gradient(90deg, ${d.color}, ${d.accent || d.color}88)` }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#4A4540", lineHeight: 1.6, margin: "0 0 16px" }}>{d.description}</p>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#2D2926", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Why this could suit you</div>
              {d.strengths.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4A4540", lineHeight: 1.5 }}><span style={{ color: "#4A7C6F", flexShrink: 0 }}>✓</span><span>{s}</span></div>)}
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#2D2926", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Things to consider</div>
              {d.considerations.map((c, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B6560", lineHeight: 1.5 }}><span style={{ color: "#C8A050", flexShrink: 0 }}>•</span><span>{c}</span></div>)}
            </div>
            <div style={{ background: "#F8F6F4", borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#2D2926", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Indicative costs</div>
              {Object.entries(d.costs || {}).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}><span style={{ color: "#6B6560" }}>{k}</span><span style={{ fontWeight: 600, color: "#2D2926" }}>{v}</span></div>)}
            </div>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <a href={`https://www.${d.website}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: d.color, fontWeight: 600, textDecoration: "none" }}>Visit {d.website} →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function UnionFinder() {
  const [stage, setStage] = useState("welcome");
  const [mode, setMode] = useState(null);
  const [role, setRole] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [rankOrder, setRankOrder] = useState(null);
  const ref = useRef(null);

  const qs = mode === "detailed" ? [...QUICK_QUESTIONS, ...DETAILED_EXTRAS] : QUICK_QUESTIONS;
  const total = qs.length + 2;

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [stage, currentQ]);

  const setA = (qid, aid) => setAnswers(p => ({ ...p, [qid]: aid }));
  const setR = (qid, items) => setAnswers(p => ({ ...p, [qid]: items.map(i => i.id) }));
  const mv = (arr, f, t) => { const n = [...arr]; const [x] = n.splice(f, 1); n.splice(t, 0, x); return n; };

  const calc = () => {
    const sc = {}; Object.keys(ORGANISATIONS).forEach(k => sc[k] = 0);
    qs.forEach(q => {
      if (q.type === "rank") {
        const r = answers[q.id]; if (!r) return;
        r.forEach((id, i) => { const w = r.length - i; const s = q.scoring[id]; if (s) Object.entries(s).forEach(([o, v]) => sc[o] += v * w); });
      } else {
        const a = answers[q.id]; if (!a || !q.scoring[a]) return;
        Object.entries(q.scoring[a]).forEach(([o, v]) => sc[o] += v);
      }
    });
    const el = Object.entries(ORGANISATIONS).filter(([, d]) => d.eligibility.includes(role)).map(([k]) => k);
    const es = el.map(o => ({ org: o, score: sc[o] || 0 })).sort((a, b) => b.score - a.score);
    return { ranked: es, maxScore: es[0]?.score || 1 };
  };

  const next = () => { if (currentQ < qs.length - 1) setCurrentQ(currentQ + 1); else setStage("results"); };
  const back = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); else { setStage("role"); setRole(null); } };
  const restart = () => { setStage("welcome"); setMode(null); setRole(null); setAnswers({}); setCurrentQ(0); setRankOrder(null); };

  const cq = qs[currentQ];
  const ps = stage === "role" ? 1 : stage === "questions" ? currentQ + 2 : total;

  return (
    <div ref={ref} style={{ minHeight: "100vh", background: "linear-gradient(180deg, #F5F2EE 0%, #EDEAE6 100%)", fontFamily: "'DM Sans',sans-serif", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display&display=swap');
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: "#2D2926", marginBottom: 4, lineHeight: 1.2 }}>Union & Association Finder</div>
          <div style={{ fontSize: 13, color: "#8B8580" }}>For school staff in England</div>
        </div>

        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ background: "#FFF", borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 15, color: "#4A4540", lineHeight: 1.7, marginBottom: 16 }}>Not sure which union or professional association is right for you? This tool asks you a series of questions about what you value, then matches you with the best options for your role and priorities.</p>
              <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6, marginBottom: 20 }}>Choose how much time you'd like to spend:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => { setMode("quick"); setStage("role"); }} style={{ padding: "18px 20px", border: "2px solid #4A7C6F", borderRadius: 12, background: "#F0F7F4", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#2D2926", marginBottom: 4 }}>Quick Quiz</div>
                  <div style={{ fontSize: 13, color: "#6B6560" }}>5 questions · Under 2 minutes</div>
                </button>
                <button onClick={() => { setMode("detailed"); setStage("role"); }} style={{ padding: "18px 20px", border: "2px solid #E8E4E0", borderRadius: 12, background: "#FAFAF8", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#2D2926", marginBottom: 4 }}>Detailed Quiz</div>
                  <div style={{ fontSize: 13, color: "#6B6560" }}>9 questions · 3–5 minutes · More tailored results</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === "role" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <ProgressBar current={1} total={total} />
            <div style={{ background: "#FFF", borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#2D2926", marginBottom: 6 }}>{ROLE_QUESTION.text}</div>
              <div style={{ fontSize: 13, color: "#8B8580", marginBottom: 20, lineHeight: 1.5 }}>{ROLE_QUESTION.subtitle}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ROLE_QUESTION.options.map((o, i) => <OptionCard key={o.id} option={o} selected={role} onSelect={id => { setRole(id); setTimeout(() => { setStage("questions"); setCurrentQ(0); }, 350); }} index={i} />)}
              </div>
            </div>
            <div style={{ marginTop: 16, textAlign: "center" }}><button onClick={() => setStage("welcome")} style={{ background: "none", border: "none", color: "#8B8580", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>← Back</button></div>
          </div>
        )}

        {stage === "questions" && cq && (
          <div key={cq.id} style={{ animation: "fadeIn 0.35s ease" }}>
            <ProgressBar current={ps} total={total} />
            <div style={{ background: "#FFF", borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 12, color: "#8B8580", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Question {currentQ + 1} of {qs.length}</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#2D2926", marginBottom: 6, lineHeight: 1.3 }}>{cq.text}</div>
              {cq.subtitle && <div style={{ fontSize: 13, color: "#8B8580", marginBottom: 20, lineHeight: 1.5 }}>{cq.subtitle}</div>}
              {cq.type === "single" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{cq.options.map((o, i) => <OptionCard key={o.id} option={o} selected={answers[cq.id]} onSelect={id => { setA(cq.id, id); setTimeout(next, 400); }} index={i} />)}</div>}
              {cq.type === "rank" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 12, color: "#8B8580", marginBottom: 4 }}>Use the arrows to reorder. #1 = most important.</div>
                  {(rankOrder || cq.options).map((item, i) => <RankableItem key={item.id} item={item} index={i} total={cq.options.length}
                    onUp={() => { if (i > 0) { const o = mv(rankOrder || cq.options, i, i - 1); setRankOrder(o); setR(cq.id, o); } }}
                    onDown={() => { if (i < (rankOrder || cq.options).length - 1) { const o = mv(rankOrder || cq.options, i, i + 1); setRankOrder(o); setR(cq.id, o); } }}
                  />)}
                  <button onClick={() => { if (!answers[cq.id]) setR(cq.id, rankOrder || cq.options); next(); }} style={{ marginTop: 12, padding: "14px 28px", background: "#4A7C6F", color: "#FFF", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 15 }}>Continue →</button>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, textAlign: "center" }}><button onClick={back} style={{ background: "none", border: "none", color: "#8B8580", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>← Back</button></div>
          </div>
        )}

        {stage === "results" && (() => {
          const { ranked, maxScore } = calc();
          return (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: "#2D2926", marginBottom: 6 }}>Your Results</div>
                <div style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6 }}>Based on your answers, here's how each option fits your preferences. Tap any card to explore further.</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, justifyContent: "center" }}>
                {[{ l: "Strong match", d: "#4A7C6F" }, { l: "Good match", d: "#5B8DB8" }, { l: "Worth considering", d: "#C8A050" }, { l: "Less likely fit", d: "#A8A4A0" }].map(t => (
                  <div key={t.l} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: t.d }} /><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B6560" }}>{t.l}</span></div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ranked.map((item, i) => <ResultCard key={item.org} org={item.org} score={item.score} maxScore={maxScore} rank={i} isTop={i === 0} />)}
              </div>
              <div style={{ marginTop: 28, background: "#FFF", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "#2D2926", marginBottom: 12 }}>Before you decide...</div>
                <p style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.6, marginBottom: 14 }}>These results are a starting point, not a final answer. Here are some questions worth thinking about:</p>
                {REFLECTION_QUESTIONS.map((q, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#4A4540", lineHeight: 1.6 }}><span style={{ color: "#C8A050", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span><span>{q}</span></div>)}
              </div>
              <div style={{ textAlign: "center", marginTop: 24 }}><button onClick={restart} style={{ padding: "12px 28px", background: "#4A7C6F", color: "#FFF", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14 }}>Start again</button></div>
              <div style={{ marginTop: 28, textAlign: "center", fontSize: 11, color: "#A8A4A0", lineHeight: 1.5, padding: "0 12px" }}>This tool is for general guidance only. Costs and features may change — please verify details directly with each organisation before joining. Last updated April 2026.</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
