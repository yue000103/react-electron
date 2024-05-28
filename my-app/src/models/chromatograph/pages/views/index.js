import React, { useState } from "react";
import { Flex, Layout, Button, Row, Col, Alert, message } from "antd";
import "./index.css";
import Line from "@components/d3/line";
import DynamicLine from "@components/d3/dynamicLine";

import Buttons from "@components/button/index";
import TaskList from "@components/taskList/index";
import Clock from "@components/clock/index";
import { Empty } from "antd";

import { color } from "d3";
import pkuImage from "@/assets/image/pku.png"; // 确保路径正确
import "@components/css/overlay.css"; // 确保路径正确

const { Header, Sider, Content } = Layout;

let num = [
    { x: 0, y: 1, tube: 1 },
    { x: 1, y: 3, tube: 2 },
    { x: 3, y: 4, tube: 3 },
    { x: 4, y: 5, tube: 4 },
    { x: 5, y: 7, tube: 5 },
    { x: 7, y: 8, tube: 6 },
    { x: 8, y: 9, tube: 7 },
    { x: 9, y: 10, tube: 8 },
    { x: 10, y: 11, tube: 9 },
    { x: 11, y: 12, tube: 10 },
    { x: 12, y: 13, tube: 11 },
    { x: 13, y: 14, tube: 12 },
    { x: 14, y: 15, tube: 13 },
    { x: 15, y: 16, tube: 14 },
    { x: 16, y: 17, tube: 15 },
    { x: 17, y: 18, tube: 16 },
    { x: 18, y: 19, tube: 17 },
    { x: 19, y: 20, tube: 18 },
    { x: 20, y: 21, tube: 19 },
    { x: 21, y: 22, tube: 20 },
    { x: 22, y: 23, tube: 21 },
    { x: 23, y: 24, tube: 22 },
    { x: 24, y: 25, tube: 23 },
    { x: 25, y: 26, tube: 24 },
    { x: 26, y: 27, tube: 25 },
    { x: 27, y: 28, tube: 26 },
    { x: 28, y: 29, tube: 27 },
    { x: 29, y: 30, tube: 28 },
];

const data = [
    { x: 0, y: 62 },
    { x: 1, y: 62 },
    { x: 3, y: 87 },
    { x: 4, y: 57 },
    { x: 5, y: 33 },
    { x: 7, y: 20 },
    { x: 8, y: 71 },
    { x: 9, y: 19 },
    { x: 10, y: 53 },
    { x: 11, y: 89 },
    { x: 12, y: 49 },
    { x: 13, y: 82 },
    { x: 14, y: 79 },
    { x: 15, y: 17 },
    { x: 16, y: 13 },
    { x: 17, y: 29 },
    { x: 18, y: 16 },
    { x: 19, y: 72 },
    { x: 20, y: 97 },
    { x: 21, y: 97 },
    { x: 22, y: 85 },
    { x: 23, y: 45 },
    { x: 24, y: 34 },
    { x: 25, y: 66 },
    { x: 26, y: 59 },
    { x: 27, y: 73 },
    { x: 28, y: 54 },
    { x: 29, y: 38 },
    { x: 30, y: 81 },
];

const tube_list = [];
const colorMap = {
    0: "Zero",
    1: "One",
    2: "One",
    3: "One",
    4: "One",
    5: "One",
    6: "One",
    7: "One",
    8: "One",
    9: "One",
};
let colorNum = 0;
let selected_tube = []; // 接收到的试管列表
let selected_tubes = []; //总的是试管列表
let selected_reverse = [];

