import React, { useState, useEffect } from "react";
import {
    Flex,
    Layout,
    Button,
    Row,
    Col,
    Alert,
    message,
    Divider,
    Spin,
} from "antd";
import "./index.css";
import Line from "@components/d3/line";
import Buttons from "@components/button/index";
import TaskList from "@components/taskList/index";
import { Empty } from "antd";
import {
    getEluentCurve,
    getEluentVertical,
    getEluentLine,
    updateEluentLine,
    pauseEluentLine,
    startEluentLine,
    terminateEluentLine,
} from "../../api/eluent_curve";
import { timeout } from "d3";
import moment from "moment";

const { Header, Sider, Content } = Layout;

let num = [
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 1 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 2 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 3 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 4 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 5 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 6 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 7 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 8 },
    // { timeStart: "17:46:47", timeEnd: "17:48:37", tube: 9 },
    // { time: "17:48:37", value: 88.51848125394666 },
    // { time: "17:48:40", value: 88.51848125394666 },
    // { time: "17:48:60", value: 20.51848125394666 },
];

let data = [
    // { time: "17:46:47", value: 81.41712213857508 },
    // { time: "17:48:37", value: 88.51848125394666 },
    // { time: "17:48:40", value: 88.51848125394666 },
    // { time: "17:48:60", value: 20.51848125394666 },
    // { x: 0, y: 62 },
    // { x: 1, y: 62 },
    // { x: 3, y: 87 },
    // { x: 4, y: 57 },
    // { x: 5, y: 33 },
    // { x: 7, y: 20 },
    // { x: 8, y: 71 },
    // { x: 9, y: 19 },
    // { x: 10, y: 53 },
    // { x: 11, y: 89 },
    // { x: 12, y: 49 },
    // { x: 13, y: 82 },
    // { x: 14, y: 79 },
    // { x: 15, y: 17 },
    // { x: 16, y: 13 },
    // { x: 17, y: 29 },
    // { x: 18, y: 16 },
    // { x: 19, y: 72 },
    // { x: 20, y: 97 },
    // { x: 21, y: 97 },
    // { x: 22, y: 85 },
    // { x: 23, y: 45 },
    // { x: 24, y: 34 },
    // { x: 25, y: 66 },
    // { x: 26, y: 59 },
    // { x: 27, y: 73 },
    // { x: 28, y: 54 },
    // { x: 29, y: 38 },
    // { x: 30, y: 81 },
];

let linePoint = [];
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
let intervalId1;
let intervalId2;
let startTime;
let flagStartTime = 1; //  1 实验从头开始  0 实验继续
let lineFlag = 1; //  1 可以修改折线 0 不可以修改折线
let newPoints = [];

