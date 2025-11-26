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

export function switchManualTest(data) {
    return axiosInstance.post("/status/switch_manual_test", data);
}

export function pumpOperation(data) {
    return axiosInstance.post("/status/pump_operation", data);
}

export function multiwayValveControl(data) {
    return axiosInstance.post("/status/multiway_valve_control", data);
}

export function diaphragmPumpControl(data) {
    return axiosInstance.post("/status/diaphragm_pump_control", data);
}

export function solenoidValveControl(data) {
    return axiosInstance.post("/status/solenoid_valve_control", data);
}

export function bubbleSensorStatus() {
    return axiosInstance.get("/status/bubble_sensor_status");
}
