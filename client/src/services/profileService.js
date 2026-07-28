import api from "./api";

export const getOwnProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

export const updateOwnProfile = async (profileData) => {
  const response = await api.put("/profile/me", profileData);
  return response.data;
};

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/profile/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getPublicProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
