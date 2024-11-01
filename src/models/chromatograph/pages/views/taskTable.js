import React, { useState } from "react";
import { Button, Flex, Table, Checkbox } from "antd";
import { Empty } from "antd";
import { pauseTube, resumeTube } from "@/models/chromatograph/api/tube";
import { logDOM } from "@testing-library/react";

const columns = [
    {
        title: "操作",
        dataIndex: "status",
        width: 30,
    },
    {
        title: "试管",
        dataIndex: "tube_list",
        width: 150,
    },
];

const App = (props) => {
    const { selected_tubes, button_flag, callback, selectedAllTubes } = props;
    const [title, setTitle] = useState(props.title);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(props.buttonFlag);
    const [allSelected, setAllSelected] = useState(false); // 新增状态
    const dataSource = selectedAllTubes
    .filter(tube => !isNaN(tube.module_index)) // 过滤掉module_index为NaN的值
    .map((tube, i) => ({
        key: i,
        status:
            tube.status === "abandon"
                ? "废弃"
                : tube.status === "clean"
                ? "清洗"
                : tube.status === "retain"
                ? "保留"
                : tube.status,
        tube_list: `${tube.module_index + 1} - ${tube.tube_index_list
            .map((index) => index + 1)
            .join(", ")}`,
    }));
    console.log("0926    selected",selectedAllTubes);
    
    const runTubes = () => {
        const selectedData = dataSource.filter((item) =>
            selectedRowKeys.includes(item.key)
        );
        console.log("9012   选中的信息：", selectedData);
        const result = selectedData.map((item, index) => {
            return { flag: "run", index: item.key };
        });
        callback(result);
        console.log("9012   result", result);
    };
    const deleteTubes = () => {
        const selectedData = dataSource.filter((item) =>
            selectedRowKeys.includes(item.key)
        );
        console.log("1030   selectedData",selectedData);
        const result = selectedData.map((item, index) => {
            return { flag: "delete", index: item.key };
        });
        console.log("1030   result",result);

        callback(result);
    };
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const onSelectAll = (e) => {
        const newSelectedRowKeys = e.target.checked
            ? dataSource.map((item) => item.key)
            : [];
        setSelectedRowKeys(newSelectedRowKeys);
        setAllSelected(e.target.checked);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const pause = () => {
        pauseTube().then((res) => {
            if (!res.error) {
            }
        });
    };
    const resume = () => {
        resumeTube().then((res) => {
            if (!res.error) {
            }
        });
    };

    return (
        <Flex gap="middle" vertical>
            {dataSource.length > 0 ? (
                <div>
                    <Table
                        size="small"
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={dataSource}
                        title={false}
                        scroll={{
                            x: 200,
                            y: 200,
                        }}
                        pagination={false}
                        style={{
                            marginTop: "10px",
                            marginLeft: "10px",
                            marginRight: "10px",
                        }}
                        showHeader={false}
                    />

                    {buttonFlag === 1 ? (
                        <Flex
                            align="center"
                            gap="middle"
                            style={{ marginLeft: "20px" }}
                        >
                            <Checkbox
                                checked={allSelected}
                                onChange={onSelectAll}
                                disabled={dataSource.length === 0}
                            ></Checkbox>
                            <Button
                                type="primary"
                                onClick={runTubes}
                                disabled={!hasSelected}
                                loading={loading}
                            >
                                运行
                            </Button>
                            <Button
                                type="primary"
                                onClick={deleteTubes}
                                disabled={!hasSelected}
                                loading={loading}
                                // style={{backgroundColor: '#ad0202',}}
                            >
                                删除
                            </Button>
                            <Button
                                type="primary"
                                onClick={pause}
                                // style={{backgroundColor: '#ad0202',}}
                            >
                                暂停
                            </Button>
                            <Button
                                type="primary"
                                onClick={resume}
                                // style={{backgroundColor: '#ad0202',}}
                            >
                                继续
                            </Button>
                        </Flex>
                    ) : (
                        <div></div>
                    )}
                </div>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{ height: 100 }}
                    description={<span>暂无试管</span>}
                />
            )}
        </Flex>
    );
};
export default App;
