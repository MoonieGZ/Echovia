"use client"

import * as React from "react"
import {
  BookOpen,
  ContactRound,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import Link from "next/link"

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
  const data = {
    user: {
      name: "Moons",
      email: "me@mnsy.dev",
      avatar: "/mc-gaming.png",
    },
    navMain: [
      {
        title: "Playground",
        url: "/genshin",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Genshin Impact",
            url: "/genshin",
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
        isActive: true,
        items: [
          {
            title: "Characters",
            url: "/settings#characters-section",
          },
          {
            title: "Excluded Characters",
            url: "/settings#excluded-characters-section",
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
              <Link href="/">
                <GiCardRandom className="!size-8" />
                <span className="text-base font-semibold">Echovia</span>
              </Link>
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
