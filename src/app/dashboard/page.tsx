import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, users } from "@/lib/data";
import { MapTracker } from "@/components/dashboard/map-tracker";
import { BarChart, Gauge, Rabbit, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const user = getCurrentUser();
  const sortedByDistance = [...users].sort((a,b) => b.weeklyStats.distance - a.weeklyStats.distance);
  const rank = sortedByDistance.findIndex(u => u.id === user.id) + 1;

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
