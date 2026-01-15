import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button, Flex, Checkbox, Tag, Empty } from "antd";
import { pauseTube, resumeTube } from "@/models/chromatograph/api/tube";
import "./taskTable.css";

// 状态映射常量
const STATUS_MAP = {
    abandon: "废弃",
    clean: "清洗",
    retain: "保留",
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

    // 使用 useMemo 优化数据源计算
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

    // 判断任务状态：仅当前运行的任务显示运行，其余视为空闲
    const getItemStatus = useCallback(
        (item) => {
            if (completedKeys.includes(item.key)) return "completed";
            const isRunning =
                excuteTaskFlag === 1 &&
                runningInfo &&
                runningInfo.moduleId === item.moduleIndex + 1 &&
                runningInfo.tubeId &&
                item.tubes.includes(runningInfo.tubeId) &&
                runningInfo.taskId !== undefined &&
                item.taskId !== undefined &&
                runningInfo.taskId === item.taskId;
            if (isRunning) return "running";
            return "normal";
        },
        [completedKeys, excuteTaskFlag, runningInfo]
    );

    // 点击任务项
    const handleItemClick = useCallback(
        (item) => {
            const status = getItemStatus(item);
            // 运行中的任务不能选中
            if (status === "running") return;

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
        // 将选中的任务标记为运行中
        setRunningKeys((prev) => [...prev, ...selectedRowKeys]);
        // 清空选中状态
        setSelectedRowKeys([]);
    }, [handleTubeAction, selectedRowKeys]);

    const deleteTubes = useCallback(() => {
        handleTubeAction("delete");
    }, [handleTubeAction]);

    const onSelectAll = useCallback(
        (e) => {
            if (e.target.checked) {
                // 只选中未运行的任务
                const availableKeys = dataSource
                    .filter((item) => !runningKeys.includes(item.key))
                    .map((item) => item.key);
                setSelectedRowKeys(availableKeys);
            } else {
                setSelectedRowKeys([]);
            }
        },
        [dataSource, runningKeys]
    );

    const hasSelected = selectedRowKeys.length > 0;
    const allSelected =
        dataSource.length > 0 &&
        dataSource.every((item) => selectedRowKeys.includes(item.key));

    // 清理已选中但不在当前数据源的 key，避免误判全选
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
                            const isSelected = selectedRowKeys.includes(
                                item.key
                            );
                            const isRunning =
                                excuteTaskFlag === 1 &&
                                runningInfo &&
                                runningInfo.moduleId === item.moduleIndex + 1 &&
                                runningInfo.tubeId &&
                                item.tubes.includes(runningInfo.tubeId) &&
                                runningInfo.taskId !== undefined &&
                                item.taskId !== undefined &&
                                runningInfo.taskId === item.taskId;

                            return (
                                <div
                                    key={item.key}
                                    className={`task-item ${status} ${
                                        isSelected ? "selected" : ""
                                    }`}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="task-checkbox">
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={status === "running"}
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
                                            {isRunning && (
                                                <Tag
                                                    color="green"
                                                    className="running-tag"
                                                >
                                                    运行中 #{runningInfo.tubeId}
                                                </Tag>
                                            )}
                                        </div>
                                        <div className="task-tubes">
                                            {item.tube_list}
                                        </div>
                                    </div>
                                    <div className="task-status-icon">
                                        {status === "completed" && (
                                            <span className="status-icon completed">
                                                ✓
                                            </span>
                                        )}
                                        {status === "running" && (
                                            <span className="status-icon running">
                                                ⏳
                                            </span>
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
