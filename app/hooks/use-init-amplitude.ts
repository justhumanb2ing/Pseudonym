import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-browser";

export const useInitAmplitude = () => {
  useEffect(() => {
    amplitude.init("ed33c12ecee6422d6fc90df39f91e748", {
      autocapture: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: false,
        elementInteractions: true,
        networkTracking: true,
        webVitals: true,
        frustrationInteractions: true,
      },
    });
  }, []);
};
