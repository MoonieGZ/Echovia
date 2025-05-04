"use client"

import * as React from "react"
import {
  BookOpen,
  ContactRound,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GiCardRandom } from "react-icons/gi"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const data = {
    user: {
      name: "Moons",
      email: "me@mnsy.dev",
      avatar: "/globe.svg",
    },
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Genshin Impact",
            url: "#",
          },
          {
            title: "Honkai: Star Rail",
            url: "/wip",
          },
          {
            title: "Wuthering Waves",
            url: "/wip",
          },
        ],
      },
      {
        title: "Friends",
        url: "/wip",
        icon: ContactRound,
        items: [
          {
            title: "List",
            url: "/wip",
          },
          {
            title: "Requests",
            url: "/wip",
          },
        ],
      },
      {
        title: "Guides",
        url: "/wip",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "/wip",
          },
          {
            title: "Get Started",
            url: "/wip",
          },
          {
            title: "Tutorials",
            url: "/wip",
          },
          {
            title: "Changelog",
            url: "/wip",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        isActive: pathname?.startsWith("/settings"),
        items: [
          {
            title: "General",
            url: "/settings",
          },
          {
            title: "Characters",
            url: "/settings#characters-section",
          },
          {
            title: "Bosses",
            url: "/settings#bosses-section",
          },
          {
            title: "Rules",
            url: "/settings#rules-section",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <GiCardRandom className="!size-8" />
                <span className="text-base font-semibold">Echovia</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
