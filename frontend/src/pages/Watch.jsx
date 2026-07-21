import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVideoById } from "../api/video";
import { getVideoComments, addComment } from "../api/comment";
import { toggleVideoLike } from "../api/like";

function Watch() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  
  

  const loadVideo = () => {
    getVideoById(videoId)
      .then((res) => {
        console.log("Videooo ",video)
        setVideo(res.data)})
      .catch((err) => setError(err.message));
  };

  const loadComments = () => {
    getVideoComments(videoId)
      .then((res) => setComments(res.data?.docs || res.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadVideo();
    loadComments();
  }, [videoId]);

  const handleLike = async () => {
    await toggleVideoLike(videoId);
    loadVideo(); // refresh like count/status
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(videoId, newComment);
    setNewComment("");
    loadComments();
  };

  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!video) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <video
        src={video.videoFile}
        controls
        className="w-full rounded-lg aspect-video bg-black"
      />
      <h1 className="text-xl font-bold mt-4">{video.title}</h1>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <p>{video.views} views</p>
        <button onClick={handleLike} className={`px-4 py-1 border rounded-full ${video.isLiked ?  "bg-gray-200" : "bg-black text-white"}`}>
          👍 Like {video.likeCount}
        </button>
      </div>

      <div className="flex items-center gap-3 mt-4 border-t pt-4">
        <img src={video.owner?.avatar} className="w-10 h-10 rounded-full" />
        <span className="font-semibold">{video.owner?.username}</span>
      </div>

      <p className="mt-4 text-sm">{video.description}</p>

      <div className="mt-8">
        <h2 className="font-semibold mb-3">Comments</h2>
        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border p-2 rounded"
          />
          <button type="submit" className="px-4 bg-black text-white rounded">
            Post
          </button>
        </form>
        {comments.map((c) => (
          <div key={c._id} className="flex gap-2 mb-3">
            <img src={c.owner?.avatar} className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-semibold">{c.owner?.username}</p>
              <p className="text-sm">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watch;