import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useUsers } from '../api/queries';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

function RoleBadge({ role }) {
  const colors = {
    USER: 'bg-blue-100 text-blue-800',
    AGENT: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[role] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {role}
    </span>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    role: roleFilter || undefined,
  });

  const users = data?.users || data?.items || [];
  const totalPages = data?.totalPages || data?.pagination?.totalPages || 1;

  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      render: (row) => (
        <img
          src={row.avatar || '/placeholder.png'}
          alt={row.username}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(row.username || 'U') +
              '&size=32&background=e5e7eb&color=6b7280';
          }}
        />
      ),
    },
    {
      key: 'username',
      label: 'Username',
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.username}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="text-gray-500">{row.email}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: 'isVerified',
      label: 'Verified',
      render: (row) =>
        row.isVerified ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <XCircle size={16} className="text-red-400" />
        ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage registered users</p>
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">All</option>
              <option value="USER">USER</option>
              <option value="AGENT">AGENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={users}
            loading={isLoading}
            emptyMessage="No users found."
          />
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </Layout>
  );
}
