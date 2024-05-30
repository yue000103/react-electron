import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const LineChart = (props) => {
    const data = props.data;
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 监听 headerStyle 的大小变化
    useEffect(() => {
        const headerDiv = document.querySelector(".headerStyle");
        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        resizeObserver.observe(headerDiv);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // 使用 useEffect 监听 dimensions 变化，重新绘制折线图
    useEffect(() => {
        if (!data || dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = dimensions.width;
        const height = dimensions.height;

        const xScale = d3.scaleLinear().domain([0, 21]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

        const line = d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(d3.curveCardinal); // 使用 Cardinal 曲线插值

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);
    }, [data, dimensions]);

    return (
        <div
            className="headerStyle"
            style={{
                width: "100%",
                height: "300px",
                border: "1px solid black",
            }}
        >
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
    );
};

export default LineChart;
