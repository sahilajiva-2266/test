import React, { useState, useEffect } from "react";
import Validator from "../../../Helpers/validators.js";
import { API } from "../../../Helpers/api.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import rules from "./Rules.js";
import Cookies from "js-cookie";

const Addfeilds = () => {
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
    try {
      const responseData = await API.getBusinessTypes();
      if (responseData && responseData.data) {
        setBusinesstype(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching business types", error);
    }
  };

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

  const handleModuleList = (type) => {
    setselectedBusinessType(type);
    const found = businesstype.find((item) => item.type === type);
    setModuleOptions(found ? found.modules : []);
  };

  useEffect(() => {
    fetchBusinesstypes();
    fetchGroups();

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

    const isValid = await validateForm();

    const accessToken = localStorage.getItem("accesstoken");
    const tokenPayload = parseJwt(accessToken);
    const tenantId = tokenPayload?.tenant_id || null;

    console.log("Tenant ID from token:", tenantId);

    const transformedFields = transformFieldsForAPI();
    console.log("Transformed Fields:", transformedFields);

    const formData = {
      vendor_id: tenantId,
      business_type: businessType || selectedBusinessType,
      module: module || selectedModule,
      fields: transformedFields,
      createdBy: tenantId,
    };

    console.log("Form Data to Submit:", formData);

    try {
      const result = await API.createvendorsFields(formData, {
        headers: {
          "x-tenant-id": tenantId,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("Fields created successfully!");
        setFields([]);
      } else {
        toast.error(result.message || "Failed to create fields.");
      }
    } catch (error) {
      console.error("Error creating fields:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded p-4">
      <form className="p-6">
        <input type="hidden" name="module" value={selectedModule} />
        <input type="hidden" name="businessType" value={selectedBusinessType} />

        <div>
          {fields.map((field, i) => {
            const showOptions = [
              "select",
              "multiselect",
              "radio",
              "checkbox",
            ].includes(field.type);

            return (
              <div key={field.id} className="mb-6 pb-6">
                <div className="AJ-crm-add-feild-heading-section mb-4">
                  <h2 className="text-lg font-semibold">Add Fields</h2>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="label"
                    value={field.label}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "label", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "label"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Label</label>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    value={field.key}
                    name="key"
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "key", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName("key")} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Key</label>
                </div>

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
                      <option value={types.type}>{types.display_name}</option>
                    ))}
                  </select>
                  <label className="AJ-floating-label">
                    Select Business Type
                  </label>
                </div>
                <div className="AJ-floating-label-wrapper ">
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
                  <label className="AJ-floating-label">Select Module</label>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-5 ">
                  <div className="AJ-section-group">Group</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={field.group}
                      onChange={() => handleChange(field.id, "group")}
                      className="mr-2"
                    />
                  </div>
                </div>
                {field.group && (
                  <div className="AJ-crm-field-row mt-2">
                    <label className="block mb-1 AJ-section-group ">
                      Select Group
                    </label>
                    <select
                      value={field.selectedGroup}
                      onChange={(e) =>
                        handleChange(field.id, "selectedGroup", e.target.value)
                      }
                      className="AJ-input w-full"
                    >
                      <option value="">Select Group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="placeholder"
                    value={field.placeholder}
                    autoComplete="off"
                    onChange={(e) =>
                      handleChange(field.id, "placeholder", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "placeholder"
                    )} AJ-floating-input`}
                    placeholder=" "
                  />
                  <label className="AJ-floating-label">Placeholder</label>
                </div>
                <div className="AJ-floating-label-wrapper">
                  <select
                    value={field.type || "hidden"}
                    name="type"
                    onChange={(e) =>
                      handleChange(field.id, "type", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName("type")} AJ-floating-input`}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">Attachment</option>
                    <option value="date">Date</option>
                    <option value="hidden">Hidden</option>
                  </select>
                  <label className="AJ-floating-label">Type</label>
                </div>

                <div className="AJ-floating-label-wrapper">
                  <select
                    value={field.fieldWidth || "full"}
                    name="fieldWidth"
                    onChange={(e) =>
                      handleChange(field.id, "fieldWidth", e.target.value)
                    }
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "fieldWidth"
                    )} AJ-floating-input`}
                  >
                    <option value="full">Full</option>
                    <option value="half">Half</option>
                  </select>
                  <label className="AJ-floating-label">Width</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="AJ-floating-label-wrapper">
                    <input
                      type="text"
                      name="field_id"
                      value={field.field_id}
                      autoComplete="off"
                      onChange={(e) =>
                        handleChange(field.id, "field_id", e.target.value)
                      }
                      onBlur={handleBlur}
                      className={`${getFieldClassName(
                        "field_id"
                      )} AJ-floating-input`}
                      placeholder=" "
                    />
                    <label className="AJ-floating-label">Field Id</label>
                  </div>
                  <div className="AJ-floating-label-wrapper">
                    <input
                      type="text"
                      name="Field_class"
                      value={field.Field_class}
                      autoComplete="off"
                      onChange={(e) =>
                        handleChange(field.id, "Field_class", e.target.value)
                      }
                      onBlur={handleBlur}
                      className={`${getFieldClassName(
                        "Field_class"
                      )} AJ-floating-input`}
                      placeholder=" "
                    />
                    <label className="AJ-floating-label">Field Class</label>
                  </div>
                </div>

                {/* Options Field */}
                {["select", "radio", "multiselect"].includes(field.type) && (
                  <div className="AJ-crm-field-row mt-4">
                    <div className="AJ-floating-label-wrapper">
                      <label className="AJ-floating-label block mb-2">
                        Options (each line: `value | label`, e.g., `1 | Option
                        A`)
                      </label>
                      <textarea
                        className="w-full p-2 rounded"
                        rows="3"
                        value={field.options}
                        onChange={(e) =>
                          handleChange(field.id, "options", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* File Settings */}
                {field.type === "file" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="AJ-floating-label-wrapper">
                      <input
                        type="text"
                        value={field.allowed_file_types?.join(", ") || ""}
                        onChange={(e) =>
                          handleChange(
                            field.id,
                            "allowed_file_types",
                            e.target.value.split(",").map((ext) => ext.trim())
                          )
                        }
                        className="AJ-floating-input"
                        placeholder=" "
                      />
                      <label className="AJ-floating-label">
                        Allowed File Types (e.g., jpg, png)
                      </label>
                    </div>

                    <div className="AJ-floating-label-wrapper">
                      <input
                        type="number"
                        value={field.max_file_size}
                        onChange={(e) =>
                          handleChange(
                            field.id,
                            "max_file_size",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="AJ-floating-input"
                        placeholder=" "
                      />
                      <label className="AJ-floating-label">
                        Max File Size (MB)
                      </label>
                    </div>
                  </div>
                )}

                {/* Required, Multiple, Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="AJ-floating-label-wrapper flex items-center gap-2">
                    <div className="AJ-section-group"> Required</div>
                    <div>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          handleChange(field.id, "required", e.target.checked)
                        }
                      />
                    </div>
                  </div>

                  {["checkbox", "file", "multiselect"].includes(field.type) && (
                    <div className="AJ-floating-label-wrapper flex items-center gap-2">
                      <div className="AJ-section-group"> Allow Multiple</div>
                      <input
                        type="checkbox"
                        checked={field.multiple}
                        onChange={(e) =>
                          handleChange(field.id, "multiple", e.target.checked)
                        }
                      />
                    </div>
                  )}
                </div>
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
                      <option value="disable">Disable</option>
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
