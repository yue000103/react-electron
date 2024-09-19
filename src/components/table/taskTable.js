import React, { useState } from "react";
import { Button, Flex, Table, Checkbox } from "antd";
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
    const { selected_tubes, button_flag, callback } = props;
    const [title, setTitle] = useState(props.title);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(props.buttonFlag);
    const [allSelected, setAllSelected] = useState(false); // 新增状态
    const dataSource = selected_tubes.map((tube, i) => ({
        key: i,
        status:
            tube.status === "abandon"
                ? "废弃"
                : tube.status === "clean"
                ? "清洗"
                : tube.status === "retain"
                ? "保留"
                : tube.status,
        tube_list: ` ${tube.tube_list}`,
    }));
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

        const result = selectedData.map((item, index) => {
            return { flag: "delete", index: index };
        });
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

    return (
        <Flex gap="middle" vertical>
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
                </Flex>
            ) : (
                <div></div>
            )}
        </Flex>
    );
};
export default App;
