import { useCallback, useMemo, useRef, useState } from 'react'
import { Eye, RefreshCw, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import DataTable from '../../components/DataTable/DataTable'
import Pagination from '../../components/Pagination/Pagination'
import SearchInput from '../../components/SearchInput/SearchInput'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import DetailList from '../../components/DetailList/DetailList'
import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import { useAdminAuth } from '../../context/useAdminAuth'
import { useToast } from '../../context/toastContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useReveal } from '../../motion/useReveal'
import { usersApi } from '../../services/resources'
import { formatDate, includesQuery, PAGE_SIZE, paginate } from '../../lib/format'

const loadUsers = () => usersApi.list()

export default function Users() {
  const { user: currentUser } = useAdminAuth()
  const toast = useToast()
  const users = useAsyncData(loadUsers)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pageRef = useRef(null)
  const tableRef = useRef(null)
  const ready = Boolean(users.data)

  useReveal(pageRef, '[data-reveal="intro"]', true)
  useReveal(tableRef, '[data-reveal="content"]', ready)

  const currentId = currentUser?.id ? String(currentUser.id) : null
  const all = useMemo(() => users.data ?? [], [users.data])

  const roles = useMemo(() => [...new Set(all.map((u) => u.role).filter(Boolean))].sort(), [all])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(
      (u) => (!roleFilter || u.role === roleFilter) && (!q || includesQuery([u.name, u.email, u.role], q)),
    )
  }, [all, query, roleFilter])

  const pageData = paginate(filtered, page)
  const filtersActive = Boolean(query || roleFilter)

  const cancelDelete = useCallback(() => setPendingDelete(null), [])

  const resetPaging = () => setPage(1)

  async function refresh() {
    setRefreshing(true)
    const result = await users.reload()
    setRefreshing(false)
    if (!result.ok) toast.error(result.error?.message || 'Users could not be refreshed.')
  }

  async function confirmDelete() {
    const target = pendingDelete
    setDeleting(true)
    try {
      await usersApi.remove(target.id)
      toast.success(`Deleted ${target.email || target.name || 'the user'}.`)
      setPendingDelete(null)
      if (viewing?.id === target.id) setViewing(null)
      await users.reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
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
    {
      key: 'actions',
      header: 'Actions',
      className: 'actions-cell',
      render: (u) => {
        const isSelf = currentId !== null && String(u.id) === currentId
        const label = u.email || u.name || 'user'
        return (
          <div className="row-actions">
            <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewing(u)} aria-label={`View ${label}`}>
              View
            </Button>
            <Button
              variant="danger-ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setPendingDelete(u)}
              disabled={isSelf || !u.id}
              title={isSelf ? 'You cannot delete your own account' : undefined}
              aria-label={`Delete ${label}`}
            >
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Management"
        title="Users"
        description="Registered APPLIO accounts. Deleting a user is permanent and is confirmed first."
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={refresh}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      <div className="toolbar" data-reveal="intro">
        <SearchInput
          label="Search users"
          placeholder="Search by name or email"
          value={query}
          onChange={(value) => { setQuery(value); resetPaging() }}
        />
        <select
          aria-label="Filter by role"
          className="select"
          value={roleFilter}
          onChange={(event) => { setRoleFilter(event.target.value); resetPaging() }}
          disabled={roles.length === 0}
        >
          <option value="">All roles</option>
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setRoleFilter(''); resetPaging() }}>
            Clear filters
          </Button>
        )}
      </div>

      {users.status === 'loading' && !users.data && <LoadingState label="Loading users…" />}
      {users.status === 'error' && (
        <ErrorState error={users.error} onRetry={users.reload} title="Users could not be loaded" />
      )}

      {ready && (
        <div ref={tableRef}>
          <div data-reveal="content">
            <DataTable
              columns={columns}
              rows={pageData.items}
              rowKey={(u) => u.id ?? u.email}
              emptyTitle={filtersActive ? 'No users match these filters' : 'No registered users'}
              emptyText={filtersActive ? 'Try a different search or clear the filters.' : ''}
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

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} labelledBy="user-view-title" size="md">
        {viewing && (
          <>
            <h2 id="user-view-title" className="modal-title">User details</h2>
            <DetailList
              items={[
                { label: 'Name', value: viewing.name },
                { label: 'Email', value: viewing.email },
                { label: 'Role', value: viewing.role },
                { label: 'Joined', value: formatDate(viewing.createdAt) },
                { label: 'Account ID', value: viewing.id },
              ]}
            />
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this user?"
        message={`This permanently removes ${pendingDelete?.email || pendingDelete?.name || 'this account'}. The backend decides whether the deletion is allowed.`}
        confirmLabel="Delete user"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}
