import React, { useState, useEffect } from "react";

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
} from "antd";

import "./index.css";
import Line from "@components/d3/line";
import DynamicLine from "@components/d3/dynamicLine";
import FormStatus from "@components/formStatus/index";
import DynamicTable from "@components/table/dynamicTable";
import { getDeviceStatus, postDeviceStatus } from "../../api/status";

let num = [
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 1 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 2 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 3 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 4 },
];

let data = [
    // { time: "00:01:20", value: 81.41712213857508 },
    // { time: "00:01:20", value: 88.51848125394666 },
    // { time: "00:01:30", value: 88.51848125394666 },
    // { time: "00:01:40", value: 20.51848125394666 },
];
let selected_tubes = [];
let clean_flag = 1;
let linePoint = [
    { time: "00:01:20", value: 81.41712213857508 },
    { time: "00:01:20", value: 88.51848125394666 },
    { time: "00:01:30", value: 88.51848125394666 },
    { time: "00:01:40", value: 20.51848125394666 },
];
let lineFlag = 1;
const handleUpdatePoint = () => {};

const Method = () => {
    const initiate = () => {};
    const [value, setValue] = useState(1);
    const onChange = (e) => {
        console.log("radio checked", e.target.value);
        setValue(e.target.value);
    };
    const [peristaltic, setPeristalic] = useState({});
    const [spray, setSpray] = useState({});
    const [runningFlag, setRunningFlag] = useState(0);
    const [pumpStatus, setPumpStatus] = useState({});
    const [widthLine, setWidthLine] = useState(300);
    const [heightLine, setHeightLine] = useState(400);
    const columnsConfig = [
        { title: "时间", dataIndex: "time" },
        { title: "泵A浓度", dataIndex: "pumpA" },
        { title: "泵B浓度", dataIndex: "pumpB" },
    ];
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

    useEffect(() => {
        getStatus();
        console.log("spray -----11--------:", spray);

        console.log("peristaltic ------22--------:", peristaltic);
    }, []);

    return (
        <div>
            <Row>
                <Col span={20}>
                    <div className="line">
                        <Line
                            data={data}
                            num={num}
                            selected_tubes={selected_tubes}
                            clean_flag={clean_flag}
                            linePoint={linePoint}
                            lineFlag={lineFlag}
                            callback={handleUpdatePoint}
                        ></Line>
                    </div>
                </Col>
                <Col span={4}>
                    <div className="button-div">
                        <Col>
                            <Row>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className={`button`}
                                    onClick={() => initiate()}
                                >
                                    启动
                                </Button>
                            </Row>
                            <Row>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className={`button button4`}
                                    onClick={() => initiate()}
                                >
                                    保存
                                </Button>
                            </Row>
                            <Row>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className={`button button2`}
                                    onClick={() => initiate()}
                                >
                                    上传
                                </Button>
                            </Row>
                        </Col>
                    </div>
                </Col>
            </Row>
            <Row gutter={50}>
                <Col span={7}>
                    <Form
                        labelCol={{
                            span: 8,
                        }}
                        wrapperCol={{
                            span: 14,
                        }}
                        layout="horizontal"
                        initialValues={{
                            size: "lager",
                        }}
                        size="lager"
                    >
                        <Form.Item label="采集时间">
                            <Input />
                        </Form.Item>
                        <Form.Item label="检测器波长">
                            <Input />
                        </Form.Item>

                        <Form.Item label="平衡柱子" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item label="时间">
                            <Input />
                        </Form.Item>
                        <Form.Item label="速度">
                            <Input />
                        </Form.Item>
                        <Form.Item label="总流速">
                            <Input />
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={12}>
                    {"模式： "}
                    <Radio.Group onChange={onChange} value={value}>
                        <Radio value={1}>等度洗脱</Radio>
                        <Radio value={2}>二元高压梯度</Radio>
                    </Radio.Group>
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
                                    size: "lager",
                                }}
                                size="lager"
                            >
                                <Form.Item label="泵A流速">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="泵B流速">
                                    <Input />
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                    {value === 2 && (
                        <div className="pressure">
                            <Row>
                                <Col span={12}>
                                    <DynamicLine
                                        widthLine={widthLine}
                                        heightLine={heightLine}
                                    ></DynamicLine>
                                </Col>
                                <Col span={12}>
                                    <DynamicTable
                                        columnsConfig={columnsConfig}
                                    ></DynamicTable>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Col>
                <Col span={5}>
                    {/* <Row gutter={16}> */}
                    {/* <Col span={12}> */}
                    <Card title="喷淋泵" size="small" style={{ height: 350 }}>
                        <FormStatus
                            data={spray}
                            runningFlag={runningFlag}
                        ></FormStatus>
                    </Card>
                    {/* </Col> */}
                    {/* <Col span={12}>
                            <Card
                                title="蠕动泵"
                                size="small"
                                style={{ height: 350 }}
                            >
                                <FormStatus
                                    data={peristaltic}
                                    runningFlag={runningFlag}
                                ></FormStatus>
                            </Card>
                        </Col> */}
                    {/* </Row> */}
                </Col>
            </Row>
        </div>
    );
};

export default Method;
