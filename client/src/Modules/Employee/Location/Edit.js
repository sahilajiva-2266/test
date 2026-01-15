// Location/Edit.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdEditLocationAlt } from "react-icons/md";
import { getData, putData } from "../../../Helpers/api.js";

const LocationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    lat: "",
    long: "",
    radius: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getData(`/location/${id}`);
        if (res?.status && res?.data) {
          setForm({
            name: res.data.name || "",
            lat: res.data.lat ?? "",
            long: res.data.lng ?? res.data.long ?? "",
            radius: res.data.radius ?? "",
          });
        } else {
          setError(res?.message || "Failed to load location.");
        }
      } catch (err) {
        setError("Failed to load location.");
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [id]);

  const update = async () => {
    setError("");
    try {
      const payload = {
        name: form.name,
        lat: form.lat,
        lng: form.long,
        radius: form.radius,
      };
      const res = await putData(`/location/${id}`, payload);
      if (res?.status) {
        navigate("/dashboard/users/location");
        return;
      }
      setError(res?.message || "Failed to update location.");
    } catch (err) {
      setError("Failed to update location.");
    }
  };

  return (
    <div className="p-4 sm:p-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6 w-full  border border-gray-200 location-update-page">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          {/* LEFT: Icon + Title */}
          <div className="flex items-center gap-3">
            <MdEditLocationAlt className="text-orange-600" size={26} />
            <h2 className="text-xl font-semibold text-gray-800">
              Edit Location
            </h2>
          </div>

          {/* RIGHT: Buttons */}
          <div className="flex gap-3 sm:justify-end location-update-cancel-button">
            <button
              onClick={update}
              className="px-6 py-2 rounded-lg bg-[#018DD4] text-white hover:bg-blue-700 transition shadow-md min-w-[120px]"
            >
              Update
            </button>

            <button
              onClick={() => navigate("/dashboard/users/location")}
              className="px-6 py-2 rounded-lg border border-gray-400 hover:bg-gray-100 transition min-w-[120px]"
            >
              Cancel
            </button>
          </div>

        </div>


        {/* ===== ERROR ===== */}
        {error && (
          <div className="text-red-600 mb-4 text-sm">{error}</div>
        )}

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : (
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
                value={form.radius}
                onChange={(e) => setForm({ ...form, radius: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default LocationEdit;
