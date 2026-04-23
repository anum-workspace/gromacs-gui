export default function CodeEditor({ tab }) {
    if (!tab) return <div className="p-2 text-gray-400">No file open</div>;

    return (
        <textarea
            className="w-full h-full bg-black text-white p-2 font-mono"
            value={tab.content}
            readOnly
        />
    );
}
