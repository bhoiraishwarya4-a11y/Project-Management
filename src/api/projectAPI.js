
import axiosInstance from "./axiosInstance";

export async function getAllProjects() {
  const response = await axiosInstance.get("/projects");
  return response.data;
}

export async function getProjectByID(ID) {
  const response = await axiosInstance.get(`/projects/${ID}`);
  return response.data;
}

export async function updateStatus(ID, data) {
  const response = await axiosInstance.patch(
    `/projects/${ID}`,
    data
  );

  return response.data;
}

export async function updateProject(ID, data) {
  const response = await axiosInstance.put(
    `/projects/${ID}`,
    data
  );

  return response.data;
}

export async function deleteProject(ID) {
  const response = await axiosInstance.delete(`/projects/${ID}`);
  return response.data;
}

export async function createProject(data) {
  const response = await axiosInstance.post("/projects", data);
  return response.data;
}
