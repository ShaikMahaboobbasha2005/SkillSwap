import api from "./api";

export const createSkill = async (skillData) => {
  const response = await api.post("/skills", skillData);
  return response.data;
};

export const getOwnSkills = async (params = {}) => {
  const response = await api.get("/skills/me", { params });
  return response.data;
};

export const getUserPublicSkills = async (userId, params = {}) => {
  const response = await api.get(`/skills/user/${userId}`, { params });
  return response.data;
};

export const updateSkill = async (skillId, skillData) => {
  const response = await api.put(`/skills/${skillId}`, skillData);
  return response.data;
};

export const deleteSkill = async (skillId) => {
  const response = await api.delete(`/skills/${skillId}`);
  return response.data;
};
