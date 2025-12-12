import React from "react";import { useNavigate } from "react-router-dom";import { Download, Calendar, Bus, Hotel, MapPin } from "lucide-react";const InstallApp = () => {  const navigate = useNavigate();  return (    <div style={{      minHeight: "100vh",      display: "flex",      flexDirection: "column",      justifyContent: "center",      alignItems: "center",      background: "linear-gradient(135deg, #f5f6fa 0%, #e8ebf5 100%)",      padding: "20px"    }}>      <div style={{        maxWidth: "500px",        background: "white",        borderRadius: "16px",        padding: "40px 30px",        boxShadow: "0 10px 40px rgba(1, 0, 91, 0.1)",        textAlign: "center"      }}>        <img          src="/images/dertam_logo.png"          alt="Dertam Logo"          style={{             width: 100,             marginBottom: 24,            height: "auto"          }}        />                <h1 style={{          fontSize: "28px",          fontWeight: "bold",          color: "#01005B",          marginBottom: "16px"        }}>          Install Dertam App        </h1>                <p style={{           maxWidth: "100%",           textAlign: "center",           marginBottom: "32px",          color: "#666",          fontSize: "16px",          lineHeight: "1.6"        }}>          Complete your booking and unlock all features with the Dertam mobile app!        </p>        {/* Features */}        <div style={{          textAlign: "left",          marginBottom: "32px",          padding: "20px",          background: "#f8f9fa",          borderRadius: "12px"        }}>          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#01005B" }}>            What you can do:
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Bus size={20} color="#01005B" />
              <span style={{ fontSize: "14px", color: "#333" }}>Complete bus & hotel bookings</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Calendar size={20} color="#01005B" />
              <span style={{ fontSize: "14px", color: "#333" }}>Plan your entire trip</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MapPin size={20} color="#01005B" />
              <span style={{ fontSize: "14px", color: "#333" }}>Manage itineraries on the go</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={() => window.open("https://play.google.com/store/apps/details?id=com.dertam.app", "_blank")}
          style={{
            width: "100%",
            background: "#01005B",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(1, 0, 91, 0.2)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#000442";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(1, 0, 91, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#01005B";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(1, 0, 91, 0.2)";
          }}
        >
          <Download size={18} /> Download Dertam App
        </button>

        {/* Navigation Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              background: "transparent",
              border: "2px solid #01005B",
              color: "#01005B",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#01005B";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#01005B";
            }}
          >
            Back to Home
          </button>

          <button
            onClick={() => navigate("/bus_booking")}
            style={{
              width: "100%",
              background: "transparent",
              border: "2px solid #01005B",
              color: "#01005B",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#01005B";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#01005B";
            }}
          >
            Back to Buses
          </button>
        </div>

        {/* Skip Link */}
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            background: "none",
            border: "none",
            color: "#999",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "underline",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#01005B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#999";
          }}
        >
          I'll download later
        </button>
      </div>
    </div>
  );
};

export default InstallApp;