import React from "react";
import { Card } from "antd";
import "./dynamicCard.css";
import p7ConBg from "@/assets/image/image.png"; // 使用 import 引入图片

const DynamicCard = ({ children, position, title, height, isScrollable }) => {
    console.log("1016   isScrollable", isScrollable);

    return (
        <Card
            className="dynamicCard"
            style={{
                height: height,
                backgroundImage: `url(${p7ConBg})`,
                backgroundSize: "10rem 10rem",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right bottom",
            }}
            title={title}
        >
            {position === "top" ? (
                <div className="top">
                    {/* <div className="top-title"> */}
                    {/* <Card.Grid className="grid-style"> */}
                    {/* <div className="top-title-text">{title}</div> */}
                    {/* </Card.Grid> */}
                    {/* </div> */}
                    <div className="top-content">{children}</div>{" "}
                </div>
            ) : (
                <div></div>
            )}
        </Card>
    );
};
export default DynamicCard;
