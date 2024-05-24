import React, { useState, useEffect } from "react";
import { Button, Flex } from "antd";
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
                let buttonColorStyle = {};
                let buttonDisabled = false;

                if (item.color) {
                    buttonDisabled = true;
                    let colorName = `color${item.color}`;
                    buttonColorStyle = color[colorName];
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
                            ...buttonColorStyle,
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
