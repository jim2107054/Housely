const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
  },
};

export default function KPICard({ title, value, icon: Icon, color = 'blue', loading }) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      {/* Icon circle */}
      <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${colors.bg}`}>
        <Icon size={22} className={colors.icon} />
      </div>

      {/* Content */}
      <div className="min-w-0">
        {loading ? (
          <>
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {value !== undefined && value !== null ? value.toLocaleString() : '—'}
            </p>
            <p className="text-sm text-gray-500 truncate">{title}</p>
          </>
        )}
      </div>
    </div>
  );
}
