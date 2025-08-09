"use client";

import React, { useEffect, useState, useRef } from "react";
import { Download, Plus } from "lucide-react";
import Link from "next/link";

type LogType = "success" | "error" | "warning" | "info" | "debug";

type LogItem = {
  type: LogType;
  message: string;
  timestamp: string;
  source?: string;
};

const typeColorMap: Record<LogType, string> = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
  debug: "text-gray-400",
};

const Loggers = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URI!);

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLogs((prev) => [...prev, parsed]);
      } catch (err) {
        console.log("Invalid log format", err);
      }
    };
    return () => socket.close();
  }, []);

  //scroll to bottom ie latest log
  useEffect(() => {
    setFilteredLogs(logs);

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  //handle key presses for filtering
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1") {
        setFilteredLogs(logs.filter((log) => log.type === "error"));
      } else if (e.key === "2") {
        setFilteredLogs(logs.filter((log) => log.type === "success"));
      } else if (e.key === "0") {
        setFilteredLogs(logs);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [logs]);

  //download logs as a .log file
  const downloadLogs = () => {
    const content = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleTimeString()}] ${
            log.source
          } [${log.type.toUpperCase()}] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "application-logs.log";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Heading and Breadcrumbs */}
      <div className="pb-11">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl py-2 font-semibold text-white">Logs</h2>
          <button
            onClick={downloadLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} /> Download Logs
          </button>
        </div>
        <Link
          href={"/"}
          className=" text-gray-500 px-4 py-2 rounded-lg hover:underline"
        >
          Home
        </Link>
        <span className="inline-block p-1 mx-1 bg-gray-400 rounded-full"></span>
        <span className="text-gray-500"> Logs</span>
      </div>

      {/* Terminal Logs Stream  */}
      <div
        ref={logContainerRef}
        className="bg-black font-mono border border-gray-800 rounded-md p-4 h-[600px] overflow-y-auto space-y-1"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-gray-500">Waiting for Logs...</p>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap">
              <span className="text-gray-500">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>{" "}
              <span className="text-purple-400">{log.source}</span>
              <span className={typeColorMap[log.type]}>
                [{log.type.toUpperCase()}]
              </span>{" "}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Loggers;
