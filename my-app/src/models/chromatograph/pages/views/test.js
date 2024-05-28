import * as AntDesign from "antd";
import "@/assets/css/overlay.css"; // 确保路径正确
import { Flex, Layout, Button, Row, Col, Alert, message } from "antd";

const createGroups = (start, end, groupCount) => {
    const range = [];
    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    const groupSize = Math.ceil(range.length / groupCount);
    const groups = [];

    for (let i = 0; i < groupCount; i++) {
        groups.push(range.slice(i * groupSize, (i + 1) * groupSize));
    }

    return groups;
};

function App() {
    // 假设 data 是你的原始数据
    const data = [
        [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        ],
        [
            [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        ],
    ];

    // 将数据重新分组，每两个组合成一个新组
    const groupData = (data) => {
        const grouped = [];
        for (let i = 0; i < data.length; i += 2) {
            grouped.push([...data[i], ...(data[i + 1] || [])]);
        }
        return grouped;
    };

    const groupedData = groupData(data);
    console.log(data);
    return (
        <div>
            <Row>
                {data.map((group, groupIndex) => (
                    <Col key={groupIndex} span={24}>
                        <Row>
                            {group.map((g, gi) => (
                                <Col key={gi} span={12}>
                                    <div
                                        style={{
                                            width: "250px",
                                            height: "250px",
                                            backgroundColor: "yellow",
                                            margin: "20PX",
                                        }}
                                    >
                                        {gi}
                                        {/* {group} */}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default App;
