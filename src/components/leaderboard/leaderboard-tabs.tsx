
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { Crown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardCategory = "distance" | "avgSpeed" | "pace";

const LeaderboardTable = ({ category }: { category: LeaderboardCategory }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const userList = await getUsers();
      setUsers(userList);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (category === "pace") {
        return a.weeklyStats[category] - b.weeklyStats[category];
      }
      return b.weeklyStats[category] - a.weeklyStats[category];
    });
  }, [category, users]);

  const getStatDisplay = (user: User) => {
    switch (category) {
      case "distance":
        return `${user.weeklyStats.distance.toFixed(1)} km`;
      case "avgSpeed":
        return `${user.weeklyStats.avgSpeed.toFixed(1)} km/h`;
      case "pace":
        return `${user.weeklyStats.pace.toFixed(2)} min/km`;
    }
  };

  const isCurrentUser = (user: User) => user.name === "You";

  if (loading) {
    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right pr-6">Stat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 7 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right pr-6">Stat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user, index) => (
            <TableRow key={user.id} className={isCurrentUser(user) ? "bg-primary/10" : ""}>
              <TableCell className="font-medium">
                <div className="flex items-center justify-center h-full">
                  {index < 3 ? (
                    <Crown
                      className={`h-6 w-6 ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-slate-400"
                          : "text-amber-700"
                      }`}
                      fill="currentColor"
                    />
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} alt={user.name}/>
                    <AvatarFallback>
                      {user.name.split(" ").map(n=>n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-base pr-6">{getStatDisplay(user)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export function LeaderboardTabs() {
  return (
    <Tabs defaultValue="distance" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="distance">Distance</TabsTrigger>
        <TabsTrigger value="avgSpeed">Speed (km/h)</TabsTrigger>
        <TabsTrigger value="pace">Pace (min/km)</TabsTrigger>
      </TabsList>
      <TabsContent value="distance">
        <LeaderboardTable category="distance" />
      </TabsContent>
      <TabsContent value="avgSpeed">
        <LeaderboardTable category="avgSpeed" />
      </TabsContent>
      <TabsContent value="pace">
        <LeaderboardTable category="pace" />
      </TabsContent>
    </Tabs>
  );
}
