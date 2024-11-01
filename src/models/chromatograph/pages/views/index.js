import React, { useState, useEffect } from "react";
import {
    Flex,
    Layout,
    Button,
    Row,
    Col,
    Alert,
    message,
    Divider,
    Spin,
    List,
    Modal,
    Checkbox,
    Form,
    InputNumber,
    Input,
} from "antd";
import "./index.css";
import Line from "@components/d3/line";
import Buttons from "./buttonTube";
import TaskList from "@components/taskList/index";
import FloatB from "../systemSet/index";
import TaskTable from "./taskTable";
import TaskStep from "@components/steps/taskStep";
import DynamicCard from "@components/cards/dynamicCard";

import { Empty } from "antd";
import {
    getEluentCurve,
    getEluentVertical,
    getEluentLine,
    updateEluentLine,
    pauseEluentLine,
    startEluentLine,
    terminateEluentLine,
    initLine,
    UpdateModuleListAPI,
} from "../../api/eluent_curve";
import {
    startEquilibration,
    setCurrentMethodOperate,
    uploadMethodOperate,
} from "../../api/methods";

import { saveExperimentData, executionMethod } from "../../api/experiment";

import { uploadMethodFlag } from "../../api/methods";
import { timeout } from "d3";
import moment from "moment";
import { getTube } from "@/models/chromatograph/api/tube";

import io from "socket.io-client";
import useIndexedDB from "../../hooks/useIndexedDB";

const { Header, Sider, Content } = Layout;

let num = [
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 1 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 2 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 3 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 4 },
];

let data = [
    // { time: "17:46:47", value: 81.41712213857508 },
    // { time: "17:48:37", value: 88.51848125394666 },
    // { time: "17:48:40", value: 88.51848125394666 },
    // { time: "17:48:60", value: 20.51848125394666 },
];
let excutedTubesUpdateFlag = false;

let linePoint = [];
const tube_list = [];
const colorMap = {
    0: "Zero",
    1: "One",
    2: "One",
    3: "One",
    4: "One",
    5: "One",
    6: "One",
    7: "One",
    8: "One",
    9: "One",
};
let colorNum = 0;
let selected_tube = []; // 接收到的试管列表
let selected_tubes = []; //总的是试管列表
let excuted_tubes = []; //执行的试管列表
let excute_status = 0;
// let selected_reverse = [];
let intervalId1;
let intervalId2;
let startTime;
let flagStartTime = 1; //  1 实验从头开始  0 实验继续
let newPoints = [];
let counter = 0;
let selectTubeTransfer = [];

