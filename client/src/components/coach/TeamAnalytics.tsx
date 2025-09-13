import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TeamAnalytics() {
  const { userProfile } = useUser();

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/coach/analytics", userProfile?.id],
    enabled: !!userProfile && userProfile.role === "coach",
  });

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Team Average',
        data: [7.8, 8.1, 8.3, 8.5],
        backgroundColor: 'hsla(221.2, 83.2%, 53.3%, 0.8)',
        borderColor: 'hsl(221.2, 83.2%, 53.3%)',
        borderWidth: 1,
      },
      {
        label: 'Top Performer',
        data: [9.2, 9.4, 9.1, 9.5],
        backgroundColor: 'hsla(142.1, 76.2%, 36.3%, 0.8)',
        borderColor: 'hsl(142.1, 76.2%, 36.3%)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return (
    <Card className="card-hover" data-testid="card-team-analytics">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Performance Analytics</CardTitle>
          <Select defaultValue="30days">
            <SelectTrigger className="w-40" data-testid="select-analytics-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="1year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64" data-testid="chart-team-analytics">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
