/*
 * @Author: LAPTOP-7F6AB2JQ\86177 zhao.xy.00@outlook.com
 * @Date: 2024-08-23 14:24:01
 * @LastEditors: LAPTOP-7F6AB2JQ\86177 zhao.xy.00@outlook.com
 * @LastEditTime: 2024-09-06 18:44:46
 * @FilePath: \react-electron\src\models\chromatograph\api\methods.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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


export function uploadMethodFlag() {
    return axiosInstance.post("/method/upload/flag");
}
