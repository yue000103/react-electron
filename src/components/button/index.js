import React, { useState, useEffect } from "react";
import { Button, Flex, Row, Col, Card, Rate } from "antd";
import "./index.css";
import color from "@components/color/index";
import { convertLegacyProps } from "antd/es/button";
import { HeartOutlined, AliyunOutlined } from "@ant-design/icons";

let select_tube = [];
const groupsOrigin = [
    [
        { time_start: "00:00:00", time_end: "00:00:00", tube: 1 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 2 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 3 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 4 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 5 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 6 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 7 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 8 },
    ],
    [
        { time_start: "00:00:00", time_end: "00:00:00", tube: 1 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 2 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 3 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 4 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 5 },
    ],
    [
        { time_start: "00:00:00", time_end: "00:00:00", tube: 1 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 2 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 3 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 4 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 5 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 6 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 7 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 8 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 9 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 10 },
    ],
];

const desc = [
    "0.1",
    "0.2",
    "0.3",
    "0.4",
    "0.5",
    "0.6",
    "0.7",
    "0.8",
    "0.9",
    "1",
];
const tubeV = 120;

// 新的数据格式：将mode和tubeValues合并为一个数组的元组
const modeAndValues = [
    [1, 50],
    [2, 80],
    [3, 30],
    [4, 80],
];

