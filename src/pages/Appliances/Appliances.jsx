import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, QrCode, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import DataTable from '../../components/DataTable/DataTable'
import Pagination from '../../components/Pagination/Pagination'
import SearchInput from '../../components/SearchInput/SearchInput'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import DetailList from '../../components/DetailList/DetailList'
import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import { useToast } from '../../context/toastContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useReveal } from '../../motion/useReveal'
import { appliancesApi } from '../../services/resources'
import { formatDate, includesQuery, PAGE_SIZE, paginate } from '../../lib/format'

const loadAppliances = () => appliancesApi.list()

function ApplianceDialog({ appliance, onClose }) {
  const toast = useToast()
  const [detail, setDetail] = useState({ status: 'idle', data: null, error: null })
  const [qr, setQr] = useState({ status: 'idle', data: null })
  const [attempt, setAttempt] = useState(0)
  const open = Boolean(appliance)
  const id = appliance?.id

  // Fetch the appliance's details whenever a different appliance opens (or a retry is requested).
  useEffect(() => {
    if (!open || !id) return undefined
    let active = true
    setDetail({ status: 'loading', data: null, error: null })
    setQr({ status: 'idle', data: null })
    appliancesApi
      .detail(id)
      .then((data) => {
        if (active) setDetail({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (active) setDetail({ status: 'error', data: null, error })
      })
    return () => {
      active = false
    }
  }, [open, id, attempt])

  async function generateQr() {
    setQr({ status: 'loading', data: null })
    try {
      const data = await appliancesApi.qr(id)
      setQr({ status: 'success', data })
      toast.success('QR code generated.')
    } catch (error) {
      setQr({ status: 'error', data: null })
      toast.error(error.message)
    }
  }

  const shown = detail.data ?? appliance ?? {}

  return (
    <Modal open={open} onClose={onClose} labelledBy="appliance-view-title" size="lg">
      {open && (
        <>
          <h2 id="appliance-view-title" className="modal-title">{shown.name || 'Appliance details'}</h2>
          {detail.status === 'loading' && <LoadingState label="Loading details…" />}
          {detail.status === 'error' && (
            <ErrorState error={detail.error} onRetry={() => setAttempt((n) => n + 1)} title="Details could not be loaded" />
          )}
          {detail.status === 'success' && (
            <DetailList
              items={[
                { label: 'Brand', value: shown.brand },
                { label: 'Model', value: shown.model },
                { label: 'Serial number', value: shown.serialNumber },
                { label: 'Owner', value: shown.owner },
                { label: 'Purchase date', value: formatDate(shown.purchaseDate) },
                { label: 'Warranty duration', value: shown.warrantyDuration },
              ]}
            />
          )}

          <div className="qr-block">
            <h3>Public passport QR</h3>
            {qr.status === 'success' ? (
              <div className="qr-result">
                {qr.data.qrCode && (
                  <img src={qr.data.qrCode} alt={`QR code for ${shown.name || 'this appliance'}`} width="160" height="160" />
                )}
                <div className="qr-meta">
                  <p className="muted">Scan to open the customer-facing passport.</p>
                  {qr.data.publicUrl && (
                    <a href={qr.data.publicUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                      Open public passport ↗
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <Button variant="secondary" icon={QrCode} loading={qr.status === 'loading'} onClick={generateQr}>
                {qr.status === 'loading' ? 'Generating…' : 'Generate QR code'}
              </Button>
            )}
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default function Appliances() {
  const appliances = useAsyncData(loadAppliances)
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const toast = useToast()
  const pageRef = useRef(null)
  const tableRef = useRef(null)
  const ready = Boolean(appliances.data)

  useReveal(pageRef, '[data-reveal="intro"]', true)
  useReveal(tableRef, '[data-reveal="content"]', ready)

  const all = useMemo(() => appliances.data ?? [], [appliances.data])
  const brands = useMemo(
    () => [...new Set(all.map((a) => a.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [all],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(
      (a) => (!brand || a.brand === brand) && (!q || includesQuery([a.name, a.brand, a.model, a.serialNumber, a.owner], q)),
    )
  }, [all, query, brand])

  const pageData = paginate(filtered, page)
  const filtersActive = Boolean(query || brand)

  async function refresh() {
    setRefreshing(true)
    const result = await appliances.reload()
    setRefreshing(false)
    if (!result.ok) toast.error(result.error?.message || 'Appliances could not be refreshed.')
  }

  const columns = [
    {
      key: 'name',
      header: 'Appliance',
      render: (a) => (
        <div className="cell-stack">
          <strong>{a.name || 'Unnamed appliance'}</strong>
          <span className="muted">{[a.brand, a.model].filter(Boolean).join(' ') || '—'}</span>
        </div>
      ),
    },
    { key: 'serialNumber', header: 'Serial number', render: (a) => <span className="mono">{a.serialNumber || '—'}</span> },
    { key: 'owner', header: 'Owner' },
    { key: 'purchaseDate', header: 'Purchased', render: (a) => formatDate(a.purchaseDate) },
    { key: 'warrantyDuration', header: 'Warranty', render: (a) => a.warrantyDuration ?? '—' },
    {
      key: 'actions',
      header: 'Details',
      className: 'actions-cell',
      render: (a) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewing(a)} aria-label={`View details for ${a.name || a.serialNumber}`}>
          View
        </Button>
      ),
    },
  ]

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Management"
        title="Appliances"
        description="Appliance inventory and public passports. Inventory is read-only in this console."
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={refresh}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      <div className="toolbar" data-reveal="intro">
        <SearchInput
          label="Search appliances"
          placeholder="Search name, brand, model, serial, or owner"
          value={query}
          onChange={(value) => { setQuery(value); setPage(1) }}
        />
        <select
          aria-label="Filter by brand"
          className="select"
          value={brand}
          onChange={(event) => { setBrand(event.target.value); setPage(1) }}
          disabled={brands.length === 0}
        >
          <option value="">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setBrand(''); setPage(1) }}>
            Clear filters
          </Button>
        )}
      </div>

      {appliances.status === 'loading' && !appliances.data && <LoadingState label="Loading appliances…" />}
      {appliances.status === 'error' && (
        <ErrorState error={appliances.error} onRetry={appliances.reload} title="Appliances could not be loaded" />
      )}

      {ready && (
        <div ref={tableRef}>
          <div data-reveal="content">
            <DataTable
              columns={columns}
              rows={pageData.items}
              rowKey={(a) => a.id ?? a.serialNumber}
              emptyTitle={filtersActive ? 'No appliances match these filters' : 'No appliances yet'}
              emptyText={filtersActive ? 'Clear the search or brand filter.' : ''}
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
      )}

      <ApplianceDialog appliance={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}
