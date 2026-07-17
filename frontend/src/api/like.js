import api from "./axios";

export const toggleVideoLike = async (videoId) => {
  const res = await api.post(`users/like/toggle/v/${videoId}`);
  return res.data;
};

export const toggleCommentLike = async (commentId) => {
  const res = await api.post(`users/like/toggle/c/${commentId}`);
  return res.data;
};