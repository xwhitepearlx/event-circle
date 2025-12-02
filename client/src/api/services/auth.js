import api from "../axios"

export const loginUser = (payload) =>
  api.post("/users/login", payload);

export const registerUser = (payload) =>
  api.post("/users/register", payload);