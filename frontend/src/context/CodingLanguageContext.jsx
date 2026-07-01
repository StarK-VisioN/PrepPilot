import { createContext, useContext, useMemo } from "react";
import { DEFAULT_CODING_LANGUAGE } from "../utils/codingLanguages";

const CodingLanguageContext = createContext(null);

export function CodingLanguageProvider({ children }) {
  const value = useMemo(
    () => ({
      language: DEFAULT_CODING_LANGUAGE,
      ready: true,
    }),
    []
  );

  return (
    <CodingLanguageContext.Provider value={value}>{children}</CodingLanguageContext.Provider>
  );
}

export function useCodingLanguage() {
  const context = useContext(CodingLanguageContext);
  if (!context) {
    throw new Error("useCodingLanguage must be used within CodingLanguageProvider");
  }
  return context;
}
