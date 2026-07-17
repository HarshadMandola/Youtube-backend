import api from "./axios";

export const toggleSubscription = async (channelId) => {
  const res = await api.post(`users/subscription/c/${channelId}`);
  return res.data;
};