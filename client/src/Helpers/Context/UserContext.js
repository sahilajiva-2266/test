
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("User");
  const [permissions, setPermissions] = useState([]); // ✅ Add permissions state

  useEffect(() => {
    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");

    if (!accessToken) {
      return;
    }

    const encodedUserDetails = Cookies.get("userdetail");
    if (encodedUserDetails) {
      try {
        const decodedData = atob(encodedUserDetails);
        const userDetails = JSON.parse(decodedData);
        setUser(userDetails);

        // ✅ Extract and format user name
        let name = userDetails.first_name || "User";
        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        setUserName(name);

        // ✅ Set permissions if available
        if (userDetails.permissions && Array.isArray(userDetails.permissions)) {
          setPermissions(userDetails.permissions);
        } else {
          setPermissions([]); // fallback to empty array
        }
      } catch (error) {
        console.error("Error decoding user details:", error);
        setUserName("User");
        setPermissions([]);
      }
    }
  }, []);

  const logout = () => {
    Cookies.remove("userdetail");
    Cookies.remove("accesstoken");
    localStorage.removeItem("accesstoken");
    setUser(null);
    setPermissions([]);
  };

  return (
    <UserContext.Provider
      value={{ user, userName, setUser, logout, permissions }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
