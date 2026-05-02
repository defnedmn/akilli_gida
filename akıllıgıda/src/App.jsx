import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";


function App() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState(null);
  const [homeProducts, setHomeProducts] = useState([]);

  const loadUserData = (uid, email) => {
    const savedUsers = localStorage.getItem(`users_${uid}`);
    const savedProducts = localStorage.getItem(`homeProducts_${uid}`);
    const savedSelectedUserId = localStorage.getItem(`selectedUserId_${uid}`);

    let users = savedUsers ? JSON.parse(savedUsers) : [];

    if (users.length === 0) {
      const mainUser = {
        id: uid,
        name: email ? email.split("@")[0] : "Kullanıcı",
        email: email || "",
        age: "",
        weight: "",
        disease: [],
        allergies: [],
      };

      users = [mainUser];
      localStorage.setItem(`users_${uid}`, JSON.stringify(users));
      localStorage.setItem(`selectedUserId_${uid}`, uid);
    }

    setFamilyMembers(users);
    setSelectedUserId(savedSelectedUserId || uid);
    setCurrentLoggedInUserId(uid);
    setHomeProducts(savedProducts ? JSON.parse(savedProducts) : []);
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserData(user.uid, user.email);
    } else {
      // 👇 ÇIKIŞ YAPINCA TEMİZLE
      setFamilyMembers([]);
      setSelectedUserId(null);
      setCurrentLoggedInUserId(null);
      setHomeProducts([]);
    }
  });

  return () => unsubscribe();
}, []);
  useEffect(() => {
    if (!currentLoggedInUserId) return;

    localStorage.setItem(
      `users_${currentLoggedInUserId}`,
      JSON.stringify(familyMembers)
    );
  }, [familyMembers, currentLoggedInUserId]);

  useEffect(() => {
    if (!currentLoggedInUserId) return;

    localStorage.setItem(
      `homeProducts_${currentLoggedInUserId}`,
      JSON.stringify(homeProducts)
    );
  }, [homeProducts, currentLoggedInUserId]);

  useEffect(() => {
    if (!currentLoggedInUserId || !selectedUserId) return;

    localStorage.setItem(
      `selectedUserId_${currentLoggedInUserId}`,
      selectedUserId
    );
  }, [selectedUserId, currentLoggedInUserId]);

  const addToHomeProducts = (product) => {
    setHomeProducts((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      const alreadyExists = safePrev.find(
        (item) => item.barcode && item.barcode === product.barcode
      );

      if (alreadyExists) {
        return safePrev.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [
        ...safePrev,
        {
          ...product,
          id: product.id || Date.now(),
          quantity: product.quantity || 1,
        },
      ];
    });
  };

  const addFamilyMember = (member) => {
    const newMember = {
      id: Date.now().toString(),
      name: member.name || "Yeni Kullanıcı",
      email: member.email || "",
      age: member.age || "",
      weight: member.weight || "",
      disease: Array.isArray(member.disease) ? member.disease : [],
      allergies: Array.isArray(member.allergies) ? member.allergies : [],
    };

    setFamilyMembers((prev) => [...prev, newMember]);
    setSelectedUserId(newMember.id);
  };

  const deleteFamilyMember = (userId) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== userId));

    if (selectedUserId === userId) {
      setSelectedUserId(currentLoggedInUserId);
    }
  };

  const updateMemberField = (userId, field, value) => {
    setFamilyMembers((prev) =>
      prev.map((member) =>
        member.id === userId ? { ...member, [field]: value } : member
      )
    );
  };

  const selectedUser =
    familyMembers.find((member) => member.id === selectedUserId) || null;

  return (
    <>
     <Navbar
  familyMembers={familyMembers}
  selectedUserId={selectedUserId}
  setSelectedUserId={setSelectedUserId}
  addFamilyMember={addFamilyMember}
  deleteFamilyMember={deleteFamilyMember}
  updateMemberField={updateMemberField}
  userProducts={homeProducts}
  setFamilyMembers={setFamilyMembers}
  setCurrentLoggedInUserId={setCurrentLoggedInUserId}
  setHomeProducts={setHomeProducts}
/>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <Login
              setFamilyMembers={setFamilyMembers}
              setSelectedUserId={setSelectedUserId}
              setCurrentLoggedInUserId={setCurrentLoggedInUserId}
              setHomeProducts={setHomeProducts}
            />
          }
        />

        <Route
          path="/register"
          element={
            <Register
              setFamilyMembers={setFamilyMembers}
              setSelectedUserId={setSelectedUserId}
              setCurrentLoggedInUserId={setCurrentLoggedInUserId}
              setHomeProducts={setHomeProducts}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <Dashboard
              key={currentLoggedInUserId || "guest"}
              selectedUser={selectedUser}
              updateMemberField={updateMemberField}
              homeProducts={homeProducts}
              setHomeProducts={setHomeProducts}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;