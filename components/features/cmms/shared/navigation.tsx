"use client"

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Wrench,
    Package,
    TrendingUp,
    FileText,
    AlertTriangle,
    Settings,
    BarChart3,
    Map,
    Box,
    Cpu,
    Bell,
    UserCircle,
    LogOut,
    Menu,
    X,
    ChevronDown,
    HelpCircle,
    Globe,
    Database,
    Shield,
    Clock,
    Activity,
    Zap,
    Grid3x3,
    Layers,
    Cloud,
    Download,
    Upload,
    Search,
    Filter,
    PlusCircle,
    Receipt as FileInvoice,
    CreditCard,
    DollarSign,
    Calculator,
    Building2,
    Truck,
    CheckCircle,
    XCircle,
    Printer,
    Mail,
    FileSpreadsheet
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

// ==================== TYPES ====================

interface NavigationItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
    children?: NavigationItem[]
    permissions?: string[]
}

interface Notification {
    id: string
    title: string
    message: string
    timestamp: Date
    read: boolean
    type: 'info' | 'warning' | 'success' | 'error'
    link?: string
}

interface User {
    name: string
    email: string
    avatar?: string
    role: 'admin' | 'manager' | 'technician' | 'viewer' | 'finance'
    department: string
}

interface Invoice {
    id: string
    invoiceNumber: string
    poNumber?: string
    vendorName: string
    vendorId: string
    amount: number
    taxAmount: number
    totalAmount: number
    currency: string
    status: 'draft' | 'pending' | 'approved' | 'paid' | 'rejected' | 'overdue'
    issueDate: string
    dueDate: string
    paidDate?: string
    items: InvoiceItem[]
    workOrderId?: string
    assetId?: string
    notes?: string
    attachments?: string[]
    paymentTerms: string
    paymentMethod?: 'bank_transfer' | 'credit_card' | 'check' | 'cash'
}

interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    taxRate: number
    taxAmount: number
    workOrderItemId?: string
    partId?: string
}

interface EInvoiceStats {
    totalInvoiced: number
    totalPaid: number
    totalPending: number
    totalOverdue: number
    averagePaymentDays: number
    outstandingAmount: number
}

// ==================== NAVIGATION CONFIGURATION ====================

