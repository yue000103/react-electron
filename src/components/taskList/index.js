import React from "react";
import { List, Avatar, Button, Popconfirm } from "antd";
import { FixedSizeList as VirtualList } from "react-window";
import "./index.css";
import {
    DeleteFilled,
    DeleteOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";

import {
    getTube
} from "@/models/chromatograph/api/eluent_curve";

const text = "Are you sure to delete this task?";
const description = "Delete the task";



const App = (props) => {
    const { selected_tubes, callback } = props;

    const undo = (index) => {
        callback(index);
    };

    const runs = (index,tubeObj) => {
        console.log("index: " , index);
        console.log("tubeObj",tubeObj.tube_list[0]);
        getTube({ tube: tubeObj.tube_list[0] }).then((responseData) => {
            
        });
        // callback(index);
    };

    const deletes = (index) => {
       
        callback(index);
    };
    const Row = ({ index, style }) => {
        const tubeObj = selected_tubes[index];
        return (
            <List.Item key={index} style={style} className="listItem">
                <div className="metaContent">
                    <List.Item.Meta
                        title={
                            <div className="content">
                                <span className="statusClass">
                                    {tubeObj.status === "retain"
                                        ? "保留："
                                        : "废弃："}
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
                        onConfirm={() => runs(index,tubeObj)}
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
                    itemSize={40} // 每项的高度
                >
                    {Row}
                </VirtualList>
            </List>
        </div>
    );
};

export default App;
