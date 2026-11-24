import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CivicIssue, IssueStatus } from '../types/civic';

interface CivicMapProps {
  issues?: CivicIssue[];
  selectedIssueId?: string | null;
  onSelectIssue?: (issue: CivicIssue) => void;
  pickerPosition?: { lat: number; lng: number } | null;
  onPickLocation?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const STATUS_COLORS: Record<IssueStatus, string> = {
  Submitted: '#64748B',
  'Under Review': '#D97706',
  'In Progress': '#0038A8',
  Resolved: '#15803D',
};

function createPinIcon(color: string, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 22 : 16;
  const ring = isSelected ? 'box-shadow: 0 0 0 4px rgba(0, 56, 168, 0.22);' : '';
  return L.divIcon({
    className: 'civic-map-pin',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #FFFFFF;${ring}transition:transform 0.15s ease;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const CivicMap: React.FC<CivicMapProps> = ({
  issues = [],
  selectedIssueId = null,
  onSelectIssue,
  pickerPosition = null,
  onPickLocation,
  center = [28.6139, 77.209],
  zoom = 11,
  className = 'w-full h-full min-h-[320px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = layerGroup;

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      pickerMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onPickLocation) {
        onPickLocation(
          Number(e.latlng.lat.toFixed(5)),
          Number(e.latlng.lng.toFixed(5))
        );
      }
    };

    if (onPickLocation) {
      map.on('click', handleClick);
    }

    return () => {
      map.off('click', handleClick);
    };
  }, [onPickLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickerPosition) {
      const pinIcon = createPinIcon('#0038A8', true);
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickerPosition.lat, pickerPosition.lng]);
      } else {
        pickerMarkerRef.current = L.marker(
          [pickerPosition.lat, pickerPosition.lng],
          {
            icon: pinIcon,
            draggable: Boolean(onPickLocation),
          }
        ).addTo(map);

        pickerMarkerRef.current.on('dragend', () => {
          const pos = pickerMarkerRef.current?.getLatLng();
          if (pos && onPickLocation) {
            onPickLocation(
              Number(pos.lat.toFixed(5)),
              Number(pos.lng.toFixed(5))
            );
          }
        });
      }
      map.panTo([pickerPosition.lat, pickerPosition.lng], { animate: true });
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickerPosition, onPickLocation]);

  useEffect(() => {
    const layerGroup = markersLayerRef.current;
    const map = mapRef.current;
    if (!layerGroup || !map) return;

    layerGroup.clearLayers();

    issues.forEach((issue) => {
      const isSelected = issue.id === selectedIssueId;
      const color =
        issue.severity === 'Critical' && issue.status !== 'Resolved'
          ? '#DC2626'
          : STATUS_COLORS[issue.status];

      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: createPinIcon(color, isSelected),
        zIndexOffset: isSelected ? 500 : 0,
      });

      const popupContent = `
        <div style="min-width:190px;font-family:'DM Sans',sans-serif;color:#111827;">
          <div style="font-size:11px;color:#6B7280;margin-bottom:2px;">${escapeHtml(issue.id)} · ${escapeHtml(issue.status)}</div>
          <div style="font-size:13px;font-weight:600;margin-bottom:4px;line-height:1.35;">${escapeHtml(issue.title)}</div>
          <div style="font-size:12px;color:#6B7280;">${escapeHtml(issue.location)}</div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectIssue) {
          onSelectIssue(issue);
        }
      });

      marker.addTo(layerGroup);

      if (isSelected) {
        map.panTo([issue.latitude, issue.longitude], { animate: true });
        marker.openPopup();
      }
    });
  }, [issues, selectedIssueId, onSelectIssue]);

  return (
    <div className={`relative bg-[#F5F4F0] border border-[#E7E5E0] overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[320px]" />
    </div>
  );
};
