import React, { useState, useEffect } from "react";

const Clock = () => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const hour = String(currentDate.getHours() % 12 || 12).padStart(
                2,
                "0"
            );
            const minute = String(currentDate.getMinutes()).padStart(2, "0");
            const second = String(currentDate.getSeconds()).padStart(2, "0");
            const period = currentDate.getHours() < 12 ? "AM" : "PM";

            const formattedTime = `${year}/${month}/${day} ${hour}:${minute}:${second} ${period}`;
            setTime(formattedTime);
        }, 1000);

        // 清除定时器
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <p>{time}</p>
        </div>
    );
};

export default Clock;
