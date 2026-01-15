// Location/List.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteData, getData } from "../../../Helpers/api.js";

const LocationList = () => {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getData("/location");
      if (res?.status) {
        setLocations(res.locations || []);
      } else {
        setError(res?.message || "Failed to load locations.");
      }
    } catch (err) {
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    try {
      const res = await deleteData(`/location/${id}`);
      if (res?.status) {
        fetchLocations();
      } else {
        setError(res?.message || "Failed to delete location.");
      }
    } catch (err) {
      setError("Failed to delete location.");
    }
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 location-list-heading"
      >
        {/* style={{ marginTop: "70px" }} */}
        <h2 className="text-xl font-bold mb-4">Geofence Location List</h2>

        <button
          className="crm-buttonsection mb-4 hover:bg-[#018DD4]"
          onClick={() => navigate("/dashboard/users/location/add")}
        >
          + Add Location
        </button>
      </div>

      {error ? <div className="text-red-600 mb-2">{error}</div> : null}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* ===================== DESKTOP TABLE ===================== */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-gray-200 text-sm font-medium">
                <tr>
                  <th className="p-2 bg-[#22374e] text-white">Name</th>
                  <th className="p-2">Lat</th>
                  <th className="p-2">Long</th>
                  <th className="p-2">Radius (m)</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id || loc._id} className="bg-white text-sm font-semibold">
                    <td className="p-2 text-gray-700">{loc.name}</td>
                    <td className="p-2 text-gray-700">{loc.lat}</td>
                    <td className="p-2 text-gray-700">{loc.lng ?? loc.long}</td>
                    <td className="p-2 text-gray-700">{loc.radius}</td>

                    <td className="p-2 flex gap-2">
                      {/* EDIT */}
                      <button
                        className="mr-3"
                        onClick={() =>
                          navigate(`/dashboard/users/location/edit/${loc.id || loc._id}`)
                        }
                      >
                        <svg
                          fill="#22374e"
                          width={20}
                          height={20}
                          viewBox="0 0 640 512"
                        >
                          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l293.1 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1l-91.4 0zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z" />
                        </svg>
                      </button>

                      {/* DELETE */}
                      <button onClick={() => handleDelete(loc.id || loc._id)}>
                        <svg
                          fill="red"
                          width={16}
                          height={16}
                          viewBox="0 0 448 512"
                        >
                          <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===================== MOBILE / TABLET CARD VIEW ===================== */}
          <div className="block lg:hidden space-y-4  ">
            {locations.map((loc) => (
              <div
                key={loc.id || loc._id}
                className="bg-white rounded-xl border shadow p-4 !mb-2.5"
              >
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="text-right font-semibold">{loc.name}</span>

                  <span className="text-gray-500">Lat</span>
                  <span className="text-right">{loc.lat}</span>

                  <span className="text-gray-500">Long</span>
                  <span className="text-right">{loc.lng ?? loc.long}</span>

                  <span className="text-gray-500">Radius</span>
                  <span className="text-right">{loc.radius}</span>

                  <span className="text-gray-500">Actions</span>
                  <span className="flex justify-end items-center gap-1.5">
                    {/* EDIT ICON */}
                    <button
                      onClick={() =>
                        navigate(`/dashboard/users/location/edit/${loc.id || loc._id}`)
                      }
                      className="flex items-center justify-center w-6 h-6 !m-0"
                    >
                      <svg
                        fill="#22374e"
                        width={22}
                        height={22}
                        viewBox="0 0 640 512"
                      >
                        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l293.1 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1l-91.4 0zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z" />
                      </svg>
                    </button>

                    {/* DELETE ICON */}
                    <button
                      onClick={() => handleDelete(loc.id || loc._id)}
                      className="flex items-center justify-center w-6 h-6 !m-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="18"
                        height="18"
                        fill="red"
                        className="block"
                      >
                        <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32S433.7 32 416 32h-96l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32l21.2 339c1.6 25.3 22.6 45 47.9 45h245.8c25.3 0 46.3-19.7 47.9-45L416 128z" />
                      </svg>
                    </button>
                  </span>

                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div >
  );
};

export default LocationList;
