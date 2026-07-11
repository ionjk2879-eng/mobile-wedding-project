declare namespace kakao.maps {
  function load(callback: () => void): void;
  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setCenter(latlng: LatLng): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Marker {
    constructor(options: { map: Map; position: LatLng });
  }

  namespace services {
    interface GeocoderResult {
      x: string;
      y: string;
    }

    interface PlaceResult {
      place_name: string;
      x: string;
      y: string;
    }

    class Geocoder {
      addressSearch(
        address: string,
        callback: (result: GeocoderResult[], status: string) => void
      ): void;
    }

    class Places {
      keywordSearch(
        keyword: string,
        callback: (results: PlaceResult[], status: string) => void,
        options?: { location: LatLng; radius: number; sort: string }
      ): void;
    }

    const Status: { OK: string };
    const SortBy: { DISTANCE: string };
  }
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(settings: {
      objectType: 'feed';
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: { mobileWebUrl: string; webUrl: string };
      };
      buttons?: Array<{
        title: string;
        link: { mobileWebUrl: string; webUrl: string };
      }>;
    } | {
      // 카카오 "공개 일정"에 연결된 캘린더 템플릿 — 카카오가 자동으로 붙여주는
      // "일정 등록" 버튼을 눌렀을 때 앱 안에서 바로 톡캘린더에 등록된다.
      objectType: 'calendar';
      idType: 'event' | 'calendar';
      id: string;
      content?: {
        title?: string;
        description?: string;
        imageUrl?: string;
        link?: { mobileWebUrl?: string; webUrl?: string };
      };
    }): void;
    sendScrap(settings: { requestUrl: string }): void;
  };
}

interface Window {
  kakao: typeof kakao;
  Kakao: KakaoSDK;
}