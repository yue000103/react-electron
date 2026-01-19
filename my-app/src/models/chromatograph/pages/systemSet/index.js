import React, { useState, useEffect } from "react";
import {
    QuestionCircleOutlined,
    SyncOutlined,
    SlidersOutlined,
    FireOutlined,
    ThunderboltOutlined,
    LineChartOutlined,
    ApartmentOutlined,
    ApiOutlined,
    RadiusBottomleftOutlined,
} from "@ant-design/icons";
import "./index.css";
import Notice from "./notice";
import FormStatus from "@components/formStatus/index";

import {
    FloatButton,
    Drawer,
    Tabs,
    Table,
    Row,
    Col,
    Tooltip,
    Modal,
    Switch,
    message,
    Spin,
    Input,
    Button,
    InputNumber,
} from "antd";
import DynamicLine from "./dynamicLine";
import DynamicForm from "@components/form/dynamicForm";
import parameterDescription from "../config/parameter_description.json";

import {
    getCodes,
    postInitDeviceMode,
    getInitDeviceMode,
    multiwayValveControl,
    diaphragmPumpControl,
    solenoidValveControl,
    bubbleSensorStatus,
    highPressurePumpControl,
} from "../../api/status";

import io from "socket.io-client";
import StepFlow from "../views/stepFlow";

const translateType = (codeInfo) => {
    if (!codeInfo || !codeInfo.type) {
        return "未知类型";
    }
    // 提取 parameter 数组
    const parameters = parameterDescription.error_type.parameter;
    const descriptions = parameterDescription.error_type.description;

    // 找到 codeInfo.type 对应的索引
    const index = parameters.indexOf(codeInfo.type);

    // 如果找到对应索引，则返回对应的中文描述，否则返回 "未知类型"
    return index !== -1 ? descriptions[index] : "未知类型";

    // 匹配并返回对应的中文描述
};

