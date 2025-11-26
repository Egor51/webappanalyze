/**
 * React Query mutation для отправки заявки на срочную продажу
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitUrgentSaleForm } from '../api'
import { queryKeys } from '../../../lib/react-query'
import type { UrgentSaleFormData, UrgentSaleFormResponse } from '../types'

export const useSubmitUrgentSaleForm = () => {
  const queryClient = useQueryClient()

  return useMutation<UrgentSaleFormResponse, Error, UrgentSaleFormData>({
    mutationFn: submitUrgentSaleForm,
    onSuccess: () => {
      // Инвалидируем список заявок после успешной отправки
      queryClient.invalidateQueries({
        queryKey: queryKeys.urgentSale.applications(),
      })
    },
  })
}

