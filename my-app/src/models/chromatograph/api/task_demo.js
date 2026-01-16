import axiosInstance from "./axiosInstance";

export function gradientDemo(data) {
    return axiosInstance.post("/task/gradient_demo", data);
}

export function gradientDemoStop() {
    return axiosInstance.post("/task/gradient_demo/stop");
}

export function gradientDemoPause() {
    return axiosInstance.post("/task/gradient_demo/pause");
}

export function gradientDemoResume() {
    return axiosInstance.post("/task/gradient_demo/resume");
}
