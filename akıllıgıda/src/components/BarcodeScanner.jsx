import { useEffect, useRef, useState } from "react";

function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState("");

  const DEMO_TADELLA_BARCODE = "8683417000140";

  const openCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOpen(true);
    } catch (err) {
      console.error(err);
      setError("Kamera açılamadı. Kamera iznini kontrol et.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const readDemoBarcode = () => {
    if (typeof onDetected === "function") {
      onDetected(DEMO_TADELLA_BARCODE);
    }
  };

  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, []);

  return (
    <div className="barcode-scanner-box" style={{ marginTop: "14px" }}>
      <div
        style={{
          width: "360px",
          maxWidth: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #dbe4ee",
          background: "#111827",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "230px",
            objectFit: "cover",
            display: cameraOpen ? "block" : "none",
          }}
          muted
          playsInline
        />

        {!cameraOpen && (
          <div
            style={{
              height: "230px",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: "700",
            }}
          >
            Kamera kapalı
          </div>
        )}
      </div>

      {error && <p style={{ color: "#c62828", marginTop: "8px" }}>{error}</p>}

      <div
        style={{
          marginTop: "12px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="edit-icon-btn" onClick={openCamera}>
          Kamerayı Aç
        </button>

        <button
          type="button"
          className="edit-icon-btn"
          onClick={readDemoBarcode}
          disabled={!cameraOpen}
        >
          Barkodu Oku
        </button>

        <button type="button" className="edit-icon-btn" onClick={closeCamera}>
          Kamerayı Kapat
        </button>
      </div>
    </div>
  );
}

export default BarcodeScanner;