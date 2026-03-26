import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button, Flex, Checkbox, Tag, Empty } from "antd";
import { pauseTube, resumeTube } from "@/models/chromatograph/api/tube";
import "./taskTable.css";

// 状态映射常量
const STATUS_MAP = {
    abandon: "废弃",
    clean: "清洗",
    retain: "保留",
};

// 四态定义
const TASK_STATE = {
    RUNNING: "running",       // 执行中
    PENDING: "pending",       // 待执行
    COMPLETED: "completed",   // 已完毕
    NORMAL: "normal",         // 默认
};

const STATE_LABEL = {
    [TASK_STATE.RUNNING]: "执行中",
    [TASK_STATE.PENDING]: "待执行",
    [TASK_STATE.COMPLETED]: "已执行",
    [TASK_STATE.NORMAL]: "",
};

const STATE_COLOR = {
    [TASK_STATE.RUNNING]: "green",
    [TASK_STATE.PENDING]: "blue",
    [TASK_STATE.COMPLETED]: "default",
    [TASK_STATE.NORMAL]: undefined,
};

const TaskTable = (props) => {
    const {
        callback,
        selectedAllTubes,
        runningInfo,
        buttonFlag,
        excuteTaskFlag,
    } = props;

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [runningKeys, setRunningKeys] = useState([]);
    const [completedKeys, setCompletedKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const prevRunningTaskIdRef = useRef(null);

    // 数据源
    const dataSource = useMemo(() => {
        return selectedAllTubes
            .filter((tube) => !isNaN(tube.module_index))
            .map((tube, i) => {
                const tubes = tube.tube_index_list.map((index) => index + 1);
                return {
                    key: i,
                    status: STATUS_MAP[tube.status] || tube.status,
                    tube_list: `${tube.module_index + 1} - ${tubes.join(", ")}`,
                    moduleIndex: tube.module_index,
                    tubes: tubes,
                    taskId: tube.task_id ?? tube.taskId,
                };
            });
    }, [selectedAllTubes]);

    // 自动检测任务完成：当 runningInfo.taskId 变化时，将前一个 running 任务标记为 completed
    useEffect(() => {
        const currentTaskId = runningInfo?.taskId;
        const prevTaskId = prevRunningTaskIdRef.current;

        if (prevTaskId !== undefined && prevTaskId !== null && prevTaskId !== currentTaskId) {
            // 前一个 running 任务不再是当前任务 → 标记为已完毕
            const prevItem = dataSource.find((item) => item.taskId === prevTaskId);
            if (prevItem && !completedKeys.includes(prevItem.key)) {
                setCompletedKeys((prev) => [...prev, prevItem.key]);
            }
        }

        prevRunningTaskIdRef.current = currentTaskId;
    }, [runningInfo?.taskId, dataSource]);

    // 当 excuteTaskFlag 变为 0 (device_free) 时，将当前 running 任务标记完成
    useEffect(() => {
        if (excuteTaskFlag === 0 && runningInfo?.taskId !== undefined) {
            const item = dataSource.find((d) => d.taskId === runningInfo.taskId);
            if (item && !completedKeys.includes(item.key)) {
                setCompletedKeys((prev) => [...prev, item.key]);
            }
        }
    }, [excuteTaskFlag]);

    // 四态状态机
    const getItemStatus = useCallback(
        (item) => {
            // 1. 已完毕
            if (completedKeys.includes(item.key)) {
                return TASK_STATE.COMPLETED;
            }

            // 2. 执行中：匹配当前 runningInfo 的 taskId
            if (
                runningInfo &&
                item.taskId !== undefined &&
                runningInfo.taskId !== undefined &&
                runningInfo.taskId === item.taskId
            ) {
                return TASK_STATE.RUNNING;
            }

            // 3. 待执行：有 taskId（已提交运行）但不是当前执行
            if (item.taskId !== undefined && item.taskId !== null && runningKeys.includes(item.key)) {
                return TASK_STATE.PENDING;
            }

            // 4. 默认
            return TASK_STATE.NORMAL;
        },
        [completedKeys, runningInfo, runningKeys]
    );

    // 点击任务项
    const handleItemClick = useCallback(
        (item) => {
            const status = getItemStatus(item);
            // 执行中和已完毕的任务不能选中
            if (status === TASK_STATE.RUNNING || status === TASK_STATE.COMPLETED) return;

            setSelectedRowKeys((prev) => {
                if (prev.includes(item.key)) {
                    return prev.filter((k) => k !== item.key);
                } else {
                    return [...prev, item.key];
                }
            });
        },
        [getItemStatus]
    );

    // 提取公共的处理逻辑
    const handleTubeAction = useCallback(
        (flag) => {
            const result = selectedRowKeys.map((key) => ({
                flag,
                index: key,
            }));
            callback(result);
        },
        [selectedRowKeys, callback]
    );

    const runTubes = useCallback(() => {
        handleTubeAction("run");
        // 将选中的任务标记为待执行
        setRunningKeys((prev) => [...prev, ...selectedRowKeys]);
        setSelectedRowKeys([]);
    }, [handleTubeAction, selectedRowKeys]);

    const deleteTubes = useCallback(() => {
        handleTubeAction("delete");
    }, [handleTubeAction]);

    const onSelectAll = useCallback(
        (e) => {
            if (e.target.checked) {
                // 只选中 normal 和 pending 状态的任务
                const availableKeys = dataSource
                    .filter((item) => {
                        const s = getItemStatus(item);
                        return s === TASK_STATE.NORMAL || s === TASK_STATE.PENDING;
                    })
                    .map((item) => item.key);
                setSelectedRowKeys(availableKeys);
            } else {
                setSelectedRowKeys([]);
            }
        },
        [dataSource, getItemStatus]
    );

    const hasSelected = selectedRowKeys.length > 0;
    const allSelected =
        dataSource.length > 0 &&
        dataSource
            .filter((item) => {
                const s = getItemStatus(item);
                return s !== TASK_STATE.RUNNING && s !== TASK_STATE.COMPLETED;
            })
            .every((item) => selectedRowKeys.includes(item.key));

    // 清理已选中但不在当前数据源的 key
    useEffect(() => {
        setSelectedRowKeys((prev) =>
            prev.filter((k) => dataSource.some((item) => item.key === k))
        );
    }, [dataSource]);

    const pause = useCallback(() => {
        setLoading(true);
        pauseTube()
            .then((res) => {
                if (!res.error) {
                    // 处理成功逻辑
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="task-table-container">
            {dataSource.length > 0 ? (
                <>
                    <div className="task-list">
                        {dataSource.map((item) => {
                            const status = getItemStatus(item);
                            const isSelected = selectedRowKeys.includes(item.key);
                            const isDisabled = status === TASK_STATE.RUNNING || status === TASK_STATE.COMPLETED;

                            return (
                                <div
                                    key={item.key}
                                    className={`task-item ${status} ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="task-checkbox">
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleItemClick(item);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="task-content">
                                        <div className="task-status">
                                            <span className="status-text">
                                                {item.status}
                                            </span>
                                            {STATE_LABEL[status] && (
                                                <Tag
                                                    color={STATE_COLOR[status]}
                                                    className={`status-tag status-tag--${status}`}
                                                >
                                                    {STATE_LABEL[status]}
                                                    {status === TASK_STATE.RUNNING && runningInfo?.tubeId
                                                        ? ` #${runningInfo.tubeId}`
                                                        : ""}
                                                </Tag>
                                            )}
                                        </div>
                                        <div className="task-tubes">
                                            {item.tube_list}
                                        </div>
                                    </div>
                                    <div className="task-status-icon">
                                        {status === TASK_STATE.COMPLETED && (
                                            <span className="status-icon completed">✓</span>
                                        )}
                                        {status === TASK_STATE.RUNNING && (
                                            <span className="status-icon running">⏳</span>
                                        )}
                                        {status === TASK_STATE.PENDING && (
                                            <span className="status-icon pending">⏸</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {buttonFlag === 1 && (
                        <div className="task-actions">
                            <div className="action-left">
                                <Checkbox
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    disabled={dataSource.length === 0}
                                >
                                    全选
                                </Checkbox>
                            </div>
                            <div className="action-buttons">
                                <Button
                                    type="primary"
                                    onClick={runTubes}
                                    disabled={!hasSelected}
                                    loading={loading}
                                >
                                    运行
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={deleteTubes}
                                    disabled={!hasSelected}
                                    loading={loading}
                                    danger
                                >
                                    删除
                                </Button>
                                <Button
                                    type="default"
                                    onClick={pause}
                                    loading={loading}
                                >
                                    终止
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{ height: 100 }}
                    description="暂无试管"
                />
            )}
        </div>
    );
};

export default TaskTable;
