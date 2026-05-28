import { useState } from 'react'
import type { MenuItem, MenuCategory } from '@odyssey/api-client'

export type ItemDraft = {
  name: string
  description: string
  price: string
  category: string
  available: boolean
}

export type CategoryDraft = {
  name: string
  description: string
  sortOrder: string
}

export function useMenuForm() {
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success' | 'warning'; title: string; body?: string } | null>(null)

  const [itemDraft, setItemDraft] = useState<ItemDraft>({
    name: '',
    description: '',
    price: '',
    category: 'Mains',
    available: true
  })

  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>({
    name: '',
    description: '',
    sortOrder: '1'
  })

  const openNewItem = (defaultCategory: string) => {
    setEditingItemId(null)
    setItemDraft({ name: '', description: '', price: '', category: defaultCategory, available: true })
    setItemModalOpen(true)
  }

  const openEditItem = (item: MenuItem) => {
    setEditingItemId(item.id)
    setItemDraft({
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      category: item.category,
      available: item.available
    })
    setItemModalOpen(true)
  }

  const openNewCategory = (nextSortOrder: number) => {
    setEditingCategoryId(null)
    setCategoryDraft({ name: '', description: '', sortOrder: String(nextSortOrder) })
    setCategoryModalOpen(true)
  }

  const openEditCategory = (cat: MenuCategory) => {
    setEditingCategoryId(cat.id)
    setCategoryDraft({ name: cat.name, description: cat.description ?? '', sortOrder: String(cat.sortOrder) })
    setCategoryModalOpen(true)
  }

  const validateItemDraft = () => {
    const price = Number(itemDraft.price)
    if (!itemDraft.name.trim() || !Number.isFinite(price) || price <= 0) {
      setFeedback({ tone: 'warning', title: 'Fill name and price' })
      return null
    }
    return {
      name: itemDraft.name.trim(),
      description: itemDraft.description.trim(),
      price,
      available: itemDraft.available,
      category: itemDraft.category
    }
  }

  const validateCategoryDraft = () => {
    const sortOrder = Number(categoryDraft.sortOrder)
    if (!categoryDraft.name.trim() || !Number.isFinite(sortOrder)) {
      setFeedback({ tone: 'warning', title: 'Fill name and valid sort order' })
      return null
    }
    return {
      name: categoryDraft.name.trim(),
      description: categoryDraft.description.trim(),
      sortOrder
    }
  }

  return {
    itemModalOpen, setItemModalOpen,
    categoryModalOpen, setCategoryModalOpen,
    editingItemId, editingCategoryId,
    feedback, setFeedback,
    itemDraft, setItemDraft,
    categoryDraft, setCategoryDraft,
    openNewItem, openEditItem,
    openNewCategory, openEditCategory,
    validateItemDraft, validateCategoryDraft
  }
}
