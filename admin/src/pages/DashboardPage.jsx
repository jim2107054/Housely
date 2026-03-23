import { useStats } from '../api/queries';
import KPICard from '../components/KPICard';
import Layout from '../components/Layout';
import { Users, Home, Video, CalendarCheck } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Users"
            value={stats?.userCount}
            icon={Users}
            color="blue"
            loading={isLoading}
          />
          <KPICard
            title="Properties"
            value={stats?.houseCount}
            icon={Home}
            color="green"
            loading={isLoading}
          />
          <KPICard
            title="Videos"
            value={stats?.videoCount}
            icon={Video}
            color="purple"
            loading={isLoading}
          />
          <KPICard
            title="Bookings This Month"
            value={stats?.bookingCount}
            icon={CalendarCheck}
            color="orange"
            loading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
}
