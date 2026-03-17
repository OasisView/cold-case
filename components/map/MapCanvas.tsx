// MapCanvas — Mapbox GL JS dark basemap, state boundary highlight, GeoJSON cluster circles, stats bar, reset view
// SSR disabled at page level via next/dynamic. Token from NEXT_PUBLIC_MAPBOX_TOKEN env var.
/// <reference types="geojson" />
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Cluster } from "@/lib/types";
import { useFilterStore } from "@/store/useFilterStore";
import { STATE_BOUNDS, DEFAULT_MAP_VIEW } from "@/lib/constants";
import StatsBar from "@/components/map/StatsBar";

interface MapCanvasProps {
  clusters: Cluster[];
  totalCases: number;
  totalUnsolved: number;
  loading: boolean;
}

export default function MapCanvas({
  clusters,
  totalCases,
  totalUnsolved,
  loading,
}: MapCanvasProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [boundaryReady, setBoundaryReady] = useState(false);

  const setStateFilter = useFilterStore((s) => s.setStateFilter);

  const handleResetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: DEFAULT_MAP_VIEW.center,
      zoom: DEFAULT_MAP_VIEW.zoom,
      duration: 1200,
      essential: true,
    });
    setStateFilter(null);
  }, [setStateFilter]);

  // Initialize map
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      Promise.resolve().then(() => setTokenMissing(true));
      return;
    }

    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-96, 38],
      zoom: 4,
      projection: { name: "mercator" },
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      map.resize();
      setMapReady(true);

      // Fetch US state boundaries and add highlight layer
      fetch(
        "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
      )
        .then((res) => res.json())
        .then((geojson) => {
          if (!map.getSource("state-boundaries")) {
            map.addSource("state-boundaries", {
              type: "geojson",
              data: geojson,
            });
            map.addLayer({
              id: "state-highlight",
              type: "line",
              source: "state-boundaries",
              paint: {
                "line-color": "#E8A020",
                "line-width": 1.5,
                "line-opacity": 0,
                "line-opacity-transition": { duration: 600, delay: 0 },
              },
            });
            setBoundaryReady(true);
          }
        })
        .catch(() => {
          // Boundary data unavailable — feature degrades silently
        });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Fly to state when state filter changes
  const stateFilter = useFilterStore((s) => s.state);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (stateFilter && STATE_BOUNDS[stateFilter]) {
      const bounds = STATE_BOUNDS[stateFilter];
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          duration: 1200,
          essential: true,
        }
      );
    } else {
      mapRef.current.flyTo({
        center: DEFAULT_MAP_VIEW.center,
        zoom: DEFAULT_MAP_VIEW.zoom,
        duration: 1200,
        essential: true,
      });
    }
  }, [stateFilter, mapReady]);

  // Highlight state boundary when state filter changes
  useEffect(() => {
    if (!boundaryReady || !mapRef.current) return;
    const map = mapRef.current;

    if (stateFilter && STATE_BOUNDS[stateFilter]) {
      // Show boundary for selected state
      map.setFilter("state-highlight", ["==", ["get", "name"], stateFilter]);
      map.setPaintProperty("state-highlight", "line-opacity-transition", {
        duration: 600,
        delay: 0,
      });
      map.setPaintProperty("state-highlight", "line-opacity", 0.5);
    } else {
      // Fade out boundary
      map.setPaintProperty("state-highlight", "line-opacity-transition", {
        duration: 400,
        delay: 0,
      });
      map.setPaintProperty("state-highlight", "line-opacity", 0);
    }
  }, [stateFilter, boundaryReady]);

  // Render cluster circles via GeoJSON source + circle/symbol layers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const validClusters = clusters.filter((c) => c.total_cases > 0);

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: validClusters.map((c) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [c.lng, c.lat],
        },
        properties: {
          id: c.id,
          state: c.state,
          unsolved: c.unsolved_cases,
          total: c.total_cases,
        },
      })),
    };

    if (map.getSource("clusters")) {
      (map.getSource("clusters") as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("clusters", { type: "geojson", data: geojson });

      map.addLayer({
        id: "cluster-circles",
        type: "circle",
        source: "clusters",
        paint: {
          "circle-radius": 24,
          "circle-color": "rgba(200, 16, 46, 0.85)",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#C8102E",
          "circle-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "cluster-labels",
        type: "symbol",
        source: "clusters",
        layout: {
          "text-field": ["to-string", ["get", "total"]],
          "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.on("click", "cluster-circles", (e) => {
        if (!e.features?.[0]) return;
        const id = e.features[0].properties?.id;
        if (id) router.push(`/cluster/${id}`);
      });

      map.on("mouseenter", "cluster-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "cluster-circles", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }, [clusters, mapReady, router]);

  // Token missing — isolated error block
  if (tokenMissing) {
    return (
      <div
        className="flex items-center justify-center flex-1 bg-bg"
        data-testid="map-token-error"
      >
        <div className="flex flex-col items-center gap-[8px]">
          <span
            className="font-[family-name:var(--font-mono)] text-red uppercase"
            style={{ fontSize: "10px", letterSpacing: "2px" }}
          >
            Map Unavailable
          </span>
          <span
            className="font-[family-name:var(--font-mono)] text-muted"
            style={{ fontSize: "10px", letterSpacing: "1px" }}
          >
            Token not configured
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{ position: "relative", flex: 1, height: "100%" }}
      data-testid="map-container"
    >
      {/* Mapbox container */}
      <div
        ref={mapContainerRef}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Stats bar — floating top-right overlay */}
      <StatsBar
        totalCases={totalCases}
        totalUnsolved={totalUnsolved}
        clusterCount={clusters.length}
        loading={loading}
      />

      {/* Reset View — isolated circular cluster-node button, bottom-right */}
      <button
        type="button"
        data-testid="reset-view-btn"
        onClick={handleResetView}
        aria-label="Reset map view"
        style={{
          position: "absolute",
          bottom: "48px",
          right: "32px",
          zIndex: 10,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "rgba(232,160,32,0.08)",
          border: "1px solid rgba(232,160,32,0.25)",
          boxShadow: "0 0 18px rgba(232,160,32,0.12)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "box-shadow 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 28px rgba(232,160,32,0.25)";
          const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
          if (inner) inner.style.background = "rgba(232,160,32,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 18px rgba(232,160,32,0.12)";
          const inner = e.currentTarget.querySelector<HTMLElement>("[data-inner]");
          if (inner) inner.style.background = "rgba(232,160,32,0.35)";
        }}
      >
        {/* Pulse ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(232,160,32,0.5)",
            animation: "pulseRing 2.5s infinite",
            pointerEvents: "none",
          }}
        />
        {/* Inner circle */}
        <div
          data-inner=""
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "rgba(232,160,32,0.35)",
            border: "1.5px solid #E8A020",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            transition: "background 150ms ease",
          }}
        >
          <span
            className="font-[family-name:var(--font-mono)]"
            style={{
              fontSize: "14px",
              color: "#E8A020",
              lineHeight: 1,
            }}
          >
            ⟳
          </span>
        </div>
      </button>
    </div>
  );
}
