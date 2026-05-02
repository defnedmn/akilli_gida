import { useEffect, useMemo, useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import "./dashboard.css";
import ReceiptCameraScanner from "../components/ReceiptCameraScanner";
import { turkishRecipes } from "../data/turkishRecipes";



function Dashboard({
  selectedUser,
  updateMemberField,
  homeProducts = [],
  setHomeProducts,
}) {
  const [editingField, setEditingField] = useState(null);

  const userKey = selectedUser?.id || "guest";

  const userProducts = Array.isArray(homeProducts) ? homeProducts : [];

  const setUserProducts = (updater) => {
    if (!setHomeProducts) {
      console.error("setHomeProducts Dashboard'a gelmiyor.");
     

      return;
    }

    setHomeProducts((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      if (typeof updater === "function") {
        return updater(safePrev);
      }

      return Array.isArray(updater) ? updater : safePrev;
    });
  };
  const [newProductName, setNewProductName] = useState("");
  const [newProductAmount, setNewProductAmount] = useState("");
  const [newProductExpiry, setNewProductExpiry] = useState("");
  const [productFreshness, setProductFreshness] = useState("taze");
  const [storageType, setStorageType] = useState("buzdolabı");
  const [estimatedShelfText, setEstimatedShelfText] = useState("");

  const [customDiseaseInput, setCustomDiseaseInput] = useState("");
  const [customDiseaseError, setCustomDiseaseError] = useState("");

  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState("");

  const [suggestions] = useState([
    "Gün içinde su tüketimini artır.",
    "Akşam öğününde daha hafif seçenekler tercih et.",
    "Son kullanma tarihi yaklaşan ürünleri önce kullan.",
    "Şekerli atıştırmalıkları azaltıp protein ağırlıklı ara öğün seç.",
  ]);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [apiRecipes, setApiRecipes] = useState([]);

const [recipeLoading, setRecipeLoading] = useState(false);
const [recipeError, setRecipeError] = useState("");
const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [scannedProductAmount, setScannedProductAmount] = useState("");
  const [scannedProductExpiry, setScannedProductExpiry] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const [productResult, setProductResult] = useState(null);
  const [activeProductId, setActiveProductId] = useState(null);

const [dismissedCartIds, setDismissedCartIds] = useState(() => {
  const saved = localStorage.getItem(`dismissedCartIds_${userKey}`);
  return saved ? JSON.parse(saved) : [];
});

const [shoppingCartItems, setShoppingCartItems] = useState(() => {
  const saved = localStorage.getItem(`shoppingCartItems_${userKey}`);
  return saved ? JSON.parse(saved) : [];
});

const [wasteRecords, setWasteRecords] = useState(() => {
  const saved = localStorage.getItem(`wasteRecords_${userKey}`);
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem(`wasteRecords_${userKey}`, JSON.stringify(wasteRecords));
}, [wasteRecords, userKey]);
const localProducts = {
  "8697681460098": {
    barcode: "8697681460098",
    name: "Asya Su",
    brand: "Asya",
    ingredients: "Doğal içme suyu.",
    allergens: "Alerjen içermez.",
    nutriscore: "A",
    image: "",
    energy: "0",
    sugar: "0",
    fat: "0",
    salt: "0",
  },

  "8683417000140": {
    barcode: "8683417000140",
    name: "Tadelle Çikolata",
    brand: "Tadelle",
    ingredients:
      "Şeker, fındık, kakao, süt tozu, bitkisel yağ, kakao yağı, emülgatör ve aroma verici içerebilir.",
    allergens:
      "Fındık, süt ürünü içerebilir. Eser miktarda gluten, soya ve diğer sert kabuklu yemişler içerebilir.",
    nutriscore: "E",
    image: "",
    energy: "540",
    sugar: "45",
    fat: "34",
    salt: "0.25",
  },

  "5449000000996": {
    barcode: "5449000000996",
    name: "Coca-Cola",
    brand: "Coca-Cola",
    ingredients: "Karbonatlı su, şeker, aroma vericiler.",
    allergens: "Bilgi yok",
    nutriscore: "E",
    image: "",
    energy: "42",
    sugar: "10.6",
    fat: "0",
    salt: "0.02",
  },
};

  const allergyMap = {
    fıstık: ["fıstık", "yer fıstığı", "peanut", "arachis"],
    süt: ["süt", "milk", "lactose", "whey", "peynir altı suyu"],
    yumurta: ["yumurta", "egg"],
    soya: ["soya", "soy"],
    badem: ["badem", "almond"],
    ceviz: ["ceviz", "walnut"],
    susam: ["susam", "sesame"],
    gluten: ["gluten", "buğday", "arpa", "çavdar", "wheat", "barley", "rye"],
  };

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

  const freshnessFactors = {
    taze: 1.0,
    normal: 0.8,
    yumuşamış: 0.5,
  };

  const storageFactors = {
    buzdolabı: 1.0,
    "oda sıcaklığı": 0.7,
    "hava almayan kap": 1.2,
  };

  const ingredientTranslations = {
    domates: "tomato",
    salatalik: "cucumber",
    salatalık: "cucumber",
    marul: "lettuce",
    havuc: "carrot",
    havuç: "carrot",
    patates: "potato",
    sogan: "onion",
    soğan: "onion",
    sarimsak: "garlic",
    sarımsak: "garlic",
    biber: "pepper",
    tavuk: "chicken",
    yumurta: "egg",
    sut: "milk",
    süt: "milk",
    yogurt: "yogurt",
    yoğurt: "yogurt",
    peynir: "cheese",
    kasar: "cheese",
    kaşar: "cheese",
    pirinc: "rice",
    pirinç: "rice",
    makarna: "pasta",
    ekmek: "bread",
    muz: "banana",
    elma: "apple",
    cikolata: "chocolate",
    çikolata: "chocolate",
    dana: "beef",
    et: "beef",
    tonbaligi: "tuna",
    "ton baligi": "tuna",
    "ton balığı": "tuna",
  };

  const reverseIngredientTranslations = {
    tomato: "domates",
    cucumber: "salatalık",
    lettuce: "marul",
    carrot: "havuç",
    potato: "patates",
    onion: "soğan",
    garlic: "sarımsak",
    pepper: "biber",
    chicken: "tavuk",
    egg: "yumurta",
    milk: "süt",
    yogurt: "yoğurt",
    cheese: "peynir",
    rice: "pirinç",
    pasta: "makarna",
    bread: "ekmek",
    banana: "muz",
    apple: "elma",
    chocolate: "çikolata",
    beef: "et",
    tuna: "ton balığı",
  };

  const categoryTranslations = {
    Beef: "Et Yemekleri",
    Chicken: "Tavuk Yemekleri",
    Dessert: "Tatlı",
    Lamb: "Kuzu Yemekleri",
    Miscellaneous: "Karışık",
    Pasta: "Makarna",
    Pork: "Et Yemeği",
    Seafood: "Deniz Ürünleri",
    Side: "Yan Yemek",
    Starter: "Başlangıç",
    Vegan: "Vegan",
    Vegetarian: "Vejetaryen",
    Breakfast: "Kahvaltılık",
    Goat: "Keçi Eti",
  };

  const areaTranslations = {
    American: "Amerikan",
    British: "İngiliz",
    Canadian: "Kanadalı",
    Chinese: "Çin",
    Croatian: "Hırvat",
    Dutch: "Hollanda",
    Egyptian: "Mısır",
    Filipino: "Filipin",
    French: "Fransız",
    Greek: "Yunan",
    Indian: "Hint",
    Irish: "İrlanda",
    Italian: "İtalyan",
    Jamaican: "Jamaika",
    Japanese: "Japon",
    Kenyan: "Kenya",
    Malaysian: "Malezya",
    Mexican: "Meksika",
    Moroccan: "Fas",
    Polish: "Polonya",
    Portuguese: "Portekiz",
    Russian: "Rus",
    Spanish: "İspanyol",
    Thai: "Tayland",
    Tunisian: "Tunus",
    Turkish: "Türk",
    Ukrainian: "Ukrayna",
    Uruguayan: "Uruguay",
    Vietnamese: "Vietnam",
  };

 useEffect(() => {
  localStorage.setItem(
    `dismissedCartIds_${userKey}`,
    JSON.stringify(dismissedCartIds)
  );
}, [dismissedCartIds, userKey]);

useEffect(() => {
  localStorage.setItem(
    `shoppingCartItems_${userKey}`,
    JSON.stringify(shoppingCartItems)
  );
}, [shoppingCartItems, userKey]);

  const normalizeDiseaseArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [String(value)];
  };

  const mapCustomDisease = (input) => {
    const text = input.toLowerCase().trim();

    if (
      text.includes("şeker") ||
      text.includes("diyabet") ||
      text.includes("şeker hastalığı") ||
      text.includes("insülin direnci")
    ) {
      return "Diyabet";
    }

    if (
      text.includes("tansiyon") ||
      text.includes("yüksek tansiyon") ||
      text.includes("hipertansiyon")
    ) {
      return "Tansiyon";
    }

    if (
      text.includes("kolesterol") ||
      text.includes("kolestrol") ||
      text.includes("trigliserid")
    ) {
      return "Kolesterol";
    }

    if (text.includes("çölyak")) return "Çölyak";
    if (text.includes("laktoz")) return "Laktoz İntoleransı";
    if (text.includes("gluten")) return "Gluten Hassasiyeti";
    if (text.includes("obez")) return "Obezite";
    if (text.includes("kalp")) return "Kalp Hastalığı";

    return input.trim();
  };

 const selectedDiseaseList = normalizeDiseaseArray(selectedUser?.disease);

const selectedDiseasesLower = selectedDiseaseList.map((item) =>
  String(item || "").toLowerCase().trim()
);

const selectedAllergyList = Array.isArray(selectedUser?.allergies)
  ? selectedUser.allergies
  : [];

const selectedAllergiesLower = selectedAllergyList.map((item) =>
  String(item || "").toLowerCase().trim()
);

  const handleRemoveDisease = (diseaseToRemove) => {
    const currentDiseases = Array.isArray(selectedUser?.disease)
      ? selectedUser.disease
      : [];

    const updatedDiseases = currentDiseases.filter(
      (d) => d !== diseaseToRemove
    );

    updateMemberField(selectedUser.id, "disease", updatedDiseases);
  };

  const handleCustomDiseaseAdd = () => {
    if (!customDiseaseInput.trim()) return;

    const mappedDisease = mapCustomDisease(customDiseaseInput);

    const currentDiseases = Array.isArray(selectedUser?.disease)
      ? selectedUser.disease
      : [];

    if (currentDiseases.includes(mappedDisease)) {
      setCustomDiseaseError("Bu hastalık zaten ekli.");
      return;
    }

    const updatedDiseases = [...currentDiseases, mappedDisease];
    updateMemberField(selectedUser.id, "disease", updatedDiseases);

    setCustomDiseaseInput("");
    setCustomDiseaseError("");
  };

  const addAllergy = () => {
    const value = allergyInput.toLowerCase().trim();
    if (!value) return;
    if (allergies.includes(value)) return;

    setAllergies([...allergies, value]);
    setAllergyInput("");
  };

  const removeAllergy = (item) => {
    setAllergies(allergies.filter((a) => a !== item));
  };

 const evaluateProductRisk = (product, diseases = [], userAllergies = []) => {
  let score = 0;
  const reasons = [];

  const sugar = Number(product.sugar);
  const salt = Number(product.salt);
  const fat = Number(product.fat);

  const normalizeText = (text) =>
    String(text || "")
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u");

  const ingredients = normalizeText(product.ingredients);
  const allergensText = normalizeText(product.allergens);
  const fullText = `${ingredients} ${allergensText}`;

  const normalizedDiseases = diseases.map((d) => normalizeText(d));
  const normalizedAllergies = userAllergies.map((a) => normalizeText(a));

  const hasDisease = (keywords) =>
    normalizedDiseases.some((disease) =>
      keywords.some((keyword) => disease.includes(normalizeText(keyword)))
    );

  const containsAny = (keywords) =>
    keywords.some((keyword) => fullText.includes(normalizeText(keyword)));

  if (
    hasDisease([
      "diyabet",
      "seker",
      "seker hastaligi",
      "insulin direnci",
    ]) &&
    !Number.isNaN(sugar)
  ) {
    score += sugar * 1.5;

    if (sugar > 8) {
      reasons.push("Şeker oranı diyabet / şeker hastalığı için yüksek olabilir.");
    }
  }

  if (
    hasDisease([
      "tansiyon",
      "hipertansiyon",
      "yuksek tansiyon",
    ]) &&
    !Number.isNaN(salt)
  ) {
    score += salt * 20;

    if (salt > 1) {
      reasons.push("Tuz oranı tansiyon için riskli olabilir.");
    }
  }

  if (
    hasDisease([
      "kolesterol",
      "kolestrol",
      "trigliserid",
    ]) &&
    !Number.isNaN(fat)
  ) {
    score += fat * 1.2;

    if (fat > 15) {
      reasons.push("Yağ oranı kolesterol için yüksek olabilir.");
    }
  }

  if (
    hasDisease([
      "çölyak",
      "colyak",
      "gluten",
      "gluten hassasiyeti",
    ])
  ) {
    if (
      containsAny([
        "gluten",
        "buğday",
        "bugday",
        "wheat",
        "arpa",
        "barley",
        "çavdar",
        "cavdar",
        "rye",
      ])
    ) {
      score += 80;
      reasons.push("Gluten / buğday içeriği tespit edildi.");
    }
  }

  if (
    hasDisease([
      "laktoz",
      "laktoz intoleransi",
      "laktoz intoleransı",
    ])
  ) {
    if (
      containsAny([
        "süt",
        "sut",
        "milk",
        "laktoz",
        "lactose",
        "whey",
        "peynir alti suyu",
        "peynir altı suyu",
      ])
    ) {
      score += 70;
      reasons.push("Süt / laktoz içeriği tespit edildi.");
    }
  }

  normalizedAllergies.forEach((allergy) => {
    const allergyKeywords = allergyMap[allergy] || [allergy];

    const normalizedKeywords = allergyKeywords.map((item) =>
      normalizeText(item)
    );

    const matched = normalizedKeywords.some((word) =>
      fullText.includes(word)
    );

    if (matched) {
      score += 100;
      reasons.push(`${allergy} alerjisi için riskli içerik tespit edildi.`);
    }
  });

  let overall = "Güvenli";

  if (score >= 80) {
    overall = "Riskli";
  } else if (score >= 40) {
    overall = "Dikkat";
  }

  return {
    overall,
    score: Math.round(score),
    reasons,
  };
};

  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) {
      return { text: "Tarih yok", status: "Belirsiz" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Süresi geçti", status: "Geçti" };
    }
    if (diffDays === 0) {
      return { text: "Bugün son gün", status: "Acil tüket" };
    }
    if (diffDays <= 2) {
      return { text: `${diffDays} gün kaldı`, status: "Yaklaşıyor" };
    }
    return { text: `${diffDays} gün kaldı`, status: "Normal" };
  };

  const calculateEstimatedShelfLife = (productName, freshness, storage) => {
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

    const freshnessFactor = freshnessFactors[freshness] || 1.0;
    const storageFactor = storageFactors[storage] || 1.0;

    const minDays = Math.max(
      1,
      Math.round(matchedRange[0] * freshnessFactor * storageFactor)
    );
    const maxDays = Math.max(
      minDays,
      Math.round(matchedRange[1] * freshnessFactor * storageFactor)
    );

    return `Tahmini ${minDays}–${maxDays} gün içinde tüketilmeli`;
  };

  const getEstimatedExpiryDate = (productName, freshness, storage) => {
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

    const freshnessFactor = freshnessFactors[freshness] || 1.0;
    const storageFactor = storageFactors[storage] || 1.0;

    const avgDays = Math.max(
      1,
      Math.round(
        ((matchedRange[0] + matchedRange[1]) / 2) *
          freshnessFactor *
          storageFactor
      )
    );

    const today = new Date();
    today.setDate(today.getDate() + avgDays);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const result = calculateEstimatedShelfLife(
      newProductName,
      productFreshness,
      storageType
    );
    setEstimatedShelfText(result);
  }, [newProductName, productFreshness, storageType]);

  const getNutriScoreInfo = (score) => {
    const value = String(score || "").toUpperCase();

    switch (value) {
      case "A":
        return { label: "Çok iyi", color: "#16a34a" };
      case "B":
        return { label: "İyi", color: "#65a30d" };
      case "C":
        return { label: "Orta", color: "#eab308" };
      case "D":
        return { label: "Dikkat", color: "#f97316" };
      case "E":
        return { label: "Riskli", color: "#dc2626" };
      default:
        return { label: "Bilinmiyor", color: "#94a3b8" };
    }
  };

  const normalizeFoodName = (name) => {
    return String(name || "")
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .trim();
  };
  const evaluateRecipeRisk = (recipe) => {
  if (!recipe) return [];

  const safeText = `
    ${recipe.turkishTitle || ""}
    ${recipe.strMeal || ""}
    ${recipe.name || ""}
    ${recipe.turkishInstructions || ""}
    ${recipe.strInstructions || ""}
    ${recipe.instructions || ""}
    ${(recipe.ingredients || []).join(" ")}
  `;

  const text = normalizeFoodName(safeText);
  const warnings = [];

  const hasAny = (words) =>
    words.some((word) => text.includes(normalizeFoodName(word)));

  if (
    selectedDiseasesLower.some(
      (d) => d.includes("diyabet") || d.includes("seker") || d.includes("şeker")
    )
  ) {
    if (
      hasAny([
        "şeker",
        "seker",
        "bal",
        "çikolata",
        "cikolata",
        "baklava",
        "künefe",
        "kunefe",
        "revani",
        "tulumba",
        "puding",
        "sütlaç",
        "sutlac",
      ])
    ) {
      warnings.push("Diyabet için riskli olabilir.");
    }
  }

  if (
    selectedDiseasesLower.some(
      (d) => d.includes("tansiyon") || d.includes("hipertansiyon")
    )
  ) {
    if (hasAny(["tuz", "sucuk", "sosis", "salam", "turşu", "tursu"])) {
      warnings.push("Tansiyon için dikkatli tüketilmeli.");
    }
  }

  if (
    selectedDiseasesLower.some(
      (d) => d.includes("kolesterol") || d.includes("kolestrol")
    )
  ) {
    if (hasAny(["kızartma", "kizartma", "tereyağı", "tereyagi", "kaymak", "sucuk"])) {
      warnings.push("Kolesterol için dikkatli tüketilmeli.");
    }
  }
  if (
  selectedDiseasesLower.some(
    (d) =>
      d.includes("çölyak") ||
      d.includes("colyak") ||
      d.includes("gluten")
  )
) {
  if (
    hasAny([
      "ekmek",
      "makarna",
      "un",
      "buğday",
      "bugday",
      "gluten",
      "sandviç",
      "bulgur",
      "irmik",
      "sosis",
      "yulaf",
      "börek",
"brownie", 
      "bread",
      "pasta",
      "flour",
      "wheat",
      "hamur",
      "tost",
    ])
  ) {
    warnings.push("Çölyak / gluten hassasiyeti için uygun olmayabilir.");
  }
}
if (
  selectedDiseasesLower.some(
    (d) =>
      d.includes("laktoz") ||
      d.includes("laktoz intoleransı") ||
      d.includes("laktoz intoleransi")
  )
) {
  if (
    hasAny([
      "süt",
      "sut",
      "milk",
      "yoğurt",
      "ayran",
      "kefir",
      "krema",
      "beyaz peynir",
      "yogurt",
      "peynir",
      "kaşar",
      "kasar",
      "labne",
      "krema",
      "kaymak",
      "tereyağı",
      "tereyagi",
      "laktoz",
      "lactose",
      "whey",
    ])
  ) {
    warnings.push("Laktoz intoleransı için uygun olmayabilir.");
  }
}

  selectedAllergiesLower.forEach((allergy) => {
    const allergyWords = allergyMap[allergy] || [allergy];

    if (hasAny(allergyWords)) {
      warnings.push(`${allergy} alerjisi için riskli tarif.`);
    }
  });

  return [...new Set(warnings)];
};

  const translateIngredientToTurkish = (ingredient) => {
    const normalized = normalizeFoodName(ingredient);
    return reverseIngredientTranslations[normalized] || ingredient;
  };

  const extractMealIngredients = (meal) => {
    return [
      meal.strIngredient1,
      meal.strIngredient2,
      meal.strIngredient3,
      meal.strIngredient4,
      meal.strIngredient5,
      meal.strIngredient6,
      meal.strIngredient7,
      meal.strIngredient8,
      meal.strIngredient9,
      meal.strIngredient10,
      meal.strIngredient11,
      meal.strIngredient12,
      meal.strIngredient13,
      meal.strIngredient14,
      meal.strIngredient15,
      meal.strIngredient16,
      meal.strIngredient17,
      meal.strIngredient18,
      meal.strIngredient19,
      meal.strIngredient20,
    ].filter(Boolean);
  };

  const buildTurkishRecipeText = (meal) => {
    const ingredients = extractMealIngredients(meal)
      .slice(0, 8)
      .map((item) => translateIngredientToTurkish(item));

    const ingredientText = ingredients.length > 0 ? ingredients.join(", ") : "eldeki malzemeler";

    return `${ingredientText} kullanarak bu tarifi hazırlayabilirsin. Önce ana malzemeleri hazırla, ardından uygun sırayla pişir. Özellikle son kullanma tarihi yaklaşan ürünleri önce kullanmaya çalış ve malzemeleri kontrollü şekilde birleştirerek sıcak ya da uygun şekilde servis et.`;
  };

  const buildTurkishRecipeTitle = (meal) => {
    const firstIngredient = meal.strIngredient1
      ? translateIngredientToTurkish(meal.strIngredient1)
      : "Karışık";

    const category =
      categoryTranslations[meal.strCategory] || meal.strCategory || "Tarif";

    return `${firstIngredient} ile ${category}`;
  };

  const mapMealToTurkishDisplay = (meal) => {
    return {
      ...meal,
      turkishTitle: buildTurkishRecipeTitle(meal),
      turkishCategory:
        categoryTranslations[meal.strCategory] || meal.strCategory || "Genel",
      turkishArea: areaTranslations[meal.strArea] || meal.strArea || "",
      turkishInstructions: buildTurkishRecipeText(meal),
    };
  };

  const getPriorityIngredients = () => {
    const expiring = userProducts
      .map((product) => ({
        ...product,
        expiryInfo: getExpiryInfo(product.expiryDate),
      }))
      .filter(
        (product) =>
          product.expiryInfo.status === "Acil tüket" ||
          product.expiryInfo.status === "Yaklaşıyor"
      )
      .map((product) => normalizeFoodName(product.name));

    return [...new Set(expiring)];
  };

  const getTranslatedIngredients = () => {
    const names = userProducts
      .map((p) => normalizeFoodName(p.name))
      .filter(Boolean);

    const ignored = ["coca cola", "cola", "su", "ice tea", "gazoz"];

    const cleaned = [...new Set(names)].filter(
      (name) => !ignored.some((bad) => name.includes(bad))
    );

    return cleaned.map((item) => {
      for (const key in ingredientTranslations) {
        if (item.includes(key)) return ingredientTranslations[key];
      }
      return item;
    });
  };

  const scoreRecipeMatch = (meal, userIngredientNames, priorityIngredients) => {
    const mealIngredients = [
      meal.strIngredient1,
      meal.strIngredient2,
      meal.strIngredient3,
      meal.strIngredient4,
      meal.strIngredient5,
      meal.strIngredient6,
      meal.strIngredient7,
      meal.strIngredient8,
      meal.strIngredient9,
      meal.strIngredient10,
      meal.strIngredient11,
      meal.strIngredient12,
      meal.strIngredient13,
      meal.strIngredient14,
      meal.strIngredient15,
      meal.strIngredient16,
      meal.strIngredient17,
      meal.strIngredient18,
      meal.strIngredient19,
      meal.strIngredient20,
    ]
      .filter(Boolean)
      .map((x) => normalizeFoodName(x));

    let score = 0;

    userIngredientNames.forEach((userItem) => {
      if (mealIngredients.some((ing) => ing.includes(userItem) || userItem.includes(ing))) {
        score += 1;
      }
    });

    priorityIngredients.forEach((priorityItem) => {
      if (mealIngredients.some((ing) => ing.includes(priorityItem) || priorityItem.includes(ing))) {
        score += 3;
      }
    });

    return score;
  };

  const buildFallbackRecipes = () => {
    const names = userProducts.map((p) => normalizeFoodName(p.name));
    const priorityNames = getPriorityIngredients();

    if (names.length === 0) return [];

    const has = (word) => names.some((n) => n.includes(word));
    const hasPriority = (word) => priorityNames.some((n) => n.includes(word));

    const fallback = [];

    if (has("yumurta") && has("domates")) {
      fallback.push({
        idMeal: "fallback-1",
        strMeal: "Menemen Benzeri Tarif",
        strCategory: "Genel",
        strMealThumb: "",
        strInstructions:
          "Domatesi küçük küçük doğra. Tavada biraz pişir. Yumurtayı ekleyip karıştır. İstersen biber veya peynir ekleyebilirsin.",
        turkishTitle: "Menemen Benzeri Tarif",
        turkishCategory: "Genel",
        turkishInstructions:
          "Domatesi küçük küçük doğra. Tavada biraz pişir. Yumurtayı ekleyip karıştır. İstersen biber veya peynir ekleyebilirsin.",
        matchScore: hasPriority("domates") ? 6 : 3,
      });
    }

    if (has("makarna")) {
      fallback.push({
        idMeal: "fallback-2",
        strMeal: "Pratik Makarna",
        strCategory: "Ana Yemek",
        strMealThumb: "",
        strInstructions:
          "Makarnayı haşla. Domates, peynir veya yoğurt varsa onunla birleştirerek pratik bir yemek hazırla.",
        turkishTitle: "Pratik Makarna",
        turkishCategory: "Ana Yemek",
        turkishInstructions:
          "Makarnayı haşla. Domates, peynir veya yoğurt varsa onunla birleştirerek pratik bir yemek hazırla.",
        matchScore: hasPriority("domates") || hasPriority("peynir") ? 5 : 2,
      });
    }

    if (has("tavuk") && has("patates")) {
      fallback.push({
        idMeal: "fallback-3",
        strMeal: "Tavuklu Patates Tabağı",
        strCategory: "Ana Yemek",
        strMealThumb: "",
        strInstructions:
          "Tavuğu pişir. Patatesi fırında ya da tavada hazırla. Uygun sebze varsa yanına ekleyerek servis et.",
        turkishTitle: "Tavuklu Patates Tabağı",
        turkishCategory: "Ana Yemek",
        turkishInstructions:
          "Tavuğu pişir. Patatesi fırında ya da tavada hazırla. Uygun sebze varsa yanına ekleyerek servis et.",
        matchScore: hasPriority("tavuk") || hasPriority("patates") ? 6 : 3,
      });
    }

    if (has("yogurt") || has("yoğurt")) {
      fallback.push({
        idMeal: "fallback-4",
        strMeal: "Yoğurtlu Hafif Öğün",
        strCategory: "Hafif Öğün",
        strMealThumb: "",
        strInstructions:
          "Yoğurdu sade tüketebilir ya da yanında meyve veya uygun sebzelerle hafif bir öğün hazırlayabilirsin.",
        turkishTitle: "Yoğurtlu Hafif Öğün",
        turkishCategory: "Hafif Öğün",
        turkishInstructions:
          "Yoğurdu sade tüketebilir ya da yanında meyve veya uygun sebzelerle hafif bir öğün hazırlayabilirsin.",
        matchScore: hasPriority("yoğurt") ? 4 : 1,
      });
    }

    if (has("domates") && (has("salatalik") || has("salatalık"))) {
      fallback.push({
        idMeal: "fallback-5",
        strMeal: "Domatesli Salatalık Salatası",
        strCategory: "Salata",
        strMealThumb: "",
        strInstructions:
          "Domates ve salatalığı doğra. İstersen yoğurt veya peynir ekleyerek daha zengin hale getir.",
        turkishTitle: "Domatesli Salatalık Salatası",
        turkishCategory: "Salata",
        turkishInstructions:
          "Domates ve salatalığı doğra. İstersen yoğurt veya peynir ekleyerek daha zengin hale getir.",
        matchScore:
          (hasPriority("domates") ? 3 : 0) +
          (hasPriority("salatalik") || hasPriority("salatalık") ? 3 : 0) +
          1,
      });
    }

    if (has("peynir") && has("ekmek")) {
      fallback.push({
        idMeal: "fallback-6",
        strMeal: "Peynirli Ekmek Tabağı",
        strCategory: "Atıştırmalık",
        strMealThumb: "",
        strInstructions:
          "Peyniri ekmekle birlikte servis et. Domates, salatalık veya zeytin varsa yanına ekleyebilirsin.",
        turkishTitle: "Peynirli Ekmek Tabağı",
        turkishCategory: "Atıştırmalık",
        turkishInstructions:
          "Peyniri ekmekle birlikte servis et. Domates, salatalık veya zeytin varsa yanına ekleyebilirsin.",
        matchScore: hasPriority("peynir") ? 4 : 2,
      });
    }

    if (has("elma") || has("muz")) {
      fallback.push({
        idMeal: "fallback-7",
        strMeal: "Meyveli Yoğurt Kasesi",
        strCategory: "Atıştırmalık",
        strMealThumb: "",
        strInstructions:
          "Elma veya muz gibi meyveleri doğra. Yoğurt varsa karıştırarak hafif bir kase hazırla.",
        turkishTitle: "Meyveli Yoğurt Kasesi",
        turkishCategory: "Atıştırmalık",
        turkishInstructions:
          "Elma veya muz gibi meyveleri doğra. Yoğurt varsa karıştırarak hafif bir kase hazırla.",
        matchScore:
          (hasPriority("elma") ? 3 : 0) + (hasPriority("muz") ? 3 : 0) + 1,
      });
    }

    if (has("patates")) {
      fallback.push({
        idMeal: "fallback-8",
        strMeal: "Baharatlı Patates",
        strCategory: "Yan Yemek",
        strMealThumb: "",
        strInstructions:
          "Patatesi doğra. Tavada veya fırında pişir. Uygun baharatlarla tatlandır.",
        turkishTitle: "Baharatlı Patates",
        turkishCategory: "Yan Yemek",
        turkishInstructions:
          "Patatesi doğra. Tavada veya fırında pişir. Uygun baharatlarla tatlandır.",
        matchScore: hasPriority("patates") ? 5 : 2,
      });
    }

    if (has("yumurta")) {
      fallback.push({
        idMeal: "fallback-9",
        strMeal: "Haşlanmış Yumurta Tabağı",
        strCategory: "Pratik Öğün",
        strMealThumb: "",
        strInstructions:
          "Yumurtayı haşla. Yanına sebze veya peynir ekleyerek pratik bir tabak hazırla.",
        turkishTitle: "Haşlanmış Yumurta Tabağı",
        turkishCategory: "Pratik Öğün",
        turkishInstructions:
          "Yumurtayı haşla. Yanına sebze veya peynir ekleyerek pratik bir tabak hazırla.",
        matchScore: hasPriority("yumurta") ? 5 : 2,
      });
    }

    if (has("sut") || has("süt")) {
      fallback.push({
        idMeal: "fallback-10",
        strMeal: "Sütlü Hafif Öğün",
        strCategory: "İçecek / Hafif Öğün",
        strMealThumb: "",
        strInstructions:
          "Sütü sade içebilir veya yanında meyve ve hafif ürünlerle küçük bir ara öğün hazırlayabilirsin.",
        turkishTitle: "Sütlü Hafif Öğün",
        turkishCategory: "İçecek / Hafif Öğün",
        turkishInstructions:
          "Sütü sade içebilir veya yanında meyve ve hafif ürünlerle küçük bir ara öğün hazırlayabilirsin.",
        matchScore: hasPriority("sut") || hasPriority("süt") ? 4 : 1,
      });
    }

    if (fallback.length === 0) {
      fallback.push({
        idMeal: "fallback-11",
        strMeal: "Karışık Ev Usulü Tarif",
        strCategory: "Genel",
        strMealThumb: "",
        strInstructions: `Evindeki ürünler: ${userProducts
          .map((p) => p.name)
          .join(", ")}. Önce SKT'si yaklaşan ürünleri kullanarak salata, tava yemeği veya kahvaltılık tabak hazırlayabilirsin.`,
        turkishTitle: "Karışık Ev Usulü Tarif",
        turkishCategory: "Genel",
        turkishInstructions: `Evindeki ürünler: ${userProducts
          .map((p) => p.name)
          .join(", ")}. Önce SKT'si yaklaşan ürünleri kullanarak salata, tava yemeği veya kahvaltılık tabak hazırlayabilirsin.`,
        matchScore: 1,
      });
    }

    return fallback;
  };

  const formatTurkishRecipesByPriority = () => {
    const priorityNames = getPriorityIngredients();
    const allHomeNames = userProducts.map((product) => normalizeFoodName(product.name));

    return turkishRecipes
      .map((recipe) => {
        const recipeIngredients = Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [];

        const matchedPriorityIngredients = recipeIngredients.filter((ingredient) => {
          const normalizedIngredient = normalizeFoodName(ingredient);
          return priorityNames.some(
            (priorityItem) =>
              normalizeFoodName(priorityItem).includes(normalizedIngredient) ||
              normalizedIngredient.includes(normalizeFoodName(priorityItem))
          );
        });

        const matchedHomeIngredients = recipeIngredients.filter((ingredient) => {
          const normalizedIngredient = normalizeFoodName(ingredient);
          return allHomeNames.some(
            (homeItem) =>
              homeItem.includes(normalizedIngredient) ||
              normalizedIngredient.includes(homeItem)
          );
        });

        const missingIngredients = recipeIngredients.filter(
          (ingredient) => !matchedHomeIngredients.includes(ingredient)
        );

        return {
          idMeal: `turkish-${recipe.id}`,
          strMeal: recipe.name,
          strCategory: "Türk Mutfağı",
          strArea: "Türk",
          strMealThumb: recipe.image || "",
          strInstructions: recipe.instructions,
          turkishTitle: recipe.name,
          turkishCategory: "Türk Mutfağı",
          turkishArea: "Türk",
          turkishInstructions: recipe.instructions,
          ingredients: recipeIngredients,
          priorityIngredients: matchedPriorityIngredients,
          homeIngredients: matchedHomeIngredients,
          missingIngredients,
          sourceType: "Türk Tarif Verisi",
          matchScore:
            matchedPriorityIngredients.length * 20 +
            matchedHomeIngredients.length * 5,
        };
      })
      .filter((recipe) => recipe.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const fetchRecipesFromAPI = async () => {
    const ingredients = getTranslatedIngredients();

    if (userProducts.length === 0) {
      setApiRecipes([]);
      setRecipeError("");
      return;
    }

    try {
      setRecipeLoading(true);
      setRecipeError("");

      const turkishFormatted = formatTurkishRecipesByPriority();
      let apiFormatted = [];

      if (ingredients.length > 0) {
        const candidateIngredients = ingredients.slice(0, 5);
        const collectedMeals = new Map();

        for (const ingredient of candidateIngredients) {
          const listRes = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
              ingredient
            )}`
          );
          const listData = await listRes.json();

          if (listData?.meals) {
            listData.meals.forEach((meal) => {
              if (!collectedMeals.has(meal.idMeal)) {
                collectedMeals.set(meal.idMeal, meal);
              }
            });
          }
        }

        const mealList = Array.from(collectedMeals.values()).slice(0, 20);

        if (mealList.length > 0) {
          const detailPromises = mealList.map((meal) =>
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
              .then((res) => res.json())
              .then((data) => data.meals?.[0])
          );

          const detailedMeals = (await Promise.all(detailPromises)).filter(Boolean);

          const userIngredientNames = getTranslatedIngredients();
          const priorityIngredients = getPriorityIngredients();

          apiFormatted = detailedMeals
            .map((meal) => {
              const scoredMeal = {
                ...meal,
                matchScore: scoreRecipeMatch(
                  meal,
                  userIngredientNames,
                  priorityIngredients
                ),
                sourceType: "API Tarifi",
              };
              return mapMealToTurkishDisplay(scoredMeal);
            })
            .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
      }

      const fallbackRecipes = buildFallbackRecipes().map((recipe) => ({
        ...recipe,
        sourceType: "Yerel Akıllı Öneri",
      }));

      const combinedRecipes = [
        ...turkishFormatted,
        ...apiFormatted,
        ...fallbackRecipes,
      ]
        .filter((recipe, index, self) => {
          const id = recipe.idMeal || recipe.strMeal;
          return self.findIndex((item) => (item.idMeal || item.strMeal) === id) === index;
        })
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      if (combinedRecipes.length > 0) {
        setApiRecipes(combinedRecipes);
        setCurrentRecipeIndex(0);
        setRecipeError("");
      } else {
        setApiRecipes([]);
        setRecipeError("Evdeki ürünlere göre uygun tarif bulunamadı.");
      }
    } catch (err) {
      const turkishFormatted = formatTurkishRecipesByPriority();
      const fallbackRecipes = buildFallbackRecipes().map((recipe) => ({
        ...recipe,
        sourceType: "Yerel Akıllı Öneri",
      }));

      const combinedFallback = [...turkishFormatted, ...fallbackRecipes].sort(
        (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
      );

      if (combinedFallback.length > 0) {
        setApiRecipes(combinedFallback);
        setCurrentRecipeIndex(0);
        setRecipeError("");
      } else {
        setApiRecipes([]);
        setRecipeError("Tarifler alınırken hata oluştu.");
      }
    } finally {
      setRecipeLoading(false);
    }
  };

  const recipeSourceKey = useMemo(
    () => userProducts.map((p) => normalizeFoodName(p.name)).join("|"),
    [userProducts]
  );

  useEffect(() => {
    if (userProducts.length > 0) {
      fetchRecipesFromAPI();
    } else {
      setApiRecipes([]);
      setRecipeError("");
    }
  }, [recipeSourceKey]);

const handleChangeRecipe = () => {
  if (apiRecipes.length === 0) return;

  setCurrentRecipeIndex((prev) => {
    const nextIndex = prev + 1;
    return nextIndex >= apiRecipes.length ? 0 : nextIndex;
  });
};

  const addScannedProductToHome = () => {
    if (!productResult) return;

    if (!scannedProductAmount.trim()) {
      alert("Lütfen miktar gir.");
      return;
    }

    const finalExpiryDate = scannedProductExpiry || "";

    const isManualExpiry = Boolean(scannedProductExpiry);

    const finalEstimatedShelf =
      calculateEstimatedShelfLife(productResult.name, "normal", "buzdolabı") ||
      "Tahmini SKT hesaplanamadı";

    const newProduct = {
      id: Date.now(),
      barcode: productResult.barcode || Date.now().toString(),
      name: productResult.name || "İsimsiz Ürün",
      amount: scannedProductAmount.trim(),
      expiryDate: finalExpiryDate,
      estimatedShelf: finalEstimatedShelf,
      freshness: "normal",
      storage: "buzdolabı",
      brand: productResult.brand || "",
      image: productResult.image || "",
      isManualExpiry,
    };

    setUserProducts((prev) => [...prev, newProduct]);

   

    setScannedProductAmount("");
    setScannedProductExpiry("");
    alert("Ürün evdeki ürünlere eklendi.");
  };

  const addUserProduct = () => {
    if (!newProductName.trim() || !newProductAmount.trim()) {
      alert("Lütfen ürün adı ve miktar gir.");
      return;
    }

    const finalExpiryDate = newProductExpiry || "";

    const isManualExpiry = Boolean(newProductExpiry);

    const finalEstimatedShelf =
      calculateEstimatedShelfLife(newProductName, productFreshness, storageType) ||
      "Tahmini SKT hesaplanamadı";

    const newProduct = {
      id: Date.now(),
      name: newProductName.trim(),
      amount: newProductAmount.trim(),
      expiryDate: finalExpiryDate,
      estimatedShelf: finalEstimatedShelf,
      freshness: productFreshness,
      storage: storageType,
      isManualExpiry,
    };

    setUserProducts((prev) => [...prev, newProduct]);
    setNewProductName("");
    setNewProductAmount("");
    setNewProductExpiry("");
    setProductFreshness("taze");
    setStorageType("buzdolabı");
    setEstimatedShelfText("");
  };

  const deleteUserProduct = (id) => {
    setUserProducts((prev) => prev.filter((product) => product.id !== id));
    setDismissedCartIds((prev) => prev.filter((itemId) => itemId !== id));
  };
const addProductToShoppingCart = (product, actionType) => {
  const expiryInfo = getExpiryInfo(product.expiryDate);

  const cartProduct = {
    ...product,
    cartAction: actionType,
    cartActionText:
      actionType === "consumed"
        ? "Tüketildiği için alışveriş listesine eklendi"
        : "Çöpe atıldığı için tekrar alınacaklara eklendi",
    addedToCartAt: new Date().toISOString(),
    expiryInfo,
  };

  setShoppingCartItems((prev) => {
    const alreadyExists = prev.some((item) => item.id === product.id);
    if (alreadyExists) {
      return prev.map((item) =>
        item.id === product.id ? { ...item, ...cartProduct } : item
      );
    }
    return [cartProduct, ...prev];
  });

  setDismissedCartIds((prev) => prev.filter((itemId) => itemId !== product.id));
};

const markProductAsWasted = (product) => {
  const isConfirmed = window.confirm(
    `${product.name} ürününü çöpe atıldı olarak işaretlemek istiyor musun?`
  );

  if (!isConfirmed) return;

  const newWasteRecord = {
    id: Date.now(),
    productName: product.name,
    amount: product.amount || "Belirtilmedi",
    expiryDate: product.expiryDate || "",
    wastedAt: new Date().toISOString(),
  };

  addProductToShoppingCart(product, "wasted");
  setWasteRecords((prev) => [newWasteRecord, ...prev]);
  setUserProducts((prev) => prev.filter((item) => item.id !== product.id));
};

const markProductAsConsumed = (product) => {
  const isConfirmed = window.confirm(
    `${product.name} ürününü tüketildi olarak listeden kaldırmak istiyor musun?`
  );

  if (!isConfirmed) return;

  addProductToShoppingCart(product, "consumed");
  setUserProducts((prev) => prev.filter((item) => item.id !== product.id));
};

const deleteWasteRecord = (id) => {
  setWasteRecords((prev) => prev.filter((item) => item.id !== id));
};

const clearWasteRecords = () => {
  const isConfirmed = window.confirm("Tüm israf kayıtları silinsin mi?");
  if (!isConfirmed) return;

  setWasteRecords([]);
};
  const removeFromShoppingCart = (id) => {
    setDismissedCartIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );

    setShoppingCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearShoppingCart = () => {
    const idsToHide = expiringProducts.map((product) => product.id);
    setDismissedCartIds((prev) => [...new Set([...prev, ...idsToHide])]);
    setShoppingCartItems([]);
  };

  const updateUserProductExpiry = (id, newDate) => {
    setUserProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, expiryDate: newDate, isManualExpiry: Boolean(newDate) }
          : product
      )
    );
  };

  const addProductsFromReceipt = (products) => {
    if (!products || products.length === 0) return;

    const enrichedProducts = products.map((product, index) => {
      const finalExpiryDate = product.expiryDate || "";

      const isManualExpiry = Boolean(product.expiryDate);

      const finalEstimatedShelf =
        calculateEstimatedShelfLife(product.name, "normal", "buzdolabı") ||
        "Tahmini SKT hesaplanamadı";

      return {
        id: Date.now() + index,
        name: product.name,
        amount: product.amount || "1 adet",
        expiryDate: finalExpiryDate,
        estimatedShelf: finalEstimatedShelf,
        freshness: "normal",
        storage: "buzdolabı",
        isManualExpiry,
      };
    });

    setUserProducts((prev) => [...prev, ...enrichedProducts]);
  };

  const expiringProducts = useMemo(() => {
    return userProducts
      .map((product) => {
        const expiryInfo = getExpiryInfo(product.expiryDate);
        return { ...product, expiryInfo };
      })
      .filter(
        (product) =>
          !dismissedCartIds.includes(product.id) &&
          (product.expiryInfo.status === "Acil tüket" ||
            product.expiryInfo.status === "Yaklaşıyor" ||
            product.expiryInfo.status === "Geçti")
      );
  }, [userProducts, dismissedCartIds]);

  const shoppingCartProducts = useMemo(() => {
    const manualItems = shoppingCartItems.map((item) => ({
      ...item,
      expiryInfo: item.expiryInfo || getExpiryInfo(item.expiryDate),
    }));

    const manualIds = new Set(manualItems.map((item) => item.id));
    const automaticItems = expiringProducts.filter(
      (product) => !manualIds.has(product.id)
    );

    return [...manualItems, ...automaticItems];
  }, [shoppingCartItems, expiringProducts]);

const wasteStats = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const expiredProducts = userProducts.filter((product) => {
    if (!product.expiryDate) return false;

    const expiry = new Date(product.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  });

  const criticalProducts = userProducts.filter((product) => {
    if (!product.expiryDate) return false;

    const expiry = new Date(product.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24)
    );

    return diffDays >= 0 && diffDays <= 3;
  });

  const thisWeekWaste = wasteRecords.filter((record) => {
    const wastedDate = new Date(record.wastedAt);
    return wastedDate >= weekAgo;
  });

  return {
    totalWaste: wasteRecords.length,
    thisWeekWaste: thisWeekWaste.length,
    expiredCount: expiredProducts.length,
    criticalCount: criticalProducts.length,
  };
}, [userProducts, wasteRecords]);
  const riskAnalysis = useMemo(() => {
    if (selectedDiseasesLower.includes("diyabet")) {
      return {
        level: "Orta",
        text: "Şekerli ve yüksek karbonhidratlı gıdalara dikkat edilmeli. Düşük glisemik indeksli besinler önerilir.",
      };
    }

    if (selectedDiseasesLower.includes("tansiyon")) {
      return {
        level: "Orta",
        text: "Tuz tüketimi kontrol edilmeli. Paketli ve fazla sodyum içeren ürünlerden kaçınılmalı.",
      };
    }

    if (selectedDiseasesLower.includes("kolesterol")) {
      return {
        level: "Dikkat",
        text: "Yağ oranı yüksek ve işlenmiş gıdalar azaltılmalı. Lifli gıdalar artırılmalı.",
      };
    }

    return {
      level: "Düşük",
      text: "Belirgin bir sağlık riski görünmüyor. Dengeli beslenme ve düzenli takip önerilir.",
    };
  }, [selectedDiseasesLower]);

  const normalizeBarcode = (value) => {
    return String(value || "").replace(/\D/g, "").trim();
  };

  const fetchProductByBarcode = async (barcodeValue) => {
    const cleanBarcode = normalizeBarcode(barcodeValue);

    if (!cleanBarcode) {
      setProductError("Lütfen geçerli barkod gir.");
      setProductResult(null);
      return;
    }

    try {
      setProductLoading(true);
      setProductError("");
      setProductResult(null);

      if (localProducts[cleanBarcode]) {
        setProductResult(localProducts[cleanBarcode]);
        return;
      }

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`
      );

      if (!response.ok) {
        throw new Error("Ürün servisine ulaşılamadı.");
      }

      const data = await response.json();

      if (!data || data.status !== 1 || !data.product) {
        setProductError(
          "Ürün veritabanında bulunamadı. Yerel kayıt yoksa manuel ekleme gerekebilir."
        );
        setProductResult({
          barcode: cleanBarcode,
          name: "Ürün bulunamadı",
          brand: "-",
          ingredients: "İçerik bilgisi yok",
          allergens: "Alerjen bilgisi yok",
          nutriscore: "-",
          image: "",
          energy: "-",
          sugar: "-",
          fat: "-",
          salt: "-",
        });
        return;
      }

      const product = data.product;

      setProductResult({
        barcode: cleanBarcode,
        name: product.product_name || "İsim bulunamadı",
        brand: product.brands || "Marka bilgisi yok",
        ingredients: product.ingredients_text || "İçerik bilgisi bulunamadı",
        allergens: product.allergens || "Alerjen bilgisi bulunamadı",
        nutriscore: product.nutriscore_grade || "Yok",
        image: product.image_url || "",
        energy:
          product.nutriments?.["energy-kcal_100g"] ??
          product.nutriments?.energy_kcal_100g ??
          "-",
        sugar: product.nutriments?.sugars_100g ?? "-",
        fat: product.nutriments?.fat_100g ?? "-",
        salt: product.nutriments?.salt_100g ?? "-",
      });
    } catch (error) {
      setProductError(error.message || "Ürün alınırken hata oluştu.");
      setProductResult({
        barcode: cleanBarcode,
        name: "Ürün bilgisi alınamadı",
        brand: "-",
        ingredients: "İçerik bilgisi yok",
        allergens: "Alerjen bilgisi yok",
        nutriscore: "-",
        image: "",
        energy: "-",
        sugar: "-",
        fat: "-",
        salt: "-",
      });
    } finally {
      setProductLoading(false);
    }
  };

  const handleManualSearch = () => {
    fetchProductByBarcode(barcodeInput);
  };

 const currentRecipe =
  apiRecipes.length > 0
    ? apiRecipes[currentRecipeIndex % apiRecipes.length]
    : null;

  if (!selectedUser) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div className="dashboard-hero__left">
            <p className="dashboard-badge">AKILLI BESLENME PANELİ</p>
            <h1 className="dashboard-title">Henüz kullanıcı seçilmedi</h1>
            <p className="dashboard-subtitle">
              Yukarıdaki Kullanıcılar menüsünden bir kişi seç veya yeni kullanıcı ekle.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-theme-banner">
        <h2>🥦 Akıllı Mutfak Paneli</h2>
        <p>
          Ürünlerini kolayca ekle, barkodla analiz et, son tüketim tarihi yaklaşan
          ürünlerini öne çıkar ve sana uygun tarifleri düzenli bir panelde takip et.  <br></br> 
          <strong>Bu uygulama tıbbi tanı koymaz;kronik rahatsızlığı olan kullanıcıların doktor veya diyetisyen görüşünü esas alması önerilir.</strong>
        </p>
      </div>

      <div className="dashboard-main-layout">
        <aside className="dashboard-sidebar">
         

          <div className="dashboard-soft-card">
            <h3 className="dashboard-section-title">Ürün Ekle</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "12px",
              }}
            >
              <input
                className="profile-input"
                type="text"
                placeholder="Ürün adı"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />

              <input
                className="profile-input"
                type="text"
                placeholder="Miktar"
                value={newProductAmount}
                onChange={(e) => setNewProductAmount(e.target.value)}
              />

              <input
                className="profile-input"
                type="date"
                value={newProductExpiry}
                onChange={(e) => setNewProductExpiry(e.target.value)}
              />

              <select
                className="profile-input"
                value={productFreshness}
                onChange={(e) => setProductFreshness(e.target.value)}
              >
                <option value="taze">Taze</option>
                <option value="normal">Normal</option>
                <option value="yumuşamış">Yumuşamış</option>
              </select>

              <select
                className="profile-input"
                value={storageType}
                onChange={(e) => setStorageType(e.target.value)}
              >
                <option value="buzdolabı">Buzdolabı</option>
                <option value="oda sıcaklığı">Oda sıcaklığı</option>
                <option value="hava almayan kap">Hava almayan kap</option>
              </select>
            </div>

            {estimatedShelfText && (
              <p style={{ marginTop: "10px", fontWeight: "600", color: "#b45309" }}>
                {estimatedShelfText} ⚠️
              </p>
            )}

            <button className="profile-save-btn" type="button" onClick={addUserProduct}>
              Ürün Ekle
            </button>
          </div>
        </aside>

        <section className="dashboard-center">
          <div className="dashboard-big-card">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title" style={{ margin: 0 }}>
                Kamera ile Fiş Okuma
              </h3>
              <span className="dashboard-section-badge">📷 Akıllı Tarama</span>
            </div>

            <ReceiptCameraScanner onAddProducts={addProductsFromReceipt} />
          </div>

          <div className="dashboard-big-card">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title" style={{ margin: 0 }}>
                Barkod ile Ürün Analizi
              </h3>
              <span className="dashboard-section-badge">🧃 Ürün Bilgisi</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <input
                className="profile-input"
                type="text"
                placeholder="Barkodu manuel gir"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{ minWidth: "260px" }}
              />
              <button className="profile-save-btn" type="button" onClick={handleManualSearch}>
                Barkodu Sorgula
              </button>
            </div>
