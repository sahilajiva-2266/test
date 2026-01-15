import React, { useState, useEffect, useRef } from "react";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "../Add.js";
import EditUserForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
import { useUser } from "../../../Helpers/Context/UserContext.js";
const Employeepage = () => {
  const { user } = useUser();
  const role = String(user?.role || "").toLowerCase();
  const canManageEmployees = role === "superadmin" || role === "admin";
  const [data, setData] = useState([]);
  // const [selectedUsers, setselectedUsers] = useState([]);
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
  const [attendanceFilter, setAttendanceFilter] = useState("");

  const [allEmployees, setAllEmployees] = useState([]);




  const [showPopup, setShowPopup] = useState(false);
  // const { openPopup } = usePopup();
  const [SelectedStatus, setSelectedStatus] = useState("");
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };
  const statusValues = ["Active", "Inactive"];

  const [searchTerm, setSearchTerm] = useState("");
  const fetchemployees = async () => {
    setLoading(true);
    try {
      const response = await API.getEmployees(searchTerm, currentPage, rowsPerPage, {
        department: SelectedStatus || undefined,
        attendanceStatus: attendanceFilter || undefined,
      });

      if (Array.isArray(response.employees)) {
        setAllEmployees(response.employees);
        setData(response.employees);
        setTotalRows(
          response.total ??
          response.pagination?.totalrecords ??
          response.employees.length
        );
      } else {
        setError("No employee data found");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchemployees();
  }, [currentPage, rowsPerPage, searchTerm, SelectedStatus, attendanceFilter]);


  const getRowId = (row) => row?.id || row?._id;

  const handleCheckboxChange = (id) => {
    if (!id) return;
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((uid) => uid !== id)
        : [...prev, id]
    );
  };


  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((row) => row.id || row._id).filter(Boolean));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await putData(`/employees/${id}`, {
        teachers: [id],
        status,
      });

      if (res.status) {
        toast.success("Status updated");
        fetchemployees();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const res = await deleteData(`/employee/${id}`);

      if (res?.status === true || res?.success === true) {
        toast.success("Employee deleted successfully");
        fetchemployees();
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };


  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectedUsers.length === data.length && data.length > 0}
        />
      ),
      selector: (row) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(getRowId(row))}
          onChange={() => handleCheckboxChange(getRowId(row))}
        />
      ),
      width: "3%",
    },
    {
      name: "ID",
      selector: (row) => row.employeeId || row._id,
      width: "15%",
    },
    {
      name: "Name",
      selector: (row) => row.name || row.firstName || "",
      width: "15%",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      width: "20%",
    },
    {
      name: "Status",
      width: "15%",
      selector: (row) => (
        <span
          className={`px-3 py-0.5 rounded-lg font-meduim text-sm ${row.status?.toLowerCase() === "active"
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-600 border border-red-300"
            }`}
        >
          {row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : "N/A"}
        </span>
      ),
    },
    {
      name: "Gender",
      selector: (row) => row.gender,
      width: "15%",
    },
    {
      name: "Department",
      selector: (row) => row.department,
      width: "15%",
    },

    ...(canManageEmployees
      ? [
          {
            name: "Actions",
            width: "10%",
            selector: (row) => (
              <div className="flex space-x-2 justify-center">
                <div className="flex space-x-2  ">
                  <button
                    className="text-blue-500"
                    onClick={() => handleEdit(row._id)}// ✅ updated
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
                </div>
                <div className="flex space-x-2 ">
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
              </div>
            ),
          },
        ]
      : []),
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
        setSelectedUsers([]);
        fetchemployees(); // Refresh user list
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
  };

  const handleEdit = async (userId) => {
    try {
      setLoading(true);

      const res = await getData(`/employee/${userId}`);

      if (res?.employee) {
        setSelectedUser(res.employee);
        setIsEditUserFormVisible(true);
      } else {
        toast.error("Employee not found");
      }
    } catch (error) {
      toast.error("Failed to load employee");
    } finally {
      setLoading(false);
    }
  };



  // selected userlist delete
  const handleDeleteUser = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Select at least one row");
      return;
    }

    const validUsers = selectedUsers.filter(
      (id) => /^[0-9a-fA-F]{24}$/.test(id) // Validate MongoDB ObjectId
    );

    if (validUsers.length === 0) {
      alert("Invalid user IDs provided.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${validUsers.length} employee(s)?`
    );
    if (!confirmDelete) return;

    try {
      // Delete each selected employee one by one
      for (const id of validUsers) {
        await deleteData(`/employee/${id}`);
      }

      toast.success("✅ Employees deleted successfully!");
      fetchemployees(); // Refresh the list
    } catch (error) {
      console.error("❌ Error deleting employees:", error);
      toast.error("Failed to delete employees. Please try again.");
    }
  };

  const toggleAddUserForm = () => {
    setIsAddUserFormVisible((prev) => !prev); // Toggle form visibility
  };

  const toggleEditUserForm = () => {
    setIsEditUserFormVisible(false);
    setSelectedUser(null);
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
    <div className="m-0">
      {/* <!-- Employee list Departments  Card --> */}
      <div className="relative p-4 !m-0 ">

        <div class="bg-white p-4 rounded-lg text-gray-700 font-semibold text-xl flex gap-4 list-user-title">
          <svg width="20"
            fill="navy-blue"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512">
            <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z">
            </path>
          </svg>List of Employees</div>
        <div className="button-crm">
          <div className="status-dropdown-section flex gap-4">

            {/* -----Search bar---  */}

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

            {/* -----Status select bar---  */}
            <div className="status-select-option-dropdown first-left form-item">
              <select
                name="Departments"
                placeholder="Select Status"
                value={SelectedStatus}
                onChange={handleListStatusChange}
              >
                <option value="">Select Department</option>

                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
                <option value="Construction">Construction</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Sports Instructor">Sports Instructor</option>
                <option value="Art&Craft">Art & Craft</option>
              </select>
            </div>
            {/* -----Attendance Status Filter----- */}
            <div className="status-select-option-dropdown first-left form-item">
              <select
                name="attendance"
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
              >
                <option value="">All Employees</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <PopupModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <h2 className="text-xl font-bold mb-4">Fill the Form</h2>
              <ConfirmDelete />
            </PopupModal>
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
            <div className="add-new-employee-button">
              <button
                className="crm-buttonsection"
                onClick={toggleAddUserForm}
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
                Add Employees
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
        {/* Add User Form Center Modal */}
        {isAddUserFormVisible && (
          <>

            {/* BACKDROP */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
              onClick={toggleAddUserForm}
            ></div>

            {/* CENTER WRAPPER */}
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
            >

              {/* MAIN MODAL */}
              <div
              // className="bg-white rounded-2xl shadow-2xl w-[70%] max-w-[1000px] max-h-[90vh] overflow-y-auto p-8 relative animate-zoomIn"
              >
                {/* CLOSE BUTTON */}
                {/* <button
                  className="  absolute top-5 right-5 bg-red-500 text-white w-9 h-9 flex items-center justify-center rounded-full shadow-lg " onClick={toggleAddUserForm}
                >
                  ✕
                </button> */}

                {/* FORM CONTENT */}
                <AddUserForm
                  onSuccess={() => {
                    toggleAddUserForm();
                    fetchemployees();
                  }}
                  onClose={() => {
                    toggleAddUserForm();
                  }}
                />
              </div>

            </div>

          </>
        )}





        {/* Edit User Form Sliding Panel */}
        {isEditUserFormVisible && selectedUser && (
          <>
            {/* BACKDROP */}
            <div
              className="fixed inset-0 bg-black/50 z-[10]"
              onClick={() => {
                setIsEditUserFormVisible(false);
                setSelectedUser(null);
              }}
            />

            {/* SIDE PANEL */}
            <div
              className=" top-0 right-0 left-0 w-full md:w-1/3 h-full bg-white shadow-2xl z-[9999] animate-slideIn"
              onClick={(e) => e.stopPropagation()} // ✅ important
            >
              <div className="p-4 h-full overflow-y-auto">

                {/* CLOSE BUTTON */}
                <button
                  className="absolute top-4 right-4 text-red-500 font-bold text-xl"
                  onClick={() => {
                    setIsEditUserFormVisible(false);
                    setSelectedUser(null);
                  }}
                >
                  ✕
                </button>

                {/* FORM */}
                <EditUserForm
                  user={selectedUser}
                  onClose={() => {
                    setIsEditUserFormVisible(false);
                    setSelectedUser(null);
                  }}
                  onSuccess={() => {
                    setIsEditUserFormVisible(false);
                    setSelectedUser(null);
                    fetchemployees();
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Background overlay when Add or Edit User form is visible */}
        {(isAddUserFormVisible || isEditUserFormVisible) && (
          <div className="fixed inset-0 bg-black opacity-50 z-40">

          </div>
        )}
      </div>
    </div>

  );
};

export default Employeepage;
