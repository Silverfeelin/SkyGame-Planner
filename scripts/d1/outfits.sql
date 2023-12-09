DROP TABLE IF EXISTS outfits;
CREATE TABLE IF NOT EXISTS outfits (
  id integer PRIMARY KEY AUTOINCREMENT,
  link text NOT NULL,
  outfitId int NOT NULL,
  maskId int NOT NULL,
  hairId int NOT NULL,
  capeId int NOT NULL,
  shoesId int NULL,
  faceAccessoryId int NULL,
  necklaceId int NULL,
  hatId int NULL,
  propId int NULL
);
CREATE INDEX ix_outfit ON outfits(outfitId, maskId, hairId, capeId);
