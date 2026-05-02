import { useRef, useState } from "react";
import { createWorker } from "tesseract.js";

function ReceiptCameraScanner({ onAddProducts }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [detectedProducts, setDetectedProducts] = useState([]);
  const [error, setError] = useState("");

  const ignoredKeywords = [
    "toplam",
    "genel toplam",
    "kdv",
    "tarih",
    "saat",
    "para üstü",
    "nakit",
    "pos",
    "fiş",
    "fis",
    "fiş no",
    "fis no",
    "z no",
    "kasa",
    "vergi",
    "vkn",
    "mersis",
    "tel",
    "www",
    "tl",
    "₺",
    "i̇yi alışverişler",
    "iyi alışverişler",
  ];

  const averageShelfLifeDays = {
    marul: [5, 7],
    domates: [4, 7],
    salatalık: [5, 7],
    havuç: [14, 21],
    patates: [21, 35],
    soğan: [21, 28],
    muz: [2, 5],
    elma: [21, 28],
    yoğurt: [5, 7],
    süt: [3, 5],
    peynir: [7, 10],
    yumurta: [10, 14],
    tavuk: [1, 2],
  };

  const getEstimatedExpiryDate = (productName) => {
    if (!productName) return "";

    const lowerName = productName.toLowerCase().trim();
    let matchedRange = null;

    for (const key in averageShelfLifeDays) {
      if (lowerName.includes(key)) {
        matchedRange = averageShelfLifeDays[key];
        break;
      }
    }

    if (!matchedRange) return "";

    const avgDays = Math.max(
      1,
      Math.round((matchedRange[0] + matchedRange[1]) / 2)
    );

    const today = new Date();
    today.setDate(today.getDate() + avgDays);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calculateEstimatedShelfLife = (productName) => {
    if (!productName) return "";

    const lowerName = productName.toLowerCase().trim();
    let matchedRange = null;

    for (const key in averageShelfLifeDays) {
      if (lowerName.includes(key)) {
        matchedRange = averageShelfLifeDays[key];
        break;
      }
    }

    if (!matchedRange) return "Tahmini SKT hesaplanamadı";

    return `Tahmini ${matchedRange[0]}–${matchedRange[1]} gün içinde tüketilmeli`;
  };
const uselessReceiptWords = [
  "toplam",
  "genel toplam",
  "ara toplam",
  "kdv",
  "nakit",
  "para üstü",
  "paraüstü",
  "pos",
  "fis",
  "fiş",
  "fiş no",
  "fis no",
  "z no",
  "kasa",
  "tarih",
  "saat",
  "vergi",
  "vkn",
  "mersis",
  "tel",
  "telefon",
  "www",
  ".com",
  "no:",
  "no ",
  "i̇yi alışverişler",
  "iyi alışverişler",
  "saklayiniz",
  "saklayınız",
  "magazacilik",
  "mağazacılık",
  "istanbul",
  "anadolu",
];

const isUselessReceiptLine = (line) => {
  const lower = line.toLowerCase().trim();

  if (!lower) return true;
  if (lower.length < 3) return true;

  if (uselessReceiptWords.some((word) => lower.includes(word))) return true;

  // sadece sayı / fiyat / yüzde satırıysa alma
  if (/^[\d\s.,₺*%:/-]+$/.test(lower)) return true;

  return false;
};

const cleanProductName = (line) => {
  return line
    // fiyatları sil
    .replace(/\*?\s*\d+[.,]\d{2}\s*(tl|₺)?/gi, " ")
    // yüzdeleri sil
    .replace(/%\d+/g, " ")
    // miktar örnekleri
    .replace(/\b\d+[.,]?\d*\s*(kg|g|gr|lt|l|ml)\b/gi, " ")
    .replace(/\b\d+\s*(lu|li|adet)\b/gi, " ")
    // tek başına kalan sayıları sil
    .replace(/\b\d+\b/g, " ")
    // sadece harf ve boşluk bırak
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const isValidProductName = (name) => {
  const lower = name.toLowerCase().trim();

  if (!lower) return false;
  if (lower.length < 2) return false;

  if (uselessReceiptWords.some((word) => lower.includes(word))) return false;

  // tek kelimelik ama anlamsız OCR kırpıntılarını ele
  const bannedExact = [
    "tl",
    "kdv",
    "toplam",
    "nakit",
    "adet",
    "kg",
    "gr",
    "lt",
    "fis",
    "fiş",
  ];

  if (bannedExact.includes(lower)) return false;

  return true;
};

const parseReceiptText = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const productLines = lines.filter((line) => !isUselessReceiptLine(line));

  const cleanedProducts = productLines
    .map(cleanProductName)
    .filter(isValidProductName);

  // tekrarları kaldır
  const uniqueProducts = [...new Set(cleanedProducts)];

  return uniqueProducts.map((name, index) => ({
    id: Date.now() + index,
   name: name
  .toLowerCase()
  .split(" ")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" "),
    amount: "1 adet",
    expiryDate: getEstimatedExpiryDate(name),
    estimatedShelf: calculateEstimatedShelfLife(name),
    freshness: "normal",
    storage: "buzdolabı",
  }));
};
  

  const startCamera = async () => {
    try {
      setError("");
      setDetectedProducts([]);
      setOcrText("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Kamera açılamadı.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureAndReadReceipt = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Kamera hazır değil.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDetectedProducts([]);
      setOcrText("");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/png");

      const worker = await createWorker("tur+eng");
      const result = await worker.recognize(imageDataUrl);
      const text = result.data.text || "";

      setOcrText(text);

      const products = parseReceiptText(text);
      setDetectedProducts(products);

      await worker.terminate();
    } catch (err) {
      console.error(err);
      setError("Fiş okunurken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
const handleRemoveDetectedProduct = (id) => {
  setDetectedProducts((prev) => prev.filter((product) => product.id !== id));
};
  const handleAddAllProducts = () => {
  if (detectedProducts.length === 0) {
    setError("Eklenecek ürün kalmadı.");
    return;
  }

  onAddProducts(detectedProducts);
  alert("Seçilen ürünler evdeki ürünlere eklendi.");
  setDetectedProducts([]);
  setOcrText("");
  setError("");
};

  return (
    <div className="dashboard-section-card section-card--wide">
      <h3 className="dashboard-section-title">Kamera ile Fiş Okuma</h3>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
        <button className="profile-save-btn" type="button" onClick={startCamera}>
          Kamerayı Aç
        </button>

        <button className="edit-icon-btn" type="button" onClick={stopCamera}>
          Kamerayı Kapat
        </button>

        <button className="profile-save-btn" type="button" onClick={captureAndReadReceipt}>
          Fişi Oku
        </button>
      </div>

      {cameraOpen && (
        <div style={{ marginBottom: "16px" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "16px",
              border: "1px solid #dbe4ee",
              background: "#000",
            }}
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {loading && <p>Fiş okunuyor...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
{detectedProducts.length > 0 && (
  <div style={{ marginTop: "16px" }}>
    <h4 style={{ marginBottom: "12px" }}>Fişte Algılanan Ürünler</h4>

    <p style={{ marginBottom: "14px", color: "#475467" }}>
      İstemediğin ürünleri listeden çıkarabilirsin. Kalan ürünler evdeki ürünlere eklenecek.
    </p>

    <div className="products-grid">
      {detectedProducts.map((product) => (
        <div key={product.id} className="dashboard-product-card">
          <h4>{product.name}</h4>
          <p>Miktar: {product.amount}</p>
          <p>Son Tüketim Tarihi: {product.expiryDate || "-"}</p>
          <p>Tahmini SKT: {product.estimatedShelf}</p>

          <button
            type="button"
            onClick={() => handleRemoveDetectedProduct(product.id)}
            style={{
              marginTop: "12px",
              border: "none",
              borderRadius: "10px",
              padding: "8px 12px",
              cursor: "pointer",
              background: "#ffe5e5",
              color: "#b42318",
              fontWeight: "600",
            }}
          >
            Sil
          </button>
        </div>
      ))}
    </div>

    <button
      className="profile-save-btn"
      type="button"
      onClick={handleAddAllProducts}
      style={{ marginTop: "14px" }}
    >
      Kalan Ürünleri Evdeki Ürünlere Ekle
    </button>
  </div>
)}

      {ocrText && (
        <div style={{ marginTop: "16px" }}>
          <h4>Okunan Metin</h4>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f8fafc",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            {ocrText}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ReceiptCameraScanner;