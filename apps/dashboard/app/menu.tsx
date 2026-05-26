import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  useGetCategories,
  useGetMenuItems,
  usePatchMenuItemsId,
  usePatchCategoriesId,
  usePostCategories,
  usePostMenuItems
} from '@odyssey/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { tokens } from '@odyssey/shared'
import { AppShell } from '../components/app-shell'
import { Card } from '../components/dashboard-layout'
import { ActionLink, CellActions, CellAmount, CellEnd, CellSecondary, CellStack } from '../components/typography'
import { formatCurrency } from './lib/dashboard-helpers'
import {
  Badge,
  Button,
  DataTable,
  InputField,
  ModalSheet,
  SelectField,
  SkeletonBlock,
  StatusBanner,
  ToggleField
} from '../components/ui-primitives'

export default function MenuScreen() {
  const queryClient = useQueryClient()
  const menuQuery = useGetMenuItems()
  const categoriesQuery = useGetCategories()

  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success' | 'warning'; title: string; body?: string } | null>(null)
  const [itemDraft, setItemDraft] = useState({ name: '', description: '', price: '', category: 'Mains', available: true })
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '', sortOrder: '1' })

  const createItemMutation = usePostMenuItems({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/menu-items'] })
        setFeedback({ tone: 'success', title: 'Item saved' })
        setItemModalOpen(false)
      },
      onError: (e) => setFeedback({ tone: 'error', title: 'Save failed', body: e.message })
    }
  })
  const updateItemMutation = usePatchMenuItemsId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/menu-items'] })
        setFeedback({ tone: 'success', title: 'Item updated' })
        setItemModalOpen(false)
      },
      onError: (e) => setFeedback({ tone: 'error', title: 'Save failed', body: e.message })
    }
  })
  const createCategoryMutation = usePostCategories({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/categories'] })
        setFeedback({ tone: 'success', title: 'Category created' })
        setCategoryModalOpen(false)
      },
      onError: (e) => setFeedback({ tone: 'error', title: 'Save failed', body: e.message })
    }
  })
  const updateCategoryMutation = usePatchCategoriesId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/categories'] })
        queryClient.invalidateQueries({ queryKey: ['/menu-items'] })
        setFeedback({ tone: 'success', title: 'Category updated' })
        setCategoryModalOpen(false)
      },
      onError: (e) => setFeedback({ tone: 'error', title: 'Save failed', body: e.message })
    }
  })

  const menuItems = useMemo(() => menuQuery.data?.data ?? [], [menuQuery.data])
  const categories = useMemo(() => categoriesQuery.data?.data ?? [], [categoriesQuery.data])
  const isBusy = createItemMutation.isPending || updateItemMutation.isPending || createCategoryMutation.isPending || updateCategoryMutation.isPending
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.name }))

  const headerActions = (
    <>
      <Button size="sm" variant="secondary" onPress={() => { setEditingCategoryId(null); setCategoryDraft({ name: '', description: '', sortOrder: String(categories.length + 1) }); setCategoryModalOpen(true) }}>New category</Button>
      <Button size="sm" onPress={() => { setEditingItemId(null); setItemDraft({ name: '', description: '', price: '', category: categories[0]?.name ?? 'Mains', available: true }); setItemModalOpen(true) }} disabled={isBusy}>New item</Button>
    </>
  )

  if (menuQuery.isLoading || categoriesQuery.isLoading) {
    return <AppShell title="Menu" subtitle="Manage your catalog" actions={headerActions}><SkeletonBlock height={200} /></AppShell>
  }
  if (menuQuery.isError || categoriesQuery.isError) {
    return <AppShell title="Menu" subtitle="Manage your catalog"><StatusBanner tone="error" title="Could not load menu" /></AppShell>
  }

  return (
    <AppShell title="Menu" subtitle="Manage your catalog" actions={headerActions}>
      {feedback ? <StatusBanner tone={feedback.tone} title={feedback.title} body={feedback.body} /> : null}

      <Card title="Categories" subtitle={`${categories.length} total`}>
        <View style={styles.catRow}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.catCell}>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catCount}>{cat.itemCount} items</Text>
              <ActionLink
                onPress={() => {
                  setEditingCategoryId(cat.id)
                  setCategoryDraft({ name: cat.name, description: cat.description, sortOrder: String(cat.sortOrder) })
                  setCategoryModalOpen(true)
                }}
              >
                Edit
              </ActionLink>
            </View>
          ))}
        </View>
      </Card>

      <Card title="All items" subtitle={`${menuItems.length} on the menu`} flush>
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Item',
              flex: 1,
              minWidth: 180,
              render: (row) => <CellStack primary={row.name} secondary={row.description} />
            },
            { key: 'cat', header: 'Category', width: 96, render: (row) => <CellSecondary>{row.category}</CellSecondary> },
            {
              key: 'price',
              header: 'Price',
              width: 80,
              align: 'right',
              render: (row) => (
                <CellEnd>
                  <CellAmount>{formatCurrency(row.price)}</CellAmount>
                </CellEnd>
              )
            },
            {
              key: 'status',
              header: 'Status',
              width: 72,
              align: 'right',
              render: (row) => (
                <CellEnd>
                  <Badge tone={row.available ? 'success' : 'neutral'} label={row.available ? 'Live' : 'Off'} />
                </CellEnd>
              )
            },
            {
              key: 'actions',
              header: '',
              width: 128,
              align: 'right',
              render: (row) => (
                <CellActions>
                  <ActionLink onPress={() => updateItemMutation.mutate({ id: row.id, data: { available: !row.available } })}>
                    {row.available ? 'Disable' : 'Enable'}
                  </ActionLink>
                  <ActionLink
                    onPress={() => {
                      setEditingItemId(row.id)
                      setItemDraft({ name: row.name, description: row.description ?? '', price: String(row.price), category: row.category, available: row.available })
                      setItemModalOpen(true)
                    }}
                  >
                    Edit
                  </ActionLink>
                </CellActions>
              )
            }
          ]}
          rows={menuItems}
          emptyMessage="No items yet. Create your first menu item."
        />
      </Card>

      <ModalSheet title={editingItemId ? 'Edit item' : 'New item'} visible={itemModalOpen} onClose={() => setItemModalOpen(false)}>
        <InputField label="Name" value={itemDraft.name} onChangeText={(v) => setItemDraft((d) => ({ ...d, name: v }))} />
        <InputField label="Description" value={itemDraft.description} onChangeText={(v) => setItemDraft((d) => ({ ...d, description: v }))} />
        <InputField label="Price" value={itemDraft.price} onChangeText={(v) => setItemDraft((d) => ({ ...d, price: v }))} keyboardType="decimal-pad" />
        <SelectField label="Category" value={itemDraft.category} options={categoryOptions} onSelect={(v) => setItemDraft((d) => ({ ...d, category: v }))} />
        <ToggleField label="Available" value={itemDraft.available} onValueChange={(v) => setItemDraft((d) => ({ ...d, available: v }))} />
        <View style={styles.modalBtns}>
          <Button size="sm" onPress={() => {
            const price = Number(itemDraft.price)
            if (!itemDraft.name.trim() || !Number.isFinite(price) || price <= 0) { setFeedback({ tone: 'warning', title: 'Fill name and price' }); return }
            const payload = { name: itemDraft.name.trim(), description: itemDraft.description.trim(), price, available: itemDraft.available, category: itemDraft.category }
            editingItemId ? updateItemMutation.mutate({ id: editingItemId, data: payload }) : createItemMutation.mutate({ data: payload })
          }} disabled={isBusy}>Save</Button>
          <Button size="sm" variant="secondary" onPress={() => setItemModalOpen(false)}>Cancel</Button>
        </View>
      </ModalSheet>

      <ModalSheet title={editingCategoryId ? 'Edit category' : 'New category'} visible={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
        <InputField label="Name" value={categoryDraft.name} onChangeText={(v) => setCategoryDraft((d) => ({ ...d, name: v }))} />
        <InputField label="Description" value={categoryDraft.description} onChangeText={(v) => setCategoryDraft((d) => ({ ...d, description: v }))} />
        <InputField label="Sort" value={categoryDraft.sortOrder} onChangeText={(v) => setCategoryDraft((d) => ({ ...d, sortOrder: v }))} keyboardType="number-pad" />
        <View style={styles.modalBtns}>
          <Button size="sm" onPress={() => {
            const sortOrder = Number(categoryDraft.sortOrder)
            if (!categoryDraft.name.trim()) return
            const payload = { name: categoryDraft.name.trim(), description: categoryDraft.description.trim(), sortOrder }
            editingCategoryId ? updateCategoryMutation.mutate({ id: editingCategoryId, data: payload }) : createCategoryMutation.mutate({ data: payload })
          }} disabled={isBusy}>Save</Button>
          <Button size="sm" variant="secondary" onPress={() => setCategoryModalOpen(false)}>Cancel</Button>
        </View>
      </ModalSheet>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  catRow: { flexDirection: 'row', gap: 10 },
  catCell: {
    flex: 1,
    minWidth: 0,
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.radius.md,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.border.subtle
  },
  catName: { fontWeight: tokens.typography.weights.semibold, fontSize: tokens.typography.sizes.sm, color: tokens.colors.neutral[900] },
  catCount: { fontSize: tokens.typography.sizes.xs, color: tokens.colors.neutral[500] },
  modalBtns: { flexDirection: 'row', gap: 8, marginTop: 8 }
})
