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
        setFlowRateDefault(props.flowRateDefault);
        if (lastData.length !== 0) {
            form.setFieldsValue({ users: lastData });
        } else {
            setLastData(props.pressure);
            form.setFieldsValue({ users: props.pressure });
        }
        if (props.pressure.length === 0) {
            form.setFieldsValue({ users: [] });
        }
    }, [props.pressure, form]);

    const handleValuesChange = (changedValues, allValues) => {
        if (changedValues.users) {
            const index = changedValues.users.findIndex((item) => item);
            if (index !== -1) {
                console.log("1104    index :", index);
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
        }
        setLastData(allValues.users);
    };

    const submit = () => {
        const hasZeroTimePoint = lastData.some((point) => point.time === 0);
        console.log("1104   hasZeroTimePoint",hasZeroTimePoint);
        
        if (!hasZeroTimePoint && lastData.length > 0) {
            // 如果没有 time=0 的点，且数据不为空，则添加一个
            const zeroTimePoint = {
                time: 0,
                pumpB: 0,
                pumpA: 100,
                flowRate: flowRateDefault,
            };

            // 更新表单数据，将新点添加到开头
            const newData = [zeroTimePoint, ...lastData];
            form.setFieldsValue({
                users: newData,
            });
            setLastData(newData);
        }

        form.submit();
    };

    return (
        <div
            style={{
                maxHeight: "15rem",
                width: "100%",
                overflowY: "auto",
                padding: "0px",
                paddingTop: "0px",
                paddingRight: "0px",
                marginLeft: "1rem",
            }}
        >
            <Form
                form={form}
                name="dynamic_form_nest_item"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                style={{ maxWidth: 700 }}
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
                                        <Input
                                            placeholder="时间"
                                            type="number"
                                            step="any"
                                        />
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
                                        <Input placeholder="泵A速度" disabled />
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
                                        <Input
                                            placeholder="泵B速度"
                                            type="number"
                                            step="any"
                                        />
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
                                        <Input
                                            placeholder={flowRateDefault}
                                            type="number"
                                            step="any"
                                        />
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
