import '@testing-library/jest-dom';

import { open } from 'sqlite';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import sqlite3 from 'sqlite3';

import { GET, POST } from './route';

jest.mock("sqlite3");
jest.mock("sqlite");

describe("タイマーの時間を取得するAPIのテスト", () => {
  it("180秒が返ってくる", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("180");
  });
});

describe("Timer POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("正しいパラメータで呼び出した場合、データベースに保存されること", async () => {
    const mockRun = jest.fn();
    const mockClose = jest.fn();

    (open as jest.Mock).mockResolvedValue({
      exec: jest.fn(),
      run: mockRun,
      close: mockClose,
    });

    const request = new Request("http://localhost:3000/api/timer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ duration: 180 }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Timer duration saved successfully");
    expect(mockRun).toHaveBeenCalledWith(
      "INSERT INTO timer_logs (duration) VALUES (?)",
      [180]
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it("不正なパラメータの場合はエラーを返すこと", async () => {
    const request = new Request("http://localhost:3000/api/timer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ duration: "invalid" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid duration parameter");
  });

  it("データベースエラーの場合は500エラーを返すこと", async () => {
    (open as jest.Mock).mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost:3000/api/timer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ duration: 180 }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.text()).toBe(
      "Failed to save timer duration: Database error"
    );
  });
});
