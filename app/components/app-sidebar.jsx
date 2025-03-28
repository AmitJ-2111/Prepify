"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Video,
  Code,
  Users,
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

  // Main app navigation structure
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
          href: "/dashboard",
        },
        {
          title: "Recent Sessions",
          href: "/dashboard",
        },
        {
          title: "Favorites",
          href: "/dashboard",
        },
      ],
    },
    {
      title: "Resume Builder",
      href: "#",
      icon: FileText,
      isActive: isActivePath("/resume"),
      items: [
        {
          title: "My Resumes",
          href: "/dashboard",
        },
        {
          title: "Templates",
          href: "/dashboard",
        },
        {
          title: "AI Writer",
          href: "/dashboard",
        },
      ],
    },
    {
      title: "Practice Library",
      href: "/practice",
      icon: BookOpen,
      isActive: isActivePath("/practice"),
      items: [
        {
          title: "Question Bank",
          href: "/practice/questions",
        },
        {
          title: "Mock Interviews",
          href: "/practice/mock",
        },
        {
          title: "Technical Challenges",
          href: "/practice/technical",
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
      title: "Schedule",
      href: "/schedule",
      icon: Calendar,
      isActive: isActivePath("/schedule"),
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
        {
          title: "Notifications",
          href: "/settings/notifications",
        },
        {
          title: "Billing",
          href: "/settings/billing",
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

      {/* Pro features section */}
      <SidebarGroup>
        <SidebarGroupLabel>Premium</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div className="grid flex-1 text-left">
                <span className="font-semibold">Upgrade to Pro</span>
                <span className="text-xs">Get unlimited interviews</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Help section at the bottom */}
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Help & Support</span>
        </Button>
      </div>
    </aside>
  );
}
