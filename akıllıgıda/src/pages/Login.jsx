import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({
  setFamilyMembers,
  setSelectedUserId,
  setCurrentLoggedInUserId,
  setHomeProducts,
}) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      alert("Lütfen e-posta ve şifre gir.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;
      const loggedEmail = firebaseUser.email.toLowerCase();

      const savedUsers = localStorage.getItem(`users_${uid}`);
      const savedProducts = localStorage.getItem(`homeProducts_${uid}`);
      const savedSelectedUserId = localStorage.getItem(`selectedUserId_${uid}`);

      let users = savedUsers ? JSON.parse(savedUsers) : [];

      if (users.length === 0) {
        const mainUser = {
          id: uid,
          name: loggedEmail.split("@")[0],
          email: loggedEmail,
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

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log("LOGIN ERROR:", err.code, err.message);

      if (err.code === "auth/invalid-credential") {
        alert("E-posta veya şifre yanlış.");
      } else if (err.code === "auth/user-not-found") {
        alert("Bu e-posta ile kayıtlı kullanıcı yok.");
      } else if (err.code === "auth/wrong-password") {
        alert("Şifre yanlış.");
      } else if (err.code === "auth/too-many-requests") {
        alert("Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.");
      } else {
        alert("Giriş hatası: " + err.code);
      }
    }
  };

  return (
    <main className="form-page">
      <section className="form-card">
        <h1 className="form-title">Kullanıcı Girişi</h1>

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

        <button className="form-button" onClick={handleLogin}>
          Giriş Yap
        </button>
      </section>
    </main>
  );
}

export default Login;