const mainNavigation: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard/cmms',
        icon: LayoutDashboard,
        children: [
            { name: 'Overview', href: '/dashboard/cmms', icon: LayoutDashboard },
            { name: 'Enhanced View', href: '/dashboard/cmms/enhanced', icon: Grid3x3 },
            { name: 'Digital Twin', href: '/dashboard/cmms/digital-twin', icon: Cpu },
        ]
    },
    {
        name: 'Assets',
        href: '/dashboard/cmms/assets',
        icon: Wrench,
        badge: 24,
        children: [
            { name: 'All Assets', href: '/dashboard/cmms/assets', icon: Package },
            { name: 'Asset Hierarchy', href: '/dashboard/cmms/assets/hierarchy', icon: Layers },
            { name: 'Asset Map', href: '/dashboard/cmms/assets/map', icon: Map },
            { name: '3D Viewer', href: '/dashboard/cmms/assets/3d-viewer', icon: Box },
        ]
    },
    {
        name: 'Work Orders',
        href: '/dashboard/cmms/work-orders',
        icon: FileText,
        badge: 12,
        children: [
            { name: 'Active Orders', href: '/dashboard/cmms/work-orders', icon: FileText },
            { name: 'Create Order', href: '/dashboard/cmms/work-orders/create', icon: PlusCircle },
            { name: 'Schedule', href: '/dashboard/cmms/work-orders/schedule', icon: Clock },
            { name: 'History', href: '/dashboard/cmms/work-orders/history', icon: Database },
        ]
    },
    {
        name: 'E-Invoicing',
        href: '/dashboard/cmms/invoicing',
        icon: FileInvoice,
        badge: 8,
        children: [
            { name: 'All Invoices', href: '/dashboard/cmms/invoicing', icon: FileInvoice },
            { name: 'Create Invoice', href: '/dashboard/cmms/invoicing/create', icon: PlusCircle },
            { name: 'Pending Approvals', href: '/dashboard/cmms/invoicing/pending', icon: Clock, badge: 5 },
            { name: 'Payments', href: '/dashboard/cmms/invoicing/payments', icon: CreditCard },
            { name: 'Vendors', href: '/dashboard/cmms/invoicing/vendors', icon: Building2 },
            { name: 'Reports', href: '/dashboard/cmms/invoicing/reports', icon: FileSpreadsheet },
        ]
    },
    {
        name: 'Inventory',
        href: '/dashboard/cmms/inventory',
        icon: Package,
        badge: 3,
        children: [
            { name: 'Parts Inventory', href: '/dashboard/cmms/inventory', icon: Package },
            { name: 'Suppliers', href: '/dashboard/cmms/inventory/suppliers', icon: Globe },
            { name: 'Purchase Orders', href: '/dashboard/cmms/inventory/purchase-orders', icon: FileText },
        ]
    },
    {
        name: 'Analytics',
        href: '/dashboard/cmms/analytics',
        icon: BarChart3,
        children: [
            { name: 'Performance', href: '/dashboard/cmms/analytics', icon: TrendingUp },
            { name: 'Predictions', href: '/dashboard/cmms/analytics/predictions', icon: Activity },
            { name: 'Financial', href: '/dashboard/cmms/analytics/financial', icon: DollarSign },
            { name: 'Reports', href: '/dashboard/cmms/reports', icon: FileText },
        ]
    },
    {
        name: 'Alerts',
        href: '/dashboard/cmms/alerts',
        icon: AlertTriangle,
        badge: 5,
    },
    {
        name: 'Settings',
        href: '/dashboard/cmms/settings',
        icon: Settings,
        children: [
            { name: 'General', href: '/dashboard/cmms/settings', icon: Settings },
            { name: 'Users', href: '/dashboard/cmms/users', icon: UserCircle },
            { name: 'Integrations', href: '/dashboard/cmms/settings/integrations', icon: Cloud },
            { name: 'Tax Settings', href: '/dashboard/cmms/settings/tax', icon: Calculator },
            { name: 'Backup', href: '/dashboard/cmms/settings/backup', icon: Database },
        ]
    },
]

// ==================== MOCK DATA ====================

const mockInvoices: Invoice[] = [
    {
        id: 'inv-001',
        invoiceNumber: 'INV-2026-0001',
        poNumber: 'PO-12345',
        vendorName: 'Industrial Parts Supply Co.',
        vendorId: 'VEN-001',
        amount: 12500.00,
        taxAmount: 1875.00,
        totalAmount: 14375.00,
        currency: 'MYR',
        status: 'pending',
        issueDate: '2026-04-15',
        dueDate: '2026-04-30',
        items: [
            {
                id: 'item-1',
                description: 'High Pressure Pump Assembly',
                quantity: 2,
                unitPrice: 6250,
                total: 12500,
                taxRate: 0.15,
                taxAmount: 1875,
                partId: 'PMP-789'
            }
        ],
        workOrderId: 'WO-2026-042',
        assetId: 'pump-001',
        paymentTerms: 'Net 15',
        notes: 'Rush order for critical maintenance'
    },
    {
        id: 'inv-002',
        invoiceNumber: 'INV-2026-0002',
        poNumber: 'PO-12346',
        vendorName: 'Electrical Solutions Inc.',
        vendorId: 'VEN-002',
        amount: 8750.00,
        taxAmount: 1312.50,
        totalAmount: 10062.50,
        currency: 'MYR',
        status: 'approved',
        issueDate: '2026-04-10',
        dueDate: '2026-04-25',
        items: [
            {
                id: 'item-2',
                description: 'Motor Controller Unit',
                quantity: 1,
                unitPrice: 8750,
                total: 8750,
                taxRate: 0.15,
                taxAmount: 1312.50,
                partId: 'MTR-456'
            }
        ],
        workOrderId: 'WO-2026-038',
        assetId: 'motor-101',
        paymentTerms: 'Net 15'
    },
    {
        id: 'inv-003',
        invoiceNumber: 'INV-2026-0003',
        vendorName: 'Fluid Dynamics Corp',
        vendorId: 'VEN-003',
        amount: 3420.00,
        taxAmount: 513.00,
        totalAmount: 3933.00,
        currency: 'MYR',
        status: 'paid',
        issueDate: '2026-04-01',
        dueDate: '2026-04-15',
        paidDate: '2026-04-12',
        items: [
            {
                id: 'item-3',
                description: 'Hydraulic Fluid - 55 Gal Drum',
                quantity: 3,
                unitPrice: 1140,
                total: 3420,
                taxRate: 0.15,
                taxAmount: 513
            }
        ],
        workOrderId: 'WO-2026-025',
        paymentTerms: 'Net 15',
        paymentMethod: 'bank_transfer'
    }
]

