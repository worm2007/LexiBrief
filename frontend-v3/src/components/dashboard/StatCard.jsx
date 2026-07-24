import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/60
        p-6
        backdrop-blur-xl
        transition
        hover:border-indigo-500/40
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-slate-800
            ${color}
          `}
        >
          <Icon size={25} />
        </div>
      </div>
    </motion.div>
  );
}
