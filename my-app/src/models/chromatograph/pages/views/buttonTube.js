import React, { useState, useEffect } from "react";
import { Button, Flex, Row, Col, Card, Rate } from "antd";
import "./buttonTube.css";
import color from "@components/color/index";
import { getAllTubes } from "../../api/status";
import { convertLegacyProps } from "antd/es/button";
import { HeartOutlined, AliyunOutlined } from "@ant-design/icons";
import { UpdateModuleListAPI } from "../../api/eluent_curve";
import { linkHorizontal } from "d3";
import useIndexedDB from "../../hooks/useIndexedDB";

let select_tube = [];
let groupsOrigin = [
    // [
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 1 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 2 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 3 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 4 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 5 },
    // ],
    // [
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 1 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 2 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 3 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 4 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 5 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 6 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 7 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 8 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 9 },
    //     { time_start: "00:00:00", time_end: "00:00:00", tube_index: 10 },
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
let select_tube_flag = [];

// 新的数据格式：将mode和tubeValues合并为一个数组的元组
let modeAndValues = [
    // [1, 50],
    // [2, 80],
    // [3, 30],
    // [4, 80],
];
let moduleList = [];
let flag = 0;

const App = ({
    num,
    callback,
    selected,
    clean_flag,
    selectedAllTubes,
    reverseFlag,
}) => {
    const _ = require("lodash");

    const [selectedFlag, setSelectedFlags] = useState([]);
    const [cleanFlag, setCleanFlag] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [groupsOfTen, setGroupsOfTen] = useState(_.cloneDeep(groupsOrigin));
    const [value, setValue] = useState([]);
    const storedMethodId = Number(localStorage.getItem("methodId")); // 转换为数字
    const { data, loading, error } = useIndexedDB(storedMethodId); // 使用 Hook

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
        console.log("1024   flag", flag);
        getAllTubes().then((res) => {
            if (!res.error) {
                console.log("1024  res", res);

                groupsOrigin = res.data.groups_origin;
                console.log("1024  groupsOrigin", groupsOrigin);

                modeAndValues = res.data.mode_volume;
                console.log("1030  getAllTubes  modeAndValues", modeAndValues);
            }
        });
        flag += 1;
    }

    function findColorByModuleAndTube(module_index, tube_index) {
        const matchingObject = selectedAllTubes.find(
            (item) =>
                item.module_index === module_index &&
                item.tube_index_list.includes(tube_index)
        );
        // 如果找到匹配对象，返回 color，否则返回 null
        return matchingObject ? matchingObject.color : null;
    }

    useEffect(() => {
        console.log("1018  num", num);
        console.log("1018  selectedAllTubes", selectedAllTubes);

        setCleanFlag(clean_flag);
        if (num.length == 0) {
            setGroupsOfTen(_.cloneDeep(groupsOrigin));
        }
        if (selected) {
            setSelectedFlags(selected);
            callback(selected);
        } else {
            setSelectedFlags([]);
        }

        return () => {
            console.log("组件即将卸载，清除副作用...");
        };
    }, [num, selected, clean_flag, selectedAllTubes, groupsOrigin]);

    useEffect(() => {
        if (reverseFlag === 1) {
            console.log("1021  select_tube_flag", select_tube_flag);
            console.log("1021  groupsOrigin", groupsOrigin);
            setSelectedFlags((prevFlags) => {
                let filteredData = groupsOrigin.map(
                    (moduleData, moduleIndex) => {
                        return moduleData.filter((tubeData, tubeIndex) => {
                            // 检查是否需要排除
                            return !select_tube_flag.some(
                                (exclude) =>
                                    exclude.module_index === moduleIndex &&
                                    exclude.tube_index === tubeData.tube - 1
                            );
                        });
                    }
                );
                let result = [];
                filteredData.forEach((moduleData, moduleIndex) => {
                    moduleData.forEach((tubeData) => {
                        result.push({
                            module_index: moduleIndex,
                            tube_index: tubeData.tube - 1,
                        });
                    });
                });
                console.log("1021  filteredData", filteredData);
                console.log("1021  result", result);
                callback(result);
                return result;
            });
        }
    }, [reverseFlag]);

    useEffect(() => {
        console.log("1030  data", data);
        let _retain_ = [];
        if (data) {
            console.log(
                "1030  typeof data.retainList :",
                typeof data.retainList
            );

            if (typeof data.retainList === "string") {
                _retain_ = JSON.parse(data.retainList);
            } else {
                _retain_ = data.retainList;
            }
            console.log("1030   _retain_", _retain_);
            calculateRetainValues(setValue, _retain_);
        }
    }, [data, modeAndValues]);
    const calculateRetainValues = (set, ListDy) => {
        let _value_ = [];
        console.log("1030  ListDy", ListDy);
        console.log("1030  modeAndValues", modeAndValues);
        if (modeAndValues.length > 0) {
            ListDy?.forEach((c) => {
                let mode = modeAndValues.filter(
                    (item) => item[0] === c["module_id"]
                );
                console.log("1030  mode", mode);

                if (mode.length > 0) {
                    _value_[mode[0][0] - 1] =
                        c["liquid_volume"] / (mode[0][1] / 5);
                }
            });
            console.log("1030   value", _value_);
        }

        set(_value_);
    };

    const handleButtonClick = (tube_i, module, groupIndex, subGroupIndex) => {
        console.log("1021  Receive tube", module, tube_i);
        setSelectedFlags((prevFlags) => {
            const isSelected = prevFlags.some(
                (f) => f.module_index === module && f.tube_index === tube_i
            );
            // console.log("1021  Receive isSelected", isSelected);

            let select_tube = [];

            if (isSelected) {
                // 如果已经选择过，删除该试管
                select_tube = prevFlags.filter(
                    (f) =>
                        !(f.module_index === module && f.tube_index === tube_i)
                );
                callback(select_tube);
                return select_tube;
            } else {
                // 检查是否存在该模块的试管
                const existingModuleTubes = prevFlags.filter(
                    (f) => f.module_index === module
                );

                if (existingModuleTubes.length > 0) {
                    // 如果存在同一模块的试管，选中上一个和当前试管之间的所有试管
                    const lastSelectedTube =
                        existingModuleTubes[existingModuleTubes.length - 1];
                    const startTube = lastSelectedTube.tube_index;

                    const newFlags = Array.from(
                        {
                            length: Math.abs(tube_i - startTube) + 1,
                        },
                        (_, i) => ({
                            module_index: module,
                            tube_index: Math.min(tube_i, startTube) + i,
                        })
                    ).filter((t) => {
                        // 根据体积筛选出体积大于 0 的试管
                        const currentNum =
                            desc[
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
                                calculateIndex(groupIndex, subGroupIndex)
                            )[1];

                        return (
                            currentNum > 0 &&
                            !prevFlags.some(
                                (f) =>
                                    f.module_index === t.module_index &&
                                    f.tube_index === t.tube_index
                            )
                        );
                    });

                    select_tube = [...prevFlags, ...newFlags];
                } else {
                    // 如果该模块没有已选中的试管，检查当前试管的体积是否大于 0
                    const currentNum =
                        desc[
                            Math.floor(
                                value[
                                    calculateIndex(groupIndex, subGroupIndex)
                                ] * 2
                            ) - 1
                        ] *
                        getModeAndValue(
                            calculateIndex(groupIndex, subGroupIndex)
                        )[1];

                    if (currentNum > 0) {
                        // 如果体积大于 0，则将当前试管加入到选中列表
                        if (
                            !prevFlags.some(
                                (f) =>
                                    f.module_index === module &&
                                    f.tube_index === tube_i
                            )
                        ) {
                            select_tube = [
                                ...prevFlags,
                                { module_index: module, tube_index: tube_i },
                            ];
                        }
                    } else {
                        // 如果体积小于等于 0，保持不变
                        select_tube = [...prevFlags];
                    }
                }
                select_tube_flag = select_tube;
                callback(select_tube);
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
                                                let module =
                                                    groupIndex * 2 +
                                                    subGroupIndex;
                                                let tube_i =
                                                    rowIndex * 5 + index;
                                                const tube = item.tube;

                                                const isSelected =
                                                    selectedFlag.some(
                                                        (flag) =>
                                                            flag.module_index ===
                                                                module &&
                                                            flag.tube_index ===
                                                                tube_i
                                                    );

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
                                                            tube_index ===
                                                            tube_i
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
                                                let colorTube =
                                                    findColorByModuleAndTube(
                                                        module,
                                                        tube_i
                                                    );
                                                if (colorTube) {
                                                    buttonDisabled = true;
                                                    let colorName = `color${colorTube}`;
                                                    buttonColorStyle =
                                                        color[colorName];
                                                }

                                                return (
                                                    <Col key={index}>
                                                        <div
                                                            onClick={() =>
                                                                handleButtonClick(
                                                                    tube_i,
                                                                    module,
                                                                    groupIndex,
                                                                    subGroupIndex
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
