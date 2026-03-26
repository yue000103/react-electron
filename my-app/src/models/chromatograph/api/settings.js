import axiosInstance from "./axiosInstance";

// ===== 原液定义 =====

export function getStockSolutions() {
    return axiosInstance.get("/settings/stock_solution/list");
}

export function addStockSolution(data) {
    return axiosInstance.post("/settings/stock_solution/update", data);
}

/**
 * 批量更新原液名称
 * @param {Array} solutions - [{ label: "A", name: "..." }, { label: "B", name: "..." }]
 */
export function updateStockSolution(solutions) {
    return axiosInstance.post("/settings/stock_solution/update", {
        stock_solutions: solutions,
    });
}

export function deleteStockSolution(data) {
    return axiosInstance.post("/settings/stock_solution/delete", data);
}

// ===== 耗材规格（收集瓶） =====

export function getCollectionBottles() {
    return axiosInstance.get("/settings/collection_bottle/list");
}

export function addCollectionBottle(data) {
    return axiosInstance.post("/settings/collection_bottle/update", data);
}

export function updateCollectionBottle(data) {
    return axiosInstance.post("/settings/collection_bottle/update", data);
}

export function deleteCollectionBottle(data) {
    return axiosInstance.post("/settings/collection_bottle/delete", data);
}
