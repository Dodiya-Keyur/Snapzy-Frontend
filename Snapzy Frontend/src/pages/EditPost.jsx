import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Hash,
    LoaderCircle,
    Check,
    AlertCircle,
    Save,
    Image as ImageIcon,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function EditPost() {
    const navigate = useNavigate();
    const { postId } = useParams();
    const { user: authUser } = useAuth();

    const [post, setPost] = useState(null);
    const [caption, setCaption] = useState("");
    const [location, setLocation] = useState("");
    const [hashtags, setHashtags] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch existing post data
    useEffect(() => {
        let isMounted = true;

        const fetchPost = async () => {
            if (!postId) {
                setError("Post ID is missing");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const res = await api.get(`/posts/getpost/${postId}`);
                const postData = res.data?.post || res.data;

                if (!isMounted) return;

                if (!postData) {
                    setError("Post not found");
                    return;
                }

                // Check ownership if authUser is available
                const postAuthorId =
                    postData.user?._id || postData.user?.id || postData.user;
                if (
                    authUser &&
                    postAuthorId &&
                    authUser._id &&
                    String(postAuthorId) !== String(authUser._id) &&
                    authUser.username !== postData.user?.username
                ) {
                    setError("You are not authorized to edit this post.");
                    return;
                }

                setPost(postData);
                setCaption(postData.caption || "");
                setLocation(postData.location || "");

                // Format hashtags
                if (Array.isArray(postData.hashtags)) {
                    setHashtags(postData.hashtags.join(", "));
                } else if (typeof postData.hashtags === "string") {
                    setHashtags(postData.hashtags);
                } else {
                    setHashtags("");
                }
            } catch (err) {
                console.error("Failed to load post for editing:", err);
                if (isMounted) {
                    setError(
                        err.response?.data?.message || "Failed to load post. Please try again."
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPost();

        return () => {
            isMounted = false;
        };
    }, [postId, authUser]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!postId) return;

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            // Format hashtags array
            const formattedTags = hashtags
                .split(/[,\s]+/)
                .map((t) => t.replace(/^#/, "").trim())
                .filter(Boolean);

            const payload = {
                caption: caption.trim(),
                location: location.trim(),
                hashtags: formattedTags,
            };

            await api.patch(`/posts/update-post/${postId}`, payload);

            setSuccessMessage("Post updated successfully!");

            // Smooth redirect back to profile after brief confirmation
            setTimeout(() => {
                navigate("/profile", { replace: true });
            }, 800);
        } catch (err) {
            console.error("Failed to update post:", err);
            setError(
                err.response?.data?.message || "Failed to update post. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <LoaderCircle size={36} className="animate-spin text-blue-600 mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading post details...</p>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertCircle size={28} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Cannot Edit Post</h2>
                <p className="text-sm text-gray-500 max-w-sm mb-6">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition"
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>
            </div>
        );
    }

    const postImage = post?.image || post?.imageUrl || "";

    return (
        <div className="min-h-screen bg-gray-50/60 px-4 py-6 md:py-8">
            <div className="mx-auto max-w-2xl">
                {/* Header Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition shadow-2xs"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                Edit Post
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Make changes to your post caption, location, or hashtags
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
                        <Check size={18} className="shrink-0 text-emerald-600" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Main Card */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-gray-200/90 bg-white shadow-xs overflow-hidden"
                >
                    {/* Post Image Preview */}
                    {postImage ? (
                        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black/95 flex items-center justify-center overflow-hidden">
                            <img
                                src={postImage}
                                alt={caption || "Post preview"}
                                className="h-full w-full object-contain"
                            />
                            <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow-xs">
                                Post Photo
                            </div>
                        </div>
                    ) : (
                        <div className="h-44 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon size={36} />
                        </div>
                    )}

                    <div className="p-5 sm:p-6 space-y-5">
                        {/* Caption Field */}
                        <div>
                            <label
                                htmlFor="caption"
                                className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600"
                            >
                                Caption
                            </label>
                            <textarea
                                id="caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write something about this post..."
                                rows={4}
                                maxLength={500}
                                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                                <span>Max 500 characters</span>
                                <span>{caption.length} / 500</span>
                            </div>
                        </div>

                        {/* Location Field */}
                        <div>
                            <label
                                htmlFor="location"
                                className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600"
                            >
                                Location
                            </label>
                            <div className="relative">
                                <MapPin
                                    size={18}
                                    className="absolute left-3.5 top-3.5 text-gray-400"
                                />
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. New York, Paris, Tokyo"
                                    className="w-full rounded-2xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Hashtags Field */}
                        <div>
                            <label
                                htmlFor="hashtags"
                                className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600"
                            >
                                Hashtags
                            </label>
                            <div className="relative">
                                <Hash
                                    size={18}
                                    className="absolute left-3.5 top-3.5 text-gray-400"
                                />
                                <input
                                    id="hashtags"
                                    type="text"
                                    value={hashtags}
                                    onChange={(e) => setHashtags(e.target.value)}
                                    placeholder="ironman, marvel, superhero"
                                    className="w-full rounded-2xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-gray-400">
                                Separate tags with commas or spaces (without # symbol)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={saving}
                                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition active:scale-95 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <LoaderCircle size={16} className="animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditPost;