const mockEInvoiceStats: EInvoiceStats = {
    totalInvoiced: 28370.50,
    totalPaid: 3933.00,
    totalPending: 14375.00,
    totalOverdue: 10062.50,
    averagePaymentDays: 12,
    outstandingAmount: 24437.50
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'AI Prediction Alert',
        message: 'Pump-001 failure probability increased to 78%',
        timestamp: new Date('2026-04-23T10:30:00'),
        read: false,
        type: 'warning',
        link: '/dashboard/cmms/assets/pump-001'
    },
    {
        id: '2',
        title: 'Work Order Completed',
        message: 'Maintenance on Motor-101 completed successfully',
        timestamp: new Date('2026-04-23T09:15:00'),
        read: false,
        type: 'success',
        link: '/dashboard/cmms/work-orders/wo-123'
    },
    {
        id: '3',
        title: 'Invoice Approval Required',
        message: 'Invoice INV-2026-0001 from Industrial Parts Supply needs approval',
        timestamp: new Date('2026-04-23T08:00:00'),
        read: false,
        type: 'warning',
        link: '/dashboard/cmms/invoicing/inv-001'
    },
    {
        id: '4',
        title: 'Payment Received',
        message: 'Payment of MYR 3,933.00 received from Invoice INV-2026-0003',
        timestamp: new Date('2026-04-22T14:20:00'),
        read: true,
        type: 'success',
        link: '/dashboard/cmms/invoicing/inv-003'
    },
    {
        id: '5',
        title: 'Overdue Invoice Alert',
        message: 'Invoice INV-2026-0002 is 3 days overdue',
        timestamp: new Date('2026-04-22T09:00:00'),
        read: false,
        type: 'error',
        link: '/dashboard/cmms/invoicing/inv-002'
    }
]

const currentUser: User = {
    name: 'John Smith',
    email: 'john.smith@industrial.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=0D9488&color=fff',
    role: 'admin',
    department: 'Maintenance Engineering'
}

// ==================== NOTIFICATION PANEL ====================

