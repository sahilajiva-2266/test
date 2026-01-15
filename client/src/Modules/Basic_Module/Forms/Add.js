import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import rules from "./Rules.js";
import Cookies from "js-cookie";

const Addform = () => {
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pagination, setPagination] = useState({
    totalrecords: 0,
    currentPage: 0,
    totalPages: 0,
    limit: 10,
  });

  const [businesstype, setBusinesstype] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setselectedGroup] = useState([]);
  const [selectedBusinessType, setselectedBusinessType] = useState("");

  const [selectedModule, setselectedModule] = useState("");
  const { businessType, module } = useParams();
  const [SelectedStatus, setSelectedStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [moduleOptions, setModuleOptions] = useState([]);

  const [fieldAdded, setFieldAdded] = useState(false);
  const [manualKeyEdit, setManualKeyEdit] = useState({});

  const generateKeyFromLabel = (label) => {
    return label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };
  const tenantId = localStorage.getItem("tenant_id");

  const vendor_id = Cookies.get("vendor_id");
  const addField = () => {
    setFields((prevFields) => [
      ...prevFields,
      {
        id: Date.now(),
        vendor_id: tenantId,
        label: "",
        type: "text",
        placeholder: "",
        options: [],
        required: false,
        status: "active",
        group: false,
        field_id: "",
        Field_class: "",
        selectedGroup: "",
        fieldWidth: "full",
        business_type: selectedBusinessType,
        module: selectedModule,
      },
    ]);
  };

  const validator = new Validator(rules);

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

          if (key === "group") {
            updated.group = !f.group;

            if (!updated.group) {
              updated.selectedGroup = "";
            }
          } else {
            updated[key] = value;
          }

          if (key === "label" && !manualKeyEdit[id]) {
            updated.key = generateKeyFromLabel(value);
          }

          return updated;
        }
        return f;
      })
    );
  };
  const fetchBusinesstypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.getAll("business_types");

      if (!response || response.status === false || !response.data) {
        throw new Error(response?.message || "Failed to fetch business types");
      }

      setBusinesstype(response.data);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleList = (type) => {
    setselectedBusinessType(type);

    const found = businesstype.find(
      (item) => item?.type?.toLowerCase() === type?.toLowerCase()
    );

    setModuleOptions(found?.modules || []);
  };

  // const fetchGroups = async (page = 0, limit = 10) => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const responseData = await API.getGroups(page, limit);

  //     console.log("Group API response:", responseData);

  //     if (!responseData?.status) {
  //       throw new Error(`API error! status: ${responseData.status}`);
  //     }

  //     if (Array.isArray(responseData.data)) {
  //       setGroups(responseData.data);
  //       setPagination(responseData.pagination);
  //     } else {
  //       setGroups([]);
  //       setError("No groups found");
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch groups:", error);
  //     setError(error.message || "Unknown error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const transformFieldsForAPI = () => {
    return fields.map((field) => {
      let parsedOptions = [];

      if (typeof field.options === "string") {
        parsedOptions = field.options
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [value, label] = line.split("|").map((s) => s.trim());
            return label || value;
          });
      } else if (Array.isArray(field.options)) {
        parsedOptions = field.options;
      }

      const transformed = {
        key: field.label.toLowerCase().replace(/\s+/g, "_"),
        label: field.label,
        vendor_id: field.vendor_id,
        field_id: field.field_id,
        Field_class: field.Field_class,
        type:
          field.type === "select" || field.type === "multiselect"
            ? "dropdown"
            : field.type === "textarea"
            ? "text"
            : field.type === "file"
            ? "file"
            : field.type,
        required: field.required || false,
        options: parsedOptions,
        multiple: field.type === "multiselect" || field.multiple || false,
        allowed_file_types:
          field.type === "file"
            ? field.allowed_file_types || [
                "jpg",
                "jpeg",
                "png",
                "pdf",
                "gif",
                "csv",
                "xlsx",
              ]
            : [],
        max_file_size: field.type === "file" ? field.max_file_size || 1024 : 0,
        fieldWidth: field.fieldWidth,
        status: field.status || "active",
        // ✅ vendor_id is no longer required inside each field
      };

      if (field.group && field.selectedGroup) {
        transformed.group = field.selectedGroup;
      }

      return transformed;
    });
  };

  const [touched, setTouched] = useState({
    label: false,
    key: false,
    placeholder: false,
    type: false,
    required: false,
    status: false,
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

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };
  const addNewField = addField;

  useEffect(() => {
    fetchBusinesstypes();
    // fetchGroups();

    if (!fieldAdded) {
      addField();
      setFieldAdded(true);
    }
  }, []);

  const handleListStatusChange = (event, fieldId) => {
    const value = event.target.value;
    setSelectedStatus(value);
    handleModuleList(value);
    handleChange(fieldId, "business_type", value);
  };
  const handleModuleChange = (event, fieldId) => {
    const value = event.target.value;
    setselectedModule(value);
    handleChange(fieldId, "selectedModule", value);
  };
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔄 Form submission started...");

    const isValid = await validateForm();
    // if (!isValid) {
    //   toast.error("Please fix the validation errors before submitting.");
    //   setLoading(false);
    //   return;
    // }

    const accessToken = localStorage.getItem("accesstoken");
    const tokenPayload = parseJwt(accessToken);
    const tenantId = tokenPayload?.tenant_id || null;

    console.log("🧾 Access Token Decoded:", tokenPayload);
    console.log("🏢 Tenant ID:", tenantId);

    const transformedFields = fields.map((field) => {
      let parsedOptions = [];
      if (typeof field.options === "string") {
        parsedOptions = field.options
          .split(",")
          .map((opt) => opt.trim())
          .filter((opt) => opt !== "");
      } else if (Array.isArray(field.options)) {
        parsedOptions = field.options;
      }

      return {
        key: generateKeyFromLabel(field.name),
        label: field.name,
        vendor_id: tenantId,
        field_id: field.field_id,
        Field_class: field.Field_class,
        type:
          field.type === "select" || field.type === "multiselect"
            ? "dropdown"
            : field.type === "textarea"
            ? "text"
            : field.type === "file"
            ? "file"
            : field.type,
        required: field.required || false,
        options: parsedOptions,
        multiple: field.type === "multiselect" || field.multiple || false,
        allowed_file_types:
          field.type === "file"
            ? field.allowed_file_types || [
                "jpg",
                "jpeg",
                "png",
                "pdf",
                "gif",
                "csv",
                "xlsx",
              ]
            : [],
        max_file_size: field.type === "file" ? field.max_file_size || 1024 : 0,
        fieldWidth: field.fieldWidth,
        status: field.status || "active",
        ...(field.group && field.selectedGroup
          ? { group: field.selectedGroup }
          : {}),
      };
    });

    const formData = {
      vendor_id: "680f1770266ebf59aa7a498a",
      name: selectedModule,
      tenant_id: "680f1770266ebf59aa7a498a",
      business_type: selectedBusinessType,
      module: selectedModule,
      fields: transformedFields,
      createdBy: "680f1770266ebf59aa7a498a",
    };

    console.log("📦 Final Form Payload to Submit:", formData);

    try {
      let result;

      if (selectedModule === "form") {
        console.log("🚀 Sending form to STATIC /form endpoint...");
        result = await API.createForm(formData, {
          headers: {
            "x-tenant-id": tenantId,
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        console.log("🧠 Using UNIVERSAL controller to create form...");
        result = await API.add("form", formData);
      }

      console.log("✅ API Response:", result);

      if (result.status === true) {
        toast.success("Form created successfully!");
        setFields([]);
      } else {
        toast.error(result.message || "Failed to create form.");
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      console.log("✅ Form submission completed.");
    }
  };

  return (
    <div className="bg-white rounded p-4">
      <form className="p-6">
        {/* Hidden inputs */}
        <input type="hidden" name="module" value={selectedModule} />
        <input type="hidden" name="businessType" value={selectedBusinessType} />

        {/* Form Metadata Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="AJ-crm-add-feild-heading-section mb-4">
            <h2 className="text-lg font-semibold">Form Details</h2>
          </div>

          {/* Form Name */}
          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              name="form_name"
              value={selectedModule}
              onChange={(e) => setselectedModule(e.target.value)}
              className="AJ-floating-input"
              placeholder=" "
            />
            <label className="AJ-floating-label">Form Name</label>
          </div>

          {/* Business Type */}
          <div className="AJ-floating-label-wrapper">
            <select
              name="business_type"
              value={selectedBusinessType}
              onChange={(e) => handleModuleList(e.target.value)}
              className="AJ-floating-input bg-white"
            >
              <option value="">Select Business Type</option>
              {businesstype.map((bt) => (
                <option key={bt.type} value={bt.type}>
                  {bt.display_name}
                </option>
              ))}
            </select>
            <label className="AJ-floating-label">Business Type</label>
          </div>

          {/* Module */}
          <div className="AJ-floating-label-wrapper">
            <select
              name="module"
              value={selectedModule}
              onChange={(e) => setselectedModule(e.target.value)}
              className="AJ-floating-input bg-white"
            >
              <option value="">Select Module</option>
              {moduleOptions.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
            <label className="AJ-floating-label">Module</label>
          </div>
        </div>

        {/* Form Fields Section */}
        <div>
          {fields.map((field, i) => {
            const showOptions = [
              "select",
              "multiselect",
              "radio",
              "checkbox",
            ].includes(field.type);

            return (
              <div
                key={field.id}
                className="mb-6 pb-6 border-b border-gray-200"
              >
                <div className="AJ-crm-add-feild-heading-section mb-4">
                  <h2 className="text-lg font-semibold">Add Form Field</h2>
                </div>

                {/* Field Label */}
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
                  <label className="AJ-floating-label">Field Label</label>
                </div>

                {/* Field Type */}
                <div className="AJ-floating-label-wrapper">
                  <select
                    name="type"
                    value={field.type}
                    onChange={(e) =>
                      handleChange(field.id, "type", e.target.value)
                    }
                    className="AJ-floating-input bg-white"
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

                {/* Conditional Options */}
                {showOptions && (
                  <div className="AJ-floating-label-wrapper">
                    <input
                      type="text"
                      placeholder="Enter options separated by commas"
                      value={field.options}
                      onChange={(e) =>
                        handleChange(field.id, "options", e.target.value)
                      }
                      className="AJ-floating-input"
                    />
                    <label className="AJ-floating-label">
                      Options (comma-separated)
                    </label>
                  </div>
                )}

                {/* Business Type */}
                <div className="AJ-floating-label-wrapper">
                  <select
                    name="business_type"
                    placeholder="Select Business Type"
                    value={field.business_type}
                    onChange={(e) => handleListStatusChange(e, field.id)}
                    className="AJ-floating-input bg-white"
                  >
                    <option>Select Business Type</option>
                    {businesstype.map((types) => (
                      <option key={types.type} value={types.type}>
                        {types.display_name}
                      </option>
                    ))}
                  </select>
                  <label className="AJ-floating-label">Business Type</label>
                </div>

                {/* Module */}
                <div className="AJ-floating-label-wrapper">
                  <select
                    name="module"
                    placeholder="Select Module"
                    value={field.selectedModule}
                    onChange={(e) => handleModuleChange(e, field.id)}
                    className="AJ-floating-input bg-white"
                  >
                    <option>Select Module</option>
                    {moduleOptions.map((module) => (
                      <option key={module} value={module}>
                        {module}
                      </option>
                    ))}
                  </select>
                  <label className="AJ-floating-label">Module</label>
                </div>

                {/* Required Checkbox */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="AJ-section-group">Required</div>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      handleChange(field.id, "required", e.target.checked)
                    }
                  />
                </div>

                {/* Status Select */}
                <div className="AJ-floating-label-wrapper mt-4">
                  <select
                    value={field.status}
                    onChange={(e) =>
                      handleChange(field.id, "status", e.target.value)
                    }
                    className="AJ-floating-input"
                  >
                    <option value="active">Active</option>
                    <option value="disable">Disable</option>
                  </select>
                  <label className="AJ-floating-label">Status</label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons Section */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            type="button"
            onClick={addNewField}
            className="btn btn-primary w-half flex justify-end"
          >
            + Add New
          </button>

          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addform;
