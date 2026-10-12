import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Smartphone, Users, Wrench } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import StatCard from '../../components/StatCard/StatCard'
import DataTable from '../../components/DataTable/DataTable'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import Button from '../../components/Button/Button'
import { useToast } from '../../context/toastContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useCountUp } from '../../motion/useCountUp'
import { useReveal } from '../../motion/useReveal'
import { appliancesApi, servicesApi, usersApi } from '../../services/resources'
import { formatDate } from '../../lib/format'

/** Loads the three counts independently so one failing endpoint does not hide the others. */
async function loadOverview() {
  const [users, appliances, services] = await Promise.allSettled([
    usersApi.list(),
    appliancesApi.list(),
    servicesApi.list(),
  ])
  if ([users, appliances, services].every((r) => r.status === 'rejected')) {
    throw users.reason
  }
  const pick = (result) => (result.status === 'fulfilled' ? { data: result.value, error: null } : { data: null, error: result.reason })
  return { users: pick(users), appliances: pick(appliances), services: pick(services) }
}

const columns = [
  { key: 'name', header: 'Name', render: (u) => u.name || '—' },
  { key: 'email', header: 'Email' },
  {
    key: 'role',
    header: 'Role',
    render: (u) => <StatusBadge tone={u.role === 'admin' ? 'accent' : 'muted'}>{u.role}</StatusBadge>,
  },
  { key: 'createdAt', header: 'Joined', render: (u) => formatDate(u.createdAt) },
]

export default function Dashboard() {
  const overview = useAsyncData(loadOverview)
  const toast = useToast()
  const [refreshing, setRefreshing] = useState(false)
  const pageRef = useRef(null)
  const contentRef = useRef(null)

  const { data } = overview
  const users = data?.users.data ?? null
  const appliances = data?.appliances.data ?? null
  const services = data?.services.data ?? null

  const usersCount = useCountUp(users ? users.length : null, { enabled: Boolean(users) })
  const appliancesCount = useCountUp(appliances ? appliances.length : null, { enabled: Boolean(appliances) })
  const servicesCount = useCountUp(services ? services.length : null, { enabled: Boolean(services) })

  const recentUsers = useMemo(
    () =>
      (users ?? [])
        .filter((u) => u.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [users],
  )

  const contentReady = Boolean(data)
  useReveal(pageRef, '[data-reveal="intro"]', true)
  useReveal(contentRef, '[data-reveal="card"]', contentReady)

  async function refresh() {
    setRefreshing(true)
    const result = await overview.reload()
    setRefreshing(false)
    if (result.ok) toast.success('Overview updated.')
    else toast.error(result.error?.message || 'Overview could not be refreshed.')
  }

  const header = (
    <PageHeader
      eyebrow="Overview"
      title="Dashboard"
      description="Live counts from the APPLIO backend. Values update when you refresh."
      actions={
        <Button variant="secondary" icon={RefreshCw} loading={refreshing || overview.status === 'loading'} onClick={refresh}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      }
    />
  )

  return (
    <div ref={pageRef}>
      {header} 

      {overview.status === 'loading' && !data && <LoadingState label="Loading overview…" />}

      {overview.status === 'error' && (
        <ErrorState error={overview.error} onRetry={overview.reload} title="Overview could not be loaded" />
      )}

      {contentReady && (
        <div ref={contentRef}>
          <div className="stat-grid">
            <div data-reveal="card">
              <StatCard
                label="Registered users"
                icon={Users}
                value={usersCount}
                unavailable={!users}
                hint={data.users.error ? data.users.error.message : 'Accounts returned by the users API'}
              />
            </div>
            <div data-reveal="card">
              <StatCard
                label="Appliances"
                icon={Smartphone}
                value={appliancesCount}
                unavailable={!appliances}
                hint={data.appliances.error ? data.appliances.error.message : 'Records in the appliance inventory'}
              />
            </div>
            <div data-reveal="card">
              <StatCard
                label="Service records"
                icon={Wrench}
                value={servicesCount}
                unavailable={!services}
                hint={data.services.error ? data.services.error.message : 'Records from the global service history'}
              />
            </div>
          </div>

          <section className="panel" data-reveal="card" aria-labelledby="recent-users-heading">
            <div className="panel-header">
              <div>
                <h2 id="recent-users-heading">Recent registrations</h2>
                <p className="muted panel-sub">Newest accounts first, from the users API.</p>
              </div>
              <Link to="/users" className="text-link">View all users</Link>
            </div>
            {data.users.error ? (
              <ErrorState error={data.users.error} title="Recent registrations unavailable" />
            ) : (
              <DataTable
                columns={columns}
                rows={recentUsers}
                rowKey={(u) => u.id ?? u.email}
                emptyTitle="No recent registrations"
                emptyText="Users with a creation date will appear here."
              />
            )}
          </section>
        </div>
      )}
    </div>
  )
}
