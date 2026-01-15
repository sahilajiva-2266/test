import React from "react";

const DeleteConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-lg font-semibold">Confirm Deletion</h2>
      <p className="mt-2">
        Are you sure you want to delete the selected user(s)?
      </p>
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
