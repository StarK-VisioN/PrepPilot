import { useContext } from "react";
import hero_img from "../assets/hero-img.png";
import {
  PHASE1_FEATURES,
  PHASE2_FEATURES,
  PHASE3_FEATURES,
  PHASE4_FEATURES,
  PHASE5_FEATURES,
  APP_FEATURES,
} from "../utils/data.js";
import {
  LuArrowRight,
  LuTarget,
  LuCode,
  LuMessageSquare,
  LuMic,
  LuChartBar,
  LuChevronRight,
  LuCheck,
} from "react-icons/lu";
import { UserContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const COMPANY_CHIPS = ["Google", "Amazon", "Microsoft", "Netflix", "Uber", "Startup"];

const QUICK_MODULES = [
  { id: "qa", label: "Q&A Prep", icon: LuTarget, action: "prep" },
  { id: "coding", label: "Coding", icon: LuCode, action: "coding" },
  { id: "behavioral", label: "Behavioral", icon: LuMessageSquare, action: "behavioral" },
  { id: "mock", label: "Mock Interview", icon: LuMic, action: "mock" },
  { id: "analytics", label: "Analytics", icon: LuChartBar, action: "analytics" },
];

const EXTRA_TOOLS = [
  ...PHASE2_FEATURES.map((f) => ({ ...f, onClick: "coding" })),
  ...PHASE3_FEATURES.map((f) => ({ ...f, onClick: "behavioral" })),
  ...PHASE4_FEATURES.map((f) => ({ ...f, onClick: "mock" })),
  ...PHASE5_FEATURES.map((f) => ({ ...f, onClick: "analytics" })),
];

const STEPS = [
  { step: "1", title: "Pick a mode", desc: "JD, resume, company, or manual prep" },
  { step: "2", title: "AI generates Q&A", desc: "Questions matched to your inputs" },
  { step: "3", title: "Practice & improve", desc: "Review, pin, and learn deeper" },
];

const CTA_HIGHLIGHTS = [
  {
    title: "Personalized Q&A",
    desc: "Questions from your resume, job description, or target company",
  },
  {
    title: "Coding practice",
    desc: "Monaco editor, visible test cases, and submission history",
  },
  {
    title: "STAR behavioral scoring",
    desc: "AI feedback on Situation, Task, Action, and Result",
  },
  {
    title: "Live mock interviews",
    desc: "Dynamic follow-ups with detailed feedback reports",
  },
  {
    title: "Weakness analytics",
    desc: "ATS resume insights and a personalized learning roadmap",
  },
];

const CTA_TRUST_POINTS = [
  "Free to start — no credit card",
  "Google sign-in supported",
  "Practice across 5 modules in one place",
];

const BTN_PRIMARY =
  "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors inline-flex items-center gap-2";
const BTN_SECONDARY =
  "bg-white text-blue-700 font-semibold rounded-full border-2 border-blue-600 hover:bg-blue-50 transition-colors";
const CARD = "bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow";

const PrepModeCard = ({ feature, onStart }) => {
  return (
    <button type="button" onClick={onStart} className={`group relative w-full text-left p-5 sm:p-6 ${CARD} flex flex-col h-full`}>
      {feature.badge && (
        <span className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          {feature.badge}
        </span>
      )}

      <h3 className={`text-lg font-bold text-black mb-1.5 ${feature.badge ? "pr-12" : ""}`}>{feature.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">{feature.description}</p>

      {feature.highlightCompany && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {COMPANY_CHIPS.map((name) => (
            <span
              key={name}
              className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <span className={`text-sm px-4 py-2 ${BTN_PRIMARY} w-fit`}>
        {feature.cta}
        <LuArrowRight size={14} />
      </span>
    </button>
  );
};

const ToolCard = ({ feature, onClick }) => {
  return (
    <button type="button" onClick={onClick} className={`group relative w-full text-left p-5 ${CARD}`}>
      {feature.badge && (
        <span className="absolute top-5 right-5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
          {feature.badge}
        </span>
      )}
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold text-black mb-0.5 ${feature.badge ? "pr-12" : ""}`}>{feature.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{feature.description}</p>
        </div>
        <LuChevronRight size={18} className="shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </button>
  );
};

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const startPrep = ({ mode, company = "generic" }) => {
    const intent = { openCreate: true, generationMode: mode, company };

    if (!user) {
      sessionStorage.setItem("createSessionIntent", JSON.stringify(intent));
      toast.info("Sign in to start your personalized prep session");
      navigate("/login");
      return;
    }

    navigate("/dashboard", { state: intent });
  };

  const handleGetStarted = () => startPrep({ mode: "manual" });

  const requireAuth = (key, message, path) => {
    if (!user) {
      sessionStorage.setItem(key, "true");
      toast.info(message);
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const startCoding = () =>
    requireAuth("codingIntent", "Sign in to access the Coding Round Simulator", "/coding");
  const startBehavioral = () =>
    requireAuth("behavioralIntent", "Sign in to access STAR Behavioral Practice", "/behavioral");
  const startMockInterview = () =>
    requireAuth("mockInterviewIntent", "Sign in to access AI Mock Interview", "/mock-interview");
  const startAnalytics = () =>
    requireAuth("analyticsIntent", "Sign in to access Weakness Analytics", "/analytics");

  const toolActions = {
    coding: startCoding,
    behavioral: startBehavioral,
    mock: startMockInterview,
    analytics: startAnalytics,
  };

  const handleQuickModule = (action) => {
    if (action === "prep") {
      document.getElementById("prep-modes")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    toolActions[action]?.();
  };

  return (
    <div className="pb-20 relative">
      <div className="relative z-10 w-full">
        {/* Hero */}
        <section className="pt-20 pb-12 lg:pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <div className="w-full lg:w-[48%] space-y-6 text-center lg:text-left">
              {/* <span className="inline-flex items-center gap-2 text-sm text-blue-700 font-semibold bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                <LuSparkles className="text-base" />
                AI Powered Interview Prep
              </span> */}

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[0.95] text-black">
                Your interview prep, tailored to you
              </h1>

              <p className="text-base sm:text-lg leading-[1.3] text-gray-700 max-w-lg mx-auto lg:mx-0">
                Upload your resume, paste a job description, or pick a company style - then practice
                with coding, behavioral, mock interviews, and analytics.
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  type="button"
                  className={`${BTN_PRIMARY} text-base px-7 py-3 shadow-md shadow-blue-600/20`}
                  onClick={handleGetStarted}
                >
                  Get Started Free
                  <LuArrowRight className="w-5 h-5" />
                </button>
                {user ? (
                  <button
                    type="button"
                    className={`${BTN_SECONDARY} text-base px-7 py-3`}
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${BTN_SECONDARY} text-base px-7 py-3`}
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                )}
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Jump to a module
                </p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {QUICK_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleQuickModule(mod.action)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full transition-all"
                      >
                        <Icon size={15} className="text-blue-600" />
                        {mod.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[52%]">
              <div className="relative">
                <div className="absolute -inset-6 sm:-inset-8 bg-gradient-to-br from-orange-200/40 via-violet-200/30 to-blue-200/30 rounded-[2rem] blur-3xl" />
                <div className="relative bg-white p-3 sm:p-4 rounded-3xl border border-gray-200 shadow-lg">
                  <img
                    src={hero_img}
                    alt="Interview preparation dashboard preview"
                    className="w-full rounded-2xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-14">
          <div className={`rounded-2xl p-5 sm:p-6 ${CARD}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center"
                >
                  <div className="shrink-0 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div className="sm:mt-1">
                    <h3 className="font-bold text-black text-sm mb-0.5">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 1 — Prep modes */}
        <section id="prep-modes" className="mb-14 scroll-mt-6">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Choose Your Prep Mode</h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl">
              Start with personalized Q&A — pick how you want questions generated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {PHASE1_FEATURES.map((feature) => (
              <PrepModeCard
                key={feature.id}
                feature={feature}
                onStart={() =>
                  startPrep({
                    mode: feature.mode,
                    company: feature.highlightCompany ? "google" : "generic",
                  })
                }
              />
            ))}
          </div>
        </section>

        {/* Phases 2–5 */}
        <section id="more-tools" className="mb-14 scroll-mt-6">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">More Practice Tools</h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl">
              Coding challenges, behavioral STAR scoring, live mock interviews, and weakness analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {EXTRA_TOOLS.map((feature) => (
              <ToolCard
                key={feature.id}
                feature={feature}
                onClick={toolActions[feature.onClick]}
              />
            ))}
          </div>
        </section>

        {/* Platform features */}
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Built Into Every Session</h2>
            <p className="text-sm text-gray-600">Everything you need to study smarter.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {APP_FEATURES.map((feature) => (
              <div key={feature.id} className={`p-5 ${CARD}`}>
                <h3 className="font-bold text-black text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 sm:p-10 lg:p-12">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                All-in-one interview prep
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight mb-4">
                Stop practicing generic questions.
                <span className="block text-blue-600 mt-1">Start prepping for your role.</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                {user
                  ? "Pick up where you left off, launch a new session, or jump into coding, behavioral, mock interview, and analytics modules from your dashboard."
                  : "Upload your resume or paste a job description — Interview Prep AI builds a practice plan across technical Q&A, coding rounds, behavioral interviews, mock sessions, and performance analytics."}
              </p>

              <ul className="space-y-2.5 mb-8 text-left max-w-md mx-auto lg:mx-0">
                {CTA_TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <LuCheck size={12} strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => (user ? navigate("/dashboard") : handleGetStarted())}
                  className={`${BTN_PRIMARY} text-base px-7 py-3 shadow-md shadow-blue-600/20`}
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                  <LuArrowRight size={18} />
                </button>
                {!user && (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className={`${BTN_SECONDARY} text-base px-7 py-3`}
                  >
                    Sign In
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => document.getElementById("prep-modes")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-3 transition-colors"
                >
                  Explore prep modes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-center">
              {CTA_HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                >
                  <h3 className="text-sm font-bold text-black mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
