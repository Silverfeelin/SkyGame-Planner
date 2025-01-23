
--DROP TABLE IF EXISTS dyePlantMarkers;
CREATE TABLE IF NOT EXISTS dyePlantMarkers (
  [id] integer PRIMARY KEY AUTOINCREMENT,
  [userId] int NOT NULL,
  [lat] REAL NOT NULL,
  [lng] REAL NOT NULL,
  [date] DATETIME NOT NULL
);

--DROP TABLE IF EXISTS dyePlants;
CREATE TABLE IF NOT EXISTS dyePlants (
  [id] integer PRIMARY KEY AUTOINCREMENT,
  [userId] int NOT NULL,
  [epoch] int NOT NULL,
  [markerId] int NOT NULL,
  [date] DATETIME NOT NULL
);

CREATE INDEX idx_dyePlants_markerId_epoch ON dyePlants (markerId, epoch);
