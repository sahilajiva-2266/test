import React from "react";
import "./DownloadApp.css";
// import logo from "../assets/pidilitelogo.avif";

const DownloadApp = () => {
    return (
        <div className="pid_Qr_page">
            <div className="pid_Qr_card">

                {/* LOGO */}
                <div className="pid_Qr_logoWrap">
                    <img src="https://pidiliteapp.ajivainfotech.com/static/media/pidilitelogo.f1366c67510045f0211f.png" alt="App Logo" className="pid_Qr_logo" />
                </div>

                <h1 className="pid_Qr_title">Download Our App</h1>

                <p className="pid_Qr_subtitle">
                    Choose your platform to download the app.
                </p>

                {/* ANDROID BUTTON */}
                <a
                    href="https://pidilite.ajivainfotech.com/apk/pidilite.apk"
                    download
                    className="pid_Qr_btn pid_Qr_android"
                >
                    <svg
                        width={28}
                        height={28}
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640">
                        <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" /></svg>
                    Download Android APK
                </a>

                {/* IOS BUTTON */}
                <a
                    href="https://yourdomain.com/ios/app"
                    className="pid_Qr_btn pid_Qr_ios"
                >
                    <svg
                        width={28}
                        height={28}
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640">
                        <path d="M447.1 332.7C446.9 296 463.5 268.3 497.1 247.9C478.3 221 449.9 206.2 412.4 203.3C376.9 200.5 338.1 224 323.9 224C308.9 224 274.5 204.3 247.5 204.3C191.7 205.2 132.4 248.8 132.4 337.5C132.4 363.7 137.2 390.8 146.8 418.7C159.6 455.4 205.8 545.4 254 543.9C279.2 543.3 297 526 329.8 526C361.6 526 378.1 543.9 406.2 543.9C454.8 543.2 496.6 461.4 508.8 424.6C443.6 393.9 447.1 334.6 447.1 332.7zM390.5 168.5C417.8 136.1 415.3 106.6 414.5 96C390.4 97.4 362.5 112.4 346.6 130.9C329.1 150.7 318.8 175.2 321 202.8C347.1 204.8 370.9 191.4 390.5 168.5z" /></svg>
                    Download iOS
                </a>

                <p className="pid_Qr_note">
                    * Android APK may show a Chrome security warning. This is normal.
                </p>

            </div>
        </div>
    );
};

export default DownloadApp;
