import axiosInstance from "./axiosInstance";
export function getCarbon(data) {
    return axiosInstance.post("/carbon/get", data);
}

export function putCarbonBack(data) {
    return axiosInstance.post("/carbon/put", data);
}
