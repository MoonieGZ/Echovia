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
import { useLanguage } from "@/lib/language-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useLanguage()
  const data = {
    user: {
      name: "Moons",
      email: "me@mnsy.dev",
      avatar: "/mc-gaming.png",
    },
    navMain: [
      {
        title: t("sidebar.playground"),
        url: "/genshin",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: t("sidebar.genshinImpact"),
            url: "/genshin",
          },
        ],
      },
      {
        title: t("sidebar.friends"),
        url: "/wip",
        icon: ContactRound,
        items: [
          {
            title: t("sidebar.friendsList"),
            url: "/wip",
          },
          {
            title: t("sidebar.friendsRequests"),
            url: "/wip",
          },
        ],
      },
      {
        title: t("sidebar.guides"),
        url: "/wip",
        icon: BookOpen,
        items: [
          {
            title: t("sidebar.getStarted"),
            url: "/wip",
          },
          {
            title: t("sidebar.tutorials"),
            url: "/wip",
          },
          {
            title: t("sidebar.changelog"),
            url: "/changelog",
          },
        ],
      },
      {
        title: t("sidebar.settings"),
        url: "/settings",
        icon: Settings2,
        isActive: true,
        items: [
          {
            title: t("sidebar.characters"),
            url: "/settings#characters-section",
          },
          {
            title: t("sidebar.excludedCharacters"),
            url: "/settings#excluded-characters-section",
          },
          {
            title: t("sidebar.bosses"),
            url: "/settings#bosses-section",
          },
          {
            title: t("sidebar.rules"),
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
