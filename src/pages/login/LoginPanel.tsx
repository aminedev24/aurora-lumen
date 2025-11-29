import React from "react";
import type { TFunction } from "i18next";
import type { LoginFlowState } from "./useLoginFlow";

type LoginPanelProps = {
  t: TFunction<"translation", undefined>;
  flow: LoginFlowState;
};

export function LoginPanel({ t, flow }: LoginPanelProps) {
  const {
    error,
    status,
    isRegister,
    signinMethod,
    setSigninMethod,
    step,
    handleRequestCode,
    handleVerify,
    email,
    setEmail,
    name,
    setName,
    verificationBanner,
    rememberEmail,
    handleRememberToggle,
    requestButtonLabel,
    loading,
    code,
    setCode,
    verifyPrompt,
    verifyButtonLabel,
    resendCooldown,
    handleResend,
    handleUseDifferentEmail,
    handleModeToggle,
    handlePasswordLogin,
    passwordEmail,
    setPasswordEmail,
    passwordValue,
    setPasswordValue,
    goToResetPassword,
    handleGoogleSignIn,
    googleLoading,
    emailRef,
    codeRef,
    postVerifyPassword,
    setPostVerifyPassword,
    postVerifyConfirm,
    setPostVerifyConfirm,
    postVerifyError,
    postVerifyLoading,
    handlePostVerifyPasswordSave,
    handleSkipPasswordSetup,
    pendingEmail,
    showPassword,
    setShowPassword,
    rememberLogin,
    setRememberLogin,
  } = flow;
  const renderGoogleButton = () => (
    <div className="login-provider-inline">
      <div className="login-provider-divider">
        <span>{t("auth.web.dividerLabel", "or continue with Google")}</span>
      </div>
      <button
        type="button"
        className="btn btn--outline btn--full login-provider-btn"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        <span className="login-provider-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" role="img" aria-label="Google">
            <path
              fill="#EA4335"
              d="M12 11.989v4.518h6.47c-.284 1.5-1.74 4.4-6.47 4.4-3.892 0-7.07-3.22-7.07-7.202S7.108 6.5 12 6.5c2.214 0 3.707.936 4.56 1.742l3.103-3.013C17.584 3.268 15.071 2 12 2 5.925 2 1 6.925 1 13s4.925 11 11 11c6.357 0 10.556-4.46 10.556-10.726 0-.72-.078-1.27-.174-1.815H12z"
            />
          </svg>
        </span>
        {googleLoading
          ? t("auth.web.googleSigningIn", "Signing in…")
          : t("auth.web.googleCta", "Continue with Google")}
      </button>
      <p className="login-provider-hint">
        {t("auth.web.googleHint", "Use your Google account—no password required.")}
      </p>
    </div>
  );

  return (
    <section className="login-panel" aria-label={t("auth.loginPanel", "Sign in or create an account")}>
      <div className="login-panel-inner">
        {error && <div className="login-error">{error}</div>}
        {status && <div className="login-success">{status}</div>}

        {!isRegister && step !== "set-password" && (
          <div className="login-method-toggle" role="tablist" aria-label="Choose sign-in method">
            <button
              type="button"
              className={signinMethod === "password" ? "active" : ""}
              onClick={() => setSigninMethod("password")}
              aria-pressed={signinMethod === "password"}
            >
              {t("auth.web.methodPassword", "Password")}
            </button>
            <button
              type="button"
              className={signinMethod === "code" ? "active" : ""}
              onClick={() => setSigninMethod("code")}
              aria-pressed={signinMethod === "code"}
            >
              {t("auth.web.methodCode", "Magic link / code")}
            </button>
          </div>
        )}

        {step === "set-password" ? (
          <form className="login-form" onSubmit={handlePostVerifyPasswordSave}>
            <p className="login-footnote">
              {t(
                "auth.web.setPasswordBlurb",
                "You're signed in as {{email}}. Choose a password so you can sign in without codes next time.",
                { email: pendingEmail || t("auth.web.yourEmail", "your account") }
              )}
            </p>
            <input
              type="password"
              className="login-input"
              placeholder={t("auth.web.newPasswordPlaceholder", "New password")}
              value={postVerifyPassword}
              onChange={(event) => setPostVerifyPassword(event.target.value)}
              required
              disabled={postVerifyLoading}
              autoComplete="new-password"
            />
            <input
              type="password"
              className="login-input"
              placeholder={t("auth.web.confirmPasswordPlaceholder", "Confirm password")}
              value={postVerifyConfirm}
              onChange={(event) => setPostVerifyConfirm(event.target.value)}
              required
              disabled={postVerifyLoading}
              autoComplete="new-password"
            />
            {postVerifyError && <div className="login-error">{postVerifyError}</div>}
            <button type="submit" className="btn btn--primary btn--full login-submit" disabled={postVerifyLoading}>
              {postVerifyLoading ? t("auth.web.savingPassword", "Saving…") : t("auth.web.savePassword", "Save password")}
            </button>
            <div className="login-actions">
              <button type="button" className="login-link" onClick={handleSkipPasswordSetup} disabled={postVerifyLoading}>
                {t("auth.web.skipPasswordForNow", "Skip for now")}
              </button>
            </div>
          </form>
        ) : isRegister || signinMethod === "code" ? (
          <form className="login-form" onSubmit={step === "request" ? handleRequestCode : handleVerify}>
            {step === "request" ? (
              <>
                <input
                  ref={emailRef}
                  type="email"
                  className="login-input"
                  placeholder={t("auth.web.emailPlaceholder", "you@example.com")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
                {isRegister && (
                  <input
                    type="text"
                    className="login-input"
                    placeholder={t("auth.web.namePlaceholder", "Your name (optional)")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    disabled={loading}
                  />
                )}
                {verificationBanner}

                {!isRegister && (
                  <label className="login-remember">
                    <input type="checkbox" checked={rememberEmail} onChange={handleRememberToggle} />
                    {t("auth.web.rememberEmail", "Remember my email on this device")}
                  </label>
                )}

                <button type="submit" className="btn btn--primary btn--full login-submit" disabled={loading}>
                  {requestButtonLabel}
                </button>
                {renderGoogleButton()}

                <p className="login-footnote">
                  {isRegister
                    ? t(
                        "auth.web.trialExplainer",
                        "Check your inbox for the one-click link or the 6-digit code—confirm once to lock your badge and start the 7-day Aurora Plus trial."
                      )
                    : t(
                        "auth.web.loginExplainer",
                        "Already confirmed? Enter the 6-digit magic code now and keep your password handy for whenever you prefer the classic flow."
                      )}
                </p>

                <div className="login-actions">
                  <button type="button" className="login-link" onClick={handleModeToggle} disabled={loading}>
                    {isRegister
                      ? t("auth.haveAccount", "Already have an account?")
                      : t("auth.signup", "Create an account")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="login-code-input"
                  placeholder="000000"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D+/g, "").slice(0, 6))}
                  disabled={loading}
                  required
                />
                <p className="login-footnote">{verifyPrompt}</p>
                {verificationBanner}
                <button
                  type="submit"
                  className="btn btn--primary btn--full login-submit"
                  disabled={loading || code.length === 0}
                >
                  {verifyButtonLabel}
                </button>
                {renderGoogleButton()}
                <div className="login-actions">
                  <button
                    type="button"
                    className="login-link"
                    onClick={handleResend}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? t("auth.web.resendCountdown", "Resend code in {{seconds}}s", { seconds: resendCooldown })
                      : t("auth.web.resendNow", "Resend code")}
                  </button>
                  <button type="button" className="login-link" onClick={handleUseDifferentEmail} disabled={loading}>
                    {t("auth.web.useDifferentEmail", "Use a different email")}
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form className="login-form" onSubmit={handlePasswordLogin}>
            <input
              type="email"
              className="login-input"
              placeholder={t("auth.web.emailPlaceholder", "you@example.com")}
              value={passwordEmail}
              onChange={(event) => setPasswordEmail(event.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder={t("auth.web.passwordPlaceholder", "Enter your password")}
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "🔓" : "🔒"}
              </button>
            </div>

            <div className="login-remember-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                />
                {t("auth.web.rememberLogin", "Remember my login on this device")}
              </label>
              <button type="button" className="login-link" onClick={goToResetPassword}>
                {t("auth.web.forgotPassword", "Forgot password?")}
              </button>
            </div>

            <button type="submit" className="btn btn--primary btn--full login-submit" disabled={loading}>
              {loading ? t("auth.web.signingIn", "Signing in…") : t("auth.web.passwordSignIn", "Sign in")}
            </button>
            {renderGoogleButton()}

            <p className="login-footnote">
              {t(
                "auth.web.passwordExplainer",
                "Need a faster option? Switch to the magic link tab whenever you prefer."
              )}
            </p>

            <div className="login-actions">
              <button type="button" className="login-link" onClick={handleModeToggle} disabled={loading}>
                {t("auth.signup", "Create an account")}
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
}
