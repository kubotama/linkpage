// MyComponent.test.tsx
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// import MyComponent from './MyComponent';
import { BmUpdate } from "./bmUpdate";

describe("BmUpdate", () => {
  it("入力された文字列が親コンポーネントに渡されること", () => {
    const url = "https://mail.google.com/mail/";
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmUpdate onBmUpdate={onBmUpdate} />);

    const urlInput = screen.getByLabelText("url");
    const updateButton = screen.getByText("更新");

    fireEvent.change(urlInput, {
      target: { value: url },
    });
    fireEvent.click(updateButton);

    expect(onBmUpdate).toHaveBeenCalledTimes(1);
    expect(onBmUpdate).toHaveBeenCalledWith(url, "");
  });

  it("すべてのエレメントが表示される", () => {
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmUpdate onBmUpdate={onBmUpdate} />);

    expect(screen.getByLabelText("url")).toBeVisible();
    expect(screen.getByLabelText("title")).toBeInTheDocument();
    expect(screen.getByText("タイトル")).toBeInTheDocument();
    expect(screen.getByText("更新")).toBeInTheDocument();
  });
});
