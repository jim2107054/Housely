import { useState } from 'react';
import { useBookings } from '../api/queries';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

function StatusBadge({ status }) {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useBookings({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });

  const bookings = data?.bookings || data?.items || [];
  const totalPages = data?.totalPages || data?.pagination?.totalPages || 1;

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">
          {row.id?.substring(0, 8)}…
        </span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (row) => row.user?.username || '—',
    },
    {
      key: 'house',
      label: 'Property',
      render: (row) => (
        <span className="max-w-xs block truncate">{row.house?.name || '—'}</span>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check-in',
      render: (row) =>
        row.checkIn ? new Date(row.checkIn).toLocaleDateString() : '—',
    },
    {
      key: 'checkOut',
      label: 'Check-out',
      render: (row) =>
        row.checkOut ? new Date(row.checkOut).toLocaleDateString() : '—',
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (row) =>
        row.totalAmount != null
          ? `BDT ${row.totalAmount.toLocaleString()}`
          : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all bookings</p>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={bookings}
            loading={isLoading}
            emptyMessage="No bookings found."
          />
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </Layout>
  );
}
