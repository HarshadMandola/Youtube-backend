import api from "./axios";

export const getAllVideos = async (params = {}) => {
  const res = await api.get("/users/video/get-all-videos", { params });
  return res.data.data ; // your backend likely wraps this in { statusCode, data, message, success }
};

export const getVideoById = async (videoId) => {
  const res = await api.get(`/users/video/${videoId}`);
  return res.data;
};

export const publishVideo = async (formData, onUploadProgress) => {
  const res = await api.post("/users/video/publish-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return res.data;
};

export const togglePublishStatus = async (videoId) => {
  const res = await api.patch(`/users/video/toggle/publish/${videoId}`);
  return res.data;
};

export const deleteVideo = async (videoId) => {
  const res = await api.delete(`/users/video/${videoId}`);
  return res.data;
};