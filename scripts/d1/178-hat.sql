ALTER TABLE outfits ADD COLUMN hairAccessoryId int NOT NULL DEFAULT 0;
ALTER TABLE outfits ADD COLUMN headAccessoryId INTEGER NOT NULL DEFAULT 0;

UPDATE outfits SET headAccessoryId = faceAccessoryId, faceAccessoryId = 0 WHERE faceAccessoryId IN (
  36, 319, 361, 378, 839, 1626, 1653, 1789, 1807, 1865, 1877, 1957, 2046
);

DROP TABLE IF EXISTS outfits_new;
CREATE TABLE IF NOT EXISTS outfits_new (
  id integer PRIMARY KEY AUTOINCREMENT,
  [date] DATETIME NOT NULL,
  [key] text NULL,
  link text NOT NULL,
  sizeId int NOT NULL DEFAULT 0,
  lightingId int NOT NULL DEFAULT 0,
  outfitId int NOT NULL,
  maskId int NOT NULL,
  hairId int NOT NULL,
  capeId int NOT NULL,
  shoesId int NOT NULL DEFAULT 0,
  faceAccessoryId int NOT NULL DEFAULT 0,
  necklaceId int NOT NULL DEFAULT 0,
  hairAccessoryId int NOT NULL DEFAULT 0,
  headAccessoryId INTEGER NOT NULL DEFAULT 0,
  propId int NOT NULL DEFAULT 0,
  ip text NOT NULL
);
INSERT INTO outfits_new SELECT id, [date], [key], link, sizeId, lightingId, outfitId, maskId, hairId, capeId, shoesId, faceAccessoryId, necklaceId, hairAccessoryId, headAccessoryId, propId, ip FROM outfits;
DROP TABLE outfits;
ALTER TABLE outfits_new RENAME TO outfits;

-- Indices for outfit selections.
CREATE INDEX ix_outfit ON outfits(outfitId, capeId, hairId, maskId);
CREATE INDEX ix_outfit_cape ON outfits(capeId, outfitId, hairId, maskId);
CREATE INDEX ix_outfit_hair ON outfits(hairId, outfitId, capeId, maskId);
CREATE INDEX ix_outfit_mask ON outfits(maskId, outfitId, capeId, hairId);

-- Indices for separate items.
CREATE INDEX ix_outfit_shoes ON outfits(shoesId);
CREATE INDEX ix_outfit_face ON outfits(faceAccessoryId);
CREATE INDEX ix_outfit_necklace ON outfits(necklaceId);
CREATE INDEX ix_outfit_headAccessory ON outfits(headAccessoryId);
CREATE INDEX ix_outfit_hairAccessory ON outfits(hairAccessoryId);
CREATE INDEX ix_outfit_prop ON outfits(propId);

-- Indices for submission lookups.
--CREATE INDEX ix_outfit_ip ON outfits(ip);
CREATE INDEX ix_outfit_key ON outfits([key]);

CREATE UNIQUE INDEX ix_outfit_link ON outfits(link, outfitId, maskId, hairId, capeId, shoesId, faceAccessoryId, necklaceId, hairAccessoryId, headAccessoryId, propId, sizeId, lightingId);
