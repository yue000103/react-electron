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

export function initLine(data) {
    return axiosInstance.post("/eluent_curve/init", data);
}

export function UpdateModuleListAPI(data) {
    return axiosInstance.post("/eluent_curve/update_module_list", data);
}

export function UpdateCleanListAPI(data) {
    return axiosInstance.post("/eluent_curve/update_clean_list", data);
}

export function SetSampleStatusAPI() {
    return axiosInstance.post("/eluent_curve/set_sample_valve");
}

export function SetManualHoldAPI(data) {
    return axiosInstance.post("/eluent_curve/set_manual_hold", data);
}

export function UpdateLinePointAPI(data) {
    return axiosInstance.post("/eluent_curve/update_line_point", data);
}

export function SetManualCutTubeAPI() {
  return axiosInstance.post("/eluent_curve/set_manual_cut_tube");
}


export function wasteMode(data) {
  return axiosInstance.post("/eluent_curve/waste_mode", data);
}

export function getDetectedPeaks() {
  return axiosInstance.post("/eluent_curve/get_detected_peaks");
}