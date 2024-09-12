import React, { useState, useEffect } from "react";
import {
    LoadingOutlined,
    SmileOutlined,
    SolutionOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Steps, Row, Col } from "antd";
import StatusIcon from "@components/icons/StatusIcon"; // 确保路径正确
import "./taskSteps.css";

const TaskSteps = (props) => {
    const { excuted_tubes } = props;

    const [stepsItems, setStepsItems] = useState([]);

    const generateSteps = (task) => {
        let taskSteps = [];
        task.tube_list.forEach((tubeId) => {
            let stepStatus = "wait";
            let iconColor = "#ccc"; // 灰色
            console.log(
                "0911  task.currentTubeId === tubeId :",
                task.currentTubeId === tubeId
            );
            if (task.flag === 1) {
                stepStatus =
                    tubeId < task.currentTubeId
                        ? "finish"
                        : tubeId === task.currentTubeId
                        ? "process"
                        : "await";
                iconColor = tubeId < task.currentTubeId ? "#ccc" : "#1890ff";
            } else if (task.flag === 0) {
                stepStatus = "finish";
                iconColor = "#ccc"; // 灰色
            }
            console.log("0911      stepStatus :", stepStatus);

            console.log("0911    iconColor:", iconColor);
            taskSteps.push({
                // title: `Tube ${tubeId}`,
                status: stepStatus,
                icon: (
                    <StatusIcon
                        status={stepStatus}
                        color={iconColor}
                        tubeId={tubeId}
                        className={"steps-item"}
                    />
                ),
            });
            console.log("0911   taskSteps :", taskSteps);
        });
        return taskSteps;
    };
    useEffect(() => {
        console.log("0911  1   excuted_tubes", excuted_tubes);
        if (excuted_tubes.length > 0) {
            const newStepsItems = generateSteps(excuted_tubes[0]);
            setStepsItems(newStepsItems);
        }
    }, [excuted_tubes]);
    return (
        <div className="task">
            {excuted_tubes.map((task, index) => {
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
                    <div className="task">
                        <Row>
                            <Col span={4}>{statusText}</Col>
                            <Col span={20}>
                                <div class="steps-container">
                                    <Steps
                                        size="small"
                                        key={index}
                                        items={generateSteps(task)}
                                        className="steps-container"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskSteps;
