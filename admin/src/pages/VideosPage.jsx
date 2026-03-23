import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useVideos, useDeleteVideo } from '../api/queries';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';

function StatusBadge({ status }) {
  const colors = {
    PROCESSING: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-700',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status] || colors.ARCHIVED
      }`}
    >
      {status}
    </span>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideosPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, isLoading } = useVideos({ page, limit: 20 });
  const deleteVideo = useDeleteVideo();

  const videos = data?.videos || data?.items || [];
  const totalPages = data?.totalPages || data?.pagination?.totalPages || 1;

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteVideo.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: 'thumbnail',
      label: 'Thumbnail',
      render: (row) =>
        row.thumbnailUrl ? (
          <img
            src={row.thumbnailUrl}
            alt={row.title}
            className="w-16 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
            No img
          </div>
        ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <span className="font-medium text-gray-900 max-w-xs block truncate">
          {row.title}
        </span>
      ),
    },
    {
      key: 'uploader',
      label: 'Uploader',
      render: (row) => row.uploader?.username || '—',
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (row.duration ? formatDuration(row.duration) : '-'),
    },
    {
      key: 'viewCount',
      label: 'Views',
      render: (row) => row.viewCount?.toLocaleString() ?? '0',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleDeleteClick(row.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          title="Delete video"
        >
          <Trash2 size={13} />
          Delete
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all uploaded videos</p>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={videos}
            loading={isLoading}
            emptyMessage="No videos found."
          />
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmLabel="Delete"
        isDangerous
      />
    </Layout>
  );
}
