import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API, getData } from "../../Helpers/api.js";
import { useUser } from "../../Helpers/Context/UserContext.js";

const AddUserForm = ({ onSuccess, onClose }) => {
  const [formError, setFormError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();
  const role = String(user?.role || "").toLowerCase();
  const roleOptions =
    role === "hr" || role === "manager"
      ? ["employee", "contractor", "supervisor"]
      : ["employee", "admin", "hr", "manager", "supervisor", "contractor"];

  /* ================= OPEN POPUP ================= */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => setOpen(true), 20);
    return () => (document.body.style.overflow = "auto");
  }, []);

  /* ================= IMAGE PREVIEW ================= */
  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }
    const url = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

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

  const handleProfileImageChange = (e) => {
    setProfileImageFile(e.target.files?.[0] || null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    try {
      const res = await API.add("employees/add", formData);
      if (res?.success || res?.status) {
        toast.success("Employee created successfully");
        onSuccess ? onSuccess(res) : navigate("/dashboard/users/employees");
      } else {
        toast.error(res.message || "Failed to create employee");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      onClose ? onClose() : navigate(-1);
    }, 200);
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center !m-auto">
      <div
        className={`add-newemployee-popup-form relative w-full max-w-3xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300
          ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 !mr-0 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
        >
          ✕
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Add New Employee</h2>

          <form onSubmit={handleSubmit} noValidate>

            {/* PROFILE */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <div className="w-[120px] h-[150px] border rounded-md bg-gray-100 overflow-hidden">
                <img
                  src={
                    profileImagePreview ||
                    "https://via.placeholder.com/120x150?text=Profile"
                  }
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Upload Profile Image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="text-sm !px-0"
                />
              </div>
            </div>

            {/* ================= PERSONAL INFORMATION ================= */}
            <Section title="Personal Information" />
            <Grid>
              <Field label="First Name" name="firstName" />
              <Field label="Last Name" name="lastName" />
              <SelectField label="Gender *" name="gender" options={["Male", "Female", "Other"]} />
              <Field label="Date of Birth" name="dob" type="date" />
              <Field label="Email" name="email" />
              <Field label="Phone" name="phone" />
            </Grid>

            {/* ================= CURRENT ADDRESS ================= */}
            <Section title="Current Address" />
            <Grid>
              <Field label="Street" name="currentAddress.street" />
              <Field label="City" name="currentAddress.city" />
              <Field label="State" name="currentAddress.state" />
              <Field label="Pincode" name="currentAddress.pincode" />
            </Grid>

            {/* ================= PERMANENT ADDRESS ================= */}
            <Section title="Permanent Address" />
            <Grid>
              <Field label="Street" name="permanentAddress.street" />
              <Field label="City" name="permanentAddress.city" />
              <Field label="State" name="permanentAddress.state" />
              <Field label="Pincode" name="permanentAddress.pincode" />
            </Grid>

            {/* ================= EMPLOYMENT DETAILS ================= */}
            <Section title="Employment Details" />
            <Grid>
              <Field label="Employee ID" name="employeeId" />
              <Field label="RFID" name="rfid" />
              <Field label="Joining Date" name="joiningDate" type="date" />
              <Field label="Designation" name="designation" />
              <SelectField label="Department" name="department" options={["Sales", "Marketing", "HR", "Finance", "IT", "Operations", "Manufacturing", "Art & Craft"]} />
              <SelectField label="Section" name="section" options={["Welding", "Electrical", "Assembly"]} />
              <SelectField label="Shift" name="shift" options={["Morning", "Evening", "Night"]} />
              <SelectField label="Employment Type" name="employmentType" options={["Full Time", "Part Time", "Intern", "Contract Basis"]} />
              <SelectField label="Role" name="role" options={roleOptions} />
              <SelectField label="Status" name="status" options={["Active", "Inactive"]} />
              <SelectField label="Location" name="location" options={locations} />
            </Grid>

            {/* ================= BANK DETAILS ================= */}
            <Section title="Bank Details" />
            <Grid>
              <Field label="Aadhar Number" name="aadharcardnumber" />
              <Field label="PAN Card" name="pancard" />
              <Field label="Account Number" name="accountNumber" />
              <Field label="IFSC Code" name="ifscCode" />
            </Grid>

            {/* SUBMIT */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 add-employee-submit-button"
              >
                Submit
              </button>
            </div>

            {formError && (
              <div className="text-red-600 text-sm mt-4">{formError}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Section = ({ title }) => (
  <h3 className="text-base font-semibold text-gray-800 mt-8 mb-4">
    {title}
  </h3>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
);

const Field = ({ label, name, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="w-full h-[42px] border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, options }) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <select name={name} className="w-full border rounded-md px-3 h-[42px]">
      <option value=""></option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default AddUserForm;
