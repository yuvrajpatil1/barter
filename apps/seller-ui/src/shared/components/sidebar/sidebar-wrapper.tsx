"use client";
import useSeller from "@/hooks/useSeller";
import useSidebar from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import SidebarItem from "./sidebar.item";
import {
  Bell,
  BellPlus,
  BellRing,
  CalendarPlus,
  Headset,
  Home,
  HomeIcon,
  LayoutDashboard,
  LayoutDashboardIcon,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  Wallet,
} from "lucide-react";
import SidebarMenu from "./sidebar.menu";

function SidebarWrapper() {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();
  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";
  return (
    <Box className="h-100dvh z-202 sticky p-[8px] top-0 overflow-y-scroll sidebar-wrapper no-scrollbar">
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2 ">
            <h1 className="text-5xl font-bold">B</h1>
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-left text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={
              <LayoutDashboardIcon color="" fill={getIconColor("/dashboard")} />
            }
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={
                  <ListOrdered
                    size={18}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
              />
              <SidebarItem
                title="Payments"
                icon={
                  <Wallet
                    size={18}
                    color={getIconColor("/dashboard/payments")}
                  />
                }
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={
                  <SquarePlus
                    size={18}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
                isActive={activeSidebar === "/dashboard/create-product"}
                href="/dashboard/create-product"
              />
              <SidebarItem
                title="All Products"
                icon={
                  <PackageSearch
                    size={18}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
                isActive={activeSidebar === "/dashboard/all-products"}
                href="/dashboard/all-products"
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                icon={
                  <CalendarPlus
                    size={18}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
                isActive={activeSidebar === "/dashboard/create-event"}
                href="/dashboard/create-event"
              />
              <SidebarItem
                title="All Events"
                icon={
                  <BellPlus
                    size={18}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
                isActive={activeSidebar === "/dashboard/all-events"}
                href="/dashboard/all-events"
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={
                  <Mail size={18} color={getIconColor("/dashboard/inbox")} />
                }
                isActive={activeSidebar === "/dashboard/inbox"}
                href="/dashboard/inbox"
              />
              <SidebarItem
                title="Settings"
                icon={
                  <Settings
                    size={18}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
                isActive={activeSidebar === "/dashboard/settings"}
                href="/dashboard/settings"
              />
              <SidebarItem
                title="Notifications"
                icon={
                  <BellRing
                    size={18}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
                isActive={activeSidebar === "/dashboard/notifications"}
                href="/dashboard/notifications"
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                icon={
                  <TicketPercent
                    size={18}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
                isActive={activeSidebar === "/dashboard/discount-codes"}
                href="/dashboard/discount-codes"
              />
              <SidebarItem
                title="Logout"
                icon={
                  <LogOut size={18} color={getIconColor("/dashboard/logout")} />
                }
                isActive={activeSidebar === "/dashboard/logout"}
                href="/"
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
}

export default SidebarWrapper;
