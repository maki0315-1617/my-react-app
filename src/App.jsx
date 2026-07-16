// ロン君のReactAPP作成
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // テキスト入力の状態
  const [text, setText] = useState("");

  // カウント（クリックイベント）
  const [count, setCount] = useState(0);

  // マウスイベントの状態
  const [mouseMessage, setMouseMessage] = useState("カーソルを乗せてみてください");

  // 入力監視ログ
  const [inputLog, setInputLog] = useState([]);

  // マウス監視ログ
  const [mouseLog, setMouseLog] = useState([]);

  // -----------------------------
  // イベントハンドラ
  // -----------------------------

  // テキスト入力イベント
  const handleChange = (e) => {
    setText(e.target.value);
  };

  // クリックイベント
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

  // 入力ログをクリアするイベント
  const clearInputLog = () => {
    setInputLog([]);
  };

  // -----------------------------
  // useEffect：入力監視
  // -----------------------------
  useEffect(() => {
    if (text !== "") {
      setInputLog((prev) => [...prev, `入力: ${text}`]);
    }
  }, [text]);

  // -----------------------------
  // useEffect：マウス監視
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

      {/* 黒猫ロン君の歩行アニメーション */}
      <div className="cat-area">
        <img
          src="/Copilot_20260716_132538.png"
          alt="黒猫ロン君"
          className="cat-image"
        />
      </div>

      {/* テキスト入力イベント */}
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

      {/* クリックイベント */}
      <section>
        <h2>2. クリックイベント（onClick）</h2>
        <p>現在のカウント: {count}</p>
        <button onClick={handleClick}>カウントを増やす</button>
      </section>

      <hr />

      {/* マウスイベント */}
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

      {/* useEffect ログ表示 */}
      <section>
        <h2>4. useEffect による監視ログ</h2>

        <h3>入力ログ</h3>
        <button onClick={clearInputLog}>入力ログをクリアする</button>
        <ul>
          {inputLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>

        <h3>マウスログ</h3>
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
