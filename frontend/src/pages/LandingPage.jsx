import { useContext } from "react";
import hero_img from "../assets/hero-img.png";
import { PHASE1_FEATURES, COMING_SOON_FEATURES, APP_FEATURES } from "../utils/data.js";
import {
  LuArrowRight,
  LuSparkles,
  LuFileText,
  LuUser,
  LuBuilding2,
  LuTarget,
  LuClock,
} from "react-icons/lu";
import { UserContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FEATURE_ICONS = {
  jd: LuFileText,
  resume: LuUser,
  company: LuBuilding2,
  manual: LuTarget,
};

const COMPANY_CHIPS = ["Google", "Amazon", "Microsoft", "Netflix", "Uber", "Startup"];

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

  return (
    <div className="pb-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Hero */}
        <section className="flex flex-col lg:flex-row items-center justify-between mb-24 pt-4 min-h-[75vh]">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0 space-y-8">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="flex items-center gap-2 text-sm text-amber-700 font-semibold bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                <LuSparkles className="text-lg" />
                AI Powered
              </span>
              {/* <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200">
                Phase 1 — Personalized Prep
              </span> */}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center lg:text-left text-gray-900">
              Your interview prep,
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                tailored to you
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-xl text-center lg:text-left">
              Upload your resume, paste a job description, or pick a company interview
              style — get AI-generated questions that match what you&apos;ll actually face.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button
                className="bg-orange-500 text-white font-semibold text-base px-7 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 group"
                onClick={handleGetStarted}
              >
                Get Started Free
                <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="bg-white/80 text-gray-800 font-semibold text-base px-7 py-3 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-white transition-all"
                onClick={() =>
                  document.getElementById("prep-modes")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Prep Modes
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <div className="relative bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-2xl">
              <img
                src={hero_img}
                alt="Interview preparation"
                className="w-full rounded-2xl object-cover border border-purple-200/50"
              />
            </div>
          </div>
        </section>

        {/* Phase 1 — direct access */}
        <section id="prep-modes" className="mb-24 scroll-mt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Choose Your Prep Mode
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              New in Phase 1 — pick how you want questions generated, then jump straight into a session.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-purple-600 rounded-full mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PHASE1_FEATURES.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon] || LuSparkles;
              return (
                <div
                  key={feature.id}
                  className="group relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="text-white text-2xl" />
                    </div>
                    {feature.badge && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                    {feature.description}
                  </p>

                  {feature.highlightCompany && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {COMPANY_CHIPS.map((name) => (
                        <span
                          key={name}
                          className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      startPrep({
                        mode: feature.mode,
                        company: feature.highlightCompany ? "google" : "generic",
                      })
                    }
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 transition-opacity`}
                  >
                    {feature.cta}
                    <LuArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Pick a mode", desc: "JD, resume, company style, or classic manual prep." },
              { step: "2", title: "AI generates Q&A", desc: "Groq-powered questions matched to your inputs." },
              { step: "3", title: "Practice & learn", desc: "Review answers, pin questions, and use Learn More." },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center bg-white/60 rounded-2xl p-6 border border-white/50"
              >
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core platform features */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Built Into Every Session
            </h2>
            <p className="text-gray-600">Everything you need to study smarter, not harder.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {APP_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-md"
              >
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <section className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">The roadmap for your complete interview platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMING_SOON_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="relative bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-dashed border-gray-300 opacity-90"
              >
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <LuClock size={10} />
                  Soon
                </span>
                <h3 className="font-bold text-gray-800 text-sm mb-2 pr-12">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 sm:p-14 text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to prep smarter?</h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            {user
              ? "Jump to your dashboard and start a JD, resume, or company-specific session."
              : "Create a free account and generate your first personalized session in minutes."}
          </p>
          <button
            onClick={() => (user ? navigate("/dashboard") : navigate("/login"))}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full inline-flex items-center gap-2 transition-colors"
          >
            {user ? "Go to Dashboard" : "Sign In to Start"}
            <LuArrowRight size={18} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
