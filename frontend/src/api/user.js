import api from "./axios";

export const getChannelProfile = async (username) => {
  const res = await api.get(`/users/c/${username}`);
  return res.data;
};

export const registerUser = async (formData) => {
  const res = await api.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};