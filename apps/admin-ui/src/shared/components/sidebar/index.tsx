"use client";
import useAdmin from "@/hooks/useAdmin";
import useSidebar from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import {
  BellPlus,
  BellRing,
  FileClock,
  Home,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Package,
  PencilRuler,
  Settings,
  Store,
  User,
  Wallet,
} from "lucide-react";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin } = useAdmin();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  return (
    <div>
      <Box
        css={{
          height: "100vh",
          zIndex: 202,
          position: "sticky",
          padding: "8px",
          top: "0",
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
        className="sidebar-wrapper"
      >
        <Sidebar.Header>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <p className="text-6xl">B</p>
            <Box>
              <h3 className="text-xl font-medium text-gray-100">
                {admin?.name}
              </h3>

              <h5 className="text-xs pl-2 font-medium text-gray-100 whitespace-nowrap">
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Sidebar.Header>

        <div className="block my-3 h-full">
          <Sidebar.Body className="body sidebar">
            <SidebarItem
              title="Dashboard"
              icon={<LayoutDashboard fill={getIconColor("/dashboard")} />}
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
                  isActive={activeSidebar === "/dashboard/payments"}
                  href="/dashboard/payments"
                  icon={
                    <Wallet
                      size={18}
                      color={getIconColor("/dashboard/payments")}
                    />
                  }
                />
                <SidebarItem
                  title="Products"
                  isActive={activeSidebar === "/dashboard/products"}
                  href="/dashboard/products"
                  icon={
                    <Package
                      size={18}
                      color={getIconColor("/dashboard/products")}
                    />
                  }
                />
                <SidebarItem
                  title="Events"
                  icon={
                    <BellPlus
                      size={18}
                      color={getIconColor("/dashboard/events")}
                    />
                  }
                  isActive={activeSidebar === "/dashboard/events"}
                  href="/dashboard/events"
                />
                <SidebarItem
                  title="Users"
                  icon={
                    <User size={18} color={getIconColor("/dashboard/users")} />
                  }
                  isActive={activeSidebar === "/dashboard/users"}
                  href="/dashboard/users"
                />
                <SidebarItem
                  title="Sellers"
                  icon={
                    <Store
                      size={18}
                      color={getIconColor("/dashboard/sellers")}
                    />
                  }
                  isActive={activeSidebar === "/dashboard/sellers"}
                  href="/dashboard/sellers"
                />
              </SidebarMenu>
              <SidebarMenu title="Controllers">
                <SidebarItem
                  title="Loggers"
                  icon={
                    <FileClock
                      size={18}
                      color={getIconColor("/dashboard/loggers")}
                    />
                  }
                  isActive={activeSidebar === "/dashboard/loggers"}
                  href="/dashboard/loggers"
                />
                <SidebarItem
                  title="Management"
                  icon={
                    <Settings
                      size={18}
                      color={getIconColor("/dashboard/management")}
                    />
                  }
                  isActive={activeSidebar === "/dashboard/management"}
                  href="/dashboard/management"
                />
                <SidebarItem
                  title="Notification"
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
              <SidebarMenu title="Customization">
                <SidebarItem
                  title="All Customization"
                  icon={
                    <PencilRuler
                      size={18}
                      color={getIconColor("/dashboard/customization")}
                    />
                  }
                  isActive={activeSidebar === "/dashboard/customization"}
                  href="/dashboard/customization"
                />
              </SidebarMenu>
              <SidebarMenu title="Extras">
                <SidebarItem
                  title="Logout"
                  icon={
                    <LogOut
                      size={18}
                      color={getIconColor("/dashboard/logout")}
                    />
                  }
                  isActive={activeSidebar === "/dashboard/logout"}
                  href="/dashboard/logout"
                />
              </SidebarMenu>
            </div>
          </Sidebar.Body>
        </div>
      </Box>
    </div>
  );
};

export default SidebarWrapper;
