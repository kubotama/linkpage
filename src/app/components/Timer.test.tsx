import "@testing-library/jest-dom";

import React, { act } from "react";

import { fireEvent, render, waitFor } from "@testing-library/react";

import { Timer } from "./Timer";

describe("Timer コンポーネント", () => {
  it("初期画面で 01:15 と開始ボタンが表示されること", () => {
    const { getByRole, getByText } = render(<Timer durationTime={75} />);
    expect(getByText("01:15")).toBeInTheDocument();
    expect(getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("開始ボタンをクリックすると停止ボタンが表示されること", async () => {
    const { getByRole, queryByText } = render(<Timer durationTime={150} />);

    // 開始ボタンをクリックする(=開始ボタンが表示されている)
    const startButton = getByRole("button", { name: "開始" });
    await act(async () => {
      fireEvent.click(startButton);
    });

    await waitFor(() => {
      // 停止ボタンが表示されている
      expect(getByRole("button", { name: "停止" })).toBeInTheDocument();
      // 開始ボタンは表示されていない
      expect(queryByText("開始")).not.toBeInTheDocument();
    });
  });

  it("停止ボタンをクリックすると開始ボタンが表示されること", async () => {
    const { getByRole, queryByText } = render(<Timer durationTime={170} />);

    // 開始ボタンをクリックする(=開始ボタンが表示されている)
    const startButton = getByRole("button", { name: "開始" });
    await act(async () => {
      fireEvent.click(startButton);
    });
    jest.advanceTimersByTime(30000); // 30秒進める

    // 停止ボタンをクリックする(=停止ボタンが表示されている)
    const stopButton = getByRole("button", { name: "停止" });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    await waitFor(() => {
      // 開始ボタンが表示されている
      expect(getByRole("button", { name: "開始" })).toBeInTheDocument();
      // 停止ボタンは表示されていない
      expect(queryByText("停止")).not.toBeInTheDocument();
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

    // 5秒のタイマーをセット
    const { getByRole } = render(<Timer durationTime={5} />);

    // タイマーを開始
    const startButton = getByRole("button", { name: "開始" });
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
