import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuSparkles,
  LuMail,
  LuGithub,
  LuLinkedin,
  LuArrowUpRight,
  LuFileText,
  LuUser,
  LuTarget,
  LuPhone,
} from 'react-icons/lu';
import { UserContext } from '../context/userContext';
import { toast } from 'react-toastify';

const Footer = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const goToPrep = (mode) => {
    const intent = { openCreate: true, generationMode: mode, company: 'generic' };
    if (!user) {
      sessionStorage.setItem('createSessionIntent', JSON.stringify(intent));
      toast.info('Sign in to start your prep session');
      navigate('/login');
      return;
    }
    navigate('/dashboard', { state: intent });
  };

  const prepLinks = [
    { label: 'Manual Prep', mode: 'manual', icon: LuTarget },
    { label: 'Job Description', mode: 'jd', icon: LuFileText },
    { label: 'Resume Based', mode: 'resume', icon: LuUser },
  ];

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: user ? '/dashboard' : '/login' },
    { label: 'Sign In', to: '/login', hide: !!user },
  ].filter((l) => !l.hide);

  return (
    <footer className="relative mt-24 w-full overflow-hidden">
      {/* Top gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

      <div className="relative w-full border-t border-white/40 bg-white/30 backdrop-blur-md shadow-lg overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <span className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md group-hover:scale-105 transition-transform">
                  <LuSparkles size={18} />
                </span>
                <span className="text-lg font-bold text-gray-900">Interview Prep AI</span>
              </Link>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-xs">
                Master interviews with AI-powered questions from your resume, job description, or
                target role — personalized prep that actually fits you.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a
                  href="mailto:interviewPrep@gmail.com"
                  className="p-2.5 rounded-full bg-white/70 border border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-colors"
                  aria-label="Email"
                >
                  <LuMail size={18} />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-white/70 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                  aria-label="GitHub"
                >
                  <LuGithub size={18} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-white/70 border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  aria-label="LinkedIn"
                >
                  <LuLinkedin size={18} />
                </a>
              </div>
            </div>

            {/* Prep modes */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Prep Modes
              </h4>
              <ul className="space-y-2.5">
                {prepLinks.map(({ label, mode, icon: Icon }) => (
                  <li key={mode}>
                    <button
                      type="button"
                      onClick={() => goToPrep(mode)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors group"
                    >
                      <Icon size={15} className="text-gray-400 group-hover:text-orange-500" />
                      {label}
                      <LuArrowUpRight
                        size={12}
                        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-gray-600 hover:text-orange-600 transition-colors inline-flex items-center gap-1 group"
                    >
                      {label}
                      <LuArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="/#prep-modes"
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    Explore Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Get in Touch
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <LuMail size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <a
                    href="mailto:interviewPrep@gmail.com"
                    className="hover:text-orange-600 transition-colors break-all"
                  >
                    interviewPrep@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <LuPhone size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <span>+91 22385 784893</span>
                </li>
              </ul>
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <p className="text-xs text-orange-800 font-medium">Ready to prep smarter?</p>
                <button
                  type="button"
                  onClick={() => (user ? navigate('/dashboard') : navigate('/login'))}
                  className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <LuArrowUpRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 border-t border-white/50 bg-white/20 w-full">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Interview Prep AI. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Built with
              <LuSparkles size={12} className="text-orange-500" />
              AI-powered interview preparation
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
