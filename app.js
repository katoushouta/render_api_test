const { Pool } = require("pg");
const express = require("express");
const app = express();

// 環境変数からデータベース接続情報を取得
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Heroku などの場合に必要な設定。Render では設定に応じて変更が必要かもしれません。
  },
});

app.use(express.json());

// resにcorsエラー回避用のヘッダーを追加する関数
const addCorsHeader = (res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Content-Type", "application/json; charset=utf-8");
  res.header("Access-Control-Allow-Credentials", true);
};

// CRUD 操作の API 例
app.get("/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks");
    res.json(rows);
    res = addCorsHeader(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/tasks", async (req, res) => {
  const { description } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (description, completed) VALUES ($1, $2) RETURNING *",
      [description, false]
    );
    res.status(201).json(rows[0]);
    res = addCorsHeader(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/tasks/:id", async (req, res) => {
  const { description, completed } = req.body;
  try {
    await pool.query(
      "UPDATE tasks SET description = $1, completed = $2 WHERE id = $3",
      [description, completed, req.params.id]
    );
    res.send("Task updated");
    res = addCorsHeader(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.send("Task deleted");
    res = addCorsHeader(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
