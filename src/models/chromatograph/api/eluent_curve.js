import axiosInstance from "./axiosInstance";

export function getEluentCurve(data) {
    return axiosInstance.post("/api/eluent/get_curve", data);
}

export function getEluentVertical(data) {
    return axiosInstance.post("/api/eluent/get_vertical", data);
}

export function getEluentLine() {
    return axiosInstance.get("/api/eluent/get_line");
}
