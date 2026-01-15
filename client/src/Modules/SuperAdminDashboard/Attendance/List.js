import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "../Add.js";
import EditUserForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
import Attendance from "./Add.js"
const Teachers = () => {
  const [data, setData] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [isAddUserFormVisible, setIsAddUserFormVisible] = useState(false);
  const [isEditUserFormVisible, setIsEditUserFormVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  // const { openPopup } = usePopup();
  const [SelectedStatus, setSelectedStatus] = useState("");
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };
  const statusValues = ["Active", "Disabled", "Blocked"];

  const [searchTerm, setSearchTerm] = useState("");

  const fetchattendance = async () => {
    setLoading(true);
    try {
      const response = await API.attendance.getAll({
        search: searchTerm,
        page: currentPage,
        limit: rowsPerPage,
      });

      console.log("attendance response", response);

      if (Array.isArray(response)) {
        setData(response);                // ✅ Attendance data comes as array
        setTotalRows(response.length);    // ✅ Just use array length
      } else {
        setError("No attendance data found");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Something went wrong while fetching attendance.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchattendance();
  }, [currentPage, rowsPerPage, searchTerm]);



  const handleCheckboxChange = (id) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleSelectAllChange = () => {
    if (selectedTeachers.length === data.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(data.map((t) => t.id));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await putData("/employees/${id}`, data", {
        teachers: [id],
        status,
      });
      if (res.status) {
        toast.success("Status updated");
        fetchattendance();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // const handleBulkStatusUpdate = async () => {
  //   if (selectedTeachers.length === 0)
  //     return toast.error("Select at least one teacher");
  //   try {
  //     const res = await putData("/teacher/status", {
  //       teachers: selectedTeachers,
  //       status: selectedStatus,
  //     });
  //     if (res.status) {
  //       toast.success("Status updated");
  //       fetchattendance();
  //       setSelectedStatus("");
  //       setSelectedTeachers([]);
  //     } else {
  //       toast.error(res.message);
  //     }
  //   } catch (err) {
  //     toast.error("Failed to update status");
  //   }
  // };


  const handleDelete = async (ids) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      // If multiple IDs are allowed, you can loop or batch
      const targetIds = Array.isArray(ids) ? ids : [ids];

      for (const id of targetIds) {
        const res = await deleteData(`/attendance/${id}`);

        console.log("🔹 Delete response:", res);

        if (res?.success || res?.status === 200) {
          toast.success("✅ Attendance deleted successfully");
        } else {
          toast.error(res?.message || "❌ Failed to delete attendance");
        }
      }

      // Refresh the list after deletion
      fetchattendance();

    } catch (err) {
      console.error("❌ Error deleting attendance:", err);
      toast.error("Failed to delete attendance");
    }
  };

  const columns = [
    //  {
    //   name: (
    //     <input
    //       type="checkbox"
    //       onChange={handleSelectAllChange}
    //       checked={selectedTeachers.length === data.length && data.length > 0}
    //     />
    //   ),
    //   selector: (row) => (
    //     <input
    //       type="checkbox"
    //       checked={selectedTeachers.includes(row.id)}
    //       onChange={() => handleCheckboxChange(row.id)}
    //     />
    //   ),
    //   width: "5%",
    // },

    {
      name: "RfidCardId",
      selector: (row) => row.rfidCardId,
      width: "25%",
    },
    {
      name: "date",
      selector: (row) => row.date,
      width: "25%",
    },
    {
      name: "Entry",
      selector: (row) => row.entryGateIn,
      width: "25%",
    },
    {
      name: "Exit",
      selector: (row) => row.workfloorOut,
      width: "25%",
    },

    {
      name: "Actions",
      width: "2%",
      selector: (row) => (
        <div className="flex space-x-2 justify-center">
          {/* ✅ Edit Button */}
          <button
            className="text-blue-500"
            onClick={() => handleEdit(row._id)}
          >
            <svg
              fill="#22374e"
              width={20}
              height={20}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l293.1 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1l-91.4 0zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z" />
            </svg>
          </button>

          {/* ✅ Delete Button */}
          <button
            className="text-red-500"
            onClick={() => handleDelete(row._id)}
          >
            <svg
              fill="red"
              width={16}
              height={16}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
            </svg>
          </button>
        </div>
      ),
    }

  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };
  // selected user status update
  const handleApplyClick = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Select Row");
      return;
    }

    const validUsers = selectedUsers.filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (validUsers.length === 0) {
      alert("Invalid user IDs provided.");
      return;
    }

    try {
      const response = await updateUserStatus(validUsers, SelectedStatus);
      if (response.status === true) {
        setSelectedStatus("");
        setSelectedUsers("");
        fetchattendance(); // Refresh user list
        toast.success("Updated Successfully!");
      } else {
        toast.error(response.message || "Failed to create user.");
      }
    } catch (error) {
      toast.error("Failed to update user status:", error);
    }
  };

  const updateUserStatus = async (users, status) => {
    try {
      return await API.updateStatus({ users, status });
    } catch (error) {
      return error;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term
    fetchattendance(); // Trigger fetch with the updated search term
  };

  // ✅ Handle Edit (fetch full attendance/user details)
  const handleEdit = async (userId) => {
    try {
      const res = await getData(`/attendance/${userId}`);
      console.log("res", res);

      if (res) {
        // If API returns { employee: {...} }
        if (res.employee) {
          setSelectedUser(res.employee); // ✅ Set full employee object
        } else {
          setSelectedUser(res); // ✅ If API directly returns user data
        }

        setIsEditUserFormVisible(true); // ✅ Open side panel
      } else {
        toast.error("Failed to fetch user data.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while fetching user.");
    }
  };




  // selected userlist delete
  const handleDeleteUser = async () => {
    if (selectedUsers.length === 0) {
      toast.error("❌ Please select at least one row");
      return;
    }

    // Ensure only valid MongoDB ObjectIds are processed
    const validUsers = selectedUsers.filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (validUsers.length === 0) {
      toast.error("❌ Invalid user IDs provided.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${validUsers.length} attendance record(s)?`
    );
    if (!confirmDelete) return;

    try {
      for (const id of validUsers) {
        const res = await deleteData(`/api/attendance/${id}`);

        console.log("🔹 Delete response:", res);

        if (res?.success || res?.status === 200) {
          toast.success(`✅ Attendance record deleted: ${id}`);
        } else {
          toast.error(res?.message || `❌ Failed to delete record: ${id}`);
        }
      }

      // Refresh table
      fetchattendance();
    } catch (error) {
      console.error("❌ Error deleting user(s):", error);
      toast.error("An error occurred while deleting. Please try again.");
    }
  };


  const toggleAddUserForm = () => {
    setIsAddUserFormVisible((prev) => !prev); // Toggle form visibility
  };

  const toggleEditUserForm = () => {
    setIsEditUserFormVisible((prev) => !prev); // Toggle form visibility
  };
  const handleListStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    console.log("Selected Status:", event.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);

  const StatusApply = ({ onConfirm, onCancel }) => {
    return (
      <PopupModal>
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
      </PopupModal>
    );
  };

  {
    show && <StatusApply />;
  }
  return (
    <div className="relative p-4 ">
      <div className="list-user-title ">
        <h2 className="text-xl font-bold sub-title">List of Attendance</h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
          <div className="status-select-option-dropdown first-left form-item">
            <select
              name="status"
              placeholder="Select Status"
              value={SelectedStatus}
              onChange={handleListStatusChange}
            >
              <option>Select Status</option>

              <option value="Active">Active</option>
              <option value="Disabled">Disable</option>
              <option value="Blocked">Block</option>
              <option value="Trash">Trash</option>
            </select>
          </div>
          <div className="outer-aply-section">
            <button
              type="submit"
              className="apply-section"
              onClick={handleApplyClick}
            >
              <svg
                fill="#fff"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
              </svg>
              <div>Apply</div>
            </button>
          </div>
          <PopupModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <h2 className="text-xl font-bold mb-4">Fill the Form</h2>
            <ConfirmDelete />
          </PopupModal>
          <div className="outer-delete-section">
            <button
              className="apply-section"
            // onClick={() => handleDeleteClick(user)}
            >
              <svg
                fill="#fff"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM472 200l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
              </svg>
              <div onClick={handleDeleteUser}>Delete</div>
            </button>
          </div>
        </div>

        <div className="combine-export-section">
          <div className="input-search-bar flex ">
            <input
              type="text"
              id="search"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
              className="border rounded p-2 "
            />
            <div className="searching-log flex items-center">
              <svg
                fill="#blue"
                width={16}
                height={16}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
              </svg>
            </div>
          </div>

          <div className="export-section">
            <button>
              <svg
                fill="#22374e"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
              </svg>
              <div>Export</div>
            </button>
          </div>
          <div>
            <button
              className="crm-buttonsection"
              onClick={() => navigate("/dashboard/users/Addattendance")}
            >
              <svg
                fill="white"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
              </svg>
              Add Attendance
            </button>
          </div>
        </div>
      </div>
      {/* Toast Notifications */}
      {/* Error message */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <CustomDataTable
          columns={columns}
          data={data}
          totalRows={totalRows}
          rowsPerPageOptions={[10, 20, 50, 100, 500, 1000]}
          defaultRowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
        />
      )}

      {/* Add User Form Sliding Panel */}
      {isAddUserFormVisible && (
        <div className="sideform fixed top-0 right-0 w-1/3 h-full shadow-lg z-50 ">
          <div className="sidebar-inner bg-white  transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm"
              onClick={toggleAddUserForm}
            >
              X
            </button>
            <AddUserForm />
          </div>
        </div>
      )}

      {/* Edit User Form Sliding Panel */}
      {isEditUserFormVisible && selectedUser && (
        <div className="sideform fixed top-0 right-0 w-1/3 h-full shadow-lg p-4 z-50 ">
          <div className="sidebar-inner bg-white p-4 transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm"
              onClick={toggleEditUserForm}
            >
              X
            </button>
            <EditUserForm user={selectedUser} /> {/* ✅ Now contains full data */}
          </div>
        </div>
      )}
      {/* Background overlay when Add or Edit User form is visible */}
      {(isAddUserFormVisible || isEditUserFormVisible) && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default Teachers;
