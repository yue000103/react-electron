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

import { getTube } from "@/models/chromatograph/api/tube";

const text = "Are you sure to delete this task?";
const description = "Delete the task";

const App = (props) => {
    const { selected_tubes, callback } = props;
    const heightCache = useRef({}); // 缓存每项的高度

    const undo = (index) => {
        callback(index);
    };

    const runs = (index, tubeObj, status) => {
        console.log("status :", status);
        console.log("index: ", index);
        console.log("tubeObj", tubeObj.tube_list[0]);
        getTube({ tube_list: tubeObj.tube_list, operate: status }).then(
            (responseData) => {}
        );
        // callback(index);
    };

    const deletes = (index) => {
        callback(index);
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
        console.log("tubeObj :", tubeObj);
        return (
            <List.Item key={index} style={style} className="listItem">
                <div className="metaContent">
                    <List.Item.Meta
                        title={
                            <div className="content">
                                <span className="statusClass">
                                    {
                                        tubeObj.status === "retain"
                                            ? "保留："
                                            : tubeObj.status === "discard"
                                            ? "废弃："
                                            : tubeObj.status === "clean"
                                            ? "清洗："
                                            : "未知状态：" // 默认情况，处理其他未预期的status值
                                    }
                                </span>

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
                    height={280} // 容器高度
                    itemCount={selected_tubes.length}
                    itemSize={(index) => getItemSize(index)} // 每项的高度动态计算
                    width="100%"
                >
                    {({ index, style }) => <Row index={index} style={style} />}
                </VirtualList>
            </List>
        </div>
    );
};

export default App;
