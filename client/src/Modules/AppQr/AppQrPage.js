import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import logo from "../../Images/pidilite-logo-13.png";

const TARGET_URL = "https://pidiliteapp.ajivainfotech.com/qrdownload";

const AppQrPage = () => {
  const [qrSrc, setQrSrc] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateQr = async () => {
      setError("");
      setQrSrc("");
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(TARGET_URL, {
          width: 280,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        setQrSrc(dataUrl);
      } catch (_err) {
        setError("Failed to generate QR. Try again.");
      } finally {
        setIsGenerating(false);
      }
    };

    generateQr();
  }, []);

  return (
    <div className="app-qr-page">
      <div className="app-qr-shell">
        <div className="app-qr-card">
          <div className="app-qr-brand">
            <img src={logo} alt="Pidilite" className="app-qr-logo" />
            <h1 className="app-qr-title">Download Our App</h1>
            <p className="app-qr-subtitle">
              Scan the QR to open the app download page.
            </p>
          </div>

          <div className="app-qr-frame">
            {qrSrc ? (
              <img src={qrSrc} alt="QR code" className="app-qr-image" />
            ) : (
              <div className="app-qr-empty">
                {isGenerating ? "Generating QR..." : error || "QR unavailable"}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AppQrPage;
