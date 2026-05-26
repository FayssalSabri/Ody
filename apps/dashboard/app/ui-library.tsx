import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { tokens } from '@odyssey/shared'
import { AppShell } from '../components/app-shell'
import { MetricCard, MetricGrid, Panel } from '../components/dashboard-layout'
import { ActionLink, CellActions, CellAmount, CellEnd, CellMeta, CellPrimary, CellStack } from '../components/typography'
import {
  Badge,
  Button,
  DataTable,
  InputField,
  ModalSheet,
  SectionCard,
  SelectField,
  SkeletonBlock,
  StatusBanner,
  ToastCard,
  ToggleField
} from '../components/ui-primitives'

function ColorSwatches({
  title,
  colors
}: {
  title: string
  colors: Record<string, string>
}) {
  return (
    <View style={styles.tokenGroup}>
      <Text style={styles.tokenGroupTitle}>{title}</Text>
      <View style={styles.swatchGrid}>
        {Object.entries(colors).map(([key, value]) => (
          <View key={key} style={styles.swatchItem}>
            <View style={[styles.swatch, { backgroundColor: value }]} />
            <Text style={styles.swatchKey}>{key}</Text>
            <Text style={styles.swatchHex}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function TokenRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tokenRow}>
      <Text style={styles.tokenLabel}>{label}</Text>
      <Text style={styles.tokenValue}>{value}</Text>
    </View>
  )
}

export default function UILibraryScreen() {
  const [selectValue, setSelectValue] = useState('mains')
  const [enabled, setEnabled] = useState(true)
  const [name, setName] = useState('Ava Martinez')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<number>(1)

  const demoRows = [
    { id: 1, name: 'Truffle Pasta', status: 'pending', total: '$24.00' },
    { id: 2, name: 'Garden Salad', status: 'ready', total: '$12.50' },
    { id: 3, name: 'Margherita Pizza', status: 'completed', total: '$18.00' }
  ]

  return (
    <AppShell
      title="UI Library"
      subtitle="Tokens aligned with Odyssey Pro (pro.ody.app) — violet primary, Inter, slate surfaces."
    >
      <SectionCard title="Color tokens" subtitle="Brand, neutral, and semantic palettes from packages/shared.">
        <ColorSwatches title="Brand" colors={tokens.colors.brand} />
        <ColorSwatches title="Neutral" colors={tokens.colors.neutral} />
        <View style={styles.tokenGroup}>
          <Text style={styles.tokenGroupTitle}>Semantic</Text>
          <View style={styles.semanticRow}>
            {(['success', 'warning', 'error', 'info'] as const).map((tone) => (
              <View key={tone} style={styles.semanticChip}>
                <View
                  style={[
                    styles.semanticSample,
                    {
                      backgroundColor: tokens.colors.semantic[tone].bg,
                      borderColor: tokens.colors.semantic[tone].border
                    }
                  ]}
                >
                  <Text style={{ color: tokens.colors.semantic[tone].text, fontWeight: '600' }}>{tone}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Typography" subtitle={`${tokens.typography.families.sans} — weights and size scale.`}>
        <TokenRow label="Font family" value={tokens.typography.families.sans} />
        {Object.entries(tokens.typography.sizes).map(([key, size]) => (
          <Text
            key={key}
            style={{
              fontSize: size,
              fontWeight: key === '2xl' || key === '3xl' ? tokens.typography.weights.bold : tokens.typography.weights.regular,
              color: tokens.colors.neutral[900]
            }}
          >
            {key} — {size}px — The quick brown fox
          </Text>
        ))}
        <View style={styles.weightRow}>
          {Object.entries(tokens.typography.weights).map(([key, weight]) => (
            <Text key={key} style={{ fontWeight: weight, fontSize: tokens.typography.sizes.md, color: tokens.colors.neutral[800] }}>
              {key} ({weight})
            </Text>
          ))}
        </View>
        <View style={styles.sidebarBrandPreview}>
          <Text style={styles.sidebarBrandTitle}>Odyssey Bistro</Text>
          <Text style={styles.sidebarBrandRole}>Operations</Text>
        </View>
      </SectionCard>

      <SectionCard title="Spacing, radius & borders" subtitle="Consistent rhythm across all dashboard pages.">
        <Text style={styles.meta}>Spacing scale (px)</Text>
        <View style={styles.spacingRow}>
          {tokens.spacing.map((space, index) => (
            <View key={space} style={styles.spacingItem}>
              <View style={[styles.spacingBlock, { width: Math.max(space, 4), height: Math.max(space, 4) }]} />
              <Text style={styles.spacingLabel}>{index}</Text>
              <Text style={styles.spacingValue}>{space}</Text>
            </View>
          ))}
        </View>
        <View style={styles.radiusRow}>
          {Object.entries(tokens.radius).map(([key, value]) => (
            <View key={key} style={styles.radiusItem}>
              <View style={[styles.radiusSample, { borderRadius: value }]} />
              <Text style={styles.meta}>{key}</Text>
            </View>
          ))}
        </View>
        <TokenRow label="Border subtle" value={tokens.border.subtle} />
        <TokenRow label="Border focus" value={tokens.border.focus} />
      </SectionCard>

      <SectionCard title="Layout & grid" subtitle="Shared layout tokens used by AppShell and page content.">
        <TokenRow label="Content padding" value={`${tokens.layout.contentPadding}px`} />
        <TokenRow label="Sidebar width" value={`${tokens.layout.sidebarWidth}px`} />
        <TokenRow label="Grid gap" value={`${tokens.layout.gridGap}px`} />
        <MetricGrid>
          <MetricCard label="Demo metric" value="128" accent="brand" />
          <MetricCard label="Warning state" value="7" accent="warning" hint="Queue attention" />
        </MetricGrid>
      </SectionCard>

      <SectionCard title="Surfaces & elevation" subtitle="Cards, panels, and shadow depth.">
        <View style={[styles.surface, styles.elevation1]}>
          <Text style={styles.surfaceTitle}>Default surface</Text>
          <Text style={styles.meta}>neutral.0 + border.subtle</Text>
        </View>
        <View style={[styles.surface, styles.elevation3]}>
          <Text style={styles.surfaceTitle}>Raised surface</Text>
          <Text style={styles.meta}>elevation 3 — modals & overlays</Text>
        </View>
        <Panel title="Panel component" subtitle="Used on Home and CRM for grouped content.">
          <Text style={styles.meta}>Reusable panel from dashboard-layout.tsx</Text>
        </Panel>
      </SectionCard>

      <SectionCard title="Buttons" subtitle="Primary, secondary, ghost — plus disabled state.">
        <View style={styles.buttonRow}>
          <Button onPress={() => undefined}>Primary</Button>
          <Button variant="secondary" onPress={() => undefined}>Secondary</Button>
          <Button variant="ghost" onPress={() => undefined}>Ghost</Button>
          <Button disabled onPress={() => undefined}>Disabled</Button>
        </View>
        <Button fullWidth onPress={() => setModalOpen(true)}>Open modal demo</Button>
      </SectionCard>

      <SectionCard title="Badges & status" subtitle="Semantic tones for order and service states.">
        <View style={styles.badgeRow}>
          <Badge label="Info" tone="info" />
          <Badge label="Success" tone="success" />
          <Badge label="Warning" tone="warning" />
          <Badge label="Error" tone="error" />
          <Badge label="Neutral" tone="neutral" />
        </View>
      </SectionCard>

      <SectionCard title="Data table" subtitle="Right columns use CellEnd + tabular amounts; actions are text-only links.">
        <DataTable
          columns={[
            { key: 'name', header: 'Item', flex: 1, minWidth: 160, render: (row) => <CellStack primary={row.name} secondary={row.status} /> },
            {
              key: 'status',
              header: 'Status',
              width: 88,
              align: 'right',
              render: (row) => (
                <CellEnd>
                  <Badge label={row.status} tone={row.status === 'ready' ? 'success' : 'info'} />
                </CellEnd>
              )
            },
            {
              key: 'total',
              header: 'Total',
              width: 80,
              align: 'right',
              render: (row) => (
                <CellEnd>
                  <CellAmount>{row.total}</CellAmount>
                </CellEnd>
              )
            },
            {
              key: 'open',
              header: '',
              width: 56,
              align: 'right',
              render: () => (
                <CellActions>
                  <ActionLink onPress={() => undefined}>Open</ActionLink>
                </CellActions>
              )
            }
          ]}
          rows={demoRows}
          selectedRowId={selectedRowId}
          onRowPress={(row) => setSelectedRowId(row.id)}
        />
        <Text style={styles.meta}>Click a row to see the selected state (brand accent bar).</Text>
      </SectionCard>

      <SectionCard title="Form controls" subtitle="Input, select, toggle — with helper and error text.">
        <InputField label="Customer name" value={name} onChangeText={setName} placeholder="Type a customer name" helperText="Used in CRM and order creation." />
        <InputField label="With error" value="" placeholder="Required field" error="This field is required." />
        <SelectField
          label="Kitchen queue"
          value={selectValue}
          options={[
            { label: 'Mains', value: 'mains' },
            { label: 'Starters', value: 'starters' },
            { label: 'Drinks', value: 'drinks' }
          ]}
          onSelect={setSelectValue}
        />
        <ToggleField label="Live updates" helperText="Poll the API when enabled." value={enabled} onValueChange={setEnabled} />
      </SectionCard>

      <SectionCard title="Feedback & loading" subtitle="Banners, toasts, and skeleton placeholders.">
        <StatusBanner tone="success" title="Saved successfully" body="Settings persisted to the backend." />
        <StatusBanner tone="warning" title="Review before publish" body="A few fields still need attention." />
        <StatusBanner tone="error" title="Service unavailable" body="Could not reach the API — check dev:backend." />
        <ToastCard tone="info" title="Sync in progress" body="Refreshing data from Orval hooks." />
        <Text style={styles.meta}>Skeleton loading</Text>
        <SkeletonBlock height={24} width="60%" />
        <SkeletonBlock height={16} width="100%" />
        <SkeletonBlock height={16} width="80%" />
      </SectionCard>

      <ModalSheet title="Modal / dialog" visible={modalOpen} onClose={() => setModalOpen(false)}>
        <Text style={styles.meta}>ModalSheet stops overlay click-through. Use for create/edit flows on Orders and Menu.</Text>
        <InputField label="Example field" value={name} onChangeText={setName} />
        <View style={styles.buttonRow}>
          <Button onPress={() => setModalOpen(false)}>Confirm</Button>
          <Button variant="secondary" onPress={() => setModalOpen(false)}>Cancel</Button>
        </View>
      </ModalSheet>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  tokenGroup: {
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[3]
  },
  tokenGroupTitle: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[3]
  },
  swatchItem: {
    alignItems: 'center',
    gap: tokens.spacing[1],
    minWidth: 72
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.border.subtle
  },
  swatchKey: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[800]
  },
  swatchHex: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.neutral[500],
    fontFamily: tokens.typography.families.mono
  },
  semanticRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2]
  },
  semanticChip: {
    minWidth: 100
  },
  semanticSample: {
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: 'center'
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: tokens.border.subtle
  },
  tokenLabel: {
    color: tokens.colors.neutral[600],
    fontSize: tokens.typography.sizes.sm
  },
  tokenValue: {
    color: tokens.colors.neutral[900],
    fontSize: tokens.typography.sizes.sm,
    fontFamily: tokens.typography.families.mono
  },
  weightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[2]
  },
  sidebarBrandPreview: {
    marginTop: tokens.spacing[4],
    padding: 14,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.sidebar.bg,
    gap: 4
  },
  sidebarBrandTitle: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.sidebar.textActive,
    letterSpacing: -0.4
  },
  sidebarBrandRole: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.sidebar.text
  },
  meta: {
    color: tokens.colors.neutral[600],
    fontSize: tokens.typography.sizes.sm
  },
  spacingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[2]
  },
  spacingItem: {
    alignItems: 'center',
    gap: 2
  },
  spacingBlock: {
    backgroundColor: tokens.colors.brand[400],
    borderRadius: tokens.radius.sm
  },
  spacingLabel: {
    fontSize: 10,
    color: tokens.colors.neutral[500]
  },
  spacingValue: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.neutral[700],
    fontWeight: tokens.typography.weights.medium
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[3]
  },
  radiusItem: {
    alignItems: 'center',
    gap: tokens.spacing[1]
  },
  radiusSample: {
    width: 48,
    height: 48,
    backgroundColor: tokens.colors.neutral[200],
    borderWidth: 1,
    borderColor: tokens.border.subtle
  },
  surface: {
    backgroundColor: tokens.colors.neutral[0],
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.border.subtle,
    marginBottom: tokens.spacing[2]
  },
  elevation1: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: tokens.elevation[1]
  },
  elevation3: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: tokens.elevation[3]
  },
  surfaceTitle: {
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[900],
    fontSize: tokens.typography.sizes.md
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2]
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2]
  },
  cellStrong: {
    color: tokens.colors.neutral[900],
    fontWeight: tokens.typography.weights.semibold
  },
  cellText: {
    color: tokens.colors.neutral[700]
  }
})
