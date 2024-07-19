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
    baseURL: "http://localhost:5000/",
    // baseURL: "http://192.168.137.1:5000/",
    // baseURL: "http://192.168.124.6:5000/",
    timeout: 1000000, // 设置请求超时时间
    headers: { "Content-Type": "application/json" }, // 设置默认请求头
});

export default axiosInstance;
// import axios from "axios";
// import os from "os";

// // 获取本地IP地址的函数
// const getLocalIpAddress = () => {
//     const interfaces = os.networkInterfaces();
//     for (const name of Object.keys(interfaces)) {
//         for (const net of interfaces[name]) {
//             // 跳过内部（即127.0.0.1）和IPv6地址
//             if (net.family === "IPv4" && !net.internal) {
//                 return net.address;
//             }
//         }
//     }
//     return "127.0.0.1"; // 如果没有找到外部IP地址，返回localhost
// };

// // 设置 baseURL
// const localIp = getLocalIpAddress();
// const baseURL = `http://${localIp}:5000/`;

// const axiosInstance = axios.create({
//     baseURL: baseURL,
//     timeout: 1000000, // 设置请求超时时间
//     headers: { "Content-Type": "application/json" }, // 设置默认请求头
// });

// export default axiosInstance;
