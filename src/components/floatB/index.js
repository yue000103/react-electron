import React, { useState, useEffect } from "react";
import {
    QuestionCircleOutlined,
    SyncOutlined,
    SlidersOutlined,
} from "@ant-design/icons";
import "./index.css";
import Notice from "../notice/index";
import FormStatus from "../formStatus/index";

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
} from "antd";

const App = (props) => {
    console.log("props :", props);

    const [openNotice, setOpenNotice] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [loading, setLoading] = React.useState(true);
    const [size, setSize] = useState();
    const [warningCode, setWarningCode] = useState(0);
    const [peristaltic, setPeristalic] = useState({});
    const [spray, setSpray] = useState({});
    const [runningFlag, setRunningFlag] = useState(0);
    const [dynamicHeight, setDynamicHeight] = useState();
    const [isChecked, setIsChecked] = useState(false);

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
    const onChange = (key) => {
        console.log(key);
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
    ];
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
    const items = [
        {
            key: "1",
            label: "报警",
            children: <Table columns={alarmColumns} dataSource={alarmData} />,
        },
        {
            key: "2",
            label: "机器状态",
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="喷淋泵">
                                    <FormStatus
                                        data={spray}
                                        runningFlag={runningFlag}
                                    ></FormStatus>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="蠕动泵">
                                    <FormStatus
                                        data={peristaltic}
                                        runningFlag={runningFlag}
                                    ></FormStatus>
                                </Card>
                            </Col>
                        </Row>

                        <Card title="控制器时间" bordered={false}>
                            {/* 控制器时间内容 */}
                        </Card>
                        <Card title="机器运行时间" bordered={false}>
                            {/* 机器运行时间内容 */}
                        </Card>
                    </Col>
                    {/* <Col span={12}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="控制器温度"
                                        value={0.0}
                                        prefix={<FireOutlined />}
                                        suffix="°C"
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="母线电压"
                                        value={0.0}
                                        prefix={<ThunderboltOutlined />}
                                        suffix="V"
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="平均功率"
                                        value={0.0}
                                        prefix={<LineChartOutlined />}
                                        suffix="W"
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="机器人电流"
                                        value={0.0}
                                        prefix={<ApartmentOutlined />}
                                        suffix="A"
                                    />
                                </Card>
                            </Col>
                        </Row>
                       
                    </Col> */}
                </Row>
            ),
        },
    ];

    const handleStatus = (type, status) => {
        console.log("handleStatus type :", type);
        console.log("handleStatus status :", status);
        props.callback(type, status);
    };
    const handleOffline = (checked) => {
        console.log("0927   checked 11111111", checked);
        setIsChecked(checked);

        props.handleOffline(checked);
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
        setSpray(props.pumpStatus.spray);
        setPeristalic(props.pumpStatus.peristaltic);
        // console.log("8672 -----------   dynamicHeight :", dynamicHeight);

        console.log("props peristaltic :", peristaltic);
        console.log("props spray :", spray);
    }, [props]);
    return (
        <>
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
                    <FloatButton icon={<SyncOutlined />} />
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
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Drawer>
            <Drawer
                title="设置"
                onClose={onCloseSetting}
                open={openSetting}
                loading={loading}
                size={size}
            >
                <Row>
                    <Col span={24}>
                        {"是否开启离线测试："}
                        <Switch
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            checked={isChecked}
                            onChange={handleOffline}
                        />
                    </Col>
                    <Col span={24}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="喷淋泵">
                                    <FormStatus
                                        type={"spray"}
                                        data={spray}
                                        runningFlag={runningFlag}
                                        callback={handleStatus}
                                    ></FormStatus>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="蠕动泵">
                                    <FormStatus
                                        type={"peristaltic"}
                                        data={peristaltic}
                                        runningFlag={runningFlag}
                                        callback={handleStatus}
                                    ></FormStatus>
                                </Card>
                            </Col>
                        </Row>

                        <Card title="梯度曲线设置" bordered={false}>
                            {/* 控制器时间内容 */}
                        </Card>
                        <Card title="机器运行时间" bordered={false}>
                            {/* 机器运行时间内容 */}
                        </Card>
                    </Col>
                </Row>
            </Drawer>
        </>
    );
};
export default App;
