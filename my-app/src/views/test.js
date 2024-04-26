

import './test.css';

function MyButton() {
    return(
      <button>我是一个按钮</button>
    )
  }
  
function test() {
  return (
    <div className='test'>
     <MyButton>按钮</MyButton>
    </div>
  );
}

export default test;