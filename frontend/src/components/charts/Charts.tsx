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
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-slate-700" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E0D7',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#202522',
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#B85C38"
          strokeWidth={2.5}
          fill="#B85C38"
          name="Revenue"
        />
        <Area
          type="monotone"
          dataKey="commission"
          stroke="#6F8068"
          strokeWidth={2.5}
          fill="#6F8068"
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
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-slate-700" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E0D7',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#202522',
          }}
        />
        <Bar dataKey="orders" fill="#6F8068" radius={[4, 4, 0, 0]} name="Orders" />
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
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E0D7',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#202522',
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
  { name: 'Dine-in', value: 48, color: '#B85C38' },
  { name: 'Takeaway', value: 24, color: '#6F8068' },
  { name: 'Delivery', value: 20, color: '#D9A441' },
  { name: 'Catering', value: 8, color: '#7F725F' },
];
