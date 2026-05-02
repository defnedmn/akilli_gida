export async function fetchProductByBarcode(barcode) {
  const cleanBarcode = String(barcode).trim();

  if (!cleanBarcode) {
    throw new Error("Barkod boş olamaz.");
  }

  const url = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("API isteği başarısız oldu.");
  }

  const data = await response.json();

  if (!data || data.status !== 1 || !data.product) {
    throw new Error("Ürün bulunamadı.");
  }

  const product = data.product;

  return {
    barcode: cleanBarcode,
    name: product.product_name || "İsim yok",
    brand: product.brands || "Marka yok",
    ingredients: product.ingredients_text || "İçerik bilgisi yok",
    allergens: product.allergens || "Alerjen bilgisi yok",
    nutriscore: product.nutriscore_grade || "Yok",
    image: product.image_url || "",
    energy: product.nutriments?.energy_kcal_100g || "-",
    sugar: product.nutriments?.sugars_100g || "-",
    fat: product.nutriments?.fat_100g || "-",
    salt: product.nutriments?.salt_100g || "-",
  };
}