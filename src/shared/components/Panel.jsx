// shared/components/Panel.jsx
export default function Panel({ title, children }) {
    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b border-gray-700 font-semibold">{title}</div>
            <div className="flex-1 overflow-auto p-2">{children}</div>
        </div>
    );
}
