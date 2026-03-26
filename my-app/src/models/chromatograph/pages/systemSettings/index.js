import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Divider, Button, Popconfirm, Spin, message } from "antd";
import { SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import "./index.css";
import {
    getStockSolutions,
    updateStockSolution,
    getCollectionBottles,
    updateCollectionBottle,
   
} from "../../api/settings";

const STORAGE_KEY = "chromatograph:system-settings:v1";

const VOLUME_PRESETS = [5, 10, 15, 20, 30, 50];

// 数据包适配：纯 label 匹配，禁止 id 依赖
const extractSolution = (res) => {
    if (!res || res.error || !res.data) return null;
    const d = res.data;
    const list = d.stock_solutions || d.stock_solution || d.list || (Array.isArray(d) ? d : []);
    if (!Array.isArray(list) || list.length === 0) return null;
    return {
        pumpAName: list.find(item => item.label === "A")?.name || "A",
        pumpBName: list.find(item => item.label === "B")?.name || "B",
    };
};

const extractBottle = (res) => {
    if (!res || res.error || !res.data) return null;
    const d = res.data;
    const arr = d.collection_bottles || d.collection_bottle || d.list || (Array.isArray(d) ? d : [d]);
    const bot = Array.isArray(arr) ? arr[0] : arr;
    if (!bot) return null;
    return bot.tubeVolume || bot.tube_volume || bot.volume;
};

const SystemSettings = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedVolume, setSelectedVolume] = useState(15);

    // 页面加载时拉取远端数据，如果远端不可用则回退 localStorage
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const [solRes, bottleRes] = await Promise.all([
                getStockSolutions().catch(() => null),
                getCollectionBottles().catch(() => null),
            ]);

            const values = {};

            const solData = extractSolution(solRes);
            if (solData) {
                if (solData.pumpAName) values.pumpAName = solData.pumpAName;
                if (solData.pumpBName) values.pumpBName = solData.pumpBName;
            }

            const tubeVol = extractBottle(bottleRes);
            if (tubeVol) {
                values.tubeVolume = tubeVol;
            }

            // 如果远端有数据就用远端，否则回退 localStorage
            if (Object.keys(values).length > 0) {
                form.setFieldsValue(values);
                if (values.tubeVolume) setSelectedVolume(values.tubeVolume);
            } else {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    try {
                        form.setFieldsValue(JSON.parse(saved));
                    } catch (e) {
                        // ignore
                    }
                }
            }
        } catch (err) {
            // API 不可用时回退 localStorage
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    form.setFieldsValue(JSON.parse(saved));
                } catch (e) {
                    // ignore
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVolumeSelect = (vol) => {
        setSelectedVolume(vol);
        form.setFieldsValue({ tubeVolume: vol });
    };

    const handleSave = async () => {
        // 影刃：全局加载遮罩
        const hideLoading = messageApi.open({
            type: "loading",
            content: "正在同步全量配置...",
            duration: 0,
            key: "global-save",
        });

        try {
            setSaving(true);
            const values = await form.validateFields();

            // 数据校验：label 为 A/B，name 非空
            const nameA = (values.pumpAName || "").trim();
            const nameB = (values.pumpBName || "").trim();
            if (!nameA || !nameB) {
                messageApi.destroy("global-save");
                messageApi.open({ type: "error", content: "泵液体名称不能为空" });
                setSaving(false);
                return;
            }

            // 同时保存到 localStorage 和远端 API
            localStorage.setItem(STORAGE_KEY, JSON.stringify(values));

            const savePromises = [
                updateStockSolution([
                    { label: "A", name: nameA },
                    { label: "B", name: nameB },
                ]).catch(() => null),
                updateCollectionBottle({
                    id:1,
                    volume: values.tubeVolume,
                }).catch(() => null),
            ];

            const results = await Promise.all(savePromises);

            // 检查是否有失败
            const hasFail = results.some(r => r === null);

            messageApi.destroy("global-save");

            if (hasFail) {
                messageApi.open({
                    type: "warning",
                    content: "部分配置同步失败，已保存至本地",
                });
            } else {
                messageApi.open({
                    type: "success",
                    content: "全量配置已同步",
                    key: "global-save",
                });
            }

            // 影刃：触发方法页名称闪烁 — 通过 localStorage 事件总线通知
            localStorage.setItem("pump-label-sync-ts", Date.now().toString());
        } catch (err) {
            messageApi.destroy("global-save");
            if (err.errorFields) {
                setSaving(false);
                return;
            }
            messageApi.open({
                type: "error",
                content: "保存失败，请重试",
            });
        } finally {
            setSaving(false);
        }
    };

 

    return (
        <div className="systemSettings">
            {contextHolder}
            <Spin spinning={loading}>
                {/* 原液定义 */}
                <div className="systemSettings__section">
                    <div className="systemSettings__sectionHeader">
                        <Divider className="systemSettings__divider" orientation="left">
                            <span className="systemSettings__section-id">01</span> 原液定义
                        </Divider>
                        
                    </div>
                    <Form
                        form={form}
                        layout="vertical"
                        size="large"
                        initialValues={{
                            pumpAName: "水",
                            pumpBName: "乙腈",
                            tubeVolume: 15,
                        }}
                    >
                        <Form.Item
                            label={
                                <span className="lab-sticker lab-sticker--a">
                                    <span className="lab-sticker__tag">A</span>
                                    泵液体名称
                                </span>
                            }
                            name="pumpAName"
                            className="pump-input--a"
                            rules={[{ required: true, message: "请输入A泵液体名" }]}
                        >
                            <Input size="large" placeholder="例如：水" />
                        </Form.Item>
                        <Form.Item
                            label={
                                <span className="lab-sticker lab-sticker--b">
                                    <span className="lab-sticker__tag">B</span>
                                    泵液体名称
                                </span>
                            }
                            name="pumpBName"
                            className="pump-input--b"
                            rules={[{ required: true, message: "请输入B泵液体名" }]}
                        >
                            <Input size="large" placeholder="例如：乙腈" />
                        </Form.Item>

                        {/* 耗材规格 */}
                        <div className="systemSettings__sectionHeader">
                            <Divider className="systemSettings__divider" orientation="left">
                                <span className="systemSettings__section-id">02</span> 耗材规格
                            </Divider>
                           
                        </div>
                        <div style={{ marginBottom: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                            快速选择常用规格：
                        </div>
                        <div className="volume-picker">
                            {VOLUME_PRESETS.map((vol) => (
                                <div
                                    key={vol}
                                    className={`volume-picker__block${selectedVolume === vol ? " volume-picker__block--selected" : ""}`}
                                    onClick={() => handleVolumeSelect(vol)}
                                >
                                    {vol}<span className="volume-picker__unit">mL</span>
                                </div>
                            ))}
                        </div>
                        <Form.Item label="收集瓶单瓶容积 (mL)" name="tubeVolume" rules={[{ required: true, message: "请输入容积" }]}>
                            <InputNumber size="large" style={{ width: "100%" }} min={0.1} step={0.5} placeholder="请输入单瓶容积" onChange={(v) => setSelectedVolume(v)} />
                        </Form.Item>
                    </Form>
                </div>

                <div className="systemSettings__actions">
                    <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                        保存设置
                    </Button>
                </div>
            </Spin>
        </div>
    );
};

export default SystemSettings;
