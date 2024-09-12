import React, { useRef } from "react";
import { List, Avatar, Button, Popconfirm, Row, Col } from "antd";
// import { FixedSizeList as VirtualList } from "react-window";
import { VariableSizeList as VirtualList } from "react-window";

import "./index.css";
import {
    DeleteFilled,
    DeleteOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";

const text = "Are you sure to delete this task?";
const description = "Delete the task";

const App = (props) => {
    const { selected_tubes, button_flag, callback } = props;
    console.log("9010       button_flag :", button_flag == 1);
    console.log("9010       selected_tubes :", selected_tubes);
    const heightCache = useRef({}); // 缓存每项的高度

    const runs = (index, tubeObj, status) => {
        // console.log("0909--------status :", status);
        // console.log("0909--------index: ", index);
        // console.log("0909--------tubeObj", tubeObj.tube_list[0]);
        let flag = "run";
        callback(index, flag);
    };
    const deletes = (index) => {
        let flag = "delete";
        callback(index, flag);
    };
    // 计算内容高度的示例函数（需要根据实际内容计算）
    const calculateHeightBasedOnContent = (tube) => {
        // 这里假设内容是简单的字符串，长度作为高度计算的示例
        const baseHeight = 50; // 基础高度
        const additionalHeight = tube.tube_list.join(", ").length * 1.5; // 根据内容长度增加的高度
        return baseHeight + additionalHeight;
    };

    const getItemSize = (index) => {
        const tube = selected_tubes[index];
        console.log("9010       button_flag :", button_flag == 1);
        console.log("9010       selected_tubes :", selected_tubes);
        if (heightCache.current[index]) {
            return heightCache.current[index];
        }
        // 计算内容高度的逻辑
        const contentHeight = calculateHeightBasedOnContent(tube);
        heightCache.current[index] = contentHeight;
        return contentHeight;
    };
    const Row = ({ index, style }) => {
        const tubeObj = selected_tubes[index];

        return (
            <List.Item key={index} style={style} className="listItem">
                <div className="metaContent">
                    <List.Item.Meta
                        title={
                            <div className="content">
                                {button_flag == 1 ? (
                                    <span className="statusClass" disable>
                                        {
                                            tubeObj.status === "retain"
                                                ? "保留："
                                                : tubeObj.status === "abandon"
                                                ? "废弃："
                                                : tubeObj.status === "clean"
                                                ? "清洗："
                                                : "未知状态：" // 默认情况，处理其他未预期的status值
                                        }
                                    </span>
                                ) : (
                                    <div></div>
                                )}

                                <span className="listClass">
                                    {tubeObj.tube_list.join(", ")}
                                </span>
                            </div>
                        }
                    />
                </div>
                <div className="buttonTask">
                    <Popconfirm
                        placement="topRight"
                        title={"Are you sure to run this task?"}
                        description={"Run the task"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => runs(index, tubeObj, tubeObj.status)}
                    >
                        <PlayCircleOutlined
                            style={{
                                fontSize: "25px",
                                color: "#9a0000",
                                marginRight: "1rem",
                            }}
                        />
                    </Popconfirm>
                    <Popconfirm
                        placement="topRight"
                        title={text}
                        description={"Delete the task"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => deletes(index)}
                    >
                        <DeleteFilled style={{ fontSize: "25px" }} />
                    </Popconfirm>
                </div>
            </List.Item>
        );
    };

    return (
        <div className="scrollable-list">
            <List>
                <VirtualList
                    header={<div>Header</div>}
                    footer={<div>Footer</div>}
                    bordered
                    height={250} // 容器高度
                    itemCount={selected_tubes.length}
                    itemSize={(index) => getItemSize(index)} // 每项的高度动态计算
                    // width="100%"
                >
                    {({ index, style }) => <Row index={index} style={style} />}
                </VirtualList>
            </List>
        </div>
    );
};

export default App;
