import { useState } from "react";

function BarcodePage({ addToHomeProducts }) {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setError("");
      setProduct(null);

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1) {
        setProduct({
          barcode: barcode,
          name: data.product.product_name || "İsimsiz ürün",
          brand: data.product.brands || "Bilinmiyor",
          image: data.product.image_url || "",
        });
      } else {
        setError("Ürün bulunamadı");
      }
    } catch (err) {
      setError("Bir hata oluştu");
    }
  };

  const handleAddProduct = () => {
    if (!product) return;
    addToHomeProducts(product);
    alert("Ürün evdeki ürünlere eklendi");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Barkod Sorgulama</h2>

      <input
        type="text"
        placeholder="Barkod gir"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        style={{ padding: "10px", width: "250px", marginRight: "10px" }}
      />

      <button onClick={handleSearch}>Barkodu Sorgula</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {product && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            maxWidth: "350px",
          }}
        >
          <h3>{product.name}</h3>
          <p>Marka: {product.brand}</p>

          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: "150px", display: "block", marginBottom: "10px" }}
            />
          )}

          <button onClick={handleAddProduct}>Evdeki Ürünlere Ekle</button>
        </div>
      )}
    </div>
  );
}

export default BarcodePage;