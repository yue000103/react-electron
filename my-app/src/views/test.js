import "./test.css";
import test1 from "./test1.jpg";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Test() {
    const svgRef = useRef(null);

    useEffect(() => {
        // 数据
        const data = [
            { x: 1, y: 10 },
            { x: 2, y: 20 },
            { x: 3, y: 15 },
            { x: 4, y: 25 },
            { x: 5, y: 18 },
        ];

        // SVG 宽度和高度
        const width = 600;
        const height = 300;

        // 创建 SVG 元素
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // 比例尺
        const xScale = d3
            .scaleLinear()
            .domain([1, 5])
            .range([50, width - 20]);

        const yScale = d3
            .scaleLinear()
            .domain([0, 30])
            .range([height - 50, 50]);

        // 折线生成器
        const line = d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(d3.curveCardinal); // 使用 Cardinal 曲线插值

        // 绘制折线路径
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);
    }, []); // 仅在组件挂载时执行一次

    return (
        <div className="test">
            <h1>❤ welcome to Mo's group!</h1>
            <p>here is the first demo on 2024.4.29.</p>
            <div className="t2">
                <img src={test1}></img>
            </div>
            <svg ref={svgRef}></svg> {/* SVG 元素 */}
        </div>
    );
}

export default Test;
