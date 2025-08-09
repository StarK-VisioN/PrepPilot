import React, { useEffect, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { CARD_BG } from "../../utils/data";
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SummaryCard from '../../components/SummaryCard';
import moment from "moment";
import Modal from '../../components/Modal';
import CreateSessionForm from './CreateSessionForm';
import DeleteAlertContent from '../../components/DeleteAlertContent';

const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [sessions, setSessions] = useState([]);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
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
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <div>
      <div className="container mx-auto pt-4 pb-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <img
              src="/empty-state.svg"
              alt="No sessions"
              className="w-48 h-48 mb-6 opacity-80"
            />
            <h2 className="text-xl font-semibold mb-2">No Sessions Yet</h2>
            <p className="text-gray-500 max-w-sm">
              You haven’t created any interview prep sessions yet. Click the{" "}
              <span className="font-medium text-orange-500">Add New</span> button
              below to get started.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0'>
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
          className='h-12 md:h-12 flex items-center justify-center gap-3 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed bottom-10 md:bottom-20 right-10 md:right-20'
          onClick={() => setOpenCreateModel(true)}
        >
          <LuPlus className='text-2xl text-white' /> Add New
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
        <div><CreateSessionForm /></div>
      </Modal>

      {/* Delete Alert Modal */}
      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
        title="Delete Alert"
      >
        <div className=''>
          <DeleteAlertContent
            content="Are you conform to delete this session details?"
            onDelete={() => deleteSession(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
