import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarCheck, Clock } from 'lucide-react'

export function DashboardPage() {
  const stats = [
    { label: 'Total Employees', value: '—', icon: Users },
    { label: 'Present Today', value: '—', icon: CalendarCheck },
    { label: 'Pending Requests', value: '—', icon: Clock },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back 👋</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}