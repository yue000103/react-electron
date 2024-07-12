import React, { useState, useEffect } from "react";
import { Button, Flex, Row, Col, Card } from "antd";
import "./index.css";
import color from "@components/color/index"; // 引入样式对象

let select_tube = [];

const App = ({ num, callback, selected }) => {
    const [selectedFlag, setSelectedFlags] = useState([]);
    useEffect(() => {
        if (selected) {
            setSelectedFlags(selected);
        } else {
            setSelectedFlags([]);
        }
        return () => {
            select_tube = [];
            console.log("组件即将卸载，清除副作用...");
        };
    }, [num, selected]);
    // 处理按钮点击事件
    const handleButtonClick = (tube) => {
        setSelectedFlags((prevFlags) => {
            const isSelected = prevFlags.includes(tube);
            if (isSelected) {
                select_tube = prevFlags.filter((f) => f !== tube);
                callback(select_tube, num);
                return select_tube;
            } else {
                console.log("prevFlags", prevFlags);
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
    console.log("num ---------------------",num)
    // let last_num = {time_start:"",time_end:"",tube:num.length + 1}
    // num = num.push(last_num);
    const groupsOfTen = chunkArray(num, 10);
    console.log("groupsOfTen ---------------------",groupsOfTen)

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
                                                let buttonColorStyle = {};
                                                let buttonDisabled = false;

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
