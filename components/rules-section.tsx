"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import RulesSettings from "./rules-settings"
import React from "react"

export default function RulesSection() {
  const t = useTranslations()

  return (
    <Card id="rules-section">
      <CardHeader>
        <CardTitle>
          <span className="text-3xl font-medium">{t("rules.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <RulesSettings />
        </div>
      </CardContent>
    </Card>
  )
} 