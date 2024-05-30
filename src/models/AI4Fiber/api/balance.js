import axiosInstance from "./axiosInstance";
export function addDosingTask(device_id, data) {
    return axiosInstance.post(`/balance/${device_id}/dosing_tasks`, data);
}

export function deleteDosingTask(device_id, task_index) {
    return axiosInstance.delete(`/balance/${device_id}/dosing_tasks`, {
        data: { task_index: task_index },
    });
}

export function getRecentDosingTasks(device_id, n) {
    return axiosInstance.get(`/balance/${device_id}/dosing_tasks?n=${n}`);
}

export function updateDosingTasks(device_id, data) {
    return axiosInstance.put(`/balance/${device_id}/dosing_tasks`, {
        tasks: data,
    });
}

export function createResponse(device_id, data) {
    return axiosInstance.post(`/balance/${device_id}/create_response`, data);
}

export function setDosingHeadInfo(device_id, dosing_head_id, data) {
    return axiosInstance.post(
        `/balance/${device_id}/dosing_head/${dosing_head_id}`,
        data
    );
}

export function getDosingHeadInfo(device_id, dosing_head_id) {
    return axiosInstance.get(
        `/balance/${device_id}/dosing_head/${dosing_head_id}`
    );
}
