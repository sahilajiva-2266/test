import React, { useState, useEffect, useRef } from "react";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate } from "react-router-dom";
import AddUserForm from "../Add.js";
import EditUserForm from "./Edit.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";

const Teachers = () => {

  /* ================= STATIC DATA ================= */
  const attendancedata = [
    {
      _id: "1",
      rfidCardId: "RFID-1001",
      name: "Amit Sharma",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "09:05 AM",
      workfloorOut: "06:15 PM",
    },
    {
      _id: "2",
      rfidCardId: "RFID-1002",
      name: "Neha Verma",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "09:00 AM",
      workfloorOut: "06:10 PM",
    },
    {
      _id: "3",
      rfidCardId: "RFID-1003",
      name: "Rohit Mehta",
      date: "2025-02-10",
      status: "Absent",
      entryGateIn: "-",
      workfloorOut: "-",
    },
    {
      _id: "4",
      rfidCardId: "RFID-1004",
      name: "Suman Kaur",
      date: "2025-02-10",
      status: "Absent",
      entryGateIn: "-",
      workfloorOut: "-",
    },
    {
      _id: "5",
      rfidCardId: "RFID-1005",
      name: "Vikram Singh",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "09:10 AM",
      workfloorOut: "06:30 PM",
    },
    {
      _id: "6",
      rfidCardId: "RFID-1006",
      name: "Priya Gupta",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "08:55 AM",
      workfloorOut: "06:20 PM",
    },
    {
      _id: "7",
      rfidCardId: "RFID-1007",
      name: "Arjun Patel",
      date: "2025-02-10",
      status: "On Leave",
      entryGateIn: "-",
      workfloorOut: "-",
    },
    {
      _id: "8",
      rfidCardId: "RFID-1008",
      name: "Riya Sharma",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "09:02 AM",
      workfloorOut: "06:18 PM",
    },
    {
      _id: "9",
      rfidCardId: "RFID-1009",
      name: "Karan Yadav",
      date: "2025-02-10",
      status: "Absent",
      entryGateIn: "-",
      workfloorOut: "-",
    },
    {
      _id: "10",
      rfidCardId: "RFID-1010",
      name: "Sneha Joshi",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "08:50 AM",
      workfloorOut: "06:05 PM",
    }, {
      _id: "11",
      rfidCardId: "RFID-1010",
      name: "Sneha Joshi",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "08:50 AM",
      workfloorOut: "06:05 PM",
    }, {
      _id: "12",
      rfidCardId: "RFID-1010",
      name: "Sneha Joshi",
      date: "2025-02-10",
      status: "Present",
      entryGateIn: "08:50 AM",
      workfloorOut: "06:05 PM",
    },
  ];


  /* ================= STATES ================= */
  const [data, setData] = useState(attendancedata);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isAddUserFormVisible, setIsAddUserFormVisible] = useState(false);
  const [isEditUserFormVisible, setIsEditUserFormVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ================= FILTER ================= */
  const filteredData = data.filter((item) => {
    if (
      searchTerm &&
      !item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    if (attendanceStatus && item.status !== attendanceStatus)
      return false;

    return true;
  });

  /* ================= HANDLERS ================= */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAttendanceStatusChange = (e) => {
    setAttendanceStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    setData((prev) => prev.filter((item) => item._id !== id));
    toast.success("Attendance deleted successfully");
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };
  const handleEdit = (id) => {
    const selected = attendancedata.find((item) => item._id === id);

    if (!selected) {
      toast.error("Attendance record not found");
      return;
    }

    setSelectedUser(selected);
    setIsEditUserFormVisible(true);
  };

  // ✅ ADD THESE TWO FUNCTIONS EXACTLY HERE 👇
  const toggleAddUserForm = () => {
    setIsAddUserFormVisible((prev) => !prev);
  };

  const toggleEditUserForm = () => {
    setIsEditUserFormVisible(false);
    setSelectedUser(null);
  };



  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      name: "Rfid Card Id",
      selector: (row) => row.rfidCardId,
      width: "10%"
    },
    {
      name: "Name",
      selector: (row) => row.name,
      width: "20%"
    },
    {
      name: "date",
      selector: (row) => row.date,
      width: "15%"
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "15%"
    },
    {
      name: "In Time",
      selector: (row) => row.entryGateIn,
      width: "15%"
    },
    {
      name: "Out Time",
      selector: (row) => row.workfloorOut,
      width: "15%"
    },

    {

      name: "Actions",
      width: "25%",
      selector: (row) => (
        <div className="flex space-x-2 justify-start">
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

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="relative p-4">
      <div class="bg-white p-4 rounded-lg text-gray-700 font-semibold text-xl flex gap-4 Attendance-user-list">
        <svg width="20"
          fill="navy-blue"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512">
          <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z">
          </path>
        </svg>List of Attendance</div>

      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">

          {/* SEARCH */}
          <div className="input-search-bar flex">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
              className="border rounded p-2"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="status-select-option-dropdown first-left form-item">
            <select
              value={attendanceStatus}
              onChange={handleAttendanceStatusChange}
            >
              <option value="">Select Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

        </div>
      </div>
      <CustomDataTable
        columns={columns}
        data={filteredData}
        totalRows={filteredData.length}
        rowsPerPageOptions={[10, 20, 50, 100]}
        defaultRowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        currentPage={currentPage}
      />
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
