
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Trophy,
  LogOut,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/data";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/firebase/clientApp";
import { signOut } from "firebase/auth";


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        // If no user is logged in, redirect to login
        router.push("/login");
      } else {
        setCurrentUser(user);
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-8 w-8 p-0" asChild>
              <Link href="/dashboard">
                <Footprints className="h-6 w-6 text-primary-foreground" />
              </Link>
            </Button>
            <h1 className="font-headline text-xl font-semibold text-primary-foreground">
              City Strides
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/leaderboard")}
                tooltip="Leaderboard"
              >
                <Link href="/leaderboard">
                  <Trophy />
                  <span>Leaderboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {loading ? (
             <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
             </div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <p className="truncate font-medium">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/70">Pro Member</p>
              </div>
            </div>
          ) : null}
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip="Log Out">
                  <LogOut />
                  <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="hidden md:block">
            <h2 className="font-headline text-2xl font-semibold">
              {pathname.startsWith("/leaderboard") ? "Leaderboard" : "Dashboard"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Weekly reset on Sunday!
          </p>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
