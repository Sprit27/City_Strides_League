"use client";

import { APIProvider, Map, Polyline, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, StopCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LatLng = { lat: number; lng: number };

const haversineDistance = (mk1: LatLng, mk2: LatLng): number => {
  const R = 6371; // Radius of the Earth in km
  const rlat1 = mk1.lat * (Math.PI / 180);
  const rlat2 = mk2.lat * (Math.PI / 180);
  const difflat = rlat2 - rlat1;
  const difflon = (mk2.lng - mk1.lng) * (Math.PI / 180);

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  return d;
};


export function MapTracker() {
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "tracking" | "paused">("idle");
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [duration, setDuration] = useState(0);
  const watchId = useRef<number | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const newPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
    
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

  const handleError = (error: GeolocationPositionError) => {
    console.error("Geolocation error:", error);
    toast({
        title: "Location Error",
        description: "Could not get position. Please enable location services.",
        variant: "destructive",
    });
    setTrackingStatus("idle");
  };
  
  const startTracking = () => {
    if ("geolocation" in navigator) {
      setTrackingStatus("tracking");
      watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
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
    startTracking();
  }

  const stopTracking = () => {
    pauseTracking();
    setTrackingStatus("idle");
    toast({ title: "Run Finished!", description: `You ran ${distance.toFixed(2)} km in ${formatDuration(duration)}.` });
    setRoute([]);
    setDistance(0);
    setSpeed(0);
    setDuration(0);
  };
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      handleError
    );
    
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (timerId.current) clearInterval(timerId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
        <Card>
            <CardHeader><CardTitle>Map Unavailable</CardTitle></CardHeader>
            <CardContent><p>Please provide a Google Maps API key in your environment variables (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) to use this feature.</p></CardContent>
        </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg">
        <div className="relative h-[400px] w-full md:h-[500px]">
            <APIProvider apiKey={apiKey}>
                <Map
                    center={currentPosition || { lat: 51.5074, lng: -0.1278 }}
                    zoom={currentPosition ? 16 : 10}
                    mapId="city-strides-map"
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                >
                    {currentPosition && <AdvancedMarker position={currentPosition}><MapPin className="text-destructive h-8 w-8 animate-pulse" /></AdvancedMarker>}
                    {route.length > 1 && <Polyline path={route} strokeColor="#386641" strokeOpacity={0.8} strokeWeight={6} />}
                </Map>
            </APIProvider>
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
