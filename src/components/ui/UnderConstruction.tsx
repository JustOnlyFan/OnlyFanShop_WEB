'use client'

import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { Wrench, Construction, Hourglass } from 'lucide-react'

export function UnderConstruction({ title = 'Chức năng đang phát triển', description = 'Tính năng này sẽ sớm được cập nhật. Cảm ơn bạn đã chờ đợi!' }: { title?: string, description?: string }) {
  const router = useRouter()
  return (
    <div className="min-h-[600px] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full text-center bg-white/80 backdrop-blur rounded-2xl p-8 shadow-sm border border-white"
      >
        <div className="flex items-center justify-center gap-4 text-blue-600">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <Wrench className="w-10 h-10" />
          </motion.div>
          <Construction className="w-10 h-10" />
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Hourglass className="w-10 h-10" />
          </motion.div>
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default UnderConstruction


