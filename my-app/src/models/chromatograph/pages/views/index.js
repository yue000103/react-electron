import React, { useState, useEffect, useMemo, useRef } from "react";

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

    Switch,

    Tabs,

} from "antd";

import "./index.css";

import Line from "@components/d3/line";

import Buttons from "./buttonTube";


import FloatB from "../systemSet/index";

import TaskTable from "./taskTable";


import { Empty } from "antd";


import {

    getEluentCurve,


    getEluentLine,

    updateEluentLine,

    pauseEluentLine,

    startEluentLine,

    terminateEluentLine,

    initLine,


    SetSampleStatusAPI,

    UpdateLinePointAPI,

    SetManualHoldAPI,

    SetManualCutTubeAPI,

    wasteMode,

    getDetectedPeaks,

} from "../../api/eluent_curve";

import {


    setCurrentMethodOperate,


    UpdatePrepChromParamsAPI,

} from "../../api/methods";

import {

    columnEquilibration,

    stopColumnEquilibration,

    purgeColumnfunction,

    stopPurgeColumn,

} from "../../api/column";
import { getStockSolutions } from "../../api/settings";


import { saveExperimentData, executionMethod } from "../../api/experiment";

import { uploadMethodFlag } from "../../api/methods";

import { timeout } from "d3";

import moment from "moment";

import { getTube } from "@/models/chromatograph/api/tube";

import io from "socket.io-client";

import createDB from "../../hooks/createDB";




let excutedTubesUpdateFlag = false;


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
const EXPERIMENT_STATUS = {
    idle: "idle",
    collect: "collect",
    operate: "operate",
    demo: "demo",
};
const STATUS_DISABLED_ACTIONS = {
    [EXPERIMENT_STATUS.idle]: new Set([
        "save",
        "pause",
        "continue",
        "terminate",
    ]),
    [EXPERIMENT_STATUS.collect]: new Set([
        "clear",
        "equilibration",
        "start",
        "save",
        "purgeColumn",
    ]),
    [EXPERIMENT_STATUS.operate]: new Set([
        "start",
        "pause",
        "terminate",
        "equilibration",
        "continue",
    ]),
};
let colorNum = 0;
let selected_tube = []; // 接收到的试管列表

let selected_tubes = []; //总的是试管列表

let excuted_tubes = []; //执行的试管列表

let excute_status = 0;



let startTime;

let flagStartTime = 1; //  1 实验从头开始  0 实验继续

let newPoints = [];

let counter = 0;

let selectTubeTransfer = [];

let statusClearTimeout;

const statusLabelMap = {

    clean: "清洗",

    abandon: "废弃",

    retain: "保留",

};

const EXPERIMENT_STORAGE_KEY = "chromatograph:experiment-state:v1";

