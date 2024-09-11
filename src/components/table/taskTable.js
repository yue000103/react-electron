import React, { useState } from "react";
import { Button, Flex, Table } from "antd";
const columns = [
    {
        title: "操作",
        dataIndex: "status",
    },
    {
        title: "试管",
        dataIndex: "tube_list",
    },
];
const dataSource = Array.from({
    length: 46,
}).map((_, i) => ({
    key: i,
    status: `Edward King ${i}`,
    tube_list: `London, Park Lane no. ${i}`,
}));
const App = (props) => {
    // console.log("0911    props", props);
    const [title, setTitle] = useState(props.title);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(props.buttonFlag);
    const start = () => {
        setLoading(true);
        // ajax request after empty completing
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };
    const onSelectChange = (newSelectedRowKeys) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
        <Flex gap="middle" vertical>
            <Flex align="center" gap="middle">
                {buttonFlag === 1 ? (
                    <Button
                        type="primary"
                        onClick={start}
                        disabled={!hasSelected}
                        loading={loading}
                    >
                        Reload
                    </Button>
                ) : (
                    <div></div>
                )}

                {hasSelected
                    ? `Selected ${selectedRowKeys.length} items`
                    : null}
            </Flex>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={dataSource}
                title={() => title}
            />
        </Flex>
    );
};
export default App;
