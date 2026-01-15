import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API, getData } from "../../../Helpers/api.js";

const AddVisitorForm = ({ onSuccess, onClose }) => {
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => setOpen(true), 20);
    return () => (document.body.style.overflow = "auto");
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    try {
      const res = await API.add("visitors", formData);
      if (res?.success || res?.status) {
        toast.success("Visitor created successfully");
        onSuccess ? onSuccess(res) : navigate("/dashboard/users/visitors");
      } else {
        toast.error(res.message || "Failed to create visitor");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      onClose ? onClose() : navigate("/dashboard/users/visitors");
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center !m-auto">
      <div
        className={`add-newemployee-popup-form relative w-full max-w-3xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300
          ${open ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 !mr-0 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
        >
          ✕
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Add New Visitor</h2>

          <form onSubmit={handleSubmit} noValidate>
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

            <Section title="Personal Information" />
            <Grid>
              <Field label="First Name" name="firstName" />
              <Field label="Last Name" name="lastName" />
              <SelectField label="Gender *" name="gender" options={["Male", "Female", "Other"]} />
              <Field label="Date of Birth" name="dob" type="date" />
              <Field label="Email" name="email" />
              <Field label="Phone" name="phone" />
            </Grid>

            <Section title="Current Address" />
            <Grid>
              <Field label="Street" name="currentAddress.street" />
              <Field label="City" name="currentAddress.city" />
              <Field label="State" name="currentAddress.state" />
              <Field label="Pincode" name="currentAddress.pincode" />
            </Grid>

            <Section title="Permanent Address" />
            <Grid>
              <Field label="Street" name="permanentAddress.street" />
              <Field label="City" name="permanentAddress.city" />
              <Field label="State" name="permanentAddress.state" />
              <Field label="Pincode" name="permanentAddress.pincode" />
            </Grid>

            <Section title="Visitor Details" />
            <Grid>
              <Field label="Visitor ID" name="employeeId" />
              <Field label="RFID" name="rfid" />
              <SelectField label="Role" name="role" options={["visitor"]} />
              <SelectField label="Status" name="status" options={["Active", "Inactive"]} />
              <SelectField label="Location" name="location" options={locations} />
            </Grid>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 add-employee-submit-button"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title }) => (
  <h3 className="text-base font-semibold text-gray-800 mt-8 mb-4">
    {title}
  </h3>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
);

const Field = ({ label, name, type = "text", defaultValue }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      defaultValue={defaultValue}
      className="w-full h-[42px] border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, options, defaultValue }) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className="w-full border rounded-md px-3 h-[42px]"
    >
      <option value=""></option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default AddVisitorForm;