function NotificationPanel({
    notifications,
    onClose,
    onMarkAsRead
}: {
    notifications: Notification[]
    onClose: () => void
    onMarkAsRead: (id: string) => void
}) {
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="w-96 max-h-[600px] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Badge variant="secondary">{unreadCount} unread</Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="divide-y">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                                !notification.read && "bg-blue-50 dark:bg-blue-950/20"
                            )}
                            onClick={() => {
                                onMarkAsRead(notification.id)
                                if (notification.link) {
                                    window.location.href = notification.link
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                                    notification.type === 'warning' && "bg-yellow-500",
                                    notification.type === 'success' && "bg-green-500",
                                    notification.type === 'error' && "bg-red-500",
                                    notification.type === 'info' && "bg-blue-500"
                                )} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{notification.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {notification.timestamp.toLocaleString()}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}

// ==================== E-INVOICING QUICK STATS ====================

function EInvoicingQuickStats() {
    const [stats] = useState<EInvoiceStats>(mockEInvoiceStats)

    return (
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-3">
                <FileInvoice className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">E-Invoicing Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs text-gray-500">Outstanding</p>
                    <p className="text-lg font-bold text-red-600">
                        MYR {stats.outstandingAmount.toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-lg font-bold text-green-600">
                        MYR {stats.totalInvoiced.toLocaleString()}
                    </p>
                </div>
                <div className="col-span-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span>Paid</span>
                        <span>MYR {stats.totalPaid.toLocaleString()} / MYR {stats.totalInvoiced.toLocaleString()}</span>
                    </div>
                    <Progress
                        value={(stats.totalPaid / stats.totalInvoiced) * 100}
                        className="h-1"
                    />
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => window.location.href = '/dashboard/cmms/invoicing'}
            >
                <FileInvoice className="w-3 h-3 mr-1" />
                View All Invoices
            </Button>
        </div>
    )
}

// ==================== QUICK ACTIONS ====================

function QuickActions() {
    const actions = [
        { name: 'New Invoice', icon: FileInvoice, href: '/dashboard/cmms/invoicing/create', color: 'blue' },
        { name: 'Create Work Order', icon: FileText, href: '/dashboard/cmms/work-orders/create', color: 'green' },
        { name: 'Add Asset', icon: Wrench, href: '/dashboard/cmms/assets/create', color: 'purple' },
        { name: 'View Reports', icon: BarChart3, href: '/dashboard/cmms/reports', color: 'orange' },
    ]

    return (
        <div className="p-4 border-b">
            <p className="text-xs font-medium text-gray-500 mb-2">QUICK ACTIONS</p>
            <div className="space-y-1">
                {actions.map((action) => (
                    <Link
                        key={action.name}
                        href={action.href}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <action.icon className={cn(
                            "w-4 h-4",
                            action.color === 'blue' && "text-blue-500",
                            action.color === 'green' && "text-green-500",
                            action.color === 'purple' && "text-purple-500",
                            action.color === 'orange' && "text-orange-500"
                        )} />
                        {action.name}
                    </Link>
                ))}
            </div>
        </div>
    )
}

// ==================== USER MENU ====================

function UserMenu() {
    const router = useRouter()

    const handleLogout = () => {
        // Handle logout logic
        router.push('/login')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {currentUser.email}
                        </p>
                        <Badge variant="outline" className="mt-1 w-fit">
                            {currentUser.role}
                        </Badge>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/cmms/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/cmms/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/cmms/help')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ==================== SEARCH BAR ====================

function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/dashboard/cmms/search?q=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                type="search"
                placeholder="Search assets, work orders, invoices..."
                className="pl-9 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </form>
    )
}

// ==================== MAIN NAVIGATION COMPONENT ====================

export function CMMSNavigation() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const [showEInvoicingPreview, setShowEInvoicingPreview] = useState(false)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }, [])

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        )
    }, [])

    return (
        <TooltipProvider>
            <nav className="bg-white dark:bg-gray-900 shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Desktop Navigation */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/dashboard/cmms" className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                                        <Cpu className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                                        CMMS 2026
                                    </span>
                                </Link>
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
                                {mainNavigation.map((item) => {
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                    const hasChildren = item.children && item.children.length > 0

                                    if (hasChildren) {
                                        return (
                                            <DropdownMenu key={item.name}>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className={cn(
                                                            'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                                            isActive
                                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        )}
                                                    >
                                                        <item.icon className="w-4 h-4 mr-2" />
                                                        {item.name}
                                                        {item.badge && (
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                        <ChevronDown className="w-3 h-3 ml-1" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-48">
                                                    {item.children?.map((child) => (
                                                        <DropdownMenuItem key={child.href} asChild>
                                                            <Link href={child.href} className="flex items-center">
                                                                <child.icon className="w-4 h-4 mr-2" />
                                                                {child.name}
                                                                {child.badge && (
                                                                    <Badge variant="secondary" className="ml-auto text-xs">
                                                                        {child.badge}
                                                                    </Badge>
                                                                )}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative',
                                                isActive
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            )}
                                        >
                                            <item.icon className="w-4 h-4 mr-2" />
                                            {item.name}
                                            {item.badge && (
                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right side icons */}
                        <div className="flex items-center gap-2">
                            <SearchBar />

                            {/* E-Invoicing Quick Stats Toggle */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative"
                                        onClick={() => setShowEInvoicingPreview(!showEInvoicingPreview)}
                                    >
                                        <FileInvoice className="w-5 h-5" />
                                        {mockEInvoiceStats.totalPending > 0 && (
                                            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                                !
                                            </Badge>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>E-Invoicing Summary</TooltipContent>
                            </Tooltip>

                            {/* Notifications */}
                            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="p-0 w-96">
                                    <NotificationPanel
                                        notifications={notifications}
                                        onClose={() => setNotificationsOpen(false)}
                                        onMarkAsRead={markAsRead}
                                    />
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs"
                                                onClick={markAllAsRead}
                                            >
                                                Mark all as read
                                            </Button>
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <UserMenu />

                            {/* Mobile menu button */}
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="sm:hidden">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 p-0">
                                    <SheetHeader className="p-4 border-b">
                                        <SheetTitle className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                                                <Cpu className="w-4 h-4 text-white" />
                                            </div>
                                            CMMS Navigation
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="overflow-y-auto h-full pb-20">
                                        <QuickActions />
                                        <div className="p-4">
                                            {mainNavigation.map((item) => (
                                                <div key={item.name} className="mb-2">
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                                                            pathname === item.href
                                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        )}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <item.icon className="w-4 h-4 mr-3" />
                                                        {item.name}
                                                        {item.badge && (
                                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                    </Link>
                                                    {item.children && (
                                                        <div className="ml-6 mt-1 space-y-1">
                                                            {item.children.map((child) => (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href}
                                                                    className="flex items-center px-3 py-1.5 text-xs rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                >
                                                                    <child.icon className="w-3 h-3 mr-2" />
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* E-Invoicing Quick Stats Slide Down Panel */}
                <AnimatePresence>
                    {showEInvoicingPreview && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t bg-white dark:bg-gray-900 overflow-hidden"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileInvoice className="w-5 h-5 text-blue-500" />
                                        <h3 className="font-semibold">E-Invoicing Dashboard</h3>
                                        <Badge variant="outline">Live</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowEInvoicingPreview(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Quick Stats Cards */}
                                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Total Invoiced (MTD)</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            MYR {mockEInvoiceStats.totalInvoiced.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Pending Approval</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            MYR {mockEInvoiceStats.totalPending.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Overdue</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            MYR {mockEInvoiceStats.totalOverdue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Paid (MTD)</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            MYR {mockEInvoiceStats.totalPaid.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Invoices Table */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Recent Invoices</h4>
                                    <div className="space-y-2">
                                        {mockInvoices.slice(0, 3).map((invoice) => (
                                            <Link
                                                key={invoice.id}
                                                href={`/dashboard/cmms/invoicing/${invoice.id}`}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        invoice.status === 'paid' && "bg-green-500",
                                                        invoice.status === 'pending' && "bg-yellow-500",
                                                        invoice.status === 'approved' && "bg-blue-500",
                                                        invoice.status === 'overdue' && "bg-red-500"
                                                    )} />
                                                    <div>
                                                        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                                                        <p className="text-xs text-gray-500">{invoice.vendorName}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">MYR {invoice.totalAmount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" onClick={() => window.location.href = '/dashboard/cmms/invoicing/create'}>
                                        <PlusCircle className="w-3 h-3 mr-1" />
                                        Create Invoice
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => window.location.href = '/dashboard/cmms/invoicing/reports'}>
                                        <FileSpreadsheet className="w-3 h-3 mr-1" />
                                        Export Reports
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </TooltipProvider>
    )
}