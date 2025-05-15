"use client"

import { useGenshinData } from "@/lib/genshin-data-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from "next-intl"
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"

export default function RulesSettings() {
  const { settings, toggleCoopMode, toggleLimitFiveStars, updateMaxFiveStars, getNonCoopBosses } = useGenshinData()
  const [showCoopConfirmation, setShowCoopConfirmation] = useState(false)
  const nonCoopBosses = getNonCoopBosses()
  const t = useTranslations()

  const handleCoopToggle = (enabled: boolean) => {
    if (enabled && nonCoopBosses.length > 0) {
      setShowCoopConfirmation(true)
    } else {
      toggleCoopMode(enabled)
    }
  }

  const confirmCoopMode = () => {
    toggleCoopMode(true)
    setShowCoopConfirmation(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("rules.activeRules")}</Label>
        <div className="flex flex-wrap gap-2">
          {settings.rules.coopMode && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {t("rules.coopMode.enabled")}
            </Badge>
          )}
          {settings.rules.limitFiveStars && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {t("rules.fiveStarLimit.enabled")} ({settings.rules.maxFiveStars})
            </Badge>
          )}
          {!settings.rules.coopMode && !settings.rules.limitFiveStars && (
            <span className="text-sm text-muted-foreground">{t("rules.noActiveRules")}</span>
          )}
        </div>
      </div>

      {/* Rules Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">{t("rules.coopMode.title")}</Label>
            <p className="text-sm text-muted-foreground">{t("rules.coopMode.description")}</p>
          </div>
          <Switch id="coop-mode" checked={settings.rules.coopMode} onCheckedChange={handleCoopToggle} />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">{t("rules.fiveStarLimit.title")}</Label>
            <p className="text-sm text-muted-foreground">{t("rules.fiveStarLimit.description")}</p>
          </div>
          <div className="flex items-center gap-4">
            {settings.rules.limitFiveStars && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateMaxFiveStars(Math.max(0, settings.rules.maxFiveStars - 1))
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center">{settings.rules.maxFiveStars}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateMaxFiveStars(settings.rules.maxFiveStars + 1)
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Switch
              id="limit-five-stars"
              checked={settings.rules.limitFiveStars}
              onCheckedChange={toggleLimitFiveStars}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={showCoopConfirmation} onOpenChange={setShowCoopConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("rules.coopConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>{t("rules.coopConfirm.description")}</div>
              <ul className="list-disc pl-6 max-h-60 overflow-y-auto">
                {nonCoopBosses.map((boss) => (
                  <li key={boss.name}>{boss.name.replace("⭐ - ", "")}</li>
                ))}
              </ul>
              <div>{t("rules.coopConfirm.note")}</div>
              <div>{t("rules.coopConfirm.question")}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("rules.coopConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCoopMode}>{t("rules.coopConfirm.confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 