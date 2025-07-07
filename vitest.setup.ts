import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

/**
 * EventSourceのモッククラス。
 * テスト環境ではブラウザAPIのEventSourceが利用できないため、
 * このモックで動作をシミュレートします。
 */
class MockEventSource {
  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  close: () => void = vi.fn();

  // 作成されたインスタンスを保持するための静的プロパティ
  static instances: MockEventSource[] = [];

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this); // インスタンスを配列に保存
  }

  // テストコードから擬似的にメッセージイベントを発火させるためのメソッド
  public emitMessage(data: object) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

// globalオブジェクトにモックを割り当てます
global.EventSource = MockEventSource as any;
