import React, { useState } from "react";
import { Form, Input, Button, Switch, Row, Col } from "antd";

// 翻译映射
const labelTranslations = {
    mode_switch: "是否启动手动模式",
    spray_switch: "清洗开关",
    peristaltic_switch: "排液开关",
    drain_speed: "排液速度",
    spray_speed: "清洗速度",
    spray_time: "清洗次数",
    tube_id: "试管id",
};

const CustomForm = ({ type, data, flag, callback }) => {
    console.log("1015  data----------- :", data);
    const [form] = Form.useForm();

    // 表单提交处理函数
    const onFinish = (values) => {
        // console.log("data 表单提交数据:", values);
        // console.log("data :", data);
        let status = Object.keys(data).reduce((acc, key) => {
            if (values[key] === undefined) {
                acc[key] = data[key];
            } else if (typeof values[key] === "boolean") {
                acc[key] = values[key] ? 1 : 0;
            } else if (typeof values[key] === "string") {
                acc[key] = Number(values[key]);
            } else {
                acc[key] = values[key];
            }
            return acc;
        }, {});
        console.log("data status :", status);

        callback(type, status);
    };

    // 渲染表单项
    const renderFormItems = () => {
        return Object.keys(data).map((key) => {
            console.log("1015   key", key);

            const label = labelTranslations[key] || key;
            const value = data[key];
            console.log("value :", value);
            console.log("data :", data);
            if (value === 0 || value === 1) {
                return (
                    <Form.Item
                        key={key}
                        label={label}
                        name={key}
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="开"
                            unCheckedChildren="关"
                            disabled={true}
                            defaultChecked={value === 1}
                        />
                    </Form.Item>
                );
            } else {
                return (
                    <Form.Item
                        key={key}
                        label={label}
                        name={key}
                        initialValue={value}
                    >
                        <Input disabled={flag === 1} />
                    </Form.Item>
                );
            }
        });
    };

    return (
        <Form form={form} onFinish={onFinish}>
            {renderFormItems()}
            <Form.Item>
                <Row>
                    <Col span={10}></Col>
                    <Col span={4}>
                        {/* <Button
                            type="primary"
                            htmlType="submit"
                            disabled={flag === 1}
                        >
                            上传
                        </Button> */}
                    </Col>
                </Row>
            </Form.Item>
        </Form>
    );
};

// 示例数据和 flag
const data = {
    mode_switch: 0,

    spray_switch: 0,
    peristaltic_switch: 0,
    drain_speed: 1000,
    spray_speed: 2000,
    spray_time: 1000,
    tube_id: 10,
};
const flag = 0; // 可以修改，设为1时禁用

const App = (props, callback) => {
    console.log("props--------- :", props);
    // const [data, setData] = useState(props.data);
    console.log("data -------4--------:", data);
    // const [flag, setFlag] = useState(props.runningFlag);
    const [type, setType] = useState(props.type);
    return (
        <div
            style={{
                marginTop: "2rem",
                marginLeft: "2rem",
                marginRight: "2rem",
            }}
        >
            <CustomForm
                type={type}
                data={data}
                flag={flag}
                callback={props.callback}
            />
        </div>
    );
};

export default App;
