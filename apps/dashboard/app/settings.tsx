import { useEffect, useState } from 'react'
import { useGetSettings, usePatchSettings } from '@odyssey/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '../components/app-shell'
import { Card } from '../components/dashboard-layout'
import { Button, InputField, SkeletonBlock, StatusBanner, ToastCard, ToggleField } from '../components/ui-primitives'

export default function SettingsScreen() {
  const queryClient = useQueryClient()
  const settingsQuery = useGetSettings()
  const [showToast, setShowToast] = useState(false)

  const patchMutation = usePatchSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/settings'] })
        setShowToast(true)
      }
    }
  })

  const [feedback, setFeedback] = useState<{ tone: 'warning' | 'error'; title: string; body?: string } | null>(null)
  const [draft, setDraft] = useState({
    prepTimeMinutes: '15',
    autoAccept: false,
    serviceAvailable: true,
    openingHours: '09:00-22:00'
  })

  useEffect(() => {
    const settings = settingsQuery.data?.data

    if (!settings) {
      return
    }

    setDraft({
      prepTimeMinutes: settings.prepTimeMinutes.toString(),
      autoAccept: settings.autoAccept,
      serviceAvailable: settings.serviceAvailable,
      openingHours: settings.openingHours
    })
  }, [settingsQuery.data])

  const saveSettings = () => {
    const prepTimeMinutes = Number(draft.prepTimeMinutes)

    if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes <= 0) {
      setFeedback({ tone: 'warning', title: 'Prep time must be positive', body: 'Enter a whole number of minutes for prep time.' })
      return
    }

    patchMutation.mutate({
      data: {
        prepTimeMinutes,
        autoAccept: draft.autoAccept,
        serviceAvailable: draft.serviceAvailable,
        openingHours: draft.openingHours
      }
    })
  }

  if (settingsQuery.isLoading) {
    return (
      <AppShell title="Settings">
        <SkeletonBlock height={200} />
      </AppShell>
    )
  }

  if (settingsQuery.isError || !settingsQuery.data?.data) {
    return (
      <AppShell title="Settings">
        <StatusBanner tone="error" title="Unable to load settings" body="The settings service is currently unavailable." />
      </AppShell>
    )
  }

  return (
    <AppShell title="Settings" subtitle="Service hours, prep time, and order automation">
      {feedback ? <StatusBanner tone={feedback.tone} title={feedback.title} body={feedback.body} /> : null}
      {showToast ? (
        <ToastCard tone="success" title="Settings saved" body="Service preferences are now active." />
      ) : null}

      <Card title="Operations">
        <InputField
          label="Prep time (minutes)"
          value={draft.prepTimeMinutes}
          onChangeText={(value) => setDraft((current) => ({ ...current, prepTimeMinutes: value }))}
          keyboardType="number-pad"
          helperText="Used to estimate kitchen turnaround."
        />
        <ToggleField
          label="Auto accept"
          helperText="Automatically accept incoming orders when enabled."
          value={draft.autoAccept}
          onValueChange={(value) => setDraft((current) => ({ ...current, autoAccept: value }))}
        />
        <ToggleField
          label="Service available"
          helperText="Toggle whether the restaurant is open to guests."
          value={draft.serviceAvailable}
          onValueChange={(value) => setDraft((current) => ({ ...current, serviceAvailable: value }))}
        />
        <InputField
          label="Opening hours"
          value={draft.openingHours}
          onChangeText={(value) => setDraft((current) => ({ ...current, openingHours: value }))}
          helperText='JSON or compact text, e.g. {"mon":"09:00-22:00"}'
        />
        <Button size="sm" onPress={saveSettings} disabled={patchMutation.isPending}>
          {patchMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </Card>
    </AppShell>
  )
}
