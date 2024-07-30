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
} from "antd";
import { SettingOutlined } from "@ant-design/icons";

import "./index.css";
import Line from "@components/d3/line";
import DynamicLine from "@components/d3/dynamicLine";
import FormStatus from "@components/formStatus/index";
import DynamicTable from "@components/table/dynamicTable";
import DynamicForm from "@components/form/dynamicForm";
import { getDeviceStatus, postDeviceStatus } from "../../api/status";
import {
    postMethodOperate,
    getAllMethodOperate,
    uploadMethodOperate,
    startEquilibration,
} from "../../api/methods";

let num = [
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 1 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 2 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 3 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 4 },
];

// let data = [
//     // { time: "00:01:20", value: 81.41712213857508 },
//     // { time: "00:01:20", value: 88.51848125394666 },
//     // { time: "00:01:30", value: 88.51848125394666 },
//     // { time: "00:01:40", value: 20.51848125394666 },
// ];
let selected_tubes = [];
let clean_flag = 1;
let linePoint = [
    // { time: "00:01:20", value: 81.41712213857508 },
    // { time: "00:01:20", value: 88.51848125394666 },
    // { time: "00:01:30", value: 88.51848125394666 },
    // { time: "00:01:40", value: 20.51848125394666 },
];
let lineFlag = 1;
// let data = [];
const handleUpdatePoint = () => {};

const Method = () => {
    const [data, setData] = useState([]);

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
    const [pressure, setPressure] = useState([]);
    const [open, setOpen] = useState(false);
    const [openAllMethod, setOpenAllMethod] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [isMethodName, setIsMethodName] = useState(false);
    const [inputValue, setInputValue] = useState("");

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
    const startWashing = () => {
        setData([]);
        startEquilibration().then((response) => {});
    };
    const saveMethod = () => {
        formBasis.submit();
        formElution.submit();
        formPump.submit();
        showModal();
    };
    const showModal = () => {
        setOpen(true);
    };
    const uploadMethod = () => {
        uploadMethodOperate().then((response) => {});
    };

    const allMethod = () => {
        getAllMethodOperate().then((response) => {
            console.log("response :", response);
        });
        setOpenAllMethod(true);
    };
    const handleMethodOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setConfirmLoading(false);
        }, 2000);
    };
    const genExtra = () => (
        <SettingOutlined
            onClick={(event) => {
                // If you don't want click extra trigger collapse, you can prevent this:
                event.stopPropagation();
            }}
        />
    );
    const text = ``;
    const items = [
        {
            key: "1",
            label: "This is panel header 1",
            children: <p>{text}</p>,
            extra: genExtra(),
        },
        {
            key: "2",
            label: "This is panel header 2",
            children: <p>{text}</p>,
            extra: genExtra(),
        },
        {
            key: "3",
            label: "This is panel header 3",
            children: <p>{text}</p>,
            extra: genExtra(),
        },
    ];

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
        console.log("8672----11-----data :", data);
    };
    const onFinishElution = (values) => {
        const data = Object.keys(values)
            .map((key) => {
                return { [key]: Number(values[key]) };
            })
            .filter((item) => item !== null);
        setElutionData(data);
        console.log("8672----22-----data :", data);
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
        console.log("8672----11-----pumps :", pumps);
    };
    const basisValuesChange = (changedValues, allValues) => {
        console.log("8672  allValues :", allValues);
        setSamplingTime(Number(allValues.samplingTime));
        console.log("8672 samplingTime :", samplingTime);
    };

    const getPressurreData = () => {};

    const handleValuesChange = (values) => {
        console.log("isRowComplete Form values:", values);
        let newPoints = [];
        if (values.users.length === 0) {
            newPoints = [
                { time: 0, pumpB: 0, pumpA: 100 },
                {
                    time: samplingTime,
                    pumpB: 0,
                    pumpA: 100,
                },
            ];
        } else {
            const lastPoint = values.users[values.users.length - 1];
            console.log("lastPoint :", lastPoint);

            newPoints = [
                { time: 0, pumpB: 0, pumpA: 100 },
                {
                    time: samplingTime,
                    pumpB: lastPoint.pumpB,
                    pumpA: lastPoint.pumpA,
                },
            ];
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
                            samplingTime={samplingTime}
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
                                    onClick={() => startWashing()}
                                >
                                    启动
                                </Button>
                            </Row>
                            <Row>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className={`button button4`}
                                    onClick={() => saveMethod()}
                                >
                                    保存
                                </Button>
                            </Row>
                            <Row>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className={`button button2`}
                                    onClick={() => uploadMethod()}
                                >
                                    上传
                                </Button>
                            </Row>
                            <Row>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className={`button button2`}
                                    onClick={() => allMethod()}
                                >
                                    方法
                                </Button>
                            </Row>
                        </Col>
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
                            open={openAllMethod}
                            onOk={handleMethodOk}
                            confirmLoading={confirmLoading}
                            onCancel={handleCancel}
                        >
                            {/* <p>{modalText}</p> */}
                            <p>方法：</p>
                            <Collapse accordion items={items} size="small" />
                        </Modal>
                    </div>
                </Col>
            </Row>
            <Row gutter={50}>
                <Col span={7}>
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
                        size="lager"
                        onFinish={onFinishBasis}
                        onValuesChange={basisValuesChange}
                    >
                        <Form.Item label="采集时间/min" name="samplingTime">
                            <Input />
                        </Form.Item>
                        <Form.Item label="检测器波长" name="detectorWavelength">
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="平衡柱子"
                            name="equilibrationColumn"
                            valuePropName="checked"
                        >
                            <Switch onChange={handleSwitchChange} />
                        </Form.Item>
                        <Form.Item label="时间" name="time">
                            <Input disabled={!isEquilibration} />
                        </Form.Item>
                        <Form.Item label="速度" name="speed">
                            <Input disabled={!isEquilibration} />
                        </Form.Item>
                        <Form.Item label="总流速" name="totalFlowRate">
                            <Input disabled={!isEquilibration} />
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
                                form={formElution}
                                onFinish={onFinishElution}
                            >
                                <Form.Item label="泵A流速" name="pumpA">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="泵B流速" name="pumpB">
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
                                            samplingTime={samplingTime}
                                            pressure={pressure}
                                        ></DynamicLine>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    {/* <DynamicTable
                                        columnsConfig={columnsConfig}
                                        callback={getPressurreData}
                                    ></DynamicTable> */}
                                    <DynamicForm
                                        onValuesChange={handleValuesChange}
                                    ></DynamicForm>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Col>
                <Col span={5}>
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
                        size="lager"
                        onFinish={onFinishPump}
                    >
                        <Form.Item label="喷雾准备时间" name="spray_ready_time">
                            <Input />
                        </Form.Item>
                        <Form.Item label="喷雾开始时间" name="spray_start_time">
                            <Input />
                        </Form.Item>
                        <Form.Item label="喷雾停止时间" name="spray_stop_time">
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
                </Col>
            </Row>
        </div>
    );
};

export default Method;
