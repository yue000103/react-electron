import axiosInstance from "./axiosInstance";

export function getDeviceStatus() {
    return axiosInstance.get("/status/get_device_status");
}

export function postDeviceStatus(data) {
    return axiosInstance.post("/status/get_device_status", data);
}

export function postInitDevice(data) {
    return axiosInstance.post("/status/init_device", data);
}
