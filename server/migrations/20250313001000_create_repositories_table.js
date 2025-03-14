export default {
  up(db) {
    db.exec(`
      CREATE TABLE repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        namespace TEXT NOT NULL,
        repository TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        UNIQUE(namespace, repository)
      );

      CREATE INDEX idx_repositories_name ON repositories(name);
    `)
  },

  down(db) {
    db.exec(`
      DROP INDEX IF EXISTS idx_repositories_name;
      DROP TABLE IF EXISTS repositories;
    `)
  },
}
