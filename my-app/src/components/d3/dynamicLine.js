import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./dynamicLine.css";

const DynamicLine = (props) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const transformAndSortData = (data) => {
        return data
            .filter((d) => d.time !== undefined || d.pumpB !== undefined)
            .map((d) => ({ x: d.time, y: d.pumpB }))
            .sort((a, b) => a.x - b.x);
    };

    // 自适应容器尺寸
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                setContainerSize({ width, height });
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const data = transformAndSortData(props.pressure || []);
        const xTime = props.samplingTime || 10;

        if (!svgRef.current || containerSize.width === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 6, right: 6, bottom: 6, left: 6 };
        const width = containerSize.width - margin.left - margin.right;
        const height = containerSize.height - margin.top - margin.bottom;

        if (width <= 0 || height <= 0) return;

        const svg = d3
            .select(svgRef.current)
            .attr("width", containerSize.width)
            .attr("height", containerSize.height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 比例尺
        const xScale = d3.scaleLinear().domain([0, xTime]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

        // 仅保留最简易的 XY 边框（无刻度、无文字、无网格）
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("stroke", "var(--border-color, #2A3444)")
            .attr("stroke-width", 1);

        // 折线生成器
        const line = d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(d3.curveLinear);

        // 绘制折线 - 橙色 + 微弱静态发光
        if (data.length > 0) {
            // 发光层（模糊）
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "var(--accent-orange, #FF9F1C)")
                .attr("stroke-width", 4)
                .attr("stroke-opacity", 0.3)
                .attr("filter", "blur(3px)")
                .attr("d", line);

            // 主线条
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "var(--accent-orange, #FF9F1C)")
                .attr("stroke-width", 1.5)
                .attr("d", line);

            // 数据点 - 小圆点，无交互
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", (d) => xScale(d.x))
                .attr("cy", (d) => yScale(d.y))
                .attr("r", 2)
                .attr("fill", "var(--accent-orange, #FF9F1C)");
        }
    }, [props.pressure, props.samplingTime, containerSize]);

    return (
        <div className="miniChart" ref={containerRef}>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default DynamicLine;
