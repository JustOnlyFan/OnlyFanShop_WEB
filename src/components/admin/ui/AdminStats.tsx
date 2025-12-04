'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AdminStatsProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
}

export function AdminStats({ title, value, change, trend, icon, color }: AdminStatsProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'from-green-500 to-emerald-500',
      text: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'from-purple-500 to-pink-500',
      text: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'from-orange-500 to-red-500',
      text: 'text-orange-600',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'from-red-500 to-rose-500',
      text: 'text-red-600',
    },
    cyan: {
      bg: 'bg-cyan-50',
      icon: 'from-cyan-500 to-blue-500',
      text: 'text-cyan-600',
    },
  };

  const colorConfig = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorConfig.icon} flex items-center justify-center shadow-lg`}>
          <div className="text-white">{icon}</div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </motion.div>
  );
}
