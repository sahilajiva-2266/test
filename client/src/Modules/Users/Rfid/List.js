import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditUserForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
const Teachers = () => {

  const [rfidNumber, setRfidNumber] = useState("");
  const [assignTo, setAssignTo] = useState("Employee");
  const [userName, setUserName] = useState("");
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

  const fetchrfid = async () => {
    setLoading(true);
    try {
      const response = await API.rfid.getAll({
        search: searchTerm,
        page: currentPage,
        limit: rowsPerPage,
      });

      let apiData = [];
      if (response?.success && Array.isArray(response.data)) {
        apiData = response.data;
      }

      // 🔥 MERGE STATIC + API DATA
      let combined = [...rfiddatatable, ...apiData];

      // 🔥 APPLY STATUS FILTER (if selected)
      if (SelectedStatus && SelectedStatus !== "Select Status") {
        combined = combined.filter((item) =>
          item.status?.toLowerCase() === SelectedStatus.toLowerCase()
        );
      }

      // 🔥 APPLY SEARCH FILTER
      if (searchTerm.trim() !== "") {
        const s = searchTerm.toLowerCase();
        combined = combined.filter((item) =>
          item.uid?.toLowerCase().includes(s) ||
          item.employeeId?.firstName?.toLowerCase().includes(s)
        );
      }

      setData(combined);
      setTotalRows(combined.length);

    } catch (err) {
      console.error("❌ Error fetching RFID:", err);

      // fallback → static only
      setData(rfiddatatable);
      setTotalRows(rfiddatatable.length);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchrfid();
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
        fetchrfid();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  const handleAddContractor = () => {
    if (!rfidNumber || !userName) {
      toast.error("Please fill all fields");
      return;
    }

    const newEntry = {
      id: "RF" + (data.length + 1),
      uid: rfidNumber,
      employeeId: { firstName: userName },
      issuedAt: new Date().toLocaleString(),
      status: "Active",
      _id: "RF" + (data.length + 1),
    };

    // 🔥 Add new entry into merged table
    setData((prev) => [...prev, newEntry]);
    setTotalRows((prev) => prev + 1);

    toast.success("Contractor Added Successfully!");

    setRfidNumber("");
    setUserName("");
    setAssignTo("Employee");
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
  //       fetchrfid();
  //       setSelectedStatus("");
  //       setSelectedTeachers([]);
  //     } else {
  //       toast.error(res.message);
  //     }
  //   } catch (err) {
  //     toast.error("Failed to update status");
  //   }
  // };

  const handleDelete = async (uid) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      console.log("➡️ Deleting UID:", uid);

      const res = await deleteData(`/rfid/${uid}`);  // ✅ call correct endpoint

      if (res.success) {
        toast.success("RFID deleted successfully");
        fetchrfid(); // refresh list
      } else {
        toast.error(res.message || "Failed to delete RFID");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Something went wrong while deleting RFID");
    }
  };


  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectedTeachers.length === data.length && data.length > 0}
        />
      ),
      selector: (row) => (
        <input
          type="checkbox"
          checked={selectedTeachers.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id)}
        />
      ),
      width: "2%",
    },

    {
      name: "Rfid",
      selector: (row) => row.uid,
      width: "15%",
    },
    {
      name: "employeeId",
      selector: (row) => row.employeeId?.firstName || "N/A",
      width: "15%",
    },

    {
      name: "Issued On",
      selector: (row) => row.issuedAt,
      width: "15%",
    },
    {
      name: "Status",
      width: "15%",
      selector: (row) => (
        <span
          className={`px-3 py-0.5 rounded-lg font-base text-sm ${row.status?.toLowerCase() === "active"
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-600 border border-red-300"
            }`}
        >
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </span>
      ),
    },


    {
      name: "Actions",
      width: "8%",
      selector: (row) => (
        <div className="flex space-x-2 justify-start ml-0 !important ">
          <div className="flex space-x-2">
            <button
              className="text-blue-500"
              onClick={() => {
                console.log("👉 Edit clicked, row.uid:", row.uid);
                handleEdit(row.uid);
              }}
            >
              {/* ✏️ Edit Icon */}
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
          </div>
          <div className="flex space-x-2 ">
            <button
              className="text-red-500"
              onClick={() => {
                console.log("🗑️ Delete clicked, row.uid:", row.uid);
                handleDelete(row.uid);
              }}
            >
              {/* 🗑️ Delete Icon */}
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
        </div>
      ),
    }



  ];
  const rfiddatatable = [
    {
      id: "RF001",
      uid: "UID-784512",
      employeeId: {
        firstName: "Amit Sharma",
      },
      issuedAt: "2025-01-12 10:32 AM",
      status: "Active",
      _id: "RF001",
    },
    {
      id: "RF002",
      uid: "UID-784513",
      employeeId: {
        firstName: "Neha Verma",
      },
      issuedAt: "2025-01-13 11:45 AM",
      status: "Active",
      _id: "RF002",
    },
    {
      id: "RF003",
      uid: "UID-784514",
      employeeId: {
        firstName: "Rohit Mehta",
      },
      issuedAt: "2025-01-15 09:50 AM",
      status: "Active",
      _id: "RF003",
    },
    {
      id: "RF004",
      uid: "UID-784515",
      employeeId: {
        firstName: "Suman Kaur",
      },
      issuedAt: "2025-01-17 02:14 PM",
      status: "Inactive",
      _id: "RF004",
    },
    {
      id: "RF005",
      uid: "UID-784516",
      employeeId: {
        firstName: "Vikram Singh",
      },
      issuedAt: "2025-01-18 04:05 PM",
      status: "inactive",
      _id: "RF005",
    },
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
        fetchrfid(); // Refresh user list
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
    fetchrfid(); // Trigger fetch with the updated search term
  };

  const handleEdit = async (uid) => {
    try {
      console.log("➡️ Calling API with UID:", uid); // should show RFID12345678
      const res = await getData(`/rfid/${uid}`);   // ✅ correct
      console.log("📦 RFID Response:", res);

      if (res && res.data) {
        setSelectedUser(res.data);
        setIsEditUserFormVisible(true);
      } else {
        toast.error("❌ Failed to fetch RFID data.");
      }
    } catch (err) {
      console.error("❌ Error fetching RFID:", err);
      toast.error("Something went wrong while fetching RFID.");
    }
  };



  // selected userlist delete
  const handleDeleteUser = async () => {
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
    setIsModalOpen(true);

    try {
      const url = "/user/delete"; // Use the correct delete API endpoint
      const payload = {
        users: Array.isArray(validUsers) ? validUsers : [validUsers],
      };

      const response = await deleteData(url, payload); // Pass payload for deletion

      if (response.success) {
        fetchrfid();
        toast.success("Deleted  Successfully!");
      } else {
        toast.error(response.message || "Try again");
      }
    } catch (error) {
      toast.error(error || "Try again");
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
    fetchrfid();  // 🔥 Refresh results
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
      {/* ---- RFID Management Section ---- */}
      <div class="bg-white p-4 rounded-lg text-gray-700 font-semibold text-xl flex gap-4 Rfid-user-list">
        <svg width="20"
          fill="navy-blue"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512">
          <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z">
          </path>
        </svg>RFID Management</div>
      <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-300 mb-6">

        {/* <h2 className="text-xl font-bold sub-title text-gray-800">RFID Management</h2> */}
        <p className="text-gray-600 mb-6">Welcome to the Super Admin dashboard.</p>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* RFID Card Number */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">RFID Card Number</label>
            <input
              type="text"
              placeholder="Enter RFID Number"
              className="border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
              value={rfidNumber}
              onChange={(e) => setRfidNumber(e.target.value)}
            />
          </div>

          {/* Assign To Dropdown */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Assign To</label>
            <select
              className="border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
            >
              <option>Employee</option>
              <option>Contractor</option>
              <option>Visitor</option>
            </select>
          </div>

          {/* User Name */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">User Name</label>
            <input
              type="text"
              placeholder="Enter User Name"
              className="border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
        </div>

        {/* Add Button */}
        <div className="pt-2.5">
          <button
            className="bg-[#22374e] hover:bg-[#0d2847] text-white px-5 py-2 rounded-lg flex items-center gap-2"
            onClick={handleAddContractor}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4062 13.9219C13.4374 13.9397 13.4685 13.9574 13.5006 13.9757C13.9632 14.2432 14.3676 14.5511 14.7656 14.9063C14.8198 14.952 14.8198 14.952 14.8751 14.9986C15.0962 15.1849 15.2861 15.3855 15.4688 15.6094C15.5045 15.6527 15.5402 15.6961 15.577 15.7407C16.4568 16.8315 17.2389 18.3939 17.1094 19.8282C17.039 20.0812 16.9131 20.2522 16.6875 20.3907C16.374 20.5347 16.1087 20.5513 15.7663 20.5491C15.7121 20.5494 15.6579 20.5496 15.602 20.5498C15.4523 20.5503 15.3026 20.5501 15.153 20.5497C14.9912 20.5493 14.8295 20.5498 14.6677 20.5502C14.3512 20.5508 14.0346 20.5507 13.7181 20.5503C13.4608 20.55 13.2035 20.5499 12.9462 20.5501C12.9095 20.5501 12.8729 20.5501 12.8351 20.5502C12.7606 20.5502 12.6861 20.5503 12.6117 20.5503C11.9137 20.5507 11.2158 20.5502 10.5178 20.5495C9.91931 20.5489 9.32078 20.549 8.72225 20.5496C8.02677 20.5504 7.33128 20.5507 6.6358 20.5502C6.5616 20.5502 6.4874 20.5501 6.4132 20.5501C6.3767 20.5501 6.34019 20.5501 6.30258 20.55C6.04566 20.5499 5.78873 20.5501 5.5318 20.5504C5.21858 20.5508 4.90537 20.5507 4.59215 20.55C4.43242 20.5496 4.27269 20.5495 4.11296 20.5499C3.93965 20.5503 3.76637 20.5498 3.59306 20.5491C3.54279 20.5494 3.49253 20.5498 3.44073 20.5501C3.11365 20.5475 2.82952 20.5195 2.56677 20.3048C2.54151 20.2741 2.51626 20.2435 2.49023 20.2119C2.45126 20.1665 2.45126 20.1665 2.4115 20.1202C2.16297 19.7367 2.256 19.3144 2.34265 18.8928C2.77102 16.94 3.90296 15.2578 5.57812 14.1563C7.90966 12.6751 10.9959 12.5384 13.4062 13.9219Z" fill="white" />
              <path d="M12.3907 4.48101C13.2326 5.24145 13.6602 6.22572 13.7475 7.3402C13.779 8.48531 13.3521 9.52338 12.5726 10.3536C11.82 11.1219 10.793 11.5141 9.72944 11.543C8.63298 11.5325 7.61977 11.1301 6.83912 10.3592C6.05032 9.55411 5.6595 8.5489 5.66016 7.42638C5.67636 6.40685 6.07886 5.49221 6.74994 4.73443C6.77587 4.70458 6.80179 4.67473 6.8285 4.64397C8.29856 3.06083 10.8148 3.14929 12.3907 4.48101Z" fill="white" />
              <path d="M19.3531 8.64261C19.5874 8.82109 19.6873 9.0436 19.7344 9.32816C19.7381 9.42118 19.7394 9.5143 19.739 9.60739C19.7387 9.68557 19.7387 9.68557 19.7385 9.76532C19.7379 9.84622 19.7379 9.84622 19.7373 9.92874C19.7371 9.98358 19.7369 10.0384 19.7367 10.0949C19.7361 10.23 19.7353 10.365 19.7344 10.5C19.7911 10.4986 19.7911 10.4986 19.8489 10.4971C20.0217 10.4931 20.1944 10.4907 20.3672 10.4883C20.4564 10.486 20.4564 10.486 20.5474 10.4836C20.8934 10.4799 21.1316 10.4921 21.4219 10.6875C21.5081 10.7727 21.5081 10.7727 21.5596 10.8545C21.5774 10.8817 21.5952 10.9088 21.6136 10.9367C21.7636 11.2142 21.7314 11.5542 21.7031 11.8594C21.6016 12.1426 21.3985 12.3427 21.1286 12.473C20.9788 12.5227 20.8579 12.5263 20.7003 12.5248C20.6439 12.5245 20.5876 12.5242 20.5295 12.5239C20.4419 12.5227 20.4419 12.5227 20.3525 12.5215C20.2932 12.5211 20.2339 12.5207 20.1728 12.5202C20.0267 12.5191 19.8805 12.5176 19.7344 12.5157C19.7351 12.5489 19.7358 12.5822 19.7366 12.6165C19.7396 12.7694 19.7414 12.9223 19.7432 13.0752C19.7443 13.1276 19.7455 13.1799 19.7467 13.2339C19.7499 13.5947 19.7361 13.9241 19.5095 14.2191C19.2299 14.4478 18.9857 14.5561 18.6143 14.5425C18.2652 14.5029 18.0582 14.3885 17.8317 14.1202C17.6942 13.9027 17.6602 13.6944 17.6627 13.4403C17.663 13.3863 17.6633 13.3322 17.6636 13.2765C17.6644 13.2207 17.6652 13.1649 17.666 13.1075C17.6664 13.0506 17.6669 12.9937 17.6673 12.9352C17.6684 12.7953 17.6699 12.6555 17.6719 12.5157C17.6355 12.5166 17.5991 12.5176 17.5616 12.5186C17.3953 12.5226 17.2289 12.525 17.0625 12.5274C17.0053 12.5289 16.9481 12.5305 16.8891 12.5321C16.494 12.5364 16.2573 12.4957 15.9364 12.2578C15.7189 12.0164 15.6692 11.7575 15.6562 11.4375C15.6752 11.1392 15.776 10.9019 15.9844 10.6875C16.325 10.4603 16.6388 10.4777 17.0391 10.4883C17.1 10.4892 17.1609 10.49 17.2236 10.4909C17.3731 10.4931 17.5225 10.4962 17.6719 10.5C17.6709 10.4656 17.6699 10.4311 17.6689 10.3956C17.665 10.2371 17.6626 10.0785 17.6602 9.91995C17.6586 9.86575 17.657 9.81155 17.6554 9.75571C17.6515 9.41201 17.6767 9.11149 17.8594 8.81253C18.2741 8.40736 18.8464 8.3558 19.3531 8.64261Z" fill="white" />
            </svg>

            Add Contractors
          </button>
        </div>
      </div>

      <div className="pt-3">
        <div className="">
          <h2 className="text-xl font-bold sub-title">List of Rfid</h2>
        </div>
        <div className="button-crm">
          <div className="status-dropdown-section flex gap-4">

            {/* / ----Search-Bar----/  */}
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
            {/* / ----Select-Status----/  */}
            <div className="status-select-option-dropdown first-left form-item">
              <select
                name="status"
                placeholder="Select Status"
                value={SelectedStatus}
                onChange={handleListStatusChange}
              >
                <option>Select Status</option>

                <option value="Active">Active</option>
                <option value="Disabled">Inactive</option>
                <option value="Blocked">Block</option>
              </select>
            </div>
            {/* ----Apply-Button----   */}
            {/* <div className="outer-aply-section">
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
          </div> */}
            <PopupModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <h2 className="text-xl font-bold mb-4">Fill the Form</h2>
              <ConfirmDelete />
            </PopupModal>
            {/* ----Delete-Button----   */}
            {/* <div className="outer-delete-section">
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
          </div> */}

          </div>

          <div className="combine-export-section">
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
                onClick={() => navigate("/dashboard/users/AddRfid")}
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
                Add  Rfid
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
            data={data}     // ← यही change बहुत जरूरी है
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
    </div>
  );
};

export default Teachers;
