import { EventEmitter } from "events";

// アプリケーション全体で共有されるEventEmitterインスタンス
const eventEmitter = new EventEmitter();

export default eventEmitter;
