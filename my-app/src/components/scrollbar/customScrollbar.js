import React from "react";
import { Slider } from "antd";
import "./customScrollbar.css";
const CustomScrollbar = ({
    scrollPosition,
    maxScrollPosition,
    onScrollChange,
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "left",
                marginTop: "5rem",
                width: "100%", // 调整宽度以适应布局
            }}
        >
            <Slider
                min={0}
                max={maxScrollPosition}
                value={scrollPosition}
                onChange={onScrollChange}
                // tooltip={{ formatter: (value) => `Scroll: ${value}` }} // 显示滑块的提示
                style={{ width: "100%" }} // 滑块的宽度可以根据需求调整
            />
        </div>
    );
};

export default CustomScrollbar;
