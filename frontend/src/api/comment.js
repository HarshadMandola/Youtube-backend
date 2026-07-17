import api from "./axios";

export const getVideoComments = async (videoId) => {
  const res = await api.get(`users/comment/${videoId}`);
  return res.data;
};

export const addComment = async (videoId, content) => {
  const res = await api.post(`users/comment/${videoId}`, { content });
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await api.delete(`users/comment/c/${commentId}`);
  return res.data;
};