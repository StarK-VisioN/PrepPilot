import React, { useEffect, useState, useContext } from 'react';
import { LuPlus } from 'react-icons/lu';
import { CARD_BG } from "../../utils/data";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);

  const [openCreateModel, setOpenCreateModel] = useState(false);
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
    if (user) {
      fetchAllSessions();
    }
  }, [user]);

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

      <div className="container mx-auto pt-4 pb-20 relative z-10">
        

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Lottie
              animationData={emptyAnimation}
              loop={true}
              className="w-48 h-48 mb-6 opacity-90"
            />
            <h2 className="text-xl font-bold mb-2">No Sessions Yet</h2>
            <p className="text-gray-500 max-w-sm mb-6">
              You haven't created any interview prep sessions yet. Click the{" "}
              <span className="font-medium text-orange-500">Add New</span> button
              below to get started.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0'>
            {sessions?.map((data, index) => (
              <SummaryCard
                key={data?._id}
                colors={CARD_BG[index % CARD_BG.length]}
                role={data?.role || ""}
                topicsToFocus={data?.topicsToFocus || ""}
                experience={data?.experience || "-"}
                questions={data?.questions || "-"}
                description={data?.description || ""}
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
        )}

        {/* Add New Button */}
        <button
          className='h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-6 py-3 rounded-full hover:from-[#e99a4b] hover:to-[#FF9324] transition-all cursor-pointer shadow-lg hover:shadow-xl fixed bottom-8 right-8 z-50'
          onClick={() => setOpenCreateModel(true)}
        >
          <LuPlus className='text-xl text-white' /> 
          <span>Add New</span>
        </button>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={openCreateModel}
        onClose={() => {
          setOpenCreateModel(false);
        }}
        hideHeader
      >
        <CreateSessionForm 
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