"use client"

import { useGenshinData } from "@/lib/genshin-data-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { useLanguage } from "@/lib/language-provider"
import React from "react"
import { Badge } from "@/components/ui/badge"

export default function RulesSettings() {
  const { settings, toggleCoopMode, toggleLimitFiveStars, updateMaxFiveStars, getNonCoopBosses } = useGenshinData()
  const [showCoopConfirmation, setShowCoopConfirmation] = useState(false)
  const nonCoopBosses = getNonCoopBosses()
  const { t } = useLanguage()

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
                <Label htmlFor="max-five-stars" className="text-sm">{t("rules.fiveStarLimit.maximum")}</Label>
                <Input
                  id="max-five-stars"
                  type="number"
                  min="0"
                  max="10"
                  value={settings.rules.maxFiveStars}
                  onChange={(e) => updateMaxFiveStars(Number.parseInt(e.target.value) || 0)}
                  className="w-16 h-8"
                />
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