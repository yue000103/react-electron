import React, { useState, useEffect } from "react";
import {
    MinusCircleOutlined,
    PlusOutlined,
    ArrowUpOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Space, Row, Col } from "antd";

const App = (props) => {
    const [form] = Form.useForm();
    const [flowRateDefault,setFlowRateDefault] = useState(0)
    const [lastData,setLastData] = useState([])

    const onFinish = (values) => {
        props.onValuesChange(values);
    };
    useEffect(() => {
        console.log("7890  props.pressure :", props);
        console.log("7890  props.lastData :", lastData);
        setFlowRateDefault(props.flowRateDefault)
        if (lastData.length !== 0){
            form.setFieldsValue({ users: lastData });
        }
        else{
            setLastData(props.pressure)

        }
    }, [props, form]);

    const handleValuesChange = (changedValues, allValues) => {
        console.log("7890 -----5---");
        console.log("7890 -----6---");
        console.log("7890  allValues", allValues);
        console.log("7890 -----3---");
        console.log("7890 -----4---");
        setLastData(allValues.users)
        console.log("7890 -----1---");
        console.log("7890 -----2---");

        console.log("7890  changedValues.users", changedValues.users);

        if (changedValues.users) {


            const index = changedValues.users.findIndex((item) => item);
            console.log("7890-----------index",index);

            const field = changedValues.users[index];
           
            const key = Object.keys(field)[0]
            if (field) {
                allValues.users[index][key] = Number(allValues.users[index][key])
            }
            if (field && field.pumpB !== undefined) {
                const pumpBValue = parseFloat(field.pumpB);
                const pumpAValue = 100 - pumpBValue;

                allValues.users[index].pumpA = pumpAValue
            }
            // if (field && field.pumpB !== undefined) {
            //     const pumpBValue = parseFloat(field.pumpB);
            //     if (!isNaN(pumpBValue)) {
            //         console.log("7890-------------------------------------------------------------");
                    
            //         const pumpAValue = 100 - pumpBValue;
            //         allValues.users[index].time = Number(allValues.users[index].time)
            //         allValues.users[index].pumpB = Number(allValues.users[index].pumpB)
            //         allValues.users[index].flowRate = Number(allValues.users[index].flowRate)
            //         allValues.users[index].pumpA = pumpAValue

            //         form.setFieldsValue({
            //             allValues
            //             // users: allValues.users.map((item, i) =>
            //                 // i === index
            //                 //     ? {
            //                 //           time: Number(item.time),
            //                 //           pumpB: Number(item.pumpB),
            //                 //           flowRate: Number(item.flowRate),
            //                 //           pumpA: pumpAValue,
                                      
            //                 //       }
            //                 //     : item
                          



            //             // ),
            //         });

            //     }
            // }

        }
        console.log("7890 -----10---");
        console.log("7890 -----20---");

        console.log("7890  lastData", lastData);
        console.log("7890   allValues.users",allValues.users);
        
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
                                        <Input placeholder = {flowRateDefault} />
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
