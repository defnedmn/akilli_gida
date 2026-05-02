import { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [showCookie, setShowCookie] = useState(true);

  return (
    <>
      <main className="hero">
        <div className="hero__overlay"></div>

        <div className="hero__content">
          <p className="hero__tag">AKILLI BESLENME ASİSTANI</p>

          <h1 className="hero__title">
            Sağlığınıza Uygun
            <br />
            Akıllı Beslenme Sistemi
          </h1>

          <p className="hero__text">
            Kişisel sağlık bilgilerinize göre ürünleri analiz eden, riskli
            içerikleri belirleyen ve size özel tarifler sunan bütünleşik bir
            beslenme asistanı.
          </p>

          <div className="hero__buttons">
            <Link to="/login" className="hero__btn hero__btn--primary">
              Hemen Başla
            </Link>

            <a href="#reach-section" className="hero__btn hero__btn--secondary">
              Sistemi İncele
            </a>
          </div>
        </div>
      </main>

      <section id="reach-section" className="reach-section">
        <div className="reach-card">
          <div className="reach-icon">
            <svg
              width="92"
              height="92"
              viewBox="0 0 92 92"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="46" cy="46" r="38" stroke="#39B54A" strokeWidth="4" />
              <path
                d="M30 51C34 42 42 37 50 35C57 33 64 35 69 40"
                stroke="#39B54A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M24 45C27 47 29 51 29 55C29 59 27 63 24 66"
                stroke="#39B54A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M43 58C44 52 48 49 53 48C57 47 61 48 64 51"
                stroke="#39B54A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M36 28C37 31 39 33 42 35C45 37 48 38 51 38"
                stroke="#39B54A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="58" cy="27" r="4" fill="#39B54A" />
              <circle cx="34" cy="64" r="4" fill="#39B54A" />
            </svg>
          </div>

          <h2 className="reach-title">Sağlıklı seçimleri kolaylaştırırız.</h2>

          <p className="reach-text">
            Kullanıcı profili, ürün içeriği, son kullanma tarihi ve kişisel
            beslenme ihtiyaçlarını birlikte değerlendirerek herkes için daha
            bilinçli, daha güvenli ve daha sürdürülebilir bir beslenme deneyimi
            sunarız.
          </p>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-circle">
            <div className="stat-icon">🥗</div>
            <h3 className="stat-number">İsrafı</h3>
            <p className="stat-text">
              Son kullanma tarihi yaklaşan ürünleri öne çıkararak gıda israfını azaltırız.
            </p>
          </div>

          <div className="stat-circle">
            <div className="stat-icon">⚠️</div>
            <h3 className="stat-number">Riski</h3>
            <p className="stat-text">
              Şeker, tuz ve glüten gibi içerikleri analiz ederek riskli ürünleri belirleriz.
            </p>
          </div>

          <div className="stat-circle">
            <div className="stat-icon">👤</div>
            <h3 className="stat-number">Kişiye</h3>
            <p className="stat-text">
              Yaş, kilo ve hastalık bilgilerine göre herkese özel değerlendirme sunarız.
            </p>
          </div>

          <div className="stat-circle">
            <div className="stat-icon">🍽️</div>
            <h3 className="stat-number">Akıllı</h3>
            <p className="stat-text">
              Eldeki ürünlere uygun tarifler önererek doğru ve pratik seçimler yapmanızı sağlarız.
            </p>
          </div>
        </div>
      </section>

      {showCookie && (
        <div className="cookie-bar">
          <span className="cookie-text">
            Web sitemizde size daha iyi bir deneyim sunabilmek için çerezler ve
            temel kullanım verileri kullanılmaktadır.
          </span>

          <div className="cookie-actions">
            <button className="cookie-link">Detaylı Bilgi</button>
            <button className="cookie-ok" onClick={() => setShowCookie(false)}>
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;