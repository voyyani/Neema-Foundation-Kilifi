// Event Status Badge Component

import { motion } from 'framer-motion';
import type { EventStatus } from '../../types/events';

interface EventStatusBadgeProps {
  status: EventStatus;
}

export default function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const statusConfig = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 text-gray-700',
      dot: 'bg-gray-400',
    },
    published: {
      label: 'Published',
      color: 'bg-green-100 text-green-700',
      dot: 'bg-green-500',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-700',
      dot: 'bg-red-500',
    },
    completed: {
      label: 'Completed',
      color: 'bg-blue-100 text-blue-700',
      dot: 'bg-blue-500',
    },
    archived: {
      label: 'Archived',
      color: 'bg-gray-100 text-gray-600',
      dot: 'bg-gray-500',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </motion.span>
  );
}
