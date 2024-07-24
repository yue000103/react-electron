import React, { useState } from "react";
import { Table, Input } from "antd";

const EditableTable = ({ columnsConfig }) => {
    const [dataSource, setDataSource] = useState([
        { key: "1", time: "", pumpA: "", pumpB: "" },
    ]);
    const [count, setCount] = useState(2);

    const handleInputChange = (e, key, column) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => item.key === key);
        if (index > -1) {
            const item = newData[index];
            item[column] = e.target.value;
            newData[index] = item;
            setDataSource(newData);
        }
    };

    const handleKeyPress = (e, key) => {
        if (e.key === "Enter") {
            const row = dataSource.find((item) => item.key === key);
            if (row && row.time && row.pumpA && row.pumpB) {
                addNewRow();
            }
        }
    };

    const addNewRow = () => {
        setDataSource([
            ...dataSource,
            { key: count.toString(), time: "", pumpA: "", pumpB: "" },
        ]);
        setCount(count + 1);
    };

    const columns = columnsConfig.map((column) => ({
        title: column.title,
        dataIndex: column.dataIndex,
        key: column.dataIndex,
        render: (text, record) => (
            <Input
                value={text}
                onChange={(e) =>
                    handleInputChange(e, record.key, column.dataIndex)
                }
                onKeyPress={(e) => handleKeyPress(e, record.key)}
            />
        ),
    }));

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            bordered
            size="small"
        />
    );
};

export default EditableTable;
