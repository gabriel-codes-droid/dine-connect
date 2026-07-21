import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface RevenuePoint {
  label: string;
  revenue: number;
  commission: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
  height?: number;
}

export function RevenueChart({ data, height = 280 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="commissionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-slate-700" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#111827',
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#6366F1"
          strokeWidth={2.5}
          fill="url(#revenueFill)"
          name="Revenue"
        />
        <Area
          type="monotone"
          dataKey="commission"
          stroke="#8B5CF6"
          strokeWidth={2.5}
          fill="url(#commissionFill)"
          name="Commission"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface OrderRow {
  label: string;
  orders: number;
}

export function OrdersBarChart({ data, height = 280 }: { data: OrderRow[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-slate-700" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#111827',
          }}
        />
        <Bar dataKey="orders" fill="url(#ordersFill)" radius={[8, 8, 0, 0]} name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({ data, height = 240 }: { data: DonutSlice[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#111827',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Default demo data — used when an admin page doesn't pass anything
export const defaultRevenue: RevenuePoint[] = [
  { label: 'Mon', revenue: 4200, commission: 320 },
  { label: 'Tue', revenue: 5100, commission: 410 },
  { label: 'Wed', revenue: 4800, commission: 380 },
  { label: 'Thu', revenue: 6300, commission: 510 },
  { label: 'Fri', revenue: 8100, commission: 690 },
  { label: 'Sat', revenue: 9600, commission: 820 },
  { label: 'Sun', revenue: 7800, commission: 640 },
];

export const defaultOrders: OrderRow[] = [
  { label: 'Mon', orders: 220 },
  { label: 'Tue', orders: 280 },
  { label: 'Wed', orders: 260 },
  { label: 'Thu', orders: 340 },
  { label: 'Fri', orders: 410 },
  { label: 'Sat', orders: 480 },
  { label: 'Sun', orders: 390 },
];

export const defaultOrderMix: DonutSlice[] = [
  { name: 'Dine-in', value: 48, color: '#6366F1' },
  { name: 'Takeaway', value: 24, color: '#22C55E' },
  { name: 'Delivery', value: 20, color: '#F59E0B' },
  { name: 'Catering', value: 8, color: '#8B5CF6' },
];
