"use client";
import { ReactElement, ReactNode, useMemo, useState } from "react";

type TabItem = { id: string; label: string };

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
	// This is a marker component used only for structure.
	return <div data-tab-panel-id={id}>{children}</div>;
}

export default function Tabs({ tabs, initial = "episodes", children }: { tabs: TabItem[]; initial?: string; children: ReactNode }) {
	const [active, setActive] = useState<string>(initial);
	const activeContent = useMemo(() => {
		const array = Array.isArray(children) ? (children as ReactElement[]) : [children as ReactElement];
		for (const child of array) {
			if (!child || typeof child !== 'object') continue;
			const props: any = (child as any).props || {};
			if (props.id === active || props["data-tab-panel-id"] === active) {
				return child;
			}
		}
		return null;
	}, [children, active]);

	return (
		<div className="w-full">
			<div role="tablist" aria-label="Sections" className="flex gap-2 overflow-x-auto pb-2">
				{tabs.map(t => (
					<button
						key={t.id}
						role="tab"
						aria-selected={active === t.id}
						onClick={() => setActive(t.id)}
						className={`px-4 py-2 rounded-full border transition-colors flex-shrink-0 w-auto whitespace-nowrap ${active === t.id ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_12px_rgba(147,51,234,0.25)]' : 'border-gray-600 text-gray-300 hover:text-white hover:border-purple-500/60'}`}
					>
						{t.label}
					</button>
				))}
			</div>
			<div role="tabpanel" className="mt-2">
				{activeContent}
			</div>
		</div>
	);
}


