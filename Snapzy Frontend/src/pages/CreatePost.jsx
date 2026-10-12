
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, Hash, Send, MapPin } from "lucide-react";
import api from "../api/axios";

function CreatePost() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle image selection
  const handleImageChange = (e) => {

    const file = e.target.files?.[0];

    // Allow the user to cancel file selection
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      e.target.value = "";
      return;
    }

    // Validate image size: maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setMessage("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Clean up temporary image preview URLs
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setPreview(null);

    const input = document.getElementById("image");
    if (input) input.value = "";
  };

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please select an image.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("caption", caption);
      formData.append("location", location);

      if (hashtags.trim()) {
        const formattedTags = hashtags
          .split(/[,\s]+/)
          .map((tag) => tag.replace(/^#/, "").trim())
          .filter(Boolean)
          .join(" ");

        formData.append("hashtags", formattedTags);
      }

      const response = await api.post(
        "/posts/create-post",
        formData
      );

      console.log("Post created:", response.data);

      navigate("/", { replace: true });
    } catch (error) {
      console.error(
        "Create post error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
        "Failed to create post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 mt-[-20px] mb-15 md:mt-0 md:mb-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Post
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Share a photo with your followers
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          {/* Image Upload */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Image
            </label>

            {/* Always mounted, even when preview is visible */}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {!preview ? (
              <label
                htmlFor="image"
                className="flex h-50 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="mb-3 rounded-full bg-blue-100 p-4">
                  <ImagePlus size={30} className="text-blue-600" />
                </div>

                <p className="font-medium text-gray-700">
                  Upload an image
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  PNG, JPG or WEBP (max 5 MB)
                </p>
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl bg-black">
                <img
                  src={preview}
                  alt="Post preview"
                  className="mx-auto max-h-[500px] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
                  aria-label="Remove image"
                >
                  <X size={20} />
                </button>

                <label
                  htmlFor="image"
                  className="absolute bottom-3 right-3 cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-gray-100"
                >
                  Change Image
                </label>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label
              htmlFor="caption"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Caption
            </label>

            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something about your post..."
              rows={4}
              maxLength={500}
              className="h-24 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-1 text-right text-xs text-gray-400">
              {caption.length}/500
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Location
            </label>

            <div className="relative">
              <MapPin
                size={19}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-6">
            <label
              htmlFor="hashtags"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Hashtags
            </label>

            <div className="relative">
              <Hash
                size={18}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                id="hashtags"
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="travel, nature, photography"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Separate hashtags with commas
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={18} />
            {loading ? "Creating Post..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;