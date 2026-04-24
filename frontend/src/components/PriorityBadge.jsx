const styles = {
  low: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Low' },
  medium: { cls: 'bg-amber-50 text-amber-700 ring-amber-200', label: 'Medium' },
  high: { cls: 'bg-red-50 text-red-700 ring-red-200', label: 'High' }
};

export default function PriorityBadge({ priority }) {
  const { cls, label } = styles[priority] || styles.medium;
  return <span className={`chip ring-1 ${cls}`}>{label}</span>;
}
