import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import {
    Form,
    Input,
    Button,
    Switch,
    Row,
    Col,
    InputNumber,
    Radio,
    Select,
    TreeSelect,
    Cascader,
    DatePicker,
    Card,
    Modal,
    Collapse,
    Popconfirm,
    Spin,
    Flex,
    message,
} from "antd";
import {
    SettingOutlined,
    DeleteFilled,
    DeleteOutlined,
    SelectOutlined,
} from "@ant-design/icons";

import "./index.css";
import Line from "@components/d3/line";
import DynamicLine from "@components/d3/dynamicLine";
import FormStatus from "@components/formStatus/index";
import DynamicTable from "@components/table/dynamicTable";
import DynamicForm from "@components/form/dynamicForm";
import DynamicCard from "@components/cards/dynamicCard";

import { getDeviceStatus, postDeviceStatus } from "../../api/status";
import {
    postMethodOperate,
    getAllMethodOperate,
    uploadMethodOperate,
    startEquilibration,
    deleteMethodOperate,
    setCurrentMethodOperate,
    updateMethodOperate,
} from "../../api/methods";
const text = "您确定要删除这个方法？";
let num = [
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 1 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 2 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 3 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 4 },
];
let selected_tubes = [];
let clean_flag = 1;
// let linePoint = [
// { time: "00:01:20", value: 81.41712213857508 },
// { time: "00:01:20", value: 88.51848125394666 },
// { time: "00:01:30", value: 88.51848125394666 },
// { time: "00:01:40", value: 20.51848125394666 },
// ];
let lineFlag = 1;
const handleUpdatePoint = () => {};

