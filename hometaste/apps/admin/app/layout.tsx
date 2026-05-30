import "./globals.css";

export const metadata = { title: "HomeTaste Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="side">
            <a className="brand" href="/dashboard">HomeTaste Admin</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/users">Users</a>
            <a href="/cooks">Cooks</a>
            <a href="/orders">Orders</a>
            <a href="/dishes">Dishes</a>
            <a href="/notifications">Notifications</a>
            <a href="/settings">Settings</a>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
