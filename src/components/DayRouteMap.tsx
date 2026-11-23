import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { DayRoute } from '../types/trip';

interface DayRouteMapProps {
  dayId: string;
  route: DayRoute;
}

export function DayRouteMap({ dayId, route }: DayRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || route.stops.length === 0) return;

    let cancelled = false;
    let map: LeafletMap | null = null;

    void import('leaflet').then((mod) => {
      if (cancelled || !containerRef.current) return;
      const L = mod.default;

      map = L.map(containerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      map.attributionControl.setPrefix(false);

      // Keyless minimalist editorial canvas tinted warm ivory via .ivy-leaflet-container CSS
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(map);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          opacity: 0.92,
        }
      ).addTo(map);

      const coords: [number, number][] = route.stops.map((s) => [s.lat, s.lng]);

      if (coords.length > 1) {
        // Soft brass halo beneath the Ivy Green route line
        L.polyline(coords, {
          color: '#B39258',
          weight: 6,
          opacity: 0.32,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Main Ivy Green route polyline (dashed for walking, solid for Tube)
        L.polyline(coords, {
          color: '#143B2B',
          weight: 2.75,
          opacity: 0.92,
          dashArray: route.mode === 'w' ? '6 7' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      route.stops.forEach((stop, index) => {
        const icon = L.divIcon({
          className: 'ivy-map-pin-wrapper',
          html: `<div style="
            width: 26px;
            height: 26px;
            border-radius: 9999px;
            background: #143B2B;
            border: 2px solid #B39258;
            color: #FAF8F4;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px rgba(20, 59, 43, 0.28);
          ">${index + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -14],
        });

        L.marker([stop.lat, stop.lng], { icon })
          .bindPopup(
            `<span style="font-size:12px;font-weight:500;color:#143B2B;">${index + 1}. ${stop.label}</span>`,
            { closeButton: false }
          )
          .addTo(map!);
      });

      if (coords.length === 1) {
        map.setView(coords[0], 14);
      } else {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
      }
    });

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
      }
    };
  }, [dayId, route]);

  return (
    <div
      ref={containerRef}
      id={`journal-map-canvas-${dayId}`}
      aria-label="Carte de l'itinéraire de la journée"
      className="ivy-leaflet-container h-[250px] w-full"
    />
  );
}
