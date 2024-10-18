import axiosInstance from "./axiosInstance";

export function getDeviceStatus() {
    return axiosInstance.get("/status/get_device_status");
}

export function postDeviceStatus(data) {
    return axiosInstance.post("/status/get_device_status", data);
}

export function postInitDeviceMode(data) {
    return axiosInstance.post("/status/init_device", data);
}

export function getInitDeviceMode() {
    return axiosInstance.get("/status/init_device");
}

export function getCodes() {
    return axiosInstance.get("/status/get_codes");
}

export function getAllTubes() {
    return axiosInstance.get("/status/get_all_tubes");
}
