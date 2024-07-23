import React, { useState } from "react";
import { Form, Input, Button, Switch, Row, Col } from "antd";

// 翻译映射
const labelTranslations = {
    spray_output: "喷雾输出",
    spray_ready_time: "喷雾准备时间",
    spray_start_time: "喷雾开始时间",
    spray_stop_time: "喷雾停止时间",
    spray_switch: "喷雾开关",
    peristaltic_Error: "蠕动泵错误",
    peristaltic_acceleration: "蠕动泵加速度",
    peristaltic_deceleration: "蠕动泵减速度",
    peristaltic_enable: "蠕动泵使能",
    peristaltic_errorid: "蠕动泵错误ID",
    peristaltic_running: "蠕动泵运行",
    peristaltic_velocity: "蠕动泵速度",
};

const CustomForm = ({ type, data, flag, callback }) => {
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
            const label = labelTranslations[key] || key;
            const value = data[key];
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={flag === 1}
                        >
                            上传
                        </Button>
                    </Col>
                </Row>
            </Form.Item>
        </Form>
    );
};

// 示例数据和 flag
// const data = {
//     spray_output: 0,
//     spray_ready_time: 1000,
//     spray_start_time: 2000,
//     spray_stop_time: 1000,
//     spray_switch: 0,
// };
// const flag = 0; // 可以修改，设为1时禁用

const App = (props, callback) => {
    console.log("props :", props);
    const [data, setData] = useState(props.data);
    const [flag, setFlag] = useState(props.runningFlag);
    const [type, setType] = useState(props.type);
    return (
        <div>
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
