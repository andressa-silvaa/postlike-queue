import type { PropsWithChildren, ReactNode } from "react";

type LayoutProps = PropsWithChildren<{
  sidebar: ReactNode;
}>;

export function Layout({ sidebar, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      <main className="content">{children}</main>
    </div>
  );
}
