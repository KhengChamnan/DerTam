import React from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./navigation";

const InstallApp = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation activeNav="Plan Trip" />
      <div style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f6fa"
      }}>
        <img
          src="/images/dertam_logo.png"
          alt="Dertam Logo"
          style={{ width: 240, marginBottom: 8}}
        />
        <h1 style={{ color: "#01005B" }}>Install Dertam App</h1>
        <p style={{ maxWidth: 320, textAlign: "center", marginBottom: 32 }}>
          To continue, please install the Dertam app. Enjoy a better experience and unlock all features!
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=com.dertam.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#01005B",
            color: "#fff",
            padding: "12px 32px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 16
          }}
        >
          Install Now
        </a>
        
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            color: "#01005B",
            fontSize: 16,
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Back to Home
        </button>
      </div>
    </>
  );
};

export default InstallApp;