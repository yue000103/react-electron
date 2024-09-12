import React from "react";
import { Card } from "antd";
import "./dynamicCard.css";
const DynamicCard = ({ children, position, title, height }) => {
    console.log("0912   position", position);

    return (
        <Card className="dynamicCard" style={{ height: height }}>
            {position === "top" ? (
                <div className="top">
                    <div className="top-title">
                        <Card.Grid className="grid-style">
                            <div className="top-title-text">{title}</div>
                        </Card.Grid>
                    </div>
                    <div className="top-content">{children}</div>{" "}
                </div>
            ) : (
                <div></div>
            )}
        </Card>
    );
};
export default DynamicCard;
