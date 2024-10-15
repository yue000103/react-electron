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

import {
    getDeviceStatus,
    postDeviceStatus,
    postInitDeviceMode,
    getInitDeviceMode,
} from "../../api/status";
import { type } from "@testing-library/user-event/dist/type";
const App = (props) => {
    console.log("props :", props);

    const [openNotice, setOpenNotice] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [loading, setLoading] = React.useState(true);
    const [size, setSize] = useState();
    const [warningCode, setWarningCode] = useState(0);
    const [peristaltic, setPeristalic] = useState({});
    const [pump, setPump] = useState({});
    const [runningFlag, setRunningFlag] = useState(0);
    const [dynamicHeight, setDynamicHeight] = useState();
    const [isChecked, setIsChecked] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [spinning, setSpinning] = React.useState(false);
    const [widthLine, setWidthLine] = useState(500);
    const [heightLine, setHeightLine] = useState(300);
    const [samplingTime, setSamplingTime] = useState(10);
    const [pressure, setPressure] = useState([]);
    const [flowRateDefault, setFlowRateDefault] = useState(0);

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
    const showDrawerWarning = () => {
        setSize("large");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 0);
        setOpenWarning(true);
    };
    const onCloseWarning = () => {
        setAlarmData([]);
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
    };

    const alarmColumns = [
        {
            title: "等级",
            dataIndex: "level",
            key: "level",
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
                <Button
                    type="primary"
                    onClick={() => handleButtonClick(record)}
                >
                    清除
                </Button>
            ), // 在最后一列添加按钮
        },
    ];
    const handleButtonClick = (record) => {
        // 按钮点击事件处理逻辑
        console.log(`你点击了: ${record.type}`);
    };
    const [alarmData, setAlarmData] = useState([
        {
            key: "1",
            level: 3,
            type: "火灾报警",
            time: "2024-07-19 12:00:00",
            description: "火灾报警描述",
        },
        {
            key: "2",
            level: 4,
            type: "烟雾报警",
            time: "2024-07-19 12:30:00",
            description: "烟雾报警描述",
        },
    ]);

    const handleStatus = (type, status) => {
        console.log("handleStatus type :", type);
        console.log("handleStatus status :", status);
    };
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
                    }
                    if (response.data["message"] === "False") {
                        messageApi.open({
                            type: "success",
                            content: "当前是联机模式",
                        });
                    }
                    setSpinning(false);
                    setIsChecked(checked);
                }
            });
        }, 1000);
    };
    useEffect(() => {
        if (props.warningCode !== warningCode) {
            showDrawerWarning();

            setWarningCode(props.warningCode);
            setAlarmData((prevData) => [
                ...prevData,
                {
                    key: (prevData.length + 1).toString(),
                    level: 1, // 这里可以根据 warningCode 的不同情况设置不同的 level
                    type: "新报警",
                    time: new Date().toISOString(),
                    description: `报警代码: ${props.warningCode}`,
                },
            ]);
            console.log("warningCode", warningCode);
        }
        setDynamicHeight(props.dynamicHeight);
        // console.log("8672 -----------   dynamicHeight :", dynamicHeight);

        console.log("props peristaltic :", peristaltic);
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
                        badge={{
                            count: 12,
                        }}
                        icon={<QuestionCircleOutlined />}
                        onClick={showDrawerNotice}
                    />
                </Tooltip>
                <Tooltip placement="left" title="警报">
                    <FloatButton
                        badge={{
                            count: 123,
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
                            <Button type="primary" onClick={handleButtonClick}>
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
                        <Col span={24} style={{ marginBottom: "2rem" }}>
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
                        </Col>
                        <Col span={24} style={{ marginBottom: "2rem" }}>
                            <Card title="泵设置">
                                <FormStatus
                                    type={"peristaltic"}
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
                                        <Col span={20}>
                                            <div className="dynamic-line">
                                                <DynamicLine
                                                    widthLine={widthLine}
                                                    heightLine={heightLine}
                                                    samplingTime={samplingTime}
                                                    pressure={pressure}
                                                ></DynamicLine>
                                            </div>
                                        </Col>
                                        <Col span={3}>
                                            <div style={{ marginTop: "5rem" }}>
                                                <Input placeholder="时间"></Input>
                                                <Input
                                                    placeholder="泵B速度"
                                                    style={{
                                                        marginTop: "2rem",
                                                    }}
                                                ></Input>
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
                                            title="电源状态"
                                            value={"接通"}
                                            prefix={<ApiOutlined />}
                                            suffix=""
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="运行时间"
                                            value={5.9}
                                            prefix={
                                                <RadiusBottomleftOutlined />
                                            }
                                            suffix="H"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="泵A速度"
                                            value={80.0}
                                            prefix={<SlidersOutlined />}
                                            suffix="ml/s"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="泵B速度"
                                            value={20.0}
                                            prefix={<SlidersOutlined />}
                                            suffix="ml/s"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="检测器"
                                            value={25.99}
                                            prefix={<LineChartOutlined />}
                                            suffix=""
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="当前试管"
                                            value={5}
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
