import OriginalDatabase from "better-sqlite3"; // Import for type annotation
import { beforeEach, describe, expect, it, vi } from "vitest";

// Define mocks for 'better-sqlite3'
// This mock will replace the actual 'better-sqlite3' module when 'database.ts' imports it.

// mockExec will allow us to spy on calls to db.exec()
const mockExec = vi.fn();

// mockDbInstance is the object that our mock Database constructor will return.
// It needs to have an 'exec' method, as that's what getDb calls.
const mockDbInstance = {
  exec: mockExec,
  // Add any other methods of better-sqlite3.Database that getDb might eventually call.
};

// mockDatabaseConstructor is our mock for the 'new Database()' constructor.
// It's a Jest mock function that, when called, returns our mockDbInstance.
const mockDatabaseConstructor = vi.fn().mockReturnValue(mockDbInstance);

// Apply the mock for the 'better-sqlite3' module.
// The factory function must return the mock constructor.
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
    const expectedSql = `
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      )
    `;
    expect(mockExec).toHaveBeenCalledWith(expectedSql);

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
