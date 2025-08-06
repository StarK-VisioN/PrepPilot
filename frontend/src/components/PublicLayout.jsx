import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';

const PublicLayout = () => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[8vw] bg-[#d8c2ec]">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default PublicLayout;
