import axiosInstance from "./axiosInstance";
export function addLiquid(data) {
    return axiosInstance.post("/liquid/add", data);
}

export function transferLiquid(data) {
    return axiosInstance.post("/liquid/transfer", data);
}

export function operatePump(data) {
    return axiosInstance.post("/liquid/pump", data);
}

export function initializePump(pump_id) {
    return axiosInstance.post(`/liquid/pump/initialize/${pump_id}`);
}
