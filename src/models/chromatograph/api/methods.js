import axiosInstance from "./axiosInstance";

export function postMethodOperate(data) {
    return axiosInstance.post("/method/all/operate", data);
}

export function getAllMethodOperate() {
    return axiosInstance.get("/method/all/operate");
}

export function uploadMethod() {
    return axiosInstance.get("/method/only/operate");
}

export function startEquilibration() {
    return axiosInstance.post("/method/equilibration");
}
