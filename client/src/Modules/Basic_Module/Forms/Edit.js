import React, { useEffect, useState } from "react";
import {toast} from "react-toastify";
import { API } from "../../../Helpers/api";
import { useParams } from "react-router-dom";

const EditForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    business_type: "",
    module: "",
    fields: [],
  });

  console.log("formData", formData);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch form data by ID
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const accessToken = localStorage.getItem("accesstoken");
        const res = await API.getforms(id, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("res--resresres", res);
        if (res.status === true) {
          const data = res.data; // This is the array of objects
          const names = data.map((item) => item.name);
          console.log("names------", names);
          const business_types = data.map((item) => item.business_type);
          console.log("business_types------", business_types);
          const moduless = data.map((item) => item.module);
          console.log("module------", moduless);


          // Set default structure to avoid undefined values
          setFormData({
            name: names || "",
            business_type: business_types || "",
            module: moduless || "",
            fields: Array.isArray(data?.fields) ? data.fields : [],
          });
        } else {
          toast.error("Failed to fetch form data.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching form data.");
      }
    };

    fetchForm();
  }, [id]);

  // Handle input field changes
  const handleChange = (e, fieldId = null) => {
    const { name, value } = e.target;

    if (fieldId !== null) {
      setFormData((prev) => ({
        ...prev,
        fields: prev.fields.map((f, i) =>
          i === fieldId ? { ...f, [name]: value } : f
        ),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.Updateform(id, formData); // ✅ Pass formData here
      console.log("res------>", res);
      if (res.status) {
        toast.success("Form updated successfully!");
      } else {
        toast.error(res.message || "Failed to update form.");
      }
    } catch (err) {
      console.error("❌ FULL ERROR OBJECT:", err);
      console.error("❌ ERROR RESPONSE:", err?.response?.data);
      console.error("❌ ERROR MESSAGE:", err.message);
      toast.error("An error occurred while updating the form.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="bg-white rounded p-4">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Edit Form</h2>

        {/* Static Form Inputs */}
        <div className="AJ-floating-label-wrapper">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="AJ-floating-input"
            placeholder=" "
          />
          <label className="AJ-floating-label">Form Name</label>
        </div>

        <div className="AJ-floating-label-wrapper">
          <input
            type="text"
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className="AJ-floating-input"
            placeholder=" "
          />
          <label className="AJ-floating-label">Business Type</label>
        </div>

        <div className="AJ-floating-label-wrapper">
          <input
            type="text"
            name="module"
            value={formData.module}
            onChange={handleChange}
            className="AJ-floating-input"
            placeholder=" "
          />
          <label className="AJ-floating-label">Module</label>
        </div>

        {/* Dynamic Fields */}
        {formData.fields.map((field, i) => (
          <div key={i} className="mb-6 border-b border-gray-200 pb-4">
            <h3 className="font-semibold mb-2">Field #{i + 1}</h3>

            <div className="AJ-floating-label-wrapper">
              <input
                type="text"
                name="label"
                value={field.label}
                onChange={(e) => handleChange(e, i)}
                className="AJ-floating-input"
                placeholder=" "
              />
              <label className="AJ-floating-label">Field Label</label>
            </div>

            <div className="AJ-floating-label-wrapper">
              <select
                name="type"
                value={field.type}
                onChange={(e) => handleChange(e, i)}
                className="AJ-floating-input"
              >
                <option value="">Select Field Type</option>
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi Select</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <label className="AJ-floating-label">Field Type</label>
            </div>

            {(field.type === "select" ||
              field.type === "multiselect" ||
              field.type === "radio" ||
              field.type === "checkbox") && (
                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="options"
                    value={
                      Array.isArray(field.options)
                        ? field.options.join(", ")
                        : field.options
                    }
                    onChange={(e) => handleChange(e, i)}
                    className="AJ-floating-input"
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">
                    Options (comma-separated)
                  </label>
                </div>
              )}
          </div>
        ))}

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Form"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditForm;
