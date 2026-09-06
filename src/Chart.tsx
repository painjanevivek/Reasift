import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  type UTCTimestamp,
  type Time,
} from "lightweight-charts";
import { ChartNoAxesCombined } from "lucide-react";
import type { Candle, Signal } from "./api";

export default function Chart({
  bars,
  signal,
}: {
  bars: Candle[];
  signal: Signal | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !bars.length) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#66788b",
        fontFamily: "Segoe UI, sans-serif",
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: "#f2f4f7" },
        horzLines: { color: "#edf1f5" },
      },
      rightPriceScale: { borderColor: "#e4eaf0" },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#e4eaf0",
        tickMarkFormatter: (value: Time) =>
          typeof value === "number"
            ? new Date(value * 1000).toLocaleTimeString("en-US", {
                timeZone: "America/New_York",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "",
      },
      localization: {
        timeFormatter: (ts: number) =>
          new Date(ts * 1000).toLocaleTimeString("en-US", {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
      },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#298475",
      downColor: "#c36a62",
      wickUpColor: "#298475",
      wickDownColor: "#c36a62",
      borderVisible: false,
    });
    series.setData(
      bars.map((b) => ({
        ...b,
        time: Math.floor(new Date(b.ts).getTime() / 1000) as UTCTimestamp,
      })),
    );
    if (signal) {
      for (const [label, price, color] of [
        ["Entry", signal.reference, "#526fac"],
        ["Stop", signal.stop, "#c36a62"],
        ["Target", signal.target, "#298475"],
      ] as const) {
        series.createPriceLine({
          price,
          color,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: label,
        });
      }
      createSeriesMarkers(series, [
        {
          time: Math.floor(
            new Date(signal.ts).getTime() / 1000,
          ) as UTCTimestamp,
          position: signal.direction === "long" ? "belowBar" : "aboveBar",
          color: "#526fac",
          shape: signal.direction === "long" ? "arrowUp" : "arrowDown",
          text: signal.direction.toUpperCase(),
        },
      ]);
    }
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [bars, signal]);
  return (
    <div className="chart-container">
      <div ref={ref} className="chart" />
      {!bars.length && (
        <div className="chart-empty">
          <div className="chart-illustration">
            <ChartNoAxesCombined size={38} strokeWidth={1.2} />
          </div>
          <h3>Your market, in focus.</h3>
          <p>Live candles will appear after your data connection is ready.</p>
          <span>Actual contract prices · No synthetic market data</span>
        </div>
      )}
    </div>
  );
}
