import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import { getData, putData, domainpath } from "../../../Helpers/api.js";

const EditUserForm = ({ user, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const backendBase = domainpath.replace(/\/api\/?$/, "");
  const resolveImageUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/uploads/")) return `${backendBase}${value}`;
    return value;
  };

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([]);

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (!user) return;

    const fullName = user.name || "";
    const [firstName = "", ...rest] = fullName.split(" ");

    setFormData({
      firstName,
      lastName: rest.join(" "),
      gender: user.gender || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      email: user.email || "",
      phone: user.phone || "",

      currentStreet: user.currentAddress?.street || "",
      currentCity: user.currentAddress?.city || "",
      currentState: user.currentAddress?.state || "",
      currentPincode: user.currentAddress?.pincode || "",

      permanentStreet: user.permanentAddress?.street || "",
      permanentCity: user.permanentAddress?.city || "",
      permanentState: user.permanentAddress?.state || "",
      permanentPincode: user.permanentAddress?.pincode || "",

      employeeId: user.employeeId || "",
      rfid: user.rfid || "",
      joiningDate: user.joiningDate ? user.joiningDate.split("T")[0] : "",
      designation: user.designation || "",
      department: user.department || "",
      section: user.section || "",
      shift: user.shift || "",
      employmentType: user.employmentType || "",
      role: user.role || "",
      status: user.status || "",
      location: user.location || "",

      aadharcardnumber: user.bankDetails?.aadharcardnumber || "",
      pancard: user.bankDetails?.pancard || "",
      accountNumber: user.bankDetails?.accountNumber || "",
      ifscCode: user.bankDetails?.ifscCode || "",
    });

    setProfilePreview(
      resolveImageUrl(user?.profileImage || user?.profile_image || user?.photo || "")
    );
    document.body.style.overflow = "hidden";
    setTimeout(() => setOpen(true), 50);

    return () => (document.body.style.overflow = "auto");
  }, [user]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getData("/location");
        setLocations((res?.locations || []).map((loc) => loc.name).filter(Boolean));
      } catch (_err) {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const cancelProfileChange = () => {
    setProfileFile(null);
    setProfilePreview(
      resolveImageUrl(user?.profileImage || user?.profile_image || user?.photo || "")
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      setTimeout(() => onClose(), 200);
      return;
    }
    setTimeout(() => navigate("/dashboard/users/employees"), 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      if (profileFile) payload.append("profileImage", profileFile);

      const res = await putData(`/employee/${user?._id}`, payload);
      if (res?.success || res?.status === true || res?.status === 200) {
        toast.success("Employee updated successfully");
        if (onSuccess) {
          onSuccess();
          return;
        }
        navigate("/dashboard/users/employees");
      } else toast.error(res.message || "Update failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div
          className={`relative w-full max-w-3xl mx-4 bg-white rounded-xl shadow-2xl
          max-h-[90vh] overflow-y-auto transform transition-all duration-300
          ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
          >
            ✕
          </button>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Employee</h2>

            {/* PROFILE */}
            <div className="flex items-center gap-6 mb-8 employee-editform-userprofile">
              <div className="w-[120px] h-[150px] border rounded-md overflow-hidden bg-gray-100">
                <img
                  src={profilePreview || "https://via.placeholder.com/120x150"}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex flex-col gap-2">
                <input type="file" ref={fileRef} className="hidden" onChange={handleProfileSelect} />
                <button type="button" onClick={() => fileRef.current.click()} className="px-3 py-2 bg-blue-600 text-white rounded-md">
                  Choose Image
                </button>
                {profileFile && (
                  <button type="button" onClick={cancelProfileChange} className="px-3 py-2 border rounded-md">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <Section title="Personal Information" />
            <Grid>
              <Field label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <Field label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
              <Field label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
              <Field label="Email" name="email" value={formData.email} onChange={handleChange} />
              <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            </Grid>

            <Section title="Current Address" />
            <Grid>
              <Field label="Street" name="currentStreet" value={formData.currentStreet} onChange={handleChange} />
              <Field label="City" name="currentCity" value={formData.currentCity} onChange={handleChange} />
              <Field label="State" name="currentState" value={formData.currentState} onChange={handleChange} />
              <Field label="Pincode" name="currentPincode" value={formData.currentPincode} onChange={handleChange} />
            </Grid>

            <Section title="Permanent Address" />
            <Grid>
              <Field label="Street" name="permanentStreet" value={formData.permanentStreet} onChange={handleChange} />
              <Field label="City" name="permanentCity" value={formData.permanentCity} onChange={handleChange} />
              <Field label="State" name="permanentState" value={formData.permanentState} onChange={handleChange} />
              <Field label="Pincode" name="permanentPincode" value={formData.permanentPincode} onChange={handleChange} />
            </Grid>

            <Section title="Employment Details" />
            <Grid>
              <Field label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} />
              <Field label="RFID" name="rfid" value={formData.rfid} onChange={handleChange} />
              <Field label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
              <Field label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
              <SelectField label="Department" name="department" value={formData.department} onChange={handleChange} options={["Sales", "Marketing", "HR", "Finance", "IT", "Operations", "Manufacturing", "Art & Craft"]} />
              <SelectField label="Section" name="section" value={formData.section} onChange={handleChange} options={["Welding", "Electrical", "Assembly"]} />
              <SelectField label="Shift" name="shift" value={formData.shift} onChange={handleChange} options={["Morning", "Evening", "Night"]} />
              <SelectField label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange} options={["Full Time", "Part Time", "Intern", "Contract Basis"]} />

              {/* ✅ DROPDOWNS */}
              <SelectField label="Role" name="role" value={formData.role} onChange={handleChange} options={["employee", "admin", "hr", "manager", "supervisor", "contractor"]} />
              <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={["Active", "Inactive"]} />
              <SelectField label="Location" name="location" value={formData.location} onChange={handleChange} options={locations} />
            </Grid>

            <Section title="Bank Details" />
            <Grid>
              <Field label="Aadhar Number" name="aadharcardnumber" value={formData.aadharcardnumber} onChange={handleChange} />
              <Field label="PAN Card" name="pancard" value={formData.pancard} onChange={handleChange} />
              <Field label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
              <Field label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
            </Grid>

            <div className="mt-8 flex justify-end w-full">
              <button type="submit" disabled={loading} className="px-8 py-2 !mt-4 bg-blue-600 text-white rounded-md employe-editform-update-button">
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

/* ================= HELPERS ================= */

const Section = ({ title }) => (
  <h3 className="text-base font-semibold mt-8 mb-4">{title}</h3>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full border rounded-md !px-2 !py-2 border border-gray-500"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full border rounded-md !px-2 !py-2 border border-gray-500 bg-white"
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default EditUserForm;
