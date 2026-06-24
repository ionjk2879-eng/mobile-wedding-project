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
      objectType: string;
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
    }): void;
  };
}

interface Window {
  kakao: typeof kakao;
  Kakao: KakaoSDK;
}