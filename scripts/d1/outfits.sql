DROP TABLE IF EXISTS outfits;
CREATE TABLE IF NOT EXISTS outfits (
  id integer PRIMARY KEY AUTOINCREMENT,
  [date] DATETIME NOT NULL,
  [key] text NULL,
  link text NOT NULL,
  outfitId int NOT NULL,
  maskId int NOT NULL,
  hairId int NOT NULL,
  capeId int NOT NULL,
  shoesId int NOT NULL DEFAULT 0,
  faceAccessoryId int NOT NULL DEFAULT 0,
  necklaceId int NOT NULL DEFAULT 0,
  hatId int NOT NULL DEFAULT 0,
  propId int NOT NULL DEFAULT 0,
  ip text NOT NULL
);

-- Create indices by most common selections
CREATE INDEX ix_outfit ON outfits(outfitId, capeId, hairId, maskId);
CREATE INDEX ix_outfit_cape ON outfits(capeId, outfitId, hairId, maskId);
CREATE INDEX ix_outfit_hair ON outfits(hairId, outfitId, capeId, maskId);
CREATE INDEX ix_outfit_mask ON outfits(maskId, outfitId, capeId, hairId);
CREATE INDEX ix_outfit_ip ON outfits(ip);
CREATE INDEX ix_outfit_key ON outfits([key]);

-- Create unique constraint to prevent duplicate submissions.
CREATE UNIQUE INDEX ix_outfit_link ON outfits(link, outfitId, maskId, hairId, capeId, shoesId, faceAccessoryId, necklaceId, hatId, propId);
