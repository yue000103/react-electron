import React, { useState } from "react";
import {
    Collapse,
    Badge,
    Descriptions,
    Button,
    Row,
    Col,
    Upload,
    Modal,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import "./index.css";
import data1 from "@/assets/image/data1.png";

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
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};

const App = () => {
    const [openReset, setOpenReset] = useState(false);
    const checkMethod = () => {
        setOpenReset(true);
    };
    const handleOkRest = () => {
        setOpenReset(false);
    };
    const handleCancel = () => {
        console.log("Clicked cancel button");
        setOpenReset(false);
    };
    const items = [
        {
            key: "1",
            label: "保存时间：2024-07-27 12:36:10",
            children: (
                <Descriptions
                    title="方法名称：0727"
                    bordered
                    extra={
                        <div>
                            <Row>
                                <Col span={19}>
                                    <Button
                                        type="primary"
                                        onClick={checkMethod}
                                    >
                                        方法
                                    </Button>
                                </Col>
                                <Col span={4}>
                                    <Upload {...props}>
                                        <Button
                                            type="primary"
                                            icon={<DownloadOutlined />}
                                        />
                                    </Upload>
                                </Col>
                            </Row>
                        </div>
                    }
                >
                    <Descriptions.Item label="采集时长">
                        50min
                    </Descriptions.Item>
                    <Descriptions.Item label="开始时间">
                        2024-07-27 12:36:10
                    </Descriptions.Item>
                    <Descriptions.Item label="结束时间">
                        2024-07-27 12:36:15
                    </Descriptions.Item>

                    <Descriptions.Item label="实验结果">
                        <Badge status="success" text="成功" />
                    </Descriptions.Item>
                    <Descriptions.Item label="实验警报" span={5}>
                        <Badge status="error" text="检测器警报" />
                        &nbsp;&nbsp;
                        <Badge status="error" text="泵堵塞" />
                    </Descriptions.Item>

                    <Descriptions.Item label="实验数据" span={5}>
                        <img
                            src={data1} // 使用导入的图片路径
                            alt="实验数据"
                            style={{
                                width: "100%",
                                maxHeight: "300px",
                                objectFit: "contain",
                            }} // 根据需要调整样式
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="实验操作">
                        <p>
                            保留: 11，12，13 &nbsp; &nbsp;&nbsp;废弃: 16，17，18
                        </p>
                        <p>
                            保留: 1，5，9，10 &nbsp; &nbsp;&nbsp;清洗:
                            1，2，3，4，5，6，7，8，9，10，11，12，13
                        </p>
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
        {
            key: "2",
            label: "This is panel header 2",
            children: (
                <Descriptions title="User Info" bordered>
                    <Descriptions.Item label="Name">John Doe</Descriptions.Item>
                    <Descriptions.Item label="Age">28</Descriptions.Item>
                    <Descriptions.Item label="Address">
                        New York, USA
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                        123-456-7890
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        johndoe@example.com
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
        {
            key: "3",
            label: "This is panel header 3",
            children: (
                <Descriptions title="Order Info" bordered>
                    <Descriptions.Item label="Order ID">
                        123456
                    </Descriptions.Item>
                    <Descriptions.Item label="Order Date">
                        2024-09-23
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount">
                        $500.00
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Status">
                        <Badge status="success" text="Paid" />
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
    ];

    return (
        <div className="data-main">
            <Collapse accordion items={items} />
            <Modal
                open={openReset}
                onOk={handleOkRest}
                onCancel={handleCancel}
                width="100%"
            >
                <div>
                    <table
                        border={"1"}
                        align="center"
                        style={{
                            marginTop: "20px",
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
                                <td>50min</td>
                                <td>检测器波长:</td>
                                <td>500</td>
                                <td>试管容积:</td>
                                <td>20</td>
                                <td>平衡柱子:</td>
                                <td>否</td>
                            </tr>

                            <tr></tr>

                            <tr>
                                <td>速度:</td>
                                <td>20</td>
                                <td>总流速:</td>
                                <td>30</td>
                            </tr>

                            <tr>
                                <td>蠕动泵速度:</td>
                                <td>10</td>
                                <td>蠕动泵加速度:</td>
                                <td>5</td>
                                <td>蠕动泵减速度:</td>
                                <td>4</td>
                                <td>喷淋准备时间:</td>
                                <td>2</td>
                            </tr>

                            <tr>
                                <td>喷淋开始时间:</td>
                                <td>5</td>
                                <td>喷淋停止时间:</td>
                                <td>5</td>
                            </tr>
                            <tr>
                                <td>模式:</td>
                                <td>等度洗脱</td>
                            </tr>

                            <tr>
                                <td>泵A:</td>
                                <td>50</td>
                                <td>泵B:</td>
                                <td>80</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

export default App;
