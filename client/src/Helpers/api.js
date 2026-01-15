// //================================================= Api Request Method Ends ====================================
// *****************************************************new dynamic api starts here****************************************//

import axios from "axios";
import { toast } from "react-toastify";

// ---------------- Get Subdomain ---------------- //
const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  if (host.includes("localhost") && parts.length === 2) return parts[0];
  if (parts.length > 2) return parts[0];
  return null;
};

const subdomain = getSubdomain();

const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;
console.log("domainpathUrl", domainpath);
// const domainpath = subdomain
//   ? `http://${subdomain}.localhost:5000/api`
//   : `http://localhost:5000/api`;

// ---------------- Token Expiry Handler ---------------- //
const handleTokenExpiry = () => {
  localStorage.removeItem("accesstoken");
  localStorage.removeItem("refreshtoken");

  document.cookie = "accesstoken=; Max-Age=0; path=/;";
  document.cookie = "refreshtoken=; Max-Age=0; path=/;";

  toast.error("Session expired. Please login again.");
  setTimeout(() => (window.location.href = "/login"), 2500);
};

// ---------------- Axios Request Wrapper ---------------- //
const makeRequest = async (
  method,
  url,
  data = {},
  params = {},
  customHeaders = {}
) => {
  const token = localStorage.getItem("accesstoken");
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  try {
    const response = await axios({
      method,
      url: `${domainpath}${url}`,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Authorization: token ? `Bearer ${token}` : "",
        ...customHeaders,
      },
      data,
      params,
    });

    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      handleTokenExpiry();
    }

    const msg =
      error?.response?.data?.message || "Something went wrong. Try again!";
    toast.error(msg);

    console.error(
      `[API ${method.toUpperCase()}] ${url}:`,
      error.response || error
    );
    throw error;
  }
};

// ---------------- Query Builder ---------------- //
const buildQuery = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });
  return queryParams.toString() ? `?${queryParams.toString()}` : "";
};

// ---------------- Helper: Schema Field Extractor ---------------- //
const extractGlobalFieldsFromResponse = (response, options = {}) => {
  const { onlyActive = false } = options;

  if (!Array.isArray(response?.data)) return [];

  const allFields = response.data.flatMap((schema) => {
    return schema.fields.map((field) => ({
      ...field,
      groupId: field.group,
      business_type: schema.business_type,
      module: schema.module,
      tenant_id: schema.tenant_id,
    }));
  });

  return onlyActive
    ? allFields.filter((field) => field.status === "active")
    : allFields;
};

// ---------------- Core Methods ---------------- //
const getData = (url, params = {}, headers = {}) =>
  makeRequest("get", url, {}, params, headers);

const postData = (url, data = {}, headers = {}) =>
  makeRequest("post", url, data, {}, headers);

const putData = (url, data = {}, headers = {}) =>
  makeRequest("put", url, data, {}, headers);

const deleteData = (url, data = {}, headers = {}) =>
  makeRequest("delete", url, data, {}, headers);

// ---------------- Dynamic CRUD API ---------------- //
const API = {
  auth: {
    login: "/auth/login",
    qrLogin: "/auth/qr-login",
    forgotPassword: "/auth/forgot-password",
    verifyOtp: "/auth/verify-otp",
    resetPassword: "/auth/reset-password",
  },

  shift: {
    getAll: (params = {}) => getData("/shift", params),
    getById: (id) => getData(`/shift/${id}`),
    add: (data) => postData("/shift", data),
    update: (id, data) => putData(`/shift/${id}`, data),
    remove: (id) => deleteData(`/shift/${id}`),
    bulkRemove: (data) => postData("/shift/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/shift/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  // Generic CRUD methods
  // getAll: (params) => getData("/sections/all", params),
  getById: (module, id) => getData(`/${module}/${id}`),
  add: (module, data) => postData(`/${module}`, data),
  update: (module, id, data) => putData(`/${module}/${id}`, data),
  search: (module, searchTerm, page = 0, limit = 10, filters = {}) =>
    getData(`/${module}/search`, {
      search: searchTerm,
      page,
      limit,
      ...filters,
    }),
  remove: (module, id) => deleteData(`/${module}/${id}`),
  bulkRemove: (module, data) => postData(`/${module}/delete`, data),

  // Specific endpoints
  getSingleForm: (params) => getData("/form/single", params),

  getEmployees: (search = "", page = 0, limit = 10, filters = {}) =>
    getData("/employees/all", {
      search,
      page,
      limit,
      ...filters,
    }),

  getVisitors: (search = "", page = 0, limit = 10, filters = {}) =>
    getData("/visitors/all", {
      search,
      page,
      limit,
      ...filters,
    }),

  updateStatus: (data) => putData("/employees/status", data),

  // ✅ Fixed Login API (NO double /api)
  login: (data) => postData("/auth/login", data),

  // ✅ Section-specific helpers

  section: {
    getAll: (params) => getData("/sections/all", params),
    getAll: (params = {}) => getData("/sections", params),
    getById: (id) => getData(`/sections/${id}`),
    add: (data) => postData("/sections", data),
    update: (id, data) => putData(`/sections/${id}`, data),
    remove: (id) => deleteData(`/sections/${id}`),
    bulkRemove: (data) => postData("/sections/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/sections/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  rfid: {
    getAll: (params) => getData("/rfid", params),
    getById: (id) => getData(`{{url}}/api/rfid/${id}`),
    add: (data) => postData("{{url}}/api/rfid", data),
    update: (id, data) => putData(`{{url}}/api/rfid/${id}`, data),
    remove: (id) => deleteData(`{{url}}/api/rfid/${id}`),
    bulkRemove: (data) => postData("{{url}}/api/rfid/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("{{url}}/api/rfid/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  // ✅ Attendance-specific helpers
  attendance: {
    getAll: (params) => getData("/attendance/all", params),
    getById: (id) => getData(`/attendance/${id}`),
    add: (data) => postData("/attendance", data),
    update: (id, data) => putData(`/attendance/${id}`, data),
    remove: (id) => deleteData(`/attendance/${id}`),
    bulkRemove: (data) => postData("/attendance/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/attendance/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  contractor: {
    getAll: (params = {}) => getData("/contractors/", params),
    getById: (id) => getData(`/contractors/${id}`),
    add: (data) => postData("/contractors", data),
    update: (id, data) => putData(`/contractors/${id}`, data),
    remove: (id) => deleteData(`/contractors/${id}`),
    bulkRemove: (data) => postData("/contractors/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/contractors/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },
};

export {
  API,
  domainpath,
  getData,
  postData,
  putData,
  deleteData,
  extractGlobalFieldsFromResponse,
};

// *****************************************************new dynamic api ends here****************************************//
