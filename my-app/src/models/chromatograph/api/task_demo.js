import axiosInstance from "./axiosInstance";

export function gradientDemo() {
    return axiosInstance.post("/task/gradient_demo");
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
