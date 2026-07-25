import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "text-indigo-400",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.015,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/70
        p-6
        shadow-lg
        shadow-black/10
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-indigo-500/40
        hover:shadow-xl
        hover:shadow-indigo-500/10
      "
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-indigo-500/70
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <div
        className="
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-indigo-500/5
          blur-3xl
          transition
          duration-300
          group-hover:bg-indigo-500/10
        "
      />

      <div className="relative flex items-center justify-between gap-5">
        <div className="min-w-0">
          <p
            className="
              text-sm
              font-medium
              tracking-wide
              text-slate-400
            "
          >
            {title}
          </p>

          <motion.h2
            key={String(value)}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="
              mt-3
              truncate
              text-3xl
              font-bold
              tracking-tight
              text-white
              sm:text-4xl
            "
          >
            {value}
          </motion.h2>
        </div>

        <motion.div
          whileHover={{
            rotate: 5,
            scale: 1.08,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 18,
          }}
          className={`
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-700/80
            bg-slate-800/80
            shadow-inner
            shadow-black/20
            transition-all
            duration-300
            group-hover:border-indigo-500/30
            group-hover:bg-slate-800
            ${color}
          `}
        >
          <Icon size={27} strokeWidth={1.9} />
        </motion.div>
      </div>

      <div
        className="
          relative
          mt-5
          h-px
          overflow-hidden
          bg-slate-800
        "
      >
        <div
          className="
            h-full
            w-0
            bg-gradient-to-r
            from-indigo-500
            to-cyan-400
            transition-all
            duration-500
            group-hover:w-full
          "
        />
      </div>

      <p className="relative mt-4 text-xs text-slate-500">
        Updated after document analysis
      </p>
    </motion.div>
  );
}