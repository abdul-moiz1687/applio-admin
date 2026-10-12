import { useMemo, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import DataTable from '../../components/DataTable/DataTable'
import Pagination from '../../components/Pagination/Pagination'
import SearchInput from '../../components/SearchInput/SearchInput'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import Button from '../../components/Button/Button'
import { useToast } from '../../context/toastContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useReveal } from '../../motion/useReveal'
import { appliancesApi, servicesApi } from '../../services/resources'
import { describeAppliance } from '../../services/normalize'
import { formatAmount, formatDate, includesQuery, PAGE_SIZE, paginate } from '../../lib/format'

/** Global service history plus appliance names, so each record can name its appliance. */
async function loadServiceRecords() {
  const [services, appliances] = await Promise.allSettled([servicesApi.list(), appliancesApi.list()])
  if (services.status === 'rejected') throw services.reason
  return {
    services: services.value,
    appliances: appliances.status === 'fulfilled' ? appliances.value : [],
    applianceError: appliances.status === 'rejected' ? appliances.reason : null,
  }
}

export default function ServiceRecords() {
  const records = useAsyncData(loadServiceRecords)
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [applianceFilter, setApplianceFilter] = useState('')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const pageRef = useRef(null)
  const tableRef = useRef(null)
  const ready = Boolean(records.data)

  useReveal(pageRef, '[data-reveal="intro"]', true)
  useReveal(tableRef, '[data-reveal="content"]', ready)

  const services = useMemo(() => records.data?.services ?? [], [records.data])
  const appliances = useMemo(() => records.data?.appliances ?? [], [records.data])

  // Resolve appliance names from the appliance list when a record only carries an id.
  const applianceTitles = useMemo(() => {
    const map = new Map()
    appliances.forEach((a) => map.set(String(a.id), describeAppliance(a)))
    return map
  }, [appliances])

  const titleFor = (service) =>
    service.applianceLabel || (service.applianceId ? applianceTitles.get(service.applianceId) : '') || service.applianceId || '—'

  const applianceOptions = useMemo(() => {
    const ids = new Set(services.map((s) => s.applianceId).filter(Boolean))
    return [...ids].map((id) => ({ id, label: applianceTitles.get(id) || id })).sort((a, b) => a.label.localeCompare(b.label))
  }, [services, applianceTitles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return services.filter(
      (s) =>
        (!applianceFilter || s.applianceId === applianceFilter) &&
        (!q || includesQuery([s.description, s.technician, applianceTitles.get(s.applianceId), s.applianceLabel], q)),
    )
  }, [services, query, applianceFilter, applianceTitles])

  const pageData = paginate(filtered, page)
  const filtersActive = Boolean(query || applianceFilter)

  async function refresh() {
    setRefreshing(true)
    const result = await records.reload()
    setRefreshing(false)
    if (result.ok) toast.success('Service records updated.')
    else toast.error(result.error?.message || 'Service records could not be refreshed.')
  }

  const columns = [
    {
      key: 'appliance',
      header: 'Appliance',
      render: (s) => <span className="cell-title">{titleFor(s)}</span>,
    },
    { key: 'date', header: 'Service date', render: (s) => formatDate(s.date) },
    { key: 'description', header: 'Description', render: (s) => s.description || '—' },
    { key: 'technician', header: 'Technician', render: (s) => s.technician || '—' },
    { key: 'cost', header: 'Cost', className: 'num', render: (s) => formatAmount(s.cost) },
  ]

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Management"
        title="Service records"
        description="Service history across all appliances, newest records as returned by the API."
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={refresh}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {records.status === 'loading' && !records.data && <LoadingState label="Loading service records…" />}
      {records.status === 'error' && (
        <ErrorState error={records.error} onRetry={records.reload} title="Service records could not be loaded" />
      )}

      {ready && records.applianceError && (
        <div className="alert alert-info" role="note">
          Appliance names could not be loaded, so records show appliance IDs instead. Records themselves are unaffected.
        </div>
      )}

      {ready && (
        <>
          <div className="toolbar" data-reveal="intro">
            <SearchInput
              label="Search service records"
              placeholder="Search appliance, description, or technician"
              value={query}
              onChange={(value) => { setQuery(value); setPage(1) }}
            />
            <select
              aria-label="Filter by appliance"
              className="select"
              value={applianceFilter}
              onChange={(event) => { setApplianceFilter(event.target.value); setPage(1) }}
              disabled={applianceOptions.length === 0}
            >
              <option value="">All appliances</option>
              {applianceOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setApplianceFilter(''); setPage(1) }}>
                Clear filters
              </Button>
            )}
          </div>

          <div ref={tableRef}>
            <div data-reveal="content">
              <DataTable
                columns={columns}
                rows={pageData.items}
                rowKey={(s) => s.id}
                emptyTitle={filtersActive ? 'No service records match these filters' : 'No service records yet'}
                emptyText={filtersActive ? 'Clear the search or appliance filter.' : ''}
              />
            </div>
            <Pagination
              page={pageData.page}
              pageCount={pageData.pageCount}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
