import { beforeEach, describe, expect, it, vi } from "vitest";

import { HTTP_STATUS_OK } from "../../../app/constants/httpStatusCodes";
import eventEmitter from "../../../lib/event-emitter";
import { dynamic, GET } from "./route";

// Mock the event emitter to control its behavior in tests
vi.mock("../../../lib/event-emitter", () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(), // Not used in SUT, but good practice to include
  },
}));

describe("SSE /api/events", () => {
  beforeEach(() => {
    // Clear mocks before each test to ensure isolation
    vi.clearAllMocks();
  });

  it("should export 'force-dynamic' to ensure dynamic handling", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("should return a response with correct SSE headers", async () => {
    const request = new Request("http://localhost/api/events");
    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS_OK);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.headers.get("Connection")).toBe("keep-alive");
    expect(response.body).toBeInstanceOf(ReadableStream);
  });

  it("should send an event when 'bookmarks-updated' is emitted", async () => {
    const request = new Request("http://localhost/api/events");
    const response = await GET(request);
    const stream = response.body;

    expect(stream).not.toBeNull();

    // The `start` function of the ReadableStream is called, which sets up the listener.
    // We can capture the handler function passed to `eventEmitter.on`.
    const onUpdateHandler = vi.mocked(eventEmitter.on).mock.calls[0][1];
    expect(vi.mocked(eventEmitter.on)).toHaveBeenCalledWith(
      "bookmarks-updated",
      expect.any(Function)
    );

    // Simulate an event emission by calling the captured handler
    onUpdateHandler();

    // Read the emitted data from the stream
    const reader = stream!.getReader();
    const { value } = await reader.read();

    const decodedValue = new TextDecoder().decode(value);
    expect(decodedValue).toBe('data: {"type":"bookmarks-updated"}\n\n');

    // Clean up the stream to avoid open handles
    await reader.cancel();
  });

  it("should remove the event listener and close the stream when the client aborts", async () => {
    const abortController = new AbortController();
    const request = new Request("http://localhost/api/events", {
      signal: abortController.signal,
    });

    const response = await GET(request);
    const onUpdateHandler = vi.mocked(eventEmitter.on).mock.calls[0][1];

    abortController.abort();

    expect(vi.mocked(eventEmitter.off)).toHaveBeenCalledWith("bookmarks-updated", onUpdateHandler);

    const reader = response.body!.getReader();
    const result = await reader.read();
    expect(result.done).toBe(true);
  });
});
