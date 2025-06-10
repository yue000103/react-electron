import React, { useState, useEffect } from "react";
import { TextDeletionOutline } from "antd-mobile-icons";
import "./index.css";
const numberToStringArray = (num) => {
    return num.toString().split("");
};
export default (props) => {
    const [inputNumber, setinputNumber] = useState([]);

    useEffect(() => {
        console.log("e props.value :", props.value);

        const result = numberToStringArray(props.value);
        setinputNumber(result);
    }, [props.value]);

    function addNumber(a) {
        if (a.target.innerText === ".") {
            if (!inputNumber.length) return;
            const decimalPointIndex = inputNumber.findIndex(
                (item) => item == "."
            );
            if (decimalPointIndex !== -1) return;
        }
        inputNumber.push(a.target.innerText);
        setinputNumber([...inputNumber]);
        props.callback(inputNumber);
    }
    function deleteNumber() {
        inputNumber.pop();
        setinputNumber([...inputNumber]);
        props.callback(inputNumber);
    }
    return (
        <div>
            {/* <div className="money">
                <span className="sufix">¥</span>
                <span className="amount">{inputNumber}</span>
            </div> */}
            <div className="keyBoard">
                <div onClick={addNumber}>1</div>
                <div onClick={addNumber}>2</div>
                <div onClick={addNumber}>3</div>

                <div onClick={addNumber}>4</div>
                <div onClick={addNumber}>5</div>
                <div onClick={addNumber}>6</div>
                {/* <div
                    className="confirm"
                    onClick={() => console.log(inputNumber)}
                >
                    确定
                </div> */}
                <div onClick={addNumber}>7</div>
                <div onClick={addNumber}>8</div>
                <div onClick={addNumber}>9</div>
                <div className="zero" onClick={addNumber}>
                    0
                </div>
                <div onClick={addNumber}>.</div>
                <div onClick={deleteNumber}>
                    <TextDeletionOutline />
                </div>
            </div>
        </div>
    );
};
