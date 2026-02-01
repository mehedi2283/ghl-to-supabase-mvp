"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Trello, Target, MessageSquare, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
    { title: "Dashboard", href: "/", icon: Home },
    { title: "Contacts", href: "/contacts", icon: Users },
    { title: "Opportunities", href: "/opportunities", icon: Target },
    { title: "Conversations", href: "/conversations", icon: MessageSquare },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden border-r border-slate-800/50 bg-slate-950 md:block md:w-64 lg:w-72 h-screen sticky top-0">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b border-slate-800/50 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <span className="text-slate-100">GHL Sync</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}
