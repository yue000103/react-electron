import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:5000/",
    timeout: 10000, // 设置请求超时时间
    headers: { "Content-Type": "application/json" }, // 设置默认请求头
});

export default axiosInstance;
