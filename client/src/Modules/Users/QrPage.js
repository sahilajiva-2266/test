import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import { domainpath } from "../../Helpers/api.js";
import "../../Styles/qrpage.css";
import logo from "../../Images/pidilite-logo-13.png";

const QrCard = ({
  title,
  subtitle,
  imageSrc,
  expiresAt,
  remainingSeconds,
  loading,
  onTitleClick,
}) => (
  <div className="qr-app-card">
    <div className="qr-app-card-head">
      <img src={logo} alt="Pidilite" className="qr-app-logo" />
      {onTitleClick ? (
        <button
          type="button"
          className="qr-app-title-button"
          onClick={onTitleClick}
        >
          {title}
        </button>
      ) : (
        <h3 className="qr-app-card-title">{title}</h3>
      )}
      <p className="qr-app-card-subtitle">{subtitle}</p>
      <span className={`qr-app-pill ${loading ? "is-loading" : ""}`}>
        {loading ? "Refreshing..." : "Auto refresh on expiry"}
      </span>
    </div>

    <div className="qr-app-frame">
      {imageSrc ? (
        <img src={imageSrc} alt={`${title} QR`} className="qr-app-image" />
      ) : (
        <span className="qr-app-empty">No QR generated</span>
      )}
    </div>

    <div className="qr-app-meta">
      <div className="qr-app-meta-item">
        <span className="qr-app-meta-label">Expires</span>
        <span className="qr-app-meta-value">
          {expiresAt ? new Date(expiresAt).toLocaleString() : "—"}
        </span>
      </div>
      <div className="qr-app-meta-item">
        <span className="qr-app-meta-label">Time left</span>
        <span className="qr-app-meta-value">
          {remainingSeconds !== null ? `${Math.max(0, remainingSeconds)}s` : "—"}
        </span>
      </div>
    </div>
  </div>
);

