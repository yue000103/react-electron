import React, { useState, useEffect } from "react";
import { Button, Flex } from "antd";
import "./index.css";

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
                select_tube = [...prevFlags, tube];
                callback(select_tube, num);
                return select_tube;
            }
        });
    };

    return (
        <Flex wrap gap="small">
            {num.map((item, index) => {
                const tube = item.tube;
                const isSelected = selectedFlag.includes(tube);
                let buttonStyle = {};

                let buttonDisabled = false;
                if (item?.flag === true) {
                    buttonDisabled = true; // 当状态为 1 时禁用按钮
                    buttonStyle = {
                        backgroundColor: "#d5d5f5",
                        color: "white",
                    };
                } else if (item?.flag === false) {
                    buttonStyle = {
                        backgroundColor: "red",
                        color: "white",
                    };
                    buttonDisabled = true;
                }

                return (
                    <Button
                        key={index}
                        shape="circle"
                        className="button"
                        disabled={buttonDisabled}
                        style={{
                            backgroundColor: isSelected ? "#d5d5f5" : "",
                            color: isSelected ? "white" : "black",
                            ...buttonStyle,
                        }}
                        onClick={() => handleButtonClick(tube)}
                    >
                        {tube}
                    </Button>
                );
            })}
        </Flex>
    );
};

export default App;
