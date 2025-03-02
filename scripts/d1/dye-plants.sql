--DROP TABLE IF EXISTS dyePlantMarkers;
CREATE TABLE dyePlantMarkers (
  [id] integer PRIMARY KEY AUTOINCREMENT,
  [userId] char(20) NOT NULL,
  [username] varchar(32) NOT NULL,
  [lat] REAL NOT NULL,
  [lng] REAL NOT NULL,
  [createdOn] DATETIME NOT NULL,
  [deleted] BOOLEAN NOT NULL DEFAULT 0,
  [deletedOn] DATETIME,
  [deletedBy] char(20)
);

--DROP TABLE IF EXISTS dyePlants;
CREATE TABLE dyePlants (
  [id] integer PRIMARY KEY AUTOINCREMENT,
  [userId] char(20) NOT NULL,
  [username] varchar(32) NOT NULL,
  [epoch] int NOT NULL,
  [markerId] int NOT NULL,
  [size] int NULL,
  [roots] int NULL,
  [red] int NULL,
  [yellow] int NULL,
  [green] int NULL,
  [cyan] int NULL,
  [blue] int NULL,
  [purple] int NULL,
  [black] int NULL,
  [white] int NULL,
  [createdOn] DATETIME NOT NULL,
  [deleted] BOOLEAN NOT NULL DEFAULT 0,
  [deletedOn] DATETIME,
  [deletedBy] char(20)
);

CREATE INDEX idx_dyePlantMarkers_deleted ON dyePlantMarkers (deleted);
CREATE INDEX idx_dyePlants_markerId_deleted_epoch ON dyePlants (markerId, deleted, epoch);
