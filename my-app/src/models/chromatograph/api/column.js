import axiosInstance from "./axiosInstance";

export function columnEquilibration() {
    return axiosInstance.post("/column/equilibration");
}

export function stopColumnEquilibration() {
    return axiosInstance.post("/column/equilibration/stop");
}

export function purgeColumnfunction() {
    return axiosInstance.post("/column/purge/stop");
}

export function stopPurgeColumn() {
    return axiosInstance.post("/column/purge/stop");
}
