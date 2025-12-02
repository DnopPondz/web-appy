export default function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
        <p className={`text-3xl font-extrabold ${color ? color : 'text-gray-800'}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bg || 'bg-gray-50'} ${color || 'text-gray-500'} shadow-inner`}>
        {icon}
      </div>
    </div>
  );
}