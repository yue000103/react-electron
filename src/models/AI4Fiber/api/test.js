import axiosInstance from "./axiosInstance";

export function reportResult() {
    return axiosInstance.post("/waterAnalyer/report_result");
}

export function report() {
    return axiosInstance.post("/waterAnalyer/report");
}
