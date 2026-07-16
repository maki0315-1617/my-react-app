// ロン君のReactAPP作成
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [mouseMessage, setMouseMessage] = useState("カーソルを乗せてみてください");
  const [mouseLog, setMouseLog] = useState([]);
  const [isJumping, setIsJumping] = useState(false);

  // -----------------------------
  // イベントハンドラ
  // -----------------------------

  // テキスト入力イベント（安全版）
  const handleChange = (e) => {
    setText(e.target.value);
  };

  // クリックイベント（カウントアップ）
  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  // マウスイベント
  const handleMouseEnter = () => {
    setMouseMessage("マウスが乗りました！");
  };

  const handleMouseLeave = () => {
    setMouseMessage("マウスが離れました");
  };

  // ジャンプイベント
  const jump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }
  };

  // -----------------------------
  // useEffect：マウスログ（安全）
  // -----------------------------
  useEffect(() => {
    setMouseLog((prev) => [...prev, `状態: ${mouseMessage}`]);
  }, [mouseMessage]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="app">
      <h1>ロン君のReactAPP作成</h1>

      <div className="scroll-background">
        <img
          src="/ronkun.png"
          alt="黒猫ロン君"
          className={`cat-image ${isJumping ? "jump" : ""}`}
          onClick={jump}
        />
      </div>

      <p>※ 黒猫ロン君をクリックするとジャンプします</p>

      <section>
        <h2>1. テキスト入力イベント（onChange）</h2>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="文字を入力してみてください"
        />
        <p>入力された文字: {text}</p>
      </section>

      <hr />

      <section>
        <h2>2. クリックイベント（onClick）</h2>
        <p>現在のカウント: {count}</p>
        <button onClick={handleClick}>カウントを増やす</button>
      </section>

      <hr />

      <section>
        <h2>3. マウスイベント（onMouseEnter / onMouseLeave）</h2>

        <div
          className="hover-box"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          ホバーエリア
        </div>

        <p>{mouseMessage}</p>
      </section>

      <hr />

      <section>
        <h2>4. useEffect による監視ログ（マウスのみ）</h2>

        <h3>マウスログ</h3>
        <button onClick={() => setMouseLog([])}>マウスログをクリアする</button>
        <ul>
          {mouseLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
