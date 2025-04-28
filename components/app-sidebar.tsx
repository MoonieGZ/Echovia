"use client"

import * as React from "react"
import {
  BookOpen,
  ContactRound,
  Settings2,
  SquareTerminal,
} from "lucide-react"

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

// This is sample data.
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
          url: "#",
        },
        {
          title: "Wuthering Waves",
          url: "#",
        },
      ],
    },
    {
      title: "Friends",
      url: "#",
      icon: ContactRound,
      items: [
        {
          title: "List",
          url: "#",
        },
        {
          title: "Requests",
          url: "#",
        },
      ],
    },
    {
      title: "Guides",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Characters",
          url: "#",
        },
        {
          title: "Bosses",
          url: "#",
        },
        {
          title: "Rules",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
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
