"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark",
} as const;

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<unknown>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactElement;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof THEMES] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

// Recharts doesn't re-export these from its public index, so we mirror
// the shapes from recharts/types/component/DefaultTooltipContent.d.ts.
type TooltipValueType = number | string | Array<number | string>;
type TooltipNameType = number | string;

interface TooltipPayloadItem {
  type?: "none" | string;
  color?: string;
  name?: TooltipNameType;
  value?: TooltipValueType;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
  formatter?: (
    value: TooltipValueType,
    name: TooltipNameType,
    item: TooltipPayloadItem,
    index: number,
    payload: TooltipPayloadItem[],
  ) => [React.ReactNode, TooltipNameType] | React.ReactNode;
}

interface TooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: TooltipNameType;
  labelFormatter?: (
    label: TooltipNameType,
    payload: TooltipPayloadItem[],
  ) => React.ReactNode;
  formatter?: (
    value: TooltipValueType,
    name: TooltipNameType,
    item: TooltipPayloadItem,
    index: number,
    payload: TooltipPayloadItem[],
  ) => [React.ReactNode, TooltipNameType] | React.ReactNode;
  color?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelClassName?: string;
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null;

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);

      const value =
        !labelKey && typeof label === "string"
          ? config[label]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(label ?? "", payload)}
          </div>
        );
      }

      if (!value) return null;

      return (
        <div className={cn("font-medium", labelClassName)}>{value}</div>
      );
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) return null;

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}

        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor =
                color ||
                (item.payload as Record<string, string> | undefined)?.fill ||
                item.color;

              return (
                <div
                  key={`${item.dataKey}-${index}`}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center",
                  )}
                >
                  {formatter && item.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-xs border-(--color-border) bg-(--color-bg)",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              },
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}

                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center",
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>

                        {item.value !== undefined && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);

ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

// Recharts doesn't re-export LegendPayload or VerticalAlignmentType from its
// public index, so we mirror them from DefaultLegendContent.d.ts.
interface LegendPayloadItem {
  value?: string | number;
  id?: string;
  type?: RechartsPrimitive.LegendType;
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  inactive?: boolean;
  payload?: { strokeDasharray: string | number; value?: unknown };
}

type VerticalAlignmentType = "top" | "bottom" | "middle";

interface LegendContentProps extends React.ComponentProps<"div"> {
  payload?: LegendPayloadItem[];
  verticalAlign?: VerticalAlignmentType;
  hideIcon?: boolean;
  nameKey?: string;
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, LegendContentProps>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className,
        )}
      >
        {payload
          .filter((item) => item.type !== "none")
          .map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            return (
              <div
                key={String(item.value)}
                className={cn(
                  "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-xs"
                    style={{ backgroundColor: item.color }}
                  />
                )}

                {itemConfig?.label}
              </div>
            );
          })}
      </div>
    );
  },
);

ChartLegendContent.displayName = "ChartLegend";

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) return undefined;

  const payloadObj = payload as Record<string, unknown>;

  const payloadPayload =
    typeof payloadObj.payload === "object" && payloadObj.payload !== null
      ? (payloadObj.payload as Record<string, unknown>)
      : undefined;

  let configLabelKey = key;

  if (typeof payloadObj[key] === "string") {
    configLabelKey = payloadObj[key] as string;
  } else if (payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key] as string;
  }

  return config[configLabelKey] ?? config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};