const QrPage = ({ singleAction = null }) => {
  const [loginState, setLoginState] = useState({
    token: "",
    imageSrc: "",
    expiresAt: null,
    loading: false,
  });
  const [logoutState, setLogoutState] = useState({
    token: "",
    imageSrc: "",
    expiresAt: null,
    loading: false,
  });
  const [loginRemaining, setLoginRemaining] = useState(null);
  const [logoutRemaining, setLogoutRemaining] = useState(null);
  const navigate = useNavigate();

  const isLoginOnly = singleAction === "login";
  const isLogoutOnly = singleAction === "logout";

  const loginRefreshRef = useRef(null);
  const logoutRefreshRef = useRef(null);
  const loginStatusRef = useRef(null);
  const logoutStatusRef = useRef(null);
  const loginTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const clearIntervalRef = (ref) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  const revokeImage = (src) => {
    if (src) {
      URL.revokeObjectURL(src);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("qr_access_token");
    if (!token) {
      navigate("/qr-login");
    }
  }, [navigate]);

  const handleQrLogout = () => {
    localStorage.removeItem("qr_access_token");
    navigate("/qr-login");
  };

  const fetchQrPng = useCallback(
    async (action, setState) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const accessToken = localStorage.getItem("qr_access_token");
        const response = await axios.post(
          `${domainpath}/qr/generate`,
          { action },
          {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
          }
        );

        const token = response?.data?.token || "";
        const expiresAt = response?.data?.expiresAt || null;
        const imageSrc = token
          ? await QRCode.toDataURL(token, {
              width: 260,
              margin: 2,
              color: {
                dark: "#0f172a",
                light: "#ffffff",
              },
            })
          : "";

        setState((prev) => {
          return {
            token,
            imageSrc,
            expiresAt,
            loading: false,
          };
        });
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  const scheduleRefresh = useCallback((expiresAt, action) => {
    if (!expiresAt) return;
    const expiresMs = new Date(expiresAt).getTime() - Date.now();
    if (!Number.isFinite(expiresMs) || expiresMs <= 0) return;

    const timeout = setTimeout(() => {
      if (action === "login") {
        fetchQrPng("login", setLoginState);
      } else {
        fetchQrPng("logout", setLogoutState);
      }
    }, expiresMs + 500);

    if (action === "login") {
      clearTimer(loginRefreshRef);
      loginRefreshRef.current = timeout;
    } else {
      clearTimer(logoutRefreshRef);
      logoutRefreshRef.current = timeout;
    }
  }, [fetchQrPng]);

  const startCountdown = useCallback((expiresAt, action) => {
    if (!expiresAt) return;
    const endTime = new Date(expiresAt).getTime();
    const update = () => {
      const secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
      if (action === "login") {
        setLoginRemaining(secondsLeft > 0 ? secondsLeft : 0);
      } else {
        setLogoutRemaining(secondsLeft > 0 ? secondsLeft : 0);
      }
      if (secondsLeft <= 0) {
        clearIntervalRef(action === "login" ? loginTimerRef : logoutTimerRef);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    if (action === "login") {
      clearIntervalRef(loginTimerRef);
      loginTimerRef.current = interval;
    } else {
      clearIntervalRef(logoutTimerRef);
      logoutTimerRef.current = interval;
    }
  }, []);

  const startStatusPolling = useCallback((token, action) => {
    if (!token) return;
    const poll = async () => {
      try {
        const response = await axios.get(`${domainpath}/qr/status`, {
          params: { token },
        });
        const status = response?.data?.data;
        if (status?.expired) {
          if (action === "login") {
            fetchQrPng("login", setLoginState);
          } else {
            fetchQrPng("logout", setLogoutState);
          }
        }
      } catch (_err) {
        // ignore polling errors
      }
    };

    const interval = setInterval(poll, 10000);
    if (action === "login") {
      clearIntervalRef(loginStatusRef);
      loginStatusRef.current = interval;
    } else {
      clearIntervalRef(logoutStatusRef);
      logoutStatusRef.current = interval;
    }
  }, [fetchQrPng]);

  useEffect(() => {
    if (!isLogoutOnly) {
      fetchQrPng("login", setLoginState);
    }
    if (!isLoginOnly) {
      fetchQrPng("logout", setLogoutState);
    }
    return () => {
      clearTimer(loginRefreshRef);
      clearTimer(logoutRefreshRef);
      clearIntervalRef(loginStatusRef);
      clearIntervalRef(logoutStatusRef);
      clearIntervalRef(loginTimerRef);
      clearIntervalRef(logoutTimerRef);
    };
  }, [fetchQrPng, isLoginOnly, isLogoutOnly]);

  useEffect(() => {
    if (isLogoutOnly) return;
    if (loginState.expiresAt) {
      scheduleRefresh(loginState.expiresAt, "login");
      startCountdown(loginState.expiresAt, "login");
    }
    if (loginState.token) {
      startStatusPolling(loginState.token, "login");
    }
  }, [
    loginState.expiresAt,
    loginState.token,
    scheduleRefresh,
    startStatusPolling,
    startCountdown,
    isLogoutOnly,
  ]);

  useEffect(() => {
    if (isLoginOnly) return;
    if (logoutState.expiresAt) {
      scheduleRefresh(logoutState.expiresAt, "logout");
      startCountdown(logoutState.expiresAt, "logout");
    }
    if (logoutState.token) {
      startStatusPolling(logoutState.token, "logout");
    }
  }, [
    logoutState.expiresAt,
    logoutState.token,
    scheduleRefresh,
    startStatusPolling,
    startCountdown,
    isLoginOnly,
  ]);

  const headerTitle = isLoginOnly
    ? "Login QR"
    : isLogoutOnly
      ? "Logout QR"
      : "QR Login / Logout";
  const headerSubtitle = isLoginOnly || isLogoutOnly
    ? "One QR per action, reusable until expiry. Auto-refresh on expiry only."
    : "One QR per action, reusable until expiry. Auto-refresh on expiry only.";

  return (
    <div className="qr-app-page">
      <div className="qr-app-shell">
        {!singleAction && (
          <div className="qr-app-header">
            <img src={logo} alt="Pidilite" className="qr-app-logo-main" />
            <h1 className="qr-app-title">{headerTitle}</h1>
            <p className="qr-app-subtitle">{headerSubtitle}</p>
            <div className="qr-app-actions">
              <button
                className="qr-app-btn qr-app-btn--ghost"
                type="button"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
              <button
                className="qr-app-btn qr-app-btn--dark"
                type="button"
                onClick={handleQrLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div className={`qr-app-grid ${singleAction ? "is-single" : ""}`}>
          {!isLogoutOnly && (
            <QrCard
              title="Login QR"
              subtitle="Scan the QR to log in securely."
              imageSrc={loginState.imageSrc}
              expiresAt={loginState.expiresAt}
              loading={loginState.loading}
              remainingSeconds={loginRemaining}
              onTitleClick={
                isLoginOnly ? undefined : () => navigate("/LoginQr")
              }
            />
          )}
          {!isLoginOnly && (
            <QrCard
              title="Logout QR"
              subtitle="Scan the QR to log out securely."
              imageSrc={logoutState.imageSrc}
              expiresAt={logoutState.expiresAt}
              loading={logoutState.loading}
              remainingSeconds={logoutRemaining}
              onTitleClick={
                isLogoutOnly ? undefined : () => navigate("/LogoutQr")
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QrPage;
