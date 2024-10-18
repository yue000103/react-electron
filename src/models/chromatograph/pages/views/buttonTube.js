import React, { useState, useEffect } from "react";
import { Button, Flex, Row, Col, Card, Rate } from "antd";
import "./buttonTube.css";
import color from "@components/color/index";
import { getAllTubes } from "../../api/status";
import { convertLegacyProps } from "antd/es/button";
import { HeartOutlined, AliyunOutlined } from "@ant-design/icons";
import { UpdateModuleListAPI } from "../../api/eluent_curve";
import { linkHorizontal } from "d3";

let select_tube = [];
let groupsOrigin = [
    // [
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 1 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 2 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 3 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 4 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 5 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 6 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 7 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 8 },
    // ],
    // [
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 1 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 2 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 3 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 4 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 5 },
    // ],
    // [
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 1 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 2 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 3 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 4 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 5 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 6 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 7 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 8 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 9 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube: 10 },
    // ],
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
let modeAndValues = [
    // [1, 50],
    // [2, 80],
    // [3, 30],
    // [4, 80],
];
let moduleList = [];
let flag = 0;

const App = ({ num, callback, selected, clean_flag }) => {
    const _ = require("lodash");

    const [selectedFlag, setSelectedFlags] = useState([]);
    const [cleanFlag, setCleanFlag] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [groupsOfTen, setGroupsOfTen] = useState(_.cloneDeep(groupsOrigin));
    const [value, setValue] = useState([]);

    const handleRateChange = (newValue, index, subGroup) => {
        const updatedValue = [...value];
        updatedValue[index] = newValue;
        setValue(updatedValue);

        const dividedArray = updatedValue.map((u) => u / 5);
        moduleList = dividedArray
            .map((value, index) => {
                // 计算 liquid_volume，使用乘法
                const liquidVolume =
                    value !== null ? value * modeAndValues[index][1] : 0; // 处理空值

                // 根据 subGroup 长度生成 tube_id
                const tubeId = Array.from(
                    { length: groupsOrigin[index].length },
                    (_, i) => i + 1
                );
                return {
                    module_id: modeAndValues[index][0],
                    liquid_volume: liquidVolume,
                    tube_id: tubeId,
                };
            })
            .filter((item) => item.liquid_volume > 0);
        UpdateModuleListAPI({ module_list: moduleList }).then(() => {});
        console.log("1018  updatedValue", updatedValue, dividedArray, subGroup);
        console.log("1018  moduleList", moduleList);
    };
    if (flag == 0) {
        getAllTubes().then((res) => {
            if (!res.error) {
                console.log("1018   res", res);
                groupsOrigin = res.data.groups_origin;
                modeAndValues = res.data.mode_volume;
            }
        });
        flag += 1;
    }

    useEffect(() => {
        console.log("1018  num", num);

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
        console.log(
            "groupIndex,arrayIndex,groupWithinArray, itemIndex",
            groupIndex,
            arrayIndex,
            groupWithinArray,
            itemIndex
        );

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

                                                // num.map((n) => {
                                                //     groupsOfTen[n.module_index][
                                                //         n.tube_index
                                                //     ].time_start = n.time_start;
                                                //     groupsOfTen[n.module_index][
                                                //         n.tube_index
                                                //     ].time_end = n.time_end;
                                                // });
                                                let isNum = false;

                                                num.forEach((n) => {
                                                    const {
                                                        module_index,
                                                        tube_index,
                                                        time_start,
                                                        time_end,
                                                    } = n;
                                                    let module =
                                                        groupIndex * 2 +
                                                        subGroupIndex;
                                                    let tube =
                                                        rowIndex * 5 + index;
                                                    // 确保 module_index 和 tube_index 在 groupsOfTen 中有效
                                                    if (
                                                        module_index === module
                                                    ) {
                                                        groupsOfTen[
                                                            module_index
                                                        ][
                                                            tube_index
                                                        ].time_start =
                                                            time_start;
                                                        groupsOfTen[
                                                            module_index
                                                        ][tube_index].time_end =
                                                            time_end;
                                                        if (
                                                            tube_index === tube
                                                        ) {
                                                            isNum = true;
                                                        }
                                                    }
                                                });

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
                                        ),
                                        subGroup
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
