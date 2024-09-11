import React from "react";
import styled, { keyframes } from "styled-components";

// 定义加载动画
const spin = keyframes`
  from {
    transform: rotate(0deg);
    // animation-timing-function: ease-in; // 从开始到第一个关键帧使用缓入效果
  }
  // 50% {
  //   transform: rotate(180deg);
  //   opacity: 0.5;
  //   animation-timing-function: ease-out; // 从第一个关键帧到 50% 处使用缓出效果
  // }
  to {
    transform: rotate(360deg);
    animation-timing-function: linear; // 从 50% 到结束使用线性效果
  }
`;

const StyledStatusIcon = styled.div`
    display: inline-block;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid ${(props) => (props.isLoading ? "none" : props.color)};

    background-color: ${(props) => (props.isLoading ? "none" : props.color)};
    position: relative;

    &::before {
        content: "";
        position: absolute;
        top: 0px;
        left: 0px;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 50%;
        border: 2px solid ${(props) => props.color};
        border-top-color: transparent;
        border-left-color: transparent;
        border-right-color: transparent;

        animation: ${spin} 2s linear infinite;
        animation-delay: 0s; // 添加延迟
        display: ${(props) => (props.isLoading ? "block" : "none")};
    }
`;
const TextWrapper = styled.span`
    font-size: 1.1rem;
    color: ${(props) => (props.isLoading ? "white" : "black")};
`;
const StatusIcon = ({ status, color, tubeId }) => {
    const isLoading = status === "process";
    console.log("09118  isLoading :", isLoading);

    return (
        <StyledStatusIcon status={status} color={color} isLoading={isLoading}>
            <TextWrapper>{tubeId}</TextWrapper>
        </StyledStatusIcon>
    );
};

export default StatusIcon;
