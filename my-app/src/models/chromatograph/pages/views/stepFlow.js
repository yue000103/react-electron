import React from "react";
import {
    ApiOutlined,
    ApartmentOutlined,
    RadiusBottomleftOutlined,
} from "@ant-design/icons";
import flowImage from "@/assets/image/流程图.jpg";
import "./stepFlow.css";

const AbandonIcon = ({ active }) => (
    <div className={`abandon-icon ${active ? "active" : ""}`}>
        <img src={flowImage} alt="flow" className="abandon-icon-img" />
        {/*
        <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="#333333"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`abandon-icon ${active ? "active" : ""}`}
        >
            <defs>
                <clipPath id="abandon-clip">
                    <rect x="2.5" y="4" width="19" height="12" rx="0.5" />
                </clipPath>
            </defs>
            <g className="abandon-liquid" clipPath="url(#abandon-clip)">
                <rect
                    className="liquid-fill"
                    x="3"
                    y="4"
                    width="19"
                    height="12"
                    rx="0.5"
                />
            </g>
            <path d="M3 4v10a2 2 0 0 0 4 0V4z" />
            <path d="M8 4v10a2 2 0 0 0 4 0V4z" />
            <path d="M13 4v10a2 2 0 0 0 4 0V4z" />
            <path d="M18 4v10a2 2 0 0 0 4 0V4z" />
        </svg>
        */}
    </div>
);

const DEFAULT_STEPS = [
    { key: "collect", label: "收集" },
    { key: "merge", label: "合并" },
    { key: "abandon", label: "废弃" },
    { key: "clean", label: "清洗" },
];

const StepFlow = () => {
    return (
        <div className="step-flow">
            <img src={flowImage} alt="flow" className="step-flow-img" />
        </div>
    );
};

export default StepFlow;
