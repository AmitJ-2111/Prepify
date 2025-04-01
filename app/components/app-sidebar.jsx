// app/components/app-sidebar.jsx - Complete version
"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Video,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ className, ...props }) {
  const router = useRouter();
  const pathname = usePathname();

  // Check if a path is active
  const isActivePath = (href) => {
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    if (href !== "/dashboard" && pathname.startsWith(href)) {
      return true;
    }
    return false;
  };

  // Main app navigation structure - Simplified for version 1
  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: isActivePath("/dashboard"),
    },
    {
      title: "Interviews",
      href: "#",
      icon: Video,
      isActive: isActivePath("/interview"),
      items: [
        {
          title: "All Interviews",
          href: "/dashboard?tab=history",
        },
        {
          title: "New Interview",
          href: "/dashboard?openNew=true",
        },
      ],
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      isActive: isActivePath("/analytics"),
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      isActive: isActivePath("/settings"),
      items: [
        {
          title: "Profile",
          href: "/settings/profile",
        },
        {
          title: "Account",
          href: "/settings/account",
        },
      ],
    },
  ];

  return (
    <aside className={className} {...props}>
      {/* Main navigation */}
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={item.isActive}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActivePath(subItem.href)}
                            >
                              <a
                                href={subItem.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(subItem.href);
                                }}
                              >
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    onClick={() => router.push(item.href)}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Help section at the bottom */}
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          size="sm"
          onClick={() => router.push("/help")}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Help & Support</span>
        </Button>
      </div>
    </aside>
  );
}