const App = () => {
    const [nums, setNum] = useState(num);
    const [messageApi, contextHolder] = message.useMessage();

    const handleReceiveFlags = (select_tubes, numss) => {
        selected_tube = select_tubes;
        num = numss;
    };
    // flag  ： undefined  没被选中   true  保留  false  废弃

    const process_data_flag = (selected_tube, flag, color) => {
        num = num.map((item) => {
            if (selected_tube.includes(item.tube)) {
                return { ...item, flag: flag, color: color };
            }
            return item;
        });

        setNum(num);
        console.log(num);
    };
    const splitConsecutive = (selected_tube) => {
        selected_tube = selected_tube.sort((a, b) => a - b);

        let result = [];
        let tempArray = [selected_tube[0]];

        for (let i = 1; i < selected_tube.length; i++) {
            if (selected_tube[i] === selected_tube[i - 1] + 1) {
                tempArray.push(selected_tube[i]);
            } else {
                result.push(tempArray);
                tempArray = [selected_tube[i]];
            }
        }
        result.push(tempArray);
        return result;
    };

    const retainFlags = () => {
        if (selected_tube.length > 0) {
            let consecutiveArrays = splitConsecutive(selected_tube);
            consecutiveArrays.forEach((arr) => {
                let new_tube = { tube_list: arr, status: "retain" };
                selected_tubes.push(new_tube);
            });
            if (colorNum != 9) {
                colorNum++;
            } else {
                colorNum = 1;
            }
            process_data_flag(selected_tube, true, colorMap[colorNum]);
            selected_reverse = [];
            selected_tube = [];
        } else {
            error();
        }
    };
    const abandonFlags = () => {
        if (selected_tube.length > 0) {
            let consecutiveArrays = splitConsecutive(selected_tube);
            consecutiveArrays.forEach((arr) => {
                let new_tube = { tube_list: arr, status: "discard" };
                selected_tubes.push(new_tube);
            });
            // let new_tube = { tube_list: selected_tube, status: "discard" };
            // selected_tubes = [...selected_tubes, new_tube];
            let color = 0;

            process_data_flag(selected_tube, false, colorMap[color]);
            selected_reverse = [];
            selected_tube = [];
        } else {
            error();
        }
    };
    const reverseFlags = () => {
        if (selected_tube.length > 0) {
            selected_reverse = selected_tube;
            let reverse = num.filter(
                (item) =>
                    !selected_reverse.includes(item.tube) &&
                    item.flag == undefined
            );
            selected_reverse = reverse.map((item) => item.tube);
            setNum(selected_reverse);
            handleReceiveFlags(selected_reverse, num);
        } else {
            error();
        }
    };
    const undoReceiveFlags = (index) => {
        const tubeList = selected_tubes[index].tube_list;
        selected_tubes = selected_tubes.filter((_, idx) => idx !== index);
        process_data_flag(tubeList, undefined);
    };
    const error = () => {
        messageApi.open({
            type: "error",
            content: "请选择试管 !",
            duration: 2,
        });
    };
    return (
        <Flex gap="middle" wrap className="container">
            {contextHolder}

            <Layout className="layoutStyle">
                <Row>
                    <div className="title">
                        {" "}
                        <img src={pkuImage} alt="pku" className="image" />
                        <div className="titleText">
                            <h3>Chromatography Instrument</h3>
                        </div>
                        <div className="titleClock">
                            <Clock></Clock>
                        </div>
                    </div>
                </Row>
                <div
                    style={{
                        height: "300px",
                        width: "100%",
                    }}
                >
                    <Row>
                        <Col span={4}>
                            <div className="buttonStyle">
                                <Flex wrap gap="small">
                                    <Button
                                        type="primary"
                                        className={`button button1`} // 使用模板字符串
                                        onClick={() => retainFlags()}
                                    >
                                        保留
                                    </Button>
                                    <Button
                                        type="primary"
                                        className={`button button2`}
                                        onClick={() => abandonFlags()}
                                    >
                                        废弃
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => reverseFlags()}
                                        className={`button button3`}
                                    >
                                        反转
                                    </Button>
                                    <Button type="primary  " className="button">
                                        暂停
                                    </Button>
                                </Flex>
                            </div>
                        </Col>
                        <Col span={20}>
                            <div className={`lineStyle overlayBox`}>
                                <div className={`line_line overlayBox1`}>
                                    <Line
                                        data={data}
                                        num={num}
                                        selected_tubes={selected_tubes}
                                    ></Line>
                                </div>

                                {/* <div className={`line_dynamic overlayBox2`}>
                                    <DynamicLine></DynamicLine>
                                </div> */}
                            </div>
                        </Col>
                    </Row>
                </div>
                <Layout className="bottomStyle">
                    <Sider width="50%" className="siderStyle">
                        <div className="buttonTitle">试管列表</div>
                        <div className="buttonTube">
                            <Buttons
                                num={num}
                                selected={selected_reverse}
                                callback={handleReceiveFlags}
                            ></Buttons>
                        </div>
                    </Sider>
                    <Content className="taskStyle">
                        <div className="buttonTitle">任务列表</div>
                        <div className="buttonTube">
                            {selected_tubes.length > 0 ? (
                                <TaskList
                                    selected_tubes={selected_tubes}
                                    callback={undoReceiveFlags}
                                />
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    imageStyle={{ height: 60 }}
                                    description={<span>暂无任务</span>}
                                />
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Flex>
    );
};
export default App;
