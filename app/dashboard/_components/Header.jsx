"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { BellIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center bg-background border-b shadow-sm">
      <div className="container flex max-w-full items-center justify-between px-4">
        {/* Left section - Logo and sidebar trigger */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:flex" />
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Prepify Logo"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="text-xl font-bold">Prepify</span>
          </Link>
        </div>

        {/* Right section - Search, notifications, user */}
        <div className="flex items-center gap-3">
          {/* Search button */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <SearchIcon className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        New feedback available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your interview feedback for "Senior Developer" is ready.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 1
                          ? "Just now"
                          : i === 2
                          ? "2 hours ago"
                          : "Yesterday"}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <Link href="/notifications" className="text-sm text-primary">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User button */}
          <div className="flex items-center">
            {isLoaded && (
              <UserButton afterSignOutUrl="/" userProfileMode="navigation" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
