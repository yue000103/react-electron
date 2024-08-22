import React, { useState, useEffect } from "react";
import {
    MinusCircleOutlined,
    PlusOutlined,
    ArrowUpOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Space, Row, Col } from "antd";

const App = (props) => {
    const [form] = Form.useForm();
    const onFinish = (values) => {
        props.onValuesChange(values);
    };
    useEffect(() => {
        console.log("props.pressure :", props);

        form.setFieldsValue({ users: props.pressure });
    }, [props.pressure, form]);

    const handleValuesChange = (changedValues, allValues) => {
        if (changedValues.users) {
            const index = changedValues.users.findIndex((item) => item);
            const field = changedValues.users[index];
            if (field && field.pumpB !== undefined) {
                const pumpBValue = parseFloat(field.pumpB);
                if (!isNaN(pumpBValue)) {
                    const pumpAValue = 100 - pumpBValue;

                    form.setFieldsValue({
                        users: allValues.users.map((item, i) =>
                            i === index
                                ? {
                                      time: Number(item.time),
                                      pumpB: Number(item.pumpB),
                                      pumpA: pumpAValue,
                                  }
                                : item
                        ),
                    });
                }
            }
        }
    };

    const submit = () => {
        form.submit();
    };

    return (
        <div
            style={{
                maxHeight: "20rem",
                overflowY: "auto",
                padding: "16px",
                paddingRight: "0px",
            }}
        >
            <Form
                form={form}
                name="dynamic_form_nest_item"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                style={{ maxWidth: 600 }}
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
                                        <Input placeholder="泵A流速" disabled />
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
                                        <Input placeholder="泵B流速" />
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