const App = () => {
     const [pumpALabel, setPumpALabel] = useState("A");
    const [pumpBLabel, setPumpBLabel] = useState("B");

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

    const [clean_flag, setCleanFlag] = useState(1);

    //方法，当0时，所有按钮禁用，当1时，所有按钮可以正常使用。

    const [methodFlag, setMethodFlag] = useState(0);

    //  1 可以修改折线 0 不可以修改折线

    const [lineFlag, setLineFlag] = useState(1);
    const [activePanelTab, setActivePanelTab] = useState("control");
    const [experimentStatus, setExperimentStatus] = useState(
        EXPERIMENT_STATUS.idle
    );
    const [selected_reverse, setSelectedReverse] = useState([]);
    // 模拟步骤进度（0-3），用于控制面板的步骤展示


    const isScrollable = true;

    const [linePoint, setLine] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const [warningCode, setWarningCode] = useState({
        code: 0,
        time: "",
        operate: undefined,
    });

    const [errorCodes, setErrorCode] = useState([]);

    const [samplingTime, setSamplingTime] = useState(10);

    const [uploadFlag, setUploadFlag] = useState(1);

    const [equilibrationFlag, setEquilibrationFlag] = useState(1);

    const [dimensions, setDimensions] = useState({

        width: window.innerWidth,

        height: window.innerHeight,

    });

    const [currentMethod, setCurrentMethod] = useState({});
    const [methodRefreshKey, setMethodRefreshKey] = useState(0);

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

    const [deviceStatus, setDeviceStatus] = useState({

        PowerStatus: { value: false },

        CurrentTube: { value: "0-0" },

        PumpASpeed: { value: 0 },

        PumpBSpeed: { value: 0 },

        Detector: { value: 0 },

    });

    const [pressureValue, setPressureValue] = useState(0);

    const [operatingTime, setOperatingTime] = useState(0);
    const { storeData } = createDB("MyDatabase", "method", "methodId");

    const formatToThreeDecimals = (value) => {

        if (typeof value === "number") {

            return Number(value.toFixed(3));

        }

        return value;

    };

    const persistMethodToIndexedDB = (method, methodId) => {
        if (!method || !methodId || !window.indexedDB) {
            return Promise.resolve();
        }
        return storeData(method, Number(methodId));
    };

    const syncCurrentMethod = (methodId) => {
        if (!methodId) {
            return Promise.resolve();
        }
        return setCurrentMethodOperate({
            method_id: Number(methodId),
        }).then((response) => {
            const methodFromResponse = response?.data?.methods?.[0];
            setCurrentMethod(methodFromResponse);
            return persistMethodToIndexedDB(methodFromResponse, methodId)
                .catch(() => {})
                .finally(() => {
                    setMethodRefreshKey((prev) => prev + 1);
                });
        });
    };

    const runningTaskInfo = useMemo(() => {

       //console.log("=== 状态栏调试信息 ===");

       //console.log("currentTaskId:", currentTaskId);

       //console.log("currentTubeId:", currentTubeId);

       //console.log("excutedTubes:", excutedTubes);



        // 如果没有执行中的任务，返回null

        if (!excutedTubes || excutedTubes.length === 0) {

           //console.log("excutedTubes 为空");

            return null;

        }



        let task = null;

        let tubeId = undefined;



        // 优先使用 currentTaskId 查找任务

        if (currentTaskId !== undefined && currentTaskId !== null) {

            const activeTaskId = Number(currentTaskId);

            if (!Number.isNaN(activeTaskId)) {

                task = excutedTubes.find(

                    (item) => Number(item.task_id) === activeTaskId

                );

                if (task) {

                    // 如果有 currentTubeId，使用它

                    const parsedTubeId =

                        currentTubeId !== undefined && currentTubeId !== null

                            ? Number(currentTubeId)

                            : undefined;

                    tubeId = Number.isNaN(parsedTubeId)

                        ? undefined

                        : parsedTubeId;

                   //console.log("使用 currentTaskId 找到任务");

                }

            }

        }



        // 如果没有找到任务，使用第一个任务作为当前运行任务

        if (!task) {

            task = excutedTubes[0];

            // 使用任务的第一个试管

            if (task.tube_list && task.tube_list.length > 0) {

                tubeId = task.tube_list[0];

            }

           //console.log("使用第一个任务作为当前运行任务");

        }



        const result = {

            moduleId: task.module_id,

            tubeId: tubeId,

            statusText: statusLabelMap[task.status] || task.status,

            taskId: task.task_id,

        };

       //console.log("runningTaskInfo 结果:", result);

        return result;

    }, [currentTaskId, currentTubeId, excutedTubes]);

    const [openStart, setOpenStart] = useState(false);

    const [confirmLoading, setConfirmLoading] = useState(false);

    const [minTubeId, setMinTubeId] = useState(1); // 默认最小值

    const [maxTubeId, setMaxTubeId] = useState(10); // 默认最大值

    const [minModuleId, setMinModuleId] = useState(1); // 默认最小值

    const [maxModuleId, setMaxModuleId] = useState(10); // 默认最大值

    const [inputTubeId, setInputTubeId] = useState(minTubeId); // 默认值为 minTubeId

    const [inputModuleId, setInputModuleId] = useState(minModuleId);

    const [openReset, setOpenReset] = useState(false);

    const [openPause, setOpenPause] = useState(false);

    const [pauseForm] = Form.useForm();

    const [openManualHold, setOpenManualHold] = useState(false);

    const [openWasteModel, setOpenWasteModel] = useState(false);

    const [autoGradient, setAutoGradient] = useState(true);

    let autoGradientLet = false;

    const handleAutoGradientToggle = (checked) => {

        setAutoGradient(checked);

        autoGradientLet = true;

        if (checked) {

            setOpenAutoGradientModal(true);

        }

    };

    const [openEquilibration, setOpenEquilibration] = useState(false);

    const [purgeColumn, setPurgeColumn] = useState(false);

    const [purgeColumnLoading, setPurgeColumnLoading] = useState(false);



    const [equilibrationLoading, setEquilibrationLoading] = useState(false);

    // 自动梯度相关状态变量

    const [openAutoGradientModal, setOpenAutoGradientModal] = useState(false);

    const [autoGradientLoading, setAutoGradientLoading] = useState(false);

    const [autoGradientForm] = Form.useForm();

    const handleInputNumberChange = (value) => {

        setInputTubeId(value);

    };

    const [form] = Form.useForm(); // 获取表单实例

    const [spinning, setSpinning] = React.useState(false);

    const hasHydratedRef = useRef(false);

    const hasStoredStateRef = useRef(false);

    const latestExperimentStateRef = useRef(null);

    const persistTimeoutRef = useRef(null);
    const demoReturnStatusRef = useRef(EXPERIMENT_STATUS.idle);



    const persistExperimentState = (payload) => {

        if (!payload) {

            return;

        }

        localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(payload));

    };



    const restoreExperimentState = () => {

        const raw = localStorage.getItem(EXPERIMENT_STORAGE_KEY);

        if (!raw) {

            return false;

        }

        try {

            const saved = JSON.parse(raw);

            if (Array.isArray(saved.data)) {

                setData(saved.data);

            }

            if (Array.isArray(saved.num)) {

                setNum(saved.num);

            }

            if (Array.isArray(saved.linePoint)) {

                setLine(saved.linePoint);

                newPoints = saved.linePoint;

            }

            if (Array.isArray(saved.selectedAllTubes)) {

                setSelectedAllTubes(saved.selectedAllTubes);

            }

            if (Array.isArray(saved.selectedTask)) {

                setSelectedTask(saved.selectedTask);

            }

            if (Array.isArray(saved.excutedTubes)) {

                setExcutedTubes(saved.excutedTubes);

                excuted_tubes = saved.excutedTubes;

            }

            if (Array.isArray(saved.selected_reverse)) {

                setSelectedReverse(saved.selected_reverse);

                if (!Array.isArray(saved.selected_tube)) {

                    selected_tube = saved.selected_reverse;

                }

            }

            if (Array.isArray(saved.selected_tube)) {

                selected_tube = saved.selected_tube;

                if (!Array.isArray(saved.selected_reverse)) {

                    setSelectedReverse(saved.selected_tube);

                }

            }

            if (Array.isArray(saved.selected_tubes)) {

                selected_tubes = saved.selected_tubes;

            }

            if (typeof saved.clean_flag === "number") {

                setCleanFlag(saved.clean_flag);

            }

            if (typeof saved.reverseFlag === "number") {

                setReverseFlag(saved.reverseFlag);

            }

            if (saved.excuteTaskFlag !== undefined) {

                setExcuteTaskFlag(saved.excuteTaskFlag);

            }

            if (saved.currentTaskId !== undefined) {

                setCurrentTaskId(saved.currentTaskId);

            }

            if (saved.currentTubeId !== undefined) {

                setCurrentTubeId(saved.currentTubeId);

            }

            if (typeof saved.samplingTime === "number") {

                setSamplingTime(saved.samplingTime);

            }

            if (typeof saved.methodFlag === "number") {

                setMethodFlag(saved.methodFlag);

            }

            if (typeof saved.lineFlag === "number") {

                setLineFlag(saved.lineFlag);

            }

            if (typeof saved.autoGradient === "boolean") {
                setAutoGradient(saved.autoGradient);
            }
            if (typeof saved.activePanelTab === "string") {
                setActivePanelTab(saved.activePanelTab);
            }
            if (typeof saved.experimentStatus === "string") {
                setExperimentStatus(saved.experimentStatus);
            }
            if (saved.startTime) {
                startTime = saved.startTime;
            }
            if (typeof saved.flagStartTime === "number") {

                flagStartTime = saved.flagStartTime;

            }

            if (typeof saved.colorNum === "number") {

                colorNum = saved.colorNum;

            }

            return true;

        } catch (error) {

            localStorage.removeItem(EXPERIMENT_STORAGE_KEY);

           //console.log("Restore experiment state failed", error);

            return false;

        }

    };



    useEffect(() => {

        const restored = restoreExperimentState();

        hasStoredStateRef.current = restored;

        hasHydratedRef.current = true;

    }, []);



    useEffect(() => {

        if (!hasHydratedRef.current) {

            return;

        }

        const payload = {

            data,

            num,

            linePoint,

            selectedAllTubes,

            selectedTask,

            excutedTubes,

            selected_reverse,

            selected_tube,

            selected_tubes,

            clean_flag,

            reverseFlag,

            excuteTaskFlag,

            currentTaskId,

            currentTubeId,

            samplingTime,

            methodFlag,

            lineFlag,
            autoGradient,
            activePanelTab,
            experimentStatus,
            startTime,
            flagStartTime,
            colorNum,
        };

        latestExperimentStateRef.current = payload;

        if (!persistTimeoutRef.current) {

            persistTimeoutRef.current = setTimeout(() => {

                persistTimeoutRef.current = null;

                persistExperimentState(latestExperimentStateRef.current);

            }, 1000);

        }

    }, [

        data,

        num,

        linePoint,

        selectedAllTubes,

        selectedTask,

        excutedTubes,

        selected_reverse,

        clean_flag,

        reverseFlag,

        excuteTaskFlag,

        currentTaskId,

        currentTubeId,

        samplingTime,
        methodFlag,
        lineFlag,
        autoGradient,
        activePanelTab,
        experimentStatus,
    ]);


    useEffect(() => {

        const handleBeforeUnload = () => {

            persistExperimentState(latestExperimentStateRef.current);

        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {

            window.removeEventListener("beforeunload", handleBeforeUnload);

            if (persistTimeoutRef.current) {

                clearTimeout(persistTimeoutRef.current);

                persistTimeoutRef.current = null;

            }

        };

    }, []);

    const generateTaskId = () => {

        const timestamp = new Date().getTime();

        counter++;

        return `${timestamp}${counter}`;

    };

    useEffect(() => {

        const socket = io("http://localhost:5000"); // 确保 URL 正确

        socket.on("connect", () => {

            // console.log("1026   connect");

        });

        socket.on("new_point", (data) => {

            // console.log("1026   new_point", data);

            setNum((prevNum) => [...prevNum, data.point]);

        });

        socket.on("new_curve_point", (responseData) => {

            console.log("0120   responseData,autoGradient", responseData,autoGradient);


            if (autoGradient == true) {

                getEluentLine().then((responseData) => {

                    if (!responseData.error) {

                        setLine(responseData.data.point);

                    }

                });

            }



            setData((prevData) => [...prevData, responseData.point]);

        });

        socket.on("warning", (responseData) => {

            setWarningCode({

                code: responseData.code,

                time: responseData.time,

                operate: responseData.operate,

            });



            console.log("1026 warningCode:", responseData);

            setErrorCode((pre) => [...pre, responseData.code]);

            terminate();
            if (responseData.operate == "terminate") {
                setExperimentStatus(EXPERIMENT_STATUS.idle);
            }

        });

        socket.on("current_tube", (responseData) => {



            setCurrentTubeId(responseData.tube_id);

            setCurrentTaskId(responseData.task_id);



        });

        socket.on("device_free", (responseData) => {


            setExcuteTaskFlag(responseData.flag);

            setCurrentTaskId(responseData.task_id);

            excute_status = responseData.flag;


        });

        socket.on("equilibration_flag", (responseData) => {



            if (responseData.flag === 1) {

                setEquilibrationLoading(false);

                setOpenEquilibration(false);

                messageApi.open({

                    type: "success",

                    content: "润柱完成！",

                });

            }

        });

        socket.on("purge_column_flag", (responseData) => {

            // console.log(
            //
            //     "1026   purge_column_flag---------------------",
            //
            //     responseData
            //
            // );

            if (responseData.flag === 1) {

                setPurgeColumnLoading(false);

                setPurgeColumn(false);

                messageApi.open({

                    type: "success",

                    content: "吹扫完成！",

                });

            }

        });

        socket.on("current_status", (responseData) => {

            const status =

                typeof responseData === "string"

                    ? responseData

                    : responseData?.status;

            if (!status) return;

            if (status == "clear") {

                if (statusClearTimeout) {

                    clearTimeout(statusClearTimeout);

                }

                statusClearTimeout = setTimeout(() => {

                    setData(() => []);

                    setSelectedReverse([]);

                    setNum([]);

                }, 2000);

            }

            if (status == "start_collection") {

                clearData();

            }

            if (status == "start_retain") {

                let selectTubeTransfer_1 = [

                    {

                        module_index: 0,

                        tube_index: 1,

                        status: "retain",

                        flag: true,

                        color: "One",

                    },

                    {

                        module_index: 0,

                        tube_index: 2,

                        status: "retain",

                        flag: true,

                        color: "One",

                    },

                    {

                        module_index: 0,

                        tube_index: 3,

                        status: "retain",

                        flag: true,

                        color: "One",

                    },

                    {

                        module_index: 0,

                        tube_index: 4,

                        status: "retain",

                        flag: true,

                        color: "One",

                    },

                ];

                setSelectedAllTubes((prevNum) => {

                    return [

                        ...prevNum,

                        ...processGroupedData(selectTubeTransfer_1),

                    ];

                });

                let selectTubeTransfer_2 = [

                    {

                        module_index: 0,

                        tube_index: 7,

                        status: "retain",

                        flag: true,

                        color: "One",

                    },

                ];

                setSelectedAllTubes((prevNum) => {

                    return [

                        ...prevNum,

                        ...processGroupedData(selectTubeTransfer_2),

                    ];

                });

                let selectTubeTransfer_3 = [

                    {

                        module_index: 0,

                        tube_index: 0,

                        status: "abandon",

                        flag: false,

                        color: "Zero",

                    },

                ];

                setSelectedAllTubes((prevNum) => {

                    return [

                        ...prevNum,

                        ...processGroupedData(selectTubeTransfer_3),

                    ];

                });

                let selectTubeTransfer_4 = [

                    {

                        module_index: 0,

                        tube_index: 5,

                        status: "abandon",

                        flag: false,

                        color: "Zero",

                    },

                    {

                        module_index: 0,

                        tube_index: 6,

                        status: "abandon",

                        flag: false,

                        color: "Zero",

                    },

                ];

                setSelectedAllTubes((prevNum) => {

                    return [

                        ...prevNum,

                        ...processGroupedData(selectTubeTransfer_4),

                    ];

                });

                let selectTubeTransfer_5 = [

                    {

                        module_index: 0,

                        tube_index: 8,

                        status: "abandon",

                        flag: false,

                        color: "Zero",

                    },

                    {

                        module_index: 0,

                        tube_index: 9,

                        status: "abandon",

                        flag: false,

                        color: "Zero",

                    },

                ];



                setSelectedAllTubes((prevNum) => {

                    return [

                        ...prevNum,

                        ...processGroupedData(selectTubeTransfer_5),

                    ];

                });

                console.log("selectedAllTubes", selectedAllTubes);

            }

        });

        socket.on("device_status", (responseData) => {



            setDeviceStatus({

                PowerStatus: { value: !!responseData.PowerStatus },

                CurrentTube: { value: responseData.CurrentTube || "-" },

                PumpASpeed: {

                    value: responseData.PumpASpeed,

                },

                PumpBSpeed: {

                    value: responseData.PumpBSpeed,

                },

                Detector: {

                    value: responseData.Detector,

                },

            });

        });



        socket.on("module_flag", (responseData) => {

            // console.log("1026   responseData :", responseData);

        });

        socket.on("disconnect", () => {



        });

        socket.on("pressure", (responseData) => {




            console.log(responseData.pressure_value);

            setPressureValue(responseData?.pressure_value);

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

        setSelectedReverse(select_tubes);

        if (groupsOrigin?.length === 0) {

            setGroupsOrigin((prevNum) => {

                return groupsOrigin;

            });

        }

        // setNum(numss);

    };

    // 把梯度曲线的value值转换成数字

    const convertNonNumericValues = (data) => {

        const updatedData = [...data];

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

        setLine(newPoints);

        // newPoints = linePointChange;

    };

    // flag  ： undefined  没被选中   true  保留  false  废弃

    const process_data_flag = (selected_tube, flag, color) => {

        console.log("1101   selected_tube", selected_tube);

        console.log("1101   selectTubeTransfer", selectTubeTransfer);

        let newTubes = [];

        if (selected_tube.length > 0) {

            newTubes = [

                ...selected_tube.map((tube) => ({

                    ...tube,

                    flag: flag,

                    color: color,

                })),

            ];

        }

        console.log("1101   newTubes", newTubes);

        selectTubeTransfer = [...newTubes];

        // console.log("1203   selectTubeTransfer  2  ", selectTubeTransfer);

        if (clean_flag !== 1) {

            setSelectedAllTubes((prevNum) => {

                return [...prevNum, ...processGroupedData(selectTubeTransfer)];

            });

        }

        setSelectedTask((prevNum) => {

            return [...prevNum, ...processGroupedData(selectTubeTransfer)];

        });

    };

    const processGroupedData = (data) => {

        setReverseFlag(0);

        const groupedData = {};

        data.forEach((item) => {

            const key = `${item.module_index}-${item.flag}-${item.color}-${item.status}`;

            if (!groupedData[key]) {

                groupedData[key] = [];

            }

            groupedData[key].push(item.tube_index);

        });

        console.log("selectedAllTubes   groupedData", groupedData);

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

            console.log("1021  selectedAllTubes   num", num);

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

        console.log("1101    selectedAllTubes  result", result);

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

            ////console.log("1203   selected_tube", selected_tube);



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
        setReverseFlag(1);
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

            const taskIdByIndex = new Map();
            const tasks = result.map((res) => {

                let flag = res.flag;

                let index = res.index;

                let taskId = generateTaskId();

                if (taskId === undefined) {

                    taskId = generateTaskId();

                }

                const numericTaskId = Number(taskId);
                taskIdByIndex.set(index, numericTaskId);

                return {

                    tube_list: selectedTask[index].tube_index_list.map(

                        (tubeIndex) => tubeIndex + 1

                    ),

                    module_id: selectedTask[index].module_index + 1,

                    status: selectedTask[index].status,

                    method_id: Number(methodId),

                    task_id: numericTaskId,

                };

            });

           //console.log("9012   tasks", tasks);

            excutedTubesUpdateFlag = false;

            setSelectedTask((prev) =>
                prev.map((item, idx) =>
                    taskIdByIndex.has(idx)
                        ? { ...item, task_id: taskIdByIndex.get(idx) }
                        : item
                )
            );
            setSelectedAllTubes((prev) =>
                prev.map((item, idx) =>
                    taskIdByIndex.has(idx)
                        ? { ...item, task_id: taskIdByIndex.get(idx) }
                        : item
                )
            );

            setExcutedTubes((prevExcutedTubes) => [

                ...prevExcutedTubes,

                ...tasks,

            ]);

            for (const task of tasks) {

                const response = getTube({ task_list: task });

            }

        } else if (result[0].flag === "delete") {

            const indexesToDelete = new Set(result.map((item) => item.index));

           //console.log("0926  indexesToDelete", indexesToDelete);

            // 处理被删除的元素

            indexesToDelete.forEach((index) => {

                if (selectedAllTubes.length > 0) {

                    const tubeList = selectedAllTubes[index].tube_index_list;

                   //console.log("0926    tubeList", tubeList);

                    process_data_flag(tubeList, undefined);

                    setSelectedAllTubes(

                        selectedAllTubes.filter((item, index) => {

                            return !indexesToDelete.has(index);

                        })

                    );

                    selectTubeTransfer = selectTubeTransfer.filter(

                        (item, index) => {

                            return !indexesToDelete.has(index);

                        }

                    );

                    setSelectedTask(

                        selectedTask.filter((item, index) => {

                            return !indexesToDelete.has(index);

                        })

                    );

                   //console.log("0926    selectedAllTubes", selectedAllTubes);

                } else {

                    // const tubeList = selectedTask[index].tube_index_list;

                    // console.log("0926   22222  tubeList", tubeList);

                    // console.log(

                    //     "0926  indexesToDelete  11   selectTubeTransfer",

                    //     selectTubeTransfer

                    // );

                    // selectTubeTransfer = selectTubeTransfer.filter(

                    //     (item, index) => {

                    //         return !indexesToDelete.has(index);

                    //     }

                    // );

                    // console.log(

                    //     "0926 indexesToDelete  22   selectTubeTransfer",

                    //     selectTubeTransfer

                    // );

                    // process_data_flag(tubeList, undefined);

                    setSelectedTask(

                        selectedTask.filter((item, index) => {

                            return !indexesToDelete.has(index);

                        })

                    );

                   //console.log("1101    selectedTask", selectedTask);

                }

            });

        }

    };

    const error = () => {

        messageApi.open({

            type: "error",

            content: "请选择试管!",

            duration: 2,

        });

    };

    const showModal = () => {

        localStorage.setItem("updateLineFlag", true);

        if (uploadFlag == 0) {

            messageApi.open({

                type: "error",

                content: "没有上传方法",

                duration: 2,

            });

        } else {

            setOpenStart(true);

        }

    };

    const handleStart = () => {

        form.validateFields()

            .then((values) => {

                initLine({

                    detector_zeroing: values.detector_zeroing,

                    tube_id: values.tube_id,

                    module_id: values.module_id,

                    waste_mode: values.waste_mode,

                }).then(() => {});

            })

            .catch((errorInfo) => {

               //console.log("0919  Validation Failed:", errorInfo);

            });

        setOpenStart(false);

    };

    const handleCancel = () => {

       //console.log("Clicked cancel button");

        setOpenStart(false);

        setOpenReset(false);

    };

    const start = () => {

        uploadMethodFlag().then((responsedata) => {

            setEquilibrationFlag(responsedata.data.equilibration_flag);

        });

        setCleanFlag(0);

        setLineLoading(true);

        setLoading(true);

        setExperimentStatus(EXPERIMENT_STATUS.collect);
       //console.log("0919  flagStartTime", flagStartTime);

       //console.log("0919  ----------1------");

        if (flagStartTime == 1) {

            clearData();

            handleStart();

            startTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

            flagStartTime = 0;

        } else {

           //console.log("0919  ----------2-------", flagStartTime);

        }

       //console.log("0919  ----------3------", flagStartTime);

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

        if (experimentStatus === EXPERIMENT_STATUS.collect) {
            setExperimentStatus(EXPERIMENT_STATUS.operate);
        }

        setAutoGradient(false);

    };

    function formatTimeWithRegex(timeStr) {

        return timeStr.replace(/^(\d):/, "0$1:");

    }

    const pause = () => {

        setLineLoading(false);

        pauseEluentLine().then((responseData) => {});

        // 获取linePoint最后一个点的value值

        if (autoGradient == true) {

            setOpenPause(true);

        }

    };

    const handlePauseOk = () => {

        pauseForm.validateFields().then((values) => {

            UpdateLinePointAPI({

                value: values.value,

                new_rate: values.new_rate,

            }).then((response) => {

                if (!response.error) {

                    messageApi.open({

                        type: "success",

                        content: "更新成功！",

                    });

                }

            });

            setOpenPause(false);

        });

    };

    const handlePauseCancel = () => {

        setOpenPause(false);

    };

    const clearData = () => {

        localStorage.removeItem(EXPERIMENT_STORAGE_KEY);

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
        setSelectedAllTubes([]);
        setSelectedTask([]);
        selected_tube = [];
        selected_tubes = [];
        excuted_tubes = [];
        excute_status = 0;
        colorNum = 0;
        newPoints = [];
        setCurrentTubeId(undefined);
        setCurrentTaskId(undefined);
        setExcuteTaskFlag(undefined);
        setAutoGradient(false);
        setErrorCode([]);
        setWarningCode({ code: 0, time: "", operate: undefined });
    };
    const handleClear = () => {
        clearData();
        setExperimentStatus(EXPERIMENT_STATUS.idle);
        setActivePanelTab("control");
    };
    const saveExcute = (experimentId) => {

       //console.log("0925  startTime", startTime);

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

               //console.log("0924   response.status", response.status);

            });

        } else {

            // clearData();

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

                experiment_id: Number(experimentId),

            };

            saveExperimentData(experiment_data).then((res) => {

               //console.log("res :", res.status);

            });

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

        if (autoGradient == true) {

            getDetectedPeaks().then((responseData) => {

                if (!responseData.error) {

                }

            });

        }

        messageApi.open({

            type: "success",

            content: "保存成功！",

        });

        // clearData();

    };

    const handleCancelReset = () => {

        const experimentId = generateTaskId();

        if (experimentId === undefined) {

            experimentId = generateTaskId();

        }

        saveExcute(experimentId);

        handleClear();

        setOpenReset(false);

    };

    const continue_process = () => {

        setLineLoading(true);

        startEluentLine().then((responseData) => {

            if (!responseData.error) {

            }

        });

        if (autoGradient == false) {

            updateEluentLine({

                point: Object.values(newPoints),

                start_time: startTime,

            }).then((responseData) => {

                if (!responseData.error) {

                }

            });

        }

    };

    const clean = () => {

        // setData(() => []);

        // setSelectedReverse([]);

        // setNum([]);

        setCleanFlag(1);


        if (selected_tube.length > 0) {

            // let consecutiveArrays = splitConsecutive(selected_tube);

           //console.log("0926  clean_flag selected_tube :", selected_tube);

            let consecutiveArrays = selected_tube.map((tube) => ({

                ...tube,

                status: "clean",

            }));

            selected_tube = consecutiveArrays;

            colorNum = 4;

            process_data_flag(selected_tube, true, colorMap[colorNum]);

            setSelectedReverse([]);

            selected_tube = [];

        }

       

    };

    useEffect(() => {
         getStockSolutions().then((res) => {
                            if (res && !res.error && res.data) {
                                const d = res.data;
                                const list = d.stock_solutions || d.stock_solution || d.list || (Array.isArray(d) ? d : []);
                                const solA = Array.isArray(list) ? (list.find(item => item.label === "A")?.name || "A") : "A";
                                const solB = Array.isArray(list) ? (list.find(item => item.label === "B")?.name || "B") : "B";
                                setPumpALabel(solA);
                                setPumpBLabel(solB);
                             
                            }
                        }).catch(() => {});

       //console.log("1029   ", formatTimeWithRegex("00:02:00"));

        const methodId = localStorage.getItem("methodId");

        if (methodId) {

            syncCurrentMethod(methodId);

        }

        if (!hasStoredStateRef.current) {

            clearData();

            // setData([])

            getEluentLine().then((responseData) => {

                if (!responseData.error) {

                    setMethodFlag(1);

                    setLine(responseData.data.point);

                    newPoints = responseData.data.point;

                    setSamplingTime(responseData.data.sampling_time);

                }

            });

        }

        localStorage.setItem("updateLineFlag", true);

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

    }, []);

    const handleDynamicLine = (flag) => {

       //console.log("1030   flag", flag);

        getEluentLine().then((responseData) => {

            if (!responseData.error) {

                if (responseData.data.point.length === 0) {

                    setMethodFlag(0);

                } else {

                    const methodId = localStorage.getItem("methodId");

                    if (methodId) {

                        syncCurrentMethod(methodId);

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

    };

    const handleEquilibrationStart = () => {

        setEquilibrationLoading(true);

        columnEquilibration().then((response) => {

            if (!response.error) {

            }

        });

    };

    const handlePurgeColumnStart = () => {

        setPurgeColumnLoading(true);

        purgeColumnfunction().then((response) => {

            if (!response.error) {

            }

        });

    };

    const handleEquilibrationStop = () => {

        stopColumnEquilibration().then((response) => {

            if (!response.error) {

                setEquilibrationLoading(false);

                setOpenEquilibration(false);

                messageApi.open({

                    type: "info",

                    content: "已停止润柱！",

                });

            }

        });

    };

    const handlePurgeColumnStop = () => {

        stopPurgeColumn().then((response) => {

            if (!response.error) {

                setPurgeColumn(false);

                messageApi.open({

                    type: "info",

                    content: "已停止吹扫！",

                });

            }

        });

    };

    // 自动梯度相关函数

    const handleAutoGradientOk = () => {

        autoGradientForm.validateFields().then((values) => {

            setAutoGradientLoading(true);

           //console.log("自动梯度参数:", values);

            UpdatePrepChromParamsAPI(values)

                .then((res) => {

                    setAutoGradientLoading(false);

                    setOpenAutoGradientModal(false);

                    messageApi.open({

                        type: "success",

                        content: "自动梯度参数保存成功！",

                    });

                })

                .catch(() => {

                    message.error("参数上传失败");

                });

        });

    };

    const handleAutoGradientCancel = () => {

        autoGradientLet = false;

        setAutoGradient(false); // 取消时关闭Switch

        setOpenAutoGradientModal(false);

    };
    const statusDisabledActions = STATUS_DISABLED_ACTIONS[experimentStatus];
    const isOperateTabLocked = false;
    const isActionDisabled = (key, baseDisabled = false) => {
        if (baseDisabled) return true;
        return statusDisabledActions ? statusDisabledActions.has(key) : false;
    };
    const handlePanelTabChange = (key) => {
        if (isOperateTabLocked && key === "operate") {
            return;
        }
        setActivePanelTab(key);
    };
    useEffect(() => {
        if (isOperateTabLocked && activePanelTab === "operate") {
            setActivePanelTab("control");
        }
    }, [isOperateTabLocked, activePanelTab]);




    const actionButtons = [
{
            key: "clear",
            label: "复位",
            onClick: () => handleClear(),
            disabled: isActionDisabled("clear", methodFlag === 0),
            className: "btn-reset-danger",
        },

        {

            key: "start",
            label: "开始",
            onClick: () => showModal(),
            disabled: isActionDisabled(
                "start",
                clean_flag === 1 || methodFlag === 0
            ),
            danger: true,
        },
        {

            key: "pause",
            label: "\u6682\u505c",
            onClick: () => pause(),
            disabled: isActionDisabled(
                "pause",
                clean_flag === 1 || methodFlag === 0
            ),
            className: "button2",
        },
        {
            key: "continue",
            label: "\u7ee7\u7eed",
            onClick: () => continue_process(),
            disabled: isActionDisabled("continue"),
            className: "button1",
        },

        {
            key: "terminate",
            label: "\u7ec8\u6b62",
            onClick: () => terminate(),
            disabled: isActionDisabled(
                "terminate",
                clean_flag === 1 || methodFlag === 0
            ),
            className: "button1",
        },
          {

            key: "equilibration",
            label: "\u6da6\u67f1",
            onClick: () => setOpenEquilibration(true),
            disabled: isActionDisabled("equilibration", methodFlag === 0),
            className: "button7",
        },


        {

            key: "switchTube",
            label: "\u5207\u6362\u8bd5\u7ba1",
            onClick: () => {
                SetManualCutTubeAPI().then(() => {
                    messageApi.open({
                        type: "success",

                        content: "切换试管成功",

                    });
                });
            },
            disabled: isActionDisabled("switchTube", methodFlag === 0),
            className: "button6",
        },

        {
            key: "waste",
            label: "\u5e9f\u5f03\u6a21\u5f0f",
            onClick: () => setOpenWasteModel(true),
            disabled: isActionDisabled("waste", methodFlag === 0),
            className: "button6",
        },
        {

            key: "autoGradient",

            label: `\u81ea\u52a8\u68af\u5ea6${autoGradient ? "(开)" : ""}`,

            onClick: () => handleAutoGradientToggle(!autoGradient),

            disabled: isActionDisabled("autoGradient", methodFlag === 0),

            className: `button3 ${autoGradient ? "button-active" : ""}`,

        },

        {

            key: "manualHold",

            label: "\u624b\u52a8\u4fdd\u6301",

            onClick: () => setOpenManualHold(true),

            disabled: isActionDisabled("manualHold", autoGradient === false),

            className: "button5",

        },



        {

            key: "purgeColumn",

            label: "吹扫系统",

            onClick: () => setPurgeColumn(true),

            disabled: isActionDisabled("purgeColumn", methodFlag === 0),

            className: "button1",

        },
           {
            key: "save",
            label: "保存",
            onClick: () => handleOkRest(),
            disabled: isActionDisabled("save", methodFlag === 0),
            className: "button4",
        },

    ];

    const statusItemWidths = {
        power: "90px",
        pressure: "120px",
        operatingTime: "130px",
        pumpA: "170px",
        pumpB: "170px",
        detector: "130px",
        tube: "110px",
    };

    const getStatusItemStyle = (width) =>
        width ? { "--machine-status-item-width": width } : undefined;

    return (

        <Flex gap="middle" wrap className="flex">

            {contextHolder}

            <FloatB

                warningCode={warningCode}

                dynamicHeight={dimensions.height}

                callback={handleDynamicLine}

                onDeviceStatusChange={(status) => setDeviceStatus(status)}

                onOperatingTimeChange={(time) => setOperatingTime(time)}

            />

            <Layout>

                {/* 顶部机器状态栏 */}

                <div className="machine-status-bar">

                    <div className="machine-status-bar__content">

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(statusItemWidths.power)}
                        >

                            <span className="machine-status-bar__label">

                                设备

                            </span>

                            <span

                                className={`machine-status-bar__value ${

                                    deviceStatus?.PowerStatus?.value

                                        ? "status-on"

                                        : "status-off"

                                }`}

                            >

                                {deviceStatus?.PowerStatus?.value

                                    ? "接通"

                                    : "断开"}

                            </span>

                        </div>

                        <div className="machine-status-bar__separator"></div>

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(
                                statusItemWidths.pressure
                            )}
                        >

                            <span className="machine-status-bar__label">

                                压力

                            </span>

                            <span className="machine-status-bar__value">

                                {typeof pressureValue === "number"

                                    ? pressureValue.toFixed(3)

                                    : pressureValue || "0.000"}

                            </span>

                        </div>

                        <div className="machine-status-bar__separator"></div>

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(
                                statusItemWidths.operatingTime
                            )}
                        >

                            <span className="machine-status-bar__label">

                                运行时间

                            </span>

                            <span className="machine-status-bar__value">

                                {operatingTime}H

                            </span>

                        </div>

                        <div className="machine-status-bar__separator"></div>

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(statusItemWidths.pumpA)}
                        >

                            <span className="machine-status-bar__label">

                                泵A-{(pumpALabel)}

                            </span>

                            <span className="machine-status-bar__value">

                                {(deviceStatus?.PumpASpeed?.value).toFixed(2)}{" "}

                                ml/min

                            </span>

                        </div>

                        <div className="machine-status-bar__separator"></div>

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(statusItemWidths.pumpB)}
                        >

                            <span className="machine-status-bar__label">

                                                                泵B-{(pumpBLabel)}


                            </span>

                            <span className="machine-status-bar__value">

                                {(deviceStatus?.PumpBSpeed?.value).toFixed(2)}{" "}

                                ml/min

                            </span>

                        </div>

                        <div className="machine-status-bar__separator"></div>

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(
                                statusItemWidths.detector
                            )}
                        >

                            <span className="machine-status-bar__label">

                                检测器

                            </span>

                            <span className="machine-status-bar__value">

                                {typeof deviceStatus?.Detector?.value ===

                                "number"

                                    ? deviceStatus.Detector.value.toFixed(3)

                                    : deviceStatus?.Detector?.value || "0.000"}

                            </span>

                        </div>

                        <div className="machine-status-bar__separator"></div>

                        <div
                            className="machine-status-bar__item"
                            style={getStatusItemStyle(statusItemWidths.tube)}
                        >

                            <span className="machine-status-bar__label">

                                当前试管

                            </span>

                            <span className="machine-status-bar__value">

                                {deviceStatus?.CurrentTube?.value || "-"}

                            </span>

                        </div>

                    </div>

                </div>



                <div className="top-section">

                    {/* D3图表区域 */}

                    <Row gutter={3}>

                        <Col span={24} style={{ padding: "0 0px" } }>

                            <div className="lineStyle overlayBox">

                                <div className="line_line overlayBox1">

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

                            </div>

                        </Col>

                    </Row>



                    <Row gutter={0} style={{ marginTop: "0px" }}>

                        <Col span={24}>



                                            <div className="control-panel">

                                                <div className="control-panel__buttons-grid">

                                                    {actionButtons.map(

                                                        ({

                                                            key,

                                                            label,

                                                            onClick,

                                                            disabled,

                                                            danger,

                                                            className:

                                                                customClass,

                                                        }) => (

                                                            <Button

                                                                key={key}

                                                                type="primary"

                                                                danger={danger}

                                                                size="middle"

                                                                className={`control-panel__button ${

                                                                    customClass ||

                                                                    ""

                                                                }`.trim()}

                                                                onClick={

                                                                    onClick

                                                                }

                                                                disabled={

                                                                    disabled

                                                                }

                                                            >

                                                                {label}

                                                            </Button>

                                                        )

                                                    )}

                                                </div>
                                                 <Row

                                                gutter={16}

                                                className="bottom-panels"

                                            >

                                                <Col span={15}>

                                                    <div className="panel-section">

                                                        {num.length >= 0 &&

                                                        methodFlag !== 0 ? (

                                                            <div className="buttonTubeFun">
  <Row> <Col

                                                                        span={22}

                                                                    >

                                                                <Buttons

                                                                    num={num}

                                                                    callback={

                                                                        handleReceiveFlags

                                                                    }

                                                                    selected={

                                                                        selected_reverse

                                                                    }

                                                                    clean_flag={

                                                                        clean_flag

                                                                    }

                                                                    isScrollable={

                                                                        isScrollable

                                                                    }

                                                                    selectedAllTubes={

                                                                        selectedAllTubes

                                                                    }

                                                                    reverseFlag={

                                                                        reverseFlag

                                                                    }
                                                                    methodRefreshKey={
                                                                        methodRefreshKey
                                                                    }

                                                                ></Buttons>

                                                              </Col>

                                                                    <Col

                                                                        span={2}

                                                                    >
                                                                        <div className="retain_button">
                                                                        <Row>
 <Button

                                                                            type="primary"

                                                                            className={`button button1`}

                                                                            onClick={() =>

                                                                                retainFlags()

                                                                            }

                                                                        >

                                                                            保留

                                                                        </Button>

                                                                        </Row>

                                                                       <Row>
 <Button

                                                                            type="primary"

                                                                            className={`button button2`}

                                                                            onClick={() =>

                                                                                abandonFlags()

                                                                            }

                                                                        >

                                                                            废弃

                                                                        </Button>
                                                                       </Row>
                                                                        <Row>
                                                                          <Button

                                                                            type="primary"

                                                                            className={`button button3`}

                                                                            onClick={() =>

                                                                                reverseFlags()

                                                                            }

                                                                        >

                                                                            反转

                                                                        </Button>

                                                                       </Row>
                                                                        <Row>
                                                                           <Button

                                                                            type="primary"

                                                                            className={`button button4`}

                                                                            onClick={() =>

                                                                                clean()

                                                                            }

                                                                        >

                                                                            清洗

                                                                        </Button>
                                                                       </Row>
</div>
                                                                    </Col>

                                                                  
                                                                </Row>

                                                            </div>

                                                        ) : (

                                                            <Empty

                                                                image={

                                                                    Empty.PRESENTED_IMAGE_SIMPLE

                                                                }

                                                                imageStyle={{

                                                                    height: 100,

                                                                }}

                                                                description={

                                                                    <span>

                                                                        暂无试管

                                                                    </span>

                                                                }

                                                            />

                                                        )}

                                                    </div>

                                                </Col>

                                                <Col span={9}>

                                                    <div className="panel-section">

                                                        <TaskTable

                                                            selected_tubes={

                                                                selected_tubes

                                                            }

                                                            title={""}

                                                            buttonFlag={1}

                                                            callback={

                                                                undoReceiveFlags

                                                            }

                                                            selectedAllTubes={

                                                                selectedTask

                                                            }

                                                            runningInfo={

                                                                runningTaskInfo

                                                            }

                                                            excuteTaskFlag={

                                                                excuteTaskFlag

                                                            }

                                                        ></TaskTable>

                                                    </div>

                                                </Col>

                                            </Row>
                                            </div>




                        </Col>

                    </Row>

                </div>

            </Layout>

            <Modal

                title="初始化"

                open={openStart}

                onOk={start}

                confirmLoading={confirmLoading}

                onCancel={handleCancel}

                styles={{ content: { backgroundColor: '#1A2030', color: '#fff' }, header: { backgroundColor: '#1A2030', color: '#fff' }, body: { backgroundColor: '#1A2030', color: '#fff' }, footer: { backgroundColor: '#1A2030' } }}
                closeIcon={<span style={{ color: '#fff' }}>✕</span>}
             

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

                        
                        backgroundColor:"#1A2030"

                    }}

                    initialValues={{

                        tube_id: inputTubeId,

                        module_id: inputModuleId,

                        detector_zeroing: true,

                        waste_mode: false,

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

                        label="废弃模式："

                        name="waste_mode"

                        valuePropName="checked"

                    >

                        <Checkbox></Checkbox>

                    </Form.Item>

                    <Form.Item label="开始模块：">

                        <Form.Item name="module_id" >

                            <InputNumber

                                min={minModuleId}

                                max={maxModuleId}

                                onChange={handleInputNumberChange}

                            />

                        </Form.Item>

                    </Form.Item>

                    <Form.Item label="开始试管：">

                        <Form.Item name="tube_id" >

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

                okText="保存"

                cancelText="不保存"

                title="复位确认"

                className="industrial-warning-modal"

                centered

            >

                <p>是否保存实验数据?</p>

            </Modal>

            <Modal

                title="暂停设置"

                open={openPause}

                onOk={handlePauseOk}

                onCancel={handlePauseCancel}

            >

                <Form form={pauseForm} layout="vertical">

                    <Form.Item

                        label="Value"

                        name="value"

                        rules={[{ required: true, message: "请输入value值" }]}

                    >

                        <InputNumber style={{ width: "100%" }} />

                    </Form.Item>

                    <Form.Item

                        label="New Rate"

                        name="new_rate"

                        rules={[

                            { required: true, message: "请输入new_rate值" },

                        ]}

                    >

                        <InputNumber style={{ width: "100%" }} />

                    </Form.Item>

                </Form>

            </Modal>

            <Modal

                title="手动保持"

                open={openManualHold}

                onCancel={() => setOpenManualHold(false)}

                footer={null}

            >

                <div style={{ textAlign: "right" }}>

                    <Button

                        type="primary"

                        onClick={() => {

                            SetManualHoldAPI({ hold_enabled: true }).then(

                                () => {

                                    messageApi.open({

                                        type: "success",

                                        content: "已启用手动保持",

                                    });

                                    setOpenManualHold(false);

                                }

                            );

                        }}

                        style={{ marginRight: 8 }}

                    >

                        开启

                    </Button>

                    <Button

                        onClick={() => {

                            SetManualHoldAPI({ hold_enabled: false }).then(

                                () => {

                                    messageApi.open({

                                        type: "success",

                                        content: "已关闭手动保持",

                                    });

                                    setOpenManualHold(false);

                                }

                            );

                        }}

                    >

                        关闭

                    </Button>

                </div>

            </Modal>

            <Modal

                title="废弃模式"

                open={openWasteModel}

                onCancel={() => setOpenWasteModel(false)}

                footer={null}

            >

                <div style={{ textAlign: "right" }}>

                    <Button

                        type="primary"

                        onClick={() => {

                            wasteMode({ waste_mode: true }).then(() => {

                                messageApi.open({

                                    type: "success",

                                    content: "已启用废弃模式",

                                });

                                setOpenWasteModel(false);

                            });

                        }}

                        style={{ marginRight: 8 }}

                    >

                        开启

                    </Button>

                    <Button

                        onClick={() => {

                            wasteMode({ waste_mode: false }).then(() => {

                                messageApi.open({

                                    type: "success",

                                    content: "已关闭废弃模式",

                                });

                                setOpenWasteModel(false);

                            });

                        }}

                    >

                        关闭

                    </Button>

                </div>

            </Modal>

            <Modal

                title="润柱"

                open={openEquilibration}

                onCancel={handleEquilibrationStop}

                footer={null}

            >

                <div style={{ textAlign: "center", padding: "20px" }}>

                    <p>是否开始润柱？</p>

                    <div style={{ marginTop: "20px" }}>

                        <Button

                            type="primary"

                            onClick={handleEquilibrationStart}

                            loading={equilibrationLoading}

                            style={{ marginRight: "10px" }}

                        >

                            开始

                        </Button>

                        <Button onClick={handleEquilibrationStop}>结束</Button>

                    </div>

                </div>

            </Modal>

            <Modal

                title="吹扫系统"

                open={purgeColumn}

                onCancel={handlePurgeColumnStop}

                footer={null}

            >

                <div style={{ textAlign: "center", padding: "20px" }}>

                    <p>是否开始吹扫？</p>

                    <div style={{ marginTop: "20px" }}>

                        <Button

                            type="primary"

                            onClick={handlePurgeColumnStart}

                            loading={purgeColumnLoading}

                            style={{ marginRight: "10px" }}

                        >

                            开始

                        </Button>

                        <Button onClick={handlePurgeColumnStop}>结束</Button>

                    </div>

                </div>

            </Modal>

            <Modal

                title="自动梯度参数设置"

                open={openAutoGradientModal}

                onOk={handleAutoGradientOk}

                onCancel={handleAutoGradientCancel}

                confirmLoading={autoGradientLoading}

                okText="保存"

                cancelText="取消"

                width={800}

            >

                <Form

                    form={autoGradientForm}

                    layout="vertical"

                    initialValues={{

                        start_ratio: 0,

                        end_ratio: 100,

                        n1_volumes: 1,

                        gradient_rate: 5,

                        peak_threshold: 0.1,

                        column_volume: 1.0,

                        sg_window: 5,

                        sg_order: 2,

                        baseline_window: 10,

                        k_factor: 1.0,

                    }}

                >

                    <Row gutter={8}>

                        <Col span={8}>

                            <Form.Item

                                label={<span>start_ratio 起始比例</span>}

                                name="start_ratio"

                                tooltip="梯度开始时溶剂B的体积分数(%)"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入起始比例",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    max={100}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>end_ratio 终止比例</span>}

                                name="end_ratio"

                                tooltip="梯度结束时溶剂B的体积分数(%)"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入终止比例",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    max={100}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>n1_volumes N1柱体积倍数</span>}

                                name="n1_volumes"

                                tooltip="首段恒流持续的柱体积数"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入柱体积倍数",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>gradient_rate 梯度速率</span>}

                                name="gradient_rate"

                                tooltip="流动相B比例变化速率(%/柱体积)"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入梯度速率",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>peak_threshold 峰检测阈值</span>}

                                name="peak_threshold"

                                tooltip="判定峰起始/结束的信号阈值"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入峰检测阈值",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>column_volume 柱体积</span>}

                                name="column_volume"

                                tooltip="柱子实际总内体积(mL)"

                                rules={[

                                    { required: true, message: "请输入柱体积" },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>sg_window 平滑窗口宽度</span>}

                                name="sg_window"

                                tooltip="Savitzky-Golay平滑窗口点数"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入平滑窗口宽度",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>sg_order 平滑多项式阶数</span>}

                                name="sg_order"

                                tooltip="Savitzky-Golay多项式拟合阶数"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入平滑多项式阶数",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={

                                    <span>baseline_window 基线窗口宽度</span>

                                }

                                name="baseline_window"

                                tooltip="基线校正参考窗口点数"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入基线窗口宽度",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                        <Col span={8}>

                            <Form.Item

                                label={<span>k_factor 灵敏度系数K</span>}

                                name="k_factor"

                                tooltip="调整峰检测灵敏度的倍率系数"

                                rules={[

                                    {

                                        required: true,

                                        message: "请输入灵敏度系数",

                                    },

                                ]}

                            >

                                <InputNumber

                                    min={0}

                                    style={{ width: "100%" }}

                                />

                            </Form.Item>

                        </Col>

                    </Row>

                </Form>

            </Modal>

        </Flex>

    );

};

export default App;

