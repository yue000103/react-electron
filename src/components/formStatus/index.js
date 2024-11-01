import React, { useState, useEffect } from "react";
import { Form, Input, Button, Switch, Row, Col } from "antd";

// 翻译映射
const labelTranslations = {
    use_manual: "是否启动手动模式",
    spray_switch: "清洗开关",
    peristaltic_switch: "排液开关",
    drain_speed: "排液速度",
    clean_volume: "清洗体积",
    clean_count: "清洗次数",
    tube_id: "试管id",
    module_id: "模块id",
};

const CustomForm = ({ type, data, decideParameter, callback }) => {
    const [form] = Form.useForm();
    const [formData, setFormData] = useState(data);

    // 当外部 data 改变时更新表单数据
    useEffect(() => {
        setFormData(data);
        form.setFieldsValue(data);
        console.log("1023    formData", formData);
    }, [data, form]);

    // 判断表单项是否应该被禁用
    const isItemDisabled = (key) => {
        if (key === decideParameter) return false;
        return formData[decideParameter] === false;
    };

    // // 处理表单值变化
    const handleValuesChange = (changedValues, allValues) => {
        const newFormData = { ...formData, ...changedValues };
        setFormData(newFormData);
    };

    // 表单提交处理函数
    const onFinish = (values) => {
        const status = Object.keys(data).reduce((acc, key) => {
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
        callback(type, status);
    };

    // 渲染表单项
    const renderFormItems = () => {
        return Object.keys(data).map((key) => {
            const label = labelTranslations[key] || key;
            const value = formData[key];
            const disabled = isItemDisabled(key);

            if (value === true || value === false) {
                return (
                    <Form.Item
                        key={key}
                        label={label}
                        name={key}
                        valuePropName="checked"
                        initialValue={value === 1}
                    >
                        <Switch
                            checkedChildren="开"
                            unCheckedChildren="关"
                            disabled={disabled}
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
                        <Input disabled={disabled} />
                    </Form.Item>
                );
            }
        });
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            onValuesChange={handleValuesChange}
        >
            {renderFormItems()}
            <Form.Item>
                <Row>
                    <Col span={24} style={{ textAlign: "center" }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            // disabled={formData[decideParameter] === false}
                        >
                            上传
                        </Button>
                    </Col>
                </Row>
            </Form.Item>
        </Form>
    );
};

const App = (props) => {
    return (
        <div style={{ padding: "2rem" }}>
            <CustomForm
                type={props.type}
                data={props.data}
                decideParameter={props.decideParameter}
                callback={props.callback}
            />
        </div>
    );
};

export default App;
