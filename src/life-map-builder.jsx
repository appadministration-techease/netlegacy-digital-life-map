import { useState, useMemo, useEffect, useRef } from "react";

const NAVY = "#1E2A5A";
const GREEN = "#7CB894";
const GREEN_DK = "#3A7856";
const GOLD = "#D9A93F";
const PAPER = "#FAF7F0";
const PANEL = "#EEF5F0";
const INK2 = "#4a5370";
const GROUND = "#F2F5F9";
const RULE = "#B9C4D9";
const FIELD = { border: "2px solid #6F7FA6", color: NAVY, background: "#fff" };
const FIELD_CLS = "mb-4 w-full rounded-2xl px-5 py-4 text-2xl focus:outline-none focus-visible:ring-4";

// Interview order, and how the steps group into the left rail
const PHASE_SEQ = ["welcome", "trusted", "devices", "emails", "carrier", "banks", "cards", "payments", "bills", "socials", "photos", "purchases", "medical", "government", "vault", "safes", "legacy", "map", "pwsheet", "finish", "packet"];
const STEPS = [
  { phase: "trusted", label: "Who it's for" }, { phase: "devices", label: "Devices" },
  { phase: "emails", label: "Email" }, { phase: "carrier", label: "Phone" },
  { phase: "banks", label: "Banking" }, { phase: "cards", label: "Cards" },
  { phase: "payments", label: "Payment apps" }, { phase: "bills", label: "Bills" },
  { phase: "socials", label: "Social media" }, { phase: "photos", label: "Photos & cloud" },
  { phase: "purchases", label: "Books & movies" }, { phase: "medical", label: "Medical portals" },
  { phase: "government", label: "Government" }, { phase: "vault", label: "Password manager" },
  { phase: "safes", label: "Safes & lockboxes" }, { phase: "legacy", label: "Legacy contacts" },
];
const GROUPS = [
  { id: "start", label: "Getting started", phases: ["trusted", "devices", "emails", "carrier"] },
  { id: "money", label: "Money", phases: ["banks", "cards", "payments", "bills"] },
  { id: "online", label: "Online life", phases: ["socials", "photos", "purchases"] },
  { id: "health", label: "Health & government", phases: ["medical", "government"] },
  { id: "safe", label: "Safekeeping", phases: ["vault", "safes", "legacy"] },
  { id: "map", label: "Your map", flat: true, phases: ["map", "pwsheet", "finish", "packet"] },
];

const GROUP_CATS = {
  start: ["D", "E", "P"], money: ["B", "C", "W", "U", "S", "T", "M"], online: ["N", "G", "K"],
  health: ["H", "A"], safe: ["V", "L", "LEG"],
};
const NAME_OPTIONS = {
  D: { q: "Which device are you adding?", opts: ["iPhone", "Android phone", "Computer or laptop", "iPad or tablet"], otherQ: "What device?", ph: "Kindle" },
  P: { q: "Who provides this phone service?", opts: ["Verizon", "AT&T", "T-Mobile", "US Cellular", "Consumer Cellular"], otherQ: "Who is your phone company?", ph: "Straight Talk" },
  W: { q: "Which one are you adding?", opts: ["Venmo", "PayPal", "Zelle", "Cash App", "Apple Cash", "Airline miles or hotel points", "Store or credit card rewards", "Cryptocurrency (Bitcoin, etc.)"], otherQ: "Which one?", ph: "Chime" },
  N: { q: "Which site or app are you adding?", opts: ["Facebook", "Instagram", "X (Twitter)", "TikTok", "Nextdoor", "LinkedIn"], otherQ: "Which one?", ph: "church group site" },
  G: { q: "Where do these photos or files live?", opts: ["iCloud", "Google Photos", "Amazon Photos", "OneDrive", "Dropbox", "Samsung Cloud", "An external hard drive", "A USB stick or SD card", "Facebook or Instagram"], otherQ: "Where?", ph: "Shutterfly" },
  K: { q: "Which one are you adding?", opts: ["Amazon or Kindle", "Apple or iTunes", "Google Play", "Audible", "Steam", "Nintendo, PlayStation, or Xbox"], otherQ: "Which one?", ph: "Barnes & Noble Nook" },
  H: { q: "Which one are you adding?", opts: ["Patient portal (MyChart, etc.)", "Pharmacy account", "Insurance member portal", "Medicare.gov account"], otherQ: "Which one?", ph: "my eye doctor's portal" },
  A: { q: "Which one are you adding?", opts: ["Social Security (ssa.gov)", "VA.gov", "IRS online account", "State DMV"], otherQ: "Which one?", ph: "my state unemployment account" },
  V: { q: "Where do these passwords live?", opts: ["1Password", "Bitwarden", "LastPass", "Saved in my browser", "A notebook or paper"], otherQ: "What's it called?", ph: "Keeper" },
  L: { q: "What kind of safe or lockbox?", opts: ["Fireproof box", "Gun safe", "Wall or floor safe", "Safe deposit box at the bank", "A locked drawer or cabinet"], otherQ: "What is it?", ph: "lockbox in the barn" },
};
const FIELD_LABEL = {
  name: "Name", signin: "How you sign in", pay: "What pays for it", shared: "Shared with", last4: "Last 4 digits",
  last4s: "Last 4 digits", types: "Accounts", moneyIn: "Money that arrives on its own", contact: "Branch or contact",
  bank: "Linked bank account", holds: "Anything of value sitting there", paid: "Paid plan", contents: "What's in there",
  wish: "If you weren't here", emergency: "Emergency access", opens: "How it opens", keyWhere: "Where the key is",
  inside: "What's inside", emailOpens: "Asks for a password",
};

