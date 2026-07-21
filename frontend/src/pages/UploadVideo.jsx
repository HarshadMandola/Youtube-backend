import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishVideo } from "../api/video";

function UploadVideo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!videoFile || !thumbnailFile) {
      setError("Please select both a video file and a thumbnail.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", videoFile);
    formData.append("thumbnailFile", thumbnailFile);

    try {
      setUploading(true);
      const res = await publishVideo(formData, (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percent);
      });
      navigate(`/watch/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10 space-y-4 p-4">
      <h1 className="text-2xl font-bold">Upload Video</h1>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
        rows={4}
        required
      />

      <div>
        <label className="block text-sm font-medium mb-1">Video file</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          className="w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
          className="w-full"
          required
        />
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-black h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
      >
        {uploading ? `Uploading... ${progress}%` : "Upload Video"}
      </button>
    </form>
  );
}

export default UploadVideo;