const Method = () => {
    const [data, setData] = useState([]);
    const [spinning, setSpinning] = React.useState(false);
    const [percent, setPercent] = React.useState(0);
    const [messageApi, contextHolder] = message.useMessage();
    const [linePoint, setLinePoint] = useState([]);

    const [value, setValue] = useState(1);
    const onChange = (e) => {
        console.log("radio checked", e.target.value);
        setValue(e.target.value);
    };
    const [peristaltic, setPeristalic] = useState({});
    const [spray, setSpray] = useState({});
    const [runningFlag, setRunningFlag] = useState(0);
    const [pumpStatus, setPumpStatus] = useState({});
    const [widthLine, setWidthLine] = useState(270);
    const [heightLine, setHeightLine] = useState(230);
    const [formBasis] = Form.useForm();
    const [formPump] = Form.useForm();
    const [formElution] = Form.useForm();
    const [isEquilibration, setIsEquilibration] = useState(false);
    const [basisData, setBasisData] = useState([]);
    const [elutionData, setElutionData] = useState([]);

    const [pumps, setPumps] = useState([]);
    const [samplingTime, setSamplingTime] = useState(10);
    const [time, setTime] = useState(10);
    const [pressure, setPressure] = useState([]);
    const [open, setOpen] = useState(false);
    const [openMethod, setOpenMethod] = useState(false);
    const [openAllMethod, setOpenAllMethod] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [isMethodName, setIsMethodName] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [methodName, setMethodName] = useState("");
    const [methodDatas, setMethodDatas] = useState([]);
    const [methodID, setMethodID] = useState();
    const [flowRateDefault, setFlowRateDefault] = useState(0);

    console.log("basisData :", basisData);
    console.log("elutionData :", elutionData);

    const columnsConfig = [
        { title: "时间", dataIndex: "time" },
        { title: "泵A浓度", dataIndex: "pumpA" },
        { title: "泵B浓度", dataIndex: "pumpB" },
    ];
    useEffect(() => {
        const socket = io("http://localhost:5000"); // 确保 URL 正确
        socket.on("connect", () => {
            // console.log("Connected to WebSocket server");
        });

        socket.on("new_curve_point", (responseData) => {
            console.log("responseData", responseData);
            setData((prevData) => [...prevData, responseData.point]);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });

        // Clean up the connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const getStatus = () => {
        getDeviceStatus().then((responseData) => {
            console.log("getStatus   responseData :", responseData.data);
            let status = JSON.parse(responseData.data.pump_status);
            console.log("getStatus status :", status);
            setPumpStatus(status);
            console.log("getStatus pumpStatus :", pumpStatus);
            setSpray(status.spray);
            setPeristalic(status.peristaltic);
        });
    };

    const handleSwitchChange = (checked) => {
        setIsEquilibration(checked);
        if (!checked) {
            formBasis.setFieldsValue({
                time: "",
                speed: "",
                totalFlowRate: "",
            });
        }
    };

    const saveMethod = () => {
        const methodId = localStorage.getItem("methodId");
        if (methodId) {
            formBasis.submit();
            formElution.submit();
            formPump.submit();
            setOpenMethod(true);
        } else {
            formBasis.submit();
            formElution.submit();
            formPump.submit();
            showModal();
        }
    };
    const handleOkMethod = () => {
        const methodId = localStorage.getItem("methodId");
        let check = [];
        if (value === 1) {
            check = [{ isocratic: 1 }, { pressure: 0 }];
        } else {
            check = [{ isocratic: 0 }, { pressure: 1 }];
        }
        let methodata = [
            ...basisData,
            ...elutionData,
            ...pumps,
            { pumpList: pressure },
            { methodName: methodName },
            ...check,
        ];
        const transformedData = transformData(methodata);
        updateMethodOperate({
            method_id: methodId,
            method: transformedData,
        }).then((response) => {
            console.log("response :", response);
        });
        setTimeout(() => {
            setOpenMethod(false);
        }, 2000);
    };
    const showModal = () => {
        setOpen(true);
    };
    const showLoader = () => {
        setSpinning(true);
        let ptg = -10;
        const interval = setInterval(() => {
            ptg += 5;
            setPercent(ptg);
            if (ptg > 120) {
                clearInterval(interval);
                setSpinning(false);
                setPercent(0);
                messageApi.open({
                    type: "success",
                    content: "上传成功！",
                });
            }
        }, 100);
    };
    const uploadMethod = () => {
        // localStorage.setItem("methodId", methodID);
        showLoader();
        uploadMethodOperate().then((response) => {});
    };

    const handleMethodOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setConfirmLoading(false);
        }, 2000);
    };
    const allMethod = () => {
        getAllMethodOperate().then((response) => {
            console.log("response :", response.data);
            setMethodDatas(response.data.methods);
        });
        setOpenAllMethod(true);
    };

    const genExtra = (item) => (
        <div>
            <Popconfirm
                placement="topLeft"
                title="您确定要使用这个方法？"
                okText="是"
                cancelText="否"
                onConfirm={(event) => {
                    event.stopPropagation(); // 阻止事件传播，防止折叠面板展开
                    applyMethod(item);
                }}
                onCancel={(event) => {
                    event.stopPropagation();
                }}
            >
                <SelectOutlined
                    style={{ paddingRight: "10px" }}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                />
            </Popconfirm>
            <Popconfirm
                placement="topLeft"
                title="您确定要删除这个方法？"
                okText="是"
                cancelText="否"
                onConfirm={(event) => {
                    event.stopPropagation(); // 阻止事件传播，防止折叠面板展开
                    deleteMethod(item.methodId);
                }}
                onCancel={(event) => {
                    event.stopPropagation();
                }}
            >
                <DeleteOutlined
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                />
            </Popconfirm>
        </div>
    );
    const deleteMethod = (methodId) => {
        deleteMethodOperate({ method_id: methodId }).then((response) => {
            allMethod();
        });
    };
    const applyMethod = (item) => {
        localStorage.setItem("methodId", item.methodId);
        setCurrentMethodOperate({ method_id: Number(item.methodId) }).then(
            (response) => {
                console.log("response :", response.data.methods);
                // applyMethod(response.data.methods[0]);
            }
        );
        setOpenAllMethod(false);
        setMethodName(item.methodName);
        const basisDatas = {
            methodName: item.methodName,
            samplingTime: item.samplingTime,
            tubeVolume: item.tubeVolume,
            detectorWavelength: item.detectorWavelength,
            equilibrationColumn: item.equilibrationColumn === 1 ? true : false,
            time: item.time,
            speed: item.speed,
            totalFlowRate: item.totalFlowRate,
        };
        formBasis.setFieldsValue(basisDatas);
        setSamplingTime(item.samplingTime);
        setIsEquilibration(item.equilibrationColumn);
        if (item.isocratic === 1) {
            setValue(1);
            const elutionDatas = {
                pumpA: item.pumpA,
                pumpB: item.pumpB,
            };
            formElution.setFieldsValue(elutionDatas);
        } else {
            setValue(2);
            setPressure(JSON.parse(item.pumpList));
        }
        const pumpDatas = {
            spray_ready_time: item.spray_ready_time,
            spray_start_time: item.spray_start_time,
            spray_stop_time: item.spray_stop_time,
            peristaltic_velocity: item.peristaltic_velocity,
            peristaltic_acceleration: item.peristaltic_acceleration,
            peristaltic_deceleration: item.peristaltic_deceleration,
        };
        formPump.setFieldsValue(pumpDatas);
    };

    const methodItems = methodDatas.map((item) => ({
        key: item.methodId.toString(),
        label: item.methodName,
        children: (
            <div>
                <table
                    border={"1"}
                    align="center"
                    style={{
                        borderCollapse: "collapse",
                        border: "1px solid #f0f0f0",
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    {" "}
                    <tbody>
                        <tr>
                            <td>采集时间:</td>
                            <td>{item.samplingTime}</td>
                            <td>检测器波长:</td>
                            <td>{item.detectorWavelength}</td>
                            <td>试管容积:</td>
                            <td>{item.tubeVolume}</td>
                            <td>平衡柱子:</td>
                            <td>
                                {item.equilibrationColumn == 1 ? "是" : "否"}
                            </td>
                        </tr>

                        <tr></tr>

                        {item.equilibrationColumn == 1 ? (
                            <>
                                <tr>
                                    <td>速度:</td>
                                    <td>{item.speed}</td>
                                    <td>总流速:</td>
                                    <td>{item.totalFlowRate}</td>
                                </tr>
                            </>
                        ) : (
                            <></>
                        )}
                        <tr>
                            <td>模式:</td>
                            <td>
                                {item.isocratic == 1
                                    ? "等度洗脱"
                                    : "二元高压洗脱"}
                            </td>
                        </tr>
                        {item.isocratic == 1 ? (
                            <>
                                <tr>
                                    <td>泵A:</td>
                                    <td>{item.pumpA}</td>
                                    <td>泵B:</td>
                                    <td>{item.pumpB}</td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td>泵速度:</td>
                                <td>
                                    <table
                                        style={{
                                            borderCollapse: "collapse",
                                            border: "1px solid #f0f0f0",
                                            width: "100%",
                                            textAlign: "center",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>时间</th>
                                                <th>泵A</th>
                                                <th>泵B</th>
                                                <th>总流速</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {JSON.parse(item.pumpList).map(
                                                (entry, index) => (
                                                    <tr key={index}>
                                                        <td>{entry.time}</td>
                                                        <td>{entry.pumpA}</td>
                                                        <td>{entry.pumpB}</td>
                                                        <td>
                                                            {entry.flowRate}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>蠕动泵速度:</td>
                            <td>{item.peristaltic_velocity}</td>
                            <td>蠕动泵加速度:</td>
                            <td>{item.peristaltic_acceleration}</td>
                            <td>蠕动泵减速度:</td>
                            <td>{item.peristaltic_deceleration}</td>
                            <td>喷淋准备时间:</td>
                            <td>{item.spray_ready_time}</td>
                        </tr>

                        <tr></tr>

                        <tr></tr>
                        <tr>
                            <td>喷淋开始时间:</td>
                            <td>{item.spray_start_time}</td>
                            <td>喷淋停止时间:</td>
                            <td>{item.spray_stop_time}</td>
                        </tr>
                        <tr></tr>
                    </tbody>
                </table>
            </div>
        ),
        extra: genExtra(item),
    }));
    const onFinishBasis = (values) => {
        const data = Object.keys(values)
            .map((key) => {
                if (key !== "balanced") {
                    return { [key]: Number(values[key]) };
                }
                return null;
            })
            .filter((item) => item !== null);
        setBasisData(data);
    };
    const onFinishElution = (values) => {
        const data = Object.keys(values)
            .map((key) => {
                return { [key]: Number(values[key]) };
            })
            .filter((item) => item !== null);
        setElutionData(data);
    };
    const onFinishPump = (values) => {
        const data = Object.keys(values)
            .map((key) => {
                if (key !== "balanced") {
                    return { [key]: Number(values[key]) };
                }
                return null;
            })
            .filter((item) => item !== null);

        setPumps(data);
    };
    const basisValuesChange = (changedValues, allValues) => {
        setFlowRateDefault(allValues.totalFlowRate);
        setSamplingTime(Number(allValues.samplingTime));
        console.log("7890-----totalFlowRate", allValues.totalFlowRate);

        setTime((Number(allValues.time) / 60).toFixed(2));
    };

    const getPressurreData = () => {};

    const handleValuesChange = (values) => {
        let newPoints = [];
        if (values.users.length === 0) {
            newPoints = [
                { time: 0, pumpB: 0, pumpA: 100, flowRate: 100 },
                {
                    time: samplingTime,
                    pumpB: 0,
                    pumpA: 100,
                    flowRate: 100,
                },
            ];
        } else {
            for (var i = 0; i < values.users.length; i++) {
                if (!values.users[i].flowRate) {
                    values.users[i].flowRate = Number(flowRateDefault);
                }
            }
            // if()
            // const lastPoint = values.users[values.users.length - 1];
            // newPoints = [
            //     { time: 0, pumpB: 0, pumpA: 100 },
            //     {
            //         time: samplingTime,
            //         pumpB: lastPoint.pumpB,
            //         pumpA: lastPoint.pumpA,
            //     },
            // ];
        }
        setPressure([...newPoints, ...values.users]);
    };
    const handleOk = () => {
        setIsMethodName(true);
        setConfirmLoading(true);
        let check = [];
        if (value === 1) {
            check = [{ isocratic: 1 }, { pressure: 0 }];
        } else {
            check = [{ isocratic: 0 }, { pressure: 1 }];
        }
        let methodata = [
            ...basisData,
            ...elutionData,
            ...pumps,
            { pumpList: pressure },
            { methodName: inputValue },
            ...check,
        ];
        const transformedData = transformData(methodata);
        postMethodOperate(transformedData).then((response) => {
            console.log("response :", response);
        });
        console.log("8672  methodata :", methodata);
        setTimeout(() => {
            setIsMethodName(false);
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        setOpen(false);
        setOpenMethod(false);
        setOpenAllMethod(false);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const transformData = (data) => {
        const result = {
            samplingTime: null,
            detectorWavelength: null,
            equilibrationColumn: null,
            time: null,
            speed: null,
            totalFlowRate: null,
            pumpA: null,
            pumpB: null,
            spray_ready_time: null,
            spray_start_time: null,
            spray_stop_time: null,
            peristaltic_velocity: null,
            peristaltic_acceleration: null,
            peristaltic_deceleration: null,
            methodName: null,
            pumpList: null,
        };

        data.forEach((item) => {
            const key = Object.keys(item)[0];
            result[key] = item[key];
        });

        return result;
    };
    const clearMethod = () => {
        console.log();
        localStorage.clear();
        formBasis.resetFields();
        formPump.resetFields();
        formElution.resetFields();
        setPressure([]);
        setCurrentMethodOperate({ method_id: 0 }).then((response) => {});
    };
    useEffect(() => {
        const methodId = localStorage.getItem("methodId");
        console.log("methodId :", methodId);
        if (methodId) {
            setCurrentMethodOperate({ method_id: Number(methodId) }).then(
                (response) => {
                    console.log("response :", response.data.methods);
                    applyMethod(response.data.methods[0]);
                }
            );
        }
        getAllMethodOperate().then((response) => {
            console.log("response :", response.data);
            setMethodDatas(response.data.methods);
        });
    }, []);

    return (
        <Flex gap="middle" vertical>
            {contextHolder}
            <div className="method">
                <>
                    <Row>
                        <DynamicCard
                            position={"top"}
                            title={"历史方法"}
                            height={"300px"}
                        >
                            <div
                                style={{
                                    height: "250px", // 设置折叠面板的固定高度
                                    overflowY: "auto", // 当内容超出高度时显示滚动条
                                    padding: "10px",
                                }}
                            >
                                <Collapse
                                    accordion
                                    items={methodItems}
                                    size="small"
                                />
                            </div>
                        </DynamicCard>
                    </Row>
                    <Row gutter={50}>
                        <Col span={6}>
                            <DynamicCard
                                position={"top"}
                                title={"基础设置"}
                                height={"400px"}
                            >
                                <Form
                                    form={formBasis}
                                    labelCol={{
                                        span: 8,
                                    }}
                                    wrapperCol={{
                                        span: 14,
                                    }}
                                    layout="horizontal"
                                    initialValues={{
                                        equilibrationColumn: false,
                                    }}
                                    size="small"
                                    onFinish={onFinishBasis}
                                    onValuesChange={basisValuesChange}
                                >
                                    <Form.Item
                                        label="方法名称"
                                        name="methodName"
                                    >
                                        <Input disabled={true} />
                                    </Form.Item>
                                    <Form.Item
                                        label="采集时间/min"
                                        name="samplingTime"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="检测器波长"
                                        name="detectorWavelength"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="试管容积/ml"
                                        name="tubeVolume"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="平衡柱子"
                                        name="equilibrationColumn"
                                        valuePropName="checked"
                                    >
                                        <Switch onChange={handleSwitchChange} />
                                    </Form.Item>
                                    <Form.Item label="泵B速度/%" name="speed">
                                        <Input disabled={!isEquilibration} />
                                    </Form.Item>
                                    <Form.Item
                                        label="总流速"
                                        name="totalFlowRate"
                                    >
                                        <Input disabled={!isEquilibration} />
                                    </Form.Item>
                                </Form>
                            </DynamicCard>
                        </Col>
                        <Col span={12}>
                            <DynamicCard
                                position={"top"}
                                title={"洗脱模式"}
                                height={"400px"}
                            >
                                <Row>
                                    <Col span={13}>
                                        <div style={{ marginTop: 13 }}>
                                            <Radio.Group
                                                onChange={onChange}
                                                value={value}
                                            >
                                                <Radio value={1}>
                                                    等度洗脱
                                                </Radio>
                                                <Radio value={2}>
                                                    二元高压梯度
                                                </Radio>
                                            </Radio.Group>
                                        </div>
                                    </Col>
                                    <Col span={4}>
                                        {value === 2 && (
                                            <Col span={4}>
                                                <pre
                                                    style={{
                                                        fontSize: "15px",
                                                        fontWeight: "550",
                                                    }}
                                                >
                                                    {
                                                        "时间     泵A速度    泵B速度    总流速 "
                                                    }
                                                </pre>
                                            </Col>
                                        )}
                                    </Col>
                                </Row>
                                {value === 1 && (
                                    <div className="isocratic">
                                        {" "}
                                        <Form
                                            labelCol={{
                                                span: 8,
                                            }}
                                            wrapperCol={{
                                                span: 14,
                                            }}
                                            layout="horizontal"
                                            initialValues={{
                                                size: "small",
                                            }}
                                            size="small"
                                            form={formElution}
                                            onFinish={onFinishElution}
                                        >
                                            <Form.Item
                                                label="泵A流速"
                                                name="pumpA"
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item
                                                label="泵B流速"
                                                name="pumpB"
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Form>
                                    </div>
                                )}
                                {value === 2 && (
                                    <div className="pressure">
                                        <Row>
                                            <Col span={12}>
                                                <div className="dynamic-line">
                                                    <DynamicLine
                                                        widthLine={widthLine}
                                                        heightLine={heightLine}
                                                        samplingTime={
                                                            samplingTime
                                                        }
                                                        pressure={pressure}
                                                    ></DynamicLine>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <DynamicForm
                                                    flowRateDefault={
                                                        flowRateDefault
                                                    }
                                                    pressure={pressure}
                                                    onValuesChange={
                                                        handleValuesChange
                                                    }
                                                ></DynamicForm>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </DynamicCard>
                        </Col>
                        <Col span={6}>
                            <DynamicCard
                                position={"top"}
                                title={"泵参数"}
                                height={"400px"}
                            >
                                <Form
                                    form={formPump}
                                    labelCol={{
                                        span: 10,
                                    }}
                                    wrapperCol={{
                                        span: 20,
                                    }}
                                    layout="horizontal"
                                    initialValues={{
                                        size: "lager",
                                    }}
                                    size="small"
                                    onFinish={onFinishPump}
                                >
                                    <Form.Item
                                        label="喷雾准备时间"
                                        name="spray_ready_time"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="喷雾开始时间"
                                        name="spray_start_time"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="喷雾停止时间"
                                        name="spray_stop_time"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="蠕动泵速度"
                                        name="peristaltic_velocity"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="蠕动泵加速度"
                                        name="peristaltic_acceleration"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="蠕动泵减速度"
                                        name="peristaltic_deceleration"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Form>
                            </DynamicCard>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={4}>
                            <div className="button-div">
                                <Row>
                                    <Button
                                        type="primary  "
                                        size="large"
                                        className={`button button4`}
                                        onClick={() => saveMethod()}
                                    >
                                        保存
                                    </Button>

                                    {/* <Button
                                        type="primary  "
                                        size="large"
                                        className={`button button2`}
                                        onClick={() => uploadMethod()}
                                    >
                                        上传
                                    </Button> */}

                                    {/* <Button
                                        type="primary  "
                                        size="large"
                                        className={`button button3`}
                                        onClick={() => allMethod()}
                                    >
                                        方法
                                    </Button> */}

                                    <Button
                                        type="primary  "
                                        size="large"
                                        className={`button button5`}
                                        onClick={() => clearMethod()}
                                    >
                                        清空
                                    </Button>
                                </Row>
                                <Modal
                                    open={open}
                                    onOk={handleOk}
                                    confirmLoading={confirmLoading}
                                    onCancel={handleCancel}
                                >
                                    {/* <p>{modalText}</p> */}
                                    <p>方法名称：</p>
                                    <Input
                                        disabled={isMethodName}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                    />
                                </Modal>
                                <Modal
                                    open={openMethod}
                                    onOk={handleOkMethod}
                                    confirmLoading={confirmLoading}
                                    onCancel={handleCancel}
                                >
                                    <p>是否覆盖---{methodName}---此方法？</p>
                                </Modal>
                            </div>
                        </Col>
                    </Row>
                </>
            </div>
            <Spin
                spinning={spinning}
                percent={percent}
                fullscreen
                tip="正在上传......"
            />
        </Flex>
    );
};

export default Method;