const App = (props) => {
    const { onDeviceStatusChange, onOperatingTimeChange } = props;
    // console.log("1030 props :", props);

    const [openNotice, setOpenNotice] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [loading, setLoading] = React.useState(true);
    const [size, setSize] = useState();
    const [warningCode, setWarningCode] = useState(0);
    const [peristaltic, setPeristalic] = useState({});

    const [isChecked, setIsChecked] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [spinning, setSpinning] = React.useState(false);
    const [sprayConfig, setSprayConfig] = useState({
        enabled: false,
        frequency: 0,
        interval: 0,
    });
    const [bubblePumpModalOpen, setBubblePumpModalOpen] = useState(false);
    const [pendingBubbleAlarm, setPendingBubbleAlarm] = useState(null);
    const [bubblePumpLoading, setBubblePumpLoading] = useState(false);
    const [bubbleStatus, setBubbleStatus] = useState("");
    const [valveControl, setValveControl] = useState({
        station: 1,
        port: 1,
    });
    const [airPumpEnabled, setAirPumpEnabled] = useState(false);
    const [solenoidControl, setSolenoidControl] = useState({
        id: "",
        enabled: false,
    });

    const [alarmData, setAlarmData] = useState([
        // {
        //     key: "1",
        //     level: 3,
        //     type: "火灾报警",
        //     time: "2024-07-19 12:00:00",
        //     description: "火灾报警描述",
        // },
        // {
        //     key: "2",
        //     level: 4,
        //     type: "烟雾报警",
        //     time: "2024-07-19 12:30:00",
        //     description: "烟雾报警描述",
        // },
    ]);

    useEffect(() => {
        const socket = io("http://localhost:5000"); // 确保 URL 正确
        socket.on("connect", () => {
            // console.log("Connected to WebSocket server");
        });

        socket.on("DeviceStatusEnum", (data) => {
            // console.log("1024   DeviceStatusEnum", data);
            // setDeviceStatus(data.DeviceStatusEnum);
            // 传递机器状态给父组件
            if (onDeviceStatusChange) {
                onDeviceStatusChange(data.DeviceStatusEnum);
            }
        });
        socket.on("OperatingTime", (data) => {
            // console.log("1024   OperatingTime", data);

            // setOperatingTime(data.operating_time);
            // 传递运行时间给父组件
            if (onOperatingTimeChange) {
                onOperatingTimeChange(data.operating_time);
            }
        });

        // Clean up the connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const showDrawerNotice = () => {
        setSize("large");
        setOpenNotice(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 0);
    };
    const onCloseNotice = () => {
        setOpenNotice(false);
    };
    const cleanAllCode = () => {
        setAlarmData([]);
    };
    const showDrawerWarning = () => {
        setSize("large");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 0);
        setOpenWarning(true);
    };
    const onCloseWarning = () => {
        if (alarmData.length > 0) {
            messageApi.warning("请先清除警报后再关闭");
            return;
        }
        setOpenWarning(false);
    };

    const showDrawerSetting = () => {
        setSize("large");

        setTimeout(() => {
            setLoading(false);
        }, 0);
        setOpenSetting(true);
    };
    const onCloseSetting = () => {
        setOpenSetting(false);
        let flag = 1;
        props.callback(flag);
    };

    const alarmColumns = [
        {
            title: "序号",
            dataIndex: "key",
            key: "key",
        },
        {
            title: "报警类型",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "时间",
            dataIndex: "time",
            key: "time",
        },
        {
            title: "描述",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "操作",
            key: "action",
            render: (text, record) => (
                <Button type="primary" onClick={() => cleanCurrentCode(record)}>
                    清除
                </Button>
            ), // 在最后一列添加按钮
        },
    ];
    const removeAlarmRecord = (record) => {
        if (!record) {
            return;
        }
        setAlarmData((prevData) =>
            prevData.filter((item) => item.key !== record.key)
        );
    };

    const markBubbleAlarmHandled = (record) => {
        if (!record) {
            return;
        }
        setAlarmData((prevData) =>
            prevData.map((item) =>
                item.key === record.key
                    ? { ...item, bubbleHandled: true }
                    : item
            )
        );
    };

    const openBubblePumpModal = (record) => {
        setPendingBubbleAlarm(record);
        setBubblePumpModalOpen(true);
    };

    const closeBubblePumpModal = () => {
        setBubblePumpModalOpen(false);
        setPendingBubbleAlarm(null);
    };

    const handleBubblePumpAction = async (enabled) => {
        if (!pendingBubbleAlarm) {
            return;
        }
        setBubblePumpLoading(true);
        try {
            await highPressurePumpControl({ enabled });
            markBubbleAlarmHandled(pendingBubbleAlarm);
        } catch (error) {
            messageApi.error("高压泵控制失败，请重试");
            console.error("高压泵控制失败:", error);
        } finally {
            setBubblePumpLoading(false);
        }
    };

    const handleBubblePumpCancel = () => {
        markBubbleAlarmHandled(pendingBubbleAlarm);
    };

    const cleanCurrentCode = (record) => {
        const codeValue =
            record?.code !== undefined && record?.code !== null
                ? String(record.code)
                : "";
        if (codeValue === "510") {
            if (record?.bubbleHandled) {
                removeAlarmRecord(record);
                return;
            }
            openBubblePumpModal(record);
            return;
        }
        removeAlarmRecord(record);
    };

    const handleOffline = (checked) => {
        postInitDeviceMode({ use_mock: checked }).then((response) => {
            if (!response.error) {
            }
        });
        setSpinning(true);
        setTimeout(() => {
            getInitDeviceMode().then((response) => {
                if (!response.error) {
                    console.log("1015----------response", response.data);
                    if (response.data["message"] === "True") {
                        messageApi.open({
                            type: "success",
                            content: "当前是离线模式",
                        });
                        localStorage.setItem("useMock", true);
                    }
                    if (response.data["message"] === "False") {
                        messageApi.open({
                            type: "success",
                            content: "当前是联机模式",
                        });
                        localStorage.setItem("useMock", false);
                    }
                    setSpinning(false);
                    setIsChecked(checked);
                }
            });
        }, 1000);
    };

    const applySprayDebug = () => {
        const freq = Number(sprayConfig.frequency);
        const duty = Number(sprayConfig.interval);
        if (Number.isNaN(freq) || Number.isNaN(duty)) {
            messageApi.error("请输入有效的频率和间隔");
            return;
        }

        const payload = {
            ifon: sprayConfig.enabled ? 1 : 0,
            freq,
            duty,
        };

        diaphragmPumpControl(payload)
            .then((response) => {
                if (!response.error) {
                    messageApi.success(
                        `喷淋泵：${payload.ifon ? "开启" : "关闭"}，频率 ${freq}，间隔 ${duty}`
                    );
                } else {
                    messageApi.error("喷淋泵控制失败");
                }
            })
            .catch(() => {
                messageApi.error("喷淋泵控制异常");
            });
    };

    const applyValveControl = () => {
        const stationNum = Number(valveControl.station);
        const portNum = Number(valveControl.port);
        if (Number.isNaN(stationNum) || Number.isNaN(portNum)) {
            messageApi.error("请输入有效的阀站号和阀口号");
            return;
        }

        const payload = { valve_num: stationNum, num: portNum };
        multiwayValveControl(payload)
            .then((response) => {
                if (!response.error) {
                    messageApi.success(
                        `阀控制成功：阀站号 ${stationNum}，阀口号 ${portNum}`
                    );
                } else {
                    messageApi.error("阀控制失败");
                }
            })
            .catch(() => {
                messageApi.error("阀控制异常");
            });
    };

    const applyAirPump = () => {
        messageApi.success(`空气泵：${airPumpEnabled ? "开启" : "关闭"}`);
    };

    const applySolenoid = () => {
        const pin = Number(solenoidControl.id);
        if (Number.isNaN(pin)) {
            messageApi.error("请输入有效的阀 ID");
            return;
        }
        const payload = { pin_num: pin, value: solenoidControl.enabled ? 1 : 0 };

        solenoidValveControl(payload)
            .then((response) => {
                if (!response.error) {
                    messageApi.success(
                        `电磁阀：ID ${pin}，${
                            payload.value === 1 ? "开启" : "关闭"
                        } 成功`
                    );
                } else {
                    messageApi.error("电磁阀控制失败");
                }
            })
            .catch(() => {
                messageApi.error("电磁阀控制异常");
            });
    };

    const queryBubbleSensor = () => {
        bubbleSensorStatus()
            .then((response) => {
                if (!response.error) {
                    const statusText =
                        response?.data?.status ?? response?.data ?? "未知状态";
                    setBubbleStatus(statusText);
                    messageApi.info(`气泡传感器状态：${statusText}`);
                } else {
                    messageApi.error("查询气泡传感器状态失败");
                }
            })
            .catch(() => {
                messageApi.error("查询气泡传感器状态异常");
            });
    };

    // 设备状态：独立 1s 轮询（已注释以避免因 props 变化触发）
    // useEffect(() => {
    //     let cancelled = false;
    //     const fetchStatus = () => {
    //         getDeviceStatus().then((res) => {
    //             if (cancelled) return;
    //             if (!res.error) {
    //                 // 鎸夐渶鏇存柊鐘舵€佹垨閫氱煡鐖剁粍浠?
    //             }
    //         });
    //     };
    //     fetchStatus();
    //     const timer = setInterval(fetchStatus, 1000);
    //     return () => {
    //         cancelled = true;
    //         clearInterval(timer);
    //     };
    // }, []);

    useEffect(() => {
        const useMock = localStorage.getItem("useMock");
        setIsChecked(useMock);

        const warningCodeValue = props.warningCode?.code;
        const warningTime = props.warningCode?.time;
        const hasWarning =
            warningTime &&
            warningCodeValue !== undefined &&
            warningCodeValue !== null &&
            String(warningCodeValue) !== "0";

        if (!hasWarning) {
            return;
        }

        showDrawerWarning();
        setWarningCode(warningCodeValue);
        // 获取 codes 数据
        getCodes()
            .then((res) => {
                console.log("1017 res", res);
                const codes = res.data.codes;

                // 根据 props.warningCode 查找对应 message 和 type
                const codeValue = String(props.warningCode.code);
                const codeInfo = codes.find(
                    (code) => String(code.code_id) === codeValue
                );
                const description =
                    codeInfo?.message ||
                    `报警代码: ${props.warningCode.code}`;
                setAlarmData((prevData) => [
                    ...prevData,
                    {
                        key: (prevData.length + 1).toString(),
                        code: Number(codeValue),
                        type: translateType(codeInfo), // 从获取的 codes 中获取 type
                        time: props.warningCode.time,
                        description,
                    },
                ]);
                if (!codeInfo) {
                    console.warn(`未找到报警代码 ${props.warningCode}`);
                }
                console.log("warningCode", warningCode);
            })
            .catch((error) => {
                console.error("获取 codes 失败:", error);
            });

        // console.log("8672 -----------   dynamicHeight :", dynamicHeight);

        console.log("props peristaltic :", peristaltic);
    }, [props.warningCode.code, props.warningCode.time, props.dynamicHeight]);
    return (
        <>
            {contextHolder}

            <FloatButton.Group
                shape="circle"
                style={{
                    top: "7rem",
                }}
            >
                <Tooltip placement="left" title="帮助">
                    <FloatButton
                        // badge={{
                        //     count: 12,
                        // }}
                        icon={<QuestionCircleOutlined />}
                        onClick={showDrawerNotice}
                    />
                </Tooltip>
                <Tooltip placement="left" title="警报">
                    <FloatButton
                        badge={{
                            count: alarmData.length,
                            overflowCount: 999,
                        }}
                        onClick={showDrawerWarning}
                    />
                </Tooltip>
                <Tooltip placement="left" title="设置">
                    <FloatButton
                        icon={<SlidersOutlined />}
                        onClick={showDrawerSetting}
                    />
                </Tooltip>
                <Tooltip placement="left" title="刷新">
                    <FloatButton
                        icon={<SyncOutlined />}
                        onClick={() => window.location.reload()}
                    />
                </Tooltip>

                {/* <FloatButton.BackTop visibilityHeight={0} /> */}
            </FloatButton.Group>
            <Drawer
                title="帮助"
                onClose={onCloseNotice}
                open={openNotice}
                loading={loading}
                size={size}
            >
                <Notice />
            </Drawer>
            <Drawer
                title="警报日志"
                onClose={onCloseWarning}
                open={openWarning}
                loading={loading}
                size={size}
            >
                <div>
                    <Row style={{ marginBottom: 16 }}>
                        <Col>
                            <Button type="primary" onClick={cleanAllCode}>
                                清除所有警报
                            </Button>
                        </Col>
                    </Row>
                    <Table
                        columns={alarmColumns}
                        dataSource={alarmData}
                        pagination={false}
                    />
                </div>
            </Drawer>
            <Drawer
                title="设置"
                onClose={onCloseSetting}
                open={openSetting}
                loading={loading}
                size={size}
            >
                <Spin spinning={spinning}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                是否开启离线模式
                            </div>
                            <Switch
                                checkedChildren="开启"
                                unCheckedChildren="关闭"
                                checked={isChecked}
                                onChange={handleOffline}
                            />
                        </div>

                        <div
                            style={{
                                padding: "12px 0",
                                borderTop: "1px solid #f0f0f0",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                喷淋泵调试
                            </div>
                            <Row gutter={12} align="middle">
                                <Col>
                                    <Switch
                                        checkedChildren="开"
                                        unCheckedChildren="关"
                                        checked={sprayConfig.enabled}
                                        onChange={(v) =>
                                            setSprayConfig((p) => ({
                                                ...p,
                                                enabled: v,
                                            }))
                                        }
                                    />
                                </Col>
                                <Col>
                                    <InputNumber
                                        min={0}
                                        placeholder="频率"
                                        value={sprayConfig.frequency}
                                        onChange={(v) =>
                                            setSprayConfig((p) => ({
                                                ...p,
                                                frequency: v || 0,
                                            }))
                                        }
                                    />
                                </Col>
                                <Col>
                                    <InputNumber
                                        min={0}
                                        placeholder="间隔"
                                        value={sprayConfig.interval}
                                        onChange={(v) =>
                                            setSprayConfig((p) => ({
                                                ...p,
                                                interval: v || 0,
                                            }))
                                        }
                                    />
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        onClick={applySprayDebug}
                                    >
                                        执行
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <div
                            style={{
                                padding: "12px 0",
                                borderTop: "1px solid #f0f0f0",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                阀控制
                            </div>
                            <Row gutter={12} align="middle">
                                <Col>
                                    <InputNumber
                                        min={1}
                                        placeholder="阀站号"
                                        value={valveControl.station}
                                        onChange={(v) =>
                                            setValveControl((p) => ({
                                                ...p,
                                                station: v || 1,
                                            }))
                                        }
                                    />
                                </Col>
                                <Col>
                                    <InputNumber
                                        min={1}
                                        placeholder="阀口号"
                                        value={valveControl.port}
                                        onChange={(v) =>
                                            setValveControl((p) => ({
                                                ...p,
                                                port: v || 1,
                                            }))
                                        }
                                    />
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        onClick={applyValveControl}
                                    >
                                        执行
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <div
                            style={{
                                padding: "12px 0",
                                borderTop: "1px solid #f0f0f0",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                电磁阀控制
                            </div>
                            <Row gutter={12} align="middle">
                                <Col>
                                    <Input
                                        placeholder="阀 ID"
                                        value={solenoidControl.id}
                                        onChange={(e) =>
                                            setSolenoidControl((p) => ({
                                                ...p,
                                                id: e.target.value,
                                            }))
                                        }
                                        style={{ width: 140 }}
                                    />
                                </Col>
                                <Col>
                                    <Switch
                                        checkedChildren="开"
                                        unCheckedChildren="关"
                                        checked={solenoidControl.enabled}
                                        onChange={(v) =>
                                            setSolenoidControl((p) => ({
                                                ...p,
                                                enabled: v,
                                            }))
                                        }
                                    />
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        onClick={applySolenoid}
                                    >
                                        执行
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <div
                            style={{
                                padding: "12px 0",
                                borderTop: "1px solid #f0f0f0",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                气泡传感器状态: {bubbleStatus || "--"}
                            </div>
                            <Button onClick={queryBubbleSensor}>查询</Button>
                        </div>

                        <div
                            style={{
                                padding: "12px 0",
                                borderTop: "1px solid #f0f0f0",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                步骤流程
                            </div>
                            <StepFlow />
                        </div>
                    </div>
                </Spin>
            </Drawer>
            <Modal
                title="排气泡提示"
                open={bubblePumpModalOpen}
                onCancel={closeBubblePumpModal}
                footer={[
                    <Button
                        key="start"
                        type="primary"
                        loading={bubblePumpLoading}
                        onClick={() => handleBubblePumpAction(true)}
                    >
                        开始排气泡
                    </Button>,
                    <Button
                        key="stop"
                        loading={bubblePumpLoading}
                        onClick={() => handleBubblePumpAction(false)}
                    >
                        结束排气泡
                    </Button>,
                    <Button
                        key="cancel"
                        disabled={bubblePumpLoading}
                        onClick={handleBubblePumpCancel}
                    >
                        取消排气泡
                    </Button>,
                ]}
            >
                <p>是否启动高压泵开始排气泡？</p>
                <p>请将色谱柱上面的管子拆卸下来，拿烧杯接着。</p>
            </Modal>
        </>
    );
};
export default App;
