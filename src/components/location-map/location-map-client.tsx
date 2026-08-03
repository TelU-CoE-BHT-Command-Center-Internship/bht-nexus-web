"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/location-map/location-map.module.css";

type MapStatus = "error" | "idle" | "loading" | "ready";

type LocationMapClientProps = {
  errorLabel: string;
  latitude: number;
  loadingLabel: string;
  longitude: number;
  mapLabel: string;
  markerLabel: string;
  styleUrl: string;
};

export function LocationMapClient({
  errorLabel,
  latitude,
  loadingLabel,
  longitude,
  mapLabel,
  markerLabel,
  styleUrl,
}: LocationMapClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapStatus>("idle");

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let disposed = false;
    let loaded = false;
    let map: import("maplibre-gl").Map | undefined;
    let marker: import("maplibre-gl").Marker | undefined;

    const initializeMap = async () => {
      setStatus("loading");

      try {
        const maplibre = await import("maplibre-gl");

        if (disposed) {
          return;
        }

        map = new maplibre.Map({
          center: [longitude, latitude],
          container,
          cooperativeGestures: true,
          dragRotate: false,
          maxZoom: 18,
          minZoom: 11,
          pitchWithRotate: false,
          style: styleUrl,
          zoom: 16,
        });

        const handleReady = () => {
          if (disposed || loaded) {
            return;
          }

          loaded = true;
          setStatus("ready");
        };

        map.once("load", handleReady);
        map.once("error", () => {
          if (!(disposed || loaded)) {
            setStatus("error");
          }
        });

        map.getCanvas().setAttribute("aria-label", mapLabel);
        map.addControl(
          new maplibre.NavigationControl({
            showCompass: false,
            showZoom: true,
          }),
          "top-left",
        );

        marker = new maplibre.Marker({
          color: "#d7193f",
          scale: 1.05,
        })
          .setLngLat([longitude, latitude])
          .addTo(map);

        const markerElement = marker.getElement();
        markerElement.setAttribute("aria-label", markerLabel);
        markerElement.setAttribute("role", "img");
        markerElement.setAttribute("title", markerLabel);

        if (map.loaded()) {
          handleReady();
        }
      } catch {
        if (!disposed) {
          setStatus("error");
        }
      }
    };

    if (!("IntersectionObserver" in window)) {
      void initializeMap();

      return () => {
        disposed = true;
        marker?.remove();
        map?.remove();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        void initializeMap();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(container);

    return () => {
      disposed = true;
      observer.disconnect();
      marker?.remove();
      map?.remove();
    };
  }, [latitude, longitude, mapLabel, markerLabel, styleUrl]);

  return (
    <div className={styles.mapShell} data-map-status={status}>
      <div className={styles.mapCanvas} ref={containerRef} />
      {status !== "ready" ? (
        <output className={styles.mapStatus}>
          {status !== "error" ? (
            <span aria-hidden="true" className={styles.loadingIndicator} />
          ) : null}
          <span>{status === "error" ? errorLabel : loadingLabel}</span>
        </output>
      ) : null}
    </div>
  );
}
