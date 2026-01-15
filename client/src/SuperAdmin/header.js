import React, { useState, useEffect } from "react";
import Pic from "../Images/woman.jpg";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Notify from "../Images/Notification .gif";
import { useUser } from "../Helpers/Context/UserContext";
import { getData, domainpath } from "../Helpers/api";
import logo from "../Images/pidilite-logo-13.png"; // Adjust path
const Header = () => {
  const { setUser } = useUser(); // Destructure setUser from useUser

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("accesstoken");
    Cookies.remove("accesstoken");
    Cookies.remove("userdetail");
    setUser(null);

    navigate("/login");
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  const resolveImageUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/uploads/")) {
      const base = domainpath.replace(/\/api\/?$/, "");
      return `${base}${value}`;
    }
    return value;
  };

  useEffect(() => {
    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");

    if (!accessToken) {
      navigate("/login");
      return;
    }

    // Retrieve and decode user details
    const encodedUserDetails = Cookies.get("userdetail");

    if (encodedUserDetails) {
      try {
        const decodedData = atob(encodedUserDetails); // Decode Base64
        const userDetails = JSON.parse(decodedData); // Parse JSON

        const resolvedName =
          userDetails.name ||
          userDetails.fullname ||
          [userDetails.firstName, userDetails.lastName].filter(Boolean).join(" ") ||
          userDetails.first_name ||
          "User";
        setUserName(resolvedName);

        const resolvedAvatar =
          userDetails.profileImage ||
          userDetails.profile_image ||
          userDetails.avatar ||
          userDetails.image ||
          "";
        setUserAvatar(resolveImageUrl(resolvedAvatar));
      } catch (error) {
        console.error("Error decoding user details:", error);
        setUserName("User"); // Default fallback
      }
    }
  }, [navigate]);

  useEffect(() => {
    let intervalId;
    const fetchCount = async () => {
      try {
        const res = await getData("/activity/notifications/unread-count");
        if (res?.status) {
          setNotificationCount(Number(res.count) || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notification count");
      }
    };

    fetchCount();
    intervalId = setInterval(fetchCount, 30000);

    const handleRead = () => setNotificationCount(0);
    const handleFocus = () => fetchCount();
    window.addEventListener("notifications-read", handleRead);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("notifications-read", handleRead);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div style={{ boxShadow: "0px 0px 10px 2px rgba(96, 75, 75, 0.21)" }}>
      <header className="flex justify-between items-center px-7 py-1 bg-white header">
        {/* Left Section: Logo and Title */}
        <div className="flex items-center space-x-2">
          <div className="dash-header">
            <a href="#" className="header-logo">
              <img height="" width="" src={logo} alt="CodingNepal" />
            </a>
          </div>
        </div>

        {/* Right Section: User Profile */}
        <div className="AJ-crm-right-profile-section flex items-center ">
          <div
            className="AJ-crm-notification-section"
            style={{ position: "relative" }}
            onClick={() => navigate("/dashboard/notifications")}
          >
            <svg
              fill="#22374e"
              width={28}
              height={28}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3
             92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
              />
            </svg>
            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#e11d48",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "2px 6px",
                  fontSize: 10,
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {notificationCount}
              </span>
            )}
            {/* <img src={Notify} /> */}
          </div>
          <div
            className="relative py-2"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div
              style={{ background: "#22374e" }}
              className="AJ-crm-profile-section flex items-center  text-white rounded-full  py-4 cursor-pointer gap-2.5"
            >
              <img
                src={userAvatar || Pic}
                alt="Profile"
                className="w-10 h-10 rounded-full !m-0 object-cover"
              />
              <div className="flex ml-4 items-center gap-2">
                <span className="text-sm"> Hi, {userName}</span>

                {/* <p>Your permissions: {permissions.join(", ")}</p> */}
                <svg
                  fill="#fff"
                  width={15}
                  height={15}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                </svg>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="AJ-crm-main-profile-section  dropdown-menu absolute w-37 bg-white shadow-md rounded-md text-gray-700">
                <ul className=" ">
                  <li>
                    <button className="AJ-crm-droping-profile flex block w-full text-center px-4 py-5 hover:bg-gray-100">
                      <div className="flex gap-2">
                        <div>
                          <svg
                            fill="#22374e"
                            width={17}
                            height={17}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
                          </svg>
                        </div>

                        <div>Profile</div>
                      </div>
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="AJ-crm-droping-profile block w-full text-center px-4 py-2  text-red-600 hover:bg-gray-100"
                    >
                      <div className="flex gap-2">
                        <div>
                          <svg
                            fill="#22374e"
                            width={15}
                            height={15}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                          </svg>
                        </div>

                        <div>Log out</div>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
