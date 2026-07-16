import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
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

  // 偽物ロン君生成（本物と同じ動き）
  const spawnFakeCat = () => {
    const id = Math.random().toString(36).substring(2, 9);

    const fake = {
      id,
      left: Math.random() * 80 + "%",
      top: Math.random() * 60 + "%",
      jumping: false,
    };

    setFakeCats((prev) => [...prev, fake]);

    // 偽物もジャンプする
    setTimeout(() => {
      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, jumping: true } : cat
        )
      );
    }, 100);

    // 1秒後にジャンプ解除
    setTimeout(() => {
      setFakeCats((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, jumping: false } : cat
        )
      );
    }, 1000);

    // 3秒後に消える
    setTimeout(() => {
      setFakeCats((prev) => prev.filter((cat) => cat.id !== id));
    }, 3000);
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

  // 偽物ロン君クリック（減点）
  const handleFakeCatClick = () => {
    if (!gameStarted || gameEnded) return;

    setClickCount((prev) => prev - 1);
    alert("偽物のロン君です！ -1 点");
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
  };

  return (
    <div className="app">
      <h1>黒猫ロン君クリックゲーム</h1>

      {/* 難易度選択 */}
      <section>
        <h2>難易度選択</h2>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="Easy">Easy（簡単）</option>
          <option value="Normal">Normal（普通）</option>
          <option value="Hard">Hard（難しい）</option>
        </select>
      </section>

      {/* 履歴テーブル */}
      <section>
        <h2>過去の勝敗履歴（最新5件）</h2>

        {history.length === 0 && <p>履歴はまだありません</p>}

        {history.length > 0 && (
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

      {/* ゲーム開始ボタン */}
      {!gameStarted && (
        <button onClick={startGame} className="start-btn">
          ゲームスタート
        </button>
      )}

      {/* ゲーム中 */}
      {gameStarted && (
        <>
          <h2>目標クリック回数：{targetCount} 回</h2>
          <h3>残り時間：{timer} 秒</h3>
          <h3>あなたのクリック回数：{clickCount} 回</h3>

          <div className="scroll-background" style={{ position: "relative" }}>
            {/* 本物ロン君 */}
            <img
              src="/ronkun.png"
              alt="黒猫ロン君"
              className={`cat-image ${isJumping ? "jump" : ""}`}
              onClick={handleCatClick}
              style={{ width: "120px", cursor: "pointer" }}
            />

            {/* 偽物ロン君 */}
            {fakeCats.map((cat) => (
              <img
                key={cat.id}
                src="/fake-ronkun.png"
                alt="偽物ロン君"
                className={`fake-cat ${cat.jumping ? "jump" : ""}`}
                style={{
                  position: "absolute",
                  left: cat.left,
                  top: cat.top,
                  width: "80px",
                  cursor: "pointer",
                }}
                onClick={handleFakeCatClick}
              />
            ))}
          </div>

          <p>※ 黒猫ロン君をクリックして回数を稼いでください！</p>
        </>
      )}

      {gameEnded && !gameStarted && <p>ゲームを終了しました。</p>}
    </div>
  );
}

export default App;
