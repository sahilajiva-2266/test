import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { usePopup } from "../../../Helpers/PopupContext.js";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditUserForm from "./Edit.js";
import {
  API,
  getData,
  deleteData,
  putData,
  extractFieldsFromResponse,
} from "../../../Helpers/api.js";

import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../../popup/Popup.js";
import ConfirmDelete from "../../../popup/conformationdelet.js";
const CustomFieldsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [pagination, setPagination] = useState({
    totalrecords: 0,
    currentPage: 0,
    totalPages: 0,
    limit: 10,
  });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [isAddFormVisible, setisAddFormVisible] = useState(false);
  const [isEditFormVisible, setisEditFormVisible] = useState(false);
  const [editRecords, setEditRecords] = useState({});
  const [selectedrecord, setselectedrecord] = useState({});
  const [selectedrecords, setselectedrecords] = useState([]);
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
  const [selectedfieldids, setSelectedfieldids] = useState([]);
  const [records, setRecords] = React.useState([]);

  const [showPopup, setShowPopup] = useState(false);

  const [SelectedStatus, setSelectedStatus] = useState("");
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };
  const statusValues = ["Active", "Disabled", "Blocked"];
  const requiredValues = [true, false];

  const [searchTerm, setSearchTerm] = useState("");

  const handleCheckboxChange = (fieldid) => {
    setselectedrecords((prevSelected) =>
      prevSelected.includes(fieldid)
        ? prevSelected.filter((id) => id !== fieldid)
        : [...prevSelected, fieldid]
    );
  };
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchCustomfields();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleStatusChange = async (fieldids, newStatus) => {
    try {
      const usersArray = Array.isArray(fieldids) ? fieldids : [fieldids];

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
        fetchCustomfields();

        toast.success(result.message || "Status Updated Successfully");
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) { }
  };
  const handleSelectAllChange = () => {
    if (selectedrecords.length === data.length) {
      setselectedrecords([]);
    } else {
      setselectedrecords(data.map((user) => user.id));
    }
  };

  const fetchCustomfields = async () => {
    setLoading(true);
    setError(null);

    try {
      let reqPage = 0;

      if (typeof currentPage === "string") {
        reqPage = parseInt(currentPage) - 1;
      } else if (typeof currentPage === "number") {
        reqPage = currentPage - 1;
      }

      reqPage = reqPage < 0 ? 0 : reqPage;

      console.log("Sending API request with params:", {
        page: reqPage,
        limit: rowsPerPage,
      });

      const responseData = await API.getcustomfields(reqPage, rowsPerPage);

      console.log("API response received:", responseData);

      if (!responseData?.status) {
        console.error("API status is false:", responseData?.status);
        throw new Error(`Fetch failed. Status: ${responseData?.status}`);
      }

      if (Array.isArray(responseData?.data) && responseData.data.length > 0) {
        const flattenedData = responseData.data.flatMap((item) =>
          item.fields.map((field) => ({
            parentId: item.id,
            vendor_id: item.vendor_id,
            business_type: item.business_type,
            module: item.module,
            label: field.label,
            key: field.key,
            groupName: field.group,
            type: field.type,
            required: field.required,
            status: field.status,
          }))
        );

        setData(flattenedData);
        setTotalRows(responseData.pagination?.total || 0);

        console.log("Flattened data set for rendering:", flattenedData);
        console.log("Total rows set to:", responseData.pagination?.total || 0);
      } else {
        console.warn("⚠️ No data found in response.");
        setData([]); // clear data
        setError("No data found");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
      console.log("Fetch complete. Loading set to false.");
    }
  };

  useEffect(() => {
    console.log("Component mounted. Fetching custom fields...");
    fetchCustomfields();
  }, []);

  const showDeleteConfirmation = (fieldId, onConfirm) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="text-black">
            Are you sure you want to delete this field?
          </p>
          <div className="flex justify-end space-x-2 mt-2">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              onClick={async () => {
                closeToast();
                await onConfirm(fieldId);
              }}
            >
              Yes, Delete
            </button>
            <button
              className="bg-gray-300 text-black px-2 py-1 rounded text-sm"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };
  const handleDelete = async (fieldId) => {
    console.log("handleDelete triggered with fieldId:", fieldId);

    if (!fieldId) {
      toast.error("Field ID not found.");
      return;
    }

    showDeleteConfirmation(fieldId, async (confirmedFieldId) => {
      try {
        console.log(
          `Sending DELETE request to /global-fields/${confirmedFieldId}`
        );
        const response = await deleteData(
          `/global-fields/deletefield/${confirmedFieldId}`
        );
        console.log("DELETE response:", response);

        if (response?.status) {
          toast.success("Global field deleted successfully!");
          console.log("Field deleted:", confirmedFieldId);
        } else {
          toast.error(response?.message || "Failed to delete global field.");
          console.warn("Deletion failed:", response);
        }
      } catch (error) {
        console.error("Error deleting field:", error);
        toast.error("Something went wrong while deleting the field.");
      }
    });
  };

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectedrecords?.length === data?.length && data?.length > 0}
        />
      ),
      selector: (row) => (
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange(row.id)}
          checked={selectedrecords.includes(row.id)}
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
      name: "Group",
      selector: (row) => <span>{row.groupName}</span>,
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
      selector: (row, rowIndex) => (
        <div className="flex space-x-2 justify-center ">
          <div className="flex space-x-2  ">
            <button className="text-blue-500" onClick={() => handleEdit(row)}>
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
              onClick={() => handleDelete(row?._id)}
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

  const handleApplyClick = async () => {
    if (selectedrecords.length === 0) {
      toast.error("Select Row");
      return;
    }

    const validUsers = selectedrecords.filter((id) =>
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
        setselectedrecords("");
        fetchCustomfields();
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
    setSearchTerm(e.target.value);
    fetchCustomfields();
  };
  const handleEdit = (fieldid) => {
    console.log(fieldid);
    console.log(fieldid, "fieldid");
    setEditRecords(fieldid);
    setselectedrecord(fieldid);
    console.log(selectedrecord, "setselectedrecord");
    setisEditFormVisible(true);
  };

  const toggleEditUserForm = () => {
    setisEditFormVisible((prev) => !prev);
  };

  const handleDeleteUser = async () => {
    if (selectedrecords.length === 0) {
      toast.error("Select Row");
      return;
    }

    const validUsers = selectedrecords.filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (validUsers.length === 0) {
      toast.error("Invalid user IDs provided.");
      return;
    }

    try {
      await Promise.all(
        validUsers.map(async (id) => {
          try {
            await API.singleuserDelete(id);
          } catch (err) { }
        })
      );

      toast.success("Users deleted successfully!");
      fetchCustomfields();
    } catch (error) {
      toast.error("Failed to delete some users. Try again.");
    }
  };

  const toggleAddUserForm = () => {
    setisAddFormVisible((prev) => !prev);
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
  const fetchGroups = async (page = 0, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const responseData = await API.getGroups(page, limit);

      console.log("Group API response:", responseData);

      if (!responseData?.status) {
        throw new Error(`API error! status: ${responseData.status}`);
      }

      if (Array.isArray(responseData.data)) {
        setGroups(responseData.data);
        setPagination(responseData.pagination);
      } else {
        setGroups([]);
        setError("No groups found");
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setError(error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);
  return (
    <div className="relative p-4 ">
      <div className="list-user-title ">
        <h2 className="text-xl font-bold sub-title">List of Custom Fields</h2>
      </div>

      <div className="button-crm">
        <div className="status-dropdown-section flex gap-4">
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
            <button
              onClick={() =>
                openPopup(
                  <AddUserForm selectedModule="User" selectedBusinessType="" />,
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
      {error && <div className="text-red-500">{error}</div>}

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

      <div className="flex justify-center m-auto">
        <div className="sideform fixed top-10 z-50 ">
          <div className="sidebar-inner transition-transform transform translate-x-0"></div>
        </div>
      </div>

      {isEditFormVisible && selectedrecord && (
        <div className=" sideform fixed top-0 right-0 w-1/3 h-full  shadow-lg p-4 z-50 ">
          <div className="sidebar-inner bg-white p-4 transition-transform transform translate-x-0">
            <button
              className="upclick-cut text-red-500 float-left rounded-sm "
              onClick={toggleEditUserForm}
            >
              X
            </button>

            <EditUserForm user={editRecords} />
          </div>
        </div>
      )}

      {(isAddFormVisible || isEditFormVisible) && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default CustomFieldsList;
