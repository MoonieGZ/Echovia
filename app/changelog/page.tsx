"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-provider"
import { Badge } from "@/components/ui/badge"
import { Bug, BugOff, Calendar, GitCommit } from "lucide-react"
import React, { useEffect, useState } from "react"

type ChangelogEntry = {
  title: string
  description: string
  timestamp: string
  changes: string[]
  fixes: string[]
  knownIssues: string[]
}

type ChangelogData = {
  [version: string]: ChangelogEntry
}

export default function ChangelogPage() {
  const { t } = useLanguage()
  const [changelog, setChangelog] = useState<ChangelogData>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChangelog = async () => {
      try {
        const response = await fetch("/data/changelog.json")
        const data = await response.json()
        setChangelog(data)
      } catch (error) {
        console.error("Failed to load changelog:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChangelog()
  }, [])

  // Sort versions in descending order (newest first)
  const sortedVersions = Object.keys(changelog).sort((a, b) => {
    const dateA = new Date(changelog[a].timestamp)
    const dateB = new Date(changelog[b].timestamp)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("changelog.title")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="space-y-8">
                  {isLoading ? (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">{t("app.loading")}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    sortedVersions.map((version) => {
                      const entry = changelog[version]
                      const date = new Date(entry.timestamp)
                      const formattedDate = new Intl.DateTimeFormat(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(date)

                      return (
                        <Card key={version} className="overflow-hidden">
                          <CardHeader className="border-b bg-muted/50">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-semibold">
                                  Version {version}
                                </CardTitle>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formattedDate}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{entry.description}</p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {entry.changes.length > 0 && (
                                <div className="space-y-2">
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <GitCommit className="h-4 w-4" />
                                    {t("changelog.changes")}
                                  </h3>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {entry.changes.map((change, index) => (
                                      <li key={index} className="text-sm">
                                        {change}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {entry.fixes.length > 0 && (
                                <div className="space-y-2">
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <BugOff className="h-4 w-4" />
                                    {t("changelog.fixes")}
                                  </h3>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {entry.fixes.map((fix, index) => (
                                      <li key={index} className="text-sm">
                                        {fix}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {entry.knownIssues.length > 0 && (
                                <div className="space-y-2">
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Bug className="h-4 w-4" />
                                    {t("changelog.knownIssues")}
                                  </h3>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {entry.knownIssues.map((issue, index) => (
                                      <li key={index} className="text-sm">
                                        {issue}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 