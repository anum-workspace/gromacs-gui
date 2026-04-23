// features/terminal/TerminalPanel.jsx
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useExplorerStore } from "../explorer/store/explorerStore";
import { useSimulation } from "../simulation/hooks/useSimulation.js";

export default function TerminalPanel() {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const gromacsPath = useExplorerStore((s) => s.gromacsPath);
    const { latest, running, stop } = useSimulation();

    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Mono', monospace",
            lineHeight: 1.25,
            scrollback: 5000,
            theme: {
                background: "#030712",
                foreground: "#d1d5db",
                cursor: "#f9fafb",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        // store both
        xtermRef.current = { term, fitAddon };

        // Receive output
        const handleData = (data) => term.write(data);
        window.electron.on("terminal:data", handleData);

        // Send input
        term.onData((data) => {
            window.electron.send("terminal:input", data);
        });

        // ✅ ResizeObserver (MAIN FIX)
        let resizeTimeout;

        const resizeObserver = new ResizeObserver(() => {
            if (!xtermRef.current) return;

            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                const { term, fitAddon } = xtermRef.current;
                fitAddon.fit();

                window.electron.send("terminal:resize", {
                    cols: term.cols,
                    rows: term.rows,
                });
            }, 50);
        });

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            term.dispose();
        };
    }, []);

    // 🔥 Start terminal when project loads
    useEffect(() => {
        if (!gromacsPath) return;

        window.electron.send("terminal:start", {
            cwd: gromacsPath,
        });
    }, [gromacsPath]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-3 py-1 text-xs text-gray-400">
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-200">Terminal</span>
                    <span className={running ? "text-amber-300" : "text-gray-500"}>
                        {running ? `Running: ${latest?.lastCommand ?? "simulation"}` : "Idle"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="rounded border border-gray-700 px-2 py-1 text-gray-300 hover:bg-gray-800"
                        onClick={() => xtermRef.current?.term.clear()}
                    >
                        Clear
                    </button>
                    <button
                        className="rounded border border-rose-700 px-2 py-1 text-rose-300 disabled:cursor-not-allowed disabled:border-gray-800 disabled:text-gray-600"
                        disabled={!running}
                        onClick={() => {
                            void stop(latest?.id);
                        }}
                    >
                        Stop
                    </button>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden bg-[#030712] px-1 py-1">
                <div ref={terminalRef} className="h-full w-full scrollbar-dark" />
            </div>
        </div>
    );
}
