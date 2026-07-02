import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  LuPlus,
  LuTarget,
  LuCode,
  LuArrowRight,
  LuMessageSquare,
  LuMic,
  LuChartBar,
  LuChevronRight,
  LuSparkles,
} from 'react-icons/lu';
import { groupSessionsBySource } from '../../utils/data';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SummaryCard from '../../components/SummaryCard';
import moment from 'moment';
import Modal from '../../components/Modal';
import CreateSessionForm from './CreateSessionForm';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import { UserContext } from '../../context/userContext';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'jd', label: 'Job Description' },
  { id: 'resume', label: 'Resume' },
  { id: 'combined', label: 'Resume + JD' },
  { id: 'manual', label: 'Manual' },
];

const PHASE_MODULES = [
  {
    id: 'phase-1',
    title: 'Interview Q&A',
    subtitle: 'JD, resume, or manual topics',
    icon: LuTarget,
    iconClass: 'bg-blue-50 text-blue-600',
    action: 'create',
  },
  {
    id: 'phase-2',
    title: 'Coding Round',
    subtitle: 'Editor, tests & autosave',
    icon: LuCode,
    iconClass: 'bg-slate-100 text-slate-700',
    path: '/coding',
  },
  {
    id: 'phase-3',
    title: 'Behavioral',
    subtitle: 'AI feedback on answers',
    icon: LuMessageSquare,
    iconClass: 'bg-indigo-50 text-indigo-600',
    path: '/behavioral',
  },
  {
    id: 'phase-4',
    title: 'Mock Interview',
    subtitle: 'Live AI interviewer',
    icon: LuMic,
    iconClass: 'bg-violet-50 text-violet-600',
    path: '/mock-interview',
    badge: 'New',
  },
  {
    id: 'phase-5',
    title: 'Analytics',
    subtitle: 'Weaknesses & roadmap',
    icon: LuChartBar,
    iconClass: 'bg-cyan-50 text-cyan-600',
    path: '/analytics',
    badge: 'New',
  },
];

