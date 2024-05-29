import axiosInstance from "./axiosInstance";

export function getUsers() {
    return axiosInstance.get("/zhao");
}

export function createUser(data) {
    return axiosInstance.post("/zhao", data);
}
