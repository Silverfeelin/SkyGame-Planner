export interface IOutfitRequestBackground {
  guid: string;
  url: string;
  default?: boolean;

  // References
  section?: IOutfitRequestBackgrounds;
}

export interface IOutfitRequestBackgrounds {
  guid: string;
  label: string;
  info?: string;
  attribution?: string;

  // References
  backgrounds: Array<IOutfitRequestBackground>;
}

export interface IOutfitRequestConfig {
  backgrounds: { [key: string]: IOutfitRequestBackgrounds };
}
