import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Active Assets", value: "1,248", trend: "+12.4%" },
  { label: "Maintenance", value: "84", trend: "+3.2%" },
  { label: "Pending Reviews", value: "27", trend: "-1.8%" },
];

const recentAssets = [
  { name: "MacBook Pro 16", tag: "ASSET-1042", department: "Engineering", status: "In Use" },
  { name: "Conference Room A", tag: "ROOM-021", department: "Operations", status: "Reserved" },
  { name: "Laser Printer", tag: "ASSET-992", department: "Finance", status: "Available" },
];

const maintenanceSummary = [
  { title: "Open requests", value: "12", detail: "2 urgent" },
  { title: "Completed this week", value: "18", detail: "96% SLA" },
];

const upcomingBookings = [
  { title: "Leadership Offsite", time: "Today • 10:00", resource: "Room B" },
  { title: "Vendor Demo", time: "Tomorrow • 14:30", resource: "Conference Room A" },
];

const activityTimeline = [
  { title: "Asset allocated to Priya Singh", time: "10 mins ago" },
  { title: "Maintenance request approved", time: "37 mins ago" },
  { title: "Booking created for HQ boardroom", time: "1 hr ago" },
];

const quickActions = [
  { label: "Register Asset", href: "/assets" },
  { label: "New Booking", href: "/bookings" },
  { label: "View Allocations", href: "/allocations" },
];

export default function DashboardPage() {
  return (
    <PageWrapper>
      <Breadcrumb items={[{ label: "Overview" }]} />
      <PageHeader
        title="Operations Overview"
        description="A practical enterprise view of active assets, maintenance work, and team scheduling."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-2">Asset</th>
                      <th className="pb-2">Tag</th>
                      <th className="pb-2">Department</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssets.map((asset) => (
                      <tr key={asset.tag} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="py-3 font-medium">{asset.name}</td>
                        <td className="py-3">{asset.tag}</td>
                        <td className="py-3">{asset.department}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenanceSummary.map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                    <p className="text-sm text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.title} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <p className="font-medium">{booking.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{booking.time}</p>
                    <p className="text-sm text-slate-500">{booking.resource}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button key={action.label} asChild variant="outline" className="w-full justify-start">
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allocation summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
                <p className="text-sm text-slate-500">Active allocations</p>
                <p className="mt-2 text-3xl font-semibold">24</p>
                <p className="mt-2 text-sm text-slate-500">8 due for review this week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityTimeline.map((activity) => (
                  <div key={activity.title} className="border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-slate-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
