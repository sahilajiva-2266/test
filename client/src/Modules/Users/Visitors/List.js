import React, { useEffect, useState } from "react";
import CustomDataTable from "../../../Common/Customsdatatable.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API, deleteData } from "../../../Helpers/api.js";
import { useUser } from "../../../Helpers/Context/UserContext.js";
import { capitalizeFirstLetter } from "../../../Helpers/CapitalizeFirstLetter.js";

const VisitorsList = () => {
  const { user } = useUser();
  const role = String(user?.role || "").toLowerCase();
  const canManageVisitors = role === "superadmin" || role === "admin";
  const canCreateVisitors =
    role === "superadmin" || role === "admin" || role === "hr" || role === "manager";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const navigate = useNavigate();

  const fetchVisitors = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.getVisitors(searchTerm, currentPage, rowsPerPage, {
        sessionStatus: sessionFilter || undefined,
      });
      if (Array.isArray(response.visitors)) {
        setData(response.visitors);
        setTotalRows(
          response.total ??
          response.pagination?.totalrecords ??
          response.visitors.length
        );
      } else {
        setError("No visitor data found");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [currentPage, rowsPerPage, searchTerm, sessionFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const statusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();
    const isLoggedIn = normalized === "logged in";
    return (
      <span
        className={`px-3 py-0.5 rounded-lg font-medium text-sm ${
          isLoggedIn
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-600 border border-red-300"
        }`}
      >
        {status || "Logout"}
      </span>
    );
  };

  const handleDelete = async (row) => {
    if (!row?._id && !row?.id) return;
    if (!window.confirm("Are you sure you want to delete this visitor?")) return;
    try {
      const res = await deleteData(`/visitors/${row._id || row.id}`);
      if (res?.status === true || res?.success === true) {
        toast.success("Visitor deleted successfully");
        fetchVisitors();
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const columns = [
    {
      name: "Visitor ID",
      selector: (row) => row.employeeId || row._id,
      width: "15%",
    },
    {
      name: "Name",
      selector: (row) => capitalizeFirstLetter(row.name || "-"),
      width: "18%",
    },
    {
      name: "RFID",
      selector: (row) => row.rfid || "-",
      width: "15%",
    },
    {
      name: "Email",
      selector: (row) => row.email || "-",
      width: "15%",
    },
    {
      name: "Session",
      selector: (row) => statusBadge(row.sessionStatus),
      width: "15%",
    },
    {
      name: "Created",
      selector: (row) => formatDate(row.createdAt),
      width: "22%",
    },
    ...(canManageVisitors
      ? [
          {
            name: "Actions",
            width: "15%",
            selector: (row) => (
              <div className="flex space-x-2 justify-center">
                <div className="flex space-x-2">
                  <button
                    className="text-blue-500"
                    onClick={() =>
                      navigate(`/dashboard/users/visitors/edit/${row.id || row._id}`)
                    }
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
                <div className="flex space-x-2">
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(row)}
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


  return (
    <div className="m-0">
      <div className="relative p-4 !m-0">
        <div className="bg-white p-4 rounded-lg text-gray-700 font-semibold text-xl flex gap-4 list-user-title">
          <svg
            width="20"
            fill="navy-blue"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"></path>
          </svg>
          List of Visitors
        </div>

        <div className="button-crm">
          <div className="status-dropdown-section flex gap-4">
            <div className="input-search-bar flex">
              <input
                type="text"
                id="search"
                name="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="border rounded p-2"
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

            <div className="status-select-option-dropdown first-left form-item">
              <select
                name="sessionStatus"
                value={sessionFilter}
                onChange={(e) => {
                  setSessionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Sessions</option>
                <option value="Logged In">Logged In</option>
                <option value="Logout">Logout</option>
              </select>
            </div>
          </div>
          {canCreateVisitors && (
            <div className="add-new-employee-button">
              <button
                className="crm-buttonsection"
                onClick={() => navigate("/dashboard/users/visitors/add")}
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
                Add Visitors
              </button>
            </div>
          )}
        </div>

        {error && <div className="text-red-500">{error}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <CustomDataTable
            columns={columns}
            data={data}
            totalRows={totalRows}
            rowsPerPageOptions={[10, 20, 50, 100]}
            defaultRowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            currentPage={currentPage}
          />
        )}
      </div>
    </div>
  );
};

export default VisitorsList;
