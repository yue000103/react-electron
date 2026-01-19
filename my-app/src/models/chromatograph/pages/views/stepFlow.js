import io from "socket.io-client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    gradientDemo,
    gradientDemoPause,
    gradientDemoResume,
    gradientDemoStop,
} from "../../api/task_demo";

import "./stepFlow.css";

const STORAGE_KEY = "chromatograph_step_flow_state";

const loadCachedState = (steps) => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.stepStatuses)) return null;
        if (parsed.stepStatuses.length !== steps.length) return null;
        return {
            stepStatuses: parsed.stepStatuses,
            latestStatus:
                typeof parsed.latestStatus === "string"
                    ? parsed.latestStatus
                    : "",
        };
    } catch (error) {
        console.warn("读取步骤缓存失败:", error);
        return null;
    }
};

const StepFlow = ({ onDemoStart, onDemoStop }) => {
    const steps = useMemo(
        () => [
            {
                id: "equilibration",
                label: "润柱",
                startStatus: "start_equilibration",
                stopStatus: "stop_equilibration",
            },
            {
                id: "collection",
                label: "收集",
                startStatus: "start_collection",
                stopStatus: "stop_collection",
            },
            {
                id: "retain",
                label: "合并",
                startStatus: "start_retain",
                stopStatus: "stop_retain",
            },
            {
                id: "abandon",
                label: "废弃",
                startStatus: "start_abandon",
                stopStatus: "stop_abandon",
            },
            {
                id: "clean",
                label: "清洗",
                startStatus: "start_clean",
                stopStatus: "stop_clean",
            },
        ],
        []
    );

    const statusLabelMap = useMemo(
        () => ({
            start_equilibration: "润柱开始",
            stop_equilibration: "润柱结束",
            start_collection: "收集开始",
            stop_collection: "收集结束",
            start_retain: "合并开始",
            stop_retain: "合并结束",
            start_abandon: "废弃开始",
            stop_abandon: "废弃结束",
            start_clean: "清洗开始",
            stop_clean: "清洗结束",
        }),
        []
    );

    const cachedStateRef = useRef(loadCachedState(steps));

    const [stepStatuses, setStepStatuses] = useState(
        () => cachedStateRef.current?.stepStatuses || steps.map(() => "pending")
    );
    const [latestStatus, setLatestStatus] = useState(
        () => cachedStateRef.current?.latestStatus || ""
    );
    const [sending, setSending] = useState(false);
    const socketRef = useRef(null);
    const skipPersistRef = useRef(false);

    useEffect(() => {
        if (skipPersistRef.current) {
            skipPersistRef.current = false;
            return;
        }
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ stepStatuses, latestStatus })
            );
        } catch (error) {
            console.warn("保存步骤缓存失败:", error);
        }
    }, [stepStatuses, latestStatus]);

    useEffect(() => {
        const socket = io("http://localhost:5000");
        socketRef.current = socket;

        socket.on("current_status", (responseData) => {
            const status =
                typeof responseData === "string"
                    ? responseData
                    : responseData?.status;
            if (!status) return;

            if (status === "clear") {
                resetFlow();
                return;
            }

            setLatestStatus(statusLabelMap[status] || status);
            setStepStatuses((prev) => {
                const next = [...prev];

                const startIndex = steps.findIndex(
                    (step) => step.startStatus === status
                );
                if (startIndex !== -1) {
                    for (let i = 0; i < startIndex; i++) next[i] = "done";
                    next[startIndex] = "active";
                    for (let i = startIndex + 1; i < next.length; i++) {
                        if (next[i] !== "done") next[i] = "pending";
                    }
                    return next;
                }

                const stopIndex = steps.findIndex(
                    (step) => step.stopStatus === status
                );
                if (stopIndex !== -1) {
                    for (let i = 0; i <= stopIndex; i++) next[i] = "done";
                    if (stopIndex + 1 < next.length) {
                        next[stopIndex + 1] =
                            next[stopIndex + 1] === "done" ? "done" : "active";
                        for (let i = stopIndex + 2; i < next.length; i++) {
                            if (next[i] !== "done") next[i] = "pending";
                        }
                    }
                    return next;
                }

                return next;
            });
        });

        return () => socket.disconnect();
    }, [statusLabelMap, steps]);

    const resetFlow = () => {
        skipPersistRef.current = true;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn("清除步骤缓存失败:", error);
        }
        setStepStatuses(steps.map(() => "pending"));
        setLatestStatus("");
    };

    const sendControl = async (command) => {
        const map = {
            start: gradientDemo,
            pause: gradientDemoPause,
            resume: gradientDemoResume,
            stop: gradientDemoStop,
        };
        const action = map[command];
        if (!action) return;
        try {
            if (command === "start") {
                onDemoStart?.();
            }
            setSending(true);
            if (command === "start") {
                const storedMethodId = Number(localStorage.getItem("methodId"));
                const methodId = Number.isNaN(storedMethodId)
                    ? 0
                    : storedMethodId;
                await action({ method_id: methodId });
            } else {
                await action();
            }
            if (command === "stop") {
                resetFlow();
                onDemoStop?.();
            }
        } catch (error) {
            if (command === "start") {
                onDemoStop?.();
            }
            console.error("控制指令发送失败:", error);
        } finally {
            setSending(false);
        }
    };

    const connectorState = (index) => {
        const current = stepStatuses[index];
        const next = stepStatuses[index + 1];
        if (current === "done") return "active";
        if (next === "done" || next === "active") return "active";
        return "pending";
    };

    return (
        <div className="step-flow">
            <div className="step-track">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className={`step-item ${stepStatuses[index]}`}>
                            <div className="step-circle">{step.label}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`step-connector ${connectorState(
                                    index
                                )}`}
                                aria-hidden="true"
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="step-controls">
                <button
                    type="button"
                    className="primary"
                    disabled={sending}
                    onClick={() => sendControl("start")}
                >
                    开始
                </button>
                <button
                    type="button"
                    className="secondary"
                    disabled={sending}
                    onClick={() => sendControl("pause")}
                >
                    暂停
                </button>
                <button
                    type="button"
                    className="primary ghost"
                    disabled={sending}
                    onClick={() => sendControl("resume")}
                >
                    继续
                </button>
                <button
                    type="button"
                    className="danger"
                    disabled={sending}
                    onClick={() => sendControl("stop")}
                >
                    终止
                </button>
            </div>
        </div>
    );
};

export default StepFlow;
