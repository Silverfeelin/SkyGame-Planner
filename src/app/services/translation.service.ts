import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'vi';

interface Translations {
  SETTINGS: {
    TITLE: string;
    LANGUAGE: {
      TITLE: string;
      DESCRIPTION: string;
      AUTO: string;
      EN: string;
      VI: string;
    };
    STORAGE: {
      TITLE: string;
      DESCRIPTION: string;
      BUTTON_STORAGE: string;
      BUTTON_IMPORT: string;
      BUTTON_EXPORT: string;
      BUTTON_CLEAR: string;
    };
    PWA: {
      TITLE: string;
      DESCRIPTION: string;
      BUTTON_INSTALL: string;
    };
    DAILY_CANDLES: {
      TITLE: string;
      DESCRIPTION: string;
      LABEL: string;
    };
    SPIRIT_TREES: {
      TITLE: string;
      CONNECTED_ON: string;
      CONNECTED_OFF: string;
      BUTTON_UNLOCK_CONNECTED: string;
    };
    ITEMS: {
      TITLE: string;
      DESCRIPTION: string;
      BUTTON_SIDE_PANEL: string;
    };
    DATE: {
      TITLE: string;
      DESCRIPTION: string;
    };
    TIME: {
      TITLE: string;
      DESCRIPTION: string;
      HOUR_24: string;
      HOUR_12: string;
    };
    THEME: {
      TITLE: string;
      ADVANCED: string;
      ADVANCED_DESC: string;
      BACKGROUND_IMAGE: string;
      VIGNETTE: string;
      DENSITY: string;
      FONT_SIZE: string;
      MENU_POSITION: string;
      BUTTON_RESET: string;
      NAMES: Record<string, string>;
      SLIDERS: Record<string, string>;
      BG_IMAGES: Record<string, string>;
      DENSITY_PRESETS: Record<string, string>;
      FONT_SIZE_PRESETS: Record<string, string>;
      MENU_PRESETS: Record<string, string>;
    };
    NAV: {
      TITLE: string;
      WIKI_NEW_TAB: string;
    };
    SHORTCUTS: {
      TITLE: string;
      DESCRIPTION: string;
      BUTTON_VIEW: string;
    };
    DEBUG: {
      TITLE: string;
      BUTTON_SHOW_GUIDS: string;
      BUTTON_COPY_COORDS: string;
      DESCRIPTION: string;
      COPY_COORDS_DESC: string;
    };
  };
  NAV: {
    DAILY: string;
    CR_TRACKER: string;
    PNR_TRACKER: string;
    CURRENCY: string;
    SPENT_CURRENCY: string;
    ITEMS: string;
    ITEM_GRID: string;
    ITEM_TABLE: string;
    ITEM_PREVIEWS: string;
    DYE_PREVIEWS: string;
    COLLECTIONS: string;
    SPIRITS: string;
    ALL_SPIRITS: string;
    REGULAR_SPIRITS: string;
    ELDER_SPIRITS: string;
    SEASON_SPIRITS: string;
    SEASON_GUIDES: string;
    TRAVELING_SPIRITS: string;
    SPECIAL_VISITS: string;
    WINGED_LIGHT: string;
    REALMS: string;
    SEASONS: string;
    EVENTS: string;
    SHOPS: string;
    FRIENDS: string;
    TOOLS: string;
    SETTINGS: string;
    HOME: string;
    QUICK_START: string;
    CLOSET: string;
    OUTOUTFIT_REQUEST: string;
    INFO: string;
    PRIVACY: string;
    NEWS: string;
    DESIGN_FEEDBACK: string;
    COLLAGE: string;
    AREAS: string;
    SHARED_CREATIONS: string;
    HISTORY: string;
    CALCULATOR: string;
    SHOP_EVENT: string;
    SHOP_CINEMA: string;
    SHOP_CONCERT_HALL: string;
    SHOP_HARMONY_HALL: string;
    SHOP_LOYALTY: string;
    SHOP_NESTING: string;
    SHOP_OFFICE: string;
    SHOP_PRAIRIE: string;
    SHOP_WONDERLAND: string;
  };
  COMMON: {
    SAVE: string;
    CANCEL: string;
    DELETE: string;
    EDIT: string;
    CLOSE: string;
    SEARCH: string;
    LOADING: string;
    CONFIRM: string;
  };
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _currentLanguage = signal<Language>('en');
  readonly currentLanguage = this._currentLanguage;

