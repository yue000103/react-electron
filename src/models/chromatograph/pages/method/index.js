import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import createDB from "../../hooks/createDB";

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
import DynamicLine from "@components/d3/dynamicLine";
import DynamicForm from "@components/form/dynamicForm";
import {
    postMethodOperate,
    getAllMethodOperate,
    uploadMethodOperate,
    startEquilibration,
    deleteMethodOperate,
    setCurrentMethodOperate,
    updateMethodOperate,
    getNewMethodId,
} from "../../api/methods";

import Buttons from "./buttonTube";

import p7ConBg from "@/assets/image/image.png"; // 使用 import 引入图片

let method = {};

const Method = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [value, setValue] = useState(1);
    const onChange = (e) => {
        console.log("radio checked", e.target.value);
        setValue(e.target.value);
    };

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
    const [spinning, setSpinning] = React.useState(false);
    const [cleanList, setCleanList] = useState([]);
    const [retainList, setRetainList] = useState([]);
    const { storeData } = createDB("MyDatabase", "method", "methodId");

    console.log("basisData :", basisData);
    console.log("elutionData :", elutionData);

    const columnsConfig = [
        { title: "时间", dataIndex: "time" },
        { title: "泵A浓度", dataIndex: "pumpA" },
        { title: "泵B浓度", dataIndex: "pumpB" },
    ];

    const indexedDBMethod = async (method, methodId) => {
        try {
            const result = await storeData(method, methodId);
            console.log(result.message); // "数据更新成功" 或 "数据添加成功"
        } catch (error) {
            console.error(error.message);
        }
    };
    useEffect(() => {
        if (!window.indexedDB) {
            console.log("1023  该浏览器不支持 IndexedDB");
        } else {
            // 你的 IndexedDB 代码
            if (Object.keys(method).length !== 0) {
                const methodId = localStorage.getItem("methodId");
                indexedDBMethod(method, Number(methodId));
            }
        }
    }, [methodID]);

    const handleSwitchChange = (checked) => {
        setIsEquilibration(checked);
        if (!checked) {
            formBasis.setFieldsValue({
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
            // formPump.submit();
            setOpenMethod(true);
        } else {
            formBasis.submit();
            formElution.submit();
            // formPump.submit();
            showModal();
        }
    };
    const handleOkMethod = () => {
        setSpinning(true);
        localStorage.setItem("uploadFlag", 0);

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
            // ...pumps,
            { pumpList: pressure },
            { methodName: methodName },
            ...check,
        ];
        methodata.push({ cleanList: cleanList });
        methodata.push({ retainList: retainList });

        const transformedData = transformData(methodata);
        indexedDBMethod(transformedData, methodId);

        console.log("1030  methodata", methodata);
        console.log("1030  transformedData", transformedData);
        setOpenMethod(false);
        updateMethodOperate({
            method_id: methodId,
            method: transformedData,
        }).then((response) => {
            console.log("response :", response);
            setSpinning(false);

            messageApi.open({
                type: "success",
                content: "更新方法成功",
                duration: 2,
            });
        });
        // setTimeout(() => {
        //     setOpenMethod(false);
        // }, 2000);
    };
    const showModal = () => {
        setOpen(true);
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
        setMethodID((preNum) => item.methodId);
        method = item;

        setCurrentMethodOperate({ method_id: Number(item.methodId) }).then(
            (response) => {
                // console.log("response :", response.data.methods);
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
            speed: item.speed,
            totalFlowRate: item.totalFlowRate,
            cleaningSpeed: item.cleaningSpeed,
            cleaningCount: item.cleaningCount,
            drainSpeed: item.drainSpeed,
            smiles: item.smiles,
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
        setCleanList(JSON.parse(item.cleanList));
        setRetainList(JSON.parse(item.retainList));
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
                            <td>蠕动泵速度:</td>
                            <td>{item.peristaltic_velocity}</td>
                            <td>蠕动泵加速度:</td>
                            <td>{item.peristaltic_acceleration}</td>
                            <td>蠕动泵减速度:</td>
                            <td>{item.peristaltic_deceleration}</td>
                            <td>喷淋准备时间:</td>
                            <td>{item.spray_ready_time}</td>
                        </tr>

                        <tr>
                            <td>喷淋开始时间:</td>
                            <td>{item.spray_start_time}</td>
                            <td>喷淋停止时间:</td>
                            <td>{item.spray_stop_time}</td>
                        </tr>
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
                    </tbody>
                </table>
            </div>
        ),
        extra: genExtra(item),
    }));
    const onFinishBasis = (values) => {
        const data = Object.keys(values)
            .map((key) => {
                console.log("0925   key", key);

                if (key !== "balanced" && key !== "smiles") {
                    return { [key]: Number(values[key]) };
                }
                return { [key]: values[key] };
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
        // setSpinning(true);
        localStorage.setItem("uploadFlag", 0);

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
        methodata.push({ cleanList: cleanList });
        methodata.push({ retainList: retainList });
        const transformedData = transformData(methodata);

        postMethodOperate(transformedData).then((response) => {
            if (!response.error) {
                console.log("response :", response);
            }
        });
        console.log("8672  methodata :", methodata);
        console.log("8672  transformedData :", transformedData);
        setTimeout(() => {
            setIsMethodName(false);
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
        getNewMethodId().then((res) => {
            if (!res.error) {
                setMethodID(res.data.method_id);
                indexedDBMethod(transformedData, res.data.method_id);
                setCurrentMethodOperate({
                    method_id: Number(res.data.method_id),
                }).then((response) => {
                    if (!response.error) {
                        applyMethod(response.data.methods[0]);
                        // setSpinning(false);
                        messageApi.open({
                            type: "success",
                            content: "保存方法成功",
                            duration: 2,
                        });
                    }
                });
            }
        });
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
            speed: null,
            totalFlowRate: null,
            pumpA: null,
            pumpB: null,
            methodName: null,
            pumpList: null,
            cleaningSpeed: null,
            cleaningCount: null,
            drainSpeed: null,
            smiles: null,
            cleanList: null,
            retainList: null,
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
        // formPump.resetFields();
        formElution.resetFields();
        setPressure([]);
        setCurrentMethodOperate({ method_id: 0 }).then((response) => {
            if (response.error) {
                console.error("设置当前方法失败:", response.error.message);
                // 可以在这里添加用户提示，比如使用 Toast 组件
            }
        });
    };
    useEffect(() => {
        const methodId = localStorage.getItem("methodId");
        setMethodID((preNum) => methodId);

        console.log("methodId :", methodId);
        if (methodId) {
            setCurrentMethodOperate({ method_id: Number(methodId) }).then(
                (response) => {
                    if (!response.error) {
                        applyMethod(response.data.methods[0]);
                    }
                }
            );
        }
        getAllMethodOperate().then((response) => {
            // console.log("response :", response.data);
            if (!response.error) {
                setMethodDatas(response.data.methods);
                // 可以在这里添加用户提示
            }
        });
    }, []);
    const handleReceiveFlags = (cleanList, retainList) => {
        console.log("1030   retainList", retainList);
        setCleanList(cleanList);
        setRetainList(retainList);
        console.log("1030   cleanList", cleanList);
    };

    return (
        <Flex
            gap="middle"
            vertical
            className="background-container"
            style={{
                backgroundImage: `url(${p7ConBg})`,
                backgroundPosition: "right bottom", // 设置为右下角
                backgroundSize: "28rem 30rem", // 保持图片大小
                backgroundRepeat: "no-repeat", // 不重复
                // height: "100vh", // 根据需要设置容器高度
                // width: "100%", // 根据需要设置容器宽度
            }}
        >
            {contextHolder}
            <div className="method">
                <Row gutter={50}>
                    <Col span={20}>
                        <Form
                            form={formBasis}
                            layout="vertical" // 设为 vertical 以便更好地控制
                            initialValues={{
                                equilibrationColumn: false,
                                maxwidth: "none",
                            }}
                            onFinish={onFinishBasis}
                            onValuesChange={basisValuesChange}
                        >
                            <Row gutter={20}>
                                {" "}
                                <Col span={6}>
                                    <Form.Item
                                        label="方法名称"
                                        name="methodName"
                                    >
                                        <Input disabled={true} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="采集时间/min"
                                        name="samplingTime"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="检测器波长"
                                        name="detectorWavelength"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    {/* <Form.Item
                                        label="试管容积/ml"
                                        name="tubeVolume"
                                    >
                                        <Input />
                                    </Form.Item> */}
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item
                                        label="清洗次数"
                                        name="cleaningCount"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={6}>
                                    <Form.Item
                                        label="目标化合物SMILES"
                                        name="smiles"
                                    >
                                        <Input type="text" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item
                                        label="平衡柱子"
                                        name="equilibrationColumn"
                                        valuePropName="checked"
                                    >
                                        <Switch onChange={handleSwitchChange} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="泵B速度/%" name="speed">
                                        <Input disabled={!isEquilibration} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="总流速"
                                        name="totalFlowRate"
                                    >
                                        <Input disabled={!isEquilibration} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>

                    <Col span={3}>
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

                            <Button
                                type="primary  "
                                size="large"
                                className={`button button3`}
                                onClick={() => allMethod()}
                            >
                                方法
                            </Button>

                            <Button
                                type="primary  "
                                size="large"
                                className={`button button5`}
                                onClick={() => clearMethod()}
                            >
                                清空
                            </Button>
                        </Row>
                    </Col>
                </Row>
            </div>

            {/* <DynamicCard position={"top"} title={"洗脱梯度"} height={"400px"}> */}
            <div className="clean">
                <Row>
                    <Col span={11}>
                        <div style={{ marginTop: "2rem" }}>
                            <Buttons
                                cleanListDy={cleanList}
                                retainListDy={retainList}
                                callback={handleReceiveFlags}
                            ></Buttons>
                        </div>
                    </Col>
                    <Col span={13}>
                        <Row>
                            <Col span={3}></Col>
                            <Col span={9}>
                                <div style={{ marginTop: 13 }}>
                                    <Radio.Group
                                        onChange={onChange}
                                        value={value}
                                    >
                                        <Radio value={1}>等度洗脱</Radio>
                                        <Radio value={2}>二元高压梯度</Radio>
                                    </Radio.Group>
                                </div>
                            </Col>
                            <Col span={4}>
                                {value === 2 && (
                                    <pre
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: "550",
                                        }}
                                    >
                                        {
                                            "时间    泵A速度    泵B速度    总流速 "
                                        }
                                    </pre>
                                )}
                            </Col>
                        </Row>
                        {value === 1 && (
                            <div className="isocratic">
                                {" "}
                                <Form
                                    labelCol={{
                                        span: 10,
                                    }}
                                    wrapperCol={{
                                        span: 14,
                                    }}
                                    layout="horizontal"
                                    initialValues={{
                                        size: "larger",
                                    }}
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
                                    <Col span={2}></Col>
                                    <Col span={9}>
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
                                        <DynamicForm
                                            flowRateDefault={flowRateDefault}
                                            pressure={pressure}
                                            onValuesChange={handleValuesChange}
                                        ></DynamicForm>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>
            <div className="button-div">
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
                <Modal
                    width="100%"
                    title={"方法"}
                    open={openAllMethod}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <div
                        style={{
                            height: "40rem", // 设置折叠面板的固定高度
                            overflowY: "auto", // 当内容超出高度时显示滚动条
                            padding: "10px",
                        }}
                    >
                        <Collapse accordion items={methodItems} size="large" />
                    </div>
                </Modal>
                <Spin spinning={spinning} fullscreen tip="正在保存......" />
            </div>
            {/* </DynamicCard> */}
        </Flex>
    );
};

export default Method;
