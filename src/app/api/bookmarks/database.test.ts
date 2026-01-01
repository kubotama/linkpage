import OriginalDatabase from "better-sqlite3"; // Import for type annotation
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DB_SCHEMA } from "./schema";

// Define mocks for 'better-sqlite3'
// Use vi.hoisted to ensure these are initialized before vi.mock is called
const { mockDatabaseConstructor, mockExec, mockDbInstance } = vi.hoisted(() => {
  const mockExec = vi.fn();
  const mockDbInstance = {
    exec: mockExec,
  };
  // Use a standard function so it can be called with 'new'
  const mockDatabaseConstructor = vi.fn(function () {
    return mockDbInstance;
  });

  return { mockDatabaseConstructor, mockExec, mockDbInstance };
});

// Apply the mock for the 'better-sqlite3' module.
vi.mock("better-sqlite3", () => ({
  default: mockDatabaseConstructor,
}));

describe("Database Module - getDb", () => {
  // This will hold the getDb function from the module under test.
  // We need to re-require it for each test after resetting modules to get a fresh state.
  let getDb: () => OriginalDatabase.Database;

  beforeEach(async () => {
    // Reset all modules in the Jest cache. This is crucial for testing modules
    // with internal state (like the 'db' variable in database.ts) because it ensures
    // the module is re-initialized from scratch for each test.
    vi.resetModules();

    // Dynamically import the module under test AFTER resetting modules.
    // This ensures we get a fresh version of the module, where its internal 'db'
    // variable will be null again.
    const databaseModule = await import("./database");
    getDb = databaseModule.getDb;

    // Clear any previous calls to our mocks to ensure a clean state for each test.
    mockDatabaseConstructor.mockClear();
    mockExec.mockClear();
  });

  it("should initialize the database on the first call", () => {
    const dbInstance = getDb();

    // Verify that the Database constructor was called once.
    expect(mockDatabaseConstructor).toHaveBeenCalledTimes(1);
    // Verify that the constructor was called with the correct database file path.
    expect(mockDatabaseConstructor).toHaveBeenCalledWith("./bookmarks.sqlite");

    // Verify that the 'exec' method was called once on the database instance.
    expect(mockExec).toHaveBeenCalledTimes(1);

    // Verify that 'exec' was called with the correct SQL schema initialization query.
    // The SQL string includes specific newlines and indentation from the template literal in database.ts.
    expect(mockExec).toHaveBeenCalledWith(DB_SCHEMA);

    // Verify that getDb returned the instance created by our mock constructor.
    expect(dbInstance).toBe(mockDbInstance);
  });

  it("should return the same database instance on subsequent calls and not re-initialize", () => {
    // First call to getDb: should initialize the database.
    const dbInstance1 = getDb();
    expect(mockDatabaseConstructor).toHaveBeenCalledTimes(1); // Initial call
    expect(mockExec).toHaveBeenCalledTimes(1); // Initial call

    // Second call to getDb: should return the existing instance.
    const dbInstance2 = getDb();

    // Verify that the constructor and exec were NOT called again.
    expect(mockDatabaseConstructor).toHaveBeenCalledTimes(1); // Still 1, not 2
    expect(mockExec).toHaveBeenCalledTimes(1); // Still 1, not 2

    // Verify that both calls returned the exact same instance.
    expect(dbInstance2).toBe(dbInstance1);
    expect(dbInstance2).toBe(mockDbInstance); // And it's our mocked instance
  });
});
