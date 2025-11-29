import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "@/pages/home/HomePage";
import AboutPage from "@/pages/about/AboutPage";
import ProductsPage from "@/pages/products/ProductsPage";
import LoginPage from "@/pages/login/LoginPage";
import AccountPage from "@/pages/account/AccountPage";
import WebAccountPage from "@/pages/webAccount/WebAccountPage";
import HelpPage from "@/pages/help/HelpPage";
import ContactPage from "@/pages/contact/ContactPage";
import InvestPage from "@/pages/support/InvestPage";
import ExperimentalPage from "@/pages/experimental/ExperimentalPage";
import LegalPage from "@/pages/legal/LegalPage";
import AuthLanding from "@/pages/auth/AuthLanding";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import RegisterDetailsPage from "@/pages/auth/RegisterDetailsPage";
import ConfirmEmailPage from "@/pages/auth/ConfirmEmailPage";
import WebAuthPage from "@/pages/auth/WebAuthPage";
import AuroraPlusThanks from "@/pages/thanks/AuroraPlusThanks";

function NotFound() {
  return (
    <main className="app-shell">
      <h1>Page not found</h1>
      <p className="muted">Returning you home.</p>
      <a href={import.meta.env.BASE_URL || "/"}>Go home</a>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/web-account" element={<WebAccountPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<InvestPage />} />
        <Route path="/experimental" element={<ExperimentalPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/auth" element={<AuthLanding />} />
        <Route path="/auth/reset" element={<ResetPasswordPage />} />
        <Route path="/auth/register" element={<RegisterDetailsPage />} />
        <Route path="/auth/confirm" element={<ConfirmEmailPage />} />
        <Route path="/auth/web" element={<WebAuthPage />} />
        <Route path="/thanks" element={<AuroraPlusThanks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
