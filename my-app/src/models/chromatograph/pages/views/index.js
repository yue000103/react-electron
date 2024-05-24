import React, { useState } from "react";
import { Flex, Layout, Button, Row, Col } from "antd";
import "./index.css";
import Line from "@components/d3/line";
import Buttons from "@components/button/index";
import TaskList from "@components/taskList/index";
import { color } from "d3";

const { Header, Sider, Content } = Layout;

let num = [
    { x: 0, y: 1, tube: 36 },
    { x: 1, y: 3, tube: 234 },
    { x: 3, y: 4, tube: 298 },
    { x: 4, y: 5, tube: 317 },
    { x: 5, y: 7, tube: 72 },
    { x: 7, y: 8, tube: 200 },
    { x: 8, y: 9, tube: 333 },
    { x: 9, y: 10, tube: 117 },
    { x: 10, y: 11, tube: 260 },
    { x: 11, y: 12, tube: 45 },
    { x: 12, y: 13, tube: 184 },
    { x: 13, y: 14, tube: 78 },
    { x: 14, y: 15, tube: 197 },
    { x: 15, y: 16, tube: 319 },
    { x: 16, y: 17, tube: 253 },
    { x: 17, y: 18, tube: 342 },
    { x: 18, y: 19, tube: 206 },
    { x: 19, y: 20, tube: 157 },
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
];

const tube_list = [];
const colorMap = {
    0: "Zero",
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
};
let colorNum = 0;
let selected_tube = []; // 接收到的试管列表
let selected_tubes = []; //总的是试管列表
let selected_reverse = [];

const App = () => {
    const [nums, setNum] = useState(num);
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
    const saveFlags = () => {
        let new_tube = { tube_list: selected_tube, status: "retain" };
        selected_tubes = [...selected_tubes, new_tube];
        let color = selected_tubes.length;
        if (colorNum != 9) {
            colorNum++;
        } else {
            colorNum = 1;
        }
        process_data_flag(selected_tube, true, colorMap[colorNum]);
        selected_reverse = [];
    };
    const abandonFlags = () => {
        let new_tube = { tube_list: selected_tube, status: "discard" };
        selected_tubes = [...selected_tubes, new_tube];
        let color = 0;

        process_data_flag(selected_tube, false, colorMap[color]);
        selected_reverse = [];
    };
    const reverseFlags = () => {
        selected_reverse = selected_tube;
        let reverse = num.filter(
            (item) =>
                !selected_reverse.includes(item.tube) && item.flag == undefined
        );
        selected_reverse = reverse.map((item) => item.tube);
        setNum(selected_reverse);
        handleReceiveFlags(selected_reverse, num);
    };
    const undoReceiveFlags = (index) => {
        const tubeList = selected_tubes[index].tube_list;
        selected_tubes = selected_tubes.filter((_, idx) => idx !== index);
        process_data_flag(tubeList, undefined);
    };
    return (
        <Flex gap="middle" wrap className="container">
            <Layout className="layoutStyle">
                <Row>
                    <Col span={20}>
                        <div className="headerStyle">
                            <Line
                                data={data}
                                num={num}
                                selected_tubes={selected_tubes}
                            ></Line>
                            {/* <Test data={data}></Test> */}
                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="contentStyle">
                            <Flex wrap gap="small">
                                <Button
                                    type="primary"
                                    className="button"
                                    onClick={() => saveFlags()}
                                >
                                    保留
                                </Button>
                                <Button
                                    type="primary"
                                    className="button"
                                    onClick={() => abandonFlags()}
                                >
                                    废弃
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => reverseFlags()}
                                    className="button"
                                >
                                    反转
                                </Button>
                                <Button type="primary  " className="button">
                                    暂停
                                </Button>
                            </Flex>
                        </div>
                    </Col>
                </Row>
                <Layout>
                    <Sider width="50%" className="siderStyle">
                        <Buttons
                            num={num}
                            selected={selected_reverse}
                            callback={handleReceiveFlags}
                        ></Buttons>
                    </Sider>
                    <Content className="taskStyle">
                        <TaskList
                            selected_tubes={selected_tubes}
                            callback={undoReceiveFlags}
                        ></TaskList>
                    </Content>
                </Layout>
            </Layout>
        </Flex>
    );
};
export default App;