const NL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
.nl-app { min-height: 100vh; }
.nl-body { display: flex; min-height: 100vh; }
.nl-rail { flex: none; width: 320px; box-sizing: border-box; position: sticky; top: 0; align-self: flex-start; height: 100vh; height: 100dvh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding: 28px 20px; background: #1E2A5A; color: #fff; }
.nl-railhead { display: flex; align-items: center; gap: 14px; padding: 0 4px; }
.nl-brand { display: flex; flex-direction: column; line-height: 1.1; flex: 1; }
.nl-brand span { font-size: 24px; font-weight: 700; }
.nl-brand sup { font-size: 11px; }
.nl-brand small { font-size: 16px; color: #C9D2EA; }
.nl-close { display: none; align-items: center; justify-content: center; width: 44px; height: 44px; color: #fff; background: transparent; border: 2px solid #fff; border-radius: 12px; cursor: pointer; }
.nl-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.nl-step { display: flex; align-items: center; gap: 14px; min-height: 44px; padding: 0 12px; border-radius: 12px; font-size: 19px; color: #AEB9DA; }
.nl-step[data-state="done"] { color: #C9D2EA; }
.nl-step[data-state="current"] { background: #fff; color: #1E2A5A; font-weight: 700; font-size: 20px; }
.nl-dot { flex: none; width: 24px; height: 24px; box-sizing: border-box; border-radius: 50%; border: 2px solid #7C89B8; display: flex; align-items: center; justify-content: center; color: #1E2A5A; }
.nl-dot svg { display: none; }
.nl-step[data-state="done"] .nl-dot { background: #7CB894; border-color: #7CB894; }
.nl-step[data-state="done"] .nl-dot svg { display: block; }
.nl-step[data-state="current"] .nl-dot { background: #D9A93F; border-color: #D9A93F; }
.nl-step[data-state="current"] .nl-dot::after { content: ""; width: 9px; height: 9px; border-radius: 50%; background: #1E2A5A; }
.nl-sub { list-style: none; margin: 4px 0 8px; padding: 0 0 0 26px; }
.nl-sub li { display: flex; align-items: center; gap: 12px; min-height: 34px; font-size: 17px; color: #AEB9DA; }
.nl-sub li::before { content: ""; flex: none; width: 12px; height: 12px; box-sizing: border-box; border-radius: 50%; border: 2px solid #7C89B8; }
.nl-sub li[data-state="done"] { color: #C9D2EA; }
.nl-sub li[data-state="done"]::before { background: #7CB894; border-color: #7CB894; }
.nl-sub li[data-state="current"] { color: #fff; font-weight: 700; }
.nl-sub li[data-state="current"]::before { background: #D9A93F; border-color: #D9A93F; }
.nl-railfoot { margin-top: auto; display: flex; flex-direction: column; gap: 14px; }
.nl-railmap { background: #2A3870; border-radius: 16px; padding: 12px 12px 8px; }
.nl-railmap p { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #C9D2EA; }
.nl-savebtn { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 10px; font-family: inherit; font-size: 17px; text-align: center; font-weight: 700; color: #fff; background: transparent; border: 2px solid #fff; border-radius: 12px; cursor: pointer; }
button.nl-step { width: 100%; border: 0; background: transparent; font-family: inherit; text-align: left; cursor: pointer; }
button.nl-step:hover:not([data-state="current"]) { background: rgba(255, 255, 255, .1); }
.nl-step[data-state="menu"] { color: #E3E9F7; }
.nl-sub button { display: flex; align-items: center; width: 100%; min-height: 34px; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; }
.nl-unsaved { margin: 0; font-size: 15px; font-weight: 700; color: #F3D78D; }
.nl-help { margin: 0; font-size: 15px; line-height: 1.4; color: #C9D2EA; }
.nl-help b { color: #fff; }
.nl-main { flex: 1; min-width: 0; box-sizing: border-box; padding: 48px 56px; }
.nl-wrap { max-width: 760px; margin: 0 auto; }
.nl-stepline { margin: 0 0 14px; font-size: 18px; color: #4a5370; }
.nl-sheet { background: #fff; border-radius: 24px; padding: 48px; }
.nl-back { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 4px; margin: -12px 0 8px -4px; font-family: inherit; font-size: 20px; font-weight: 700; color: #3A7856; background: none; border: 0; cursor: pointer; }
.nl-topbar { display: none; }
@media (max-height: 820px) { .nl-railmap { display: none; } }
@media (max-width: 899px) {
  .nl-topbar { display: block; position: sticky; top: 0; z-index: 30; background: #1E2A5A; color: #fff; }
  .nl-toprow { display: flex; align-items: center; justify-content: space-between; gap: 8px; height: 64px; padding: 0 12px 0 8px; }
  .nl-iconbtn { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; color: #fff; background: transparent; border: 2px solid #fff; border-radius: 12px; cursor: pointer; }
  .nl-ghosted { border-color: transparent; pointer-events: none; }
  .nl-toptitle { display: flex; flex-direction: column; align-items: center; line-height: 1.15; }
  .nl-toptitle span { font-size: 20px; font-weight: 700; }
  .nl-toptitle small { font-size: 15px; color: #C9D2EA; }
  .nl-prog { height: 6px; background: #2A3870; }
  .nl-prog i { display: block; height: 100%; background: #D9A93F; }
  .nl-rail { position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; width: min(88vw, 340px); height: auto; transform: translateX(-100%); visibility: hidden; transition: transform .2s ease-out, visibility .2s; }
  .nl-rail.open { transform: none; visibility: visible; }
  .nl-close { display: flex; }
  .nl-scrim { position: fixed; inset: 0; z-index: 40; background: rgba(10, 16, 40, .55); }
  .nl-main { padding: 16px; }
  .nl-sheet { border-radius: 20px; padding: 22px 20px; }
  .nl-stepline { display: none; }
  .nl-railmap { display: block; }
}
@media print {
  .no-print { display: none !important; }
  .nl-app, .nl-body { display: block !important; background: #fff !important; min-height: 0 !important; }
  .nl-main { padding: 0 !important; }
  .nl-wrap { max-width: none !important; }
  .nl-sheet { background: transparent !important; border-radius: 0 !important; padding: 0 !important; }
  .packet-page { page-break-after: always; border: none !important; border-radius: 0 !important; margin: 0 !important; }
}
`;

// =====================================================================
// Bill catalog — every bill knows which sheet it belongs on
// =====================================================================
const BILLS = [
  { name: "Electric", cat: "U", online: "maybe" },
  { name: "Water", cat: "U", online: "maybe" },
  { name: "Gas", cat: "U", online: "maybe" },
  { name: "Trash pickup", cat: "U", online: "maybe" },
  { name: "Internet", cat: "U", online: "maybe" },
  { name: "Cell phone bill", cat: "U", online: "maybe" },
  { name: "Home security", cat: "U", online: "maybe" },
  { name: "Lawn or pest service", cat: "U", online: "maybe" },
  { name: "Rent", cat: "U", online: "maybe" },
  { name: "Mortgage or house payment", cat: "U", online: "maybe" },
  { name: "Car payment or auto loan", cat: "U", online: "maybe" },
  { name: "HOA or condo fees", cat: "U", online: "maybe" },
  { name: "Car insurance", cat: "M", online: "maybe" },
  { name: "Home insurance", cat: "M", online: "maybe" },
  { name: "Health insurance", cat: "M", online: "maybe" },
  { name: "Life insurance", cat: "M", online: "maybe" },
  { name: "Netflix", cat: "T", online: "yes" },
  { name: "Hulu", cat: "T", online: "yes" },
  { name: "Prime Video", cat: "T", online: "yes" },
  { name: "Spotify", cat: "T", online: "yes" },
  { name: "YouTube TV", cat: "T", online: "yes" },
  { name: "Cable or satellite", cat: "T", online: "maybe" },
  { name: "Amazon Prime", cat: "S", online: "yes" },
  { name: "Newspaper", cat: "S", online: "maybe" },
  { name: "Magazines", cat: "S", online: "maybe" },
  { name: "AAA", cat: "S", online: "maybe" },
  { name: "Sam's or Costco", cat: "S", online: "maybe" },
  { name: "Gym or YMCA", cat: "S", online: "maybe" },
  { name: "Church giving", cat: "S", online: "maybe" },
  { name: "Charity or cause I give to monthly", cat: "S", online: "maybe" },
  { name: "Subscription box (wine, fruit, cheese, etc.)", cat: "S", online: "maybe" },
];

const CAT_TITLES = {
  D: "Devices", E: "Email", P: "Phone & Carrier", B: "Bank Accounts", C: "Cards",
  W: "Payment Apps", U: "Utilities & Home", S: "Subscriptions", T: "TV, Streaming & Music",
  M: "Insurance", H: "Medical & Health Portals", N: "Social Media", G: "Photos & Cloud",
  K: "Purchased Books, Movies & Games", A: "Government & Benefits",
  V: "Password Manager", L: "Safes & Lockboxes",
};
const CAT_ORDER = ["D", "E", "P", "B", "C", "W", "U", "S", "T", "M", "H", "A", "N", "G", "K", "V", "L"];

const LEGACY = ["Apple Legacy Contact", "Google Inactive Account Manager", "Facebook Legacy Contact"];

// =====================================================================
// Reusable screens
// =====================================================================
function Icon({ children, size = 24, sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
}
const IconCheck = (p) => <Icon {...p}><polyline points="5 12.5 10 17.5 19 7.5" /></Icon>;
const IconChevron = (p) => <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const IconSave = (p) => <Icon {...p}><path d="M12 4v10M7.5 10 12 14.5 16.5 10M5 19h14" /></Icon>;
const IconMenu = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
const IconBack = (p) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>;
const IconClose = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;

function LogoMark({ size = 42 }) {
  return (
    <svg width={size} height={Math.round(size * 1.08)} viewBox="0 0 120 130" aria-hidden="true">
      <g stroke="#7CB894" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M16 122V62A44 44 0 0 1 104 62V122" />
        <path d="M36 122V64A24 24 0 0 1 84 64V122" stroke="#A9D4BB" />
        <path d="M16 62 36 40 60 18 84 40 104 62" stroke="#A9D4BB" strokeWidth="3" />
        <path d="M36 40V64M84 40V64M60 18V34" stroke="#A9D4BB" strokeWidth="3" />
      </g>
      <g fill="#7CB894"><circle cx="16" cy="62" r="6" /><circle cx="104" cy="62" r="6" /><circle cx="60" cy="18" r="6.5" /><circle cx="36" cy="40" r="5" /><circle cx="84" cy="40" r="5" /></g>
      <circle cx="60" cy="84" r="9" fill="#fff" /><path d="M54 88h12l3 24H51z" fill="#fff" />
    </svg>
  );
}

function Notice({ children }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl p-4 text-lg font-bold" role="status"
      style={{ background: "#EAF3EE", color: GREEN_DK, border: `2px solid ${GREEN}` }}>
      <IconCheck size={22} sw={3} />{children}
    </div>
  );
}

function Tile({ title, sub, onClick }) {
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl px-5 text-left transition-transform focus:outline-none focus-visible:ring-4 active:scale-[0.99]"
      style={{ minHeight: 76, background: "#fff", border: `2px solid ${RULE}`, color: NAVY }}>
      <span className="flex-1">
        <span className="block font-bold" style={{ fontSize: "clamp(19px, 1.9vw, 23px)", lineHeight: 1.2 }}>{title}</span>
        <span className="block" style={{ fontSize: 17, color: INK2 }}>{sub}</span>
      </span>
      <span aria-hidden="true" style={{ color: "#6F7FA6" }}><IconChevron size={22} sw={2.6} /></span>
    </button>
  );
}

// Last four digits, one question per account type (or one for "main account")
function Last4Loop({ types, initial, onDone }) {
  const [idx, setIdx] = useState(0);
  const [map, setMap] = useState({ ...(initial || {}) });
  if (!types || types.length === 0) {
    return <TypeIn key="l4g" q="Last 4 digits of the main account?" hint="Just the last four — enough to identify it on a phone call, useless to a thief."
      placeholder="1234" skipLabel="Skip this" numeric maxLength={4} onSave={(v) => onDone({ last4: v || undefined })} />;
  }
  const t = types[idx];
  return <TypeIn key={"l4-" + t} q={`Last 4 digits of the ${t} account?`}
    hint={idx === 0 ? "Just the last four — enough to identify it on a phone call, useless to a thief." : null}
    placeholder="1234" skipLabel="Skip this" numeric maxLength={4} initial={map[t] || ""}
    onSave={(v) => {
      const m = { ...map };
      if (v) m[t] = v; else delete m[t];
      setMap(m);
      if (idx + 1 < types.length) setIdx(idx + 1); else onDone({ last4ByType: m });
    }} />;
}

function Ask({ q, hint, children }) {
  return (
    <div>
      <h2 className="mb-3 font-bold" style={{ color: NAVY, fontSize: "clamp(28px, 3.1vw, 40px)", lineHeight: 1.15 }}>{q}</h2>
      {hint && <p className="mb-7" style={{ color: INK2, fontSize: "clamp(18px, 1.7vw, 22px)", lineHeight: 1.4 }}>{hint}</p>}
      {children}
    </div>
  );
}

function Btn({ children, onClick, kind = "primary", disabled }) {
  const ghost = kind === "ghost";
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full rounded-2xl px-6 font-bold transition-transform focus:outline-none focus-visible:ring-4 active:scale-95 disabled:opacity-40"
      style={{ minHeight: 64, fontSize: "clamp(20px, 2vw, 25px)", background: ghost ? "#fff" : NAVY, color: ghost ? NAVY : "#fff", border: `2px solid ${NAVY}` }}>
      {children}
    </button>
  );
}

// One answer row. No "active" = a plain pick (tap to go on). With "multi" = checkbox.
// With a boolean "active" = a radio. With "add" = a "something else" row.
function Chip({ children, onClick, active, multi, add }) {
  const variant = add ? "add" : multi ? "check" : active === undefined ? "pick" : "radio";
  const on = !!active;
  const label = add && typeof children === "string" ? children.replace(/^\+\s*/, "") : children;
  const ctl = {
    flex: "none", width: 30, height: 30, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
    border: `3px solid ${on ? GREEN_DK : "#6F7FA6"}`, background: on ? GREEN_DK : "#fff", color: "#fff",
  };
  return (
    <button onClick={onClick} aria-pressed={variant === "check" || variant === "radio" ? on : undefined}
      className="flex w-full items-center gap-4 rounded-2xl px-5 text-left font-bold transition-transform focus:outline-none focus-visible:ring-4 active:scale-[0.99]"
      style={{ minHeight: 68, fontSize: "clamp(19px, 1.9vw, 24px)", lineHeight: 1.2, color: NAVY, background: on ? "#EAF3EE" : "#fff", border: on ? `3px solid ${GREEN_DK}` : `2px solid ${RULE}` }}>
      {variant === "check" && <span aria-hidden="true" style={{ ...ctl, borderRadius: 8 }}>{on && <IconCheck size={18} sw={3.2} />}</span>}
      {variant === "radio" && <span aria-hidden="true" style={{ ...ctl, borderRadius: "50%" }}>{on && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />}</span>}
      <span className="flex-1">{label}</span>
      {variant === "pick" && <span aria-hidden="true" style={{ color: "#6F7FA6" }}><IconChevron size={22} sw={2.6} /></span>}
      {variant === "add" && <span aria-hidden="true" style={{ color: GREEN_DK }}><IconPlus size={22} sw={2.6} /></span>}
    </button>
  );
}

// Pick one from a list, with optional "Something else" type-in
function PickOne({ q, hint, options, otherLabel, otherQ, otherPlaceholder, onPick, skip }) {
  const [typing, setTyping] = useState(false);
  const [v, setV] = useState("");
  if (typing) {
    return (
      <Ask q={otherQ || "What is it?"}>
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={otherPlaceholder}
          onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) onPick(v.trim()); }}
          className={FIELD_CLS} style={FIELD} />
        <Btn kind="go" disabled={!v.trim()} onClick={() => onPick(v.trim())}>Next</Btn>
      </Ask>
    );
  }
  return (
    <Ask q={q} hint={hint}>
      <div className="grid gap-3">
        {options.map((o) => (
          <Chip key={o.label} onClick={() => onPick(o.value !== undefined ? o.value : o.label)}>{o.label}</Chip>
        ))}
        {otherLabel && <Chip add onClick={() => setTyping(true)}>{otherLabel}</Chip>}
        {skip && <Chip onClick={() => onPick(null)}>{skip}</Chip>}
      </div>
    </Ask>
  );
}

// Pick many from a list, with a running "add your own" list
function PickMany({ q, hint, options, onNext, otherLabel, otherQ, otherPlaceholder, nextLabel, emptyLabel, initial }) {
  const [sel, setSel] = useState(initial || []);
  const [extras, setExtras] = useState((initial || []).filter((x) => !options.includes(x)));
  const [typing, setTyping] = useState(false);
  const [v, setV] = useState("");
  const toggle = (o) => setSel((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  const addIt = () => { setExtras((p) => [...p, v.trim()]); setSel((p) => [...p, v.trim()]); setV(""); setTyping(false); };
  if (typing) {
    return (
      <Ask q={otherQ || "What else?"}>
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={otherPlaceholder}
          onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) addIt(); }}
          className={FIELD_CLS} style={FIELD} />
        <div className="grid gap-3">
          <Btn kind="go" disabled={!v.trim()} onClick={addIt}>Add it</Btn>
          <Btn kind="ghost" onClick={() => { setV(""); setTyping(false); }}>Never mind</Btn>
        </div>
      </Ask>
    );
  }
  return (
    <Ask q={q} hint={hint}>
      <div className="mb-5 grid gap-3">
        {[...options, ...extras].map((o) => (
          <Chip key={o} multi active={sel.includes(o)} onClick={() => toggle(o)}>{o}</Chip>
        ))}
        {otherLabel && <Chip add onClick={() => setTyping(true)}>{otherLabel}</Chip>}
      </div>
      <Btn kind="go" onClick={() => onNext(sel)}>{sel.length ? (nextLabel || "Next") : (emptyLabel || "None of these — next")}</Btn>
    </Ask>
  );
}

function TypeIn({ q, hint, placeholder, onSave, skipLabel, initial, numeric, maxLength }) {
  const [v, setV] = useState(initial || "");
  const handleChange = (e) => {
    let val = e.target.value;
    if (numeric) val = val.replace(/\D/g, "");
    if (maxLength) val = val.slice(0, maxLength);
    setV(val);
  };
  return (
    <Ask q={q} hint={hint}>
      <input value={v} onChange={handleChange} placeholder={placeholder}
        inputMode={numeric ? "numeric" : undefined} pattern={numeric ? "[0-9]*" : undefined}
        maxLength={maxLength || undefined}
        onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) onSave(v.trim()); }}
        className={FIELD_CLS} style={FIELD} />
      <div className="grid gap-3">
        <Btn kind="go" disabled={!v.trim()} onClick={() => onSave(v.trim())}>Next</Btn>
        {skipLabel && <Btn kind="ghost" onClick={() => onSave(null)}>{skipLabel}</Btn>}
      </div>
    </Ask>
  );
}

// Sign-in sub-flow: identity -> (username) -> password vs passkey
function SignIn({ label, emails, deviceName, onDone }) {
  const [phase, setPhase] = useState("identity");
  const [signin, setSignin] = useState(null);
  const [username, setUsername] = useState(null);

  if (phase === "identity") {
    return (
      <PickOne q={`How do you sign in to ${label}?`}
        hint="Just how you get in the door — never the password itself."
        options={[
          ...emails.map((e) => ({ label: `With my email — ${e.name}`, value: e.code })),
          { label: "With a username", value: "__u" },
        ]}
        skip="I don't have an online account"
        onPick={(v) => {
          if (v === null) { onDone({ signin: null, method: null }); return; }
          if (v === "__u") { setPhase("username"); return; }
          setSignin(v); setPhase("method");
        }} />
    );
  }
  if (phase === "username") {
    return (
      <TypeIn q={`What's your username at ${label}?`}
        hint="Usernames are safe to write down — useless without the password, and that stays on your locked-away paper list."
        placeholder="rsmith1948" skipLabel="I don't remember — skip"
        onSave={(v) => { setSignin("username"); setUsername(v); setPhase("method"); }} />
    );
  }
  return (
    <PickOne q={`When you open ${label}, does it ask for a password?`}
      hint="Some accounts let you straight in without typing anything — that's a passkey, and it lives on your device."
      options={[
        { label: "Yes, I type a password", value: "password" },
        { label: `No — it just lets me in${deviceName ? ` on ${deviceName}` : ""}`, value: "passkey" },
        { label: "Sometimes one, sometimes the other", value: "both" },
        { label: "I'm not sure", value: "password" },
      ]}
      onPick={(m) => onDone({ signin, username, method: m, deviceCode: m === "passkey" || m === "both" ? "D1" : null })} />
  );
}

function ShowHideBtn({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="text-base font-bold underline focus:outline-none" style={{ color: GREEN_DK }}>
      {show ? "Hide" : "Show"}
    </button>
  );
}

function SaveOverlay({
  savePass, setSavePass, savePass2, setSavePass2, saveBusy, saveDone, showPass, setShowPass,
  onSave, onCancel, onDone,
}) {
  const ready = savePass.trim().length >= 4 && savePass === savePass2;
  return (
    <Ask q="Save your progress"
      hint="This makes a file you can download now and load back in later to pick up right where you left off.">
      {!saveDone ? (
        <>
          <div className="mb-5 rounded-2xl p-4 text-lg leading-relaxed" style={{ background: PANEL, color: NAVY, border: `2px solid ${GREEN}` }}>
            One exception: to protect this file, make up a short phrase — not one you already use. We don't keep a copy, so write it down. Lose it, and nobody — including us — can open this file again.
          </div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-lg font-bold" style={{ color: NAVY }}>Make up a phrase</label>
            <ShowHideBtn show={showPass} onToggle={() => setShowPass((s) => !s)} />
          </div>
          <input type={showPass ? "text" : "password"} value={savePass} onChange={(e) => setSavePass(e.target.value)}
            placeholder="three or four words" autoComplete="new-password"
            className="mb-4 w-full rounded-2xl px-5 py-4 text-xl focus:outline-none focus-visible:ring-4"
            style={FIELD} />
          <label className="mb-2 block text-lg font-bold" style={{ color: NAVY }}>Type it again</label>
          <input type={showPass ? "text" : "password"} value={savePass2} onChange={(e) => setSavePass2(e.target.value)}
            placeholder="same phrase again" autoComplete="new-password"
            className="mb-2 w-full rounded-2xl px-5 py-4 text-xl focus:outline-none focus-visible:ring-4"
            style={FIELD} />
          {savePass && savePass2 && savePass !== savePass2 && (
            <p className="mb-4 text-lg font-bold" style={{ color: "#b3492f" }}>Those don't match yet.</p>
          )}
          {savePass && savePass.trim().length < 4 && (
            <p className="mb-4 text-lg font-bold" style={{ color: "#b3492f" }}>A little longer — four or more characters.</p>
          )}
          <div className="grid gap-3">
            <Btn kind="go" disabled={!ready || saveBusy} onClick={onSave}>{saveBusy ? "Saving…" : "Save & download"}</Btn>
            <Btn kind="ghost" onClick={onCancel}>Cancel</Btn>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5 rounded-2xl p-4 text-lg font-bold leading-snug" style={{ background: PANEL, color: GREEN_DK, border: `2px solid ${GREEN}` }}>
            ✓ Saved. The file downloaded to your device — keep it somewhere you'll find again, and write your phrase on your Password List.
          </div>
          <Btn kind="go" onClick={onDone}>Keep going</Btn>
        </>
      )}
    </Ask>
  );
}

function ResumeOverlay({ loadPass, setLoadPass, loadError, loadBusy, showPass, setShowPass, onResume, onCancel }) {
  return (
    <Ask q="Enter your phrase" hint="The one you made up when you saved this file.">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-lg font-bold" style={{ color: NAVY }}>Your phrase</label>
        <ShowHideBtn show={showPass} onToggle={() => setShowPass((s) => !s)} />
      </div>
      <input type={showPass ? "text" : "password"} value={loadPass} onChange={(e) => setLoadPass(e.target.value)}
        placeholder="your phrase" autoComplete="current-password"
        onKeyDown={(e) => { if (e.key === "Enter" && loadPass.trim()) onResume(); }}
        className="mb-4 w-full rounded-2xl px-5 py-5 text-2xl focus:outline-none focus-visible:ring-4"
        style={FIELD} />
      {loadError && <p className="mb-4 text-lg font-bold" style={{ color: "#b3492f" }}>{loadError}</p>}
      <div className="grid gap-3">
        <Btn kind="go" disabled={!loadPass.trim() || loadBusy} onClick={onResume}>{loadBusy ? "Opening…" : "Open my map"}</Btn>
        <Btn kind="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </Ask>
  );
}

// =====================================================================
// Save-file encryption — AES-GCM via the browser's built-in Web Crypto
// API. Nothing here calls out to a server; it all runs on-device, same
// as the rest of the app. A wrong passphrase fails to decrypt (AES-GCM
// is authenticated) rather than silently producing garbage, so we can
// tell the person plainly that it didn't work.
// =====================================================================
function bufToB64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}
function b64ToBuf(b64) {
  const binary = window.atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
async function deriveKey(passphrase, saltBytes) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function encryptState(stateObj, passphrase) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(stateObj));
  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    app: "NetLegacy Digital Life Map", v: 1,
    salt: bufToB64(salt), iv: bufToB64(iv), data: bufToB64(ciphertext),
  };
}
async function decryptState(fileObj, passphrase) {
  const salt = b64ToBuf(fileObj.salt);
  const iv = b64ToBuf(fileObj.iv);
  const key = await deriveKey(passphrase, salt);
  const data = b64ToBuf(fileObj.data);
  const plainBuf = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, data);
  return JSON.parse(new TextDecoder().decode(plainBuf));
}
function downloadFile(payload, filename) {
  const blob = new Blob([JSON.stringify(payload)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// =====================================================================
// Main app
// =====================================================================
export default function LifeMapBuilder() {
  const [phase, setPhase] = useState("welcome");
  const [trusted, setTrusted] = useState("");

  const [devices, setDevices] = useState([]);
  const [emails, setEmails] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [cards, setCards] = useState([]);
  const [payments, setPayments] = useState([]); // Venmo, PayPal, Zelle, Cash App, points, crypto, etc.
  const [bills, setBills] = useState([]);      // {code, name, cat, payCode, payNote, signin, username, method}
  const [socials, setSocials] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [purchases, setPurchases] = useState([]); // Kindle, iTunes, Steam, etc. — purchased books/movies/games
  const [medical, setMedical] = useState([]);  // patient portals, pharmacy, insurance member sites
  const [government, setGovernment] = useState([]); // Social Security, VA, IRS, DMV
  const [vaults, setVaults] = useState([]);
  const [safes, setSafes] = useState([]);
  const [legacy, setLegacy] = useState([]);
  const [pwLocation, setPwLocation] = useState(null);
  const [packetBackup, setPacketBackup] = useState(null);
  const [erased, setErased] = useState(false);

  // ---- save / resume (encrypted file) ----
  const [saveOpen, setSaveOpen] = useState(false);
  const [savePass, setSavePass] = useState("");
  const [savePass2, setSavePass2] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const [loadFileText, setLoadFileText] = useState(null);
  const [loadPass, setLoadPass] = useState("");
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstRunDone, setFirstRunDone] = useState(false);
  const [retired, setRetired] = useState([]);       // codes that were used and removed — never reused
  const [paperTodo, setPaperTodo] = useState([]);   // things to do by hand on the printed pages
  const [dirty, setDirty] = useState(false);        // changes not yet saved to a file
  const [hubView, setHubView] = useState({ screen: "home" });
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
  const fileInputRef = useRef(null);

  // sub-step cursors
  const [sub, setSub] = useState(0);
  const [draft, setDraft] = useState(null);
  const [queue, setQueue] = useState([]);
  const [billIdx, setBillIdx] = useState(0);
  const [billStage, setBillStage] = useState("pay");
  const [history, setHistory] = useState([]); // snapshots for Back

  const all = useMemo(() => [
    ...devices, ...emails, ...carriers, ...banks, ...cards, ...payments, ...bills, ...socials, ...photos,
    ...purchases, ...medical, ...government, ...vaults, ...safes,
  ], [devices, emails, carriers, banks, cards, payments, bills, socials, photos, purchases, medical, government, vaults, safes]);

  const byCat = (c) => all.filter((x) => x.cat === c);
  const device1 = devices[0];
  const email1 = emails[0];

  const edges = useMemo(() => {
    const out = [];
    if (device1 && email1) out.push({ from: device1.code, to: email1.code, type: "signin" });
    all.forEach((x) => {
      if (x.method === "passkey" && x.deviceCode) out.push({ from: x.code, to: x.deviceCode, type: "signin" });
      else if (x.signin && x.signin !== "username") out.push({ from: x.code, to: x.signin, type: "signin" });
      if (x.payCode) out.push({ from: x.code, to: x.payCode, type: "pay" });
      if (x.bankCode) out.push({ from: x.code, to: x.bankCode, type: "pay" });
    });
    carriers.forEach((c) => device1 && out.push({ from: c.code, to: device1.code, type: "signin" }));
    return out;
  }, [all, device1, email1, carriers]);

  const hubEdges = email1 ? edges.filter((e) => e.from === email1.code || e.to === email1.code).length : 0;

  const pwRows = useMemo(() => {
    const rows = [];
    devices.forEach((d) => rows.push({ code: d.code, label: `Unlock PIN — ${d.name}` }));
    emails.forEach((e) => e.method !== "passkey" && rows.push({ code: e.code, label: `Email — ${e.name}` }));
    [...carriers, ...banks, ...cards, ...payments, ...bills, ...socials, ...photos, ...purchases, ...medical, ...government].forEach((x) =>
      x.signin && x.method !== "passkey" && rows.push({ code: x.code, label: x.name })
    );
    vaults.forEach((v) => rows.push({ code: v.code, label: `Master Key — ${v.name}` }));
    safes.forEach((s) => s.opens !== "key" && rows.push({ code: s.code, label: `Combination — ${s.name}` }));
    return rows;
  }, [devices, emails, carriers, banks, cards, payments, bills, socials, photos, purchases, medical, government, vaults, safes]);

  // things paid by a given account code
  const paidBy = (code) => bills.filter((b) => b.payCode === code);

  function reset() {
    setTrusted(""); setDevices([]); setEmails([]); setCarriers([]); setBanks([]); setCards([]);
    setPayments([]); setBills([]); setSocials([]); setPhotos([]); setPurchases([]); setMedical([]);
    setGovernment([]); setVaults([]); setSafes([]);
    setFirstRunDone(false); setRetired([]); setPaperTodo([]); setDirty(false); setHubView({ screen: "home" });
    setLegacy([]); setPwLocation(null); setPacketBackup(null); setSub(0); setDraft(null); setQueue([]);
    setBillIdx(0); setBillStage("pay"); setErased(true); setHistory([]); setPhase("welcome");
  }

  // ---- Back button ----
  // Each render, record a snapshot of the state that PRODUCED the current
  // screen. When the screen signature changes (a real forward move), the
  // previous snapshot is pushed onto history. Back restores the last one.
  const snap = {
    phase, sub, draft, queue, billIdx, billStage,
    trusted, devices, emails, carriers, banks, cards, payments, bills, socials, photos,
    purchases, medical, government, vaults, safes,
    legacy, pwLocation, packetBackup, firstRunDone, retired, paperTodo,
  };
  const sig = `${phase}|${sub}|${billIdx}|${billStage}|${draft ? draft.name || "d" : "-"}|${all.length}`;
  const prev = useRef(null);
  const restoring = useRef(false);
  useEffect(() => {
    if (restoring.current) { restoring.current = false; prev.current = { sig, snap }; return; }
    if (prev.current && prev.current.sig !== sig) {
      setHistory((h) => [...h, prev.current.snap]);
    }
    prev.current = { sig, snap };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  function goBack() {
    // Mid-entry (still filling out this record): just step back one question
    // and keep whatever's already been typed/picked so a typo can be fixed
    // without retyping from scratch.
    if (draft !== null && sub > 0) {
      restoring.current = true;
      setSub((s) => s - 1);
      return;
    }
    setHistory((h) => {
      if (h.length === 0) return h;
      const s = h[h.length - 1];
      restoring.current = true;
      setPhase(s.phase); setSub(s.sub); setDraft(s.draft); setQueue(s.queue);
      setBillIdx(s.billIdx); setBillStage(s.billStage);
      setTrusted(s.trusted); setDevices(s.devices); setEmails(s.emails); setCarriers(s.carriers);
      setBanks(s.banks); setCards(s.cards); setPayments(s.payments); setBills(s.bills); setSocials(s.socials);
      setPhotos(s.photos); setPurchases(s.purchases); setMedical(s.medical); setGovernment(s.government);
      setVaults(s.vaults); setSafes(s.safes);
      setLegacy(s.legacy); setPwLocation(s.pwLocation); setPacketBackup(s.packetBackup);
      return h.slice(0, -1);
    });
  }
  const canGoBack = history.length > 0 && !["welcome", "map", "pwsheet", "packet", "finish", "hub"].includes(phase);

  // ---- Save & Resume (encrypted file) ----
  function applyFullState(s) {
    restoring.current = true;
    setPhase(s.phase); setSub(s.sub); setDraft(s.draft); setQueue(s.queue || []);
    setBillIdx(s.billIdx || 0); setBillStage(s.billStage || "pay");
    setTrusted(s.trusted || ""); setDevices(s.devices || []); setEmails(s.emails || []);
    setCarriers(s.carriers || []); setBanks(s.banks || []); setCards(s.cards || []);
    setPayments(s.payments || []); setBills(s.bills || []); setSocials(s.socials || []);
    setPhotos(s.photos || []); setPurchases(s.purchases || []); setMedical(s.medical || []);
    setGovernment(s.government || []); setVaults(s.vaults || []); setSafes(s.safes || []);
    setLegacy(s.legacy || []); setPwLocation(s.pwLocation || null); setPacketBackup(s.packetBackup || null);
    setHistory(s.history || []);
    const done = !!s.firstRunDone || s.phase === "finish" || s.phase === "packet";
    setFirstRunDone(done); setRetired(s.retired || []); setPaperTodo(s.paperTodo || []);
    setDirty(false); setHubView({ screen: "home" });
    if (done) { setPhase("hub"); setSub(0); setDraft(null); }
  }

  async function doSave() {
    setSaveBusy(true);
    try {
      const payload = await encryptState({ ...snap, history }, savePass);
      const stamp = new Date().toISOString().slice(0, 10);
      const namePart = trusted ? trusted.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "map";
      downloadFile(payload, `netlegacy-${namePart || "map"}-${stamp}.netlegacy`);
      setSaveDone(true);
      setDirty(false);
    } catch (e) {
      alert("This browser couldn't create the file. Try a different browser, like Chrome or Safari.");
    } finally {
      setSaveBusy(false);
    }
  }

  function onPickFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // so picking the same file again later still fires onChange
    if (!file) return;
    setLoadError(null);
    readFileAsText(file)
      .then((text) => setLoadFileText(text))
      .catch(() => setLoadError("Couldn't read that file. Try picking it again."));
  }

  async function doResume() {
    setLoadBusy(true); setLoadError(null);
    try {
      const fileObj = JSON.parse(loadFileText);
      const state = await decryptState(fileObj, loadPass);
      applyFullState(state);
      setLoadFileText(null); setLoadPass("");
    } catch (e) {
      setLoadError("That phrase didn't open the file. Check it and try again.");
    } finally {
      setLoadBusy(false);
    }
  }

  const payOptions = () => [
    ...cards.map((c) => ({ label: `My card — ${c.name}`, value: { payCode: c.code } })),
    ...banks.map((b) => ({ label: `${b.name}`, value: { payCode: b.code } })),
    { label: "Straight out of Social Security", value: { payNote: "Social Security" } },
    { label: "Check or cash", value: { payNote: "Check or cash" } },
    { label: "I'm not sure", value: {} },
  ];

  // ---------------- map ----------------
  const ANGLES = { D: -70, G: -30, K: -10, T: 8, S: 40, U: 70, M: 100, H: 115, A: 122, N: 130, C: 160, W: 175, B: 190, P: -110, V: -145, L: 215 };
  function MapView({ compact, dark }) {
    const W = compact ? 300 : 420, H = compact ? 264 : 400;
    const cx = W / 2, cy = H / 2, r = compact ? 100 : 140;
    const nodeR = compact ? (all.length > 12 ? 13 : 15) : 17, hubR = compact ? 21 : 24;
    const showLabels = !compact || all.length <= 6;
    const ink = dark ? "#FFFFFF" : NAVY;
    const sub = dark ? "#C9D2EA" : INK2;
    const lift = (c) => (dark ? (c === NAVY ? "#C9D2EA" : c === GREEN_DK ? GREEN : c) : c);
    const pos = {};
    const gap = compact ? 44 : 62;
    emails.forEach((e, i) => (pos[e.code] = { x: cx + i * gap - (emails.length - 1) * (gap / 2), y: cy }));
    CAT_ORDER.filter((c) => c !== "E").forEach((c) => {
      byCat(c).forEach((ent, i) => {
        const a = ((ANGLES[c] + i * (compact ? 17 : 13)) * Math.PI) / 180;
        pos[ent.code] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
      });
    });
    const col = { D: NAVY, E: GREEN_DK, P: NAVY, B: NAVY, C: GOLD, W: GOLD, U: GOLD, S: GOLD, T: GOLD, N: GREEN_DK, G: NAVY, K: NAVY, M: NAVY, H: NAVY, A: NAVY, V: GOLD, L: NAVY };
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Map of your accounts and how they connect">
        {edges.map((e, i) => {
          const a = pos[e.from], b = pos[e.to];
          if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={e.type === "pay" ? GOLD : dark ? GREEN : GREEN_DK} strokeWidth={compact ? 2.4 : 2.6}
            strokeDasharray={e.type === "pay" ? "7 6" : "0"} strokeLinecap="round" />;
        })}
        {all.map((n) => {
          const p = pos[n.code];
          if (!p) return null;
          const hub = email1 && n.code === email1.code;
          const rad = hub ? hubR : nodeR;
          return (
            <g key={n.code}>
              <circle cx={p.x} cy={p.y} r={rad} fill={dark ? "#1E2A5A" : "#fff"} stroke={lift(col[n.cat] || NAVY)} strokeWidth={hub ? 5 : 3.2} />
              <text x={p.x} y={p.y + (compact ? 5 : 5)} textAnchor="middle" fontSize={compact ? 13.5 : 12.5} fontWeight="800" fill={ink}>{n.code}</text>
              {showLabels && (
                <text x={p.x} y={p.y + (p.y < cy ? -(rad + 7) : rad + 14)} textAnchor="middle" fontSize={compact ? 12 : 10.5} fontWeight="700" fill={sub}>
                  {n.name.length > 13 ? n.name.slice(0, 12) + "…" : n.name}
                </text>
              )}
            </g>
          );
        })}
        {all.length === 0 && <text x={cx} y={cy} textAnchor="middle" fontSize={compact ? 14 : 16} fill={dark ? "#AEB9DA" : "#8a90a8"}>Your map will appear here</text>}
      </svg>
    );
  }

  // ---------------- packet ----------------
  const nameOf = (code) => all.find((x) => x.code === code)?.name || code;
  function signinLine(x) {
    if (x.method === "passkey") return `Sign-in: no password — unlock ${device1?.name || "your device"} (PIN on Password List row ${x.deviceCode || "D1"})`;
    if (x.signin === "username") return `Sign-in: username ${x.username || "____________"} — password on Password List row ${x.code}`;
    if (x.signin) return `Sign-in: email ${x.signin} (${nameOf(x.signin)}) — password on Password List row ${x.code}`;
    return "No online account";
  }
  const payLine = (x) => x.payCode ? `Paid by: ${x.payCode} (${nameOf(x.payCode)})` : x.payNote ? `Paid by: ${x.payNote}` : "Paid by: not recorded";

  const NOTES = {
    D: "unlock PINs are on the Password List by D code. Don't erase or trade in any device until every account is handled — passkeys live here.",
    E: "do NOT close any email until everything that signs in with it is handled. Email closes last.",
    P: "keep the line active until every account that texts codes is handled. Ask about transferring the number.",
    B: "call the bank before closing anything. Note what auto-pays from each account first.",
    C: "move important auto-payments to another method BEFORE cancelling any card.",
    W: "check for a sitting balance before closing the account — Venmo, PayPal, and Cash App often hold money; Zelle usually doesn't.",
    U: "these keep the house running — do NOT cancel while anyone still lives there. Transfer them into their name instead.",
    S: "check renewal dates first; some memberships owe a partial refund. Stop physical deliveries so they don't pile up.",
    T: "the simplest sheet — almost everything here just gets cancelled. Warn anyone sharing a profile first.",
    M: "time-sensitive. Life insurance claims start with the agent; keep premiums paid for anyone else on the policy.",
    H: "useful mainly while someone is living but can't manage things themselves — coordinate care, refill prescriptions, check on appointments.",
    A: "same idea as medical — mostly useful for helping manage things while someone's still here, not an urgent task afterward.",
    N: "save photos worth keeping BEFORE deleting — deletion is permanent. Memorialize where the wish says so.",
    G: "download everything before closing anything. If a paid plan lapses, files can be deleted.",
    K: "download or deauthorize devices before closing — some purchases stop playing if the account closes first.",
    V: "the Master Key is on the Password List. It cannot be reset if lost — that's why it's written down.",
    L: "one of these likely holds the Password List. Safe deposit boxes may be sealed at death — ask the bank.",
  };
  const STRIPS = {
    D: "MY DEVICES — DON'T ERASE THEM", E: "MY EMAIL — EMAIL CLOSES LAST",
    P: "MY PHONE SERVICE — KEEP THE NUMBER ALIVE", B: "MY BANKING — CALL BEFORE YOU CLICK",
    C: "MY CARDS — MOVE AUTOPAYS BEFORE CANCELLING", W: "MONEY APPS — CHECK FOR A BALANCE FIRST",
    U: "UTILITIES — KEEP THE LIGHTS ON",
    S: "SUBSCRIPTIONS — CHECK RENEWAL DATES", T: "TV & MUSIC — THESE BILL UNTIL CANCELLED",
    M: "INSURANCE — TIME-SENSITIVE", H: "MEDICAL & HEALTH — FOR ONGOING CARE",
    A: "GOVERNMENT & BENEFITS — FOR ONGOING CARE",
    N: "SOCIAL MEDIA — MEMORIES LIVE HERE",
    G: "PHOTOS & CLOUD — DOWNLOAD FIRST", K: "PURCHASES — DOWNLOAD BEFORE CLOSING",
    V: "PASSWORD MANAGER — ONE KEY OPENS EVERYTHING",
    L: "SAFES & LOCKBOXES — FIND THESE EARLY",
  };

  function linesFor(x) {
    const out = [];
    switch (x.cat) {
      case "D":
        out.push(`Unlock PIN: Password List row ${x.code}`);
        out.push(`Passkeys on it: ${all.filter((y) => y.method === "passkey").map((y) => y.code).join(", ") || "none recorded"}`);
        break;
      case "E":
        out.push(x.method === "passkey" ? "Opens without a password — unlock the device" : `Password on Password List row ${x.code}`);
        out.push(`Used to sign in to: ${all.filter((y) => y.signin === x.code).map((y) => y.code).join(", ") || "—"}`);
        if (x.recovery) out.push(`Backup contact: ${x.recovery}`);
        break;
      case "P":
        if (x.account) out.push(`Account #: ${x.account}`);
        out.push(signinLine(x));
        out.push(payLine(x));
        if (device1) out.push(`My number rings on ${device1.code}`);
        break;
      case "B":
        if (x.types?.length) out.push(`Accounts: ${x.types.join(", ")}`);
        if (x.last4ByType && Object.keys(x.last4ByType).length) {
          Object.entries(x.last4ByType).forEach(([t, n]) => out.push(`${t} ends in ${n}`));
        } else if (x.last4) {
          out.push(`Main account ends in ${x.last4}`);
        }
        out.push(signinLine(x));
        if (x.moneyIn?.length) out.push(`Money IN automatically: ${x.moneyIn.join(", ")}`);
        out.push(`Pays automatically for: ${paidBy(x.code).map((b) => `${b.code} (${b.name})`).join(", ") || "—"}`);
        if (x.contact) out.push(`Contact: ${x.contact}`);
        break;
      case "C":
        if (x.last4) out.push(`Ends in ${x.last4}`);
        if (x.bankCode) out.push(`Linked to ${x.bankCode} (${nameOf(x.bankCode)})`);
        out.push(signinLine(x));
        out.push(`Pays automatically for: ${paidBy(x.code).map((b) => `${b.code} (${b.name})`).join(", ") || "—"}`);
        break;
      case "W":
        out.push(signinLine(x));
        if (x.holdsBalance === true) out.push("Value sits here — check and claim before closing");
        else if (x.holdsBalance === false) out.push("Usually empty — nothing to claim");
        break;
      case "U": case "S": case "T": case "M":
        out.push(payLine(x));
        out.push(signinLine(x));
        if (x.policy) out.push(`Policy/member #: ${x.policy}`);
        if (x.shared?.length) out.push(`Shared with: ${x.shared.join(", ")}`);
        break;
      case "H":
        out.push(signinLine(x));
        break;
      case "A":
        out.push(signinLine(x));
        break;
      case "K":
        out.push(signinLine(x));
        break;
      case "N":
        out.push(signinLine(x));
        if (x.wish) out.push(`My wish: ${x.wish}`);
        break;
      case "G":
        out.push(x.paid ? `Paid storage — ${payLine(x)}` : "Free plan");
        out.push(signinLine(x));
        if (x.contents?.length) out.push(`What's in there: ${x.contents.join(", ")}`);
        break;
      case "V":
        out.push(`Master Key: Password List row ${x.code}`);
        out.push(x.emergency === "yes" ? "Emergency access is set up for someone" : "No emergency access set up");
        break;
      case "L":
        out.push(`Opens with: ${x.opens}${x.opens !== "key" ? ` (combination on Password List row ${x.code})` : ""}`);
        if (x.keyWhere) out.push(`Key kept: ${x.keyWhere}`);
        if (x.inside?.length) out.push(`Inside: ${x.inside.join(", ")}`);
        break;
      default: break;
    }
    return out;
  }

  function PacketPage({ title, strip, stripColor, note, children }) {
    const accent = stripColor === GOLD ? GOLD : GREEN;
    const tint = stripColor === GOLD ? "#FBF1D6" : PANEL;
    return (
      <div className="packet-page mb-6 overflow-hidden rounded-lg"
        style={{ border: "1px solid #d8d4c8", background: "#fff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <div className="px-5 pb-2 pt-4" style={{ borderBottom: `4px solid ${accent}` }}>
          <p className="text-2xl font-bold" style={{ color: NAVY }}>{title}</p>
          <p className="text-xs font-bold" style={{ color: INK2 }}>Tech Ease  |  NetLegacy™ Digital Life Map  |  865-245-9811</p>
        </div>
        <div className="px-5 py-2 text-center text-sm font-bold" style={{ background: tint, color: NAVY, borderBottom: `1px solid ${accent}` }}>{strip}</div>
        <div className="p-5">{children}</div>
        {note && <div className="px-5 pb-4"><p className="text-sm italic" style={{ color: "#5a627c" }}>For {trusted || "my trusted person"}: {note}</p></div>}
      </div>
    );
  }
  const PLine = ({ children, bold }) => <p className={`mb-1 ${bold ? "font-bold" : ""}`} style={{ color: NAVY, fontSize: 17, lineHeight: 1.35 }}>{children}</p>;

  function PacketView() {
    return (
      <div>
        <PacketPage title="Start Here" strip="READ THIS PAGE FIRST — IT IS THE MAP TO EVERYTHING ELSE" stripColor={GREEN}>
          <PLine bold>This packet was made: {new Date().toLocaleDateString()} — review and update it once a year, or after any big change (new bank, new phone, new email).</PLine>
          <PLine bold>This packet is for: {trusted || "____________________"}</PLine>
          <PLine bold>My Password List is kept: {pwLocation || "____________________"}</PLine>
          <PLine bold>A backup copy of this packet: {packetBackup || "not recorded"}</PLine>
          <PLine>Every entry has a code (E1, B1, C1...). Passwords live on the separate Password List, matched only by code. You need both this packet and that sheet to get into anything — that's on purpose.</PLine>
          <PLine bold>Legacy contacts set up: {legacy.length ? legacy.join(", ") : "none yet"}</PLine>
          <PLine>A password doesn't always mean permission — some accounts, especially banks, may still require a will, power of attorney, or letters testamentary before this information can be legally used. A lawyer can confirm what applies to your situation.</PLine>
          <PLine bold>Read the rest of this packet in this order:</PLine>
          <PLine>1. This week — Insurance (contact the agent about any claims) and Payment Apps (check for money, points, or crypto sitting in Venmo, PayPal, rewards accounts, or similar).</PLine>
          <PLine>2. Don't rush these — they're built to wait: Devices (don't erase), Email (closes last), Utilities (don't cancel while anyone still lives there), Cards (move auto-pays before cancelling).</PLine>
          <PLine>3. No rush: Social Media, Photos & Cloud, Purchased Books/Movies/Games, Subscriptions, TV & Streaming.</PLine>
          <PLine>4. If you're helping someone who's still here but struggling to manage things themselves, rather than settling their affairs: Medical & Health Portals and Government & Benefits accounts are the ones that matter most.</PLine>
        </PacketPage>
        {CAT_ORDER.map((c) => {
          const ents = byCat(c);
          if (!ents.length) return null;
          return (
            <PacketPage key={c} title={`${c} — ${CAT_TITLES[c]}`} strip={STRIPS[c]} stripColor={GREEN} note={NOTES[c]}>
              {ents.map((e) => (
                <div key={e.code} className="mb-3">
                  <PLine bold>{e.code} — {e.name}</PLine>
                  {linesFor(e).map((l, i) => <PLine key={i}>{l}</PLine>)}
                </div>
              ))}
            </PacketPage>
          );
        })}
        <PacketPage title="My Password List" strip="LOCK THIS SHEET AWAY — FIREPROOF SAFE, LOCKBOX, OR WITH YOUR WILL" stripColor={GOLD}>
          <PLine>Codes only — no account names travel with this sheet. Accounts with no password have no row. Write in pencil; things change.</PLine>
          <div className="mt-3">
            {pwRows.map((r, i) => (
              <div key={r.code + i} className="flex items-end gap-3 py-2">
                <span className="w-10 flex-none text-base font-bold" style={{ color: NAVY }}>{r.code}</span>
                <span className="flex-1" style={{ borderBottom: "2px solid #9AA6C4", height: 26, minWidth: 80 }} />
              </div>
            ))}
            {pwRows.length === 0 && <PLine>Nothing needs a password row yet.</PLine>}
          </div>
        </PacketPage>
      </div>
    );
  }

  // =====================================================================
  // Interview
  // =====================================================================
  const next = (p) => {
    setSub(0); setDraft(null); setQueue([]); setPhase(p);
    if (p === "finish") setFirstRunDone(true);
    if (p !== "welcome") setDirty(true);
  };

  // =====================================================================
  // My Map — change one thing after the first run, without starting over
  // =====================================================================
  const SETTERS = { D: setDevices, E: setEmails, P: setCarriers, B: setBanks, C: setCards, W: setPayments, U: setBills, S: setBills, T: setBills, M: setBills, N: setSocials, G: setPhotos, K: setPurchases, H: setMedical, A: setGovernment, V: setVaults, L: setSafes };
  const ALL_SETTERS = [setDevices, setEmails, setCarriers, setBanks, setCards, setPayments, setBills, setSocials, setPhotos, setPurchases, setMedical, setGovernment, setVaults, setSafes];
  const entryOf = (code) => all.find((x) => x.code === code);
  const hubGo = (view) => {
    setHubView(view); setPhase("hub"); setMenuOpen(false);
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0);
  };
  const addTodo = (text) => setPaperTodo((p) => (p.some((t) => t.text === text) ? p : [...p, { id: Date.now() + Math.random(), text }]));
  const reprintTodo = (cat) => addTodo(`Reprint the ${CAT_TITLES[cat]} page of your packet.`);
  const needsPwRow = (e) => {
    if (e.cat === "D" || e.cat === "V") return true;
    if (e.cat === "E") return e.method !== "passkey";
    if (e.cat === "L") return e.opens !== "key";
    return !!e.signin && e.method !== "passkey";
  };
  // codes are written on paper, so a code is never reused, even after its entry is removed
  function nextCode(cat) {
    const used = [...all.map((x) => x.code), ...retired].filter((c) => c[0] === cat).map((c) => parseInt(c.slice(1), 10) || 0);
    return cat + (Math.max(0, ...used) + 1);
  }
  function updateEntry(code, patch, field) {
    const e = entryOf(code);
    if (!e) return;
    SETTERS[e.cat]((list) => list.map((x) => (x.code === code ? { ...x, ...patch } : x)));
    setDirty(true);
    const merged = { ...e, ...patch };
    if (field === "signin" && needsPwRow(merged)) addTodo(`If the password for ${code} (${merged.name}) changed, update its row on your Password List by hand.`);
    reprintTodo(e.cat);
  }
  function commitNew(entry) {
    SETTERS[entry.cat]((list) => [...list, entry]);
    setDirty(true);
    if (needsPwRow(entry)) addTodo(`Add a row for ${entry.code} (${entry.name}) to your Password List, by hand.`);
    reprintTodo(entry.cat);
  }
  const dependentsOf = (code) => all.filter((x) => x.code !== code && (x.payCode === code || x.bankCode === code || x.signin === code));
  function removeEntry(code) {
    const e = entryOf(code);
    if (!e) return;
    const deps = dependentsOf(code);
    const hadRow = pwRows.some((r) => r.code === code);
    const clean = (list) => list.map((x) => {
      let y = x;
      if (y.payCode === code) y = { ...y, payCode: undefined };
      if (y.bankCode === code) y = { ...y, bankCode: undefined };
      if (y.signin === code) y = { ...y, signin: null, method: null };
      if (y.deviceCode === code) y = { ...y, deviceCode: null };
      return y;
    });
    SETTERS[e.cat]((list) => list.filter((x) => x.code !== code));
    ALL_SETTERS.forEach((set) => set(clean));
    setRetired((r) => (r.includes(code) ? r : [...r, code]));
    setDirty(true);
    const addNote = `Add a row for ${code} (${e.name}) to your Password List, by hand.`;
    if (paperTodo.some((t) => t.text === addNote)) setPaperTodo((p) => p.filter((t) => t.text !== addNote));
    else if (hadRow) addTodo(`Cross out row ${code} (${e.name}) on your Password List.`);
    reprintTodo(e.cat);
    [...new Set(deps.map((d) => d.cat))].forEach(reprintTodo);
  }

  const fieldKeys = (e) => {
    switch (e.cat) {
      case "D": return ["name"];
      case "E": return ["name", "emailOpens"];
      case "P": return ["name", "signin", "pay"];
      case "B": return ["name", "types", "last4s", "moneyIn", "signin", "contact"];
      case "C": return ["name", "last4", "bank", "signin"];
      case "W": return ["name", "signin", "holds"];
      case "U": case "M": return ["name", "pay", "signin"];
      case "S": case "T": return ["name", "pay", "signin", "shared"];
      case "H": case "A": case "K": return ["name", "signin"];
      case "N": return ["name", "signin", "wish"];
      case "G": return e.paid ? ["name", "paid", "pay", "signin", "contents"] : ["name", "paid", "signin", "contents"];
      case "V": return ["name", "emergency"];
      case "L": return e.opens === "combination" ? ["name", "opens", "inside"] : ["name", "opens", "keyWhere", "inside"];
      default: return ["name"];
    }
  };
  const listText = (a) => (a && a.length ? a.join(", ") : "Not recorded");
  function fieldValue(e, k) {
    switch (k) {
      case "name": return e.name;
      case "signin":
        if (e.method === "passkey") return "No password — opens with your device";
        if (e.signin === "username") return `Username ${e.username || "(not recorded)"}`;
        if (e.signin) return `Email ${nameOf(e.signin)} (${e.signin})`;
        return "No online account";
      case "pay": return e.payCode ? `${nameOf(e.payCode)} (${e.payCode})` : e.payNote || "Not recorded";
      case "shared": return e.shared && e.shared.length ? e.shared.join(", ") : "No one";
      case "last4": return e.last4 || "Not recorded";
      case "last4s": return e.last4ByType && Object.keys(e.last4ByType).length ? Object.entries(e.last4ByType).map(([t, n]) => `${t} ${n}`).join(", ") : e.last4 || "Not recorded";
      case "types": return listText(e.types);
      case "moneyIn": return listText(e.moneyIn);
      case "contact": return e.contact || "Not recorded";
      case "bank": return e.bankCode ? `${nameOf(e.bankCode)} (${e.bankCode})` : "Not linked";
      case "holds": return e.holdsBalance === true ? "Yes — claim it before closing" : e.holdsBalance === false ? "Usually empty" : "Not sure";
      case "paid": return e.paid ? "Yes, a paid plan" : "Free plan";
      case "contents": return listText(e.contents);
      case "wish": return e.wish || "Not recorded";
      case "emergency": return e.emergency === "yes" ? "Set up for someone" : e.emergency === "no" ? "None set up" : "Not sure";
      case "opens": return e.opens ? { combination: "A combination", key: "A key", both: "A key and a combination" }[e.opens] || e.opens : "Not recorded";
      case "keyWhere": return e.keyWhere || "Not recorded";
      case "inside": return listText(e.inside);
      case "emailOpens": return e.method === "passkey" ? "No — opens without one" : e.method === "both" ? "Sometimes" : "Yes";
      default: return "";
    }
  }

  // One editor per kind of detail. onResult(patch) receives what changed.
  function editorFor(e, k, onResult) {
    const key = `${e.code}-${k}`;
    switch (k) {
      case "name": return <TypeIn key={key} q="What should this be called?" placeholder={e.name} initial={e.name} onSave={(v) => onResult({ name: v })} />;
      case "signin": return <SignIn key={key} label={e.name} emails={emails.filter((x) => x.code !== e.code)} deviceName={device1?.name} onDone={(res) => onResult(res)} />;
      case "pay": return <PickOne key={key} q={`What pays for ${e.name}?`} options={payOptions().filter((o) => !(o.value && o.value.payCode === e.code))}
        onPick={(patch) => onResult({ payCode: undefined, payNote: undefined, ...(patch || {}) })} />;
      case "shared": return <PickMany key={key} q={`Does anyone else use ${e.name}?`} hint="So your trusted person knows who else might notice, or lose access, if it's cancelled."
        options={["My spouse or partner", "My kids", "A friend or family member"]} otherLabel="+ Someone else" otherQ="Who else?" otherPlaceholder="my sister"
        initial={e.shared || []} nextLabel="Save" emptyLabel="No one — save" onNext={(sel) => onResult({ shared: sel })} />;
      case "last4": return <TypeIn key={key} q="Last 4 digits on the card?" hint="Enough to tell cards apart — useless on its own." placeholder="4821" skipLabel="Skip this" numeric maxLength={4}
        initial={e.last4 || ""} onSave={(v) => onResult({ last4: v || undefined })} />;
      case "last4s": return <Last4Loop key={key} types={e.types || []} initial={e.last4ByType} onDone={(patch) => onResult(patch)} />;
      case "types": return <PickMany key={key} q={`What do you have at ${e.name}?`} hint="Tap all that apply." options={["Checking", "Savings", "Investment or retirement"]}
        initial={e.types || []} nextLabel="Save" emptyLabel="None of these — save"
        onNext={(sel) => onResult({ types: sel, last4ByType: Object.fromEntries(Object.entries(e.last4ByType || {}).filter(([t]) => sel.includes(t))) })} />;
      case "moneyIn": return <PickMany key={key} q={`What money arrives in ${e.name} on its own?`} hint="The deposits that show up without you doing anything."
        options={["Social Security", "A pension", "A paycheck", "Investment income", "Rent from a property"]} otherLabel="+ Something else" otherQ="What else arrives?" otherPlaceholder="VA benefits"
        initial={e.moneyIn || []} nextLabel="Save" emptyLabel="None of these — save" onNext={(sel) => onResult({ moneyIn: sel })} />;
      case "contact": return <TypeIn key={key} q={`Is there a branch or person you deal with at ${e.name}?`} hint="Banks are far easier with a human name attached."
        placeholder="Main St branch — Brenda" skipLabel="Skip this" initial={e.contact || ""} onSave={(v) => onResult({ contact: v || undefined })} />;
      case "bank": return <PickOne key={key} q={`Is ${e.name} connected to one of your bank accounts?`} hint="Debit cards always are; credit cards sometimes pay from one."
        options={banks.map((b) => ({ label: `Yes — ${b.name}`, value: b.code }))} skip="No / not sure" onPick={(v) => onResult({ bankCode: v || undefined })} />;
      case "holds": return <PickOne key={key} q={`Is there anything of value sitting in ${e.name} right now?`} hint="Money, points, or currency that would need to be claimed or transferred, rather than just closed."
        options={[{ label: "Yes, there's a balance or value there", value: true }, { label: "No, it's usually empty", value: false }]} skip="Not sure"
        onPick={(v) => onResult({ holdsBalance: v === null ? undefined : v })} />;
      case "paid": return <PickOne key={key} q={`Do you pay for extra storage on ${e.name}?`} hint="If a paid plan lapses, files can be deleted — the map flags it."
        options={[{ label: "No, the free amount", value: false }, { label: "Yes, I pay monthly", value: true }, { label: "Not sure", value: false }]}
        onPick={(v) => onResult(v ? { paid: true } : { paid: false, payCode: undefined, payNote: undefined })} />;
      case "contents": return <PickMany key={key} q="What's in there worth saving?" hint="So your trusted person knows what they're rescuing before anything closes."
        options={["Family photos", "Videos", "Tax and legal papers", "Letters and documents"]} otherLabel="+ Something else" otherQ="What else?" otherPlaceholder="my genealogy files"
        initial={e.contents || []} nextLabel="Save" emptyLabel="None of these — save" onNext={(sel) => onResult({ contents: sel })} />;
      case "wish": return <PickOne key={key} q={`If you weren't here, what should happen to your ${e.name}?`} hint="Some sites can turn an account into a memory page instead of deleting it."
        options={[{ label: "Keep it as a memory page", value: "Memorialize" }, { label: "Delete it", value: "Delete" }, { label: "Let my trusted person decide", value: "Their choice" }]}
        onPick={(w) => onResult({ wish: w })} />;
      case "emergency": return <PickOne key={key} q={`Has someone been given emergency access to ${e.name}?`} hint="Some password apps let a person you name request entry if something happens to you."
        options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Not sure", value: null }]} onPick={(v) => onResult({ emergency: v })} />;
      case "opens": return <PickOne key={key} q="How does it open?" options={[{ label: "A combination", value: "combination" }, { label: "A key", value: "key" }, { label: "Both", value: "both" }]}
        onPick={(v) => onResult({ opens: v })} />;
      case "keyWhere": return <PickOne key={key} q="Where is the key kept?" hint="This is the one secret that's a hiding place, not a password."
        options={[{ label: "On my keyring" }, { label: "Top desk drawer" }, { label: "Kitchen drawer" }, { label: "My trusted person has one" }]}
        otherLabel="+ Somewhere else" otherQ="Where's the key?" otherPlaceholder="under the jewelry box" skip="Skip this" onPick={(v) => onResult({ keyWhere: v || undefined })} />;
      case "inside": return <PickMany key={key} q={`What's inside the ${e.name}?`}
        options={["Will", "Deed or car title", "Birth certificate", "Jewelry or valuables", "Cash", "My Password List"]} otherLabel="+ Something else" otherQ="What else is inside?" otherPlaceholder="coin collection"
        initial={e.inside || []} nextLabel="Save" emptyLabel="Nothing — save" onNext={(sel) => onResult({ inside: sel })} />;
      case "emailOpens": return <PickOne key={key} q={`When you open ${e.name}, does it ask for a password?`} hint="Some accounts let you straight in without typing anything — that's a passkey, living on your device."
        options={[{ label: "Yes, I type a password", value: "password" }, { label: `No — it just lets me in${device1 ? ` on ${device1.name}` : ""}`, value: "passkey" }, { label: "Sometimes one, sometimes the other", value: "both" }, { label: "I'm not sure", value: "password" }]}
        onPick={(m) => onResult({ method: m, deviceCode: m !== "password" ? "D1" : null })} />;
      default: return null;
    }
  }

  const backBtn = (label, onClick) => (
    <button onClick={onClick} className="nl-back no-print"><IconBack size={22} sw={2.4} /> {label}</button>
  );
  const catTitle = (c) => CAT_TITLES[c] || (c === "LEG" ? "Legacy contacts" : c);
  const countOf = (c) => (c === "LEG" ? legacy.length : byCat(c).length);

  function hubHome(v) {
    const group = v.group ? GROUPS.find((g) => g.id === v.group) : null;
    const groups = GROUPS.filter((g) => g.id !== "map" && (!group || g.id === group.id));
    return (
      <div>
        {group && backBtn("All of My Map", () => hubGo({ screen: "home" }))}
        <Ask q={group ? group.label : "My Map"} hint={group ? null : "Tap anything to look at it or change it. No need to start over."}>
          {dirty && (
            <div className="mb-6 rounded-2xl p-5" style={{ background: "#fff", border: `3px solid ${NAVY}` }}>
              <p className="mb-3 text-xl font-bold" style={{ color: NAVY }}>You have changes that aren't saved yet.</p>
              <p className="mb-4 text-lg" style={{ color: INK2 }}>This tool keeps nothing on its own. Save a new file so your changes aren't lost when you close this page.</p>
              <Btn kind="go" onClick={openSave}>Save now</Btn>
            </div>
          )}
          {paperTodo.length > 0 && (
            <div className="mb-6 rounded-2xl p-5" style={{ background: "#FBF1D6", border: `2px solid ${GOLD}` }}>
              <p className="mb-3 text-xl font-bold" style={{ color: NAVY }}>To do on paper</p>
              {paperTodo.map((t) => (
                <div key={t.id} className="mb-3 flex items-center gap-3">
                  <span className="flex-1 text-lg" style={{ color: NAVY }}>{t.text}</span>
                  <button onClick={() => setPaperTodo((p) => p.filter((x) => x.id !== t.id))}
                    className="rounded-xl px-4 font-bold focus:outline-none focus-visible:ring-4"
                    style={{ minHeight: 48, fontSize: 18, background: "#fff", color: NAVY, border: `2px solid ${NAVY}` }}>Done</button>
                </div>
              ))}
            </div>
          )}
          {groups.map((g) => (
            <div key={g.id} className="mb-6">
              {!group && <h3 className="mb-3 text-2xl font-bold" style={{ color: NAVY }}>{g.label}</h3>}
              <div className="grid gap-3">
                {GROUP_CATS[g.id].map((c) => (
                  <Tile key={c} title={catTitle(c)} sub={c === "LEG" ? (legacy.length ? `${legacy.length} set up` : "None yet") : countOf(c) ? `${countOf(c)} on your map` : "None yet"}
                    onClick={() => hubGo({ screen: "cat", cat: c })} />
                ))}
              </div>
            </div>
          ))}
          {!group && (
            <div className="mb-2">
              <h3 className="mb-3 text-2xl font-bold" style={{ color: NAVY }}>See it and print it</h3>
              <div className="grid gap-3">
                <Tile title="My map picture" sub="How everything connects" onClick={() => hubGo({ screen: "map" })} />
                <Tile title="My printable packet" sub="Print the pages for your trusted person" onClick={() => { setPhase("packet"); setMenuOpen(false); }} />
              </div>
            </div>
          )}
        </Ask>
      </div>
    );
  }

  function hubCat(v) {
    const groupId = Object.keys(GROUP_CATS).find((id) => GROUP_CATS[id].includes(v.cat));
    const back = backBtn(`Back to ${GROUPS.find((g) => g.id === groupId).label}`, () => hubGo({ screen: "home", group: groupId }));
    if (v.cat === "LEG") {
      return (
        <div>
          {back}
          <Ask q="Legacy contacts" hint="Apple, Google, and Facebook each let you name a person ahead of time who's allowed in if something happens to you. Tap the ones you've set up.">
            <div className="grid gap-3">
              {LEGACY.map((l) => (
                <Chip key={l} multi active={legacy.includes(l)} onClick={() => { setLegacy((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l])); setDirty(true); }}>{l}</Chip>
              ))}
            </div>
          </Ask>
        </div>
      );
    }
    const list = byCat(v.cat);
    return (
      <div>
        {back}
        {v.notice && <Notice>{v.notice}</Notice>}
        <Ask q={catTitle(v.cat)} hint={list.length ? "Tap one to see it or change it." : "Nothing here yet."}>
          <div className="grid gap-3">
            {list.map((e) => <Chip key={e.code} onClick={() => hubGo({ screen: "entry", code: e.code })}>{e.code} — {e.name}</Chip>)}
            <Chip add onClick={() => hubGo({ screen: "add", cat: v.cat, draft: null, done: [] })}>+ Add one</Chip>
          </div>
        </Ask>
      </div>
    );
  }

  function hubEntry(v) {
    const e = entryOf(v.code);
    if (!e) return hubHome({});
    return (
      <div>
        {backBtn(`Back to ${catTitle(e.cat)}`, () => hubGo({ screen: "cat", cat: e.cat }))}
        {v.notice && <Notice>{v.notice}</Notice>}
        <Ask q={`${e.code} — ${e.name}`} hint="Tap Change next to anything that's different.">
          <div className="mb-6 grid gap-3">
            {fieldKeys(e).map((k) => (
              <div key={k} className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ border: `2px solid ${RULE}`, background: "#fff" }}>
                <div className="min-w-0 flex-1">
                  <p className="font-bold" style={{ fontSize: 16, color: INK2 }}>{FIELD_LABEL[k]}</p>
                  <p className="font-bold" style={{ fontSize: "clamp(18px, 1.8vw, 22px)", color: NAVY, overflowWrap: "anywhere" }}>{fieldValue(e, k)}</p>
                </div>
                <button onClick={() => hubGo({ screen: "edit", code: e.code, field: k })} aria-label={`Change ${FIELD_LABEL[k]}`}
                  className="flex-none rounded-xl px-4 font-bold focus:outline-none focus-visible:ring-4"
                  style={{ minHeight: 48, fontSize: 18, background: "#fff", color: NAVY, border: `2px solid ${NAVY}` }}>Change</button>
              </div>
            ))}
          </div>
          <Btn kind="ghost" onClick={() => hubGo({ screen: "remove", code: e.code })}>Stop tracking this</Btn>
        </Ask>
      </div>
    );
  }

  function hubEdit(v) {
    const e = entryOf(v.code);
    if (!e) return hubHome({});
    return (
      <div>
        {backBtn("Cancel", () => hubGo({ screen: "entry", code: e.code }))}
        {editorFor(e, v.field, (patch) => {
          updateEntry(e.code, patch, v.field);
          hubGo({ screen: "entry", code: e.code, notice: "Saved." });
        })}
      </div>
    );
  }

  function hubRemove(v) {
    const e = entryOf(v.code);
    if (!e) return hubHome({});
    const deps = dependentsOf(e.code);
    return (
      <div>
        {backBtn("Keep it", () => hubGo({ screen: "entry", code: e.code }))}
        <Ask q={`Stop tracking ${e.name}?`} hint="This takes it off your map and out of your printed packet. It does not cancel the real account.">
          {deps.length > 0 && (
            <div className="mb-5 rounded-2xl p-4" style={{ background: "#FBF1D6", border: `2px solid ${GOLD}` }}>
              <p className="mb-2 text-lg font-bold" style={{ color: NAVY }}>These rely on it:</p>
              {deps.map((d) => <p key={d.code} className="text-lg" style={{ color: NAVY }}>{d.code} — {d.name}</p>)}
              <p className="mt-2 text-base" style={{ color: INK2 }}>They'll show as not recorded until you update them.</p>
            </div>
          )}
          <div className="grid gap-3">
            <Btn onClick={() => { removeEntry(e.code); hubGo({ screen: "cat", cat: e.cat, notice: `${e.name} was taken off your map.` }); }}>Yes, stop tracking it</Btn>
            <Btn kind="ghost" onClick={() => hubGo({ screen: "entry", code: e.code })}>No, keep it</Btn>
          </div>
        </Ask>
      </div>
    );
  }

  function hubAdd(v) {
    const { cat } = v;
    const cancel = backBtn("Cancel", () => hubGo({ screen: "cat", cat }));
    const advance = (entry, doneKeys) => {
      const rest = fieldKeys(entry).filter((k) => k !== "name" && !doneKeys.includes(k));
      if (rest.length === 0) {
        commitNew(entry);
        hubGo({ screen: "entry", code: entry.code, notice: `Added ${entry.name}.` });
      } else {
        hubGo({ screen: "add", cat, draft: entry, done: doneKeys });
      }
    };
    if (!v.draft) {
      const start = (name) => { if (name) advance({ code: nextCode(cat), cat, name }, []); };
      if (cat === "E") return <div>{cancel}<TypeIn key="add-E" q="What's the email address?" placeholder="yourname@gmail.com" onSave={start} /></div>;
      if (cat === "B") return <div>{cancel}<TypeIn key="add-B" q="Which bank, credit union, or investment company?" hint="Just the name. Passwords and full account numbers stay off this map." placeholder="First Bank of Tennessee" onSave={start} /></div>;
      if (cat === "C") return <div>{cancel}<TypeIn key="add-C" q="What's the card called?" hint="The bank and kind is plenty: 'Chase Visa'. Never the full number." placeholder="Visa from my bank" onSave={start} /></div>;
      const isBill = ["U", "S", "T", "M"].includes(cat);
      const tracked = byCat(cat).map((x) => x.name);
      const cfg = isBill
        ? { q: "Which one are you adding?", opts: BILLS.filter((b) => b.cat === cat && !tracked.includes(b.name)).map((b) => b.name), otherQ: "What else do you pay for?", ph: "storage unit" }
        : NAME_OPTIONS[cat];
      return (
        <div>{cancel}
          <PickOne key={"add-" + cat} q={cfg.q} options={cfg.opts.map((o) => ({ label: o }))}
            otherLabel="+ Something else" otherQ={cfg.otherQ} otherPlaceholder={cfg.ph} onPick={start} />
        </div>
      );
    }
    const draft = v.draft;
    const doneKeys = v.done || [];
    const k = fieldKeys(draft).filter((x) => x !== "name" && !doneKeys.includes(x))[0];
    return (
      <div>
        {cancel}
        {editorFor(draft, k, (patch) => advance({ ...draft, ...patch }, [...doneKeys, k]))}
      </div>
    );
  }

  function hubMap() {
    return (
      <div>
        {backBtn("Back to My Map", () => hubGo({ screen: "home" }))}
        <Ask q="Your map">
          <div className="mb-4 rounded-2xl p-3" style={{ background: "#fff", border: `2px solid ${RULE}` }}><MapView /></div>
          <div className="mb-4 flex flex-wrap gap-4 text-lg font-bold" style={{ color: INK2 }}>
            <span><span style={{ color: GREEN_DK }}>——</span> signs in with</span>
            <span><span style={{ color: GOLD }}>- - -</span> pays for</span>
          </div>
        </Ask>
      </div>
    );
  }

  function hubScreen() {
    const v = hubView;
    if (v.screen === "cat") return hubCat(v);
    if (v.screen === "entry") return hubEntry(v);
    if (v.screen === "edit") return hubEdit(v);
    if (v.screen === "remove") return hubRemove(v);
    if (v.screen === "add") return hubAdd(v);
    if (v.screen === "map") return hubMap();
    return hubHome(v);
  }

  function screen() {
    if (phase === "hub") return hubScreen();
    // ---------- welcome ----------
    if (phase === "welcome") {
      return (
        <div>
          <p className="mb-1 text-lg font-bold tracking-wide" style={{ color: GREEN_DK }}>TECH EASE PRESENTS</p>
          <h1 className="mb-1 text-4xl font-bold leading-tight" style={{ color: NAVY }}>NetLegacy<sup className="text-xl">™</sup></h1>
          <p className="mb-4 text-2xl font-bold" style={{ color: NAVY }}>Digital Life Map</p>
          <p className="mb-6 text-xl leading-relaxed" style={{ color: INK2 }}>
            Mostly tapping, hardly any typing. We'll draw a map of your accounts as you go — so the person you trust is never left searching in the dark.
          </p>
          <div className="mb-6 rounded-2xl p-4 text-lg font-bold leading-snug" style={{ background: PANEL, color: GREEN_DK, border: `2px solid ${GREEN}` }}>
            We will never ask for one of your account passwords. Not one. Ever.
          </div>
          {erased && <p className="mb-4 text-lg font-bold" style={{ color: GOLD }}>✓ Everything from last time was erased.</p>}
          <div className="grid gap-3">
            <Btn kind="go" onClick={() => next("trusted")}>Start my map</Btn>
            <Btn kind="ghost" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Continue a saved map</Btn>
          </div>
          <input ref={fileInputRef} type="file" accept=".netlegacy,application/json,.json" onChange={onPickFile} className="hidden" />
        </div>
      );
    }

    if (phase === "trusted") {
      return <TypeIn key="trusted" q="Who is this map for?"
        hint="The person you trust to step in if you couldn't. Their name goes on the first page."
        placeholder="Nancy, my daughter" skipLabel="I'll decide later"
        onSave={(v) => { if (v) setTrusted(v); next("devices"); }} />;
    }

    // ---------- devices ----------
    if (phase === "devices") {
      if (sub === 0) {
        return <PickMany key="dev" q="Which of these do you use?"
          hint="Tap all that apply. Devices matter because your phone can hold sign-in keys and receive security codes."
          options={["iPhone", "Android phone", "Computer or laptop", "iPad or tablet"]}
          otherLabel="+ Something else" otherQ="What device?" otherPlaceholder="Kindle"
          onNext={(sel) => {
            setDevices(sel.map((n, i) => ({ code: "D" + (i + 1), cat: "D", name: n })));
            next("emails");
          }} />;
      }
    }

    // ---------- emails ----------
    if (phase === "emails") {
      if (sub === 0) {
        return <TypeIn key={"em" + emails.length}
          q={emails.length ? "What's your other email address?" : "What email address do you check?"}
          hint={emails.length ? null : "Email is the front door to almost everything. Just the address — never the password."}
          placeholder="yourname@gmail.com"
          skipLabel={emails.length ? "That's all my email" : null}
          initial={draft?.name || ""}
          onSave={(v) => { if (v === null) { next("carrier"); return; } setDraft({ name: v }); setSub(1); }} />;
      }
      if (sub === 1) {
        return <PickOne key="emmethod" q={`When you open ${draft.name}, does it ask for a password?`}
          hint="Some accounts let you straight in without typing anything — that's a passkey, living on your device."
          options={[
            { label: "Yes, I type a password", value: "password" },
            { label: `No — it just lets me in${device1 ? ` on ${device1.name}` : ""}`, value: "passkey" },
            { label: "Sometimes one, sometimes the other", value: "both" },
            { label: "I'm not sure", value: "password" },
          ]}
          onPick={(m) => { setDraft({ ...draft, method: m, deviceCode: m !== "password" ? "D1" : null }); setSub(2); }} />;
      }
      if (sub === 2) {
        return <PickOne key="emrec" q="If you got locked out, where would the reset code go?"
          hint="Email and phone companies send a code to a backup contact you set up earlier."
          options={[
            ...(device1 ? [{ label: "A text to my phone", value: { kind: "device" } }] : []),
            ...emails.map((e) => ({ label: `My other email — ${e.name}`, value: { kind: "knownEmail", name: e.name } })),
            { label: "A different email I haven't added yet", value: { kind: "newEmail" } },
            { label: "A text to a different phone number", value: { kind: "phone" } },
          ]}
          otherLabel="Something else" otherQ="Where does it go?" otherPlaceholder="my sister keeps a copy"
          skip="I don't know"
          onPick={(v) => {
            const commit = (recovery) => {
              const e = { ...draft, code: "E" + (emails.length + 1), cat: "E", recovery };
              setEmails((p) => [...p, e]); setDraft(null); setSub(0);
            };
            if (v === null) { commit(null); return; }
            if (typeof v === "string") { commit(v); return; } // typed "Something else" catch-all
            if (v.kind === "device") { commit("a text to my phone"); return; }
            if (v.kind === "knownEmail") { commit(v.name); return; }
            if (v.kind === "newEmail") { setSub(3); return; }
            if (v.kind === "phone") { setSub(4); return; }
          }} />;
      }
      if (sub === 3) {
        return <TypeIn key="emrecnew" q="What's that other email address?"
          hint="We'll ask its sign-in details next, same as this one."
          placeholder="daughter@example.com"
          onSave={(v) => {
            const e = { ...draft, code: "E" + (emails.length + 1), cat: "E", recovery: v };
            setEmails((p) => [...p, e]);
            setDraft({ name: v }); setSub(1); // chain straight into this new email's own questions
          }} />;
      }
      if (sub === 4) {
        return <TypeIn key="emrecphone" q="Whose phone does it text, or what's the number?"
          hint="Just enough for your trusted person to know where to look."
          placeholder="my daughter Nancy's cell" skipLabel="Not sure"
          onSave={(v) => {
            const e = { ...draft, code: "E" + (emails.length + 1), cat: "E", recovery: v ? `Text to: ${v}` : "a different phone number" };
            setEmails((p) => [...p, e]);
            setDraft(null); setSub(0);
          }} />;
      }
    }

    // ---------- phone / carrier ----------
    if (phase === "carrier") {
      if (sub === 0) {
        return <PickOne key="car" q="Who provides your phone service?"
          hint="The company you pay for your phone number. Your number must stay alive as long as banks text codes to it."
          options={[{ label: "Verizon" }, { label: "AT&T" }, { label: "T-Mobile" }, { label: "US Cellular" }, { label: "Consumer Cellular" }]}
          otherLabel="+ Someone else" otherQ="Who is your phone company?" otherPlaceholder="Straight Talk"
          skip="I don't have a cell phone"
          onPick={(v) => { if (v === null) { next("banks"); return; } setDraft({ name: v }); setSub(1); }} />;
      }
      if (sub === 1) {
        return <SignIn key="carsi" label={`${draft.name}'s website`} emails={emails} deviceName={device1?.name}
          onDone={(res) => {
            setCarriers([{ ...draft, ...res, code: "P1", cat: "P" }]);
            setDraft(null); next("banks");
          }} />;
      }
    }

    // ---------- banks ----------
    if (phase === "banks") {
      if (sub === 0) {
        return <TypeIn key={"bk" + banks.length}
          q={banks.length ? "Any other bank, credit union, or investment account?" : "Where do you keep your money?"}
          hint={banks.length ? null : "Include retirement or investment accounts too, even at a different company than your regular bank — a 401(k) or a Vanguard or Fidelity account counts. Just the name; passwords and full account numbers stay off this map."}
          placeholder="First Bank of Tennessee"
          skipLabel={banks.length ? "That's all of them" : "Skip banking"}
          initial={draft?.name || ""}
          onSave={(v) => { if (v === null) { next("cards"); return; } setDraft({ name: v }); setSub(1); }} />;
      }
      if (sub === 1) {
        return <PickMany key="bktypes" q={`What do you have at ${draft.name}?`} hint="Tap all that apply."
          options={["Checking", "Savings", "Investment or retirement"]}
          onNext={(sel) => { setDraft({ ...draft, types: sel, last4ByType: {} }); setBillIdx(0); setSub(2); }} />;
      }
      if (sub === 2) {
        const types = draft.types || [];
        if (types.length === 0) {
          return <TypeIn key="bk4-generic" q="Last 4 digits of the main account?"
            hint="Just the last four — enough to identify it on a phone call, useless to a thief."
            placeholder="1234" skipLabel="Skip this" numeric maxLength={4}
            initial={draft.last4 || ""}
            onSave={(v) => { setDraft({ ...draft, last4: v }); setSub(3); }} />;
        }
        const idx = billIdx;
        const t = types[idx];
        if (!t) { setSub(3); return null; }
        return <TypeIn key={"bk4-" + t} q={`Last 4 digits of the ${t} account?`}
          hint={idx === 0 ? "Just the last four — enough to identify it on a phone call, useless to a thief." : null}
          placeholder="1234" skipLabel="Skip this" numeric maxLength={4}
          initial={(draft.last4ByType || {})[t] || ""}
          onSave={(v) => {
            const map = { ...(draft.last4ByType || {}) };
            if (v) map[t] = v;
            setDraft({ ...draft, last4ByType: map });
            if (idx + 1 < types.length) setBillIdx(idx + 1);
            else setSub(3);
          }} />;
      }
      if (sub === 3) {
        return <PickMany key="bkin" q={`What money arrives in ${draft.name} on its own?`}
          hint="The deposits that show up without you doing anything."
          options={["Social Security", "A pension", "A paycheck", "Investment income", "Rent from a property"]}
          otherLabel="+ Something else" otherQ="What else arrives?" otherPlaceholder="VA benefits"
          onNext={(sel) => { setDraft({ ...draft, moneyIn: sel }); setSub(4); }} />;
      }
      if (sub === 4) {
        return <SignIn key="bksi" label={draft.name} emails={emails} deviceName={device1?.name}
          onDone={(res) => { setDraft({ ...draft, ...res }); setSub(5); }} />;
      }
      if (sub === 5) {
        return <TypeIn key="bkc" q={`Is there a branch or person you deal with at ${draft.name}?`}
          hint="Banks are far easier with a human name attached."
          placeholder="Main St branch — Brenda" skipLabel="Skip this"
          onSave={(v) => {
            setBanks((p) => [...p, { ...draft, contact: v, code: "B" + (p.length + 1), cat: "B" }]);
            setDraft(null); setSub(0);
          }} />;
      }
    }

    // ---------- cards ----------
    if (phase === "cards") {
      if (sub === 0) {
        return <TypeIn key={"cd" + cards.length}
          q={cards.length ? "Any other card you use?" : "What's a card you use — credit or debit?"}
          hint={cards.length ? null : "The bank and kind is plenty: 'Chase Visa'. Never the full number."}
          placeholder="Visa from my bank"
          skipLabel={cards.length ? "That's all my cards" : "No cards / skip"}
          initial={draft?.name || ""}
          onSave={(v) => { if (v === null) { next("payments"); return; } setDraft({ name: v }); setSub(1); }} />;
      }
      if (sub === 1) {
        return <TypeIn key="cd4" q="Last 4 digits on the card?"
          hint="Enough to tell cards apart — useless on its own."
          placeholder="4821" skipLabel="Skip this" numeric maxLength={4}
          initial={draft?.last4 || ""}
          onSave={(v) => { setDraft({ ...draft, last4: v }); setSub(2); }} />;
      }
      if (sub === 2) {
        if (banks.length === 0) { setDraft({ ...draft }); setSub(3); return null; }
        return <PickOne key="cdbank" q={`Is ${draft.name} connected to one of your bank accounts?`}
          hint="Debit cards always are; credit cards sometimes pay from one."
          options={banks.map((b) => ({ label: `Yes — ${b.name}`, value: b.code }))}
          skip="No / not sure"
          onPick={(v) => { setDraft({ ...draft, bankCode: v }); setSub(3); }} />;
      }
      if (sub === 3) {
        return <SignIn key="cdsi" label={`${draft.name}'s website`} emails={emails} deviceName={device1?.name}
          onDone={(res) => {
            setCards((p) => [...p, { ...draft, ...res, code: "C" + (p.length + 1), cat: "C" }]);
            setDraft(null); setSub(0);
          }} />;
      }
    }

    // ---------- money apps (Venmo, PayPal, Zelle, etc.) ----------
    if (phase === "payments") {
      if (sub === 0) {
        return <PickMany key="paypick" q="Do you use any apps that hold money, points, or value?"
          hint="Money, miles, or crypto sometimes sit in these instead of a regular bank — worth flagging so nothing gets missed."
          options={[
            "Venmo", "PayPal", "Zelle", "Cash App", "Apple Cash",
            "Airline miles or hotel points", "Store or credit card rewards", "Cryptocurrency (Bitcoin, etc.)",
          ]}
          otherLabel="+ Something else" otherQ="Which one?" otherPlaceholder="Chime"
          onNext={(sel) => {
            if (!sel.length) { next("bills"); return; }
            setPayments(sel.map((n, i) => ({ name: n, code: "W" + (i + 1), cat: "W" })));
            setBillIdx(0); setBillStage("signin"); setSub(1);
          }} />;
      }
      if (sub === 1) {
        const p = payments[billIdx];
        if (!p) { next("bills"); return null; }
        if (billStage === "signin") {
          return <SignIn key={"wsi" + p.code} label={p.name} emails={emails} deviceName={device1?.name}
            onDone={(res) => {
              setPayments((list) => list.map((x, i) => (i === billIdx ? { ...x, ...res } : x)));
              setBillStage("balance");
            }} />;
        }
        return <PickOne key={"wb" + p.code} q={`Is there anything of value sitting in ${p.name} right now?`}
          hint="Money, points, or currency that would need to be claimed or transferred, rather than just closed."
          options={[
            { label: "Yes, there's a balance or value there", value: true },
            { label: "No, it's usually empty", value: false },
          ]}
          skip="Not sure"
          onPick={(v) => {
            setPayments((list) => list.map((x, i) => (i === billIdx ? { ...x, holdsBalance: v } : x)));
            if (billIdx + 1 < payments.length) { setBillIdx(billIdx + 1); setBillStage("signin"); }
            else next("bills");
          }} />;
      }
    }
    if (phase === "bills") {
      if (sub === 0) {
        return <PickMany key="billpick" q="What do you pay for every month or every year?"
          hint="Tap everything that bills you — the lights, the insurance, the streaming. We'll ask about each one next."
          options={BILLS.map((b) => b.name)}
          otherLabel="+ Something else" otherQ="What else do you pay for?" otherPlaceholder="storage unit"
          nextLabel="Next — one question each"
          onNext={(sel) => {
            if (!sel.length) { next("socials"); return; }
            const counts = {};
            const list = sel.map((name) => {
              const known = BILLS.find((b) => b.name === name);
              const cat = known ? known.cat : "S";
              counts[cat] = (counts[cat] || 0) + 1;
              return { name, cat, code: cat + counts[cat] };
            });
            setBills(list); setBillIdx(0); setBillStage("pay"); setSub(1);
          }} />;
      }
      if (sub === 1) {
        const b = bills[billIdx];
        if (!b) { next("socials"); return null; }
        if (billStage === "pay") {
          return <PickOne key={"bp" + b.code} q={`What pays for ${b.name}?`}
            hint={`${billIdx + 1} of ${bills.length}. If this payment stops, ${b.name} stops too — the map remembers that for you.`}
            options={payOptions()}
            onPick={(patch) => {
              setBills((list) => list.map((x, i) => (i === billIdx ? { ...x, ...(patch || {}) } : x)));
              setBillStage("signin");
            }} />;
        }
        if (billStage === "signin") {
          return <SignIn key={"bs" + b.code} label={b.name} emails={emails} deviceName={device1?.name}
            onDone={(res) => {
              setBills((list) => list.map((x, i) => (i === billIdx ? { ...x, ...res } : x)));
              if (b.cat === "T" || b.cat === "S") setBillStage("shared");
              else if (billIdx + 1 < bills.length) { setBillIdx(billIdx + 1); setBillStage("pay"); }
              else next("socials");
            }} />;
        }
        return <PickMany key={"bsh" + b.code} q={`Does anyone else use ${b.name}?`}
          hint="So your trusted person knows who else might notice, or lose access, if it's cancelled."
          options={["My spouse or partner", "My kids", "A friend or family member"]}
          otherLabel="+ Someone else" otherQ="Who else?" otherPlaceholder="my sister"
          onNext={(sel) => {
            setBills((list) => list.map((x, i) => (i === billIdx ? { ...x, shared: sel } : x)));
            if (billIdx + 1 < bills.length) { setBillIdx(billIdx + 1); setBillStage("pay"); }
            else next("socials");
          }} />;
      }
    }

    // ---------- social ----------
    if (phase === "socials") {
      if (sub === 0) {
        return <PickMany key="socpick" q="Are you on any of these?"
          hint="These hold your photos, friends, and memories — your map should say what becomes of them."
          options={["Facebook", "Instagram", "X (Twitter)", "TikTok", "Nextdoor", "LinkedIn"]}
          otherLabel="+ Something else" otherQ="Which one?" otherPlaceholder="church group site"
          onNext={(sel) => {
            if (!sel.length) { next("photos"); return; }
            setSocials(sel.map((n, i) => ({ name: n, code: "N" + (i + 1), cat: "N" })));
            setQueue(sel.map((_, i) => i)); setSub(1); setBillIdx(0); setBillStage("signin");
          }} />;
      }
      if (sub === 1) {
        const s = socials[billIdx];
        if (!s) { next("photos"); return null; }
        if (billStage === "signin") {
          return <SignIn key={"nsi" + s.code} label={s.name} emails={emails} deviceName={device1?.name}
            onDone={(res) => {
              setSocials((list) => list.map((x, i) => (i === billIdx ? { ...x, ...res } : x)));
              setBillStage("wish");
            }} />;
        }
        return <PickOne key={"nw" + s.code} q={`If you weren't here, what should happen to your ${s.name}?`}
          hint="Some sites can turn an account into a memory page instead of deleting it."
          options={[
            { label: "Keep it as a memory page", value: "Memorialize" },
            { label: "Delete it", value: "Delete" },
            { label: "Let my trusted person decide", value: "Their choice" },
          ]}
          onPick={(w) => {
            setSocials((list) => list.map((x, i) => (i === billIdx ? { ...x, wish: w } : x)));
            if (billIdx + 1 < socials.length) { setBillIdx(billIdx + 1); setBillStage("signin"); }
            else next("photos");
          }} />;
      }
    }

    // ---------- photos ----------
    if (phase === "photos") {
      if (sub === 0) {
        return <PickOne key={"ph" + photos.length}
          q={photos.length ? "Anywhere else your photos or files live?" : "Where do your photos live?"}
          hint={photos.length ? null : "Phones quietly copy photos to the cloud. If nobody knows where, the pictures can vanish with the account."}
          options={[
            { label: "iCloud" }, { label: "Google Photos" }, { label: "Amazon Photos" },
            { label: "OneDrive" }, { label: "Dropbox" }, { label: "Samsung Cloud" },
            { label: "An external hard drive" }, { label: "A USB stick or SD card" },
            { label: "Facebook or Instagram" },
          ]}
          otherLabel="+ Somewhere else" otherQ="Where?" otherPlaceholder="Shutterfly"
          skip={photos.length ? "That's all of them" : "Just on my phone / not sure"}
          onPick={(v) => { if (v === null) { next("purchases"); return; } setDraft({ name: v }); setSub(1); }} />;
      }
      if (sub === 1) {
        return <PickOne key="phpaid" q={`Do you pay for extra storage on ${draft.name}?`}
          hint="If a paid plan lapses, files can be deleted — the map flags it."
          options={[{ label: "No, the free amount", value: false }, { label: "Yes, I pay monthly", value: true }, { label: "Not sure", value: false }]}
          onPick={(v) => { setDraft({ ...draft, paid: v }); setSub(v ? 2 : 3); }} />;
      }
      if (sub === 2) {
        return <PickOne key="phpay" q={`What pays for the ${draft.name} storage?`} options={payOptions()}
          onPick={(patch) => { setDraft({ ...draft, ...(patch || {}) }); setSub(3); }} />;
      }
      if (sub === 3) {
        return <SignIn key="phsi" label={draft.name} emails={emails} deviceName={device1?.name}
          onDone={(res) => { setDraft({ ...draft, ...res }); setSub(4); }} />;
      }
      if (sub === 4) {
        return <PickMany key="phwhat" q="What's in there worth saving?"
          hint="So your trusted person knows what they're rescuing before anything closes."
          options={["Family photos", "Videos", "Tax and legal papers", "Letters and documents"]}
          otherLabel="+ Something else" otherQ="What else?" otherPlaceholder="my genealogy files"
          onNext={(sel) => {
            setPhotos((p) => [...p, { ...draft, contents: sel, code: "G" + (p.length + 1), cat: "G" }]);
            setDraft(null); setSub(0);
          }} />;
      }
    }

    // ---------- purchased digital media (books, movies, music, games) ----------
    if (phase === "purchases") {
      if (sub === 0) {
        return <PickMany key="pkgpick" q="Have you bought books, movies, music, or games through any of these?"
          hint="If the account is ever lost, so is everything bought through it — none of this is backed up anywhere else."
          options={["Amazon or Kindle", "Apple or iTunes", "Google Play", "Audible", "Steam", "Nintendo, PlayStation, or Xbox"]}
          otherLabel="+ Something else" otherQ="Which one?" otherPlaceholder="Barnes & Noble Nook"
          onNext={(sel) => {
            if (!sel.length) { next("medical"); return; }
            setPurchases(sel.map((n, i) => ({ name: n, code: "K" + (i + 1), cat: "K" })));
            setBillIdx(0); setSub(1);
          }} />;
      }
      if (sub === 1) {
        const k = purchases[billIdx];
        if (!k) { next("medical"); return null; }
        return <SignIn key={"ksi" + k.code} label={k.name} emails={emails} deviceName={device1?.name}
          onDone={(res) => {
            setPurchases((list) => list.map((x, i) => (i === billIdx ? { ...x, ...res } : x)));
            if (billIdx + 1 < purchases.length) setBillIdx(billIdx + 1);
            else next("medical");
          }} />;
      }
    }

    // ---------- medical & health portals ----------
    if (phase === "medical") {
      if (sub === 0) {
        return <PickMany key="medpick" q="Do you use any medical or health websites?"
          hint="Patient portals, pharmacy accounts, insurance member sites — separate from the insurance policy itself, this is about logging in."
          options={["Patient portal (MyChart, etc.)", "Pharmacy account", "Insurance member portal", "Medicare.gov account"]}
          otherLabel="+ Something else" otherQ="Which one?" otherPlaceholder="my eye doctor's portal"
          onNext={(sel) => {
            if (!sel.length) { next("government"); return; }
            setMedical(sel.map((n, i) => ({ name: n, code: "H" + (i + 1), cat: "H" })));
            setBillIdx(0); setSub(1);
          }} />;
      }
      if (sub === 1) {
        const m = medical[billIdx];
        if (!m) { next("government"); return null; }
        return <SignIn key={"hsi" + m.code} label={m.name} emails={emails} deviceName={device1?.name}
          onDone={(res) => {
            setMedical((list) => list.map((x, i) => (i === billIdx ? { ...x, ...res } : x)));
            if (billIdx + 1 < medical.length) setBillIdx(billIdx + 1);
            else next("government");
          }} />;
      }
    }

    // ---------- government & benefits accounts ----------
    if (phase === "government") {
      if (sub === 0) {
        return <PickMany key="govpick" q="Do you use any government or benefits websites?"
          hint="Mainly useful if someone needs to help manage things while you're still here, not just afterward."
          options={["Social Security (ssa.gov)", "VA.gov", "IRS online account", "State DMV"]}
          otherLabel="+ Something else" otherQ="Which one?" otherPlaceholder="my state unemployment account"
          onNext={(sel) => {
            if (!sel.length) { next("vault"); return; }
            setGovernment(sel.map((n, i) => ({ name: n, code: "A" + (i + 1), cat: "A" })));
            setBillIdx(0); setSub(1);
          }} />;
      }
      if (sub === 1) {
        const g = government[billIdx];
        if (!g) { next("vault"); return null; }
        return <SignIn key={"gsi" + g.code} label={g.name} emails={emails} deviceName={device1?.name}
          onDone={(res) => {
            setGovernment((list) => list.map((x, i) => (i === billIdx ? { ...x, ...res } : x)));
            if (billIdx + 1 < government.length) setBillIdx(billIdx + 1);
            else next("vault");
          }} />;
      }
    }

    // ---------- password manager ----------
    if (phase === "vault") {
      if (sub === 0) {
        return <PickOne key="v" q="Where do your passwords live now?"
          hint="An app like 1Password, or passwords your browser saves and fills in for you — that counts too."
          options={[
            { label: "1Password" }, { label: "Bitwarden" }, { label: "LastPass" },
            { label: "Saved in my browser" }, { label: "A notebook or paper" },
          ]}
          otherLabel="+ Something else" otherQ="What's it called?" otherPlaceholder="Keeper"
          skip="Only in my head"
          onPick={(v) => {
            if (v === null || v === "A notebook or paper") { next("safes"); return; }
            setDraft({ name: v }); setSub(1);
          }} />;
      }
      if (sub === 1) {
        return <PickOne key="vem" q={`Has someone been given emergency access to ${draft.name}?`}
          hint="Some password apps let a person you name request entry if something happens to you."
          options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Not sure", value: null }]}
          onPick={(v) => {
            setVaults([{ ...draft, emergency: v, code: "V1", cat: "V" }]);
            setDraft(null); next("safes");
          }} />;
      }
    }

    // ---------- safes ----------
    if (phase === "safes") {
      if (sub === 0) {
        return <PickOne key={"sf" + safes.length}
          q={safes.length ? "Any other safe or lockbox?" : "Do you have a safe or lockbox?"}
          hint={safes.length ? null : "The physical places where important things are locked away — including where your Password List will live."}
          options={[
            { label: "Fireproof box" }, { label: "Gun safe" }, { label: "Wall or floor safe" },
            { label: "Safe deposit box at the bank" }, { label: "A locked drawer or cabinet" },
          ]}
          otherLabel="+ Something else" otherQ="What is it?" otherPlaceholder="lockbox in the barn"
          skip={safes.length ? "That's all of them" : "No / skip"}
          onPick={(v) => { if (v === null) { next("legacy"); return; } setDraft({ name: v }); setSub(1); }} />;
      }
      if (sub === 1) {
        if (draft.name === "Safe deposit box at the bank") {
          return <TypeIn key="sfbank" q="Which bank is it at?"
            hint="So your trusted person knows where to go — this box may be sealed at death until the bank sorts it out, so it helps to know early."
            placeholder="First Bank of Tennessee" skipLabel="Skip this"
            initial={draft.bank || ""}
            onSave={(v) => { setDraft({ ...draft, name: v ? `Safe deposit box — ${v}` : draft.name, bank: v }); setSub(2); }} />;
        }
        return <PickOne key="sfwhere" q={`Where is the ${draft.name}?`}
          options={[
            { label: "Bedroom closet" }, { label: "Home office" }, { label: "Basement" }, { label: "Garage" },
          ]}
          otherLabel="+ Somewhere else" otherQ="Where is it?" otherPlaceholder="hall closet, top shelf"
          skip="Skip this"
          onPick={(v) => { setDraft({ ...draft, name: v ? `${draft.name} — ${v}` : draft.name }); setSub(2); }} />;
      }
      if (sub === 2) {
        return <PickOne key="sfopen" q="How does it open?"
          options={[{ label: "A combination", value: "combination" }, { label: "A key", value: "key" }, { label: "Both", value: "both" }]}
          onPick={(v) => { setDraft({ ...draft, opens: v }); setSub(v === "combination" ? 4 : 3); }} />;
      }
      if (sub === 3) {
        return <PickOne key="sfkey" q="Where is the key kept?"
          hint="This is the one secret that's a hiding place, not a password."
          options={[
            { label: "On my keyring" }, { label: "Top desk drawer" }, { label: "Kitchen drawer" },
            { label: "My trusted person has one" },
          ]}
          otherLabel="+ Somewhere else" otherQ="Where's the key?" otherPlaceholder="under the jewelry box"
          skip="Skip this"
          onPick={(v) => { setDraft({ ...draft, keyWhere: v }); setSub(4); }} />;
      }
      if (sub === 4) {
        return <PickMany key="sfin" q={`What's inside the ${draft.name}?`}
          options={["Will", "Deed or car title", "Birth certificate", "Jewelry or valuables", "Cash", "My Password List"]}
          otherLabel="+ Something else" otherQ="What else is inside?" otherPlaceholder="coin collection"
          onNext={(sel) => {
            setSafes((p) => [...p, { ...draft, inside: sel, code: "L" + (p.length + 1), cat: "L" }]);
            setDraft(null); setSub(0);
          }} />;
      }
    }

    // ---------- legacy ----------
    if (phase === "legacy") {
      return (
        <Ask q="Have you set up any of these?"
          hint="Apple, Google, and Facebook each let you name a person ahead of time who's allowed in if something happens to you.">
          <div className="mb-5 grid gap-3">
            {LEGACY.map((l) => (
              <Chip key={l} multi active={legacy.includes(l)} onClick={() =>
                setLegacy((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]))
              }>
                {l}
              </Chip>
            ))}
          </div>
          {legacy.length === 0 && (
            <p className="mb-4 text-lg font-bold" style={{ color: GOLD }}>
              None yet? That's common — Tech Ease can help you set these up. It goes on your map as a to-do.
            </p>
          )}
          <Btn kind="go" onClick={() => next("map")}>Show me my map</Btn>
        </Ask>
      );
    }

    // ---------- map / password sheet / finish / packet ----------
    if (phase === "map") {
      return (
        <Ask q="Look at that — your digital life, on one map.">
          <div className="mb-4 rounded-2xl p-3" style={{ background: "#fff", border: `3px solid ${GREEN}` }}>
            <MapView />
          </div>
          <div className="mb-4 flex flex-wrap gap-4 text-lg font-bold" style={{ color: INK2 }}>
            <span><span style={{ color: GREEN_DK }}>——</span> signs in with</span>
            <span><span style={{ color: GOLD }}>- - -</span> pays for</span>
          </div>
          {hubEdges > 0 && (
            <div className="mb-5 rounded-2xl p-4 text-xl font-bold leading-snug" style={{ background: PANEL, color: NAVY, border: `2px solid ${GREEN}` }}>
              If {email1.name} were closed today, {hubEdges} thing{hubEdges > 1 ? "s" : ""} on this map would break. That's why email always closes <u>last</u>.
            </div>
          )}
          <Btn kind="go" onClick={() => next("pwsheet")}>Make my password sheet</Btn>
        </Ask>
      );
    }

    if (phase === "pwsheet") {
      return (
        <Ask q="Your Password Sheet — ready for your pen."
          hint={`The codes are filled in. The passwords are not — those you write by hand, and this sheet gets locked away. Accounts that let you in without a password have no line here. Your packet says which account each code belongs to — that's on purpose.`}>
          <div className="mb-5 overflow-hidden rounded-2xl" style={{ border: `2px solid ${RULE}` }}>
            <div className="px-4 py-3" style={{ background: "#FBF1D6", borderBottom: `3px solid ${GOLD}` }}>
              <p className="text-lg font-bold" style={{ color: NAVY }}>MY PASSWORD LIST — LOCK THIS SHEET AWAY</p>
            </div>
            <div style={{ background: "#fff" }}>
              {pwRows.map((r, i) => (
                <div key={r.code + i} className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "#e3e0d6" }}>
                  <span className="rounded-lg px-2 py-0.5 text-lg font-bold" style={{ background: PANEL, color: GREEN_DK, border: `2px solid ${GREEN}` }}>{r.code}</span>
                  <span className="ml-auto flex-1" style={{ borderBottom: "2px solid #9AA6C4", height: 22, minWidth: 80 }} />
                </div>
              ))}
              {pwRows.length === 0 && <p className="px-4 py-4 text-lg" style={{ color: INK2 }}>Nothing needs a password row yet.</p>}
            </div>
          </div>
          <h2 className="mb-3 text-3xl font-bold" style={{ color: NAVY }}>Where will you keep it?</h2>
          <div className="mb-5 grid gap-3">
            {[...safes.map((s) => s.name), "With my will", "Somewhere else safe"].map((loc) => (
              <Chip key={loc} active={pwLocation === loc} onClick={() => setPwLocation(loc)}>
                {loc}
              </Chip>
            ))}
          </div>
          <h2 className="mb-3 text-3xl font-bold" style={{ color: NAVY }}>Does a copy of this whole packet exist anywhere else?</h2>
          <p className="mb-4 text-xl leading-relaxed" style={{ color: INK2 }}>One paper original can be lost to a fire, a flood, or just misplaced. A second copy — even a photo of each page — is good insurance.</p>
          <div className="mb-5 grid gap-3">
            {["Yes, my trusted person has a copy", "Yes, it's with my will or attorney", "Not yet — I should make one", "No, and that's okay"].map((opt) => (
              <Chip key={opt} active={packetBackup === opt} onClick={() => setPacketBackup(opt)}>
                {opt}
              </Chip>
            ))}
          </div>
          <Btn kind="go" onClick={() => next("finish")}>Finish up</Btn>
        </Ask>
      );
    }

    if (phase === "packet") {
      return (
        <div>
          <div className="no-print">
            <Ask q="Here's your packet — ready to print."
              hint="Tap Print and your browser will put one sheet per page. The Password List prints with blanks — those are for your pen only.">
              <div className="mb-6 grid gap-3">
                <Btn kind="go" onClick={() => window.print && window.print()}>Print this packet</Btn>
                <Btn kind="ghost" onClick={() => (firstRunDone ? hubGo({ screen: "home" }) : next("finish"))}>Back</Btn>
              </div>
            </Ask>
          </div>
          <PacketView />
        </div>
      );
    }

    if (phase === "finish") {
      return (
        <Ask q={`Your map is ready${trusted ? `, and ${trusted} will thank you` : ""}.`}>
          <div className="mb-5 rounded-2xl p-5" style={{ background: "#fff", border: `3px solid ${NAVY}` }}>
            {trusted && <p className="mb-2 text-xl font-bold" style={{ color: NAVY }}>This map is for: {trusted}</p>}
            {pwLocation && <p className="mb-2 text-xl font-bold" style={{ color: NAVY }}>Password List lives: {pwLocation}</p>}
            <p className="mb-3 text-xl font-bold" style={{ color: NAVY }}>
              Legacy contacts: {legacy.length ? legacy.join(", ") : "none yet — a good next visit with Tech Ease"}
            </p>
            {CAT_ORDER.map((c) => byCat(c).map((n) => (
              <p key={n.code} className="mb-1 text-lg font-bold" style={{ color: NAVY }}>
                <span className="mr-2 inline-block rounded-lg px-2 py-0.5 text-base font-bold"
                  style={{ background: PANEL, color: GREEN_DK, border: `2px solid ${GREEN}` }}>{n.code}</span>
                {n.name}
                {n.username ? <span style={{ color: INK2 }}> — username: {n.username}</span> : null}
                {n.method === "passkey" ? <span style={{ color: GREEN_DK }}> — no password needed</span> : null}
              </p>
            )))}
            {all.length === 0 && <p className="text-xl" style={{ color: INK2 }}>Nothing added this time.</p>}
          </div>
          <div className="grid gap-3">
            <Btn onClick={() => hubGo({ screen: "home" })}>Open My Map — update anything, any time</Btn>
            <Btn kind="ghost" onClick={() => next("packet")}>See my printable packet</Btn>
            <Btn kind="ghost" onClick={reset}>Erase everything — leave no trace</Btn>
          </div>
        </Ask>
      );
    }
    return null;
  }

  const PHASE_LABEL = {
    welcome: "Welcome", trusted: "Welcome", devices: "Devices", emails: "Email", carrier: "Phone",
    banks: "Banking", cards: "Cards", payments: "Payment apps", bills: "Bills", socials: "Social",
    photos: "Photos", purchases: "Books & movies", medical: "Medical", government: "Government",
    vault: "Passwords", safes: "Safes", legacy: "Legacy", map: "Your Map",
    pwsheet: "Password Sheet", packet: "Printing", finish: "Finish", hub: "My Map",
  };
  const seqIdx = PHASE_SEQ.indexOf(phase);
  const idxOf = (p) => PHASE_SEQ.indexOf(p);
  const stepNo = STEPS.findIndex((x) => x.phase === phase) + 1;
  const pct = firstRunDone ? 100 : stepNo > 0 ? Math.round((stepNo / STEPS.length) * 100) : seqIdx > idxOf("legacy") ? 100 : 0;
  const overlayOpen = !!(saveOpen || loadFileText);
  const canSave = phase !== "welcome" && !overlayOpen;
  const openSave = () => { setMenuOpen(false); setSaveOpen(true); };

  const rail = (
    <aside id="nl-rail" className={`nl-rail no-print${menuOpen ? " open" : ""}`} aria-label="Your steps and your map">
      <div className="nl-railhead">
        <LogoMark size={42} />
        <div className="nl-brand">
          <span>NetLegacy<sup>™</sup></span>
          <small>Digital Life Map</small>
        </div>
        <button className="nl-close" onClick={() => setMenuOpen(false)} aria-label="Close the menu"><IconClose size={22} sw={2.4} /></button>
      </div>
      {firstRunDone ? (
        <nav aria-label="My Map menu">
          <ol className="nl-steps">
            <li>
              <button className="nl-step" data-state={phase === "hub" && hubView.screen === "home" && !hubView.group ? "current" : "menu"}
                onClick={() => hubGo({ screen: "home" })}><span className="nl-dot" />My Map home</button>
            </li>
            {GROUPS.filter((g) => g.id !== "map").map((g) => {
              const hubCatNow = phase === "hub" ? (hubView.cat || (hubView.code && entryOf(hubView.code) ? entryOf(hubView.code).cat : null)) : null;
              const curId = phase === "hub" ? (hubView.group || Object.keys(GROUP_CATS).find((id) => GROUP_CATS[id].includes(hubCatNow))) : null;
              const cur = curId === g.id;
              return (
                <li key={g.id}>
                  <button className="nl-step" data-state={cur ? "current" : "menu"} onClick={() => hubGo({ screen: "home", group: g.id })}>
                    <span className="nl-dot" />{g.label}
                  </button>
                  {cur && (
                    <ul className="nl-sub">
                      {GROUP_CATS[g.id].map((c) => (
                        <li key={c} data-state={hubCatNow === c ? "current" : countOf(c) > 0 ? "done" : "todo"}>
                          <button onClick={() => hubGo({ screen: "cat", cat: c })}>{catTitle(c)}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            <li>
              <button className="nl-step" data-state={phase === "hub" && hubView.screen === "map" ? "current" : "menu"} onClick={() => hubGo({ screen: "map" })}><span className="nl-dot" />My map picture</button>
            </li>
            <li>
              <button className="nl-step" data-state={phase === "packet" ? "current" : "menu"} onClick={() => { setPhase("packet"); setMenuOpen(false); }}><span className="nl-dot" />Print my packet</button>
            </li>
          </ol>
        </nav>
      ) : (
      <nav aria-label="Your steps">
        <ol className="nl-steps">
          {GROUPS.map((g) => {
            const first = Math.min(...g.phases.map(idxOf)), last = Math.max(...g.phases.map(idxOf));
            const st = seqIdx > last ? "done" : seqIdx >= first ? "current" : "todo";
            return (
              <li key={g.id}>
                <div className="nl-step" data-state={st} aria-current={st === "current" && g.flat ? "step" : undefined}>
                  <span className="nl-dot"><IconCheck size={14} sw={3.4} /></span>{g.label}
                </div>
                {st === "current" && !g.flat && (
                  <ul className="nl-sub">
                    {g.phases.map((p) => {
                      const si = idxOf(p);
                      const s2 = seqIdx > si ? "done" : seqIdx === si ? "current" : "todo";
                      return <li key={p} data-state={s2} aria-current={s2 === "current" ? "step" : undefined}>{STEPS.find((x) => x.phase === p).label}</li>;
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      )}
      <div className="nl-railfoot">
        {all.length > 0 && stepNo > 0 && !firstRunDone && (
          <div className="nl-railmap"><p>Your map so far</p><MapView compact dark /></div>
        )}
        {firstRunDone && dirty && <p className="nl-unsaved">Unsaved changes. Save a new file before you close this page.</p>}
        {canSave && (
          <button className="nl-savebtn" onClick={openSave}><IconSave size={22} /> Save &amp; continue later</button>
        )}
        <p className="nl-help">Nothing leaves this device. No account passwords, ever.</p>
        <p className="nl-help"><b>Stuck? Call Tech Ease:<br /><span style={{ whiteSpace: "nowrap" }}>865-245-9811</span></b><br />Tell us you're on the “{PHASE_LABEL[phase]}” step.</p>
      </div>
    </aside>
  );

  return (
    <div className="nl-app" style={{ background: GROUND, color: NAVY, fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif" }}>
      <style>{NL_CSS}</style>

      <header className="nl-topbar no-print">
        <div className="nl-toprow">
          <button className="nl-iconbtn" onClick={() => setMenuOpen(true)} aria-label="Open your steps and your map"
            aria-expanded={menuOpen} aria-controls="nl-rail"><IconMenu size={24} sw={2.2} /></button>
          <div className="nl-toptitle"><span>{PHASE_LABEL[phase]}</span>{stepNo > 0 && <small>Step {stepNo} of {STEPS.length}</small>}</div>
          {canSave
            ? <button className="nl-iconbtn" onClick={openSave} aria-label="Save and continue later"><IconSave size={24} /></button>
            : <span className="nl-iconbtn nl-ghosted" aria-hidden="true" />}
        </div>
        <div className="nl-prog"><i style={{ width: `${pct}%` }} /></div>
      </header>

      {menuOpen && <div className="nl-scrim no-print" onClick={() => setMenuOpen(false)} />}

      <div className="nl-body">
        {rail}
        <main className="nl-main">
          <div className="nl-wrap">
            {stepNo > 0 && !overlayOpen && <p className="nl-stepline no-print">Step {stepNo} of {STEPS.length}</p>}
            <div className="nl-sheet">
              {loadFileText ? (
                <ResumeOverlay
                  loadPass={loadPass} setLoadPass={setLoadPass} loadError={loadError} loadBusy={loadBusy}
                  showPass={showPass} setShowPass={setShowPass}
                  onResume={doResume}
                  onCancel={() => { setLoadFileText(null); setLoadPass(""); setLoadError(null); setShowPass(false); }}
                />
              ) : saveOpen ? (
                <SaveOverlay
                  savePass={savePass} setSavePass={setSavePass} savePass2={savePass2} setSavePass2={setSavePass2}
                  saveBusy={saveBusy} saveDone={saveDone} showPass={showPass} setShowPass={setShowPass}
                  onSave={doSave}
                  onCancel={() => { setSaveOpen(false); setSavePass(""); setSavePass2(""); setShowPass(false); }}
                  onDone={() => { setSaveOpen(false); setSaveDone(false); setSavePass(""); setSavePass2(""); setShowPass(false); }}
                />
              ) : (
                <>
                  {canGoBack && (
                    <button onClick={goBack} className="nl-back no-print"><IconBack size={22} sw={2.4} /> Back</button>
                  )}
                  {screen()}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
