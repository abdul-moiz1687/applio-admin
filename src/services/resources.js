import { api, endpoints } from './api'
import {
  normalizeAppliance,
  normalizeList,
  normalizeService,
  normalizeUser,
} from './normalize'
export const usersApi = {
  async list() {
    const { data } = await api.get(endpoints.users.list)
    return normalizeList(data, ['users', 'data', 'items']).map(normalizeUser)
  },
  async remove(id) {
    const { data } = await api.delete(endpoints.users.remove(id))
    return data
  },
}

export const servicesApi = {
  async list() {
    const { data } = await api.get(endpoints.services.list)

    return normalizeList(data, [
      'services',
      'serviceRecords',
      'records',
      'data',
      'items',
    ]).map(normalizeService)
  },
}
export const appliancesApi = {
  async list() {
    const { data } = await api.get(endpoints.appliances.list)
    return normalizeList(data, ['appliances', 'data', 'items']).map(normalizeAppliance)
  },
  async detail(id) {
    const { data } = await api.get(endpoints.appliances.detail(id))
    return normalizeAppliance(data?.appliance ?? data)
  },
  async qr(id) {
    const { data } = await api.get(endpoints.appliances.qr(id))
    return { publicUrl: data?.publicUrl ?? null, qrCode: data?.qrCode ?? null }
  },
}
