import { Outlet } from "react-router-dom";
import { CodingLanguageProvider } from "../context/CodingLanguageContext";

const CodingRoutesLayout = () => (
  <CodingLanguageProvider>
    <Outlet />
  </CodingLanguageProvider>
);

export default CodingRoutesLayout;
