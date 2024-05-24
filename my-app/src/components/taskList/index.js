import React, { useCallback } from "react";
import { Col, Row, Button } from "antd";
import "./index.css";
const App = (props) => {
    const { selected_tubes, callback } = props;
    const undo = (index) => {
        callback(index);
    };
    //[{status: "retain",tube_list:[184, 45];},{status: "discard",tube_list:  [260, 117]}]
    return (
        <div>
            {selected_tubes.map((tubeObj, index) => (
                <Row>
                    <Col key={index} span={18} style={{ marginBottom: "10px" }}>
                        <Row>
                            <p className="statusClass">
                                {tubeObj.status === "retain"
                                    ? "保留："
                                    : "废弃："}
                            </p>
                            {tubeObj.tube_list.map((tube, idx) => (
                                <p key={idx} class="listClas">
                                    {tube}
                                    {idx < tubeObj.tube_list.length - 1 && ","}
                                </p>
                            ))}
                        </Row>
                    </Col>
                    <Col span={4}>
                        <div className="button">
                            <Button
                                type="text"
                                onClick={() => undo(index, callback)}
                            >
                                撤销
                            </Button>
                        </div>
                    </Col>
                </Row>
            ))}
        </div>
    );
};

export default App;
