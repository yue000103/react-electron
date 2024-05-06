import logo from "./logo.svg";
import "./App.css";
import Test from "./views/test";
import Home from "./views/home";

function MyButton() {
    return <button>我是一个按钮</button>;
}

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <MyButton>按钮</MyButton>
                <button>我是一个</button>
            </header>
            <Test></Test>
            <Home></Home>
        </div>
    );
}

export default App;
