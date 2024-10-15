import React, { useState, useEffect } from "react";
import {
    Collapse,
    Badge,
    Descriptions,
    Button,
    Row,
    Col,
    Upload,
    Modal,
    message,
    Spin,
    Input,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
// import Line from "@components/d3/line";
import Line from "./hisLine.js";

import "./index.css";
import data1 from "@/assets/image/data1.png";
import {
    getHistory,
    getMethodById,
    downloadFile,
} from "@/models/chromatograph/api/experiment";

const props = {
    name: "file",
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    headers: {
        authorization: "authorization-text",
    },
    onChange(info) {
        if (info.file.status !== "uploading") {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === "done") {
            message.success(`${info.file.name} 文件上传成功`);
        } else if (info.file.status === "error") {
            message.error(`${info.file.name} 文件上传失败。`);
        }
    },
};
let pumpListMethod = [];
let smiles = null;

const App = () => {
    const [historyData, setHistoryData] = useState([]);
    const [openReset, setOpenReset] = useState(false);
    const [currentMethod, setCurrentMethod] = useState(null);
    const [activeKey, setActiveKey] = useState(null);
    const fileName = `data_${Date.now()}.txt`; // 生成文件名称
    const savePath = "F:/experiment_data"; // 默认保存路径（可以根据实际情况设置）
    const [spinning, setSpinning] = React.useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [curveData, setCurveData] = useState([]);
    const [verticalData, setVerticalData] = useState([]);
    const [pumpList, setPumpList] = useState([]);
    const [endStart, setEndStart] = useState(5);
    const [folderName, setFolderName] = useState(""); // 新增状态保存文件夹名称
    const [folderNameOnly, setFolderNameOnly] = useState("");

    useEffect(() => {
        fetchHistoryData();
    }, []);

    const fetchHistoryData = async () => {
        try {
            const res = await getHistory();
            // console.log("1012 -----------", res);

            if (Array.isArray(res.data.data)) {
                setHistoryData(res.data.data);
            } else if (typeof res.data.data === "object") {
                // 如果返回的是单个对象，将其包装成数组
                setHistoryData([res.data.data]);
            } else {
                console.error("Unexpected data format:", res.data.data);
                message.error("获取历史数据格式不正确");
            }
        } catch (error) {
            console.error("获取历史数据时出错:", error);
            message.error("获取历史数据失败");
        }
    };
    const handleDownload = (item) => {
        setSpinning(true);
        console.log("1012  item", item);
        downloadFile({
            fileName: item.saveTime,
            folderName: folderNameOnly,
            data: item,
        }).then((res) => {
            if (res.status == 200) {
                setSpinning(false);
                messageApi.open({
                    type: "success",
                    content: "下载成功！",
                });
            }
            console.log(res);
        });
    };
    const handleDownloadAll = () => {
        setSpinning(true);

        downloadFile({
            folderName: folderName || "E:/default_folder", // 使用输入的文件夹名称
        })
            .then((res) => {
                setSpinning(false);
                messageApi.open({
                    type: "success",
                    content: "所有文件已成功导出！",
                });
            })
            .catch(() => {
                setSpinning(false);
                messageApi.open({
                    type: "error",
                    content: "导出失败！",
                });
            });
    };

    const setOpen = () => {
        setOpenReset(true);
    };
    const checkMethod = async (methodId) => {
        console.log("1012  currentMethod  methodId", methodId);
        try {
            const method = await getMethodById({ method_id: methodId });
            pumpListMethod = method.data["pumpList"];
            smiles = method.data["smiles"];
            console.log("1012 method  currentMethod", method.data["pumpList"]);
            console.log("1012 pumpList  currentMethod", pumpListMethod);

            setCurrentMethod(method.data);
            // console.log("1012    currentMethod", currentMethod);
        } catch (error) {
            console.error("获取方法数据时出错:", error);
            // message.error("获取方法数据失败");
        }
    };

    const handleOkReset = () => {
        setOpenReset(false);
    };

    const handleCancel = () => {
        setOpenReset(false);
    };

    const renderTaskList = (taskList) => {
        if (!Array.isArray(taskList)) return null;
        return taskList.map((task, index) => {
            // 根据 operate 的值映射对应的中文描述
            const operateMapping = {
                abandon: "废弃",
                retain: "保留",
                clean: "清洗",
            };
            const operateDescription =
                operateMapping[task.operate] || "未知操作"; // 如果没有匹配，返回“未知操作”
            return (
                <p key={index}>
                    {operateDescription}:{" "}
                    {Array.isArray(task.tube_list)
                        ? task.tube_list.join(", ")
                        : "无数据"}
                </p>
            );
        });
    };
    const handleCollapseChange = (key) => {
        if (key !== activeKey) {
            setActiveKey(key); // 切换激活的面板
            if (historyData[key]) {
                checkMethod(historyData[key].methodId);
                setHightWidth(); // 获取面板的尺寸
                // 确保当前面板的 `data` 被更新
                const newData = historyData[key].curveData || [];
                const verticalDatas = historyData[key].verticalData || [];
                const pumpLists = historyData[key].pumpList || [];
                const end = historyData[key].endStart || 5;
                setCurveData(newData); // 设置当前折叠面板的 `Line` 数据
                setVerticalData(verticalDatas);
                setPumpList(pumpLists);
                setEndStart(end);
            }
        } else {
            setActiveKey(null); // 当相同的面板再次被点击时，关闭面板并注销组件
        }
    };
    const setHightWidth = () => {
        const headerDiv = document.querySelector(".data-main");
        if (
            headerDiv &&
            headerDiv.offsetWidth > 0 &&
            headerDiv.offsetHeight > 0
        ) {
            // 使用 requestAnimationFrame 确保 DOM 完全渲染之后获取尺寸
            requestAnimationFrame(() => {
                const { width, height } = headerDiv.getBoundingClientRect();
                console.log("1014    requestAnimationFrame", width, height);
                setDimensions({ width, height });
            });
        }
    };

    const items = historyData.map((item, index) => ({
        key: index.toString(),
        label: `保存时间：${item.saveTime || "未知"}`,
        children: (
            <Descriptions
                title={`方法名称：${item.methodName || "未知"}`}
                bordered
                extra={
                    <div>
                        <Row>
                            <Col span={2}></Col>
                            <Col span={6}>
                                <Button
                                    type="primary"
                                    onClick={() => setOpen()}
                                >
                                    方法
                                </Button>
                            </Col>
                            <Col span={10}>
                                <Input
                                    placeholder="输入文件夹名称"
                                    value={folderNameOnly}
                                    onChange={(e) =>
                                        setFolderNameOnly(e.target.value)
                                    }
                                />
                            </Col>
                            <Col span={4}>
                                <Button
                                    onClick={() => handleDownload(item)}
                                    type="primary"
                                >
                                    下载文件
                                </Button>
                            </Col>
                        </Row>
                    </div>
                }
            >
                <Descriptions.Item label="采集时长" name="samplingTime">
                    {item.samplingTime || "未知"}min
                </Descriptions.Item>
                <Descriptions.Item label="开始时间" name="methodStartTime">
                    {item.methodStartTime || "未知"}
                </Descriptions.Item>
                <Descriptions.Item label="结束时间" name="methodEndTime">
                    {item.methodEndTime || "未知"}
                </Descriptions.Item>
                <Descriptions.Item label="目标化合物SMILES" name="smiles">
                    {item.smiles || "未知"}
                </Descriptions.Item>
                <Descriptions.Item label="试管体积" name="smiles">
                    {item.tubeVolume || "未知"}
                </Descriptions.Item>

                <Descriptions.Item
                    label="实验警报"
                    name="errorMessage"
                    span={5}
                >
                    {Array.isArray(item.errorMessage)
                        ? item.errorMessage.map((error, index) => (
                              <Badge
                                  key={index}
                                  status="error"
                                  text={error}
                                  style={{ marginRight: "10px" }}
                              />
                          ))
                        : "无警报"}
                </Descriptions.Item>

                <Descriptions.Item label="实验数据" span={5}>
                    {item.curveData && item.curveData.length > 0 ? (
                        <Line
                            data={curveData}
                            num={verticalData}
                            selected_tubes={[]}
                            linePoint={pumpList}
                            samplingTime={endStart}
                            dimensions={dimensions}
                        />
                    ) : null}
                </Descriptions.Item>

                <Descriptions.Item label="实验操作" name="taskList">
                    {renderTaskList(item.taskList)}
                </Descriptions.Item>
            </Descriptions>
        ),
    }));

    return (
        <div className="data-main">
            {contextHolder}
            <div>
                <Row>
                    <Col span={8}>
                        <Input
                            placeholder="请输入文件夹名称"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                        />
                    </Col>
                    <Col span={4}>
                        <Button type="primary" onClick={handleDownloadAll}>
                            导出所有文件
                        </Button>
                    </Col>
                </Row>
            </div>
            <Collapse
                accordion
                items={items}
                onChange={handleCollapseChange}
                className="headerStyle"
            />
            <Modal
                open={openReset}
                onOk={handleOkReset}
                onCancel={handleCancel}
                width="100%"
            >
                {currentMethod && (
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
                            size="lager"
                        >
                            <tbody>
                                <tr>
                                    <td>采集时间:</td>
                                    <td>
                                        {currentMethod.samplingTime || "未知"}
                                    </td>
                                    <td>检测器波长:</td>
                                    <td>
                                        {currentMethod.detectorWavelength ||
                                            "未知"}
                                    </td>
                                    <td>试管容积:</td>
                                    <td>
                                        {currentMethod.tubeVolume || "未知"}
                                    </td>
                                    <td>平衡柱子:</td>
                                    <td>
                                        {currentMethod.equilibrationColumn === 1
                                            ? "是"
                                            : "否"}
                                    </td>
                                </tr>

                                {currentMethod.equilibrationColumn === 1 && (
                                    <tr>
                                        <td>速度:</td>
                                        <td>{currentMethod.speed || "未知"}</td>
                                        <td>总流速:</td>
                                        <td>
                                            {currentMethod.totalFlowRate ||
                                                "未知"}
                                        </td>
                                    </tr>
                                )}

                                <tr>
                                    <td>蠕动泵速度:</td>
                                    <td>
                                        {currentMethod.peristaltic_velocity ||
                                            "未知"}
                                    </td>
                                    <td>蠕动泵加速度:</td>
                                    <td>
                                        {currentMethod.peristaltic_acceleration ||
                                            "未知"}
                                    </td>
                                    <td>蠕动泵减速度:</td>
                                    <td>
                                        {currentMethod.peristaltic_deceleration ||
                                            "未知"}
                                    </td>
                                    <td>喷淋准备时间:</td>
                                    <td>
                                        {currentMethod.spray_ready_time ||
                                            "未知"}
                                    </td>
                                </tr>

                                <tr>
                                    <td>喷淋开始时间:</td>
                                    <td>
                                        {currentMethod.spray_start_time ||
                                            "未知"}
                                    </td>
                                    <td>喷淋停止时间:</td>
                                    <td>
                                        {currentMethod.spray_stop_time ||
                                            "未知"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>模式:</td>
                                    <td>
                                        {currentMethod.isocratic === 1
                                            ? "等度洗脱"
                                            : "二元高压洗脱"}
                                    </td>
                                </tr>
                                {currentMethod.isocratic === 1 ? (
                                    <tr>
                                        <td>泵A:</td>
                                        <td>{currentMethod.pumpA || "未知"}</td>
                                        <td>泵B:</td>
                                        <td>{currentMethod.pumpB || "未知"}</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td>泵速度:</td>
                                        <td colSpan="3">
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
                                                    {Array.isArray(
                                                        currentMethod.pumpList
                                                    ) ? (
                                                        currentMethod.pumpList.map(
                                                            (entry, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        {entry.time ||
                                                                            "未知"}
                                                                    </td>
                                                                    <td>
                                                                        {entry.pumpA ||
                                                                            "未知"}
                                                                    </td>
                                                                    <td>
                                                                        {entry.pumpB ||
                                                                            "未知"}
                                                                    </td>
                                                                    <td>
                                                                        {entry.flowRate ||
                                                                            "未知"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4">
                                                                无泵速度数据
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>

            <Spin spinning={spinning} fullscreen tip="正在下载......" />
        </div>
    );
};

export default App;
