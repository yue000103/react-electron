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
    Card,
    Statistic,
    Tooltip,
    Switch,
    message,
    Spin,
    Input,
    Button,
} from "antd";
import DynamicLine from "./dynamicLine";
import DynamicForm from "@components/form/dynamicForm";
import parameterDescription from "../config/parameter_description.json";

import {
    getDeviceStatus,
    getCodes,
    switchManualTest,
    pumpOperation,
} from "../../api/status";

import io from "socket.io-client";

const translateType = (codeInfo) => {
    // 提取 parameter 数组
    const parameters = parameterDescription.error_type.parameter;
    const descriptions = parameterDescription.error_type.description;

    // 找到 codeInfo.type 对应的索引
    const index = parameters.indexOf(codeInfo.type);

    // 如果找到对应索引，则返回对应的中文描述，否则返回 "未知类型"
    return index !== -1 ? descriptions[index] : "未知类型";

    // 匹配并返回对应的中文描述
};
let lineFlag = 0

const App = (props) => {
    // console.log("1030 props :", props);

    const [openNotice, setOpenNotice] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [loading, setLoading] = React.useState(true);
    const [size, setSize] = useState();
    const [warningCode, setWarningCode] = useState(0);
    const [peristaltic, setPeristalic] = useState({});
    const [pump, setPump] = useState({
        use_manual: false,
        spray_switch: false,
        peristaltic_switch: false,
        drain_speed: 1000,
        clean_volume: 2000,
        clean_count: 1000,
        tube_id: 10,
        module_id: 1,
    });
    const [runningFlag, setRunningFlag] = useState(0);
    const [dynamicHeight, setDynamicHeight] = useState();
    const [isChecked, setIsChecked] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [spinning, setSpinning] = React.useState(false);
   

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

    const [deviceStatus, setDeviceStatus] = useState({
        PowerStatus: { value: false },
        CurrentTube: { value: "0-0" },
        Detector: { value: 0 },
        PumpASpeed: { value: 0 },
        PumpBSpeed: { value: 0 },
    });

    const [operatingTime, setOperatingTime] = useState(0);

    useEffect(() => {
        const socket = io("http://localhost:5000"); // 确保 URL 正确
        socket.on("connect", () => {
            // console.log("Connected to WebSocket server");
        });

        socket.on("DeviceStatusEnum", (data) => {
            // console.log("1024   DeviceStatusEnum", data);
            setDeviceStatus(data.DeviceStatusEnum);
        });
        socket.on("OperatingTime", (data) => {
            // console.log("1024   OperatingTime", data);

            setOperatingTime(data.operating_time);
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
        // setAlarmData([]);
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
    const cleanCurrentCode = (record) => {
        // 按钮点击事件处理逻辑
        setAlarmData((prevData) =>
            prevData.filter((item) => item.key !== record.key)
        );
    };

    const handleStatus = (type, status) => {
        console.log("1022   handleStatus type :", type);
        console.log("1022   handleStatus status :", status);
        let pumpType = "";
        switchManualTest({
            use_manual: status["use_manual"],
        }).then((response) => {
            if (!response.error) {
            }
        });
        console.log(
            "1022    status[peristaltic_switch]",
            status["peristaltic_switch"]
        );
        console.log("1022    status[spray_switch]", status["spray_switch"]);

        pumpType = "abandon";
        let pumpOperationData = {
            pump_type: pumpType,
            pump_status: status["peristaltic_switch"],
            drain_speed: status["drain_speed"],
            clean_volume: status["clean_volume"],
            clean_count: status["clean_count"],
            tube_id: status["tube_id"],
            module_id: status["module_id"],
        };
        pumpOperation(pumpOperationData).then((response) => {
            if (!response.error) {
            }
        });

        pumpType = "clean";
        let pumpOperationData2 = {
            pump_type: pumpType,
            pump_status: status["spray_switch"],
            drain_speed: status["drain_speed"],
            clean_volume: status["clean_volume"],
            clean_count: status["clean_count"],
            tube_id: status["tube_id"],
            module_id: status["module_id"],
        };
        pumpOperation(pumpOperationData2).then((response) => {
            if (!response.error) {
            }
        });
    };
  
    useEffect(() => {
        if (props.warningCode.code !== warningCode) {
            showDrawerWarning();
            setWarningCode(props.warningCode.code);
            // 获取 codes 数据
            getCodes()
                .then((res) => {
                    console.log("1017 res", res);
                    const codes = res.data.codes;

                    // 根据 props.warningCode 查找对应的 message 和 type
                    const codeInfo = codes.find(
                        (code) => code.code_id === props.warningCode.code
                    );
                    if (codeInfo) {
                        setAlarmData((prevData) => [
                            ...prevData,
                            {
                                key: (prevData.length + 1).toString(),
                                type: translateType(codeInfo), // 从获取的 codes 中获取 type
                                time: props.warningCode.time,
                                description: `报警代码: ${props.warningCode.code}`, // 添加 message
                            },
                        ]);
                        console.log("warningCode", warningCode);
                    } else {
                        console.warn(`未找到报警代码: ${props.warningCode}`);
                    }
                })
                .catch((error) => {
                    console.error("获取 codes 失败:", error);
                });
        }
        setDynamicHeight(props.dynamicHeight);
        // console.log("8672 -----------   dynamicHeight :", dynamicHeight);

        console.log("props peristaltic :", peristaltic);
        getDeviceStatus().then((res) => {
            if (!res.error) {
                // console.log("1024  getDeviceStatus", res);
            }
        });
        const useMock = localStorage.getItem("useMock");
        setIsChecked(useMock);
    }, [props]);
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
                    <Row>
                        {/* <Col span={24} style={{ marginBottom: "2rem" }}>
                            <Card title="是否开启离线模式">
                                <Switch
                                    checkedChildren="开启"
                                    unCheckedChildren="关闭"
                                    checked={isChecked}
                                    onChange={handleOffline}
                                    style={{
                                        margin: "2rem",
                                        width: "90%",
                                        height: "90%",
                                    }}
                                />
                            </Card>
                        </Col> */}
                        <Col span={24} style={{ marginBottom: "2rem" }}>
                            <Card title="泵设置">
                                <FormStatus
                                    type={"pump"}
                                    decideParameter={"use_manual"}
                                    data={pump}
                                    runningFlag={runningFlag}
                                    callback={handleStatus}
                                ></FormStatus>
                            </Card>
                        </Col>
                        <Col span={24} style={{ marginBottom: "2rem" }}>
                            <Card title="梯度曲线设置" bordered={false}>
                                <div className="pressure">
                                    <Row>
                                        <Col span={24}>
                                            <div className="dynamic-line">
                                                <DynamicLine></DynamicLine>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>{" "}
                            </Card>
                        </Col>
                        <Col span={24} style={{ marginBottom: "2rem" }}>
                            <Card title="机器状态" bordered={false}>
                                <Row gutter={16} style={{ margin: "1rem" }}>
                                    <Col span={12}>
                                        <Statistic
                                            title="设备状态"
                                            value={
                                                deviceStatus?.PowerStatus?.value
                                                    ? "接通"
                                                    : "断开"
                                            }
                                            prefix={<ApiOutlined />}
                                            suffix=""
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="运行时间"
                                            value={operatingTime} // 固定值，根据需要调整
                                            prefix={
                                                <RadiusBottomleftOutlined />
                                            }
                                            suffix="H"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="泵A速度"
                                            value={(
                                                deviceStatus?.PumpASpeed
                                                    ?.value / 1000
                                            ).toFixed(2)} // 假设需要转换为 ml/s
                                            prefix={<SlidersOutlined />}
                                            suffix="ml/s"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="泵B速度"
                                            value={(
                                                deviceStatus?.PumpBSpeed
                                                    ?.value / 1000
                                            ).toFixed(2)} // 假设需要转换为 ml/s
                                            prefix={<SlidersOutlined />}
                                            suffix="ml/s"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="检测器"
                                            value={
                                                deviceStatus?.Detector?.value
                                            }
                                            prefix={<LineChartOutlined />}
                                            suffix=""
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="当前试管"
                                            value={
                                                deviceStatus?.CurrentTube?.value
                                            }
                                            prefix={<ApartmentOutlined />}
                                            suffix="号"
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Spin>
            </Drawer>
        </>
    );
};
export default App;
