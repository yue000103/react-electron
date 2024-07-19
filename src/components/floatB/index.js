import React, { useState, useEffect } from "react";
import { QuestionCircleOutlined, SyncOutlined } from "@ant-design/icons";
import "./index.css";
import Notice from "../notice/index";

import {
    FloatButton,
    Drawer,
    Tabs,
    Table,
    Row,
    Col,
    Card,
    Statistic,
} from "antd";
import {
    FireOutlined,
    ThunderboltOutlined,
    LineChartOutlined,
    ApartmentOutlined,
} from "@ant-design/icons";

const App = (props) => {
    console.log("props :", props);

    const [openNotice, setOpenNotice] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [loading, setLoading] = React.useState(true);
    const [size, setSize] = useState();
    const [warningCode, setWarningCode] = useState(0);
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
        setOpenWarning(false);
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
                    <Col span={12}>
                        <Card title="示教按钮状态" bordered={false}>
                            {/* 示教按钮状态内容 */}
                        </Card>
                        <Card title="碰撞检测" bordered={false}>
                            {/* 碰撞检测内容 */}
                        </Card>
                        <Card title="控制器时间" bordered={false}>
                            {/* 控制器时间内容 */}
                        </Card>
                        <Card title="机器运行时间" bordered={false}>
                            {/* 机器运行时间内容 */}
                        </Card>
                        <Card title="伺服运行时间" bordered={false}>
                            {/* 伺服运行时间内容 */}
                        </Card>
                    </Col>
                    <Col span={12}>
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
                        <Row gutter={16}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Col span={12} key={index}>
                                    <Card title={`关节${index + 1}`}>
                                        <p>电流: 0.0000A</p>
                                        <p>电压: 0.0000V</p>
                                        <p>温度: 0.0000°C</p>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            ),
        },
    ];
    useEffect(() => {
        if (props.warningCode !== warningCode) {
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
    }, [props]);
    return (
        <>
            <FloatButton.Group shape="circle" className="fButton">
                <FloatButton
                    badge={{
                        count: 12,
                    }}
                    icon={<QuestionCircleOutlined />}
                    onClick={showDrawerNotice}
                />
                <FloatButton
                    badge={{
                        count: 123,
                        overflowCount: 999,
                    }}
                    onClick={showDrawerWarning}
                />
                <FloatButton icon={<SyncOutlined />} />

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
        </>
    );
};
export default App;
