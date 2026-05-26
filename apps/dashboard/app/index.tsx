import { StyleSheet, Text, View } from 'react-native'
import { tokens } from '@odyssey/shared'
import { useGetSummary } from '@odyssey/api-client'
import { AppShell } from '../components/app-shell'
import { ListRow, MetricCard, MetricGrid, Panel } from '../components/dashboard-layout'
import { CellAmount, CellEnd, CellMeta, CellPrimary } from '../components/typography'
import { Badge, SkeletonBlock, StatusBanner } from '../components/ui-primitives'
import { formatCurrency, getStatusTone } from './lib/dashboard-helpers'

export default function HomeScreen() {
  const summaryQuery = useGetSummary()
  const summary = summaryQuery.data?.data

  if (summaryQuery.isLoading) {
    return (
      <AppShell title="Overview" subtitle="Orders today · revenue · kitchen queue">
        <MetricGrid>
          <SkeletonBlock height={100} />
          <SkeletonBlock height={100} />
          <SkeletonBlock height={100} />
        </MetricGrid>
        <SkeletonBlock height={220} />
      </AppShell>
    )
  }

  if (summaryQuery.isError || !summary) {
    const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8787'
    const detail =
      summaryQuery.error instanceof Error
        ? summaryQuery.error.message
        : 'Request failed. If you opened the app via a LAN IP, ensure CORS allows that origin and the API URL is reachable from the browser.'

    return (
      <AppShell title="Overview">
        <StatusBanner
          tone="error"
          title="Unable to load dashboard data"
          body={`Could not reach ${apiBase}/summary. ${detail}`}
        />
      </AppShell>
    )
  }

  return (
    <AppShell title="Overview" subtitle="Orders today · revenue · kitchen queue">
      <MetricGrid>
        <MetricCard label="Orders today" value={summary.ordersToday} accent="brand" />
        <MetricCard label="Revenue today" value={formatCurrency(summary.revenueToday)} />
        <MetricCard
          label="Pending orders"
          value={summary.pendingOrders}
          accent={summary.pendingOrders > 3 ? 'warning' : 'default'}
          hint={summary.pendingOrders > 3 ? 'Queue needs attention' : undefined}
        />
      </MetricGrid>

      <View style={styles.columns}>
        <View style={styles.column}>
        <Panel title="Popular items" subtitle="Most ordered today">
          {summary.popularItems.length === 0 ? (
            <Text style={styles.empty}>No order data yet.</Text>
          ) : (
            summary.popularItems.map((item, index) => (
              <ListRow
                key={item.name}
                leading={
                  <View style={styles.rankRow}>
                    <Text style={styles.rank}>#{index + 1}</Text>
                    <CellPrimary>{item.name}</CellPrimary>
                  </View>
                }
                trailing={
                  <CellEnd>
                    <CellMeta>{item.count} orders</CellMeta>
                  </CellEnd>
                }
              />
            ))
          )}
        </Panel>
        </View>

        <View style={styles.column}>
        <Panel title="Recent orders" subtitle="Latest activity from the kitchen queue">
          {summary.recentOrders.length === 0 ? (
            <Text style={styles.empty}>No orders yet.</Text>
          ) : (
            summary.recentOrders.map((order) => (
              <ListRow
                key={order.id}
                leading={
                  <>
                    <CellPrimary>#{order.id} · {order.customerName}</CellPrimary>
                    <CellMeta>{new Date(order.createdAt).toLocaleString()}</CellMeta>
                  </>
                }
                trailing={
                  <CellEnd>
                    <Badge tone={getStatusTone(order.status)} label={order.status} />
                    <CellAmount>{formatCurrency(order.total)}</CellAmount>
                  </CellEnd>
                }
              />
            ))
          )}
        </Panel>
        </View>
      </View>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[4]
  },
  column: {
    flex: 1,
    minWidth: 320
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2]
  },
  rank: {
    width: 28,
    color: tokens.colors.brand[700],
    fontWeight: tokens.typography.weights.bold,
    fontSize: tokens.typography.sizes.sm
  },
  empty: {
    color: tokens.colors.neutral[600],
    paddingVertical: tokens.spacing[2]
  }
})
