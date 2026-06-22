interface DaumPostcodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  sigungu: string;
}

declare namespace daum {
  class Postcode {
    constructor(options: { oncomplete: (data: DaumPostcodeData) => void });
    open(): void;
  }
}

interface Window {
  daum: typeof daum;
}