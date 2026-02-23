"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, StopCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from "react-dom/server";

// Fix for default icon URLs which don't work well with bundlers
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

type LatLng = L.LatLngTuple;

const haversineDistance = (mk1: LatLng, mk2: LatLng): number => {
  const R = 6371; // Radius of the Earth in km
  const rlat1 = mk1[0] * (Math.PI / 180);
  const rlat2 = mk2[0] * (Math.PI / 180);
  const difflat = rlat2 - rlat1;
  const difflon = (mk2[1] - mk1[1]) * (Math.PI / 180);

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  return d;
};

export function MapTracker() {
  const [isClient, setIsClient] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "tracking" | "paused">("idle");
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [duration, setDuration] = useState(0);
  const watchId = useRef<number | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  useEffect(() => {
    setIsClient(true)
  }, []);

  const customIcon = isClient ? L.divIcon({
    html: renderToStaticMarkup(<MapPin className="text-destructive h-8 w-8 animate-pulse" />),
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }) : undefined;

  // Initialize map
  useEffect(() => {
    if (isClient && mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(currentPosition || [51.5074, -0.1278], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);
    }
    
    return () => {
        if(mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    }
  }, [isClient, currentPosition]);

  // Update marker and map view
  useEffect(() => {
    if (mapInstanceRef.current && currentPosition && customIcon) {
      if (!markerRef.current) {
        markerRef.current = L.marker(currentPosition, { icon: customIcon }).addTo(mapInstanceRef.current);
      } else {
        markerRef.current.setLatLng(currentPosition);
      }
      mapInstanceRef.current.setView(currentPosition, mapInstanceRef.current.getZoom() < 15 ? 16 : mapInstanceRef.current.getZoom());
    }
  }, [currentPosition, customIcon]);

  // Update polyline
  useEffect(() => {
      if(mapInstanceRef.current) {
          if(!polylineRef.current && route.length > 0) {
              polylineRef.current = L.polyline(route, { color: '#386641', opacity: 0.8, weight: 6 }).addTo(mapInstanceRef.current);
          } else if (polylineRef.current) {
              polylineRef.current.setLatLngs(route);
          }
      }
  }, [route]);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const newPosition: LatLng = [pos.coords.latitude, pos.coords.longitude];
    
    setRoute((prevRoute) => {
        if (prevRoute.length > 0) {
            const lastPosition = prevRoute[prevRoute.length - 1];
            const newDistance = haversineDistance(lastPosition, newPosition);
            setDistance((prevDistance) => prevDistance + newDistance);
        }
        return [...prevRoute, newPosition];
    });

    setCurrentPosition(newPosition);
    if(pos.coords.speed) {
        setSpeed(pos.coords.speed * 3.6); // m/s to km/h
    }
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.error("Geolocation error:", error);
    toast({
        title: "Location Error",
        description: "Could not get position. Please enable location services.",
        variant: "destructive",
    });
    setTrackingStatus("idle");
  }, [toast]);
  
  const startTracking = () => {
    if ("geolocation" in navigator) {
      setTrackingStatus("tracking");
      setRoute([]);
      setDistance(0);
      setSpeed(0);
      setDuration(0);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const initialPosition: LatLng = [pos.coords.latitude, pos.coords.longitude];
          setCurrentPosition(initialPosition);
          setRoute([initialPosition]);

          watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          });
        },
        handleError
      );

      if (timerId.current) clearInterval(timerId.current);
      timerId.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      toast({ title: "Unsupported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
    }
  };

  const pauseTracking = () => {
    setTrackingStatus("paused");
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (timerId.current) clearInterval(timerId.current);
    watchId.current = null;
    timerId.current = null;
  };

  const resumeTracking = () => {
    setTrackingStatus("tracking");
     if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
        });
        timerId.current = setInterval(() => {
            setDuration(d => d + 1);
        }, 1000);
     }
  }

  const stopTracking = () => {
    pauseTracking();
    setTrackingStatus("idle");
    toast({ title: "Run Finished!", description: `You ran ${distance.toFixed(2)} km in ${formatDuration(duration)}.` });
    // Keep route to show the finished run, it will be cleared on next start
  };
  
  useEffect(() => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentPosition([pos.coords.latitude, pos.coords.longitude]),
        handleError
        );
    }
    
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (timerId.current) clearInterval(timerId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleError]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  return (
    <Card className="overflow-hidden shadow-lg">
        <div className="relative h-[400px] w-full md:h-[500px] bg-muted">
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="z-0" />
            {!isClient && <div className="absolute inset-0 flex items-center justify-center bg-muted"><p>Loading map...</p></div>}
        </div>
        <CardContent className="p-4 bg-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-bold text-2xl font-mono">{distance.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Speed</p>
                <p className="font-bold text-2xl font-mono">{trackingStatus !== 'idle' ? speed.toFixed(1) : '0.0'} km/h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-bold text-2xl font-mono">{formatDuration(duration)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {trackingStatus === "idle" && (
                <Button onClick={startTracking} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Play className="mr-2 h-5 w-5" /> Start Run
                </Button>
              )}
              {trackingStatus === "tracking" && (
                <Button onClick={pauseTracking} variant="outline" size="lg">
                  <Pause className="mr-2 h-5 w-5" /> Pause
                </Button>
              )}
              {trackingStatus === "paused" && (
                <Button onClick={resumeTracking} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Play className="mr-2 h-5 w-5" /> Resume
                </Button>
              )}
              {(trackingStatus === "tracking" || trackingStatus === "paused") && (
                <Button onClick={stopTracking} variant="destructive" size="lg">
                  <StopCircle className="mr-2 h-5 w-5" /> Stop
                </Button>
              )}
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