  private _translations: Record<Language, Translations> = {
    en: {
      SETTINGS: {
        TITLE: "Settings",
        LANGUAGE: {
          TITLE: "Language",
          DESCRIPTION: "Select your preferred language. Automatic detection uses your browser language or timezone.",
          AUTO: "Auto (System/Timezone)",
          EN: "English",
          VI: "Tiếng Việt"
        },
        STORAGE: {
          TITLE: "Storage",
          DESCRIPTION: "Your data is currently stored in <strong>{{provider}}</strong>. To change the storage location, visit the <a class=\"atmos-text-link\" href=\"/storage\">Storage page</a>. If you want to transfer your data, export it first, then switch storage and import it back.",
          BUTTON_STORAGE: "Storage",
          BUTTON_IMPORT: "Import",
          BUTTON_EXPORT: "Export",
          BUTTON_CLEAR: "Clear"
        },
        PWA: {
          TITLE: "App",
          DESCRIPTION: "Sky Planner can be installed as a PWA (Progressive Web App) on supported browsers, making it easier to access than a bookmark.",
          BUTTON_INSTALL: "Install"
        },
        DAILY_CANDLES: {
          TITLE: "Daily candles",
          DESCRIPTION: "Enter a number to add regular candles to your Currency page when you complete your (season) daily quests on the Dashboard or Daily tracker. Set to 0 to disable.",
          LABEL: "Candles per daily check-in"
        },
        SPIRIT_TREES: {
          TITLE: "Spirit trees",
          CONNECTED_ON: "All items leading up to the one you unlock will also be unlocked. Likewise, locking an item will lock the ones beyond it.",
          CONNECTED_OFF: "When you unlock an item only that item will be unlocked. You can choose to also unlock all preceding items.",
          BUTTON_UNLOCK_CONNECTED: "Unlock connected items"
        },
        ITEMS: {
          TITLE: "Items",
          DESCRIPTION: "The Items page shows item details in a panel beside the list. Clicking an item shows it there instead of opening the item page. Only available on screens at least 1280 pixels wide.",
          BUTTON_SIDE_PANEL: "Show item details in a side panel"
        },
        DATE: {
          TITLE: "Date",
          DESCRIPTION: "Change the date format. Today is {{date}}."
        },
        TIME: {
          TITLE: "Time",
          DESCRIPTION: "Change the time format. It's now {{time}}.",
          HOUR_24: "24-hour",
          HOUR_12: "12-hour (AM/PM)"
        },
        THEME: {
          TITLE: "Theme",
          ADVANCED: "Advanced",
          ADVANCED_DESC: "Tweaks apply on top of the selected theme. Sliders you haven't moved follow the theme.",
          BACKGROUND_IMAGE: "Background image",
          VIGNETTE: "Vignette",
          DENSITY: "Density",
          FONT_SIZE: "Font size",
          MENU_POSITION: "Menu position",
          BUTTON_RESET: "Reset all tweaks",
          NAMES: {
            '': "Default",
            'cozy': "Aviary Village",
            'peaks': "Prairie Peaks",
            'reef': "Treasure Reef",
            'cold': "Village of Dreams",
            'pearl': "Pearl Village",
            'sandy': "Crescent Oasis",
            'love': "Days of Love",
            'moomin': "Moomin",
            'wonderland': "Wonderland",
            'gogh': "Van Gogh",
            'dark': "Void",
            'surprise': "Surprise"
          },
          SLIDERS: {
            'hue': "Hue",
            'chroma': "Saturation",
            'surface': "Surface tone",
            'bgBrightness': "Background brightness",
            'bgBlur': "Background blur"
          },
          BG_IMAGES: {
            '': "Theme default",
            'none': "None",
            'isle': "Isle of Dawn",
            'aviary': "Aviary Village",
            'prairie': "Daylight Prairie",
            'peaks': "Prairie Peaks",
            'peaks2': "Prairie Peaks (dusk)",
            'forest': "Hidden Forest",
            'reef': "Treasure Reef",
            'village': "Village of Dreams",
            'concert_hall': "Concert Hall",
            'wasteland': "Golden Wasteland",
            'wasteland2': "Golden Wasteland (shipwreck)",
            'oasis': "Crescent Oasis",
            'pearl': "Pearl Village",
            'vault': "Vault of Knowledge",
            'aurora': "Aurora",
            'nesting': "Nesting Workshop",
            'trials': "Trials",
            'void_jelly': "Void",
            'bloom2024': "Days of Bloom",
            'color2024': "Days of Color",
            'feast2023': "Days of Feast 2023",
            'feast2024': "Days of Feast 2024",
            'fortune2024': "Days of Fortune",
            'love2024': "Days of Love",
            'firework': "Fireworks",
            'moomin': "Moomin",
            'gogh': "Van Gogh"
          },
          DENSITY_PRESETS: {
            '': "Comfortable",
            'compact': "Compact"
          },
          FONT_SIZE_PRESETS: {
            '': "Default",
            'large': "Large",
            'larger': "Larger"
          },
          MENU_PRESETS: {
            '': "Automatic",
            'desktop': "Always sidebar"
          }
        },
        NAV: {
          TITLE: "Navigation",
          WIKI_NEW_TAB: "Open Wiki links in a new tab"
        },
        SHORTCUTS: {
          TITLE: "Shortcuts",
          DESCRIPTION: "Show quick keyboard shortcuts for fast navigation and search.",
          BUTTON_VIEW: "View shortcuts"
        },
        DEBUG: {
          TITLE: "Debug & Dev",
          BUTTON_SHOW_GUIDS: "Show GUIDs",
          BUTTON_COPY_COORDS: "Copy coordinates when map click",
          DESCRIPTION: "Adds debugging information to various pages. Only relevant if you actively contribute to the project.",
          COPY_COORDS_DESC: "When enabled, clicking anywhere on a map copies the clicked <code class=\"atmos-code\">[lat, lng]</code> position to your clipboard."
        }
      },
      NAV: {
        DAILY: "Daily",
        CR_TRACKER: "Candle Run Tracker",
        PNR_TRACKER: "Eden Statue Tracker",
        CURRENCY: "Currencies",
        SPENT_CURRENCY: "Spent currencies",
        ITEMS: "Items",
        ITEM_GRID: "Item grid",
        ITEM_TABLE: "Item table",
        ITEM_PREVIEWS: "Item previews",
        DYE_PREVIEWS: "Dye previews",
        COLLECTIONS: "Collections",
        SPIRITS: "Spirits",
        ALL_SPIRITS: "All spirits",
        REGULAR_SPIRITS: "Regular spirits",
        ELDER_SPIRITS: "Elder spirits",
        SEASON_SPIRITS: "Season spirits",
        SEASON_GUIDES: "Season guides",
        TRAVELING_SPIRITS: "Traveling spirits",
        SPECIAL_VISITS: "Special visits",
        WINGED_LIGHT: "Winged Light",
        REALMS: "Realms",
        SEASONS: "Seasons",
        EVENTS: "Events",
        SHOPS: "Shops",
        FRIENDS: "Friends",
        TOOLS: "Tools",
        SETTINGS: "Settings",
        HOME: "Home",
        QUICK_START: "Quick start",
        CLOSET: "Sky closet",
        OUTOUTFIT_REQUEST: "Create request",
        INFO: "Info",
        PRIVACY: "Privacy Policy",
        NEWS: "What's new",
        DESIGN_FEEDBACK: "Design feedback",
        COLLAGE: "Collage",
        AREAS: "Areas",
        SHARED_CREATIONS: "Shared Creations",
        HISTORY: "History",
        CALCULATOR: "Calculator",
        SHOP_EVENT: "Event Store",
        SHOP_CINEMA: "Cinema",
        SHOP_CONCERT_HALL: "Concert Hall",
        SHOP_HARMONY_HALL: "Harmony Hall",
        SHOP_LOYALTY: "Loyalty Store",
        SHOP_NESTING: "Nesting Workshop",
        SHOP_OFFICE: "Secret Area",
        SHOP_PRAIRIE: "Prairie Heights",
        SHOP_WONDERLAND: "Wonderland Café"
      },
      COMMON: {
        SAVE: "Save",
        CANCEL: "Cancel",
        DELETE: "Delete",
        EDIT: "Edit",
        CLOSE: "Close",
        SEARCH: "Search...",
        LOADING: "Loading...",
        CONFIRM: "Are you sure?"
      }
    },
    vi: {
      SETTINGS: {
        TITLE: "Cài đặt",
        LANGUAGE: {
          TITLE: "Ngôn ngữ",
          DESCRIPTION: "Chọn ngôn ngữ hiển thị. Tự động nhận diện sử dụng ngôn ngữ trình duyệt hoặc múi giờ của bạn.",
          AUTO: "Tự động (Hệ thống/Múi giờ)",
          EN: "English",
          VI: "Tiếng Việt"
        },
        STORAGE: {
          TITLE: "Lưu trữ dữ liệu",
          DESCRIPTION: "Dữ liệu của bạn hiện được lưu tại <strong>{{provider}}</strong>. Để thay đổi vị trí lưu trữ, hãy truy cập <a class=\"atmos-text-link\" href=\"/storage\">Trang lưu trữ</a>. Nếu muốn chuyển dữ liệu, hãy xuất file trước, sau đó chuyển bộ nhớ và nhập lại.",
          BUTTON_STORAGE: "Lưu trữ",
          BUTTON_IMPORT: "Nhập",
          BUTTON_EXPORT: "Xuất",
          BUTTON_CLEAR: "Xóa"
        },
        PWA: {
          TITLE: "Ứng dụng (PWA)",
          DESCRIPTION: "Sky Planner có thể được cài đặt như một ứng dụng web (PWA) trên các trình duyệt hỗ trợ, giúp truy cập nhanh chóng hơn.",
          BUTTON_INSTALL: "Cài đặt"
        },
        DAILY_CANDLES: {
          TITLE: "Nến hàng ngày",
          DESCRIPTION: "Nhập số lượng nến thường được thêm vào trang Tiền tệ khi bạn hoàn thành nhiệm vụ hàng ngày (mùa) trên Bảng điều khiển hoặc Trình theo dõi hàng ngày. Đặt bằng 0 để tắt.",
          LABEL: "Số nến mỗi lần điểm danh hàng ngày"
        },
        SPIRIT_TREES: {
          TITLE: "Cây tổ tiên (Spirit Trees)",
          CONNECTED_ON: "Tất cả vật phẩm dẫn đến vật phẩm bạn mở khóa cũng sẽ được mở khóa. Tương tự, khóa một vật phẩm sẽ khóa các vật phẩm phía sau nó.",
          CONNECTED_OFF: "Khi bạn mở khóa một vật phẩm, chỉ vật phẩm đó được mở khóa. Bạn có thể chọn mở khóa đồng thời tất cả các vật phẩm trước đó.",
          BUTTON_UNLOCK_CONNECTED: "Mở khóa vật phẩm liên kết"
        },
        ITEMS: {
          TITLE: "Vật phẩm",
          DESCRIPTION: "Trang Vật phẩm hiển thị chi tiết vật phẩm ở khung bên cạnh danh sách. Nhấp vào vật phẩm sẽ hiển thị tại đó thay vì mở trang vật phẩm riêng. Chỉ khả dụng trên màn hình rộng ít nhất 1280 pixel.",
          BUTTON_SIDE_PANEL: "Hiển thị chi tiết vật phẩm ở khung bên"
        },
        DATE: {
          TITLE: "Ngày tháng",
          DESCRIPTION: "Thay đổi định dạng ngày tháng. Hôm nay là {{date}}."
        },
        TIME: {
          TITLE: "Thời gian",
          DESCRIPTION: "Thay đổi định dạng thời gian. Hiện tại là {{time}}.",
          HOUR_24: "24 giờ",
          HOUR_12: "12 giờ (AM/PM)"
        },
        THEME: {
          TITLE: "Giao diện",
          ADVANCED: "Nâng cao",
          ADVANCED_DESC: "Các tùy chỉnh áp dụng đè lên giao diện đã chọn. Các thanh trượt chưa thay đổi sẽ tuân theo giao diện.",
          BACKGROUND_IMAGE: "Ảnh nền",
          VIGNETTE: "Hiệu ứng tối viền (Vignette)",
          DENSITY: "Độ dày (Density)",
          FONT_SIZE: "Cỡ chữ",
          MENU_POSITION: "Vị trí menu",
          BUTTON_RESET: "Đặt lại tất cả tùy chỉnh",
          NAMES: {
            '': "Default",
            'cozy': "Thành phố chim bồ câu",
            'peaks': "Đồi Prairie",
            'reef': "Hòn đảo kho báu",
            'cold': "Thành phố mộng mơ",
            'pearl': "Thị trấn Ngọc trai",
            'sandy': "Khe Nước Trong",
            'love': "Những ngày Yêu đời",
            'moomin': "Moomin",
            'wonderland': "Căn nhà Wonder",
            'gogh': "Người họa sĩ Van Gogh",
            'dark': "Vực",
            'surprise': "Sự bất ngờ"
          },
          SLIDERS: {
            'hue': "Màu sắc",
            'chroma': "Độ bão hòa",
            'surface': "Màu vùng nền",
            'bgBrightness': "Sáng màn hình nền",
            'bgBlur': "Độ mờ nền"
          },
          BG_IMAGES: {
            '': "Mặc định của chủ đề",
            'none': "Không có",
            'isle': "Quần đảo Islet of Dawn",
            'aviary': "Thành phố chim bồ câu",
            'prairie': "Prairie Dài",
            'peaks': "Prairie Tới cao",
            'peaks2': "Praire Peaks (chiều tối)",
            'forest': "Rừng ẩn",
            'reef': "Hòn đảo Kho báu",
            'village': "Thành phố Mộng",
            'concert_hall': "Sảnh Hòa tấu",
            'wasteland': "Vùng đất Vàng",
            'wasteland2': "Vùng đất Vàng (đắm tàu)",
            'oasis': "Khe Nước Trong",
            'pearl': "Thị trấn Ngọc trai",
            'vault': "Hầm Báu",
            'aurora': "Xứ Mây",
            'nesting': "Nhà bếp Nội bộ",
            'trials': "Thử thách",
            'void_jelly': "Vực",
            'bloom2024': "Những ngày Huỳnh hoa",
            'color2024': "Những ngày Hoa lệ",
            'feast2023': "Những ngày Tốt nghiệp 2023",
            'feast2024': "Những ngày Tốt nghiệp 2024",
            'fortune2024': "Những ngày May mắn",
            'love2024': "Những ngày Yêu",
            'firework': "Lễ hội Lửa",
            'moomin': "Moomin",
            'gogh': "Van Gogh"
          },
          DENSITY_PRESETS: {
            '': "Chân thật",
            'compact': "Tiện lợi"
          },
          FONT_SIZE_PRESETS: {
            '': "Mặc định",
            'large': "Cỡ lớn",
            'larger': "Cỡ rộng hơn"
          },
          MENU_PRESETS: {
            '': "Tự động",
            'desktop': "Luộc với thanh bên luôn"
          }
        },
        NAV: {
          TITLE: "Điều hướng",
          WIKI_NEW_TAB: "Mở liên kết Wiki trong tab mới"
        },
        SHORTCUTS: {
          TITLE: "Phím tắt",
          DESCRIPTION: "Xem các phím tắt nhanh để điều hướng và tìm kiếm dễ dàng.",
          BUTTON_VIEW: "Xem phím tắt"
        },
        DEBUG: {
          TITLE: "Gỡ lỗi & Phát triển",
          BUTTON_SHOW_GUIDS: "Hiển thị GUID",
          BUTTON_COPY_COORDS: "Sao chép tọa độ khi nhấp vào bản đồ",
          DESCRIPTION: "Thêm thông tin gỡ lỗi vào nhiều trang. Chỉ cần thiết nếu bạn tích cực đóng góp cho dự án.",
          COPY_COORDS_DESC: "Khi được bật, nhấp vào bất kỳ đâu trên bản đồ sẽ sao chép vị trí <code class=\"atmos-code\">[lat, lng]</code> vào bảng nhớ tạm."
        }
      },
      NAV: {
        DAILY: "Hàng ngày",
        CR_TRACKER: "Theo dõi chạy nến",
        PNR_TRACKER: "Theo dõi tượng Eden",
        CURRENCY: "Tiền tệ",
        SPENT_CURRENCY: "Tiền tệ đã tiêu",
        ITEMS: "Vật phẩm",
        ITEM_GRID: "Lưới vật phẩm",
        ITEM_TABLE: "Bảng vật phẩm",
        ITEM_PREVIEWS: "Xem trước vật phẩm",
        DYE_PREVIEWS: "Xem trước thuốc nhuộm",
        COLLECTIONS: "Bộ sưu tập",
        SPIRITS: "Tổ tiên",
        ALL_SPIRITS: "Tất cả tổ tiên",
        REGULAR_SPIRITS: "Tổ tiên thường",
        ELDER_SPIRITS: "Tổ tiên trưởng lão",
        SEASON_SPIRITS: "Tổ tiên mùa",
        SEASON_GUIDES: "Hướng dẫn mùa",
        TRAVELING_SPIRITS: "Tổ tiên du mục (TS)",
        SPECIAL_VISITS: "Chuyến thăm đặc biệt",
        WINGED_LIGHT: "Ánh sáng có cánh (WL)",
        REALMS: "Vương quốc",
        SEASONS: "Các mùa",
        EVENTS: "Sự kiện",
        SHOPS: "Cửa hàng",
        FRIENDS: "Bạn bè",
        TOOLS: "Công cụ",
        SETTINGS: "Cài đặt",
        HOME: "Trang chủ",
        QUICK_START: "Mở khóa nhanh",
        CLOSET: "Tủ đồ Sky",
        OUTOUTFIT_REQUEST: "Tạo yêu cầu",
        INFO: "Thông tin",
        PRIVACY: "Chính sách bảo mật",
        NEWS: "Có gì mới",
        DESIGN_FEEDBACK: "Góp ý thiết kế",
        COLLAGE: "Collage",
        AREAS: "Khu vực",
        SHARED_CREATIONS: "Tác phẩm chung",
        HISTORY: "Lịch sử",
        CALCULATOR: "Máy tính",
        SHOP_EVENT: "Cửa hàng sự kiện",
        SHOP_CINEMA: "Rạp chiếu phim",
        SHOP_CONCERT_HALL: "Phòng hòa nhạc",
        SHOP_HARMONY_HALL: "Phòng giao hưởng",
        SHOP_LOYALTY: "Cửa hàng Loyalty",
        SHOP_NESTING: "Xưởng Nesting",
        SHOP_OFFICE: "Khu vực bí mật",
        SHOP_PRAIRIE: "Đồng cỏ cao",
        SHOP_WONDERLAND: "Café Wonderland"
      },
      COMMON: {
        SAVE: "Lưu",
        CANCEL: "Hủy",
        DELETE: "Xóa",
        EDIT: "Sửa",
        CLOSE: "Đóng",
        SEARCH: "Tìm kiếm...",
        LOADING: "Đang tải...",
        CONFIRM: "Bạn có chắc chắn không?"
      }
    }
  };

  constructor() {
    const savedLang = localStorage.getItem('setting.language');
    if (savedLang) {
      try {
        this._currentLanguage.set(savedLang as Language);
      } catch (e) {
        // keep default 'en'
      }
    }
  }

  setLanguage(lang: Language): void {
    this._currentLanguage.set(lang);
    localStorage.setItem('setting.language', lang);
  }

  get(key: keyof Translations): Translations[keyof Translations] {
    return this._translations[this.currentLanguage()][key];
  }

  getNested<T>(path: string): T | string {
    const parts = path.split('.');
    let current: unknown = this._translations[this.currentLanguage()];
    for (const part of parts) {
      if (typeof current === 'object' && current !== null && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return current as T;
  }
}
