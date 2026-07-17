import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChannelProfile } from "../api/user";
import { toggleSubscription } from "../api/subscription";
import VideoCard from "../components/VideoCard";

function Channel() {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState("");

  const loadChannel = () => {
    getChannelProfile(username)
      .then((res) => {
        //console.log("Channel data:", res.data);
        setChannel(res.data)
    })
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  useEffect(() => {
    loadChannel();

  }, [username]);

  const handleSubscribe = async () => {
    await toggleSubscription(channel._id);
    loadChannel(); // refresh subscriber count + isSubscribed flag
  };

  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!channel) return <p className="p-4">Loading...</p>;

  return (
    <div>
      {/* Cover image */}
      <div className="w-full h-40 bg-gray-200">
        {channel.coverImage && (
          <img src={channel.coverImage} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile info */}
      <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
        <img
          src={channel.avatar}
          className="w-20 h-20 rounded-full -mt-10 border-4 border-white"
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold">{channel.fullName}</h1>
          <p className="text-gray-500 text-sm">@{channel.username}</p>
          <p className="text-gray-500 text-sm">
            {channel.SubscribersCount} subscribers · {channel.channelsSubscribedToCount} subscribed
          </p>
        </div>
        <button
          onClick={handleSubscribe}
          className={`px-4 py-2 rounded-full font-semibold ${
            channel.isSubscribed ? "bg-gray-200" : "bg-black text-white"
          }`}
        >
          {channel.isSubscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      {/* Channel's videos */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {channel.videos?.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

export default Channel;