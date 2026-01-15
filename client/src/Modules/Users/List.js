import React, { useState, useEffect, useRef } from "react";
import CustomDataTable from "../../Common/Customsdatatable.js";
import { useNavigate } from "react-router-dom";
import AddUserForm from "./Add.js";
import EditUserForm from "./Edit.js";
import { usePopup } from "../../Helpers/PopupContext.js";
import { API } from "../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "../../popup/Popup.js";
import debounce from "lodash.debounce";

const GetUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserFormVisible, setIsAddUserFormVisible] = useState(false);
  const [isEditUserFormVisible, setIsEditUserFormVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const { openPopup } = usePopup();

  const statusValues = ["Active", "Disabled", "Blocked"];

  // ✅ Fetch Employees
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage > 0 ? currentPage - 1 : 0,
        limit: rowsPerPage,
      };

      const responseData = await API.getAll("employees", params);

      if (responseData?.employees?.length) {
        setData(responseData.employees);
        setTotalRows(responseData.total);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (error) {
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage]);

  // ✅ Debounced search
  const fetchSearchResults = async (term) => {
    try {
      const response = await API.search("employees", term, 0, rowsPerPage);
      if (response?.employees?.length) {
        setData(response.employees);
        setTotalRows(response.total);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const debouncedSearch = debounce(fetchSearchResults, 300);
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term.trim());
  };

  // ✅ Handle Delete
  const handleDelete = async (id) => {
    try {
      const res = await API.remove("employees", id);
      if (res?.status || res?.success) {
        toast.success("Employee deleted successfully");
        fetchUsers();
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      toast.error("Server error while deleting employee");
    }
  };

  // ✅ Handle Edit click
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditUserFormVisible(true);
  };

  // ✅ Handle Add click
  const toggleAddUserForm = () => {
    setIsAddUserFormVisible((prev) => !prev);
  };

  const toggleEditUserForm = () => {
    setIsEditUserFormVisible((prev) => !prev);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => `${row.firstName} ${row.lastName}`,
      width: "20%",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      width: "20%",
    },
    {
      name: "Designation",
      selector: (row) => row.designation,
      width: "15%",
    },
    {
      name: "Role",
      selector: (row) => row.role,
      width: "10%",
    },
    {
      name: "Actions",
      width: "15%",
      selector: (row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-500"
            onClick={() => handleEdit(row)}
            title="Edit Employee"
          >
            ✏️
          </button>
          <button
            className="text-red-500"
            onClick={() => handleDelete(row._id)}
            title="Delete Employee"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="relative p-4 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Employee List</h2>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded p-2"
          />
          <button
            onClick={toggleAddUserForm}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <CustomDataTable
          columns={columns}
          data={data}
          totalRows={totalRows}
          rowsPerPageOptions={[10, 20, 50]}
          defaultRowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
        />
      )}

      {/* Add Employee Side Panel */}
      {isAddUserFormVisible && (
        <div className="sideform fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg z-50">
          <div className="p-4">
            <button
              className="text-red-600 font-bold float-right"
              onClick={toggleAddUserForm}
            >
              ✕
            </button>
            <AddUserForm />
          </div>
        </div>
      )}

      {/* Edit Employee Side Panel */}
      {isEditUserFormVisible && selectedUser && (
        <div className="sideform fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg z-50">
          <div className="p-4">
            <button
              className="text-red-600 font-bold float-right"
              onClick={toggleEditUserForm}
            >
              ✕
            </button>
            <EditUserForm user={selectedUser} />
          </div>
        </div>
      )}

      {/* Dim background */}
      {(isAddUserFormVisible || isEditUserFormVisible) && (
        <div className="fixed inset-0 bg-black opacity-40 z-40"></div>
      )}
    </div>
  );
};

export default GetUsers;
