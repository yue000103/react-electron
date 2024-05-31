import axiosInstance from "./axiosInstance";

export function getEluentCurve() {
    return axiosInstance.get("/api/eluent/get_curve");
}

export function getEluentVertical() {
    return axiosInstance.get("/api/eluent/get_vertical");
}
