import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Navbar({
  familyMembers = [],
  selectedUserId,
  setSelectedUserId,
  addFamilyMember,
  deleteFamilyMember,
  updateMemberField,
  userProducts,
  setFamilyMembers,
  setCurrentLoggedInUserId,
  setHomeProducts,
}) {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isFormPage =
    location.pathname === "/login" || location.pathname === "/register";

  const navigate = useNavigate();

  const [showUsersMenu, setShowUsersMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  const [newName, setNewName] = useState("");
  const [newDisease, setNewDisease] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  const [editingField, setEditingField] = useState(null);
  const [editAgeValue, setEditAgeValue] = useState("");
  const [editWeightValue, setEditWeightValue] = useState("");

  const selectedUser =
    familyMembers.find((member) => member.id === selectedUserId) || null;

  const selectedDiseases = Array.isArray(selectedUser?.disease)
    ? selectedUser.disease
    : [];

  const selectedAllergies = Array.isArray(selectedUser?.allergies)
    ? selectedUser.allergies
    : [];

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setSelectedUserId(null);

      if (setCurrentLoggedInUserId) {
        setCurrentLoggedInUserId(null);
      }

      if (setFamilyMembers) {
        setFamilyMembers([]);
      }

      if (setHomeProducts) {
        setHomeProducts([]);
      }

      setShowUsersMenu(false);
      setShowNotifications(false);

      navigate("/");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
      alert("Çıkış yapılırken hata oluştu.");
    }
  };

  const handleAddMember = () => {
    if (!newName.trim()) return;

    addFamilyMember({
      name: newName,
      age: "",
      weight: "",
      disease: [],
      allergies: [],
    });

    setNewName("");
    setShowUsersMenu(false);
  };

  const startEditAge = () => {
    if (!selectedUser) return;
    setEditAgeValue(selectedUser.age || "");
    setEditingField("age");
  };

  const saveAge = () => {
    if (!selectedUser) return;
    updateMemberField(selectedUser.id, "age", editAgeValue);
    setEditingField(null);
  };

  const startEditWeight = () => {
    if (!selectedUser) return;
    setEditWeightValue(selectedUser.weight || "");
    setEditingField("weight");
  };

  const saveWeight = () => {
    if (!selectedUser) return;
    updateMemberField(selectedUser.id, "weight", editWeightValue);
    setEditingField(null);
  };

  const handleAddDisease = () => {
    if (!selectedUser || !newDisease.trim()) return;

    const trimmed = newDisease.trim();
    if (selectedDiseases.includes(trimmed)) {
      setNewDisease("");
      return;
    }

    updateMemberField(selectedUser.id, "disease", [...selectedDiseases, trimmed]);
    setNewDisease("");
  };

  const handleRemoveDisease = (diseaseToRemove) => {
    if (!selectedUser) return;

    updateMemberField(
      selectedUser.id,
      "disease",
      selectedDiseases.filter((item) => item !== diseaseToRemove)
    );
  };

  const handleAddAllergy = () => {
    if (!selectedUser || !newAllergy.trim()) return;

    const trimmed = newAllergy.trim();
    if (selectedAllergies.includes(trimmed)) {
      setNewAllergy("");
      return;
    }

    updateMemberField(selectedUser.id, "allergies", [
      ...selectedAllergies,
      trimmed,
    ]);
    setNewAllergy("");
  };

  const handleRemoveAllergy = (allergyToRemove) => {
    if (!selectedUser) return;

    updateMemberField(
      selectedUser.id,
      "allergies",
      selectedAllergies.filter((item) => item !== allergyToRemove)
    );
  };

  const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getExpiryInfo = (dateValue) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = normalizeDate(dateValue);
    if (!expiry) return null;

    const diffDays = Math.round(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return {
        status: "Geçti",
        text: "SKT geçti",
        priority: 3,
      };
    }

    if (diffDays === 0) {
      return {
        status: "Bugün son gün",
        text: "Bugün son gün",
        priority: 3,
      };
    }

    if (diffDays <= 3) {
      return {
        status: "Yaklaşıyor",
        text: `${diffDays} gün kaldı`,
        priority: 2,
      };
    }

    return null;
  };

  const effectiveProducts = useMemo(() => {
    const propHasExpiry =
      Array.isArray(userProducts) &&
      userProducts.some((item) => item?.expiryDate);

    if (propHasExpiry) return userProducts;

    try {
      const saved = localStorage.getItem("userProducts");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [userProducts]);

  const notifications = useMemo(() => {
    return effectiveProducts
      .map((product) => {
        const expiry = getExpiryInfo(product.expiryDate);
        if (!expiry) return null;

        return {
          id:
            product.id ||
            product.barcode ||
            `${product.name}-${product.expiryDate}`,
          name: product.name || "Ürün",
          status: expiry.status,
          text:
            expiry.status === "Geçti"
              ? `${product.name} ürününün SKT'si geçti.`
              : expiry.status === "Bugün son gün"
              ? `${product.name} için bugün son gün.`
              : `${product.name} ürününün SKT'si yaklaşıyor.`,
          recipe:
            expiry.status === "Geçti"
              ? `${product.name} için ürünü kontrol et, uygunsa hemen kullan.`
              : `${product.name} ile tarif hazırlamayı düşünebilirsin.`,
          priority: expiry.priority,
          timeText: expiry.text,
        };
      })
      .filter(Boolean)
      .filter((item) => !dismissedNotifications.includes(item.id))
      .sort((a, b) => b.priority - a.priority);
  }, [effectiveProducts, dismissedNotifications]);

  const deleteNotification = (id) => {
    setDismissedNotifications((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const clearAllNotifications = () => {
    setDismissedNotifications((prev) => [
      ...new Set([...prev, ...notifications.map((item) => item.id)]),
    ]);
  };

  const notificationCount = notifications.length;

  return (
    <header
      className={`navbar ${isFormPage ? "navbar--form" : ""} ${
        isDashboard ? "navbar--dashboard" : ""
      }`}
      style={{
        background: isDashboard
          ? "linear-gradient(90deg, #1f4d2e 0%, #2f6a3f 100%)"
          : "#ffffff",
        color: isDashboard ? "#ffffff" : "#1f2937",
        position: "sticky",
        top: 0,
        zIndex: 999,
        padding: "18px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: isDashboard
          ? "0 8px 24px rgba(31, 77, 46, 0.18)"
          : "0 4px 16px rgba(0,0,0,0.06)",
        borderBottom: isDashboard ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <div
        className="navbar__logo"
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          letterSpacing: "-0.5px",
          color: isDashboard ? "#ffffff" : "#1f4d2e",
          textShadow: isDashboard ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
        }}
      >
        SağlıkPusula
      </div>

      <div
        className="navbar__actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {isDashboard ? (
          <>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUsersMenu(false);
                }}
                style={{
                  background: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  position: "relative",
                }}
              >
                <span>🔔</span>
                <span>Bildirimler</span>

                {notificationCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-4px",
                      minWidth: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                      boxShadow: "0 6px 14px rgba(239,68,68,0.35)",
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "58px",
                    right: 0,
                    width: "340px",
                    background: "#ffffff",
                    color: "#1f2937",
                    borderRadius: "18px",
                    padding: "16px",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
                    border: "1px solid #e5efe7",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: "#1f4d2e",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      Bildirimler
                    </h4>

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Tümünü Temizle
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p
                      style={{
                        margin: 0,
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      Şu anda bildirim yok.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        maxHeight: "360px",
                        overflowY: "auto",
                      }}
                    >
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            background:
                              item.status === "Geçti" || item.status === "Bugün son gün"
                                ? "#fff1f2"
                                : "#f0fdf4",
                            border:
                              item.status === "Geçti" || item.status === "Bugün son gün"
                                ? "1px solid #fecdd3"
                                : "1px solid #d9f4df",
                            borderRadius: "12px",
                            padding: "10px 12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "10px",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  margin: "0 0 6px 0",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                {item.text}
                              </p>

                              <p
                                style={{
                                  margin: "0 0 4px 0",
                                  fontSize: "12px",
                                  color: "#6b7280",
                                }}
                              >
                                {item.timeText}
                              </p>

                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "13px",
                                  color:
                                    item.status === "Geçti" || item.status === "Bugün son gün"
                                      ? "#b91c1c"
                                      : "#15803d",
                                }}
                              >
                                {item.recipe}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteNotification(item.id)}
                              style={{
                                background: "#ffffff",
                                color: "#b42318",
                                border: "1px solid #fecaca",
                                borderRadius: "8px",
                                padding: "6px 9px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "700",
                                flexShrink: 0,
                              }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setShowUsersMenu(!showUsersMenu);
                  setShowNotifications(false);
                }}
                type="button"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Kullanıcılar
              </button>

              {showUsersMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "58px",
                    right: 0,
                    width: "360px",
                    background: "#ffffff",
                    color: "#1f2937",
                    borderRadius: "18px",
                    padding: "18px",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
                    border: "1px solid #e5efe7",
                    zIndex: 1000,
                    maxHeight: "75vh",
                    overflowY: "auto",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 14px 0",
                      color: "#1f4d2e",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    Aile Üyeleri
                  </h4>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fecaca",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      marginBottom: "14px",
                      boxShadow: "0 8px 18px rgba(153,27,27,0.08)",
                    }}
                  >
                    🚪 Çıkış Yap
                  </button>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {familyMembers.length === 0 ? (
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Henüz eklenen aile üyesi yok.
                      </p>
                    ) : (
                      familyMembers.map((member) => (
                        <div
                          key={member.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                            background:
                              selectedUserId === member.id
                                ? "#eefaf1"
                                : "#f8fafc",
                            border:
                              selectedUserId === member.id
                                ? "1px solid #b7e4c7"
                                : "1px solid #e5e7eb",
                            borderRadius: "12px",
                            padding: "10px 12px",
                          }}
                        >
                          <span
                            style={{
                              cursor: "pointer",
                              flex: 1,
                              fontWeight: "600",
                              color: "#1f2937",
                            }}
                            onClick={() => {
                              setSelectedUserId(member.id);
                            }}
                          >
                            {member.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const isConfirmed = window.confirm(
                                `${member.name} kullanıcısını silmek istediğine emin misin?`
                              );

                              if (isConfirmed) {
                                deleteFamilyMember(member.id);
                              }
                            }}
                            style={{
                              background: "#ffe5e5",
                              color: "#b42318",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    style={{
                      height: "1px",
                      background: "#e5e7eb",
                      margin: "16px 0",
                    }}
                  ></div>

                  <h5
                    style={{
                      margin: "0 0 10px 0",
                      color: "#1f4d2e",
                      fontSize: "15px",
                      fontWeight: "700",
                    }}
                  >
                    Yeni Kullanıcı Ekle
                  </h5>

                  <input
                    type="text"
                    placeholder="İsim gir"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      marginBottom: "10px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />

                  <button
                    onClick={handleAddMember}
                    type="button"
                    style={{
                      width: "100%",
                      background: "#22c55e",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(34,197,94,0.18)",
                    }}
                  >
                    Kullanıcı Ekle
                  </button>

                  {selectedUser && (
                    <>
                      <div
                        style={{
                          height: "1px",
                          background: "#e5e7eb",
                          margin: "18px 0",
                        }}
                      ></div>

                      <h5
                        style={{
                          margin: "0 0 10px 0",
                          color: "#1f4d2e",
                          fontSize: "15px",
                          fontWeight: "700",
                        }}
                      >
                        Seçili Kullanıcı Bilgileri
                      </h5>

                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "12px",
                          marginBottom: "14px",
                        }}
                      >
                        <p style={{ margin: "0 0 10px 0" }}>
                          <strong>İsim:</strong> {selectedUser.name || "-"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <strong>Yaş:</strong>{" "}
                            {editingField === "age" ? (
                              <input
                                type="text"
                                value={editAgeValue}
                                onChange={(e) => setEditAgeValue(e.target.value)}
                                style={{
                                  marginLeft: "8px",
                                  padding: "6px 8px",
                                  borderRadius: "8px",
                                  border: "1px solid #d1d5db",
                                  width: "90px",
                                }}
                              />
                            ) : (
                              selectedUser.age || "-"
                            )}
                          </div>

                          {editingField === "age" ? (
                            <button
                              type="button"
                              onClick={saveAge}
                              style={{
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                fontWeight: "700",
                              }}
                            >
                              Kaydet
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startEditAge}
                              style={{
                                background: "#eefaf1",
                                border: "1px solid #cfead7",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                cursor: "pointer",
                              }}
                            >
                              ✏️
                            </button>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <strong>Kilo:</strong>{" "}
                            {editingField === "weight" ? (
                              <input
                                type="text"
                                value={editWeightValue}
                                onChange={(e) => setEditWeightValue(e.target.value)}
                                style={{
                                  marginLeft: "8px",
                                  padding: "6px 8px",
                                  borderRadius: "8px",
                                  border: "1px solid #d1d5db",
                                  width: "90px",
                                }}
                              />
                            ) : (
                              selectedUser.weight || "-"
                            )}
                          </div>

                          {editingField === "weight" ? (
                            <button
                              type="button"
                              onClick={saveWeight}
                              style={{
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                fontWeight: "700",
                              }}
                            >
                              Kaydet
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startEditWeight}
                              style={{
                                background: "#eefaf1",
                                border: "1px solid #cfead7",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                cursor: "pointer",
                              }}
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      </div>

                      <h5
                        style={{
                          margin: "0 0 10px 0",
                          color: "#1f4d2e",
                          fontSize: "15px",
                          fontWeight: "700",
                        }}
                      >
                        Hastalık Bilgileri
                      </h5>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        {selectedDiseases.length === 0 ? (
                          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                            Hastalık bilgisi yok.
                          </p>
                        ) : (
                          selectedDiseases.map((item) => (
                            <span
                              key={item}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#eefaf1",
                                border: "1px solid #cfead7",
                                color: "#1f4d2e",
                                borderRadius: "999px",
                                padding: "6px 10px",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              {item}
                              <span
                                onClick={() => handleRemoveDisease(item)}
                                style={{ cursor: "pointer" }}
                              >
                                ❌
                              </span>
                            </span>
                          ))
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                        <input
                          type="text"
                          placeholder="Hastalık ekle"
                          value={newDisease}
                          onChange={(e) => setNewDisease(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            outline: "none",
                            fontSize: "14px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddDisease}
                          style={{
                            background: "#16a34a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Ekle
                        </button>
                      </div>

                      <h5
                        style={{
                          margin: "0 0 10px 0",
                          color: "#1f4d2e",
                          fontSize: "15px",
                          fontWeight: "700",
                        }}
                      >
                        Alerji Durumu
                      </h5>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        {selectedAllergies.length === 0 ? (
                          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                            Alerji bilgisi yok.
                          </p>
                        ) : (
                          selectedAllergies.map((item) => (
                            <span
                              key={item}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#fff7ed",
                                border: "1px solid #fed7aa",
                                color: "#9a3412",
                                borderRadius: "999px",
                                padding: "6px 10px",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              {item}
                              <span
                                onClick={() => handleRemoveAllergy(item)}
                                style={{ cursor: "pointer" }}
                              >
                                ❌
                              </span>
                            </span>
                          ))
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Alerji ekle"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            outline: "none",
                            fontSize: "14px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddAllergy}
                          style={{
                            background: "#ea580c",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Ekle
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: "999px",
                border: "1px solid #cbd5e1",
                color: "#1f4d2e",
                fontWeight: "700",
                background: "#ffffff",
              }}
            >
              Kullanıcı Girişi
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: "999px",
                border: "none",
                color: "#ffffff",
                fontWeight: "700",
                background: "#22c55e",
                boxShadow: "0 8px 18px rgba(34,197,94,0.18)",
              }}
            >
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
