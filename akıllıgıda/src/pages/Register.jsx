import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({
  setFamilyMembers,
  setSelectedUserId,
  setCurrentLoggedInUserId,
  setHomeProducts,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      alert("Lütfen tüm alanları doldur.");
      return;
    }

    if (cleanPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalı.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      const mainUser = {
        id: uid,
        name: cleanName,
        email: firebaseUser.email.toLowerCase(),
        age: "",
        weight: "",
        disease: [],
        allergies: [],
      };

      const users = [mainUser];

      localStorage.setItem(`users_${uid}`, JSON.stringify(users));
      localStorage.setItem(`selectedUserId_${uid}`, uid);
      localStorage.setItem(`homeProducts_${uid}`, JSON.stringify([]));

      setFamilyMembers(users);
      setSelectedUserId(uid);
      setCurrentLoggedInUserId(uid);
      setHomeProducts([]);

      alert("Kayıt başarılı");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log("REGISTER ERROR:", err.code, err.message);

      if (err.code === "auth/email-already-in-use") {
        alert("Bu e-posta zaten kayıtlı. Kullanıcı girişinden giriş yap.");
        navigate("/login");
      } else if (err.code === "auth/weak-password") {
        alert("Şifre en az 6 karakter olmalı.");
      } else if (err.code === "auth/invalid-email") {
        alert("E-posta formatı hatalı.");
      } else {
        alert("Kayıt hatası: " + err.code);
      }
    }
  };

  return (
    <main className="form-page">
      <section className="form-card">
        <h1 className="form-title">Kayıt Ol</h1>

        <input
          className="form-input"
          type="text"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-input"
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="form-input"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="form-button" onClick={handleRegister}>
          Kayıt Ol
        </button>
      </section>
    </main>
  );
}

export default Register;