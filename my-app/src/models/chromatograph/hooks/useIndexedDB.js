import { useEffect, useState } from "react";

const useIndexedDB = (methodId) => {
    // console.log("1023  methoodId", methodId);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!window.indexedDB) {
            setError("该浏览器不支持 IndexedDB");
            setLoading(false);
            return;
        }

        const request = indexedDB.open("MyDatabase", 1);
        console.log("1023  request", request);

        request.onsuccess = (event) => {
            const db = event.target.result;

            const transaction = db.transaction("method", "readonly");
            const objectStore = transaction.objectStore("method");

            const getRequest = objectStore.get(methodId);
            console.log("1023  getRequest", getRequest);

            getRequest.onsuccess = () => {
                const result = getRequest.result;
                if (result) {
                    setData(result); // 设置获取的数据
                    console.log("1023  result", result);
                } else {
                    console.log("1023  result");

                    setError(`未找到 methodId: ${methodId}`);
                }
                setLoading(false); // 设置加载状态为 false
            };

            getRequest.onerror = () => {
                console.log("1023  getRequest.error", getRequest.error);

                setError("读取对象时出错:" + getRequest.error);
                setLoading(false); // 设置加载状态为 false
            };
        };

        request.onerror = (event) => {
            setError("打开 IndexedDB 时出错:" + event.target.error);
            setLoading(false); // 设置加载状态为 false
        };
    }, [methodId]);

    return { data, loading, error }; // 返回数据、加载状态和错误信息
};

export default useIndexedDB;
