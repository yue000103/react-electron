import axiosInstance from "./axiosInstance";

export function postMethodOperate(data) {
    return axiosInstance.post("/method/all/operate", data);
}

export function deleteMethodOperate(data) {
    return axiosInstance.post("/method/delete/operate", data);
}

export function setCurrentMethodOperate(data) {
    return axiosInstance.post("/method/set/current/operate", data);
}

export function updateMethodOperate(data) {
    return axiosInstance.post("/method/update/operate", data);
}

export function getAllMethodOperate() {
    return axiosInstance.get("/method/all/operate");
}

export function uploadMethodOperate() {
    return axiosInstance.get("/method/only/operate");
}

export function startEquilibration() {
    return axiosInstance.post("/method/equilibration");
}
