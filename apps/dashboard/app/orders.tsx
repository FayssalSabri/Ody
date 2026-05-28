import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { type GetOrdersParams, useGetCustomers, useGetMenuItems, useGetOrders } from '@odyssey/api-client'
import { tokens } from '@odyssey/shared'
import { AppShell } from '../components/app-shell'
import { PageTabs } from '../components/page-tabs'
import { Card, DetailCard, DetailRow, DetailSection, FilterCard, LineItemRow } from '../components/dashboard-layout'
import { ActionLink, CellAmount, CellEnd, CellMeta, CellPrimary, CellActions } from '../components/typography'
import {
  Badge,
  Button,
  DataTable,
  InputField,
  ModalSheet,
  SearchField,
  SelectField,
  SkeletonBlock,
  StatusBanner
} from '../components/ui-primitives'
import { formatActionLabel, formatCurrency, getAllowedActions, getStatusTone, type OrderAction } from './lib/dashboard-helpers'
import { useOrderActions } from './hooks/use-order-actions'
import { useCreateOrderFlow } from './hooks/use-create-order-flow'

type OrdersTab = 'queue' | 'all'

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

export default function OrdersScreen() {
  const { createMutation, runAction, isBusy } = useOrderActions()
  const [tab, setTab] = useState<OrdersTab>('queue')
  const [filters, setFilters] = useState<GetOrdersParams>({})
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const ordersQuery = useGetOrders(filters)
  const customersQuery = useGetCustomers()
  const menuQuery = useGetMenuItems()

  const orders = useMemo(() => {
    const rows = ordersQuery.data?.data ?? []
    return tab === 'queue' ? rows.filter((o) => !['completed', 'cancelled'].includes(o.status)) : rows
  }, [ordersQuery.data, tab])

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId])
  const customers = customersQuery.data?.data ?? []
  const menuItems = menuQuery.data?.data ?? []

  const { draft, setDraft, feedback, setFeedback, orderTotal, validateDraft, resetDraft } = useCreateOrderFlow(menuItems)

  const handleCreateOrder = () => {
    const payload = validateDraft()
    if (!payload) return

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          setCreateOpen(false)
          resetDraft()
        }
      }
    )
  }

  const tabs = (
    <PageTabs
      tabs={[
        { id: 'queue', label: 'Active queue' },
        { id: 'all', label: 'All orders' }
      ]}
      value={tab}
      onChange={setTab}
    />
  )

  const runOrderAction = async (action: OrderAction) => {
    if (!selected) return
    try {
      await runAction(selected.id, action)
      setFeedback({ tone: 'success', title: 'Updated', body: formatActionLabel(action) })
    } catch (e) {
      setFeedback({ tone: 'error', title: 'Failed', body: e instanceof Error ? e.message : undefined })
    }
  }

  if (ordersQuery.isLoading) {
    return <AppShell title="Orders" subtitle="Kitchen workflow" tabs={tabs}><SkeletonBlock height={280} /></AppShell>
  }
  if (ordersQuery.isError) {
    return <AppShell title="Orders" subtitle="Kitchen workflow" tabs={tabs}><StatusBanner tone="error" title="Could not load orders" /></AppShell>
  }

  return (
    <AppShell
      title="Orders"
      subtitle="Kitchen workflow"
      tabs={tabs}
      actions={<Button size="sm" onPress={() => setCreateOpen(true)}>New order</Button>}
    >
      {feedback ? <StatusBanner tone={feedback.tone} title={feedback.title} body={feedback.body} /> : null}

      <SearchField value={search} onChangeText={setSearch} placeholder="Search customer…" />

      <FilterCard>
        <SelectField
          label="Status"
          value={filters.status ?? ''}
          options={statusOptions}
          onSelect={(v) => setFilters((f) => {
            const n = { ...f }
            if (v) {
              n.status = v as GetOrdersParams['status']
            } else {
              delete n.status
            }
            return n
          })}
        />
        <View style={styles.filterBtns}>
          <Button size="sm" onPress={() => setFilters({ ...(search.trim() ? { search: search.trim() } : {}), ...(filters.status ? { status: filters.status } : {}) })}>Apply</Button>
          <Button size="sm" variant="secondary" onPress={() => { setFilters({}); setSearch('') }}>Reset</Button>
        </View>
      </FilterCard>

      <Card title={`${orders.length} orders`} flush>
        <DataTable
          columns={[
            { key: 'c', header: 'Customer', flex: 1, minWidth: 140, render: (o) => <CellPrimary>{o.customerName}</CellPrimary> },
            {
              key: 's',
              header: 'Status',
              width: 100,
              align: 'right',
              render: (o) => (
                <CellEnd>
                  <Badge tone={getStatusTone(o.status)} label={o.status} />
                </CellEnd>
              )
            },
            {
              key: 't',
              header: 'Total',
              width: 88,
              align: 'right',
              render: (o) => (
                <CellEnd>
                  <CellAmount>{formatCurrency(o.total)}</CellAmount>
                </CellEnd>
              )
            },
            {
              key: 'd',
              header: 'Placed',
              width: 168,
              align: 'right',
              render: (o) => (
                <CellEnd>
                  <CellMeta>{new Date(o.createdAt).toLocaleString()}</CellMeta>
                </CellEnd>
              )
            },
            {
              key: 'a',
              header: '',
              width: 56,
              align: 'right',
              render: (o) => (
                <CellActions>
                  <ActionLink onPress={() => setSelectedId(o.id)}>Open</ActionLink>
                </CellActions>
              )
            }
          ]}
          rows={orders}
          selectedRowId={selected?.id}
          onRowPress={(o) => setSelectedId(o.id)}
          emptyMessage="No orders found."
        />
      </Card>

      {selected ? (
        <DetailCard
          title={selected.customerName}
          badge={<Badge tone={getStatusTone(selected.status)} label={selected.status} />}
          footer={
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalVal}>{formatCurrency(selected.total)}</Text>
              </View>
              <View style={styles.actionRow}>
                {getAllowedActions(selected.status).map((a) => (
                  <Button key={a} size="sm" variant={a === 'cancel' ? 'secondary' : 'primary'} onPress={() => runOrderAction(a)} disabled={isBusy}>
                    {formatActionLabel(a)}
                  </Button>
                ))}
              </View>
            </>
          }
        >
          <DetailRow label="Order" value={`#${selected.id}`} />
          <DetailRow label="Placed" value={new Date(selected.createdAt).toLocaleString()} />
          <DetailSection title="Items">
            {selected.items.map((item) => (
              <LineItemRow key={item.name} name={item.name} quantity={item.quantity} subtotal={formatCurrency(item.subtotal)} />
            ))}
          </DetailSection>
        </DetailCard>
      ) : null}

      <ModalSheet title="New order" visible={createOpen} onClose={() => setCreateOpen(false)}>
        <SelectField
          label="Customer"
          value={draft.customerId}
          options={customers.map((c) => ({ label: c.name, value: String(c.id) }))}
          onSelect={(v) => setDraft((d) => ({ ...d, customerId: v }))}
        />
        {draft.items.map((item, i) => {
          const menu = menuItems.find((m) => String(m.id) === item.menuItemId)
          const lineTotal = menu && Number(item.quantity) > 0 ? formatCurrency(menu.price * Number(item.quantity)) : '—'

          return (
            <View key={i} style={styles.lineItemBlock}>
              <View style={styles.lineItemRow}>
                <SelectField
                  label={`Item ${i + 1}`}
                  value={item.menuItemId}
                  options={menuItems.map((m) => ({ label: `${m.name} — ${formatCurrency(m.price)}`, value: String(m.id) }))}
                  onSelect={(v) => setDraft((d) => ({
                    ...d,
                    items: d.items.map((x, j) => (j === i ? { ...x, menuItemId: v } : x))
                  }))}
                />
                <InputField
                  label="Qty"
                  value={item.quantity}
                  onChangeText={(v) => setDraft((d) => ({
                    ...d,
                    items: d.items.map((x, j) => (j === i ? { ...x, quantity: v } : x))
                  }))}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.lineItemMeta}>
                <Text style={styles.lineItemTotal}>{lineTotal}</Text>
                {draft.items.length > 1 ? (
                  <ActionLink
                    onPress={() => setDraft((d) => ({
                      ...d,
                      items: d.items.filter((_, j) => j !== i)
                    }))}
                  >
                    Remove
                  </ActionLink>
                ) : null}
              </View>
            </View>
          )
        })}
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setDraft((d) => ({
            ...d,
            items: [...d.items, { menuItemId: '', quantity: '1' }]
          }))}
        >
          Add line
        </Button>
        <View style={styles.orderSummary}>
          <Text style={styles.summaryLabel}>Order total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(orderTotal)}</Text>
        </View>
        <View style={styles.actionRow}>
          <Button size="sm" onPress={handleCreateOrder} disabled={isBusy}>
            Create
          </Button>
          <Button size="sm" variant="secondary" onPress={() => setCreateOpen(false)}>
            Cancel
          </Button>
        </View>
      </ModalSheet>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  filterBtns: { flexDirection: 'row', gap: 8, paddingTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: tokens.colors.neutral[500], fontSize: tokens.typography.sizes.sm },
  totalVal: { fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold, color: tokens.colors.neutral[900] },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lineItemBlock: { gap: 10, marginBottom: 14, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.radius.md, padding: 12, borderWidth: 1, borderColor: tokens.border.subtle },
  lineItemRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' },
  lineItemMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  lineItemTotal: { color: tokens.colors.neutral[700], fontSize: tokens.typography.sizes.sm, fontWeight: tokens.typography.weights.semibold },
  orderSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: tokens.border.subtle, marginTop: 12 },
  summaryLabel: { color: tokens.colors.neutral[500], fontSize: tokens.typography.sizes.sm },
  summaryValue: { fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold, color: tokens.colors.neutral[900] }
})
