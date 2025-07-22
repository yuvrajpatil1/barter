import { activeSidebarItem } from "@/configs/constatnts";
import { useAtom } from "jotai";
import React from "react";

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);
  return { activeSidebar, setActiveSidebar };
};

export default useSidebar;
