import { useMemo, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { useGetCustomers, useGetCustomersIdOrders } from '@odyssey/api-client'
import { tokens } from '@odyssey/shared'
import { AppShell } from '../components/app-shell'
import { Card, DetailCard, DetailRow, DetailSection, ListRow } from '../components/dashboard-layout'
import { ActionLink, CellAmount, CellEnd, CellMeta, CellPrimary, CellActions } from '../components/typography'
import { Badge, DataTable, SkeletonBlock, StatusBanner } from '../components/ui-primitives'
import { formatCurrency, getStatusTone } from './lib/dashboard-helpers'

export default function CRMPage() {
  const customersQuery = useGetCustomers()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const customers = useMemo(() => customersQuery.data?.data ?? [], [customersQuery.data])
  const selected = useMemo(() => customers.find((c) => c.id === selectedId) ?? null, [customers, selectedId])
  const ordersQuery = useGetCustomersIdOrders(selected?.id ?? 0, {
    query: {
      enabled: selected?.id != null,
      queryKey: ['/customers', selected?.id, 'orders']
    }
  })
  const orders = ordersQuery.data?.data ?? []

  if (customersQuery.isLoading) {
    return <AppShell title="Customers" subtitle="Profiles and order history"><SkeletonBlock height={240} /></AppShell>
  }
  if (customersQuery.isError) {
    return <AppShell title="Customers" subtitle="Profiles and order history"><StatusBanner tone="error" title="Could not load customers" /></AppShell>
  }

  return (
    <AppShell title="Customers" subtitle="Profiles and order history">
      <Card title={`${customers.length} customers`} flush>
        <DataTable
          columns={[
            { key: 'n', header: 'Name', flex: 1, minWidth: 120, render: (c) => <CellPrimary>{c.name}</CellPrimary> },
            { key: 'e', header: 'Email', flex: 1, minWidth: 160, render: (c) => <CellMeta>{c.email}</CellMeta> },
            {
              key: 'o',
              header: 'Orders',
              width: 72,
              align: 'right',
              render: (c) => (
                <CellEnd>
                  <CellMeta>{c.ordersCount}</CellMeta>
                </CellEnd>
              )
            },
            {
              key: 's',
              header: 'Spend',
              width: 96,
              align: 'right',
              render: (c) => (
                <CellEnd>
                  <CellAmount>{formatCurrency(c.totalSpend)}</CellAmount>
                </CellEnd>
              )
            },
            {
              key: 'a',
              header: '',
              width: 56,
              align: 'right',
              render: (c) => (
                <CellActions>
                  <ActionLink onPress={() => setSelectedId(c.id)}>View</ActionLink>
                </CellActions>
              )
            }
          ]}
          rows={customers}
          selectedRowId={selected?.id}
          onRowPress={(c) => setSelectedId(c.id)}
          emptyMessage="No customers yet."
        />
      </Card>

      {selected ? (
        <DetailCard title={selected.name}>
          <DetailRow label="Email" value={selected.email} />
          <DetailRow label="Phone" value={selected.phone || '—'} />
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statN}>{selected.ordersCount}</Text><Text style={styles.statL}>Orders</Text></View>
            <View style={styles.stat}><Text style={styles.statN}>{formatCurrency(selected.totalSpend)}</Text><Text style={styles.statL}>Spend</Text></View>
          </View>
          <DetailSection title="Recent orders">
            {ordersQuery.isLoading ? (
              <SkeletonBlock height={60} />
            ) : orders.length === 0 ? (
              <CellMeta>No orders yet.</CellMeta>
            ) : (
              orders.map((o) => (
                <ListRow
                  key={o.id}
                  leading={
                    <>
                      <CellPrimary>#{o.id}</CellPrimary>
                      <CellMeta>{new Date(o.createdAt).toLocaleString()}</CellMeta>
                    </>
                  }
                  trailing={
                    <>
                      <Badge tone={getStatusTone(o.status)} label={o.status} />
                      <CellAmount>{formatCurrency(o.total)}</CellAmount>
                    </>
                  }
                />
              ))
            )}
          </DetailSection>
        </DetailCard>
      ) : null}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: tokens.shadow.sm } : {})
  },
  statN: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.brand[600],
    fontVariant: ['tabular-nums']
  },
  statL: {
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.neutral[500],
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: tokens.typography.weights.medium
  }
})