<BarcodeScanner
  onDetected={(barcode) => {
    setBarcodeInput(barcode);
    fetchProductByBarcode(barcode);
  }}
/>

            {productLoading && <p>Ürün bilgisi getiriliyor...</p>}
            {productError && <p style={{ color: "#c62828" }}>{productError}</p>}

            {productResult &&
              (() => {
               const riskResult = evaluateProductRisk(
  productResult,
  selectedDiseasesLower,
  selectedAllergiesLower
);

                const nutriInfo = getNutriScoreInfo(productResult.nutriscore);

                return (
                  <div className="dashboard-product-card" style={{ marginTop: "10px" }}>
                    <h4>{productResult.name}</h4>
                    <p><strong>Marka:</strong> {productResult.brand}</p>
                    <p><strong>Barkod:</strong> {productResult.barcode}</p>
                    <p><strong>İçindekiler:</strong> {productResult.ingredients}</p>
                    <p><strong>Alerjen:</strong> {productResult.allergens}</p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "6px",
                      }}
                    >
                      <strong>Nutri-Score:</strong>

                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: nutriInfo.color,
                          display: "inline-block",
                          borderRadius: "4px",
                        }}
                      ></span>

                      <span>
                        {String(productResult.nutriscore || "-").toUpperCase()} - {nutriInfo.label}
                      </span>
                    </div>

                    <p><strong>100 g enerji:</strong> {productResult.energy} kcal</p>
                    <p><strong>Şeker:</strong> {productResult.sugar} g</p>
                    <p><strong>Yağ:</strong> {productResult.fat} g</p>
                    <p><strong>Tuz:</strong> {productResult.salt} g</p>

                    <div
                      style={{
                        marginTop: "14px",
                        padding: "12px",
                        borderRadius: "12px",
                        background:
                          riskResult.overall === "Riskli"
                            ? "#ffe5e5"
                            : riskResult.overall === "Dikkat"
                            ? "#fff4e5"
                            : "#e8f5ec",
                        border: "1px solid #ddd",
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        <strong>Risk Durumu: {riskResult.overall}</strong>
                      </p>
                      <p style={{ margin: "6px 0 0 0" }}>Puan: {riskResult.score}</p>

                      {riskResult.reasons.length > 0 && (
                        <ul style={{ marginTop: "8px" }}>
                          {riskResult.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        padding: "12px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h5 style={{ marginBottom: "10px" }}>Evdeki Ürünlere Ekle</h5>

                      <input
                        className="profile-input"
                        type="text"
                        placeholder="Miktar (örn: 1 adet)"
                        value={scannedProductAmount}
                        onChange={(e) => setScannedProductAmount(e.target.value)}
                      />

                      <input
                        className="profile-input"
                        type="date"
                        value={scannedProductExpiry}
                        onChange={(e) => setScannedProductExpiry(e.target.value)}
                        style={{ marginTop: "6px" }}
                      />

                      <button
                        className="profile-save-btn"
                        type="button"
                        onClick={addScannedProductToHome}
                        style={{ marginTop: "10px" }}
                      >
                        Evdeki Ürünlere Ekle
                      </button>
                    </div>

                    {productResult.image && (
                      <img
                        src={productResult.image}
                        alt={productResult.name}
                        style={{
                          width: "160px",
                          marginTop: "14px",
                          borderRadius: "14px",
                          border: "1px solid #e7edf4",
                        }}
                      />
                    )}
                  </div>
                );
              })()}
          </div>

       <div className="dashboard-big-card">
  <div className="dashboard-section-header">
    <h3 className="dashboard-section-title" style={{ margin: 0 }}>
      Evdeki Ürünler
    </h3>
   
    <span className="dashboard-section-badge">🥕 Dolap Listesi</span>
  </div>

  {userProducts.length === 0 ? (
    <p className="empty-product-text">
      Henüz ürün eklenmedi. Ürün ekleyerek dolap listenizi oluşturabilirsiniz.
    </p>
  ) : (
    <>
      <div className="product-chip-list">
        {userProducts.map((product) => {
          const isActive = activeProductId === product.id;
          const expiryInfo = getExpiryInfo(product.expiryDate);

          return (
            <button
              key={product.id}
              type="button"
              className={`product-chip ${isActive ? "product-chip--active" : ""}`}
              onClick={() =>
                setActiveProductId(isActive ? null : product.id)
              }
            >
              <span className="product-chip__emoji">🥦</span>
              <span className="product-chip__name">{product.name}</span>
              <span
                className={`product-chip__status product-chip__status--${expiryInfo.status
                  .toLowerCase()
                  .replaceAll(" ", "-")
                  .replace("ı", "i")
                  .replace("ğ", "g")
                  .replace("ü", "u")
                  .replace("ş", "s")
                  .replace("ö", "o")
                  .replace("ç", "c")}`}
              >
                {expiryInfo.status}
              </span>
            </button>
          );
        })}
      </div>

      {userProducts.map((product) => {
        if (activeProductId !== product.id) return null;

        const expiryInfo = getExpiryInfo(product.expiryDate);

        return (
          <div key={product.id} className="product-detail-panel">
            <div className="product-detail-header">
              <div>
                <p className="product-detail-label">Seçili Ürün</p>
                <h4>{product.name}</h4>
              </div>

              <button
                type="button"
                className="product-detail-close"
                onClick={() => setActiveProductId(null)}
              >
                Kapat
              </button>
            </div>

            <div className="product-detail-grid">
              <div className="product-info-box">
                <span>Miktar</span>
                <strong>{product.amount || "Belirtilmedi"}</strong>
              </div>

              <div className="product-info-box">
                <span>Kalan Süre</span>
                <strong>{expiryInfo.text}</strong>
              </div>

              <div className="product-info-box">
                <span>Durum</span>
                <strong>{expiryInfo.status}</strong>
              </div>

              {!product.isManualExpiry && (
                <div className="product-info-box">
                  <span>Tahmini SKT</span>
                  <strong>{product.estimatedShelf || "Hesaplanmadı"}</strong>
                </div>
              )}
            </div>

            <div className="product-date-edit">
              <label>Son Tüketim Tarihi</label>
              <input
                className="profile-input"
                type="date"
                value={product.expiryDate || ""}
                onChange={(e) =>
                  updateUserProductExpiry(product.id, e.target.value)
                }
              />
            </div>

            <div className="waste-action-row product-detail-actions">
              <button
                type="button"
                onClick={() => markProductAsConsumed(product)}
                className="consume-btn"
              >
                Tükettim
              </button>

              <button
                type="button"
                onClick={() => markProductAsWasted(product)}
                className="waste-btn"
              >
                Çöpe Atıldı
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteUserProduct(product.id);
                  setActiveProductId(null);
                }}
                className="delete-product-btn"
              >
                Sil
              </button>
            </div>
          </div>
        );
      })}
    </>
  )}
