import type { ReactNode } from 'react'
import {
  BadgeCheck,
  Clock3,
  Download,
  IdCard,
  LayoutDashboard,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react'

export type AdminNavigationRoute = '/admin'

export type AdminNavigationItem = {
  label: string
  description?: string
  to?: AdminNavigationRoute
  icon: ReactNode
  badge?: string
  disabled?: boolean
}

export type AdminNavigationGroup = {
  title: string
  items: AdminNavigationItem[]
}

export const adminNavigationGroups: AdminNavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        description: 'Counts, filters and member records',
        to: '/admin',
        icon: <LayoutDashboard size={17} />,
      },
    ],
  },
  {
    title: 'Membership',
    items: [
      {
        label: 'All Members',
        description: 'Search and review every application',
        to: '/admin',
        icon: <Users size={17} />,
      },
      {
        label: 'Pending Review',
        description: 'Applications waiting for action',
        to: '/admin',
        icon: <Clock3 size={17} />,
      },
      {
        label: 'Approved Members',
        description: 'Active members with card access',
        to: '/admin',
        icon: <BadgeCheck size={17} />,
      },
      {
        label: 'Rejected Applications',
        description: 'Rejected or returned applications',
        to: '/admin',
        icon: <XCircle size={17} />,
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        label: 'Digital Cards',
        description: 'Open card from member detail',
        to: '/admin',
        icon: <IdCard size={17} />,
      },
      {
        label: 'CSV Export',
        description: 'Available on member list',
        to: '/admin',
        icon: <Download size={17} />,
      },
      {
        label: 'Roles & Permissions',
        description: 'Database controlled for now',
        icon: <ShieldCheck size={17} />,
        badge: 'DB',
        disabled: true,
      },
    ],
  },
]
