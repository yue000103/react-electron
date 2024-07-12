/*
 * @Author: LAPTOP-7F6AB2JQ\86177 zhao.xy.00@outlook.com
 * @Date: 2024-06-13 14:14:55
 * @LastEditors: LAPTOP-7F6AB2JQ\86177 zhao.xy.00@outlook.com
 * @LastEditTime: 2024-07-10 14:56:23
 * @FilePath: \react-electron\src\models\chromatograph\api\axiosInstance.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "axios";

const axiosInstance = axios.create({
    // baseURL: "http://127.0.0.1:5000/",
    baseURL: "http://192.168.124.18:5000/",
    timeout: 1000000, // 设置请求超时时间
    headers: { "Content-Type": "application/json" }, // 设置默认请求头
});

export default axiosInstance;
