"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const title = "A linear line chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  }
};

const ChartLineLinear = () => (
  <section className="w-[98%] max-w-xl rounded-md border bg-background p-4 mx-auto mb-3 sm:w-[100%]">
    <h1 className="mb-2">Statistics</h1>
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
        <Line
          dataKey="desktop"
          dot={false}
          stroke="var(--color-desktop)"
          strokeWidth={2}
          type="linear" />
      </LineChart>
    </ChartContainer>
  </section>
);

export default ChartLineLinear;
