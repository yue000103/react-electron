import React, { useState, useEffect } from "react";
import { Button, Flex, Row, Col, Card } from "antd";
import "./index.css";
import color from "@components/color/index"; // 引入样式对象
import { convertLegacyProps } from "antd/es/button";

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
        { time_start: "00:00:00", time_end: "00:00:00", tube: 9 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 10 },
    ],
    [
        { time_start: "00:00:00", time_end: "00:00:00", tube: 11 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 12 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 13 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 14 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 15 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 16 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 17 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 18 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 19 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 20 },
    ],
    [
        { time_start: "00:00:00", time_end: "00:00:00", tube: 21 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 22 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 23 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 24 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 25 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 26 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 27 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 28 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 29 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 30 },
    ],
    [
        { time_start: "00:00:00", time_end: "00:00:00", tube: 31 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 32 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 33 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 34 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 35 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 36 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 37 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 38 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 39 },
        { time_start: "00:00:00", time_end: "00:00:00", tube: 40 },
    ],
];
const App = ({ num, callback, selected, clean_flag }) => {
    const _ = require("lodash");

    const [selectedFlag, setSelectedFlags] = useState([]);
    const [cleanFlag, setCleanFlag] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [groupsOfTen, setGroupsOfTen] = useState(_.cloneDeep(groupsOrigin));

    useEffect(() => {
        // console.log("0831  groupsOrigin", groupsOrigin);
        setCleanFlag(clean_flag);
        // console.log("0831   num", num);
        // console.log("0831  cleanFlag:", cleanFlag);
        console.log("0831  ----------------------------selected", selected);
        console.log("0831  ----------------------------clean_flag", clean_flag);

        if (num.length == 0) {
            console.log("0831  -------  groupsOfTen :", groupsOfTen);
            console.log("0831  groupsOrigin :", groupsOrigin);

            // console.log("0831  ----------------------------",selected);

            // const groups_flag = generateGroups(4, 10); // 生成4组，每组10个管子的数组

            setGroupsOfTen(_.cloneDeep(groupsOrigin));
            console.log("0831  groupsOfTen :", groupsOfTen);
        }
        if (selected) {
            console.log("---------------------------------------", selected);
            setSelectedFlags(selected);
            console.log("---------------------------------------", select_tube);

            callback(selected, num);
        } else {
            setSelectedFlags([]);
        }
        return () => {
            // select_tube = [];
            console.log("组件即将卸载，清除副作用...");
        };
    }, [num, selected, clean_flag]);
    // useEffect(() => {
    //     console.log("groupsOfTen updated:", groupsOfTen);
    // }, [groupsOfTen]);
    // 处理按钮点击事件
    const generateGroups = (groupCount, tubesPerGroup) => {
        console.log("0831  tubesPerGroup :", tubesPerGroup);
        console.log("0831  groupCount :", groupCount);

        const groups = [];
        let tubeNumber = 1;

        for (let i = 0; i < groupCount; i++) {
            const group = [];
            for (let j = 0; j < tubesPerGroup; j++) {
                group.push({
                    time_start: "00:00:00",
                    time_end: "00:00:00",
                    tube: tubeNumber++,
                });
            }
            groups.push(group);
        }
        console.log("0831  groups :", groups);

        return groups;
    };
    const a = () => {};
    const handleButtonClick = (tube) => {
        setSelectedFlags((prevFlags) => {
            const isSelected = prevFlags.includes(tube);
            // console.log("select_tube ---isSelected :", isSelected);

            if (isSelected) {
                select_tube = prevFlags.filter((f) => f !== tube);
                // console.log("select_tube---1 :", select_tube);

                callback(select_tube, num);
                return select_tube;
            } else {
                // console.log("prevFlags", prevFlags);
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
                // console.log("select_tube ---newFlags :", newFlags);
                // console.log("select_tube---2 :", select_tube);

                callback(select_tube, num);
                console.log("select_tube---3 :", select_tube);

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

    // let last_num = { time_start: "", time_end: "", tube: num.length + 1 };
    // num = num.push(last_num);
    // const groupsOfTen = chunkArray(num, 10);

    // console.log("groupsOfTen ---------------------", groupsOfTen);

    const combineGroups = (array, groupSize) => {
        const results = [];
        for (let i = 0; i < array.length; i += groupSize) {
            results.push(array.slice(i, groupSize + i));
        }
        return results;
    };
    const combinedGroups = combineGroups(groupsOfTen, 2);
    return (
        <div>
            {combinedGroups.map((group, groupIndex) => (
                <Row key={groupIndex} gutter={0}>
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
                                                let groupsFlag = groupsOfTen;
                                                num.map((n) => {
                                                    let one = Math.floor(
                                                        (n["tube"] - 1) / 10
                                                    ); // 计算所在的组
                                                    let two =
                                                        (n["tube"] - 1) % 10; // 计算组内的位置
                                                    if (
                                                        one >= 0 &&
                                                        one <
                                                            groupsOfTen.length &&
                                                        two >= 0 &&
                                                        two <
                                                            groupsOfTen[one]
                                                                .length
                                                    ) {
                                                        groupsOfTen[one][two] =
                                                            n; // 更新对应位置的对象
                                                    } else {
                                                        console.warn(
                                                            `Invalid index detected: group (${one}), position (${two})`
                                                        );
                                                    }
                                                });
                                                const foundTube = num.find(
                                                    (t) => t.tube === tube
                                                );
                                                let isNum =
                                                    foundTube !== undefined;

                                                let buttonColorStyle = {};
                                                let buttonDisabled = false;

                                                // console.log(
                                                //     "item.color",
                                                //     item.color
                                                // );
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
                        </div>
                    ))}
                </Row>
            ))}
        </div>
    );
};

export default App;
