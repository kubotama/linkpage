import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React, { act } from "react";

import { fireEvent, render, waitFor, screen } from "@testing-library/react";

import { Timer } from "./Timer";

describe("Timer コンポーネント", () => {
  beforeEach(() => {
    // タイマーのモックを設定
    jest.useFakeTimers();
    fetchMock.resetMocks();
  });

  it("初期画面で 01:15 と開始ボタンが表示されること", async () => {
    const durationTime = 75;

    await act(async () => {
      fetchMock.mockResponseOnce(durationTime.toString());
      render(<Timer />);
    });

    await waitFor(() => {
      expect(fetchMock.call.length).toBe(1);
      expect(screen.getByTestId("timer-input-minutes")).toHaveValue("01");
      expect(screen.getByTestId("timer-input-seconds")).toHaveValue("15");
      expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
    });
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("開始ボタンをクリックすると停止ボタンが表示されること", async () => {
    const durationTime = 150;

    await act(async () => {
      fetchMock.mockResponseOnce(durationTime.toString());
      render(<Timer />);
    });

    // 開始ボタンをクリックすると、ボタンのラベルが停止に変わることをテストします

    // 開始ボタンをクリックする(=開始ボタンが表示されている)
    const startButton = screen.getByRole("button", { name: "開始" });
    await act(async () => {
      fireEvent.click(startButton);
    });

    await waitFor(() => {
      // 停止ボタンが表示されている
      expect(screen.getByRole("button", { name: "停止" })).toBeInTheDocument();
      // 開始ボタンは表示されていない
      expect(screen.queryByText("開始")).not.toBeInTheDocument();
    });
  });

  it("停止ボタンをクリックすると開始ボタンが表示されること", async () => {
    const durationTime = 170;
    await act(async () => {
      fetchMock.mockResponseOnce(durationTime.toString());
      render(<Timer />);
    });

    // 開始ボタンをクリックする(=開始ボタンが表示されている)
    const startButton = screen.getByRole("button", { name: "開始" });
    await act(async () => {
      fireEvent.click(startButton);
      // タイマーが実行中である
      jest.advanceTimersByTime(30000);
    });

    // 停止ボタンが表示されている
    const stopButton = screen.getByRole("button", { name: "停止" });
    // 停止ボタンをクリックする
    await act(async () => {
      fireEvent.click(stopButton);
    });

    await waitFor(() => {
      // 開始ボタンが表示されている
      expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
      // 停止ボタンは表示されていない
      expect(screen.queryByText("停止")).not.toBeInTheDocument();
      // アラームタイムが02:50と表示されている
      // expect(screen.getByTestId("timer-text")).toHaveTextContent(
      //   formatFromSecond(durationTime)
      // );
      expect(screen.getByTestId("timer-input-minutes")).toHaveValue("02");
      expect(screen.getByTestId("timer-input-seconds")).toHaveValue("50");
    });
  });

  it("設定した時間が経過するとアラーム音が鳴ること", async () => {
    // Web Audio APIのモック
    const mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn(),
      },
      type: "sine",
    };

    const mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      currentTime: 0,
      destination: {},
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.AudioContext = jest.fn(() => mockAudioContext);

    await act(async () => {
      fetchMock.mockResponseOnce("5");
      render(<Timer />);
    });

    // タイマーを開始
    const startButton = screen.getByRole("button", { name: "開始" });
    await act(async () => {
      fireEvent.click(startButton);
    });

    // 5秒経過させる
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Web Audio APIが正しく呼び出されたことを確認
    await waitFor(() => {
      expect(window.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.5);
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        440,
        0
      );
    });
  });
});

describe("Timer API", () => {
  it("Timer APIへのGetでのアクセス", async () => {
    await act(async () => {
      fetchMock.mockResponseOnce("100");
      render(<Timer />);
    });

    const { getByRole, getByTestId } = screen;
    const startButton = getByRole("button", { name: "開始" });
    // const timerText = getByTestId("timer-text");

    await waitFor(() => {
      expect(startButton).toBeInTheDocument();
      // expect(timerText).toHaveTextContent("01:40");
      expect(getByTestId("timer-input-minutes")).toHaveValue("01");
      expect(getByTestId("timer-input-seconds")).toHaveValue("40");
      expect(fetchMock.call.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/timer");
    });
  });

  it("Timer APIへのアクセス失敗のテスト", async () => {
    fetchMock.mockResponseOnce("タイマーの時間を取得できませんでした。", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    await act(async () => {
      render(<Timer />);
    });

    const { getByRole } = screen;
    const startButton = getByRole("button", { name: "開始" });

    await waitFor(() => {
      expect(startButton).toBeDisabled();
    });
  });
});
