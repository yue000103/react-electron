import axiosInstance from "./axiosInstance";

export function columnEquilibration(data) {
    return axiosInstance.post("/column/equilibration",data);
}

export function stopColumnEquilibration() {
    return axiosInstance.post("/column/equilibration/stop");
}

