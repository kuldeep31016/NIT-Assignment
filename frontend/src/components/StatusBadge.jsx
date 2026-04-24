const styles = {
  todo: { cls: 'bg-amber-50 text-amber-700 ring-amber-200', label: 'Todo' },
  in_progress: { cls: 'bg-blue-50 text-blue-700 ring-blue-200', label: 'In Progress' },
  done: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Done' }
};

export default function StatusBadge({ status }) {
  const { cls, label } = styles[status] || styles.todo;
  return (
    <span className={`chip ring-1 ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'done' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'}`} />
      {label}
    </span>
  );
}
