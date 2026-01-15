import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { usePopup } from "../../../Helpers/PopupContext.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditUserForm from "./Edit.js";
import { API, getData, deleteData, putData } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
import { BUSINESS_TYPES } from "../../../Constants/businessTypes.js";
const GetUsers = () => {
  const [data, setData] = useState([]);
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
  const [businesstype, setBusinesstype] = useState([]);
  const [selectedBusinessType, setselectedBusinessType] = useState("");
  const [moduleOptions, setModuleOptions] = useState([]);
  const [selectedModule, setselectedModule] = useState("");
  const { openPopup } = usePopup();
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
  const requiredValues = [true, false];

  const [searchTerm, setSearchTerm] = useState("");
  // Handle checkbox selection
  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchglobalfields();
    }, 500); // Adjust delay as needed

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // signle user status change
  const handleStatusChange = async (userIds, newStatus) => {
    try {
      const usersArray = Array.isArray(userIds) ? userIds : [userIds];

      let result = await putData("/user/status", {
        users: usersArray,
        status: newStatus,
      });
      if (result.status === true) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            usersArray.includes(user.id) ? { ...user, status: newStatus } : user
          )
        );
        fetchglobalfields();

        toast.success(result.message || "Status Updated Successfully");

        // window.location.reload();
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleSelectAllChange = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.map((user) => user.id));
    }
  };
  const fetchBusinesstypes = async () => {
    setLoading(true);
    setError(null);

    try {
      let url;
      let responseData = await API.getBusinessTypes();
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      console.log(responseData);

      if (!responseData.success) {
        throw new Error(`HTTP error! status: ${responseData.status}`);
      }

      if (responseData && responseData.data) {
        setBusinesstype(responseData.data);
      } else {
        setError("No data found");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleModuleList = (type) => {
    setselectedBusinessType(type);
    const found = businesstype.find(
      (item) => item.type.toLowerCase() === type.toLowerCase()
    );

    setModuleOptions(found ? found.modules : []);
  };
  const fetchglobalfields = async (module) => {
    setLoading(true);
    setError(null);

    try {
      let reqPage = currentPage;
      if (typeof currentPage === "string") {
        reqPage = parseInt(currentPage) - 1;
      } else if (typeof currentPage === "number") {
        reqPage = currentPage - 1;
      } else {
        reqPage = 100;
      }
      reqPage = reqPage < 0 ? 0 : reqPage;
      let url;
      console.log(module, "selectedModule");
      let responseData = await API.getGlobalfields(
        module,
        selectedBusinessType,
        reqPage,
        rowsPerPage
      );
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      console.log(responseData);

      if (!responseData.status) {
        throw new Error(`HTTP error! status: ${responseData.status}`);
      }

      if (responseData && responseData.data) {
        setData(responseData.data.fields);
        console.log(responseData.data, "responseData.data");
        setTotalRows(responseData.data.fields.length);
      } else {
        setError("No data found");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesstypes();
  }, [currentPage, rowsPerPage, searchTerm]);

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectedUsers?.length === data?.length && data?.length > 0}
        />
      ),
      selector: (row) => (
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange(row.id)}
          checked={selectedUsers.includes(row.id)}
        />
      ),
      width: "1%",
    },
    {
      name: "Label",
      selector: (row) => <span>{row.label}</span>,
      width: "10%",
    },
    {
      name: "Field Key",
      selector: (row) => <span>{row.key}</span>,
      width: "10%",
    },
    {
      name: "Type",
      selector: (row) => <span>{row.type}</span>,
      width: "10%",
    },
    {
      name: "Required",
      selector: (row) => (
        <select>
          {requiredValues.map((val) => (
            <option key={val.toString()} value={val}>
              {val.toString()}
            </option>
          ))}
        </select>
      ),
      width: "5%",
    },

    {
      name: "Status",
      selector: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
        >
          {statusValues.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      ),
      width: "5%",
    },
    {
      name: "Actions",
      width: "2%",
      selector: (row) => (
        <div className="flex space-x-2 justify-center ">
          <div className="flex space-x-2  ">
            <button
              className="text-blue-500"
              onClick={() => handleEdit(row?.id)}
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
              onClick={() => handleDelete(row.id)}
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
        fetchglobalfields(); // Refresh user list
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
    fetchglobalfields(); // Trigger fetch with the updated search term
  };

  const handleEdit = (userid) => {
    console.log(userid, "userid");
    setSelectedUser(userid); // Store the selected user for editing
    setIsEditUserFormVisible(true); // Show the edit form
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
      toast.error("Invalid user IDs provided.");
      return;
    }

    try {
      console.log("Deleting valid users:", validUsers);

      await Promise.all(
        validUsers.map(async (id) => {
          try {
            await API.singleuserDelete(id);
          } catch (err) {
            console.error(`Failed to delete user with ID ${id}:`, err);
          }
        })
      );

      toast.success("Users deleted successfully!");
      fetchglobalfields();
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete some users. Try again.");
    }
  };

  // single user delete
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;

    try {
      const res = await API.singleuserDelete(id);

      if (res.success) {
        toast.success("Deleted successfully");
        fetchglobalfields(); // Refresh the user list
      } else {
        toast.error(res.message || "Deletion failed");
      }
    } catch (err) {
      toast.error("Failed to delete");
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
    handleModuleList(event.target.value);
    console.log("Selected Status:", event.target.value);
  };
  const handleModuleChange = (event) => {
    setselectedModule(event.target.value);
    var module = event.target.value;
    console.log("Selected Status:", event.target.value);
    fetchglobalfields(module);
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
        <h2 className="text-xl font-bold sub-title">List of Global Fields</h2>
      </div>
      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
          <div className="status-select-option-dropdown first-left form-item">
            <select>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="status-select-option-dropdown first-left form-item">
            <select
              name="module"
              placeholder="Select Module"
              value={selectedModule}
              onChange={handleModuleChange}
            >
              <option>Select Module</option>
              {moduleOptions.map((module) => (
                <option value={module}>{module}</option>
              ))}
            </select>
          </div>

          <PopupModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <ConfirmDelete />
          </PopupModal>
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

          <div className="crm-buttonsection ">
            {/* <button onClick={toggleAddUserForm}>
         
              Add
            </button> */}
            <button
              onClick={() =>
                openPopup(
                  <AddUserForm
                    selectedModule="User"
                    selectedBusinessType="Admin"
                  />,
                  {
                    width: "sm",
                    transparent: true,
                    padding: "p-8",
                    position: "right",
                    height: "full",
                  }
                )
              }
            >
              {" "}
              <svg
                fill="white"
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
              </svg>
              Add Field
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
      ) : data && data.length > 0 ? (
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
      ) : (
        <div>No data available.</div>
      )}

      {/* Add User Form Sliding Panel */}

      <div className="flex justify-center m-auto">
        <div className="sideform fixed top-10 z-50 ">
          <div className="sidebar-inner transition-transform transform translate-x-0"></div>
        </div>
      </div>

      {/* Edit User Form Sliding Panel */}
      {isEditUserFormVisible && selectedUser && (
        <div className=" sideform fixed top-0 right-0 w-1/3 h-full  shadow-lg p-4 z-50 ">
          <div className="sidebar-inner bg-white p-4 transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm "
              onClick={toggleEditUserForm}
            >
              X
            </button>
            {console.log(selectedUser)}
            <EditUserForm user={selectedUser} />{" "}
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

export default GetUsers;
