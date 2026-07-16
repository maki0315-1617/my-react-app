import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // タイトル画面
  const [showTitle, setShowTitle] = useState(true);

  // 結果画面
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

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

    const updated = [newRecord, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("ronkun-history", JSON.stringify(updated));
  };

  // 勝敗数（タイトル画面だけで使う）
  const winCount = history.filter((h) => h.result === "勝ち").length;
  const loseCount = history.filter((h) => h.result === "負け").length;

  // 勝率計算
  const winRate = (() => {
    if (history.length === 0) return 0;
    return Math.round((winCount / history.length) * 100);
  })();

  // ランキング
  const ranking = (() => {
    const wins = history.filter((h) => h.result === "勝ち");
    return wins.sort((a, b) => b.target - a.target);
  })();

  // 偽物ロン君生成（左→右へ移動）
  const spawnFakeCat = () => {
    const id = Math.random().toString(36).substring(2, 9);

    const fake = {
      id,
      top: Math.random() * 60 + "%", // ランダム縦位置
      jumping: false,
    };

    setFakeCats((prev) => [...prev, fake]);

    // ジャンプ開始
    setTimeout(() => {
      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, jumping: true } : cat
        )
      );
    }, 100);

    // ジャンプ解除
    setTimeout(() => {
      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, jumping: false } : cat
        )
      );
    }, 1000);

    // 4秒後に削除
    setTimeout(() => {
      setFakeCats((prev) => prev.filter((cat) => cat.id !== id));
    }, 4000);
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
    setShowResult(false);
    setClickCount(0);

    const random = Math.floor(Math.random() * 10) + 1;
    setTargetCount(random);

    setTimer(10);
    setFakeCats([]);
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
      setResultMessage(`🎉 勝ち！ 目標 ${targetCount} 回 / あなた ${clickCount} 回`);
      saveHistory("勝ち", targetCount, clickCount);
    } else {
      setResultMessage(`😿 負け… 目標 ${targetCount} 回 / あなた ${clickCount} 回`);
      saveHistory("負け", targetCount, clickCount);
    }

    setShowResult(true);
  };

  // タイトル画面へ戻る
  const goToTitle = () => {
    setShowResult(false);
    setShowTitle(true);
    setGameStarted(false);
    setGameEnded(false);
    setClickCount(0);
    setTimer(10);
    setFakeCats([]);
  };

  // ゲームを続ける
  const continueGame = () => {
    setShowResult(false);
    startGame();
  };

  return (
    <div className="app">

      {/* タイトル画面 */}
      {showTitle && !showResult && (
        <div className="title-screen">
          <h1 className="title-logo">黒猫ロン君クリックゲーム</h1>

          <img src="/ronkun.png" alt="黒猫ロン君" className="title-cat" />

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

          {/* ★ 過去の勝敗数（タイトル画面だけに表示） */}
          <h3>過去の勝敗数</h3>
          <p>勝ち：{winCount} 回 / 負け：{loseCount} 回</p>
        </div>
      )}

      {/* 結果画面 */}
      {showResult && (
        <div className="result-screen">
          <h2>{resultMessage}</h2>

          <button className="result-btn" onClick={goToTitle}>
            OK（タイトルへ戻る）
          </button>

          <button className="result-btn-continue" onClick={continueGame}>
            ゲームを続ける
          </button>
        </div>
      )}

      {/* ゲーム画面 */}
      {!showTitle && !showResult && (
        <>
          {/* 履歴テーブル */}
          <section>
            <h2>過去の勝敗履歴（最新20件）</h2>

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

              <div
                className="scroll-background"
                style={{ position: "relative", height: "300px" }}
              >
                {/* 本物ロン君 */}
                <img
                  src="/ronkun.png"
                  alt="黒猫ロン君"
                  className={`cat-image ${isJumping ? "jump" : ""}`}
                  onClick={handleCatClick}
                />

                {/* 偽物ロン君 */}
                {fakeCats.map((cat) => (
                  <img
                    key={cat.id}
                    src="/fake-ronkun.svg"
                    alt="偽物ロン君"
                    className={`fake-cat move-left-right ${cat.jumping ? "jump" : ""}`}
                    style={{
                      top: cat.top,
                      width: window.innerWidth < 600 ? "60px" : "80px",
                    }}
                    onClick={handleFakeCatClick}
                  />
                ))}
              </div>

              <p>※ 黒猫ロン君をクリックして回数を稼いでください！</p>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
