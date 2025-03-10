import "@testing-library/jest-dom";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timer } from "./Timer";
import { useTimer } from "react-timer-hook";

// モック関数を作成
const mockUseTimer = useTimer as jest.Mock;
const mockPlayBeep = jest.fn();
const mockStart = jest.fn();
const mockPause = jest.fn();

jest.mock("react-timer-hook", () => ({
  useTimer: jest.fn(),
}));

describe("Timer コンポーネント", () => {
  beforeEach(() => {
    mockStart.mockClear();
    mockPause.mockClear();
    mockUseTimer.mockReturnValue({
      seconds: 0,
      minutes: 0,
      isRunning: false,
      start: mockStart,
      pause: mockPause,
      onExpire: mockPlayBeep,
    });
    mockPlayBeep.mockClear();
  });

  it("初期画面で 01:15 と開始ボタンが表示されること", () => {
    mockUseTimer.mockReturnValue({
      seconds: 15,
      minutes: 1,
      isRunning: false,
      start: mockStart,
      pause: mockPause,
      onExpire: mockPlayBeep,
    });
    render(<Timer />);
    expect(screen.getByText("01:15")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("開始ボタンをクリックするとhandleClickが呼び出されること", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Timer />);
    const startButton = getByRole("button", { name: "開始" });
    await user.click(startButton);
    expect(mockStart).toHaveBeenCalled();
  });

  it("開始ボタンをクリックすると停止ボタンが表示されること", async () => {
    const user = userEvent.setup();

    const { getByRole } = render(<Timer />);
    const startButton = getByRole("button", { name: "開始" });
    await user.click(startButton);
    expect(getByRole("button", { name: "停止" })).toBeInTheDocument();
  });

  it("停止ボタンをクリックすると開始ボタンが表示されること", () => {
    const { getByRole } = render(<Timer />);
    const startButton = getByRole("button", { name: "開始" });

    act(() => {
      userEvent.click(startButton);
      mockUseTimer.mockReturnValue({
        seconds: 30,
        minutes: 2,
        isRunning: true,
        start: mockStart,
        pause: mockPause,
        onExpire: mockPlayBeep,
      });
    });

    const stopButton = getByRole("button", { name: "停止" });

    act(() => {
      userEvent.click(stopButton);
      mockUseTimer.mockReturnValue({
        seconds: 30,
        minutes: 2,
        isRunning: false,
        start: mockStart,
        pause: mockPause,
        onExpire: mockPlayBeep,
      });
    });

    expect(getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("onExpire が呼び出されること", () => {
    render(<Timer />);
    act(() => {
      mockUseTimer.mockReturnValue({
        seconds: 0,
        minutes: 0,
        isRunning: false,
        start: mockStart,
        pause: mockPause,
        onExpire: mockPlayBeep,
      });
    });
    expect(mockPlayBeep).toHaveBeenCalled();
  });
});
