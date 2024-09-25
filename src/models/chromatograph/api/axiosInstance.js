/*
 * @Author: LAPTOP-7F6AB2JQ\86177 zhao.xy.00@outlook.com
 * @Date: 2024-07-19 17:19:03
 * @LastEditors: LAPTOP-7F6AB2JQ\86177 zhao.xy.00@outlook.com
 * @LastEditTime: 2024-09-25 21:24:35
 * @FilePath: \react-electron\src\models\chromatograph\api\axiosInstance.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/",
    headers: { "Content-Type": "application/json" },
});

// 请求拦截器（可以用于添加 token 等）
axiosInstance.interceptors.request.use(
    (config) => {
        // 在请求发送前执行，比如添加鉴权 token
        return config;
    },
    (error) => {
        // 处理请求错误
        return Promise.reject(error);
    }
);

// 响应拦截器（处理全局错误）
axiosInstance.interceptors.response.use(
    (response) => {
        // 处理响应数据
        return response;
    },
    (error) => {
        // 处理全局响应错误
        if (error.response) {
            console.error("服务器返回错误:", error.response.status);
        } else if (error.request) {
            console.error("请求发出但未收到响应:", error.request);
        } else {
            console.error("请求设置时出错:", error.message);
        }

        // 统一处理错误，防止全屏错误提示
        // alert("请求出错，请稍后重试！");
        return Promise.reject(error);
    }
);

export default axiosInstance;
