import fetchMock from "jest-fetch-mock";

import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

// fetch-mockを有効化
fetchMock.enableMocks();

global.IS_REACT_ACT_ENVIRONMENT = true;
