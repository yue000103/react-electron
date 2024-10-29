import axiosInstance from "./axiosInstance";

export function getTube(data) {
    return axiosInstance.post("/tubes/get_tube", data);
}

export function pauseTube(data) {
    return axiosInstance.post("/tubes/pause_tube", data);
}

export function resumeTube(data) {
    return axiosInstance.post("/tubes/resume_tube", data);
}
