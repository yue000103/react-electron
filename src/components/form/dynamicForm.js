import React, { useState, useEffect } from "react";
import {
    MinusCircleOutlined,
    PlusOutlined,
    ArrowUpOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Space, Row, Col } from "antd";

const App = (props) => {
    const [form] = Form.useForm();
    const [flowRateDefault, setFlowRateDefault] = useState(0);
    const [lastData, setLastData] = useState([]);

    const onFinish = (values) => {
        props.onValuesChange(values);
    };
    useEffect(() => {
        console.log("9999---------props", props);

        setFlowRateDefault(props.flowRateDefault);
        if (lastData.length !== 0) {
            form.setFieldsValue({ users: lastData });
        } else {
            setLastData(props.pressure);
            form.setFieldsValue({ users: props.pressure });
        }
    }, [props.pressure, form]);

    const handleValuesChange = (changedValues, allValues) => {
        if (changedValues.users) {
            const index = changedValues.users.findIndex((item) => item);
            const field = changedValues.users[index];
            const key = Object.keys(field)[0];
            if (field) {
                allValues.users[index][key] = Number(
                    allValues.users[index][key]
                );
            }
            if (field && field.pumpB !== undefined) {
                const pumpBValue = parseFloat(field.pumpB);
                const pumpAValue = 100 - pumpBValue;
                allValues.users[index].pumpA = pumpAValue;
            }
        }
        setLastData(allValues.users);
    };

    const submit = () => {
        form.submit();
    };

    return (
        <div
            style={{
                maxHeight: "18rem",
                overflowY: "auto",
                padding: "16px",
                paddingTop: "0px",
                paddingRight: "0px",
            }}
        >
            <Form
                form={form}
                name="dynamic_form_nest_item"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                style={{ maxWidth: 500 }}
                autoComplete="off"
            >
                <Form.List name="users">
                    {(fields, { add, remove }) => (
                        <>
                            <div
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#fff",
                                    zIndex: 1,
                                    paddingBottom: "10px",
                                }}
                            >
                                <Row gutter={0}>
                                    <Col span={1}></Col>
                                    <Col span={10}>
                                        {" "}
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            添加
                                        </Button>
                                    </Col>
                                    <Col span={2}></Col>
                                    <Col span={10}>
                                        {" "}
                                        <Button
                                            type="dashed"
                                            onClick={submit}
                                            block
                                            icon={<ArrowUpOutlined />}
                                        >
                                            提交
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space
                                    key={key}
                                    style={{
                                        display: "flex",
                                        marginBottom: -10,
                                    }}
                                    align="baseline"
                                >
                                    <Form.Item
                                        {...restField}
                                        name={[name, "time"]}
                                        rules={[
                                            {
                                                required: false,
                                                message: "Missing time",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="时间" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "pumpA"]}
                                        rules={[
                                            {
                                                required: false,
                                                message:
                                                    "Missing pumpA flow rate",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="泵A比例" disabled />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "pumpB"]}
                                        rules={[
                                            {
                                                required: false,
                                                message:
                                                    "Missing pumpB flow rate",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="泵B比例" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "flowRate"]}
                                        rules={[
                                            {
                                                required: false,
                                                message:
                                                    "Missing pumpB flow rate",
                                            },
                                        ]}
                                    >
                                        <Input placeholder={flowRateDefault} />
                                    </Form.Item>
                                    <MinusCircleOutlined
                                        onClick={() => remove(name)}
                                    />
                                </Space>
                            ))}
                        </>
                    )}
                </Form.List>
            </Form>
        </div>
    );
};

export default App;
