interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'neutral';
}

const variants = {
  success: 'bg-green-50 text-success dark:bg-green-900/30',
  warning: 'bg-amber-50 text-warning dark:bg-amber-900/30',
  danger: 'bg-red-50 text-danger dark:bg-red-900/30',
  primary: 'bg-indigo-50 text-primary dark:bg-indigo-900/30',
  neutral: 'bg-gray-100 text-text-muted dark:bg-dark-bg dark:text-dark-muted',
};

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge ${variants[variant]}`}>{children}</span>;
}
