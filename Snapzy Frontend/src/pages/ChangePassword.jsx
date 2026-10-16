import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldpassword: "",
    newpassword: "",
    newconfirmpassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Password strength helper
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

  const strength = getPasswordStrength(formData.newpassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validations
    if (!formData.oldpassword || !formData.newpassword || !formData.newconfirmpassword) {
      setErrorMessage("All password fields are required.");
      return;
    }

    if (formData.oldpassword.length < 8) {
      setErrorMessage("Current password must be at least 8 characters long.");
      return;
    }

    if (formData.newpassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (formData.newpassword !== formData.newconfirmpassword) {
      setErrorMessage("New password and confirmation password do not match.");
      return;
    }

    if (formData.oldpassword === formData.newpassword) {
      setErrorMessage("New password must be different from current password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/change-password", {
        oldpassword: formData.oldpassword,
        newpassword: formData.newpassword,
        newconfirmpassword: formData.newconfirmpassword,
      });

      setSuccessMessage(
        res.data?.message || "Password changed successfully! Keep your new password safe."
      );

      // Clear input fields on success
      setFormData({
        oldpassword: "",
        newpassword: "",
        newconfirmpassword: "",
      });

      // Optional auto-redirect after 2.5s
      setTimeout(() => {
        navigate("/setting");
      }, 2500);
    } catch (err) {
      console.error("Change password error:", err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to change password. Please check your current password.";
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3.5 py-4 sm:px-6 sm:py-6 pb-28 md:pb-12">
      <div className="mx-auto max-w-2xl">

        {/* Back Link & Header */}
        <div className="mb-6">
          <Link
            to="/setting"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-black mb-4"
          >
            <ArrowLeft size={18} />
            Back to Settings
          </Link>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-sm">
              <Lock size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Change Password
              </h1>
              <p className="text-sm text-gray-500">
                Update your password to keep your Snapzy account safe and secure
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 transition">
            <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600">
              <Check size={16} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{successMessage}</p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Redirecting back to settings...
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 transition">
            <div className="mt-0.5 rounded-full bg-red-100 p-1 text-red-600">
              <AlertCircle size={16} strokeWidth={2.5} />
            </div>
            <p className="flex-1 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs"
        >
          {/* Current Password */}
          <div>
            <label
              htmlFor="oldpassword"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
            >
              Current Password
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <KeyRound size={18} />
              </div>

              <input
                id="oldpassword"
                name="oldpassword"
                type={showOldPassword ? "text" : "password"}
                value={formData.oldpassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-11 text-sm font-medium text-gray-900 transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />

              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition"
                aria-label={showOldPassword ? "Hide current password" : "Show current password"}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            {/* New Password */}
            <div>
              <label
                htmlFor="newpassword"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
              >
                New Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock size={18} />
                </div>

                <input
                  id="newpassword"
                  name="newpassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newpassword}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-11 text-sm font-medium text-gray-900 transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.newpassword && (
                <div className="mt-2.5 space-y-1.5">
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
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Password strength:</span>
                    <span className={`font-semibold ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="mt-5">
              <label
                htmlFor="newconfirmpassword"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock size={18} />
                </div>

                <input
                  id="newconfirmpassword"
                  name="newconfirmpassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.newconfirmpassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-11 text-sm font-medium text-gray-900 transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Match indicator */}
              {formData.newconfirmpassword && (
                <p className="mt-2 text-xs font-medium">
                  {formData.newpassword === formData.newconfirmpassword ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check size={14} /> Passwords match
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} /> Passwords do not match
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Security Recommendations Card */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              <ShieldCheck size={16} className="text-blue-500" />
              Password Security Tips
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Must be at least 8 characters long
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Cannot be identical to your current password
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Include numbers, symbols, and capital letters for maximum security
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/setting")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 active:scale-95"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ChangePassword;
