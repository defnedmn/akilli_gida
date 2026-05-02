import { useState } from "react";
import { createWorker } from "tesseract.js";

function ReceiptScanner({ onProductsExtracted }) {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseReceiptText = (text) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // Fişte ürün gibi görünen satırları ayıkla
    // Çok kısa satırları, toplam/kdv/tarih gibi şeyleri dışla
    const ignoredKeywords = [
      "toplam",
      "kdv",
      "tarih",
      "saat",
      "para üstü",
      "nakit",
      "pos",
      "fiş",
      "market",
      "no:",
      "fis no",
      "z no",
      "kasa",
      "tl",
      "₺",
    ];

    const productLines = lines.filter((line) => {
      const lower = line.toLowerCase();

      if (ignoredKeywords.some((word) => lower.includes(word))) return false;
      if (line.length < 3) return false;

      // Sadece rakam/fiat satırlarını ele
      const onlyNumbers = /^[\d\s.,₺%-]+$/.test(line);
      if (onlyNumbers) return false;

      return true;
    });

    // Basit ürün objesi üret
    return productLines.map((line, index) => ({
      id: Date.now() + index,
      name: line.replace(/\s{2,}/g, " ").trim(),
      amount: "1 adet",
      expiryDate: "",
      estimatedShelf: "",
      freshness: "normal",
      storage: "buzdolabı",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setError("");
    setOcrText("");
  };

  const handleReadReceipt = async () => {
    if (!image) {
      setError("Önce fiş görseli seç.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const worker = await createWorker("tur+eng");
      const result = await worker.recognize(image);
      const text = result.data.text || "";

      setOcrText(text);

      const extractedProducts = parseReceiptText(text);

      if (extractedProducts.length === 0) {
        setError("Fişte ürün satırı bulunamadı.");
      } else {
        onProductsExtracted(extractedProducts);
      }

      await worker.terminate();
    } catch (err) {
      console.error(err);
      setError("Fiş okunurken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-section-card section-card--wide">
      <h3 className="dashboard-section-title">Fiş Okuma (OCR)</h3>

      <input
        className="profile-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      <button
        className="profile-save-btn"
        type="button"
        onClick={handleReadReceipt}
        style={{ marginTop: "10px" }}
      >
        Fişi Oku
      </button>

      {loading && <p style={{ marginTop: "10px" }}>Fiş okunuyor...</p>}
      {error && <p style={{ marginTop: "10px", color: "red" }}>{error}</p>}

      {ocrText && (
        <div style={{ marginTop: "14px" }}>
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

export default ReceiptScanner;