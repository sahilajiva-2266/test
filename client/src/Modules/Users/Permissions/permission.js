import React, { useState, useEffect } from "react";
import { API } from "../../../Helpers/api.js";
import Rules from "../Rules.js";
import Validator from "../../../Helpers/validators.js";
import { toast } from "react-toastify";
const PermissionsForm = () => {
  const [permissions, setPermissions] = useState({});
  const [formData, setFormData] = useState({ role: "", hierarchy: "" });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [businesstype, setBusinesstype] = useState([]);
  const [SelectedStatus, setSelectedStatus] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [moduleOptions, setModuleOptions] = useState([]);
  const [hierarchy, setHierarchy] = useState("");
  const [touched, setTouched] = useState({});
  const [loadingModules, setLoadingModules] = useState(true);
  const [rolePermissions, setRolePermissions] = useState({});
  const statusValues = ["Active", "Disabled", "Blocked"];
  const validator = new Validator(Rules);

  // Toggle all modules for a given action
  const toggleAllPermission = (action, isChecked) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const currentRole = updated[selectedRole] || { modules: {} };

      moduleOptions.forEach((mod) => {
        const modPerms = currentRole.modules[mod] || [];

        if (isChecked && !modPerms.includes(action)) {
          // Add action
          currentRole.modules[mod] = [...modPerms, action];
        } else if (!isChecked && modPerms.includes(action)) {
          // Remove action
          currentRole.modules[mod] = modPerms.filter((p) => p !== action);
        }
      });

      updated[selectedRole] = currentRole;
      return updated;
    });
  };

  // Check if all modules have a certain action
  const areAllChecked = (action) => {
    return moduleOptions.every((mod) =>
      permissions[selectedRole]?.modules?.[mod]?.includes(action)
    );
  };
  const toggleAllModulePermissions = (module, checked) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const role = updated[selectedRole] || { modules: {} };
      role.modules = { ...role.modules };

      role.modules[module] = checked
        ? ["create", "read", "update", "delete"]
        : [];
      updated[selectedRole] = role;
      setRolePermissions(updated); // optional
      return updated;
    });
  };
  const toggleAllPermissionsForAllModules = (checked) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const role = updated[selectedRole] || { modules: {} };
      role.modules = { ...role.modules };

      moduleOptions.forEach((mod) => {
        role.modules[mod] = checked
          ? ["create", "read", "update", "delete"]
          : [];
      });

      updated[selectedRole] = role;
      setRolePermissions(updated); // optional
      return updated;
    });
  };

  const toggleAllColumnPermissions = (action, checked) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const role = updated[selectedRole] || { modules: {} };
      role.modules = { ...role.modules };

      moduleOptions.forEach((module) => {
        const existing = role.modules[module] || [];
        role.modules[module] = checked
          ? Array.from(new Set([...existing, action]))
          : existing.filter((perm) => perm !== action);
      });

      updated[selectedRole] = role;
      setRolePermissions(updated); // optional
      return updated;
    });
  };

  const togglePermission = (roleKey, module, action) => {
    setPermissions((prevPermissions) => {
      const updatedPermissions = {
        ...prevPermissions,
        [roleKey]: {
          ...prevPermissions[roleKey],
          modules: {
            ...prevPermissions[roleKey]?.modules,
            [module]: prevPermissions[roleKey]?.modules?.[module]
              ? prevPermissions[roleKey].modules[module].includes(action)
                ? prevPermissions[roleKey].modules[module].filter(
                    (perm) => perm !== action
                  )
                : [...prevPermissions[roleKey].modules[module], action]
              : [action],
          },
        },
      };

      setRolePermissions(updatedPermissions); // if needed
      return updatedPermissions;
    });
  };

  const handleListStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setSelectedBusinessType(e.target.value);
    const found = businesstype.find(
      (item) => item.type.toLowerCase() === e.target.value.toLowerCase()
    );
    setModuleOptions(found ? found.modules : []);

    setRoles(found ? found.roles : []);
    console.log(roles);
    console.log(moduleOptions);
  };

  const handleRoleChange = (e) => setSelectedRole(e.target.value);

  const fetchBusinesstypes = async () => {
    try {
      const response = await API.getBusinessTypes();
      if (response?.data) setBusinesstype(response.data);
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
      const response = await API.getModuleList();

      console.log(response);

      const moduleList = response?.data?.modules;

      if (Array.isArray(moduleList)) {
        const selected = roles.find((r) => r.id === selectedRole);

        if (!selected) return;

        const roleKey = selected.name.toLowerCase().replace(/\s/g, "_");

        const dynamicPermissions = {
          [roleKey]: {
            hierarchy: 1,
            modules: moduleList.reduce((acc, moduleName) => {
              acc[moduleName] = ["create", "read", "update", "delete"];
              return acc;
            }, {}),
          },
        };

        setPermissions(dynamicPermissions);
      } else {
        console.error("Invalid modules response");
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    fetchBusinesstypes();
  }, []);

  useEffect(() => {
    if (selectedBusinessType && selectedRole) {
      fetchModules();
    }
  }, [selectedBusinessType, selectedRole, roles]);

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: Rules[name] }
    );
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] || "" }));
  };
  const transformPermissions = (modulesObj) => {
    return Object.entries(modulesObj).reduce((acc, [module, actions]) => {
      acc[module] = actions;
      return acc;
    }, {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!selectedRole) throw new Error("Role not selected");

      const roleKey = selectedRole;
      const modules = rolePermissions[roleKey]?.modules;

      if (!modules || Object.keys(modules).length === 0) {
        throw new Error("Modules not defined for this role");
      }

      const transformedModules = transformPermissions(modules);

      const roledata = {
        role: selectedRole,
        business_type: selectedBusinessType,
        hierarchy: 1,
        modules: transformedModules,
      };

      console.log("Submitting role data:", roledata);

      const res = await API.createPermission(roledata);

      if (res?.status) {
        toast.success("Permission created successfully");
      } else {
        toast.error(res?.message || "Failed to create permission");
      }
    } catch (error) {
      console.error("HandleSubmit error:", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Permissions</h2>

      <div className="flex gap-4 mb-4">
        <div className="AJ-floating-label-wrapper">
          <select
            name="business_type"
            value={SelectedStatus}
            onChange={handleListStatusChange}
            className="AJ-floating-input bg-white"
          >
            <option value="">Select Business Type</option>
            {businesstype.map((types) => (
              <option key={types.type} value={types.type}>
                {types.display_name}
              </option>
            ))}
          </select>
          <label className="AJ-floating-label">Select Business Type</label>
        </div>

        <div className="AJ-floating-label-wrapper">
          <select
            name="role"
            value={selectedRole}
            onChange={handleRoleChange}
            className="AJ-floating-input bg-white"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <label className="AJ-floating-label">Select Role</label>
        </div>
        <div className="AJ-floating-label-wrapper">
          <select
            name="status"
            value={SelectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="AJ-floating-input bg-white"
          >
            <option value="">Select Status</option>
            {statusValues.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <label className="AJ-floating-label">Select Status</label>
        </div>
        <div className="AJ-floating-label-wrapper">
          <input
            type="text"
            name="hierarchy"
            value={hierarchy}
            onChange={(e) => setHierarchy(e.target.value)}
            className="AJ-floating-input bg-white"
            placeholder=" "
          />
          <label className="AJ-floating-label">Hierarchy</label>
        </div>
      </div>

      {/* Permissions Table */}
      {SelectedStatus && selectedRole && (
        <div className="overflow-x-auto">
          <div key={selectedRole} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              Set Permissions for {selectedRole.replace("_", " ")} :
            </h3>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          toggleAllPermissionsForAllModules(e.target.checked)
                        }
                        checked={moduleOptions.every((mod) =>
                          ["create", "read", "update", "delete"].every((act) =>
                            permissions[selectedRole]?.modules?.[mod]?.includes(
                              act
                            )
                          )
                        )}
                      />
                      <span>Module</span>
                    </div>
                  </th>
                  {["create", "read", "update", "delete"].map((act) => (
                    <th key={act} className="border px-4 py-2 capitalize">
                      <div className="flex items-center justify-center gap-1">
                        <span>{act}</span>
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            toggleAllColumnPermissions(act, e.target.checked)
                          }
                          checked={moduleOptions.every((mod) =>
                            permissions[selectedRole]?.modules?.[mod]?.includes(
                              act
                            )
                          )}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {moduleOptions.map((mod) => {
                  const allChecked = [
                    "create",
                    "read",
                    "update",
                    "delete",
                  ].every((act) =>
                    permissions[selectedRole]?.modules?.[mod]?.includes(act)
                  );

                  return (
                    <tr key={mod}>
                      <td className="border px-4 py-2 capitalize">
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={(e) =>
                              toggleAllModulePermissions(mod, e.target.checked)
                            }
                          />
                          <span>{mod}</span>
                        </div>
                      </td>
                      {["create", "read", "update", "delete"].map((act) => (
                        <td key={act} className="border text-center">
                          <input
                            type="checkbox"
                            checked={
                              permissions[selectedRole]?.modules?.[
                                mod
                              ]?.includes(act) || false
                            }
                            onChange={() =>
                              togglePermission(selectedRole, mod, act)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 aj-button-section">
        <button type="submit" className=" text-white px-4 py-2 rounded ">
          Save Permissions
        </button>
      </div>
    </form>
  );
};

export default PermissionsForm;
