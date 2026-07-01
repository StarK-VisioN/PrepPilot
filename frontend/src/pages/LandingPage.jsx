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
  LuSparkles,
  LuFileText,
  LuUser,
  LuBuilding2,
  LuTarget,
  LuCode,
  LuMessageSquare,
  LuMic,
  LuChartBar,
  LuChevronRight,
} from "react-icons/lu";
import { UserContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FEATURE_ICONS = {
  jd: LuFileText,
  resume: LuUser,
  company: LuBuilding2,
  manual: LuTarget,
  coding: LuCode,
  behavioral: LuMessageSquare,
  "mock-interview": LuMic,
  analytics: LuChartBar,
};

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

const GLASS_CARD =
  "bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-200";
const GLASS_PANEL = "bg-white/[0.03] backdrop-blur-md border border-white/[0.07]";

const PrepModeCard = ({ feature, onStart }) => {
  const Icon = FEATURE_ICONS[feature.icon] || LuSparkles;

  return (
    <button
      type="button"
      onClick={onStart}
      className={`group w-full text-left p-5 sm:p-6 rounded-2xl ${GLASS_CARD} flex flex-col h-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
        >
          <Icon className="text-white text-xl" />
        </div>
        {feature.badge && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {feature.badge}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">{feature.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-4 flex-grow">{feature.description}</p>

      {feature.highlightCompany && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {COMPANY_CHIPS.map((name) => (
            <span
              key={name}
              className="text-[10px] font-medium text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <span
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-full bg-gradient-to-r ${feature.gradient} w-fit group-hover:opacity-90 transition-opacity`}
      >
        {feature.cta}
        <LuArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </span>
    </button>
  );
};

const ToolCard = ({ feature, onClick }) => {
  const Icon = FEATURE_ICONS[feature.icon] || LuSparkles;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left p-5 rounded-2xl ${GLASS_CARD}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`shrink-0 w-11 h-11 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
        >
          <Icon className="text-white text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-bold text-white">{feature.title}</h3>
            {feature.badge && (
              <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-md border border-violet-500/20">
                {feature.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{feature.description}</p>
        </div>
        <LuChevronRight
          size={18}
          className="shrink-0 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all"
        />
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
        <section className="pt-2 pb-12 lg:pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <div className="w-full lg:w-[48%] space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 text-sm text-orange-300 font-semibold bg-orange-500/15 px-4 py-2 rounded-full border border-orange-400/25">
                <LuSparkles className="text-base" />
                AI Powered Interview Prep
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] text-white">
                Your interview prep,{" "}
                <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">
                  tailored to you
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Upload your resume, paste a job description, or pick a company style — then practice
                with coding, behavioral, mock interviews, and analytics.
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  type="button"
                  className="bg-orange-500 text-white font-semibold text-base px-7 py-3 rounded-full shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition-all inline-flex items-center gap-2 group"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                  <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {user ? (
                  <button
                    type="button"
                    className="bg-white/5 text-slate-200 font-semibold text-base px-7 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-white/5 text-slate-200 font-semibold text-base px-7 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                )}
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
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
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.15] px-4 py-2 rounded-full transition-all"
                      >
                        <Icon size={15} className="text-orange-400" />
                        {mod.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[52%]">
              <div className="relative">
                <div className="absolute -inset-6 sm:-inset-8 bg-gradient-to-br from-orange-500/20 via-violet-500/15 to-cyan-500/10 rounded-[2rem] blur-3xl opacity-80" />
                <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.04] backdrop-blur-sm p-3 sm:p-4 rounded-3xl border border-white/15 shadow-2xl shadow-violet-950/40">
                  <img
                    src={hero_img}
                    alt="Interview preparation dashboard preview"
                    className="w-full rounded-2xl object-cover ring-1 ring-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-14">
          <div className={`rounded-2xl p-5 sm:p-6 ${GLASS_PANEL}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center"
                >
                  <div className="shrink-0 w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div className="sm:mt-1">
                    <h3 className="font-bold text-white text-sm mb-0.5">{item.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 1 — Prep modes */}
        <section id="prep-modes" className="mb-14 scroll-mt-6">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Choose Your Prep Mode
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              More Practice Tools
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
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
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Built Into Every Session
            </h2>
            <p className="text-sm text-slate-300">Everything you need to study smarter.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {APP_FEATURES.map((feature) => (
              <div key={feature.id} className={`p-5 rounded-2xl ${GLASS_PANEL}`}>
                <h3 className="font-bold text-white text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className={`text-center rounded-3xl p-8 sm:p-12 ${GLASS_PANEL}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to prep smarter?</h2>
          <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-md mx-auto">
            {user
              ? "Head to your dashboard to continue sessions or try a new practice module."
              : "Create a free account and generate your first session in minutes."}
          </p>
          <button
            type="button"
            onClick={() => (user ? navigate("/dashboard") : handleGetStarted())}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full inline-flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
            <LuArrowRight size={18} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
