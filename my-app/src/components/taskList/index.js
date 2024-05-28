import React from "react";
import { List, Avatar, Button, Popconfirm } from "antd";
import { FixedSizeList as VirtualList } from "react-window";
import "./index.css";

const text = "Are you sure to delete this task?";
const description = "Delete the task";

const App = (props) => {
    const { selected_tubes, callback } = props;

    const undo = (index) => {
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
                        title={text}
                        description={description}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => undo(index)}
                    >
                        <Button type="text">Delete</Button>
                    </Popconfirm>
                </div>
            </List.Item>
        );
    };

    return (
        <div className="scrollable-list">
            <List>
                <VirtualList
                    height={350} // 容器高度
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
