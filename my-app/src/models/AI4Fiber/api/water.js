import axiosInstance from "./axiosInstance";

export function startWaterAnalyzer(data) {
    return axiosInstance.post("/waterAnalyer/start", data);
}

export function stopWaterAnalyzer() {
    return axiosInstance.post("/waterAnalyer/stop");
}

export function reportWaterAnalyzerResult() {
    return axiosInstance.post("/waterAnalyer/report_result");
}

export function reportWaterAnalyzer() {
    return axiosInstance.post("/waterAnalyer/report");
}
