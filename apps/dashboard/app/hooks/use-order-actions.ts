import {
  usePostOrders,
  usePostOrdersIdAccept,
  usePostOrdersIdCancel,
  usePostOrdersIdComplete,
  usePostOrdersIdPrepare,
  usePostOrdersIdReady
} from '@odyssey/api-client'
import { useQueryClient } from '@tanstack/react-query'
import type { OrderAction } from '../lib/dashboard-helpers'

export function useOrderActions() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['/orders'] })
    queryClient.invalidateQueries({ queryKey: ['/summary'] })
    queryClient.invalidateQueries({ queryKey: ['/customers'] })
  }

  const createMutation = usePostOrders({ mutation: { onSuccess: invalidate } })
  const acceptMutation = usePostOrdersIdAccept({ mutation: { onSuccess: invalidate } })
  const prepareMutation = usePostOrdersIdPrepare({ mutation: { onSuccess: invalidate } })
  const readyMutation = usePostOrdersIdReady({ mutation: { onSuccess: invalidate } })
  const completeMutation = usePostOrdersIdComplete({ mutation: { onSuccess: invalidate } })
  const cancelMutation = usePostOrdersIdCancel({ mutation: { onSuccess: invalidate } })

  const mutations = {
    accept: acceptMutation,
    prepare: prepareMutation,
    ready: readyMutation,
    complete: completeMutation,
    cancel: cancelMutation
  }

  const runAction = async (orderId: number, action: OrderAction) => {
    await mutations[action].mutateAsync({ id: orderId })
  }

  const isBusy =
    createMutation.isPending || Object.values(mutations).some((mutation) => mutation.isPending)

  return {
    createMutation,
    runAction,
    isBusy
  }
}
