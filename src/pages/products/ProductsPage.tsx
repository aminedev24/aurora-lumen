// ==============================================================================
// File: /frontend/src/pages/ProductsPage.tsx
// Description: Aurora Lumen Products Page (Aurora Plus + upcoming tools)
// - Clean layout, no duplicated sections
// - All product cards inside one consistent grid
// ==============================================================================

import { useEffect } from "react";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "./ProductsPage.css";
import { AURORA_PLUS_PAYPAL_URL } from "@/lib/payments";

const futureProducts = [
  {
    id: "vision",
    title: "Aurora Vision (coming soon)",
    description:
      "High-fidelity image generation tuned for branding, storyboards, and educational diagrams.",
  },
];

export default function ProductsPage() {
  useEffect(() => {
    const containerSelector =
      "#paypal-button-container-P-2LK71012GC232253GNELH2QQ";

    const renderPaypalButton = () => {
      const paypal = (window as any)?.paypal;
      if (!paypal || !document.querySelector(containerSelector)) return;

      try {
        paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "blue",
              layout: "vertical",
              label: "subscribe",
            },
            createSubscription: (_data: unknown, actions: any) =>
              actions.subscription.create({
                plan_id: "P-2LK71012GC232253GNELH2QQ",
              }),
            onApprove: (data: any) => {
              alert(
                `Subscription started. ID: ${
                  data.subscriptionID || "N/A"
                }`
              );
            },
          })
          .render(containerSelector);
      } catch (err) {
        console.warn("[ProductsPage] Failed to render PayPal button:", err);
      }
    };

    const scriptId = "paypal-sdk-subscribe";
    if (document.getElementById(scriptId)) {
      renderPaypalButton();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AcTBG7dTI9K9GXnyJfJlM5wex4GSnxgMEGE8CBVqcVnQatpKI8WdA3K3Dx8VIiLj1yvsE6IIyA6rbyZm&vault=true&intent=subscription";
    script.dataset.sdkIntegrationSource = "button-factory";
    script.onload = renderPaypalButton;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <div className="landing products-page">
      <TopBar />

      {/* ===== HERO ===== */}
      <section className="products-hero" id="products-hero">
        <div className="page-shell">
          <div>
            <div className="hp-eyebrow">Aurora Products</div>
            <h1>Choose how you work with Aurora</h1>
            <p>
              Aurora Plus is available today for serious daily chat. More
              focused assistants for images and studio workflows arrive soon—
              built with the same human-first approach.
            </p>
          </div>
        </div>
      </section>

      {/* ===== MAIN ===== */}
      <main className="products-main">
        <section className="hp-block" id="aurora-plus">
          <div className="page-shell">

            {/* ALL CARDS IN ONE GRID */}
            <div className="products-grid">

              {/* ---------- AURORA PLUS CARD ---------- */}
              <article
                id="aurora-plus-card"
                className="products-card products-card--primary"
              >
               

                <h2 style={{ marginBottom: "0.75rem" }}>Aurora Plus</h2>
                 <div className="hp-eyebrow">
                  Available now · One-month pass or a monthly subscription
                </div>

                <p>
                  Aurora Plus — built for serious daily use.
                  Fast. Accurate. Consistent.
                </p>

                <ul className="hp-list" style={{ marginTop: "1.25rem" }}>
                  <li>Always-on premium compute with the latest Aurora brain.</li>
                  <li>Multiple modes for coding, research, debates, creativity.</li>
                  <li>Custom persona mode.</li>
                  <li>Reads TXT, PDF and more.</li>
                  <li>Book-length summarizing.</li>
                  <li>Workspace projects (beta).</li>
                  <li>Early feature previews + dedicated email support.</li>
                </ul>

                <div className="hp-cta-row" style={{ marginTop: "1.75rem" }}>
                  <a
                    className="btn btn--primary hp-btn"
                    href={AURORA_PLUS_PAYPAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    One-Month Pass
                  </a>

                  <a
                    className="btn btn--outline hp-btn"
                    href="https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-2LK71012GC232253GNELH2QQ"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Subscribe Monthly
                  </a>
                </div>

                <div
                  id="paypal-button-container-P-2LK71012GC232253GNELH2QQ"
                  className="paypal-subscribe-slot"
                />
              </article>

              {/* ---------- FUTURE PRODUCTS ---------- */}
              {futureProducts.map((product) => (
                <article key={product.id} className="products-card">
                  <h3 style={{ marginTop: 0 }}>{product.title}</h3>
                  <p>{product.description}</p>
                  <p style={{ fontSize: "0.95rem", opacity: 0.75 }}>
                    Join the mailing list to hear when it opens.
                  </p>
                </article>
              ))}

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
