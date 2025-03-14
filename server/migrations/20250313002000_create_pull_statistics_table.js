export default {
  up(db) {
    db.exec(`
      CREATE TABLE pull_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id INTEGER NOT NULL,
        count INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );

      CREATE INDEX idx_pull_statistics_repository_id ON pull_statistics(repository_id);
      CREATE INDEX idx_pull_statistics_created_at ON pull_statistics(created_at);
      CREATE INDEX idx_pull_statistics_repo_time ON pull_statistics(repository_id, created_at);
    `)
  },

  down(db) {
    db.exec(`
      DROP INDEX IF EXISTS idx_pull_statistics_repo_time;
      DROP INDEX IF EXISTS idx_pull_statistics_created_at;
      DROP INDEX IF EXISTS idx_pull_statistics_repository_id;
      DROP TABLE IF EXISTS pull_statistics;
    `)
  },
}
