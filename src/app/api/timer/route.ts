import { open } from "sqlite";
import sqlite3 from "sqlite3";

const DB_PATH = "./timer.sqlite";

// DBの初期化関数
async function initializeDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  try {
    await db.exec(`
    CREATE TABLE IF NOT EXISTS timer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error; // Re-throw the error to prevent the application from continuing with a broken database connection
  }
  return db;
}

export async function GET() {
  const durationTime = 180;
  return new Response(durationTime.toString(), {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (
      !data.duration ||
      typeof data.duration !== "number" ||
      data.duration <= 0
    ) {
      return new Response("Invalid duration parameter", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const db = await initializeDb();

    await db.run("INSERT INTO timer_logs (duration) VALUES (?)", [
      data.duration,
    ]);

    await db.close();

    return new Response("Timer duration saved successfully", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new Response(
      `Failed to save timer duration: ${(error as Error).message}`,
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }
}
