import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useParams } from "react-router-dom";

import rules from "./Rules.js";

const Addfeilds = () => {
  const [fields, setFields] = useState([]);
  // const { businessType = "education", module = "student" } = useParams();
  const [businesstype, setBusinesstype] = useState([]);
  const [selectedBusinessType, setselectedBusinessType] = useState("");
  const [moduleOptions, setModuleOptions] = useState([]);
  const [selectedModule, setselectedModule] = useState("");

  const [loading, setLoading] = useState(false);

  const { businessType, module } = useParams();
  const [errors, setErrors] = useState({});

  const [fieldAdded, setFieldAdded] = useState(false);
  const [manualKeyEdit, setManualKeyEdit] = useState({});

  const generateKeyFromLabel = (label) => {
    return label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        name: "",
        hierarchy: "",
        required: false,
        status: "active",
      },
    ]);
  };
  const fetchBusinesstypes = async () => {
    try {
      let url;
      let responseData = await API.getBusinessTypes();

      if (responseData && responseData.data) {
        const updatedData = responseData.data.map((user) => {
          const capitalizedType = user.type
            ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
            : "Unknown";
          return { ...user, type: capitalizedType };
        });

        setBusinesstype(updatedData);
      }
    } catch (error) {
      // setError(error.message);
    }
  };
  const handleListStatusChange = (event) => {
    setselectedBusinessType(event.target.value);
    handleModuleList(event.target.value);
    console.log("Selected Status:", event.target.value);
  };

  const handleModuleList = (type) => {
    setselectedBusinessType(type);
    const found = businesstype.find(
      (item) => item.type.toLowerCase() === type.toLowerCase()
    );

    setModuleOptions(found ? found.modules : []);
  };
  useEffect(() => {
    if (!fieldAdded) {
      addField();
      setFieldAdded(true);
    }
  }, [fieldAdded]);

  const validator = new Validator(rules);
  // Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate({ fields }, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const handleChange = (id, key, value) => {
    if (key === "key") {
      setManualKeyEdit((prev) => ({ ...prev, [id]: true }));
    }

    setFields((prevFields) =>
      prevFields.map((f) => {
        if (f.id === id) {
          const updated = { ...f };

          // Toggle checkbox if it's the "group" key
          if (key === "group") {
            updated.group = !f.group;
            // Reset selectedGroup when group is unchecked
            if (!updated.group) {
              updated.selectedGroup = "";
            }
          } else {
            updated[key] = value;
          }

          // Auto-generate key from label unless manually edited
          if (key === "label" && !manualKeyEdit[id]) {
            updated.key = generateKeyFromLabel(value);
          }

          return updated;
        }
        return f;
      })
    );
  };

  const parseOptions = (optionText) => {
    return optionText
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [value, label] = line.split("|").map((s) => s.trim());
        return { value: value || label, label: label || value };
      });
  };
  const transformFieldsForAPI = () => {
    let permissions = {};
    fields.forEach((field) => {
      if (field.name) {
        permissions[field.name.toLowerCase()] = ["read"];
      }
    });

    return {
      name: fields[0]?.name || "",
      hierarchy: fields[0]?.hierarchy || "",
      status:
        fields[0]?.status.charAt(0).toUpperCase() + fields[0]?.status.slice(1),
      permissions,
      createdBy: "661d873c64c3a21b0fc44e1f",
    };
  };

  const [touched, setTouched] = useState({
    name: false,
  });
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };
  // Get field class name based on error state
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    // if (!isValid) {
    //   console.warn("❌ Form validation failed.");
    //   setLoading(false);
    //   return;
    // }

    const formData = {
      ...transformFieldsForAPI(),
      tenant_id: "680f1770266ebf59aa7a498a",
      business_type: "education",
      createdBy: "680f1770266ebf59aa7a498a",
    };

    console.log("📦 Final Payload to Send:", formData);

    try {
      const result = await API.add("role", formData); // POST /api/roles

      if (result.status === true) {
        toast.success("✅ Role created successfully!");
        setFields([]); // Reset the form or relevant state
      } else {
        toast.error(result.message || "❌ Failed to create Role.");
      }
    } catch (error) {
      console.error("❌ Error creating Role:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, index) => {
    const options = parseOptions(field.options || "");
  };

  return (
    <div className="bg-white rounded">
      <form className="p-6">
        <div>
          {fields.map((field, i) => {
            return (
              <div key={field.id} className="mb-6 pb-6">
                <div className="AJ-crm-add-feild-heading-section mb-4">
                  <h2 className="text-lg font-semibold">Add Role</h2>
                </div>

                {/* Label & Key Fields */}

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={field.name}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "name", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName("name")} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Name</label>
                </div>
                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="hierarchy"
                    value={field.hierarchy}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "hierarchy", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "hierarchy"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Hierarchy</label>
                </div>

                {/* Required, Multiple, Status */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Submit Button */}
                  <div className="AJ-crm-save w-full md:w-auto mt-6">
                    <button
                      type="submit"
                      onClick={(e) => handleSubmit(e)}
                      disabled={loading}
                      className="button-section w-full md:w-auto rounded"
                    >
                      {loading ? "Saving..." : "Add"}
                    </button>
                  </div>
                  <div className="AJ-floating-label-wrapper">
                    <select
                      value={field.status}
                      onChange={(e) =>
                        handleChange(field.id, "status", e.target.value)
                      }
                      className="AJ-floating-input"
                    >
                      <option value="active">Active</option>
                      <option value="Disabled">Disable</option>
                    </select>
                    <label className="AJ-floating-label">Status</label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </div>
  );
};

export default Addfeilds;
