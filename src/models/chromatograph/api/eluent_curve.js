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

export function updateEluentLine(data) {
    return axiosInstance.post("/eluent_curve/update_line", data);
}

export function pauseEluentLine() {
    return axiosInstance.get("/eluent_curve/update_line_pause");
}

export function startEluentLine() {
    return axiosInstance.get("/eluent_curve/update_line_start");
}

export function terminateEluentLine() {
    return axiosInstance.get("/eluent_curve/update_line_terminate");
}