const App = ({ num, callback, selected, clean_flag }) => {
    const _ = require("lodash");

    const [selectedFlag, setSelectedFlags] = useState([]);
    const [cleanFlag, setCleanFlag] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [groupsOfTen, setGroupsOfTen] = useState(_.cloneDeep(groupsOrigin));
    const [value, setValue] = useState([]);

    const handleRateChange = (newValue, index) => {
        const updatedValue = [...value];
        updatedValue[index] = newValue;
        setValue(updatedValue);
    };
    console.log("0609     num", num);

    useEffect(() => {
        setCleanFlag(clean_flag);
        if (num.length == 0) {
            setGroupsOfTen(_.cloneDeep(groupsOrigin));
        }
        if (selected) {
            setSelectedFlags(selected);
            callback(selected, num);
        } else {
            setSelectedFlags([]);
        }

        return () => {
            console.log("组件即将卸载，清除副作用...");
        };
    }, [num, selected, clean_flag]);

    const handleButtonClick = (tube) => {
        setSelectedFlags((prevFlags) => {
            const isSelected = prevFlags.includes(tube);

            if (isSelected) {
                select_tube = prevFlags.filter((f) => f !== tube);
                callback(select_tube, num);
                return select_tube;
            } else {
                let newFlags = [tube];
                if (prevFlags.length > 0) {
                    newFlags = Array.from(
                        {
                            length: tube - prevFlags[prevFlags.length - 1] + 1,
                        },
                        (_, i) => prevFlags[prevFlags.length - 1] + i
                    );
                }

                select_tube = [...newFlags];
                callback(select_tube, num);
                return select_tube;
            }
        });
    };

    const chunkArray = (array, chunkSize) => {
        const results = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            results.push(array.slice(i, chunkSize + i));
        }
        return results;
    };

    const calculateIndex = (row, col) => {
        const result = col - 1 < 0 ? 0 : Math.pow(2, col - 1);
        return row * 2 + result;
    };

    const combineGroups = (array, groupSize) => {
        const results = [];
        for (let i = 0; i < array.length; i += groupSize) {
            results.push(array.slice(i, groupSize + i));
        }
        return results;
    };

    const combinedGroups = combineGroups(groupsOfTen, 2);

    function findObjectIndex(
        groupIndex,
        arrayIndex,
        groupWithinArray,
        itemIndex
    ) {
        let totalIndex = 0;
        for (let i = 0; i < groupIndex; i++) {
            for (let j = 0; j < combinedGroups[i].length; j++) {
                totalIndex += combinedGroups[i][j].length;
            }
        }
        for (let j = 0; j < arrayIndex; j++) {
            totalIndex += combinedGroups[groupIndex][j].length;
        }
        totalIndex += groupWithinArray * 5;
        totalIndex += itemIndex;
        return totalIndex;
    }

    // 根据索引获取对应的mode和tubeValue
    const getModeAndValue = (index) => {
        // 确保index不超过modeAndValues数组长度
        const safeIndex = index % modeAndValues.length;
        return modeAndValues[safeIndex];
    };

    return (
        <div className="button-div">
            {combinedGroups.map((group, groupIndex) => (
                <Row key={groupIndex} gutter={0} style={{ width: "100%" }}>
                    {group.map((subGroup, subGroupIndex) => (
                        <div className="card">
                            <Col key={subGroupIndex}>
                                {chunkArray(subGroup, 5).map(
                                    (row, rowIndex) => (
                                        <Row
                                            key={rowIndex}
                                            justify="space-around"
                                            gutter={0}
                                        >
                                            {row.map((item, index) => {
                                                const tube = item.tube;
                                                const isSelected =
                                                    selectedFlag.includes(tube);

                                                num.map((n) => {
                                                    groupsOfTen[n.module_index][
                                                        n.tube_index
                                                    ].time_start = n.time_start;
                                                    groupsOfTen[n.module_index][
                                                        n.tube_index
                                                    ].time_end = n.time_end;
                                                });

                                                let tube_index =
                                                    findObjectIndex(
                                                        groupIndex,
                                                        subGroupIndex,
                                                        rowIndex,
                                                        index
                                                    );
                                                let isNum =
                                                    num[tube_index] !==
                                                    undefined;

                                                let buttonColorStyle = {};
                                                let buttonDisabled = false;

                                                if (cleanFlag == 1) {
                                                    buttonDisabled = false;
                                                } else {
                                                    if (!isNum) {
                                                        buttonColorStyle =
                                                            color["colorEight"];
                                                        buttonDisabled = true;
                                                    }
                                                }
                                                if (item.color) {
                                                    buttonDisabled = true;
                                                    let colorName = `color${item.color}`;
                                                    buttonColorStyle =
                                                        color[colorName];
                                                }

                                                return (
                                                    <Col key={index}>
                                                        <div
                                                            onClick={() =>
                                                                handleButtonClick(
                                                                    tube
                                                                )
                                                            }
                                                            className="card_buttton"
                                                        >
                                                            <Button
                                                                shape="circle"
                                                                className="buttonTubes"
                                                                disabled={
                                                                    buttonDisabled
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        isSelected
                                                                            ? "#d5d5f5"
                                                                            : "",
                                                                    color: isSelected
                                                                        ? "white"
                                                                        : "black",
                                                                    ...buttonColorStyle,
                                                                }}
                                                            >
                                                                {tube}
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    )
                                )}
                            </Col>

                            <Rate
                                character={<AliyunOutlined />}
                                onChange={(newValue) =>
                                    handleRateChange(
                                        newValue,
                                        calculateIndex(
                                            groupIndex,
                                            subGroupIndex
                                        )
                                    )
                                }
                                value={
                                    value[
                                        calculateIndex(
                                            groupIndex,
                                            subGroupIndex
                                        )
                                    ]
                                }
                                allowHalf
                            />
                            {value[
                                calculateIndex(groupIndex, subGroupIndex)
                            ] ? (
                                <span>
                                    {
                                        getModeAndValue(
                                            calculateIndex(
                                                groupIndex,
                                                subGroupIndex
                                            )
                                        )[0]
                                    }
                                    模块 -
                                    {desc[
                                        Math.floor(
                                            value[
                                                calculateIndex(
                                                    groupIndex,
                                                    subGroupIndex
                                                )
                                            ] * 2
                                        ) - 1
                                    ] *
                                        getModeAndValue(
                                            calculateIndex(
                                                groupIndex,
                                                subGroupIndex
                                            )
                                        )[1]}
                                    ml
                                </span>
                            ) : (
                                <span>
                                    {
                                        getModeAndValue(
                                            calculateIndex(
                                                groupIndex,
                                                subGroupIndex
                                            )
                                        )[0]
                                    }
                                    模块
                                </span>
                            )}
                        </div>
                    ))}
                </Row>
            ))}
        </div>
    );
};

export default App;
