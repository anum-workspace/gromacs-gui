// features/terminal/TerminalPanel.jsx
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function TerminalPanel() {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);

    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 12,
            theme: {
                background: "#030712",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        // store both
        xtermRef.current = { term, fitAddon };

        // 🔥 Start backend terminal
        window.electron.send("terminal:start");

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

    return (
        <div className="h-full w-full overflow-hidden">
            <div ref={terminalRef} className="h-full w-full" />
        </div>
    );
}
