import axiosInstance from "./axiosInstance";

export function getTube(data) {
    return axiosInstance.post("/tubes/get_tube", data);
}
