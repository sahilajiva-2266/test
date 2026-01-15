import React, { useEffect, useState } from "react";
import { getData, postData, putData } from "../../../Helpers/api.js";

const Device = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const loadDevices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getData("/device");
      setDeviceList(res?.devices || []);
    } catch (err) {
      setError("Failed to load devices.");
    } finally {
      setLoading(false);
    }
  };

  // ========================= COLORS & BADGES ========================= //
  const statusBadge = (status) => {
    const normalized = String(status || "").toUpperCase();
    const isOnline =
      normalized === "ONLINE" ||
      normalized === "ACTIVE" ||
      normalized === "TRUE" ||
      normalized === "ONLINE" ||
      normalized === "ON";
    return isOnline ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Online</span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Offline</span>
    );
  };

  const cameraBadge = (blocked) => {
    return blocked ? (
      <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">Blocked</span>
    ) : (
      <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">Allowed</span>
    );
  };

  const locationBadge = (on) => {
    return on ? (
      <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">ON</span>
    ) : (
      <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">OFF</span>
    );
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const getPolicyValue = (device, field) => {
    if (!device) return false;
    if (typeof device[field] === "boolean") return device[field];
    if (typeof device?.devicePolicyState?.[field] === "boolean") {
      return device.devicePolicyState[field];
    }
    return false;
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [deviceList]);

  const totalPages = Math.ceil(deviceList.length / ITEMS_PER_PAGE) || 1;
  const paginatedDeviceList = deviceList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderPaginationButtons = () => {
    const btns = [];
    const start = Math.max(currentPage - 2, 1);
    const end = Math.min(currentPage + 2, totalPages);
    const baseBtn =
      "w-10 h-10 text-sm font-semibold text-gray-700 rounded-full border border-gray-200 bg-white hover:bg-gray-50";
    const activeBtn =
      "bg-blue-600 text-white border-blue-600 shadow ring-2 ring-blue-200 hover:bg-blue-600";

    if (start > 1) {
      btns.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={baseBtn}
        >
          1
        </button>
      );
      if (start > 2) btns.push(<span key="dots1">…</span>);
    }

    for (let i = start; i <= end; i += 1) {
      btns.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`${baseBtn} ${i === currentPage ? activeBtn : ""}`}
          style={
            i === currentPage
              ? {
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderColor: "#2563eb",
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
                }
              : { backgroundColor: "#ffffff", color: "#374151" }
          }
        >
          {i}
        </button>
      );
    }

    if (end < totalPages - 1) btns.push(<span key="dots2">…</span>);

    if (end < totalPages) {
      btns.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={baseBtn}
        >
          {totalPages}
        </button>
      );
    }

    return btns;
  };

  // ========================= OPEN MODAL ========================= //
  const openDeviceModal = (device) => {
    setSelectedDevice(device);
    setShowModal(true);
    fetchLatestScreenshot(device);
  };

  const fetchLatestScreenshot = async (device) => {
    const deviceId = device?.id || device?.deviceId || device?._id;
    if (!deviceId) return;
    try {
      const res = await getData("/device/device-event/latest-screenshot", {
        deviceId,
      });
      if (res?.status && res?.data?.timestamp) {
        setSelectedDevice((prev) =>
          prev ? { ...prev, lastScreenshotAt: res.data.timestamp } : prev
        );
      }
    } catch (_err) {
      // ignore screenshot lookup errors
    }
  };

  const applyDeviceUpdate = (updated) => {
    if (!updated?.id) return;
    setDeviceList((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
    setSelectedDevice((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  const togglePolicy = async (field) => {
    if (!selectedDevice?.id) return;
    try {
      const res = await putData(`/device/${selectedDevice.id}/policy/toggle`, {
        field,
      });
      if (res?.status && res?.data) {
        applyDeviceUpdate(res.data);
      }
    } catch (err) {
      // api helper already toasts
    }
  };

  const resolveUserId = (device) => {
    if (!device) return null;
    if (typeof device.userId === "string") return device.userId;
    return device.userId?._id || device.userId?.id || null;
  };

  const removeDevice = async () => {
    if (!selectedDevice) return;
    const userId = resolveUserId(selectedDevice);
    const deviceId = selectedDevice.deviceId || selectedDevice.id || selectedDevice._id;
    if (!userId || !deviceId) return;
    const confirmed = window.confirm(
      "Remove this device? The user will need to register again."
    );
    if (!confirmed) return;
    try {
      const res = await postData("/device/uninstall", {
        deviceId,
        userId,
        employeeId: selectedDevice.employeeId || undefined,
        action: "uninstall",
      });
      if (res?.status) {
        await loadDevices();
        setShowModal(false);
        setSelectedDevice(null);
      }
    } catch (_err) {
      // api helper already toasts
    }
  };

  return (
    <div className="p-4">

      {/* PAGE HEADING */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 text-xl font-semibold text-gray-700 device-list-heading">
        <svg width="20"
          fill="navy-blue"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512">
          <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"></path>
        </svg>
        Device Management
      </div>

      {/* ========================= DEVICE TABLE ========================= */}
      <div className="mt-6 m-0">
        {loading ? (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">
            Loading devices...
          </div>
        ) : null}
        {!loading && error ? (
          <div className="bg-white p-5 rounded-xl shadow text-red-600">
            {error}
          </div>
        ) : null}

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden lg:block bg-white p-5 rounded-xl shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3">Device</th>
                <th className="p-3">User</th>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Android</th>
                <th className="p-3">App Ver.</th>
                <th className="p-3">Last Online</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedDeviceList.map((device) => (
                <tr key={device.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">
                    {device.deviceName || device.deviceId || device.name || "-"}
                  </td>
                  <td className="p-3">{device.userName || device.name || "-"}</td>
                  <td className="p-3">{device.employeeId}</td>
                  <td className="p-3">
                    {statusBadge(device.statusLabel || device.status)}
                  </td>
                  <td className="p-3">
                    {device.deviceInfo?.version?.release ||
                      device.osVersion ||
                      device.androidVersion ||
                      "-"}
                  </td>
                  <td className="p-3">
                    {device.appVersion || device.appVer || "-"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatDate(device.lastOnline || device.lastSeen)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openDeviceModal(device)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE + TABLET STACKED TABLE ================= */}
        <div className="block lg:hidden space-y-5 md:flex md:flex-col md:gap-2 sm:flex sm:flex-col sm:gap-2">
          {deviceList.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-xl border shadow p-2 !mt-2 !mb-2 !mr-0 !ml-0"
            >
              {/* CHECKBOX ROW */}
              {/* <div className="flex justify-between items-center mb-3">
                <input type="checkbox" />
                <input type="checkbox" />
              </div> */}

              {/* LABEL / VALUE TABLE */}
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <div className="text-gray-500 font-medium">Device</div>
                <div className="text-right font-semibold">
                  {device.deviceName || device.deviceId || device.name || "-"}
                </div>

                <div className="text-gray-500 font-medium">User</div>
                <div className="text-right">{device.userName || device.name || "-"}</div>

                <div className="text-gray-500 font-medium">Employee ID</div>
                <div className="text-right">{device.employeeId}</div>

                <div className="text-gray-500 font-medium">Status</div>
                <div className="text-right">
                  {statusBadge(device.statusLabel || device.status)}
                </div>

                <div className="text-gray-500 font-medium">Android</div>
                <div className="text-right">
                  {device.deviceInfo?.version?.release ||
                    device.osVersion ||
                    device.androidVersion ||
                    "-"}
                </div>

                <div className="text-gray-500 font-medium">App Ver.</div>
                <div className="text-right">
                  {device.appVersion || device.appVer || "-"}
                </div>

                <div className="text-gray-500 font-medium">Last Online</div>
                <div className="text-right text-xs text-gray-600">
                  {formatDate(device.lastOnline || device.lastSeen)}
        </div>

        {!loading && deviceList.length > 0 ? (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, deviceList.length)} of{" "}
              {deviceList.length}
            </p>

            <div className="flex items-center gap-2 justify-center w-full overflow-x-auto sm:overflow-visible">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                aria-label="Previous page"
              >
                ‹
              </button>
              <div className="flex flex-nowrap gap-2">
                {renderPaginationButtons()}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        ) : null}
      </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => openDeviceModal(device)}
                  className="text-blue-700 font-semibold"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>


      {/* ========================= DEVICE DETAILS MODAL ========================= */}
      {showModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center !m-0">

          {/* MODAL CONTAINER */}
          <div
            className=" bg-white w-full sm:max-w-[800px] max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6 relative !m-5 device-page-popup-container"
          >
            {/* DRAG INDICATOR (Mobile UX) */}
            <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-xl text-gray-600 !m-0 device-page-popup-cut-button"
            >
              ✕
            </button>

            {/* HEADER */}
            <h2 className="text-lg sm:text-2xl font-bold">
              {selectedDevice.deviceName || selectedDevice.deviceId || selectedDevice.name || "-"}
            </h2>
            <p className="text-gray-500 text-sm">
              Android ID: {selectedDevice.deviceInfo?.androidId || selectedDevice.deviceId || "-"}
            </p>

            {/* ================= DEVICE STATUS (STACKED ON MOBILE) ================= */}
            <div className="mt-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4">

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm">Device Owner</h4>
                <p className="text-sm">
                  {selectedDevice.userName || selectedDevice.userId?.name || selectedDevice.name || "-"}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm">Camera</h4>
                {cameraBadge(getPolicyValue(selectedDevice, "cameraDisabled"))}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-sm">Location</h4>
                {locationBadge(
                  selectedDevice.locationAllowed !== undefined
                    ? selectedDevice.locationAllowed
                    : true
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-sm">Last Screenshot</h4>
                <p className="text-xs">
                  {formatDate(selectedDevice.lastScreenshotAt)}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-sm">Uninstall</h4>
                {cameraBadge(getPolicyValue(selectedDevice, "uninstallBlocked"))}
              </div>

              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-sm">Enrollment Date</h4>
                <p className="text-sm">
                  {formatDate(selectedDevice.enrollmentDate || selectedDevice.createdAt)}
                </p>
              </div>
            </div>

            {/* ================= DEVICE CONTROLS ================= */}
            <h3 className="mt-6 text-base sm:text-xl font-semibold">
              Device Controls
            </h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  field: "cameraDisabled",
                  label: "Camera",
                  blockLabel: "Disable Camera",
                  allowLabel: "Allow Camera",
                  allowClass: "bg-sky-600 text-white",
                  blockClass: "bg-sky-100 text-sky-800",
                },
                {
                  field: "uninstallBlocked",
                  label: "Uninstall",
                  blockLabel: "Disable Uninstall",
                  allowLabel: "Allow Uninstall",
                  allowClass: "bg-sky-600 text-white",
                  blockClass: "bg-sky-100 text-sky-800",
                },
                {
                  field: "facebookBlocked",
                  label: "Facebook",
                  allowClass: "bg-blue-600 text-white",
                  blockClass: "bg-blue-100 text-blue-800",
                },
                {
                  field: "instagramBlocked",
                  label: "Instagram",
                  allowClass: "bg-purple-600 text-white",
                  blockClass: "bg-purple-100 text-purple-800",
                },
                {
                  field: "youtubeBlocked",
                  label: "YouTube",
                  allowClass: "bg-rose-600 text-white",
                  blockClass: "bg-rose-100 text-rose-800",
                },
                {
                  field: "whatsappBlocked",
                  label: "WhatsApp",
                  allowClass: "bg-green-600 text-white",
                  blockClass: "bg-green-100 text-green-800",
                },
              ].map(({ field, label, blockLabel, allowLabel, allowClass, blockClass }) => {
                const isBlocked = getPolicyValue(selectedDevice, field);
                const buttonLabel = isBlocked
                  ? allowLabel || `Allow ${label}`
                  : blockLabel || `Block ${label}`;
                const buttonClass = isBlocked ? allowClass : blockClass;
                return (
                  <button
                    key={field}
                    onClick={() => togglePolicy(field)}
                    className={`w-full py-3 rounded-lg ${buttonClass}`}
                  >
                    {buttonLabel}
                  </button>
                );
              })}
            </div>

            {/* ================= MORE ACTIONS ================= */}
            <h3 className="mt-6 text-base sm:text-xl font-semibold">
              More Actions
            </h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="w-full py-3 bg-gray-200 rounded-lg">
                View Activity Logs
              </button>

              <button className="w-full py-3 bg-gray-200 rounded-lg">
                View Installed Apps
              </button>

              <button className="w-full py-3 bg-gray-200 rounded-lg">
                View Location Timeline
              </button>

              <button
                onClick={removeDevice}
                className="w-full py-3 bg-red-300 text-red-800 rounded-lg"
              >
                Remove Device
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default Device;
