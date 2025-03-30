import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { DB_PATH } from "../../filename";

// DBの初期化関数
async function initializeDb() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS timer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error; // Re-throw the error to prevent the application from continuing with a broken database connection
  }
}

export async function GET() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const row = await db.get(
      "SELECT duration FROM timer_logs ORDER BY  DESC LIMIT 1"
    );
    await db.close();

    const durationTime = row?.duration ?? 180; // Default to 180 if no records exist
    return new Response(durationTime.toString(), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response("180", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
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
