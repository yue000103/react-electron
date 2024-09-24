import axiosInstance from "./axiosInstance";

export function saveExperimentData(data) {
    return axiosInstance.post("/experiment/save/experiment_data", data);
}

export function executionMethod(data) {
    return axiosInstance.post("/experiment/save/execution_data", data);
}

export function getHistory() {
    return axiosInstance.get("/experiment/get/all_data");
}
