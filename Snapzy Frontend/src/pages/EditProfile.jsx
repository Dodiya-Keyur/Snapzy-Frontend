import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Camera,
  ArrowLeft,
  Check,
  LoaderCircle,
  User,
  AtSign,
  FileText,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR_URL =
  "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

const isDefaultAvatar = (avatarUrl) => {
  if (!avatarUrl) return true;
  const urlStr = String(avatarUrl).trim().toLowerCase();
  return (
    urlStr === DEFAULT_AVATAR_URL.toLowerCase() ||
    urlStr.includes("6499f89b3bd815780d60f2cbc210b2bd") ||
    urlStr.includes("default")
  );
};

function EditProfile() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form with current user data
  useEffect(() => {
    async function loadUserData() {
      try {
        setInitialLoading(true);
        let currentUser = user;

        // Fetch fresh user data directly from backend
        try {
          const res = await api.get("/users/me");
          if (res.data?.User || res.data?.user) {
            currentUser = res.data.User || res.data.user;
          }
        } catch {
          if (!currentUser && checkAuth) {
            currentUser = await checkAuth();
          }
        }

        if (currentUser) {
          setFormData({
            name: currentUser.name || currentUser.username || "",
            username: currentUser.username || "",
            bio: currentUser.bio || "",
          });
          const avatar =
            currentUser.profilePicture ||
            currentUser.avatar ||
            currentUser.profilePic ||
            DEFAULT_AVATAR_URL;
          setPhotoPreview(avatar);
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      } finally {
        setInitialLoading(false);
      }
    }

    loadUserData();
  }, [user, checkAuth]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Handle profile image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Trigger hidden file picker
  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  // Delete / reset profile picture
  const handleDeletePhoto = async () => {
    // If a local file was chosen, cancel selection and restore previous saved avatar
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const prevAvatar =
        user?.profilePicture && !isDefaultAvatar(user.profilePicture)
          ? user.profilePicture
          : DEFAULT_AVATAR_URL;
      setPhotoPreview(prevAvatar);
      return;
    }

    try {
      setUploadingPhoto(true);
      setErrorMessage("");
      await api.delete("/users/me/delete-profile-picture");
      setSelectedFile(null);
      setPhotoPreview(DEFAULT_AVATAR_URL);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (checkAuth) await checkAuth();
      setSuccessMessage("Profile picture reset to default.");
    } catch (err) {
      console.error("Failed to remove profile picture:", err);
      setSelectedFile(null);
      setPhotoPreview(DEFAULT_AVATAR_URL);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMessage("Profile picture reset to default.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      // 1. If a new image was chosen, upload profile picture first
      if (selectedFile) {
        setUploadingPhoto(true);
        const imageFormData = new FormData();
        imageFormData.append("image", selectedFile);

        await api.patch("/users/me/update-profile-picture", imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSelectedFile(null);
      }

      // 2. Update profile text details (name, username, bio)
      await api.patch("/users/me/update-profile", {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        bio: formData.bio.trim(),
      });

      // 3. Refresh user state across the entire application
      if (checkAuth) {
        await checkAuth();
      }

      setSuccessMessage("Profile updated successfully!");

      // Optional short delay before navigating back to profile
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle size={36} className="animate-spin text-gray-800" />
          <p className="text-sm text-gray-500">Loading your profile details...</p>
        </div>
      </div>
    );
  }

  const currentAvatar =
    photoPreview ||
    user?.profilePicture ||
    DEFAULT_AVATAR_URL;

  const hasCustomPhoto = selectedFile
    ? true
    : !isDefaultAvatar(currentAvatar);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-200/70 active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft size={22} strokeWidth={2.2} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Edit Profile
              </h1>
              <p className="text-xs text-gray-500 sm:text-sm">
                Customize how your profile appears to others
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-xs animate-in fade-in">
            <Check size={18} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 shadow-xs animate-in fade-in">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Card Form */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload Section */}
            <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-8 sm:flex-row sm:justify-start sm:gap-6">
              {/* Photo Avatar */}
              <div className="relative group">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-gray-100 shadow-inner sm:h-28 sm:w-28">
                  <img
                    src={currentAvatar}
                    alt={formData.username || "Profile"}
                    className="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <LoaderCircle
                        size={26}
                        className="animate-spin text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Camera Overlay Icon */}
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-md ring-2 ring-white transition hover:scale-105 active:scale-95"
                  title={hasCustomPhoto ? "Change profile picture" : "Add profile picture"}
                >
                  <Camera size={15} />
                </button>
              </div>

              {/* Photo Action Buttons */}
              <div className="mt-4 flex flex-col items-center gap-2 sm:mt-0 sm:items-start">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleChoosePhoto}
                    className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 active:scale-95"
                  >
                    {hasCustomPhoto ? "Change photo" : "Add photo"}
                  </button>

                  {hasCustomPhoto && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      disabled={uploadingPhoto}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  Recommended: Square JPG, PNG or WEBP up to 5MB
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <User size={14} className="text-gray-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                maxLength={50}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <AtSign size={14} className="text-gray-400" />
                <span>Username</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  minLength={3}
                  maxLength={30}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Unique identifier for your account (3-30 letters, numbers, or dots)
              </p>
            </div>

            {/* Bio Textarea */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="bio"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  <FileText size={14} className="text-gray-400" />
                  <span>Bio</span>
                </label>
                <span
                  className={`text-xs ${formData.bio.length > 140
                    ? "font-semibold text-amber-600"
                    : "text-gray-400"
                    }`}
                >
                  {formData.bio.length}/150
                </span>
              </div>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                maxLength={150}
                placeholder="Write a short bio about yourself..."
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || uploadingPhoto}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
