import { useEffect } from "react";

export default function CodeEditor({ tab, onChange, onSave }) {
    useEffect(() => {
        if (!tab?.path) return;

        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                void onSave?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onSave, tab?.path]);

    if (!tab) return <div className="p-2 text-gray-400">No file open</div>;

    return (
        <textarea
            className="h-full w-full resize-none bg-gray-900 p-3 font-mono text-sm text-gray-300 outline-none"
            value={tab.content}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
        />
    );
}
