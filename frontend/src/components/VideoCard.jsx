import { Link } from "react-router-dom";

function VideoCard({ video }) {
  return (
    <div>
      <Link to={`/watch/${video._id}`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-lg"
        />
      </Link>

      <div className="flex gap-2 mt-2">
        <Link to={`/channel/${video.owner?.username}`}>
          <img
            src={video.owner?.avatar}
            alt={video.owner?.username}
            className="w-9 h-9 rounded-full"
          />
        </Link>

        <div>
          <Link to={`/watch/${video._id}`}>
            <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
          </Link>
          <Link to={`/channel/${video.owner?.username}`} className="text-xs text-gray-500 hover:underline">
            {video.owner?.username}
          </Link>
          <p className="text-xs text-gray-500">{video.views} views</p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;