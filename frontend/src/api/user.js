import api from "./axios";

export const getChannelProfile = async (username) => {
  const res = await api.get(`/users/c/${username}`);
  return res.data;
};