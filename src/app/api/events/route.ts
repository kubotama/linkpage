import eventEmitter from "../../../lib/event-emitter";

// このルートが動的に処理されるようにNext.jsに指示します
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  // ReadableStreamを使用して、サーバーからのデータをストリーミングします
  const stream = new ReadableStream({
    start(controller) {
      const onUpdate = () => {
        // クライアントにイベントを送信します
        const message = `data: ${JSON.stringify({
          type: "bookmarks-updated",
        })}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // "bookmarks-updated" イベントをリッスンします
      eventEmitter.on("bookmarks-updated", onUpdate);

      // クライアントが接続を閉じたときにリスナーを解除します
      request.signal.addEventListener("abort", () => {
        eventEmitter.off("bookmarks-updated", onUpdate);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
