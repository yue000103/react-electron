import axiosInstance from "./axiosInstance";
export function setStirrerSpeed(data) {
    return axiosInstance.put("/stirrer/speed", data);
}

export function getStirrerSpeed() {
    return axiosInstance.get("/stirrer/speed");
}

export function toggleStirrerSwitch(data) {
    return axiosInstance.put("/stirrer/switch", data);
}

export function getStirrerSwitchStatus() {
    return axiosInstance.get("/stirrer/switch");
}
