import { describe, expect, it, vi } from "vitest";

import { fireEvent } from "@testing-library/dom";
import { renderHook } from "@testing-library/react";

import { useKeyHandler } from "./useKeyHandler";

describe("useKeyHandler", () => {
  it("should call the correct handler when a key is pressed", () => {
    const enterHandler = vi.fn();
    const escapeHandler = vi.fn();
    const keyHandlerMap = {
      Enter: enterHandler,
      Escape: escapeHandler,
    };

    renderHook(() => useKeyHandler(keyHandlerMap));

    fireEvent.keyDown(window, { key: "Enter" });
    expect(enterHandler).toHaveBeenCalledTimes(1);
    expect(escapeHandler).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(escapeHandler).toHaveBeenCalledTimes(1);
  });

  it("should not call any handler for an unmapped key", () => {
    const enterHandler = vi.fn();
    const keyHandlerMap = {
      Enter: enterHandler,
    };

    renderHook(() => useKeyHandler(keyHandlerMap));

    fireEvent.keyDown(window, { key: "a" });
    expect(enterHandler).not.toHaveBeenCalled();
  });

  it("should prevent default and stop propagation if handler returns false", () => {
    const handler = vi.fn(() => false);
    const keyHandlerMap = {
      " ": handler,
    };
    renderHook(() => useKeyHandler(keyHandlerMap));

    const event = new KeyboardEvent("keydown", { key: " " });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");

    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
  });

  it("should not prevent default or stop propagation if handler does not return false", () => {
    const handler = vi.fn(() => undefined); // or returns true or void
    const keyHandlerMap = {
      Tab: handler,
    };
    renderHook(() => useKeyHandler(keyHandlerMap));

    const event = new KeyboardEvent("keydown", { key: "Tab" });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");

    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(stopPropagationSpy).not.toHaveBeenCalled();
  });

  it("should add and remove event listener on mount and unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useKeyHandler({}));

    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
