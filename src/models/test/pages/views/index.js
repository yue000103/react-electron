import React, { useState } from "react";
import { Flex, Layout, Button } from "antd";
import "./index.css";
// import Line from "@components/d3/line";
// import Buttons from "@components/button/index";

const { Header, Sider, Content } = Layout;

let num = [
    { x: 0, y: 1, flag: 36 },
    { x: 1, y: 3, flag: 234 },
    { x: 3, y: 4, flag: 298 },
    { x: 4, y: 5, flag: 317 },
    { x: 5, y: 7, flag: 72 },
    { x: 7, y: 8, flag: 200 },
    { x: 8, y: 9, flag: 333 },
    { x: 9, y: 10, flag: 117 },
    { x: 10, y: 11, flag: 260 },
    { x: 11, y: 12, flag: 45 },
    { x: 12, y: 13, flag: 184 },
    { x: 13, y: 14, flag: 78 },
    { x: 14, y: 15, flag: 197 },
    { x: 15, y: 16, flag: 319 },
    { x: 16, y: 17, flag: 253 },
    { x: 17, y: 18, flag: 342 },
    { x: 18, y: 19, flag: 206 },
    { x: 19, y: 20, flag: 157 },
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

let selectedFlags = [];
let selectedFlag = {};
const App = () => {
    const [nums, setNum] = useState(num);

    // 处理接收子组件传回的 selectedFlags 数据
    const handleReceiveFlags = (flags, nums) => {
        selectedFlags = flags;
        num = nums;
    };
    const saveFlags = () => {
        console.log("-----------", selectedFlag);
        selectedFlag = { selectedFlags };
        console.log("-----------", selectedFlag);

        num = num.map((item) => {
            const newStatus =
                item.status === 0
                    ? selectedFlags.includes(item.flag)
                        ? 1
                        : 0
                    : item.status === undefined
                    ? 0
                    : item.status;
            return {
                x: item.x,
                y: item.y,
                flag: item.flag,
                status: newStatus,
            };
        });
        console.log("-----------num", num);

        setNum(num);
    };
    const abandonFlags = () => {
        num = num.map((item) => {
            const newStatus =
                item.status === 0
                    ? selectedFlags.includes(item.flag)
                        ? 2
                        : 0
                    : item.status === undefined
                    ? 0
                    : item.status;
            return {
                x: item.x,
                y: item.y,
                flag: item.flag,
                status: newStatus,
            };
        });
        setNum(num);
    };
    return (
        <Flex gap="middle" wrap className="container">
            <Layout className="layoutStyle">
                <div className="headerStyle">
                    {/* <Test data={data}></Test> */}
                </div>
                <Layout>
                    <Sider width="65%" className="siderStyle"></Sider>
                    <Content className="contentStyle">
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
                            <Button type="primary" className="button">
                                反转
                            </Button>
                            <Button type="primary  " className="button">
                                暂停
                            </Button>
                        </Flex>
                    </Content>
                </Layout>
            </Layout>
        </Flex>
    );
};
export default App;
