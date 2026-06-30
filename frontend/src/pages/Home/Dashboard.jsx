import React, { useEffect, useState, useContext } from 'react';
import { LuPlus, LuFileText, LuUser, LuLayers, LuTarget } from 'react-icons/lu';
import { groupSessionsBySource } from "../../utils/data";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SummaryCard from '../../components/SummaryCard';
import moment from "moment";
import Modal from '../../components/Modal';
import CreateSessionForm from './CreateSessionForm';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/empty-state.json";
import { UserContext } from '../../context/userContext';

const SECTION_ICONS = {
  jd: LuFileText,
  resume: LuUser,
  combined: LuLayers,
  manual: LuTarget,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(UserContext);

  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [createIntent, setCreateIntent] = useState({ mode: 'manual', company: 'generic' });
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully!!");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session data:", error);
      toast.error("Failed to delete session");
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
    if (user) {
      fetchAllSessions();
    }
  }, [user]);

  const openCreateModal = (mode = 'manual', company = 'generic') => {
    setCreateIntent({ mode, company });
    setOpenCreateModel(true);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching sessions
  if (sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-100 to-teal-100 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-30 blur-lg"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 pt-6 pb-16 relative z-10">
        {/* Page header + primary action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Prep Sessions</h1>
            <p className="text-sm text-gray-500 mt-1">
              {sessions.length > 0
                ? `${sessions.length} session${sessions.length === 1 ? "" : "s"} · grouped by prep mode`
                : "Create your first personalized interview prep session"}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-5 py-2.5 rounded-full hover:from-[#e99a4b] hover:to-[#FF9324] transition-all cursor-pointer shadow-md hover:shadow-lg shrink-0 self-start sm:self-auto"
            onClick={() => openCreateModal()}
          >
            <LuPlus className="text-lg" />
            <span>Add New Session</span>
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <Lottie
              animationData={emptyAnimation}
              loop={true}
              className="w-48 h-48 mb-6 opacity-90"
            />
            <h2 className="text-xl font-bold mb-2">No Sessions Yet</h2>
            <p className="text-gray-500 max-w-sm mb-6">
              Use the <span className="font-medium text-orange-500">Add New Session</span> button
              above to get started with manual, JD, or resume-based prep.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupSessionsBySource(sessions).map((group) => {
              const SectionIcon = SECTION_ICONS[group.type] || LuTarget;
              return (
                <section key={group.type}>
                  <div className="flex items-start gap-3 mb-5">
                    <div className={`p-2 rounded-lg ${group.config.badgeClass} border`}>
                      <SectionIcon size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {group.config.sectionTitle}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({group.sessions.length})
                        </span>
                      </h2>
                      <p className="text-sm text-gray-500">{group.config.sectionHint}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {group.sessions.map((data) => (
                      <SummaryCard
                        key={data?._id}
                        role={data?.role || ""}
                        topicsToFocus={data?.topicsToFocus || ""}
                        experience={data?.experience || "-"}
                        questions={Array.isArray(data?.questions) ? data.questions : []}
                        description={data?.description || ""}
                        company={data?.company}
                        customCompanyName={data?.customCompanyName}
                        sourceType={data?.sourceType || "manual"}
                        lastUpdated={
                          data?.updatedAt
                            ? moment(data.updatedAt).format("Do MMM YYYY")
                            : ""
                        }
                        onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                        onDelete={() => setOpenDeleteAlert({ open: true, data })}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={openCreateModel}
        onClose={() => {
          setOpenCreateModel(false);
        }}
        hideHeader
        size="lg"
      >
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

      {/* Delete Alert Modal */}
      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
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