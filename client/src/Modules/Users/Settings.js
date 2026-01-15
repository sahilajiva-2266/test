import React, { useEffect, useMemo, useState } from "react";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { domainpath, getData, putData } from "../../Helpers/api.js";

const Settings = () => {
    const defaultDevice = {
        cameraAccess: true,
        allowAppUninstall: false,
        locationAccess: true,
        allowScreenshots: false,
        blockUnknownApps: true,
        autoSyncEnable: true,
        whatsappCameraAccess: false,
        facebookCameraAccess: false,
    };

    const defaultAlerts = {
        appInstallAlert: true,
        appUninstallAlert: true,
        screenshotAlert: false,
        cameraActivityAlert: false,
    };

    const defaultSystem = {
        apiEndpointUrl: "",
        unitLocation: "",
        apkFile: null,
        logoFile: null,
        apkFileUrl: "",
        companyLogoUrl: "",
    };

    const [deviceSettings, setDeviceSettings] = useState(defaultDevice);
    const [alerts, setAlerts] = useState(defaultAlerts);
    const [systemConfig, setSystemConfig] = useState(defaultSystem);
    const [initialDevice, setInitialDevice] = useState(defaultDevice);
    const [initialAlerts, setInitialAlerts] = useState(defaultAlerts);
    const [initialSystem, setInitialSystem] = useState(defaultSystem);
    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState([]);

    const baseUrl = useMemo(() => domainpath.replace(/\/api\/?$/, ""), []);

    const toggle = (setter, key) => {
        setIsChanged(true);
        setter((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleConfigChange = (key, value) => {
        setIsChanged(true);
        setSystemConfig((prev) => ({ ...prev, [key]: value }));
    };

    const loadSettings = async (locationName = "") => {
        setLoading(true);
        try {
            const response = await getData("/settings", {
                unitLocation: locationName,
            });
            const data = response?.data || {};
            const nextSystem = {
                apiEndpointUrl: data.apiEndpointUrl || "",
                unitLocation: data.unitLocation || locationName || "",
                apkFile: null,
                logoFile: null,
                apkFileUrl: data.apkFileUrl || "",
                companyLogoUrl: data.companyLogoUrl || "",
                otpEmail: data.otpEmail || "",
                otpExpirySeconds: data.qrExpirySeconds || "",
            };
            const nextDevice = data.deviceControls || defaultDevice;
            const nextAlerts = data.alerts || defaultAlerts;
            setSystemConfig(nextSystem);
            setDeviceSettings(nextDevice);
            setAlerts(nextAlerts);
            setInitialSystem(nextSystem);
            setInitialDevice(nextDevice);
            setInitialAlerts(nextAlerts);
            setIsChanged(false);
        } catch (error) {
            toast.error("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = new FormData();

            payload.append("apiEndpointUrl", systemConfig.apiEndpointUrl || "");
            payload.append("unitLocation", systemConfig.unitLocation || "");
            payload.append("deviceControls", JSON.stringify(deviceSettings));
            payload.append("alerts", JSON.stringify(alerts));

            // ✅ NEW
            payload.append("otpEmail", systemConfig.otpEmail || "");
            payload.append("qrExpirySeconds", systemConfig.otpExpirySeconds || 0);

            if (systemConfig.apkFile) payload.append("apkFile", systemConfig.apkFile);
            if (systemConfig.logoFile) payload.append("companyLogo", systemConfig.logoFile);

            const response = await putData("/settings", payload);

            if (response?.status) {
                const data = response?.data || {};

                const nextSystem = {
                    apiEndpointUrl: data.apiEndpointUrl || "",
                    unitLocation: data.unitLocation || "",
                    apkFile: null,
                    logoFile: null,
                    apkFileUrl: data.apkFileUrl || "",
                    companyLogoUrl: data.companyLogoUrl || "",

                    otpEmail: data.otpEmail || "",
                    otpExpirySeconds: data.qrExpirySeconds || "",
                };

                setSystemConfig(nextSystem);
                setInitialSystem(nextSystem);
                setInitialDevice(data.deviceControls || defaultDevice);
                setInitialAlerts(data.alerts || defaultAlerts);
                setDeviceSettings(data.deviceControls || defaultDevice);
                setAlerts(data.alerts || defaultAlerts);
                setIsChanged(false);

                toast.success(response.message || "Changes saved successfully!");
            } else {
                toast.error(response?.message || "Failed to save settings.");
            }
        } catch {
            toast.error("Failed to save settings.");
        }
    };

    const handleCancel = () => {
        setDeviceSettings(initialDevice);
        setAlerts(initialAlerts);
        setSystemConfig(initialSystem);
        setIsChanged(false);
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await getData("/location", { page: 1, limit: 1000 });
                setLocations(response?.locations || []);
            } catch (error) {
                toast.error("Failed to load locations.");
            }
        };

        fetchLocations();
        loadSettings("");
    }, []);

    return (
        <>
            <div className="p-4 System-Settings-main-page">
                <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 text-xl font-semibold text-gray-700 setting-list-heading">
                    <svg width="20"
                        fill="navy-blue"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"><path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z">
                        </path>
                    </svg>System Settings</div>

                <div className="min-h-screen !m-0">

                    {/* ========= TOP SECTION ========= */}
                    <div className="bg-white p-6 rounded-xl !mb-4  shadow-sm border border-gray-200 setting-page-System-Configuration">
                        <h2 className="text-xl font-bold text-gray-800">System Configuration</h2>
                        <p className="text-sm text-gray-500 mt-1">API, Logo, APK, Location settings</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                            {/* API URL */}
                            <div>
                                <label className="setting-System-Configuration text-gray-700 font-semibold">API Endpoint URL</label>
                                <input
                                    type="text"
                                    value={systemConfig.apiEndpointUrl}
                                    placeholder="https://your-backend.com/api/"
                                    onChange={(e) => handleConfigChange("apiEndpointUrl", e.target.value)}
                                    className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Unit Location */}
                            <div>
                                <label className="setting-System-Configuration text-gray-700 font-semibold">Unit Location</label>
                                <select
                                    value={systemConfig.unitLocation}
                                    onChange={(e) => loadSettings(e.target.value)}
                                    className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">Select Unit</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id || loc.name} value={loc.name}>
                                            {loc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* APK Upload */}
                            <div>
                                <label className="setting-System-Configuration text-gray-700 font-semibold">Upload APK File</label>
                                <input
                                    type="file"
                                    accept=".apk"
                                    onChange={(e) => handleConfigChange("apkFile", e.target.files[0])}
                                    className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 "
                                />
                                {systemConfig.apkFileUrl && (
                                    <a
                                        className="text-sm text-blue-600 underline mt-2 inline-block"
                                        href={`${baseUrl}${systemConfig.apkFileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View current APK
                                    </a>
                                )}
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="setting-System-Configuration text-gray-700 font-semibold">Company Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleConfigChange("logoFile", e.target.files[0])}
                                    className="w-full mt-2 border p-3 border-gray-400  rounded-lg bg-gray-50"
                                />

                                {(systemConfig.logoFile || systemConfig.companyLogoUrl) && (
                                    <img
                                        src={
                                            systemConfig.logoFile
                                                ? URL.createObjectURL(systemConfig.logoFile)
                                                : `${baseUrl}${systemConfig.companyLogoUrl}`
                                        }
                                        className="mt-3 w-24 h-24 object-contain rounded-lg shadow border"
                                        alt="Preview"
                                    />
                                )}
                            </div>

                            {/* ✅ OTP Email */}
                            <div>
                                <label className="setting-System-Configuration text-gray-700 font-semibold">
                                    OTP Email
                                </label>
                                <input
                                    type="email"
                                    value={systemConfig.otpEmail}
                                    onChange={(e) => handleConfigChange("otpEmail", e.target.value)}
                                    className="w-full mt-2 border border-gray-400 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* ✅ QR Code Expiry */}
                            <div>
                                <label className="setting-System-Configuration text-gray-700 font-semibold">
                                    QR Code Expiry Time
                                </label>

                                <div className="mt-2">
                                    <select
                                        value={systemConfig.otpExpirySeconds}
                                        onChange={(e) => handleConfigChange("otpExpirySeconds", e.target.value)}
                                        className="w-full mt-2 border p-3 border-gray-400 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Select Seconds</option>
                                        <option value="30">30 seconds</option>
                                        <option value="45">45 seconds</option>
                                        <option value="60">60 seconds</option>
                                        <option value="90">90 seconds</option>
                                        <option value="120">120 seconds</option>
                                    </select>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* ========= FLEX BOTTOM CARDS ========= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 Setting-page-bottum-section">

                        {/* Device Controls */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 setting-page-Device-Controls">
                            <h2 className="text-xl font-bold text-gray-800">Devices Controls</h2>
                            <p className="text-sm text-gray-500 mt-1">Hardware access & restrictions</p>

                            <div className="mt-6 space-y-4 flex flex-col setting-page-device-control-inner">
                                {[
                                    ["Camera Access", "cameraAccess"],
                                    ["Allow App Uninstall", "allowAppUninstall"],
                                    ["Location Access", "locationAccess"],
                                    ["Allow Screenshots", "allowScreenshots"],
                                    ["Block Unknown Apps", "blockUnknownApps"],
                                    ["Auto Sync Enable", "autoSyncEnable"],
                                    ["Whatsapp Camera Access", "whatsappCameraAccess"],
                                    ["Facebook Camera Access", "facebookCameraAccess"],
                                ]
                                    .map(([label, key]) => (
                                        <div key={key} className="flex items-center justify-between p-3.5 bg-gray-10 border rounded-lg setting-rows ">
                                            <span className="text-gray-800">{label}</span>

                                            <label className="relative inline-flex items-center cursor-pointer setting-device-control">
                                                <input
                                                    type="checkbox"
                                                    checked={!!deviceSettings[key]}
                                                    onChange={() => toggle(setDeviceSettings, key)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>
                                                <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 transition-all peer-checked:translate-x-6 shadow"></div>
                                            </label>
                                        </div>
                                    ))}
                            </div>
                        </div>



                        {/* Alerts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 setting-page-Alert-Notifications">
                            <h2 className="text-xl font-bold text-gray-800">Alerts & Notifications</h2>
                            <p className="text-sm text-gray-500 mt-1">Activity alerts</p>

                            <div className="mt-6 space-y-4 flex flex-col ">
                                {[
                                    ["App Install Alert", "appInstallAlert"],
                                    ["App Uninstall Alert", "appUninstallAlert"],
                                    ["Screenshot Alert", "screenshotAlert"],
                                    ["Camera Activity Alert", "cameraActivityAlert"],
                                ].map(([label, key]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg setting-rows">
                                        <span className="text-gray-800">{label}</span>

                                        <label className="relative inline-flex items-center cursor-pointer setting-Notification-aleart-control">
                                            <input
                                                type="checkbox"
                                                checked={!!alerts[key]}
                                                onChange={() => toggle(setAlerts, key)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition"></div>
                                            <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 transition-all peer-checked:translate-x-6 shadow"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ========= SAVE / CANCEL BUTTONS ========= */}
                    {isChanged && !loading && (
                        <div className="mt-8 flex gap-4 justify-end settingpage-save-cancel-button">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default Settings;