</div>

          <div className="dashboard-big-card dashboard-bottom-recipe">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title" style={{ margin: 0 }}>
                Akıllı Tarifler
              </h3>
              <span className="dashboard-section-badge">🍽️ SKT Öncelikli Tarif</span>
            </div>

            {recipeLoading && <p>Tarifler yükleniyor...</p>}
            {recipeError && <p style={{ color: "red" }}>{recipeError}</p>}

            {!recipeLoading && currentRecipe && (
              <div className="dashboard-recipe-card">
                <h4>
                  {currentRecipe.turkishTitle ||
                    currentRecipe.strMeal ||
                    currentRecipe.name ||
                    "Tarif"}
                </h4>

                {currentRecipe.strMealThumb ? (
                  <img
                    src={currentRecipe.strMealThumb}
                    alt={currentRecipe.turkishTitle || currentRecipe.strMeal || "Tarif"}
                    style={{
                      width: "220px",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "220px",
                      minHeight: "120px",
                      borderRadius: "12px",
                      marginBottom: "12px",
                      background: "linear-gradient(135deg, #dcfce7, #f8fafc)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "42px",
                      border: "1px solid #d9f4df",
                    }}
                  >
                    🍽️
                  </div>
                )}

                <p>
                  <strong>Kaynak:</strong>{" "}
                  {currentRecipe.sourceType ||
                    (currentRecipe.idMeal?.startsWith("turkish-")
                      ? "Türk Tarif Verisi"
                      : "API Tarifi")}
                </p>

                <p>
                  <strong>Kategori:</strong>{" "}
                  {currentRecipe.turkishCategory ||
                    currentRecipe.strCategory ||
                    "Genel"}
                </p>

                <p>
                  <strong>Mutfak:</strong>{" "}
                  {currentRecipe.turkishArea ||
                    currentRecipe.strArea ||
                    "Türk / Karışık"}
                </p>

                {currentRecipe.priorityIngredients &&
                  currentRecipe.priorityIngredients.length > 0 && (
                    <p style={{ color: "#c2410c", fontWeight: "700" }}>
                      <strong>Öncelikli kullanılacak SKT ürünü:</strong>{" "}
                      {currentRecipe.priorityIngredients.join(", ")}
                    </p>
                  )}

                {currentRecipe.homeIngredients &&
                  currentRecipe.homeIngredients.length > 0 && (
                    <p>
                      <strong>Evde bulunan eşleşen ürünler:</strong>{" "}
                      {currentRecipe.homeIngredients.join(", ")}
                    </p>
                  )}

                {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 && (
                  <p>
                    <strong>Tarifte geçen malzemeler:</strong>{" "}
                    {currentRecipe.ingredients.join(", ")}
                  </p>
                )}

                {currentRecipe.missingIngredients &&
                  currentRecipe.missingIngredients.length > 0 && (
                    <p style={{ color: "#64748b" }}>
                      <strong>Eksik olabilecek malzemeler:</strong>{" "}
                      {currentRecipe.missingIngredients.join(", ")}
                    </p>
                  )}

                <p>
                  <strong>Uyumluluk Puanı:</strong>{" "}
                  {currentRecipe.matchScore || 1}
                </p>

                <p>
                  <strong>Tarif:</strong>{" "}
                  {currentRecipe.turkishInstructions ||
                    currentRecipe.strInstructions ||
                    currentRecipe.instructions ||
                    "Tarif bulunamadı"}
                </p>
                {currentRecipe && evaluateRecipeRisk(currentRecipe).length > 0 && (
  <div
    style={{
      marginTop: "12px",
      padding: "12px",
      borderRadius: "12px",
      background: "#ffe5e5",
      border: "1px solid #fca5a5",
      color: "#991b1b",
      fontWeight: "700",
    }}
  >
    {evaluateRecipeRisk(currentRecipe).map((warning, index) => (
      <p key={index} style={{ margin: "4px 0" }}>
        ⚠️ {warning}
      </p>
    ))}
  </div>
)}

                <button
                  className="profile-save-btn"
                  type="button"
                  onClick={handleChangeRecipe}
                  style={{ marginTop: "12px" }}
                >
                  Tarifi Değiştir
                </button>
              </div>
            )}

            {!recipeLoading && !currentRecipe && !recipeError && (
              <p>
                Tarif görmek için önce evdeki ürünler kısmına ürün eklemelisin.
                Sistem, SKT’si yaklaşan ürünleri öncelikli kullanır.
              </p>
            )}
          </div>

        </section>

        <aside className="dashboard-rightbar">
          <div className="dashboard-soft-card waste-panel">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title" style={{ margin: 0 }}>
                ♻️ Gıda İsrafı
              </h3>

              {wasteRecords.length > 0 && (
                <button
                  type="button"
                  onClick={clearWasteRecords}
                  className="clear-waste-btn"
                >
                  Temizle
                </button>
              )}
            </div>

            <div className="waste-stats-grid">
              <div className="waste-stat-card">
                <span>Toplam İsraf</span>
                <strong>{wasteStats.totalWaste}</strong>
              </div>

              <div className="waste-stat-card">
                <span>Bu Hafta</span>
                <strong>{wasteStats.thisWeekWaste}</strong>
              </div>

              <div className="waste-stat-card">
                <span>SKT Geçen</span>
                <strong>{wasteStats.expiredCount}</strong>
              </div>

              <div className="waste-stat-card">
                <span>3 Gün Altı</span>
                <strong>{wasteStats.criticalCount}</strong>
              </div>
            </div>

            <div className="waste-advice-box">
              {wasteStats.expiredCount > 0 ? (
                <p>
                  ⚠️ {wasteStats.expiredCount} ürünün SKT’si geçmiş. Kontrol edip
                  uygunsa hemen değerlendirmelisin.
                </p>
              ) : wasteStats.criticalCount > 0 ? (
                <p>
                  ⏳ {wasteStats.criticalCount} ürünün yakında bozulabilir. Tariflerde
                  öncelik ver.
                </p>
              ) : (
                <p>✅ Şu anda israf riski düşük görünüyor.</p>
              )}
            </div>

            {wasteRecords.length > 0 && (
              <div className="waste-record-list">
                {wasteRecords.slice(0, 4).map((record) => (
                  <div key={record.id} className="waste-record-item">
                    <div>
                      <strong>{record.productName}</strong>
                      <p>{record.amount}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteWasteRecord(record.id)}
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-soft-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <h3 className="dashboard-section-title" style={{ margin: 0 }}>
                Alışveriş Sepeti
              </h3>

              {shoppingCartProducts.length > 0 && (
                <button
                  type="button"
                  onClick={clearShoppingCart}
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    padding: "7px 10px",
                    cursor: "pointer",
                    background: "#f1f5f9",
                    color: "#334155",
                    fontWeight: "700",
                    fontSize: "12px",
                  }}
                >
                  Tümünü Temizle
                </button>
              )}
            </div>

            {shoppingCartProducts.length === 0 ? (
              <p>Sepete eklenecek ürün yok.</p>
            ) : (
              <div className="dashboard-cart-list">
                {shoppingCartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="dashboard-cart-item"
                    style={{ position: "relative", paddingRight: "58px" }}
                  >
                    <h4>{product.name}</h4>
                    <p>Miktar: {product.amount}</p>
                    <p>SKT: {product.expiryDate || "-"}</p>
                    <p>Kalan Süre: {product.expiryInfo?.text || "-"}</p>

                    {product.cartActionText && (
                      <p
                        style={{
                          marginTop: "6px",
                          color: product.cartAction === "wasted" ? "#c2410c" : "#166534",
                          fontWeight: "700",
                          fontSize: "12px",
                        }}
                      >
                        {product.cartActionText}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFromShoppingCart(product.id)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        background: "#ffe5e5",
                        color: "#b42318",
                        fontWeight: "700",
                        fontSize: "12px",
                      }}
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Dashboard;