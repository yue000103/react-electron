import { useCallback } from "react";

/**
 * Hook for storing data in IndexedDB with overwrite support
 * @param {string} dbName - Database name
 * @param {string} storeName - Object store name
 * @param {string} keyPath - Key path for the object store
 * @returns {Object} Object containing store function
 */
const createDB = (dbName, storeName, keyPath) => {
    const storeData = useCallback(
        (data, id) => {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    reject(new Error("该浏览器不支持 IndexedDB"));
                    return;
                }

                const request = indexedDB.open(dbName, 1);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath });
                    }
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(storeName, "readwrite");
                    const objectStore = transaction.objectStore(storeName);

                    // 准备要存储的数据
                    const itemToStore = {
                        ...data,
                        [keyPath]: Number(id),
                    };

                    // 直接使用 put 方法覆盖已存在的数据
                    const putRequest = objectStore.put(itemToStore);

                    putRequest.onsuccess = () => {
                        resolve({
                            type: "success",
                            message: "数据存储成功",
                            data: itemToStore,
                        });
                    };

                    putRequest.onerror = () => {
                        reject(new Error(`存储数据失败: ${putRequest.error}`));
                    };
                };

                request.onerror = (event) => {
                    reject(new Error(`打开数据库失败: ${event.target.error}`));
                };
            });
        },
        [dbName, storeName, keyPath]
    );

    return { storeData };
};

export default createDB;
