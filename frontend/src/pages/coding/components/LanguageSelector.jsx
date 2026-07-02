import { CODING_LANGUAGES } from "../../../utils/codingLanguages";

const LanguageSelector = ({
  value,
  onChange,
  supportedLanguages,
  runtimes = {},
  disabled = false,
  variant = "light",
}) => {
  const options = CODING_LANGUAGES.filter(
    (lang) => !supportedLanguages?.length || supportedLanguages.includes(lang.id)
  );

  const isDark = variant === "dark";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`text-xs font-medium uppercase tracking-wide ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Language
      </span>
      <div
        className={`inline-flex flex-wrap gap-1.5 p-1 rounded-xl border ${
          isDark ? "bg-[#1f1f1f] border-gray-700" : "bg-gray-100 border-gray-200"
        }`}
      >
        {options.map((lang) => {
          const runtime = runtimes[lang.id];
          const unavailable = runtime && runtime.available === false;
          const title = unavailable
            ? runtime.message || "This language is not available in the current environment."
            : lang.label;

          return (
            <button
              key={lang.id}
              type="button"
              disabled={disabled || unavailable}
              onClick={() => onChange(lang.id)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                value === lang.id
                  ? isDark
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200"
                  : isDark
                    ? unavailable
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-300 hover:bg-[#2d2d2d] hover:text-white"
                    : unavailable
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
              } disabled:opacity-50`}
              title={title}
            >
              {lang.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSelector;
