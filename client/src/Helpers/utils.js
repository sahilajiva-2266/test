import { decryptData } from "./encryptionHelper";

// Helper function to get a cookie by name
function getCookie(name) {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ");

  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null; // Return null if the cookie is not found
}

export const getUserData = () => {
  // Check if the user data is available in cookies
  const encryptedUserDataFromCookie = getCookie("userdetail");
  const accessTokenFromCookie = getCookie("accessToken");
  const refreshTokenFromCookie = getCookie("refreshToken");
  console.log(encryptedUserDataFromCookie);
  if (
    encryptedUserDataFromCookie &&
    accessTokenFromCookie &&
    refreshTokenFromCookie
  ) {
    // Try to decrypt user data
    try {
      const userData = decryptData(encryptedUserDataFromCookie);
      if (userData.role === "staff" && userData.employerid) {
        userData._id = userData.employerid;
      }
      return userData;
    } catch (error) {
      console.error("Decryption failed for user data:", error);
      return null;
    }
  }
  const encryptedUserData = localStorage.getItem("userdetail");
  if (!encryptedUserData) return null;

  try {
    const userData = decryptData(encryptedUserData);
    console.log(userData);
    if (userData.role === "staff" && userData.employerid) {
      userData._id = userData.employerid;
    }
    return userData;
  } catch (error) {
    console.error("Decryption failed for localStorage user data:", error);
    return null;
  }
};

export const getUserRole = () => {
  const userData = getUserData();
  return userData ? userData.role : null;
};
