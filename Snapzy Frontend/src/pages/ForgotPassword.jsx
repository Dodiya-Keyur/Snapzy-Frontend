import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Mail,
  Lock,
  ArrowLeft,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  KeyRound,
  UserCheck,
} from "lucide-react";
import api from "../api/axios";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [confirmedUser, setConfirmedUser] = useState(null);

  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getPasswordStrength(newpassword);

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-reset-email", {
        email: trimmedEmail,
      });

      if (res.data?.success) {
        setConfirmedUser(res.data.user || { email: trimmedEmail });
        setStep(2);
        setSuccessMessage("Email confirmed! Now enter your new password.");
      }
    } catch (err) {
      console.error("Email verification error:", err);
      const msg =
        err.response?.data?.message ||
        "No account found with this email address. Please check and try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newpassword || !confirmpassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (newpassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newpassword !== confirmpassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
        newpassword,
        confirmpassword,
      });

      if (res.data?.success) {
        setStep(3);
        setSuccessMessage(
          res.data.message ||
            "Password reset successfully! Redirecting you to login..."
        );

        setTimeout(() => {
          navigate("/login");
        }, 2200);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/login" className="inline-flex items-center gap-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-sm shadow-pink-500/20">
              <Camera size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Snapzy
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-gray-500">
            Account Recovery & Password Reset
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  step === 1 ? "text-black" : "text-emerald-600"
                }`}
              >
                {step === 1
                  ? "Step 1: Confirm Email"
                  : step === 2
                  ? "Step 2: Set New Password"
                  : "Completed"}
              </span>

              <span className="text-xs font-semibold text-gray-400">
                {step === 3 ? "2/2" : `${step}/2`}
              </span>
            </div>

            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 transition-all duration-300"
                style={{
                  width: step === 1 ? "50%" : "100%",
                }}
              />
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {step === 1
                ? "Forgot Password?"
                : step === 2
                ? "Create New Password"
                : "Password Updated!"}
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {step === 1
                ? "Enter your registered email address to verify your account."
                : step === 2
                ? "Your email is confirmed. Choose a strong new password."
                : "Your account password has been securely updated."}
            </p>
          </div>

          {successMessage && step !== 3 && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
              <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleConfirmEmail} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                >
                  Registered Email Address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail size={18} />
                  </div>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="name@example.com"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">
                  We'll check if this email is registered in our database.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-3 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {loading && <LoaderCircle size={16} className="animate-spin" />}
                {loading ? "Confirming Email..." : "Confirm Email"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck size={16} className="text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      @{confirmedUser?.username || "user"}
                    </p>
                    <p className="text-emerald-700 truncate">{email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0 ml-2"
                >
                  Change
                </button>
              </div>

              <div>
                <label
                  htmlFor="newpassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                >
                  New Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock size={18} />
                  </div>

                  <input
                    id="newpassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newpassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="At least 8 characters"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {newpassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{
                          width:
                            strength.score === 1
                              ? "33%"
                              : strength.score === 2
                              ? "66%"
                              : "100%",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Strength:</span>
                      <span className={`font-semibold ${strength.text}`}>
                        {strength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmpassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <KeyRound size={18} />
                  </div>

                  <input
                    id="confirmpassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmpassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Re-enter new password"
                    required
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {confirmpassword && (
                  <p className="mt-1.5 text-xs font-medium">
                    {newpassword === confirmpassword ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check size={13} /> Passwords match
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertCircle size={13} /> Passwords do not match
                      </span>
                    )}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-3 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
              >
                {loading && <LoaderCircle size={16} className="animate-spin" />}
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs">
                <Check size={28} strokeWidth={2.5} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Password Reset Complete
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Your new password is now active. You will be redirected to the login page shortly.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-black py-3 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99]"
              >
                Go to Login
              </Link>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition active:scale-95"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
