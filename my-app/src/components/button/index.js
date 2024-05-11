import React, { useState, useEffect } from "react";
import { Button, Flex } from "antd";
import "./index.css";

const App = ({ num, callback }) => {
    const [selectedFlag, setSelectedFlags] = useState([]);
    useEffect(() => {
        // 在此处可以执行数据变化时的逻辑，比如打印日志、发送请求等
        console.log("数据发生变化:", num);
        setSelectedFlags([]);
        // 如果需要在组件卸载时清除副作用，可以返回一个清理函数
        return () => {
            console.log("组件即将卸载，清除副作用...");
            // 执行清理操作，比如取消订阅或清除定时器
        };
    }, [num]);
    // 处理按钮点击事件
    const handleButtonClick = (flag) => {
        // 检查数组中是否已包含该 flag

        const isSelected = selectedFlag.includes(flag);

        if (isSelected) {
            // 如果已选中，从数组中移除该 flag
            const updatedFlags = selectedFlag.filter((f) => f !== flag);
            setSelectedFlags(updatedFlags);
            callback(updatedFlags, num);
        } else {
            // 如果未选中，将 flag 添加到数组中
            const updatedFlags = [...selectedFlag, flag];
            setSelectedFlags(updatedFlags);
            callback(updatedFlags, num);
        }
    };

    return (
        <Flex wrap gap="small">
            {num.map((item, index) => {
                const flag = item.flag;
                const isSelected = selectedFlag.includes(flag);
                let buttonStyle = {};

                let buttonDisabled = false;
                if (item?.status === 1) {
                    buttonDisabled = true; // 当状态为 1 时禁用按钮
                    buttonStyle = {
                        backgroundColor: "#d5d5f5",
                        color: "white",
                    };
                } else if (item?.status === 2) {
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
                        onClick={() => handleButtonClick(flag)}
                    >
                        {flag}
                    </Button>
                );
            })}
        </Flex>
    );
};

export default App;
