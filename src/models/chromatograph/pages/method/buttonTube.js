import React, { useState, useEffect } from "react";
import { Button, Flex, Row, Col, Card, Rate, Empty } from "antd";
import "./buttonTube.css";
import color from "@components/color/index";
import { getAllTubes } from "../../api/status";
import { convertLegacyProps } from "antd/es/button";
import { HeartOutlined, AliyunOutlined } from "@ant-design/icons";
import {
    UpdateModuleListAPI,
    UpdateCleanListAPI,
} from "../../api/eluent_curve";
import { linkHorizontal } from "d3";

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

const App = ({ cleanListDy, retainListDy, callback }) => {
    const _ = require("lodash");

    const [groupsOfTen, setGroupsOfTen] = useState(_.cloneDeep(groupsOrigin));
    const [value, setValue] = useState([]);
    const [valueClean, setValueClean] = useState([]);
    const [modeAndValues, setModeAndValues] = useState([]);
    const [cleanList, setCleanList] = useState([]);
    const [retainList, setRetainList] = useState([]);

    const handleRetainChange = (newValue, index, subGroup) => {
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
                    { length: groupsOfTen[index].length },
                    (_, i) => i + 1
                );
                return {
                    module_id: modeAndValues[index][0],
                    liquid_volume: liquidVolume,
                    tube_id: tubeId,
                };
            })
            .filter((item) => item.liquid_volume > 0);
        setRetainList((pre) => moduleList);
        UpdateModuleListAPI({ module_list: moduleList }).then(() => {});

        callback(cleanList, moduleList);
    };

    const handleCleanChange = (newValue, index, subGroup) => {
        const updatedValue = [...valueClean];
        updatedValue[index] = newValue;

        setValueClean(updatedValue);

        const dividedArray = updatedValue.map((u) => u / 5);
        moduleList = dividedArray
            .map((valueClean, index) => {
                // 计算 liquid_volume，使用乘法
                const liquidVolume =
                    valueClean !== null
                        ? valueClean * modeAndValues[index][1]
                        : 0; // 处理空值

                // 根据 subGroup 长度生成 tube_id
                const tubeId = Array.from(
                    { length: groupsOfTen[index].length },
                    (_, i) => i + 1
                );
                return {
                    module_id: modeAndValues[index][0],
                    liquid_volume: liquidVolume,
                    tube_id: tubeId,
                };
            })
            .filter((item) => item.liquid_volume > 0);
        setCleanList((pre) => moduleList);

        UpdateCleanListAPI({ module_list: moduleList }).then(() => {});

        callback(moduleList, retainList);
    };
    useEffect(() => {
        calculateRetainValues(setValue, retainListDy);
        calculateRetainValues(setValueClean, cleanListDy);
        setRetainList(retainListDy);
        setCleanList(cleanListDy);
    }, [cleanListDy, retainListDy]);

    useEffect(() => {
        getAllTubes().then((res) => {
            if (!res.error) {
                console.log("1024  res", res);

                const groupsOrigin = res.data.groups_origin;
                setGroupsOfTen(_.cloneDeep(groupsOrigin));

                console.log("1024  groupsOrigin", groupsOrigin);
                setModeAndValues(res.data.mode_volume);
                // modeAndValues = res.data.mode_volume;
            }
        });
    }, [groupsOrigin]);
    const calculateRetainValues = (set, ListDy) => {
        let _value_ = [];

        ListDy.forEach((c) => {
            let mode = modeAndValues.filter(
                (item) => item[0] === c["module_id"]
            );
            if (mode.length > 0) {
                _value_[mode[0][0] - 1] = c["liquid_volume"] / (mode[0][1] / 5);
            } else {
                _value_[mode[0][0] - 1] = undefined;
            }
        });

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
    console.log("1024   groupsOfTen  combinedGroups", groupsOfTen);
    console.log("1024   combinedGroups combinedGroups", combinedGroups);

    // 根据索引获取对应的mode和tubeValue
    const getModeAndValue = (index) => {
        console.log("1024  index", index);
        console.log("1024  modeAndValues", modeAndValues);

        // 确保index不超过modeAndValues数组长度
        const safeIndex = index % modeAndValues.length;
        return modeAndValues[safeIndex];
    };

    return (
        <div className="button-div">
            {combinedGroups.length > 0 ? (
                <div>
                    {combinedGroups?.map((group, groupIndex) => (
                        <Row
                            key={groupIndex}
                            gutter={0}
                            style={{ width: "100%" }}
                        >
                            {group?.map((subGroup, subGroupIndex) => (
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
                                                            rowIndex * 5 +
                                                            index;
                                                        const tube = item.tube;

                                                        let buttonDisabled = true;

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
                                    <Row style={{ width: " 98%" }}>
                                        <Col span={6}>{"清洗："}</Col>
                                        <Col span={13}>
                                            <Rate
                                                character={<AliyunOutlined />}
                                                onChange={(newValue) =>
                                                    handleCleanChange(
                                                        newValue,
                                                        calculateIndex(
                                                            groupIndex,
                                                            subGroupIndex
                                                        ),
                                                        subGroup
                                                    )
                                                }
                                                value={
                                                    valueClean[
                                                        calculateIndex(
                                                            groupIndex,
                                                            subGroupIndex
                                                        )
                                                    ]
                                                }
                                                allowHalf
                                            />
                                        </Col>
                                        <Col span={2}>
                                            {isNaN(
                                                desc[
                                                    Math.floor(
                                                        valueClean[
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
                                                    )[1]
                                            )
                                                ? 0
                                                : desc[
                                                      Math.floor(
                                                          valueClean[
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
                                            {"ml"}
                                        </Col>
                                    </Row>
                                    <Row style={{ width: " 98%" }}>
                                        <Col span={6}>{"收集："}</Col>
                                        <Col span={13}>
                                            <Rate
                                                character={<AliyunOutlined />}
                                                onChange={(newValue) =>
                                                    handleRetainChange(
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
                                        </Col>
                                        <Col span={2}>
                                            {isNaN(
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
                                                        calculateIndex(
                                                            groupIndex,
                                                            subGroupIndex
                                                        )
                                                    )[1]
                                            )
                                                ? 0
                                                : desc[
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
                                            {"ml"}
                                        </Col>
                                    </Row>

                                    <span>
                                        {
                                            getModeAndValue(
                                                calculateIndex(
                                                    groupIndex,
                                                    subGroupIndex
                                                )
                                            )[0]
                                        }
                                        {"  模块"}
                                        {/* {desc[
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
                                                )[1]} */}
                                        {/* ml */}
                                    </span>
                                </div>
                            ))}
                        </Row>
                    ))}
                </div>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{ height: 100 }}
                    description={<span>暂无试管</span>}
                />
            )}
        </div>
    );
};

export default App;
