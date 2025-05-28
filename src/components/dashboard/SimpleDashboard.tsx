
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleDashboardProps {
  title: string;
  value: number;
  formatCurrency: (value: number) => string;
  color: 'green' | 'red';
}

export function SimpleDashboard({
  title,
  value,
  formatCurrency,
  color
}: SimpleDashboardProps) {
  const colorClass = color === 'green' ? 'text-green-600' : 'text-red-600';
  const borderColor = color === 'green' ? 'border-l-green-500' : 'border-l-red-500';

  return (
    <Card className={`border-l-4 ${borderColor} mb-6`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  );
}
