import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ContributionDay {
  date: string;
  count: number;
}

function intensityOf(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 0.25;
  if (count <= 5) return 0.5;
  if (count <= 9) return 0.75;
  return 1;
}

export function ContributionHeatmap({ days }: { days: ContributionDay[] }) {
  const weeks: ContributionDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => {
              const intensity = intensityOf(day.count);
              return (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className="size-2.5 rounded-[3px] transition-transform hover:scale-125"
                      style={{
                        backgroundColor:
                          intensity === 0
                            ? "var(--surface-hover)"
                            : `color-mix(in oklch, var(--accent) ${intensity * 100}%, var(--surface-hover))`,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {day.count} {day.count === 1 ? "commit" : "commits"} on {day.date}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-2xs text-ink-subtle">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
          <div
            key={intensity}
            className="size-2.5 rounded-[3px]"
            style={{
              backgroundColor:
                intensity === 0
                  ? "var(--surface-hover)"
                  : `color-mix(in oklch, var(--accent) ${intensity * 100}%, var(--surface-hover))`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