const ModuleNavItem = ({ module, onCreateSession, onNavigate }) => {
  const Icon = module.icon;

  const handleClick = () => {
    if (module.action === 'create') onCreateSession();
    else if (module.path) onNavigate(module.path);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors hover:bg-slate-50 group"
    >
      <span
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${module.iconClass}`}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{module.title}</span>
          {module.badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
              {module.badge}
            </span>
          )}
        </span>
        <span className="text-xs text-slate-500 block truncate">{module.subtitle}</span>
      </span>
      <LuChevronRight
        size={16}
        className="shrink-0 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
      />
    </button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(UserContext);

  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [createIntent, setCreateIntent] = useState({ mode: 'manual', company: 'generic' });
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ open: false, data: null });

  const fetchAllSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching session data:', error);
      toast.error('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success('Session deleted successfully');
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.error('Error deleting session data:', error);
      toast.error('Failed to delete session');
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('createSessionIntent');
    if (stored) {
      try {
        const intent = JSON.parse(stored);
        sessionStorage.removeItem('createSessionIntent');
        setCreateIntent({
          mode: intent.generationMode || 'manual',
          company: intent.company || 'generic',
        });
        setOpenCreateModel(true);
      } catch {
        sessionStorage.removeItem('createSessionIntent');
      }
      return;
    }

    if (location.state?.openCreate) {
      setCreateIntent({
        mode: location.state.generationMode || 'manual',
        company: location.state.company || 'generic',
      });
      setOpenCreateModel(true);
      navigate('/dashboard', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (user) fetchAllSessions();
  }, [user]);

  const openCreateModal = (mode = 'manual', company = 'generic') => {
    setCreateIntent({ mode, company });
    setOpenCreateModel(true);
  };

  const filteredSessions = useMemo(() => {
    if (activeFilter === 'all') return sessions;
    return sessions.filter((s) => (s.sourceType || 'manual') === activeFilter);
  }, [sessions, activeFilter]);

  const filterCounts = useMemo(() => {
    const counts = { all: sessions.length };
    sessions.forEach((s) => {
      const type = s.sourceType || 'manual';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const showSessionsLoader = sessionsLoading && user;

  return (
    <div className="w-full sm:px-4 md:px-6 lg:px-10 py-8 pb-16">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base">
            Choose a practice module or continue where you left off.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm shrink-0 self-start sm:self-auto"
        >
          <LuPlus size={18} />
          New Session
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left — modules */}
        <aside className="w-full lg:w-[280px] xl:w-[300px] shrink-0 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Practice Modules</h2>
              <p className="text-xs text-slate-500 mt-0.5">All interview prep tools</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {PHASE_MODULES.map((module) => (
                <ModuleNavItem
                  key={module.id}
                  module={module}
                  onCreateSession={() => openCreateModal()}
                  onNavigate={navigate}
                />
              ))}
            </nav>
          </div>

          {/* Quick tip card */}
          <div className="mt-4 rounded-2xl bg-blue-600 p-4 text-white shadow-sm">
            <div className="flex items-center gap-2">
              {/* <LuSparkles size={16} /> */}
              <span className="text-xs font-semibold uppercase tracking-wide opacity-90">Personal Opinion:</span>
            </div>
            <p className="text-xs leading-[1.0] opacity-95 pl-8">
              Start with a JD or resume session, then use Analytics to find weak spots.
            </p>
          </div>
        </aside>

        {/* Right — sessions */}
        <main className="flex-1 min-w-0 w-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Your Sessions</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {sessions.length > 0
                      ? `${sessions.length} prep session${sessions.length === 1 ? '' : 's'} saved`
                      : 'No sessions yet — create your first one'}
                  </p>
                </div>
              </div>

              {sessions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {FILTER_TABS.filter((tab) => tab.id === 'all' || filterCounts[tab.id]).map(
                    (tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFilter(tab.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          activeFilter === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tab.label}
                        {filterCounts[tab.id] != null && (
                          <span className="ml-1.5 opacity-70">({filterCounts[tab.id]})</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {showSessionsLoader ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-9 w-9 border-2 border-gray-200 border-t-blue-600" />
                    <p className="text-sm text-slate-500">Loading sessions...</p>
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                    <LuTarget size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No sessions yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                    Create a personalized Q&A session from a job description, your resume, or manual
                    topics to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => openCreateModal()}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Create your first session
                    <LuArrowRight size={16} />
                  </button>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-slate-500">No sessions in this category.</p>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Show all sessions
                  </button>
                </div>
              ) : activeFilter === 'all' ? (
                <div className="space-y-8">
                  {groupSessionsBySource(filteredSessions).map((group) => (
                    <section key={group.type}>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-semibold text-slate-700">
                          {group.config.sectionTitle}
                        </h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {group.sessions.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.sessions.map((data) => (
                          <SummaryCard
                            key={data?._id}
                            role={data?.role || ''}
                            topicsToFocus={data?.topicsToFocus || ''}
                            experience={data?.experience || '-'}
                            questions={Array.isArray(data?.questions) ? data.questions : []}
                            description={data?.description || ''}
                            company={data?.company}
                            customCompanyName={data?.customCompanyName}
                            sourceType={data?.sourceType || 'manual'}
                            lastUpdated={
                              data?.updatedAt
                                ? moment(data.updatedAt).format('MMM D, YYYY')
                                : ''
                            }
                            onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                            onDelete={() => setOpenDeleteAlert({ open: true, data })}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSessions.map((data) => (
                    <SummaryCard
                      key={data?._id}
                      role={data?.role || ''}
                      topicsToFocus={data?.topicsToFocus || ''}
                      experience={data?.experience || '-'}
                      questions={Array.isArray(data?.questions) ? data.questions : []}
                      description={data?.description || ''}
                      company={data?.company}
                      customCompanyName={data?.customCompanyName}
                      sourceType={data?.sourceType || 'manual'}
                      lastUpdated={
                        data?.updatedAt ? moment(data.updatedAt).format('MMM D, YYYY') : ''
                      }
                      onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                      onDelete={() => setOpenDeleteAlert({ open: true, data })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={openCreateModel} onClose={() => setOpenCreateModel(false)} hideHeader size="lg">
        <CreateSessionForm
          key={`${createIntent.mode}-${createIntent.company}-${openCreateModel}`}
          initialMode={createIntent.mode}
          initialCompany={createIntent.company}
          onSuccess={() => {
            setOpenCreateModel(false);
            fetchAllSessions();
          }}
        />
      </Modal>

      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Session"
      >
        <DeleteAlertContent
          content="Are you sure you want to delete this session? This action cannot be undone."
          onDelete={() => deleteSession(openDeleteAlert.data)}
          onCancel={() => setOpenDeleteAlert({ open: false, data: null })}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
