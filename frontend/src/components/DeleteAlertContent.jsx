import React from 'react';

const DeleteAlertContent = ({ content, onDelete, onCancel }) => {
  return (
    <div className="p-6">
      <p className="text-base text-gray-700">{content}</p>

      <div className="flex justify-center mt-6 space-x-3">
        <button
          type="button"
          onClick={onDelete}
          className="px-6 py-3 text-lg font-large text-white bg-red-600 hover:bg-red-700 rounded-md transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlertContent;
