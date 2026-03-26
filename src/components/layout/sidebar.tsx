'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    LayoutDashboard, Wallet, CreditCard,
    PiggyBank, BarChart3, Menu, X, LogOut
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "../ui/button"

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard'}
]