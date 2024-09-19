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
import Buttons from "@components/button/index";
import TaskList from "@components/taskList/index";
import FloatB from "@components/floatB/index";
import TaskTable from "@components/table/taskTable";
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
} from "../../api/eluent_curve";
import {
    startEquilibration,
    setCurrentMethodOperate,
    uploadMethodOperate,
} from "../../api/methods";
import { getDeviceStatus, postDeviceStatus } from "../../api/status";
import { uploadMethodFlag } from "../../api/methods";
import { timeout } from "d3";
import moment from "moment";
import { getTube } from "@/models/chromatograph/api/tube";

import io from "socket.io-client";

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

const App = () => {
    const [loading, setLoading] = React.useState(false);
    const [lineLoading, setLineLoading] = useState(false);

    // const [nums, setNum] = useState(num);
    const [data, setData] = useState([]);
    const [num, setNum] = useState([]);
    //清洗标志，当0时，所有试管禁用，当1时，所有试管可以选择。
    const [clean_flag, setCleanFlag] = useState(0);
    //方法，当0时，所有按钮禁用，当1时，所有按钮可以正常使用。

    const [methodFlag, setMethodFlag] = useState(0);
    //  1 可以修改折线 0 不可以修改折线
    const [lineFlag, setLineFlag] = useState(1);

    const [selected_reverse, setSelectedReverse] = useState([]);

    const [linePoint, setLine] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const [warningCode, setWaringCode] = useState(0);

    const [pumpStatus, setPumpStatus] = useState({});
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
    const [currentTaskId, setCurrentTaskId] = useState();
    const [excuteTaskFlag, setExcuteTaskFlag] = useState();

    const [openStart, setOpenStart] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [minTubeId, setMinTubeId] = useState(1); // 默认最小值
    const [maxTubeId, setMaxTubeId] = useState(10); // 默认最大值
    const [inputTubeId, setInputTubeId] = useState(minTubeId); // 默认值为 minTubeId
    const handleInputNumberChange = (value) => {
        setInputTubeId(value);
    };
    const [form] = Form.useForm(); // 获取表单实例

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
            console.log("data", data);
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
            setWaringCode(responseData.code);
            console.log("responseData---------------------", responseData.code);
            console.log("warningCode :", warningCode);
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
                responseData.flag
            );
            setExcuteTaskFlag(responseData.flag);
            setCurrentTaskId(responseData.task_id);
            excute_status = responseData.flag;
            // updateExcuteTask(currentTubeId, responseData.task_id);
        });
        socket.on("equilibration_flag", (responseData) => {
            if (responseData.flag === 1) {
                reset();
                flagStartTime = 0;
            }
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
    const handleReceiveFlags = (select_tubes, numss) => {
        console.log("Receive flags", select_tubes);
        selected_tube = select_tubes;
        setNum(numss);
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

    // flag  ： undefined  没被选中   true  保留  false  废弃
    const handleUpdatePoint = (linePointChange) => {
        console.log(
            "-------------------------------------------------linePointChange",
            linePointChange
        );
        newPoints = convertNonNumericValues(linePointChange);
        console.log("linePointChange  newPoints :", newPoints);
        // newPoints = linePointChange;
    };

    const process_data_flag = (selected_tube, flag, color) => {
        let nums = num.map((item) => {
            if (selected_tube.includes(item.tube)) {
                return { ...item, flag: flag, color: color };
            }
            return item;
        });

        setNum(nums);
        // console.log(nums);
    };

    const retainFlags = () => {
        if (selected_tube.length > 0) {
            // let consecutiveArrays = splitConsecutive(selected_tube);
            let consecutiveArrays = [selected_tube];

            consecutiveArrays.forEach((arr) => {
                let new_tube = { tube_list: arr, status: "retain" };
                selected_tubes.push(new_tube);
            });
            if (colorNum != 9) {
                colorNum++;
            } else {
                colorNum = 1;
            }
            process_data_flag(selected_tube, true, colorMap[colorNum]);
            setSelectedReverse([]);
            selected_tube = [];
        } else {
            error();
        }
    };

    const abandonFlags = () => {
        if (selected_tube.length > 0) {
            // let consecutiveArrays = splitConsecutive(selected_tube);
            let consecutiveArrays = [selected_tube];

            consecutiveArrays.forEach((arr) => {
                let new_tube = { tube_list: arr, status: "abandon" };
                selected_tubes.push(new_tube);
            });
            // let new_tube = { tube_list: selected_tube, status: "discard" };
            // selected_tubes = [...selected_tubes, new_tube];
            let color = 0;

            process_data_flag(selected_tube, false, colorMap[color]);
            setSelectedReverse([]);
            selected_tube = [];
        } else {
            error();
        }
    };

    const reverseFlags = () => {
        console.log("selected_tubes :", selected_tubes);
        console.log("num :", num);
        if (selected_tubes.length > 0) {
            setSelectedReverse(selected_tubes);
            let reverse = num.filter(
                (item) =>
                    !selected_reverse.includes(item.tube) &&
                    item.flag == undefined
            );
            let selected_r = reverse.map((item) => item.tube);
            setSelectedReverse(selected_r);
            selected_tube = selected_r;
            console.log("selected_tube :", selected_tube);
            setNum(selected_reverse);
            handleReceiveFlags(selected_reverse, num);
        } else {
            error();
        }
    };

    const updateExcuteTask = (tubeId, taskId) => {
        console.log("9011     taskId :", taskId);
        console.log("9011     tubeId :", tubeId);
        console.log("0913  5   excutedTubes", excutedTubes);
        if (excutedTubesUpdateFlag) {
            excuted_tubes = excutedTubes;
            excuted_tubes.forEach((task) => {
                if (task.task_id === taskId) {
                    task.currentTubeId = tubeId;
                    task.flag = excute_status;
                }
            });
            console.log("0913  3   excuted_tubes", excuted_tubes);
            console.log("0913  4   excutedTubes", excutedTubes);

            setExcutedTubes((prevExcutedTubes) => {
                return [...excuted_tubes];
            });
            console.log("0911  2   excutedTubes", excutedTubes);
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
                    tube_list: selected_tubes[index].tube_list,
                    status: selected_tubes[index].status,
                    method_id: Number(methodId),
                    task_id: Number(taskId),
                };
            });
            excutedTubesUpdateFlag = false;
            // 将任务数组添加到状态中
            setExcutedTubes((prevExcutedTubes) => [
                ...prevExcutedTubes,
                ...tasks,
            ]);
            for (const task of tasks) {
                const response = getTube({ task_list: task });
            }
        } else if (result[0].flag === "delete") {
            const indexesToDelete = new Set(result.map((item) => item.index));
            // 处理被删除的元素
            indexesToDelete.forEach((index) => {
                const tubeList = selected_tubes[index].tube_list;
                process_data_flag(tubeList, undefined);
            });
            selected_tubes = selected_tubes.filter((item, index) => {
                return !indexesToDelete.has(index);
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
            setLineLoading(true);
            if (flagStartTime == 1) {
                setOpenStart(true);
            } else {
                startEluentLine().then((responsedata) => {
                    // console.log("responsedata :", responsedata);
                });
            }
        }
    };
    const handleStart = () => {
        form.validateFields()
            .then((values) => {
                console.log("0919  Form values:", values);
                initLine({
                    detector_zeroing: values.detector_zeroing,
                    tube_id: values.tube_id,
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
        //  else {
        //   messageApi.open({
        //       type: "success",
        //       content: "开始实验",
        //   });
        // }
        setCleanFlag(0);
        // console.log("Starting");

        setLoading(true);
        console.log("0919  flagStartTime", flagStartTime);
        console.log("0919  ----------1------");

        if (flagStartTime == 1) {
            reset();
            handleStart();

            startTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            // console.log("startTime --------------------:", startTime);
            flagStartTime = 0;
        } else {
            console.log("0919  ----------2------", flagStartTime);
        }
        console.log("0919  ----------3------", flagStartTime);

        updateEluentLine({
            point: Object.values(newPoints),
            start_time: startTime,
        })
            .then((responseData) => {
                console.log("responseData :", responseData);
            })
            .catch((error) => {
                console.log(error);
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
        terminateEluentLine().then((responseData) => {
            // console.log("responseData :", responseData);
        });
    };

    const pause = () => {
        setLineLoading(false);
        pauseEluentLine().then((responseData) => {
            // console.log("responseData :", responseData);
        });
    };

    const reset = () => {
        setExcutedTubes((prevExcutedTubes) => []);

        setCleanFlag(0);
        flagStartTime = 1;
        getEluentLine().then((responseData) => {
            setLine(responseData.data.point);
        });
        setData(() => []);
        setNum(() => []);
        setSelectedReverse([]);
        selected_tubes = [];
    };
    const uploadMethod = () => {
        // localStorage.setItem("methodId", methodID);
        uploadMethodOperate().then((response) => {});
    };
    const clean = () => {
        setData(() => []);
        setSelectedReverse([]);

        setNum([]);

        setCleanFlag(1);
        console.log("clean_flag--- :", clean_flag);
        if (selected_tube.length > 0) {
            // let consecutiveArrays = splitConsecutive(selected_tube);
            let consecutiveArrays = [selected_tube];
            console.log("clean_flag selected_tube :", selected_tube);
            console.log("clean_flag consecutiveArrays :", consecutiveArrays);
            consecutiveArrays.forEach((arr) => {
                let new_tube = { tube_list: arr, status: "clean" };
                selected_tubes.push(new_tube);
            });
            if (colorNum != 9) {
                colorNum++;
            } else {
                colorNum = 1;
            }
            process_data_flag(selected_tube, true, colorMap[colorNum]);
            setSelectedReverse([]);
            selected_tube = [];
        }
        // else {
        //     error();
        // }
    };

    const getStatus = () => {
        getDeviceStatus().then((responseData) => {
            // console.log("getStatus   responseData :", responseData.data);
            let status = JSON.parse(responseData.data.pump_status);
            // console.log("getStatus status :", status);
            setPumpStatus(status);
            // console.log("getStatus pumpStatus :", pumpStatus);
        });
    };

    const handleStatus = (type, status) => {
        console.log("handleStatus ---status :", status);
        console.log("handleStatus ---type :", type);
        postDeviceStatus({ type: type, status: JSON.stringify(status) }).then();
    };

    useEffect(() => {
        uploadMethodFlag().then((responsedata) => {
            setUploadFlag(responsedata.data.upload_flag);
            setEquilibrationFlag(responsedata.data.equilibration_flag);
        });
        reset();
        // setData([])
        getEluentLine().then((responseData) => {
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
        });
        getStatus();
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
        // let rubePoint = [];
        // for (let i = 1; i < 41; i++) {
        //     rubePoint.push({ timeStart: "", timeEnd: "", tube: i });
        // }
        // setNum((prevNum) => rubePoint); // 更新状态
    }, [samplingTime, uploadFlag]);

    return (
        <Flex gap="middle" wrap className="flex">
            {contextHolder}
            <FloatB
                warningCode={warningCode}
                pumpStatus={pumpStatus}
                callback={handleStatus}
                newPoints={newPoints}
                dynamicHeight={dimensions.height}
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
                                            className={`button button4`}
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

                                <div className="buttonTube">
                                    {/* {num.length > 0 ? (
                                    <Buttons
                                        num={num}
                                        selected={selected_reverse}
                                        callback={handleReceiveFlags}
                                    ></Buttons>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        imageStyle={{ height: 0 }}
                                        description={<span>暂无试管</span>}
                                    />
                                )} */}
                                    <Buttons
                                        num={num}
                                        callback={handleReceiveFlags}
                                        selected={selected_reverse}
                                        clean_flag={clean_flag}
                                    ></Buttons>
                                </div>

                                <div className="buttonTubeFun">
                                    <Button
                                        type="primary"
                                        className={`button button1`} // 使用模板字符串
                                        onClick={() => retainFlags()}
                                        disabled={
                                            clean_flag === 1 || methodFlag === 0
                                                ? true
                                                : false
                                        }
                                    >
                                        保留
                                    </Button>
                                    <Button
                                        type="primary"
                                        className={`button button2`}
                                        onClick={() => abandonFlags()}
                                        disabled={
                                            methodFlag === 0 ? true : false
                                        }
                                    >
                                        废弃
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => reverseFlags()}
                                        className={`button button3`}
                                        disabled={
                                            methodFlag === 0 ? true : false
                                        }
                                    >
                                        反转
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => clean()}
                                        className={`button button4`}
                                        disabled={
                                            methodFlag === 0 ? true : false
                                        }
                                    >
                                        清洗
                                    </Button>
                                </div>
                                {/* </Col>
                                </Row> */}
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
        </Flex>
    );
};
export default App;
