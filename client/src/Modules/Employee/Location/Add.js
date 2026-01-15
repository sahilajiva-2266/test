// Location/Add.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAddLocationAlt } from "react-icons/md";
import { postData } from "../../../Helpers/api.js";

const LocationAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    lat: "",
    long: "",
    radius: "",
  });
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    try {
      const payload = {
        name: form.name,
        lat: form.lat,
        lng: form.long,
        radius: form.radius,
      };
      const res = await postData("/location/add", payload);
      if (res?.status) {
        navigate("/dashboard/users/location");
        return;
      }
      setError(res?.message || "Failed to save location.");
    } catch (err) {
      setError("Failed to save location.");
    }
  };

  return (
    <div className="p-4 sm:p-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6 w-full border border-gray-200 Addnew-location-page">

        {/* ===== HEADER ===== */}
        <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 updatelocation-heder-box">

          {/* Title */}
          <div className="flex items-center gap-3">
            <MdAddLocationAlt className="text-blue-600" size={28} />
            <h2 className="text-lg sm:text-xl font-semibold">
              Add New Location
            </h2>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={save}
              className="py-2 px-4 rounded-lg bg-[#018DD4] text-white hover:bg-blue-700 transition shadow-md min-w-[140px] w-full sm:w-auto"
            >
              Save Location
            </button>
            <button
              onClick={() => navigate("/dashboard/users/location")}
              className="py-2 px-4 rounded-lg border border-gray-400 hover:bg-gray-100 transition min-w-[140px] w-full sm:w-auto !m-0"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ===== ERROR ===== */}
        {error && (
          <div className="text-red-600 mb-4 text-sm">{error}</div>
        )}

        {/* ===== FORM GRID ===== */}
        <div
          className="
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-5
        gap-4
        items-end
      "
        >
          {/* Location Name */}
          <div className="lg:col-span-2">
            <label className="block text-gray-600 mb-1 font-medium">
              Location Name
            </label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Office Entry Gate"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Lat</label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Lat"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Long</label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Long"
              value={form.long}
              onChange={(e) => setForm({ ...form, long: e.target.value })}
            />
          </div>

          {/* Radius */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Radius (in meters)
            </label>
            <input
              type="text"
              className="border rounded-lg p-3 w-full outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 20"
              value={form.radius}
              onChange={(e) => setForm({ ...form, radius: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default LocationAdd;
