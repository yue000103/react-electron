import axiosInstance from "./axiosInstance";

export function getEluentCurve(data) {
    return axiosInstance.post("/eluent_curve/get_curve", data);
}

export function getEluentVertical(data) {
    return axiosInstance.post("/eluent_curve/get_vertical", data);
}

export function getEluentLine() {
    return axiosInstance.get("/eluent_curve/get_line");
}
