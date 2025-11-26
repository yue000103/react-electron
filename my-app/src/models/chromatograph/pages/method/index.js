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
    Table,
    Space,
    Tooltip,
} from "antd";
import {
    SettingOutlined,
    DeleteFilled,
    DeleteOutlined,
    SelectOutlined,
    SaveOutlined,
    UploadOutlined,
    FileTextOutlined,
    ClearOutlined,
    QuestionCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { uploadMethodFlag, UpdatePrepChromParamsAPI } from "../../api/methods";
import {
    UpdateCleanListAPI,
    UpdateModuleListAPI,
} from "../../api/eluent_curve";
import { getAllTubes } from "../../api/status";

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
    const [formParams] = Form.useForm();
    const [formPump] = Form.useForm();
    const [formElution] = Form.useForm();
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
    const [uploadFlag, setUploadFlag] = useState(0);
    const [totalTubeCount, setTotalTubeCount] = useState(0);

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
            uploadMethodOperate();

            localStorage.setItem("uploadFlag", 1);
            setSpinning(false);
            messageApi.open({
                type: "success",
                content: "上传成功！",
            });
        });

        // uploadMethod();
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

        // 解析 cleanList 和 retainList
        const parsedCleanList = JSON.parse(item.cleanList || "[]");
        const parsedRetainList = JSON.parse(item.retainList || "[]");

        // 从 cleanList 和 retainList 中提取体积值（取第一个模块的体积，如果存在）
        const cleanVolume =
            parsedCleanList.length > 0 ? parsedCleanList[0].liquid_volume : 0;
        const retainVolume =
            parsedRetainList.length > 0 ? parsedRetainList[0].liquid_volume : 0;

        const basisDatas = {
            methodName: item.methodName,
            samplingTime: item.samplingTime,
            tubeVolume: item.tubeVolume,
            detectorWavelength: item.detectorWavelength,
            equilibrationColumn: item.equilibrationColumn === 1 ? true : false,
            speed: item.speed,
            equilibrationTime: item.equilibrationTime,
            totalFlowRate: item.totalFlowRate,
            cleaningSpeed: cleanVolume, // 设置清洗体积
            cleaningCount: item.cleaningCount,
            drainSpeed: retainVolume, // 设置收集体积
            smiles: item.smiles,
        };
        formBasis.setFieldsValue(basisDatas);
        setSamplingTime(item.samplingTime);
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
        setCleanList(parsedCleanList);
        setRetainList(parsedRetainList);
    };

    const methodItems = methodDatas.map((item) => {
        // 基础参数数据
        const basicDataSource = [
            { key: "1", label: "采集时间", value: `${item.samplingTime} min` },
            { key: "2", label: "检测器波长", value: item.detectorWavelength },
            {
                key: "3",
                label: "总流速",
                value: `${item.totalFlowRate} mL/min`,
            },
            {
                key: "4",
                label: "平衡柱子",
                value: item.equilibrationColumn == 1 ? "是" : "否",
            },
        ];

        if (item.equilibrationColumn == 1) {
            basicDataSource.push(
                { key: "5", label: "速度", value: `${item.speed}%` },
                {
                    key: "6",
                    label: "润柱时间",
                    value: `${item.equilibrationTime} min`,
                }
            );
        }

        const basicColumns = [
            { title: "参数", dataIndex: "label", key: "label", width: "30%" },
            { title: "值", dataIndex: "value", key: "value" },
        ];

        // 洗脱模式数据
        const elutionMode = item.isocratic == 1 ? "等度洗脱" : "二元高压梯度";

        return {
            key: item.methodId.toString(),
            label: item.methodName,
            children: (
                <div>
                    <Table
                        dataSource={basicDataSource}
                        columns={basicColumns}
                        pagination={false}
                        size="small"
                        bordered
                        style={{ marginBottom: 16 }}
                    />

                    <div style={{ marginBottom: 12, fontWeight: 500 }}>
                        洗脱模式：{elutionMode}
                    </div>

                    {item.isocratic == 1 ? (
                        <Table
                            dataSource={[
                                {
                                    key: "1",
                                    label: "泵A流速",
                                    value: `${item.pumpA}%`,
                                },
                                {
                                    key: "2",
                                    label: "泵B流速",
                                    value: `${item.pumpB}%`,
                                },
                            ]}
                            columns={[
                                {
                                    title: "参数",
                                    dataIndex: "label",
                                    key: "label",
                                    width: "30%",
                                },
                                {
                                    title: "值",
                                    dataIndex: "value",
                                    key: "value",
                                },
                            ]}
                            pagination={false}
                            size="small"
                            bordered
                        />
                    ) : (
                        <Table
                            dataSource={JSON.parse(item.pumpList)}
                            columns={[
                                {
                                    title: "时间 (min)",
                                    dataIndex: "time",
                                    key: "time",
                                },
                                {
                                    title: "泵A (%)",
                                    dataIndex: "pumpA",
                                    key: "pumpA",
                                },
                                {
                                    title: "泵B (%)",
                                    dataIndex: "pumpB",
                                    key: "pumpB",
                                },
                                {
                                    title: "总流速",
                                    dataIndex: "flowRate",
                                    key: "flowRate",
                                },
                            ]}
                            pagination={false}
                            size="small"
                            bordered
                            scroll={{ y: 200 }}
                        />
                    )}
                </div>
            ),
            extra: genExtra(item),
        };
    });
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
            equilibrationTime: null,
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
    const uploadMethod = async () => {
        try {
            setSpinning(true);
            const response = await uploadMethodOperate();
            const responsedata = await uploadMethodFlag();
            const uploadFlag = responsedata.data.upload_flag;
            localStorage.setItem("uploadFlag", uploadFlag);
            setUploadFlag(uploadFlag);

            if (uploadFlag === 1) {
                // 上传成功的情况
                messageApi.open({
                    type: "success",
                    content: "上传成功！",
                });
            } else if (uploadFlag === 0) {
                // 上传失败的情况
                messageApi.open({
                    type: "error",
                    content: "上传失败，请重新保存！",
                });
            }
        } catch (error) {
            // 错误处理
            setSpinning(false);
            messageApi.open({
                type: "error",
                content: "发生错误，请稍后重试！",
            });
            console.error(error);
        }
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

        // 获取试管总数
        getAllTubes().then((res) => {
            if (!res.error) {
                const originGroups = res.data.groups_origin;
                // 计算试管总数
                const count = originGroups.reduce(
                    (total, moduleGroup) => total + moduleGroup.length,
                    0
                );
                setTotalTubeCount(count);
            }
        });
    }, []);

    // 快捷键支持
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ctrl+S 保存方法
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                saveMethod();
                messageApi.open({
                    type: "info",
                    content: "正在保存方法...",
                    duration: 1,
                });
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    const handleReceiveFlags = (cleanList, retainList) => {
        console.log("1030   retainList", retainList);
        setCleanList(cleanList);
        setRetainList(retainList);
        console.log("1030   cleanList", cleanList);
    };

    // 处理清洗体积变化
    const handleCleanVolumeChange = (value) => {
        if (value !== null && value !== undefined) {
            // 构建简单的 module_list
            const moduleList = cleanList.map((item) => ({
                ...item,
                liquid_volume: value,
            }));

            // 如果 cleanList 为空，创建一个默认项
            if (moduleList.length === 0 && value > 0) {
                moduleList.push({
                    module_id: 1,
                    liquid_volume: value,
                    tube_id: [],
                });
            }

            setCleanList(moduleList);
            UpdateCleanListAPI({ module_list: moduleList })
                .then((response) => {
                    console.log("清洗体积已更新:", response);
                })
                .catch((error) => {
                    console.error("更新清洗体积失败:", error);
                });
        }
    };

    // 处理收集体积变化
    const handleRetainVolumeChange = (value) => {
        if (value !== null && value !== undefined) {
            // 构建简单的 module_list
            const moduleList = retainList.map((item) => ({
                ...item,
                liquid_volume: value,
            }));

            // 如果 retainList 为空，创建一个默认项
            if (moduleList.length === 0 && value > 0) {
                moduleList.push({
                    module_id: 1,
                    liquid_volume: value,
                    tube_id: [],
                });
            }

            setRetainList(moduleList);
            UpdateModuleListAPI({ module_list: moduleList })
                .then((response) => {
                    console.log("收集体积已更新:", response);
                })
                .catch((error) => {
                    console.error("更新收集体积失败:", error);
                });
        }
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
                <Row gutter={20} align="middle">
                    {/* 表单区域 */}
                    <Col span={21}>
                        <Form
                            form={formBasis}
                            layout="vertical"
                            size="middle"
                            initialValues={{
                                equilibrationColumn: false,
                                maxwidth: "none",
                            }}
                            onFinish={onFinishBasis}
                            onValuesChange={basisValuesChange}
                        >
                            {/* 第一行：方法名称、采集时间、检测器波长、试管总数 */}
                            <Row gutter={14}>
                                <Col span={6}>
                                    <Form.Item
                                        label={
                                            <span className="important-label">
                                                方法名称
                                            </span>
                                        }
                                        name="methodName"
                                    >
                                        <Input
                                            disabled={true}
                                            placeholder="当前方法名称"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="采集时间 (min)"
                                        name="samplingTime"
                                        rules={[
                                            {
                                                required: true,
                                                message: "请输入采集时间",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="请输入采集时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="检测器波长"
                                        name="detectorWavelength"
                                    >
                                        <Input placeholder="请输入波长" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="试管总数">
                                        <Input
                                            disabled={true}
                                            value={totalTubeCount}
                                            placeholder="0"
                                            suffix="根"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* 第二行：总流速、泵B比例、润柱时间、清洗次数 */}
                            <Row gutter={14}>
                                <Col span={6}>
                                    <Form.Item
                                        label="总流速 (mL/min)"
                                        name="totalFlowRate"
                                    >
                                        <Input placeholder="请输入总流速" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="泵B比例 (%)" name="speed">
                                        <Input placeholder="请输入泵B比例" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="润柱时间 (min)"
                                        name="equilibrationTime"
                                    >
                                        <Input placeholder="请输入润柱时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="清洗次数"
                                        name="cleaningCount"
                                    >
                                        <Input placeholder="请输入清洗次数" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* 第三行：目标化合物、清洗体积、收集体积 */}
                            <Row gutter={14}>
                                <Col span={8}>
                                    <Form.Item
                                        label="目标化合物SMILES"
                                        name="smiles"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="可选填"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="清洗体积 (mL)"
                                        name="cleaningSpeed"
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            min={0}
                                            step={0.1}
                                            placeholder="请输入清洗体积"
                                            onChange={(value) =>
                                                handleCleanVolumeChange(value)
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="收集体积 (mL)"
                                        name="drainSpeed"
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            min={0}
                                            step={0.1}
                                            placeholder="请输入收集体积"
                                            onChange={(value) =>
                                                handleRetainVolumeChange(value)
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>

                    {/* 按钮区域 */}
                    <Col span={3}>
                        <div className="button-container">
                            <Button
                                type="primary"
                                size="middle"
                                icon={<SaveOutlined />}
                                className="button button4"
                                onClick={() => saveMethod()}
                            >
                                保存
                            </Button>

                            <Button
                                type="primary"
                                size="middle"
                                icon={<FileTextOutlined />}
                                className="button button3"
                                onClick={() => allMethod()}
                            >
                                方法
                            </Button>

                            <Button
                                type="primary"
                                size="middle"
                                icon={<ClearOutlined />}
                                className="button button5"
                                onClick={() => clearMethod()}
                            >
                                清空
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* 试管配置区域 */}
                {/*<Row style={{ marginTop: '16px' }}>*/}
                {/*    <Col span={24}>*/}
                {/*        <Buttons*/}
                {/*            cleanListDy={cleanList}*/}
                {/*            retainListDy={retainList}*/}
                {/*            callback={handleReceiveFlags}*/}
                {/*        />*/}
                {/*    </Col>*/}
                {/*</Row>*/}
            </div>

            {/* 洗脱模式配置区域 - 全宽 */}
            <div className="clean">
                <Card className="config-card" title="洗脱模式" bordered={false}>
                    <div className="elution-mode-selector">
                        <Radio.Group onChange={onChange} value={value}>
                            <Radio value={1}>等度洗脱</Radio>
                            <Radio value={2}>二元高压梯度</Radio>
                        </Radio.Group>
                    </div>
                    {value === 1 && (
                        <div className="isocratic">
                            <Row justify="center">
                                <Col span={8}>
                                    <Form
                                        labelCol={{ span: 10 }}
                                        wrapperCol={{ span: 14 }}
                                        layout="horizontal"
                                        size="middle"
                                        form={formElution}
                                        onFinish={onFinishElution}
                                    >
                                        <Form.Item
                                            label="泵A流速 (%)"
                                            name="pumpA"
                                        >
                                            <Input placeholder="请输入泵A流速" />
                                        </Form.Item>
                                        <Form.Item
                                            label="泵B流速 (%)"
                                            name="pumpB"
                                        >
                                            <Input placeholder="请输入泵B流速" />
                                        </Form.Item>
                                    </Form>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {value === 2 && (
                        <div className="pressure">
                            <Row gutter={24} justify="center">
                                <Col span={12}>
                                    <div className="dynamic-line">
                                        <DynamicLine
                                            widthLine={400}
                                            heightLine={250}
                                            samplingTime={samplingTime}
                                            pressure={pressure}
                                        />
                                    </div>
                                </Col>
                                <Col span={10}>
                                    <DynamicForm
                                        flowRateDefault={flowRateDefault}
                                        pressure={pressure}
                                        onValuesChange={handleValuesChange}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                </Card>
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
