import { useState } from "react";
import { ImagePlus, X, Hash, Send, MapPin } from "lucide-react";

function CreatePost() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [location, setLocation] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 mt-[-20px] mb-15 md:mt-0 md:mb-0">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
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

            {!preview ? (
              <label
                htmlFor="image"
                className="flex h-50 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="mb-3 rounded-full bg-blue-100 p-4">
                  <ImagePlus
                    size={30}
                    className="text-blue-600"
                  />
                </div>

                <p className="font-medium text-gray-700">
                  Upload an image
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  PNG, JPG or WEBP
                </p>

                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl bg-black">
                <img
                  src={preview}
                  alt="Post preview"
                  className="mx-auto max-h-[500px] w-full object-contain"
                />

                {/* Remove Image */}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
                >
                  <X size={20} />
                </button>

                {/* Change Image */}
                <label
                  htmlFor="change-image"
                  className="absolute bottom-3 right-3 cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-gray-100"
                >
                  Change Image

                  <input
                    id="change-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
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
              rows={5}
              maxLength={500}
              className="w-full h-20 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                onChange={(e) =>
                  setHashtags(e.target.value)
                }
                placeholder="travel, nature, photography"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Separate hashtags with commas
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <Send size={18} />
            Create Post
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreatePost;