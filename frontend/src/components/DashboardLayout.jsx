import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="pl-10 pr-10">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;