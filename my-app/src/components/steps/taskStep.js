import React, { useState, useEffect } from "react";
import "./taskStep.css";
const TubeProgressBar = ({ excuted_tubes }) => {
    console.log("0913 ------------ TubeProgressBar", excuted_tubes);

    const [currentSteps, setCurrentSteps] = useState(
        excuted_tubes.map((task) => task.currentTubeId || undefined)
    );

    const getStepColor = (taskIndex, tubeId) => {
        const task = excuted_tubes[taskIndex];
        if (task.flag === -1) {
            return "white";
        } else if (task.flag === 1 && tubeId === currentSteps[taskIndex]) {
            return { backgroundColor: "#1677ff", className: "wave" };
        } else if (task.flag === 1 && tubeId < currentSteps[taskIndex]) {
            return "#99c7a6";
        } else if (task.flag === 0) {
            return "#d9d9d9";
        } else {
            return "white";
        }
    };

    const getStepTextColor = (taskIndex, tubeId) => {
        const task = excuted_tubes[taskIndex];
        if (task.flag === -1) {
            return "black";
        } else if (task.flag === 1 && tubeId === currentSteps[taskIndex]) {
            return "black";
        } else if (task.flag === 1 && tubeId < currentSteps[taskIndex]) {
            return "white";
        } else {
            return "black";
        }
    };
    const getStepBorderColor = (taskIndex, tubeId) => {
        const task = excuted_tubes[taskIndex];

        if (task.flag === 0) {
            return "#d9d9d9";
        } else if (task.flag === 1 && tubeId < currentSteps[taskIndex]) {
            return "#d9d9d9";
        } else {
            return "#bd2a2a";
        }
    };

    useEffect(() => {
        setCurrentSteps(
            excuted_tubes.map((task) => task.currentTubeId || undefined)
        );
    }, [excuted_tubes]);

    return (
        <div className="step-content">
            {excuted_tubes.map((task, taskIndex) => {
                let statusText;
                if (task.status === "clean") {
                    statusText = "清洗：";
                } else if (task.status === "abandon") {
                    statusText = "废弃：";
                } else if (task.status === "retain") {
                    statusText = "保留：";
                } else {
                    statusText = task.status;
                }

                return (
                    <div>
                        {" "}
                        <div
                            style={{
                                textAlign: "left",
                                marginTop: "-12px",
                                zIndex: 99,
                                position: "absolute",
                            }}
                        >
                            {statusText}
                        </div>
                        <div
                            key={taskIndex}
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                marginTop: "1rem",
                            }}
                        >
                            {task.tube_list.map((tubeId) => {
                                const stepStyle = getStepColor(
                                    taskIndex,
                                    tubeId
                                );
                                return (
                                    <div
                                        className={
                                            typeof stepStyle === "object"
                                                ? stepStyle.className
                                                : "tube-list-container"
                                        }
                                        key={`${taskIndex}-${tubeId}`}
                                        style={{
                                            backgroundColor:
                                                typeof stepStyle === "object"
                                                    ? stepStyle.backgroundColor
                                                    : stepStyle,
                                            color: getStepTextColor(
                                                taskIndex,
                                                tubeId
                                            ),
                                            borderColor: getStepBorderColor(
                                                taskIndex,
                                                tubeId
                                            ),
                                        }}
                                    >
                                        {task.flag === 1 &&
                                            tubeId ===
                                                currentSteps[taskIndex] && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        zIndex: 99,
                                                        width: "1.8rem",
                                                        height: "1.4rem",
                                                    }}
                                                >
                                                    {tubeId}
                                                </div>
                                            )}
                                        {task.flag !== 1 ||
                                        tubeId !== currentSteps[taskIndex]
                                            ? tubeId
                                            : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TubeProgressBar;
