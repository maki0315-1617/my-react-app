import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [targetCount, setTargetCount] = useState(null); // ランダム回数
  const [clickCount, setClickCount] = useState(0); // ロン君クリック回数
  const [timer, setTimer] = useState(10); // 10秒タイマー
  const [isJumping, setIsJumping] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // -----------------------------
  // ゲーム開始
  // -----------------------------
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setClickCount(0);

    const random = Math.floor(Math.random() * 10) + 1; // 1〜10回
    setTargetCount(random);

    setTimer(10);
  };

  // -----------------------------
  // ロン君クリック
  // -----------------------------
  const handleCatClick = () => {
    if (!gameStarted || gameEnded) return;

    setClickCount((prev) => prev + 1);

    // ジャンプ演出
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 300);
    }
  };

  // -----------------------------
  // タイマー処理
  // -----------------------------
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    if (timer === 0) {
      finishGame();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, timer, gameEnded]);

  // -----------------------------
  // ゲーム終了判定
  // -----------------------------
  const finishGame = () => {
    setGameEnded(true);

    if (clickCount === targetCount) {
      alert("🎉 あなたの勝利です！");
    } else {
      alert(`😿 あなたの負けです…（あなた: ${clickCount}回 / 目標: ${targetCount}回）`);
    }

    const again = window.confirm("もう一度ゲームしますか？");

    if (again) {
      startGame();
    } else {
      endGame();
    }
  };

  // -----------------------------
  // ゲーム終了（画面クリア）
  // -----------------------------
  const endGame = () => {
    setGameStarted(false);
    setGameEnded(true);
    setTargetCount(null);
    setClickCount(0);
    setTimer(10);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="app">
      <h1>黒猫ロン君クリックゲーム</h1>

      {/* ゲーム開始ボタン */}
      {!gameStarted && (
        <button onClick={startGame} className="start-btn">
          ゲームスタート
        </button>
      )}

      {/* ゲーム中の表示 */}
      {gameStarted && (
        <>
          <h2>目標クリック回数：{targetCount} 回</h2>
          <h3>残り時間：{timer} 秒</h3>
          <h3>あなたのクリック回数：{clickCount} 回</h3>

          <div className="scroll-background">
            <img
              src="/ronkun.png"
              alt="黒猫ロン君"
              className={`cat-image ${isJumping ? "jump" : ""}`}
              onClick={handleCatClick}
            />
          </div>

          <p>※ 黒猫ロン君をクリックして回数を稼いでください！</p>
        </>
      )}

      {/* ゲーム終了後の画面クリア */}
      {gameEnded && !gameStarted && (
        <p>ゲームを終了しました。</p>
      )}
    </div>
  );
}

export default App;