const App = () => {
    const [loading, setLoading] = React.useState(false);
    const [lineLoading, setLineLoading] = useState(false);

    const [data, setData] = useState([]);
    const [num, setNum] = useState([]);
    const [groupsOrigin, setGroupsOrigin] = useState([]);

    const [selectedAllTubes, setSelectedAllTubes] = useState([]);
    const [selectedTask, setSelectedTask] = useState([]);
    //反转标志，当0时，没有反转，当1时，已反选。

    const [reverseFlag, setReverseFlag] = useState(0);
    //清洗标志，当0时，所有试管禁用，当1时，所有试管可以选择。
    const [clean_flag, setCleanFlag] = useState(0);
    //方法，当0时，所有按钮禁用，当1时，所有按钮可以正常使用。
    const [methodFlag, setMethodFlag] = useState(0);
    //  1 可以修改折线 0 不可以修改折线
    const [lineFlag, setLineFlag] = useState(1);
    const [selected_reverse, setSelectedReverse] = useState([]);
    const isScrollable = true;

    const [linePoint, setLine] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const [warningCode, setWarningCode] = useState({ code: 0, time: "" });
    const [errorCodes, setErrorCode] = useState([]);

    const [samplingTime, setSamplingTime] = useState(10);

    const [uploadFlag, setUploadFlag] = useState(0);
    const [equilibrationFlag, setEquilibrationFlag] = useState(0);

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [currentMethod, setCurrentMethod] = useState({});
    const [excutedTubes, setExcutedTubes] = useState([]);
    // const [taskId, setTaskId] = useState();
    let taskId = -1;
    const [currentTubeId, setCurrentTubeId] = useState();
    const [currentTube, setCurrentTube] = useState({
        time_start: "",
        time_end: "",
        module_index: -1,
        tube_index: -1,
    });
    const [currentTaskId, setCurrentTaskId] = useState();
    const [excuteTaskFlag, setExcuteTaskFlag] = useState();

    const [openStart, setOpenStart] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [minTubeId, setMinTubeId] = useState(1); // 默认最小值
    const [maxTubeId, setMaxTubeId] = useState(10); // 默认最大值
    const [minModuleId, setMinModuleId] = useState(1); // 默认最小值
    const [maxModuleId, setMaxModuleId] = useState(10); // 默认最大值
    const [inputTubeId, setInputTubeId] = useState(minTubeId); // 默认值为 minTubeId
    const [inputModuleId, setInputModuleId] = useState(minModuleId);

    const [openReset, setOpenReset] = useState(false);

    const handleInputNumberChange = (value) => {
        setInputTubeId(value);
    };
    const [form] = Form.useForm(); // 获取表单实例

    const [spinning, setSpinning] = React.useState(false);

    const generateTaskId = () => {
        const timestamp = new Date().getTime();
        counter++;
        return `${timestamp}${counter}`;
    };

    useEffect(() => {
        const socket = io("http://localhost:5000"); // 确保 URL 正确
        socket.on("connect", () => {
            // console.log("Connected to WebSocket server");
        });

        socket.on("new_point", (data) => {
            console.log("1017   new_point", data);
            setNum((prevNum) => [...prevNum, data.point]);
        });

        socket.on("new_curve_point", (responseData) => {
            console.log("9090   responseData", responseData);
            // if (responseData.point["value"] == 0) {
            //     // messageApi.open({
            //     //     type: "error",
            //     //     content: "检测器异常！暂停实验",
            //     // });
            //     // pause()
            //     // setLoading(false);
            //     // flagStartTime = 1;
            //     terminate();
            // } else {
            setData((prevData) => [...prevData, responseData.point]);
            // }
        });
        socket.on("warning", (responseData) => {
            setWarningCode({
                code: responseData.code,
                time: responseData.time,
            });
            console.log("warningCode :", warningCode);
            setErrorCode((pre) => [...pre, responseData.code]);
            terminate();
        });
        socket.on("current_tube", (responseData) => {
            console.log(
                "0911   current_tube---------------------",
                responseData.tube_id,
                responseData.task_id
            );
            setCurrentTubeId(responseData.tube_id);
            setCurrentTaskId(responseData.task_id);
            // updateExcuteTask(responseData.tube_id,responseData.task_id);
        });
        socket.on("device_free", (responseData) => {
            console.log(
                "0911   device_free---------------------",
                responseData
            );
            setExcuteTaskFlag(responseData.flag);
            setCurrentTaskId(responseData.task_id);
            excute_status = responseData.flag;
            // updateExcuteTask(currentTubeId, responseData.task_id);
        });
        socket.on("equilibration_flag", (responseData) => {
            if (responseData.flag === 1) {
                clearData();
                flagStartTime = 0;
            }
        });
        socket.on("module_flag", (responseData) => {
            console.log("1017   responseData :", responseData);
        });
        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });

        // Clean up the connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);
    useEffect(() => {
        excutedTubesUpdateFlag = true;
        updateExcuteTask(currentTubeId, currentTaskId);

        console.log("0913 -------8------ excutedTubes", excutedTubes);
    }, [currentTubeId, currentTaskId, excuteTaskFlag]);
    const handleReceiveFlags = (select_tubes, groupsOrigin) => {
        console.log("0926  Receive select_tubes", select_tubes);
        console.log("0926-2  Receive groupsOrigin", groupsOrigin);

        selected_tube = select_tubes;
        if (groupsOrigin?.length === 0) {
            setGroupsOrigin((prevNum) => {
                return groupsOrigin;
            });
        }

        // setNum(numss);
    };
    // 把梯度曲线的value值转换成数字
    const convertNonNumericValues = (data) => {
        const updatedData = { ...data };

        Object.keys(updatedData).forEach((key) => {
            const entry = updatedData[key];
            console.log("entry :", entry);
            if (typeof entry.value === "string") {
                entry.value = Number(entry.value);
            }
        });

        return updatedData;
    };

    const handleUpdatePoint = (linePointChange) => {
        console.log(
            "-------------------------------------------------linePointChange",
            linePointChange
        );
        newPoints = convertNonNumericValues(linePointChange);
        console.log("linePointChange  newPoints :", newPoints);
        // newPoints = linePointChange;
    };

    // flag  ： undefined  没被选中   true  保留  false  废弃
    const process_data_flag = (selected_tube, flag, color) => {
        console.log("0926   groupedData   selectTubeTransfer", selectTubeTransfer);
        let newTubes = []
        if (selected_tube.length > 0) {
            newTubes = [
                ...selected_tube.map((tube) => ({
                    ...tube,
                    flag: flag,
                    color: color,
                })),
            ];
        }
        
        console.log("0926   groupedData   newTubes", newTubes);
        selectTubeTransfer = [...selectTubeTransfer, ...newTubes];


        if (clean_flag !== 1) {
            setSelectedAllTubes((prevNum) => {
                return processGroupedData(selectTubeTransfer);
            });
        }

        setSelectedTask((prevNum) => {
            return processGroupedData(selectTubeTransfer);
        });
        console.log("0926   selectedTask",selectedTask);
        
    };

    const processGroupedData = (data) => {
        const groupedData = {};
        console.log("0926   groupedData   data", data);

        data.forEach((item) => {
            const key = `${item.module_index}-${item.flag}-${item.color}-${item.status}`;

            if (!groupedData[key]) {
                groupedData[key] = [];
            }

            groupedData[key].push(item.tube_index);
        });
        console.log("0926   groupedData", groupedData);
        
        let result = [];
        Object.keys(groupedData).forEach((key) => {
            console.log("1021   key", key);
            const [module_index, flag, color, status] = key.split("-");
            const tube_indices = groupedData[key].sort((a, b) => a - b);
            let current_list = [tube_indices[0]];

            for (let i = 1; i < tube_indices.length; i++) {
                if (tube_indices[i] === tube_indices[i - 1] + 1) {
                    current_list.push(tube_indices[i]);
                } else {
                    result.push({
                        module_index: parseInt(module_index),
                        tube_index_list: current_list,
                        status: status,
                        flag: flag === "true",
                        color: color,
                    });
                    current_list = [tube_indices[i]];
                }
            }

            // Add the last sequence
            result.push({
                module_index: parseInt(module_index),
                tube_index_list: current_list,
                status: status,
                flag: flag === "true",
                color: color,
            });
        });

        result.forEach((entry) => {
            let tube_indices = entry.tube_index_list;
            let module_index = entry.module_index;

            // 根据 tube_index_list 获取最小和最大的 tube_index
            let min_tube_index = Math.min(...tube_indices);
            let max_tube_index = Math.max(...tube_indices);

            // 查找对应的时间
            let start_time = null;
            let end_time = null;
            // console.log("1021  ---------num", num);

            // 遍历 groupsOrigin 查找对应 module_index 和 tube_index 的时间
            num.forEach((group) => {
                if (group.module_index === module_index) {
                    if (group.tube_index === min_tube_index) {
                        start_time = group.time_start;
                    }
                    if (group.tube_index === max_tube_index) {
                        end_time = group.time_end;
                    }
                }
            });

            // 将找到的时间插入 entry
            if (start_time && end_time) {
                entry.time_start = start_time;
                entry.time_end = end_time;
            }
        });
        console.log("0926    res",result);


        return result;
    };
    const retainFlags = () => {
        console.log("0926   selected_tube", selected_tube);

        if (selected_tube.length > 0) {
            let consecutiveArrays = selected_tube.map((tube) => ({
                ...tube,
                status: "retain",
            }));
            selected_tube = consecutiveArrays;
            if (colorNum != 9) {
                colorNum++;
            } else {
                colorNum = 1;
            }
            console.log("0926   selected_tube   ---2", selected_tube);

            process_data_flag(selected_tube, true, colorMap[colorNum]);
            setSelectedReverse([]);
            selected_tube = [];
        } else {
            error();
        }
    };

    const abandonFlags = () => {
        if (selected_tube.length > 0) {
            let consecutiveArrays = selected_tube.map((tube) => ({
                ...tube,
                status: "abandon",
            }));
            selected_tube = consecutiveArrays;
            let color = 0;
            process_data_flag(selected_tube, false, colorMap[color]);
            setSelectedReverse([]);
            selected_tube = [];
        } else {
            error();
        }
    };

    const reverseFlags = () => {
        // console.log("1021-2 selected_tube :", selected_tube);
        // console.log("1021-2  groupsOrigin :", groupsOrigin);
        setReverseFlag(1);
        // if (selected_tubes.length > 0) {
        //     setSelectedReverse(selected_tubes);
        //     let reverse = num.filter(
        //         (item) =>
        //             !selected_reverse.includes(item.tube) &&
        //             item.flag == undefined
        //     );
        //     let selected_r = reverse.map((item) => item.tube);
        //     setSelectedReverse(selected_r);
        //     selected_tube = selected_r;
        //     console.log("selected_tube :", selected_tube);
        //     setNum(selected_reverse);
        //     handleReceiveFlags(selected_reverse, num);
        // } else {
        //     error();
        // }
    };

    const updateExcuteTask = (tubeId, taskId) => {
        if (excutedTubesUpdateFlag) {
            excuted_tubes = excutedTubes;
            excuted_tubes.forEach((task) => {
                if (task.task_id === taskId) {
                    task.currentTubeId = tubeId;
                    task.flag = excute_status;
                }
            });
            setExcutedTubes((prevExcutedTubes) => {
                return [...excuted_tubes];
            });
        }
    };

    const undoReceiveFlags = async (result) => {
        const methodId = localStorage.getItem("methodId");
        if (result[0].flag === "run") {
            const tasks = result.map((res) => {
                let flag = res.flag;
                let index = res.index;
                const taskId = generateTaskId();
                if (taskId === undefined) {
                    taskId = generateTaskId();
                }
                return {
                    tube_list: selectedTask[index].tube_index_list.map(
                        (tubeIndex) => tubeIndex + 1
                    ),
                    module_id: selectedTask[index].module_index + 1,
                    status: selectedTask[index].status,
                    method_id: Number(methodId),
                    task_id: Number(taskId),
                };
            });
            console.log("9012   tasks", tasks);

            excutedTubesUpdateFlag = false;
            setExcutedTubes((prevExcutedTubes) => [
                ...prevExcutedTubes,
                ...tasks,
            ]);
            for (const task of tasks) {
                const response = getTube({ task_list: task });
            }
        } else if (result[0].flag === "delete") {
            const indexesToDelete = new Set(result.map((item) => item.index));
            console.log("0926  indexesToDelete", indexesToDelete);

            // 处理被删除的元素
            indexesToDelete.forEach((index) => {
                if (selectedAllTubes.length > 0) {
                    const tubeList = selectedAllTubes[index].tube_index_list;
                    console.log("0926    tubeList",tubeList);

                    process_data_flag(tubeList, undefined);
                    setSelectedAllTubes(
                        selectedAllTubes.filter((item, index) => {
                            return !indexesToDelete.has(index);
                        })
                    );
                    selectTubeTransfer = selectTubeTransfer.filter((item, index) => {return !indexesToDelete.has(index);})

                    console.log("0926    selectedAllTubes",selectedAllTubes);
                    
                } else {
                    const tubeList = selectedTask[index].tube_index_list;
                    console.log("0926   22222  tubeList",tubeList);

                    console.log("0926  indexesToDelete  11   selectTubeTransfer",selectTubeTransfer);
                    selectTubeTransfer = selectTubeTransfer.filter((item, index) => {return !indexesToDelete.has(index);})
                    console.log("0926 indexesToDelete  22   selectTubeTransfer",selectTubeTransfer);

                    process_data_flag(tubeList, undefined);
                    
                    setSelectedTask(
                        selectedTask.filter((item, index) => {
                            return !indexesToDelete.has(index);
                        })
                    );
                    console.log("0926    selectedTask",selectedTask);

                }
            });
        }
    };

    const error = () => {
        messageApi.open({
            type: "error",
            content: "请选择试管 !",
            duration: 2,
        });
    };
    const showModal = () => {
        if (uploadFlag === 0) {
            messageApi.open({
                type: "error",
                content: "没有上传方法 !",
                duration: 2,
            });
        } else {
            if (flagStartTime == 1) {
                setOpenStart(true);
            } else {
                setLineLoading(true);

                startEluentLine().then((responsedata) => {
                    // console.log("responsedata :", responsedata);
                });
            }
        }
        `                                                    `;
    };
    const handleStart = () => {
        form.validateFields()
            .then((values) => {
                initLine({
                    detector_zeroing: values.detector_zeroing,
                    tube_id: values.tube_id,
                    module_id: values.module_id,
                    pump_pressure_zeroing: values.pump_pressure_zeroing,
                }).then(() => {});
            })
            .catch((errorInfo) => {
                console.log("0919  Validation Failed:", errorInfo);
            });
        setOpenStart(false);
    };
    const handleCancel = () => {
        console.log("Clicked cancel button");
        setOpenStart(false);
        setOpenReset(false);
    };

    const start = () => {
        uploadMethodFlag().then((responsedata) => {
            setEquilibrationFlag(responsedata.data.equilibration_flag);
        });
        if (
            currentMethod.equilibrationColumn === 1 &&
            equilibrationFlag === 1
        ) {
            messageApi.open({
                type: "success",
                content: "已经平衡过柱子了，再次开始实验",
            });
        }
        setCleanFlag(0);
        setLineLoading(true);
        setLoading(true);
        console.log("0919  flagStartTime", flagStartTime);
        console.log("0919  ----------1------");
        if (flagStartTime == 1) {
            clearData();
            handleStart();
            startTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            flagStartTime = 0;
        } else {
            console.log("0919  ----------2-------", flagStartTime);
        }
        console.log("0919  ----------3------", flagStartTime);

        updateEluentLine({
            point: Object.values(newPoints),
            start_time: startTime,
        }).then((responseData) => {
            if (!responseData.error) {
            }
        });
        getEluentCurve({ start_time: startTime })
            .then((responseData) => {})
            .catch((error) => {
                console.log(error);
            });
    };

    const terminate = () => {
        setLineLoading(false);
        flagStartTime = 1;
        setLoading(false);
        terminateEluentLine().then((responseData) => {});
    };

    function formatTimeWithRegex(timeStr) {
        return timeStr.replace(/^(\d):/, "0$1:");
    }

    const pause = () => {
        setLineLoading(false);
        pauseEluentLine().then((responseData) => {});
        const lastDataPoint = data[data.length - 1];
        const lastTime = lastDataPoint.time;
        console.log("1029   lastTime", lastTime);

        // 找到适合插值的点
        let previousPoint = null;
        let nextPoint = null;

        for (let i = 0; i < newPoints.length; i++) {
            if (newPoints[i].time <= lastTime) {
                previousPoint = newPoints[i];
            } else {
                nextPoint = newPoints[i];
                break;
            }
        }
        console.log("1029   previousPoint", previousPoint);
        console.log("1029   nextPoint", nextPoint);

        if (previousPoint && nextPoint) {
            // 计算插值，假设线性插值
            const startValue = previousPoint.value;
            const endValue = nextPoint.value;

            // 计算时间差（单位：秒）
            const timeDiff =
                (new Date(
                    `1970-01-01T${formatTimeWithRegex(nextPoint.time)}Z`
                ) -
                    new Date(
                        `1970-01-01T${formatTimeWithRegex(previousPoint.time)}Z`
                    )) /
                1000;
            console.log("1029   timeDiff", timeDiff);

            let k = (endValue - startValue) / timeDiff;
            let b =
                endValue -
                (k *
                    new Date(
                        `1970-01-01T${formatTimeWithRegex(nextPoint.time)}Z`
                    )) /
                    1000;
            console.log("1029   k,b", k, b);
            // 在时间区间内插值
            const value =
                (k * new Date(`1970-01-01T${formatTimeWithRegex(lastTime)}Z`)) /
                    1000 +
                b;
            console.log("1029   value", value);

            // 添加到newpoints
            newPoints.push({
                flow_rate: previousPoint.flow_rate,
                time: lastTime,
                value: Math.round(value), // 根据需要四舍五入
            });
        }

        startTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        setLine(newPoints);

        updateEluentLine({
            point: Object.values(newPoints),
            start_time: startTime,
        }).then((responseData) => {
            if (!responseData.error) {
            }
        });
        console.log("1029    new", newPoints);
    };
    const clearData = () => {
        setExcutedTubes((prevExcutedTubes) => []);
        setCleanFlag(0);
        flagStartTime = 1;
        getEluentLine().then((responseData) => {
            if (!responseData.error) {
                setLine(responseData.data.point);
            }
        });
        setData(() => []);
        setNum(() => []);
        setSelectedReverse([]);
        selected_tubes = [];
    };
    const saveExcute = (experimentId) => {
        console.log("0925  startTime", startTime);
        if (startTime !== undefined) {
            const methodId = localStorage.getItem("methodId");

            let endTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            const excute_data = {
                method_id: Number(methodId),
                experiment_id: Number(experimentId),
                method_start_time: startTime,
                method_end_time: endTime,
                error_codes: errorCodes,
            };
            executionMethod(excute_data).then((response) => {
                console.log("0924   response.status", response.status);
            });
        } else {
            clearData();
        }
    };
    const saveExperiment = (experimentId) => {
        if (startTime !== undefined) {
            const methodId = localStorage.getItem("methodId");
            const filteredNum = num.map(({ flag, color, ...rest }) => rest);
            const filteredExcute = Object.entries(excutedTubes)
                .map(([key, value]) => {
                    if (typeof value === "object") {
                        return {
                            operate: value.status, // 重命名为 operate
                            tube_list: value.tube_list, // 保留 tubeList
                        };
                    }
                    return null;
                })
                .filter(Boolean); // 过滤掉 null 值
            const experiment_data = {
                method_id: Number(methodId),
                experiment_id: Number(experimentId),
                curve_data: data,
                vertical_data: filteredNum,
                task_list: filteredExcute,
                sampling_time: samplingTime,
            };

            saveExperimentData(experiment_data).then((res) => {
                console.log("res :", res.status);
            });
        }
    };
    const reset = () => {
        if (clean_flag === 1 || data.length === 0) {
            clearData();
        } else if (clean_flag === 0) {
            setOpenReset(true);
        }
    };
    const handleOkRest = () => {
        const experimentId = generateTaskId();
        if (experimentId === undefined) {
            experimentId = generateTaskId();
        }
        saveExcute(experimentId);
        saveExperiment(experimentId);
        setOpenReset(false);
        clearData();
    };
    const handleCancelReset = () => {
        const experimentId = generateTaskId();
        if (experimentId === undefined) {
            experimentId = generateTaskId();
        }
        saveExcute(experimentId);
        clearData();
        setOpenReset(false);
    };
    const uploadMethod = async () => {
        try {
            setSpinning(true);
            const response = await uploadMethodOperate();
            const responsedata = await uploadMethodFlag();
            const uploadFlag = responsedata.data.upload_flag;
            // localStorage.setItem("uploadFlag", uploadFlag);
            const equilibrationFlag = responsedata.data.equilibration_flag;
            setUploadFlag(uploadFlag);
            setEquilibrationFlag(equilibrationFlag);

            if (uploadFlag === 1) {
                // 上传成功的情况
                setSpinning(false);
                messageApi.open({
                    type: "success",
                    content: "上传成功！",
                });
            } else if (uploadFlag === 0) {
                // 上传失败的情况
                setSpinning(false);
                messageApi.open({
                    type: "error",
                    content: "上传失败，请重新上传！",
                });
            }
        } catch (error) {
            // 错误处理
            setSpinning(false);
            messageApi.open({
                type: "error",
                content: "发生错误，请稍后重试！",
            });
            console.error(error);
        }
    };

    const clean = () => {
        setData(() => []);
        setSelectedReverse([]);
        setNum([]);
        setCleanFlag(1);
        console.log("clean_flag--- :", clean_flag);

        if (selected_tube.length > 0) {
            // let consecutiveArrays = splitConsecutive(selected_tube);
            console.log("0926  clean_flag selected_tube :", selected_tube);

            let consecutiveArrays = selected_tube.map((tube) => ({
                ...tube,
                status: "clean",
            }));
            selected_tube = consecutiveArrays;
            console.log("0926  selected_tube :", selected_tube);

            // if (colorNum != 9) {
            //     colorNum++;
            // } else {
            //     colorNum = 1;
            // }
            colorNum = 4;
            process_data_flag(selected_tube, true, colorMap[colorNum]);
            setSelectedReverse([]);
            selected_tube = [];
        }
        // else {
        //     error();
        // }
    };

    useEffect(() => {
        console.log("1029   ", formatTimeWithRegex("00:02:00"));
        // const uploadFlag = localStorage.getItem("uploadFlag");
        // setUploadFlag(uploadFlag);

        uploadMethodFlag().then((responsedata) => {
            if (!responsedata.error) {
                setUploadFlag(responsedata.data.upload_flag);
                setEquilibrationFlag(responsedata.data.equilibration_flag);
            }
        });
        clearData();
        // setData([])
        getEluentLine().then((responseData) => {
            if (!responseData.error) {
                if (responseData.data.point.length === 0) {
                    setMethodFlag(0);
                } else {
                    const methodId = localStorage.getItem("methodId");
                    if (methodId) {
                        setCurrentMethodOperate({
                            method_id: Number(methodId),
                        }).then((response) => {
                            console.log(
                                "0909 ------response :",
                                response.data.methods
                            );
                            setCurrentMethod(response.data.methods[0]);
                        });
                    }
                    setMethodFlag(1);
                    setLine(responseData.data.point);
                    newPoints = responseData.data.point;
                    // console.log(
                    //     "samplingTime  responseData.data :",
                    //     responseData.data
                    // );
                    setSamplingTime(responseData.data.sampling_time);
                    // console.log(
                    //     "samplingTime responseData.data.sampling_time :",
                    //     responseData.data.sampling_time
                    // );
                    // console.log("samplingTime ------------:", samplingTime);
                }
            }
        });
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(document.documentElement);

        return () => {
            window.removeEventListener("resize", handleResize);
            resizeObserver.disconnect();
        };
    }, [samplingTime, uploadFlag]);
    const handleDynamicLine = (flag) => {
        console.log("1030   flag",flag);
        getEluentLine().then((responseData) => {
            if (!responseData.error) {
                if (responseData.data.point.length === 0) {
                    setMethodFlag(0);
                } else {
                    const methodId = localStorage.getItem("methodId");
                    if (methodId) {
                        setCurrentMethodOperate({
                            method_id: Number(methodId),
                        }).then((response) => {
                            console.log(
                                "0909 ------response :",
                                response.data.methods
                            );
                            setCurrentMethod(response.data.methods[0]);
                        });
                    }
                    setMethodFlag(1);
                    setLine(responseData.data.point);
                    newPoints = responseData.data.point;
                    // console.log(
                    //     "samplingTime  responseData.data :",
                    //     responseData.data
                    // );
                    setSamplingTime(responseData.data.sampling_time);
                    // console.log(
                    //     "samplingTime responseData.data.sampling_time :",
                    //     responseData.data.sampling_time
                    // );
                    // console.log("samplingTime ------------:", samplingTime);
                }
            }
        });
            
    }

    return (
        <Flex gap="middle" wrap className="flex">
            {contextHolder}
            <FloatB
                warningCode={warningCode}
                dynamicHeight={dimensions.height}
                callback={handleDynamicLine}
            />

            <Layout>
                <div
                    style={{
                        height: "340px",
                        width: "100%",
                        backgroundColor: "white",
                    }}
                >
                    <Row>
                        <Col span={2}>
                            <Row>
                                <Col span={24}>
                                    <div className="buttonStyle">
                                        <Button
                                            type="primary"
                                            size="large"
                                            danger
                                            className={`button`} // 使用模板字符串
                                            onClick={() => showModal()}
                                            disabled={
                                                clean_flag === 1 ||
                                                methodFlag === 0
                                                    ? true
                                                    : false
                                            }
                                        >
                                            开始
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            className={`button button2`}
                                            onClick={() => pause()}
                                            disabled={
                                                clean_flag === 1 ||
                                                methodFlag === 0
                                                    ? true
                                                    : false
                                            }
                                        >
                                            暂停
                                        </Button>

                                        <Button
                                            type="primary  "
                                            size="large"
                                            className={`button button1`}
                                            onClick={() => terminate()}
                                            disabled={
                                                clean_flag === 1 ||
                                                methodFlag === 0
                                                    ? true
                                                    : false
                                            }
                                        >
                                            终止
                                        </Button>
                                        <Button
                                            type="primary  "
                                            size="large"
                                            className={`button button4`}
                                            onClick={() => reset()}
                                            disabled={
                                                methodFlag === 0 ? true : false
                                            }
                                        >
                                            复位
                                        </Button>
                                        <Button
                                            type="primary  "
                                            size="large"
                                            className={`button button5`}
                                            onClick={() => uploadMethod()}
                                            disabled={
                                                methodFlag === 0 ? true : false
                                            }
                                        >
                                            上传
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={21}>
                            <div className={`lineStyle overlayBox`}>
                                <div className={`line_line overlayBox1`}>
                                    <Line
                                        data={data}
                                        num={num}
                                        selected_tubes={selected_tubes}
                                        clean_flag={clean_flag}
                                        linePoint={linePoint}
                                        lineFlag={lineFlag}
                                        callback={handleUpdatePoint}
                                        samplingTime={samplingTime}
                                        lineLoading={lineLoading}
                                        selectedAllTubes={selectedAllTubes}
                                    ></Line>
                                </div>

                                {/* <div className={`line_dynamic overlayBox2`}>
                                    <DynamicLine></DynamicLine>
                                </div> */}
                            </div>
                        </Col>
                    </Row>
                </div>
                <Divider
                    className="divider"
                    style={{
                        color: "#9a0000",
                        fontSize: "20px",
                    }}
                >
                    操作
                </Divider>
                <Spin spinning={loading} delay={500}>
                    <Layout className="bottomStyle">
                        <Sider width="34%" className="siderStyle">
                            <DynamicCard
                                position={"top"}
                                title={"试管列表"}
                                height={"300px"}
                            >
                                {/* <div className="buttonTitle">试管列表</div> */}
                                {num.length >= 0 && methodFlag !== 0 ? (
                                    <div className="buttonTubeFun">
                                        <Buttons
                                            num={num}
                                            callback={handleReceiveFlags}
                                            selected={selected_reverse}
                                            clean_flag={clean_flag}
                                            isScrollable={isScrollable}
                                            selectedAllTubes={selectedAllTubes}
                                            reverseFlag={reverseFlag}
                                        ></Buttons>

                                        <Row>
                                            <Col span={6}>
                                                <Button
                                                    type="primary"
                                                    className={`button button1`} // 使用模板字符串
                                                    onClick={() =>
                                                        retainFlags()
                                                    }
                                                    // disabled={
                                                    //     methodFlag === 0
                                                    //         ? true
                                                    //         : false
                                                    // }
                                                >
                                                    保留
                                                </Button>
                                            </Col>
                                            <Col span={6}>
                                                {" "}
                                                <Button
                                                    type="primary"
                                                    className={`button button2`}
                                                    onClick={() =>
                                                        abandonFlags()
                                                    }
                                                    // disabled={
                                                    //     methodFlag === 0
                                                    //         ? true
                                                    //         : false
                                                    // }
                                                >
                                                    废弃
                                                </Button>
                                            </Col>

                                            <Col span={6}>
                                                {" "}
                                                <Button
                                                    type="primary"
                                                    onClick={() =>
                                                        reverseFlags()
                                                    }
                                                    className={`button button3`}
                                                    // disabled={
                                                    //     methodFlag === 0
                                                    //         ? true
                                                    //         : false
                                                    // }
                                                >
                                                    反转
                                                </Button>
                                            </Col>

                                            <Col span={6}>
                                                <Button
                                                    type="primary"
                                                    onClick={() => clean()}
                                                    className={`button button4`}
                                                    // disabled={
                                                    //     methodFlag === 0
                                                    //         ? true
                                                    //         : false
                                                    // }
                                                >
                                                    清洗
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        imageStyle={{ height: 100 }}
                                        description={<span>暂无试管</span>}
                                    />
                                )}
                            </DynamicCard>
                        </Sider>

                        <Content className="taskStyle">
                            {/* <div className="buttonTitle">任务列表</div> */}
                            <div className="buttonTube">
                                {/* {selected_tubes.length > 0  ? ( */}

                                <Row gutter={20}>
                                    <Col span={14}>
                                        <DynamicCard
                                            position={"top"}
                                            title={"任务列表"}
                                            height={"300px"}
                                        >
                                            <TaskTable
                                                selected_tubes={selected_tubes}
                                                title={""}
                                                buttonFlag={1}
                                                callback={undoReceiveFlags}
                                                selectedAllTubes={selectedTask}
                                            ></TaskTable>
                                        </DynamicCard>
                                    </Col>
                                    <Col span={10}>
                                        <DynamicCard
                                            position={"top"}
                                            title={"执行列表"}
                                            height={"300px"}
                                        >
                                            <TaskStep
                                                excuted_tubes={excutedTubes}
                                            ></TaskStep>
                                        </DynamicCard>
                                    </Col>
                                </Row>
                            </div>
                        </Content>
                    </Layout>
                </Spin>
            </Layout>
            <Modal
                title="初始化"
                open={openStart}
                onOk={start}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    labelCol={{
                        span: 4,
                    }}
                    wrapperCol={{
                        span: 14,
                    }}
                    layout="horizontal"
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        tube_id: inputTubeId,
                        module_id: inputModuleId,
                        detector_zeroing: true,
                        pump_pressure_zeroing: true,
                    }}
                >
                    <Form.Item
                        label="检测器清零："
                        name="detector_zeroing"
                        valuePropName="checked"
                    >
                        <Checkbox></Checkbox>
                    </Form.Item>
                    <Form.Item
                        label="泵压力清零："
                        name="pump_pressure_zeroing"
                        valuePropName="checked"
                    >
                        <Checkbox></Checkbox>
                    </Form.Item>
                    <Form.Item label="开始模块：">
                        <Form.Item name="module_id" noStyle>
                            <InputNumber
                                min={minModuleId}
                                max={maxModuleId}
                                onChange={handleInputNumberChange}
                            />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="开始试管：">
                        <Form.Item name="tube_id" noStyle>
                            <InputNumber
                                min={minTubeId}
                                max={maxTubeId}
                                onChange={handleInputNumberChange}
                            />
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
            <Spin spinning={spinning} fullscreen tip="正在上传......" />
            <Modal
                open={openReset}
                onOk={handleOkRest}
                confirmLoading={confirmLoading}
                onCancel={handleCancelReset}
                okText="保存" // 修改确认按钮文字
                cancelText="不保存" // 修改取消按钮文字
            >
                <p>是否保存实验数据?</p>
            </Modal>
        </Flex>
    );
};
export default App;
