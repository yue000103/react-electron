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
    Divider,
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
import { getStockSolutions } from "../../api/settings";

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
    const [pumpALabel, setPumpALabel] = useState("A");
    const [pumpBLabel, setPumpBLabel] = useState("B");
    const [flashA, setFlashA] = useState(false);
    const [flashB, setFlashB] = useState(false);
    const [pumpLabelLoading, setPumpLabelLoading] = useState(false);

    console.log("basisData :", basisData);
    console.log("elutionData :", elutionData);

    const columnsConfig = [
        { title: "时间", dataIndex: "time" },
        { title: `泵 A (%) — ${pumpALabel}`, dataIndex: "pumpA" },
        { title: `泵 B (%) — ${pumpBLabel}`, dataIndex: "pumpB" },
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
                                    label: `泵 A (%) — ${pumpALabel}`,
                                    value: `${item.pumpA}%`,
                                },
                                {
                                    key: "2",
                                    label: `泵 B (%) — ${pumpBLabel}`,
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
                                    title: `泵 A (%) — ${pumpALabel}`,
                                    dataIndex: "pumpA",
                                    key: "pumpA",
                                },
                                {
                                    title: `泵 B (%) — ${pumpBLabel}`,
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
        console.log("7890-----totalFlowRate", allValues.totalFlowRate);

        // 自动计算采集时间 = 试管总数 * 收集体积 / 总流速
        const drainSpeed = Number(allValues.drainSpeed);
        const totalFlowRate = Number(allValues.totalFlowRate);
        if (totalTubeCount > 0 && drainSpeed > 0 && totalFlowRate > 0) {
            const calculatedTime = (totalTubeCount * drainSpeed / totalFlowRate).toFixed(2);
            formBasis.setFieldValue('samplingTime', calculatedTime);
            setSamplingTime(Number(calculatedTime));
        } else {
            setSamplingTime(Number(allValues.samplingTime));
        }

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

        // 最高优先级：取梯度表中最大时间赋给采集时间
        const allPoints = [...newPoints, ...values.users];
        if (allPoints.length > 0) {
            const maxTime = Math.max(...allPoints.map(p => Number(p.time) || 0));
            if (maxTime > 0) {
                formBasis.setFieldValue('samplingTime', maxTime);
                setSamplingTime(maxTime);
            }
        }
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
        localStorage.removeItem("methodId");
        localStorage.removeItem("uploadFlag");
        localStorage.removeItem("updateLineFlag");
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

        // 优先从 localStorage 的 experiment-state 中读取 currentMethod
        const experimentRaw = localStorage.getItem("chromatograph:experiment-state:v1");
        let restoredFromStorage = false;
        if (experimentRaw) {
            try {
                const experimentState = JSON.parse(experimentRaw);
                if (experimentState.currentMethod && Object.keys(experimentState.currentMethod).length > 0) {
                    applyMethod(experimentState.currentMethod);
                    restoredFromStorage = true;
                }
            } catch (e) {
                console.log("Parse experiment state failed", e);
            }
        }

        if (!restoredFromStorage && methodId) {
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

    // 影刃：拉取泵名称，检测外部同步变更并闪烁（A/B 独立）
    useEffect(() => {
        setPumpLabelLoading(true);
        getStockSolutions().then((res) => {
            if (res && !res.error && res.data) {
                console.log("-------------0326-res----------------------",res)
                // 纯 label 匹配，禁止 id 依赖
                const d = res.data;
                const list = d.stock_solutions || d.stock_solution || d.list || (Array.isArray(d) ? d : []);
                const solA = list.find(item => item.label === "A")?.name || "A";
                const solB = list.find(item => item.label === "B")?.name || "B";
                                console.log("-------------0326-solB----------------------",solB)
                                console.log("-------------0326-solA----------------------",solA)

                if (solA !== pumpALabel) {
                    setPumpALabel(solA);
                    setFlashA(true);
                    setTimeout(() => setFlashA(false), 1200);
                }
                if (solB !== pumpBLabel) {
                    setPumpBLabel(solB);
                    setFlashB(true);
                    setTimeout(() => setFlashB(false), 1200);
                }
            }
        }).catch(() => {}).finally(() => {
            setPumpLabelLoading(false);
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

    // 影刃：监听设置页保存事件，重新拉取泵名并触发闪烁
    useEffect(() => {
        const handleStorageSync = (e) => {
            if (e.key === "pump-label-sync-ts") {
                setPumpLabelLoading(true);
                getStockSolutions().then((res) => {
                    if (res && !res.error && res.data) {
                        const d = res.data;
                        const list = d.stock_solutions || d.stock_solution || d.list || (Array.isArray(d) ? d : []);
                        const solA = Array.isArray(list) ? (list.find(item => item.label === "A")?.name || "A") : "A";
                        const solB = Array.isArray(list) ? (list.find(item => item.label === "B")?.name || "B") : "B";
                        setPumpALabel(solA);
                        setPumpBLabel(solB);
                        setFlashA(true);
                        setFlashB(true);
                        setTimeout(() => { setFlashA(false); setFlashB(false); }, 1200);
                    }
                }).catch(() => {}).finally(() => setPumpLabelLoading(false));
            }
        };
        window.addEventListener("storage", handleStorageSync);
        return () => window.removeEventListener("storage", handleStorageSync);
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
        <div className="method-view">
            {contextHolder}

            {/* ===== 操作栏：方法名称 + 按钮同行 ===== */}
            <div className="method-view__toolbar" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Form
                    form={formBasis}
                    layout="vertical"
                    size="large"
                    initialValues={{
                        equilibrationColumn: false,
                    }}
                    onFinish={onFinishBasis}
                    onValuesChange={basisValuesChange}
                    component="div"
                    style={{ flex: 1, minWidth: 0 }}
                >
                    <Form.Item
                        name="methodName"
                        style={{ marginBottom: 0 }}
                    >
                        <Input size="large" disabled placeholder="当前方法名称" />
                    </Form.Item>
                </Form>
                <div className="method-view__actions" style={{ flexShrink: 0 }}>
                    <Button type="primary" size="large" icon={<SaveOutlined />} className="button button4" onClick={() => saveMethod()}>
                        保存&上传
                    </Button>
                    <Button type="primary" size="large" icon={<FileTextOutlined />} className="button button3" onClick={() => allMethod()}>
                        方法
                    </Button>
                    <Button type="primary" size="large" icon={<ClearOutlined />} className="button button5" onClick={() => clearMethod()}>
                        清空
                    </Button>
                </div>
            </div>

            {/* ===== Row 1: 润柱 + 清洗 并列 ===== */}
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <div className="method-view__panel">
                        <Divider className="method-view__divider" orientation="left">
                            <span className="method-view__section-id">01</span> 润柱参数
                        </Divider>
                        <Form form={formBasis} layout="vertical" size="large" onFinish={onFinishBasis} onValuesChange={basisValuesChange} component="div">
                            <Row gutter={12}>
                                <Col span={12} className={`pump-input--b${flashB ? " sync-flash-input--b" : ""}`}>
                                    <Form.Item label={<span className={`pump-label--b${flashB ? " sync-flash" : ""}`}><span className="pump-badge pump-badge--b">B</span><span className="pump-desc">比例 (%)</span>{pumpLabelLoading ? <span className="pump-name--loading" /> : <span className="pump-name">{pumpBLabel}</span>}</span>} name="speed">
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="润柱时间 (min)" name="equilibrationTime">
                                        <Input size="large"  />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Col>
                <Col span={12}>
                    <div className="method-view__panel">
                        <Divider className="method-view__divider" orientation="left">
                            <span className="method-view__section-id">02</span> 清洗参数
                        </Divider>
                        <Form form={formBasis} layout="vertical" size="large" onFinish={onFinishBasis} onValuesChange={basisValuesChange} component="div">
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item label="清洗体积 (mL)" name="cleaningSpeed">
                                        <InputNumber size="large" style={{ width: "100%" }} min={0} step={0.1} onChange={(v) => handleCleanVolumeChange(v)} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="清洗次数" name="cleaningCount">
                                        <Input size="large"  />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Col>
            </Row>

            {/* ===== Row 2: 过柱参数(12) + 洗脱参数(12) 并列 ===== */}
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <div className="method-view__panel">
                        <Divider className="method-view__divider" orientation="left">
                            <span className="method-view__section-id">03</span> 过柱参数
                        </Divider>
                        <Form form={formBasis} layout="vertical" size="large" onFinish={onFinishBasis} onValuesChange={basisValuesChange} component="div">
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item label="采集时间 (min)" name="samplingTime" rules={[{ required: true, message: "请输入采集时间" }]}>
                                        <Input size="large"  />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="总流速 (mL/min)" name="totalFlowRate">
                                        <Input size="large"  />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="检测器波长" name="detectorWavelength">
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="试管总数">
                                        <Input size="large" disabled value={totalTubeCount}   />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    {/* <Form.Item label="收集体积 (mL)" name="drainSpeed">
                                        <InputNumber size="large" style={{ width: "100%" }} min={0} step={0.1}  onChange={(v) => handleRetainVolumeChange(v)} />
                                    </Form.Item> */}
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Col>
                <Col span={12}>
                    <Spin spinning={pumpLabelLoading} size="small">
                    <div className="method-view__panel method-view__panel--elution">
                        <Divider className="method-view__divider" orientation="left">
                            <span className="method-view__section-id method-view__section-id--elution">04</span> 洗脱参数
                        </Divider>
                        <div className="elution-mode-selector">
                            <Radio.Group onChange={onChange} value={value} size="large">
                                <Radio value={1} style={{color:"var(--text-primary)"}}>等度洗脱</Radio>
                                <Radio value={2} style={{color:"var(--text-primary)"}}>二元高压梯度</Radio>
                            </Radio.Group>
                        </div>
                        {value === 1 && (
                            <Form layout="vertical" size="large" form={formElution} onFinish={onFinishElution}>
                                <Row gutter={12}>
                                    <Col span={12} className={`pump-input--a${flashA ? " sync-flash-input--a" : ""}`}>
                                        <Form.Item label={<span className={`pump-label--a${flashA ? " sync-flash" : ""}`}><span className="pump-badge pump-badge--a">A</span><span className="pump-desc">流速 (%)</span>{pumpLabelLoading ? <span className="pump-name--loading" /> : <span className="pump-name">{pumpALabel}</span>}</span>} name="pumpA">
                                            <Input size="large"  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12} className={`pump-input--b${flashB ? " sync-flash-input--b" : ""}`}>
                                        <Form.Item label={<span className={`pump-label--b${flashB ? " sync-flash" : ""}`}><span className="pump-badge pump-badge--b">B</span><span className="pump-desc">流速 (%)</span>{pumpLabelLoading ? <span className="pump-name--loading" /> : <span className="pump-name">{pumpBLabel}</span>}</span>} name="pumpB">
                                            <Input size="large"  />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        )}
                        {value === 2 && (
                            <div>
                                <div className="dynamic-line">
                                    <DynamicLine widthLine={400} heightLine={200} samplingTime={samplingTime} pressure={pressure} />
                                </div>
                                
                                <DynamicForm flowRateDefault={flowRateDefault} pressure={pressure} onValuesChange={handleValuesChange} pumpALabel={pumpALabel} pumpBLabel={pumpBLabel} />
                            </div>
                        )}
                    </div>
                    </Spin>
                </Col>
            </Row>
            <div className="method-view__modals">
                <Modal
                    open={open}
                    onOk={handleOk}
                    confirmLoading={confirmLoading}
                    onCancel={handleCancel}
                >
                    <p>方法名称：</p>
                    <Input
                        size="large"
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
                            height: "40rem",
                            overflowY: "auto",
                            padding: "10px",
                        }}
                    >
                        <Collapse accordion items={methodItems} size="large" />
                    </div>
                </Modal>
                <Spin spinning={spinning} fullscreen tip="正在保存......" />
            </div>
        </div>
    );
};

export default Method;