const App = () => {
    const [loading, setLoading] = React.useState(false);

    // const [nums, setNum] = useState(num);
    const [data, setData] = useState([]);
    const [num, setNum] = useState([]);
    const [linePoint, setLine] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const handleReceiveFlags = (select_tubes, numss) => {
        selected_tube = select_tubes;
        setNum(numss);
    };
    // flag  ： undefined  没被选中   true  保留  false  废弃
    const handleUpdatePoint = (linePointChange) => {
        console.log(
            "-------------------------------------------------linePointChange",
            linePointChange
        );
        newPoints = linePointChange;
    };
    const process_data_flag = (selected_tube, flag, color) => {
        let nums = num.map((item) => {
            if (selected_tube.includes(item.tube)) {
                return { ...item, flag: flag, color: color };
            }
            return item;
        });

        setNum(nums);
        console.log(nums);
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

    const start = () => {
        lineFlag = 0;
        setLoading(true);
        if (flagStartTime == 1) {
            reset();
            startTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            // 或者使用适当的时间格式
            flagStartTime = 0;
            updateEluentLine({ point: newPoints, start_time: startTime })
                .then((responseData) => {
                    console.log("responseData :", responseData);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            startEluentLine().then((responsedata) => {
                console.log("responsedata :", responsedata);
            });
        }

        intervalId1 = setInterval(() => {
            getEluentCurve({ start_time: startTime })
                .then((responseData) => {
                    setData((prevData) => [
                        ...prevData,
                        responseData.data.point,
                    ]);
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 1000);
        intervalId2 = setInterval(() => {
            getEluentVertical({ start_time: startTime })
                .then((responseData) => {
                    setNum((prevNum) => [...prevNum, responseData.data.point]);
                })
                .catch((error) => {
                    console.log(error);
                });
            console.log("num", num);
        }, 10000);
    };

    const terminate = () => {
        flagStartTime = 1;

        clearInterval(intervalId1);
        clearInterval(intervalId2);
        setLoading(false);
        terminateEluentLine().then((responseData) => {
            console.log("responseData :", responseData);
        });
    };
    const pause = () => {
        clearInterval(intervalId1);

        clearInterval(intervalId2);
        pauseEluentLine().then((responseData) => {
            console.log("responseData :", responseData);
        });
    };
    const reset = () => {
        lineFlag = 1;
        getEluentLine().then((responseData) => {
            setLine(responseData.data.point);
        });

        setData(() => []);
        setNum(() => []);
        selected_tubes = [];
    };
    useEffect(() => {
        getEluentLine().then((responseData) => {
            setLine(responseData.data.point);
            newPoints = responseData.data.point;
        });

        // let rubePoint = [];
        // for (let i = 1; i < 41; i++) {
        //     rubePoint.push({ timeStart: "", timeEnd: "", tube: i });
        // }
        // setNum((prevNum) => rubePoint); // 更新状态
    }, []);
    return (
        <Flex gap="middle" wrap>
            {contextHolder}
            <Layout>
                <div
                    style={{
                        height: "340px",
                        width: "100%",
                        backgroundColor: "white",
                    }}
                >
                    <Row>
                        <Col span={4}>
                            <div className="buttonStyle">
                                <Button
                                    type="primary"
                                    size="large"
                                    danger
                                    className={`button button1`} // 使用模板字符串
                                    onClick={() => start()}
                                >
                                    开始
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    className={`button button2`}
                                    onClick={() => pause()}
                                >
                                    暂停
                                </Button>

                                <Button
                                    type="primary  "
                                    size="large"
                                    className="button"
                                    onClick={() => terminate()}
                                >
                                    终止
                                </Button>
                                <Button
                                    type="primary  "
                                    size="large"
                                    className="button"
                                    onClick={() => reset()}
                                >
                                    复位
                                </Button>
                            </div>
                        </Col>
                        <Col span={20}>
                            <div className={`lineStyle overlayBox`}>
                                <div className={`line_line overlayBox1`}>
                                    <Line
                                        data={data}
                                        num={num}
                                        selected_tubes={selected_tubes}
                                        linePoint={linePoint}
                                        lineFlag={lineFlag}
                                        callback={handleUpdatePoint}
                                    ></Line>
                                </div>

                                {/* <div className={`line_dynamic overlayBox2`}>
                                    <DynamicLine></DynamicLine>
                                </div> */}
                            </div>
                        </Col>
                    </Row>
                </div>
                <Divider
                    className="divider"
                    style={{
                        color: "#9a0000",
                        fontSize: "20px",
                    }}
                >
                    操作
                </Divider>
                <Spin spinning={loading} delay={500}>
                    <Layout className="bottomStyle">
                        <Sider width="44%" className="siderStyle">
                            <div className="buttonTitle">试管列表</div>
                            <div className="buttonTube">
                                {num.length > 0 ? (
                                    <Buttons
                                        num={num}
                                        selected={selected_reverse}
                                        callback={handleReceiveFlags}
                                    ></Buttons>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        imageStyle={{ height: 0 }}
                                        description={<span>暂无试管</span>}
                                    />
                                )}
                            </div>
                        </Sider>
                        <Sider width="9%" className="siderStyle">
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
                                        imageStyle={{ height: 0 }}
                                        description={<span>暂无任务</span>}
                                    />
                                )}
                            </div>
                        </Content>
                    </Layout>
                </Spin>
            </Layout>
        </Flex>
    );
};
export default App;
