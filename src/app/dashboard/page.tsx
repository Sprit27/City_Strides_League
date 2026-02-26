
"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers, getCurrentUser } from "@/lib/data";
import type { User } from "@/lib/types";
import { BarChart, Gauge, Rabbit, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const MapTracker = dynamic(() => import("@/components/dashboard/map-tracker").then(mod => mod.MapTracker), {
  ssr: false,
  loading: () => (
    <Card className="overflow-hidden shadow-lg">
      <Skeleton className="h-[400px] w-full md:h-[500px]" />
      <CardContent className="p-4 bg-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-bold text-2xl font-mono">0.00 km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Speed</p>
              <p className="font-bold text-2xl font-mono">0.0 km/h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-bold text-2xl font-mono">00:00:00</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
});


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const allUsers = await getUsers();
        const sortedByDistance = [...allUsers].sort((a,b) => b.weeklyStats.distance - a.weeklyStats.distance);
        const userRank = sortedByDistance.findIndex(u => u.id === currentUser.id) + 1;
        setRank(userRank > 0 ? userRank : sortedByDistance.length + 1);
      }
    }
    fetchData();
  }, []);

  if (!user || rank === null) {
    return (
      <AppLayout>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Run</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.weeklyStats.distance.toFixed(1)} km</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Speed</CardTitle>
              <Rabbit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.weeklyStats.avgSpeed.toFixed(1)} km/h</div>
              <p className="text-xs text-muted-foreground">This week's average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Pace</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.weeklyStats.pace.toFixed(2)} min/km</div>
              <p className="text-xs text-muted-foreground">This week's average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">League Rank</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{rank}</div>
              <p className="text-xs text-muted-foreground">Distance leaderboard</p>
            </CardContent>
          </Card>
        </div>
        <MapTracker />
      </div>
    </AppLayout>
  );
}
