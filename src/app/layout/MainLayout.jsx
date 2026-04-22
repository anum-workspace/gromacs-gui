// app/layout/MainLayout.jsx
import Navbar from "../../features/navbar/Navbar.jsx";
import ExplorerPanel from "../../features/explorer/ExplorerPanel.jsx";
import TerminalPanel from "../../features/terminal/TerminalPanel.jsx";
import PropertiesPanel from "../../features/properties/PropertiesPanel.jsx";
import { Outlet } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";

export default function MainLayout() {
    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            {/* Navbar */}
            <div className="h-8 border-b border-gray-700">
                <Navbar />
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                <Group className="h-full w-full" orientation="horizontal">
                    {/* Left Explorer */}
                    <Panel collapsible defaultSize="15%">
                        <ExplorerPanel />
                    </Panel>
                    <Separator className="border-r border-gray-700" />

                    {/* Center */}
                    <Panel minSize={300}>
                        <Group orientation="vertical">
                            {/* Main View */}
                            <Panel defaultSize="70%">
                                <Outlet />
                            </Panel>
                            <Separator className="border-b border-gray-700" />

                            {/* Terminal */}
                            <Panel collapsible defaultSize="30%">
                                <div className="h-full overflow-hidden bg-gray-950">
                                    <TerminalPanel />
                                </div>
                            </Panel>
                        </Group>
                    </Panel>
                    <Separator className="border-r border-gray-700" />

                    {/* Right Properties */}
                    <Panel collapsible defaultSize="15%">
                        <PropertiesPanel />
                    </Panel>
                </Group>
            </div>
        </div>
    );
}
