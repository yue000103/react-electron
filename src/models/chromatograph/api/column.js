import axiosInstance from "./axiosInstance";

export function columnEquilibration() {
    return axiosInstance.post("/column/equilibration");
}

export function stopColumnEquilibration() {
    return axiosInstance.post("/column/equilibration/stop");
}

