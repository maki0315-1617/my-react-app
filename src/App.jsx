import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // タイトル画面
  const [showTitle, setShowTitle] = useState(true);

  // ゲーム状態
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // 難易度
  const [difficulty, setDifficulty] = useState("Easy");

  // 本物・偽物・カウント
  const [targetCount, setTargetCount] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [timer, setTimer] = useState(10);
  const [isJumping, setIsJumping] = useState(false);

  // 偽物ロン君
  const [fakeCats, setFakeCats] = useState([]);

  // 履歴（localStorage）
  const [history, setHistory] = useState([]);

  // 難易度ごとの偽物出現頻度（秒）
  const fakeSpawnIntervalMap = {
    Easy: 4,
    Normal: 2,
    Hard: 1,
  };

  // 初回ロード時に履歴読み込み
  useEffect(() => {
    const saved = localStorage.getItem("ronkun-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // 履歴保存
  const saveHistory = (result, target, clicks) => {
    const newRecord = {
      date: new Date().toLocaleString(),
      result,
      target,
      clicks,
    };

    const updated = [newRecord, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("ronkun-history", JSON.stringify(updated));
  };

  // 勝率計算
  const winRate = (() => {
    if (history.length === 0) return 0;
    const wins = history.filter((h) => h.result === "勝ち").length;
    return Math.round((wins / history.length) * 100);
  })();

  // ランキング（勝利の中で目標回数が多い順）
  const ranking = (() => {
    const wins = history.filter((h) => h.result === "勝ち");
    return wins.sort((a, b) => b.target - a.target);
  })();

  // 偽物ロン君生成（本物と同じ動き + 左→右移動）
  const spawnFakeCat = () => {
    const id = Math.random().toString(36).substring(2, 9);

    const fake = {
      id,
      left: "-100px", // 左端からスタート
      top: Math.random() * 60 + "%", // ランダム縦位置
      jumping: false,
    };

    setFakeCats((prev) => [...prev, fake]);

    // 偽物ジャンプ開始
    setTimeout(() => {
      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, jumping: true } : cat
        )
      );
    }, 100);

    // 偽物ジャンプ解除
    setTimeout(() => {
      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, jumping: false } : cat
        )
      );
    }, 1000);

    // 左→右へ移動（スマホ対応）
    let pos = -100;
    const moveInterval = setInterval(() => {
      pos += window.innerWidth < 600 ? 3 : 5; // スマホは速度調整

      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, left: pos + "px" } : cat
        )
      );

      if (pos > window.innerWidth) {
        clearInterval(moveInterval);
        setFakeCats((prev) => prev.filter((cat) => cat.id !== id));
      }
    }, 50);
  };

  // 偽物出現タイマー
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const intervalSec = fakeSpawnIntervalMap[difficulty];

    const interval = setInterval(() => {
      spawnFakeCat();
    }, intervalSec * 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameEnded, difficulty]);

  // タイトル画面 → ゲーム開始
  const startFromTitle = () => {
    setShowTitle(false);
    startGame();
  };

  // ゲーム開始
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setClickCount(0);

    const random = Math.floor(Math.random() * 10) + 1;
    setTargetCount(random);

    setTimer(10);
  };

  // 本物ロン君クリック
  const handleCatClick = () => {
    if (!gameStarted || gameEnded) return;

    setClickCount((prev) => prev + 1);

    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 300);
    }
  };

  // 偽物ロン君クリック（減点のみ）
  const handleFakeCatClick = () => {
    if (!gameStarted || gameEnded) return;
    setClickCount((prev) => prev - 1);
  };

  // タイマー処理
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

  // ゲーム終了判定
  const finishGame = () => {
    setGameEnded(true);

    const isWin = clickCount === targetCount;

    if (isWin) {
      alert("🎉 あなたの勝利です！");
      saveHistory("勝ち", targetCount, clickCount);
    } else {
      alert(`😿 あなたの負けです…（あなた: ${clickCount}回 / 目標: ${targetCount}回）`);
      saveHistory("負け", targetCount, clickCount);
    }

    const again = window.confirm("もう一度ゲームしますか？");

    if (again) {
      startGame();
    } else {
      endGame();
    }
  };

  // ゲーム終了
  const endGame = () => {
    setGameStarted(false);
    setGameEnded(true);
    setTargetCount(null);
    setClickCount(0);
    setTimer(10);
    setFakeCats([]);
    setShowTitle(true); // タイトル画面に戻る
  };

  return (
    <div className="app">

      {/* タイトル画面 */}
      {showTitle && (
        <div className="title-screen">
          <h1 className="title-logo">黒猫ロン君クリックゲーム</h1>

          <img
            src="/ronkun.png"
            alt="黒猫ロン君"
            className="title-cat"
          />

          <h2>難易度選択</h2>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="difficulty-select"
          >
            <option value="Easy">Easy（簡単）</option>
            <option value="Normal">Normal（普通）</option>
            <option value="Hard">Hard（難しい）</option>
          </select>

          <button className="start-btn" onClick={startFromTitle}>
            ゲームスタート
          </button>
        </div>
      )}

      {/* タイトル画面が消えたらゲーム画面 */}
      {!showTitle && (
        <>
          {/* 履歴テーブル */}
          <section>
            <h2>過去の勝敗履歴（最新5件）</h2>

            {history.length === 0 && <p>履歴はまだありません</p>}

            {history.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th>勝敗</th>
                      <th>目標回数</th>
                      <th>クリック回数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, index) => (
                      <tr key={index}>
                        <td>{h.date}</td>
                        <td>{h.result}</td>
                        <td>{h.target}</td>
                        <td>{h.clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3>勝率：{winRate}%</h3>

            <h2>勝利ランキング（目標回数が多い順）</h2>
            {ranking.length === 0 && <p>勝利履歴がありません</p>}
            {ranking.length > 0 && (
              <ul>
                {ranking.map((r, index) => (
                  <li key={index}>
                    {index + 1}位：{r.date} / 目標 {r.target}回 / 達成 {r.clicks}回
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ゲーム中 */}
          {gameStarted && (
            <>
              <h2>目標クリック回数：{targetCount} 回</h2>
              <h3>残り時間：{timer} 秒</h3>
              <h3>あなたのクリック回数：{clickCount} 回</h3>