const { Pool } = require("pg");

// 環境変数からデータベース接続情報を取得（ローカルでテストする場合は、自分で設定が必要）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Heroku などの場合に必要な設定。Render では設定に応じて変更が必要かもしれません。
  },
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    // テーブルの作成
    const sql = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false
      );
    `;
    await client.query(sql);
    console.log("Table is successfully created");
  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    client.release(); // コネクションをプールに戻す
  }
}

setupDatabase()
  .then(() => {
    console.log("Database setup complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database setup failed:", err);
    process.exit(1);
  });
