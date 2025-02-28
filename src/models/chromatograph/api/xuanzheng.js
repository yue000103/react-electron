import axiosInstance from "./axiosInstance";

export function postStartRotary() {
    return axiosInstance.post("/rotary/start_rotary");
}
