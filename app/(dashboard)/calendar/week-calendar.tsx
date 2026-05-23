"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import type { BookingRecord } from "@/types";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  format,
  getHours,
  getMinutes,
} from "date-fns";
import { es } from "date-fns/locale";

const WORK_START = 8;
const WORK_END = 20;
const HOURS = Array.from({ length: WORK_END - WORK_START }, (_, i) => WORK_START + i);

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-primary/90 text-white border-primary",
  completed: "bg-success/80 text-white border-success",
  no_show: "bg-warning/80 text-white border-warning",
};

export function WeekCalendar({ bookings }: { bookings: BookingRecord[] }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const baseDate = addWeeks(new Date(), weekOffset);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  function getBookingsForDay(day: Date) {
    return bookings.filter((b) => isSameDay(new Date(b.starts_at), day));
  }

  function getTopPercent(startsAt: string) {
    const date = new Date(startsAt);
    const minutes = (getHours(date) - WORK_START) * 60 + getMinutes(date);
    return (minutes / ((WORK_END - WORK_START) * 60)) * 100;
  }

  function getHeightPercent(startsAt: string, endsAt: string) {
    const durationMin =
      (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000;
    return (durationMin / ((WORK_END - WORK_START) * 60)) * 100;
  }

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {format(weekStart, "d MMM", { locale: es })} –{" "}
            {format(weekEnd, "d MMM yyyy", { locale: es })}
          </p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-primary hover:underline"
            >
              Hoy
            </button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-8 gap-0 border border-border rounded-lg overflow-hidden bg-white">
        <div className="border-r border-border" />
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center border-r border-border last:border-r-0",
                isToday && "bg-primary/5"
              )}
            >
              <p className="text-xs text-muted-foreground uppercase">
                {format(day, "EEE", { locale: es })}
              </p>
              <p
                className={cn(
                  "text-sm font-bold mt-0.5",
                  isToday ? "text-primary" : "text-foreground"
                )}
              >
                {format(day, "d")}
              </p>
            </div>
          );
        })}

        {/* Time grid */}
        <div className="col-span-8 grid grid-cols-8">
          {/* Hours column */}
          <div className="border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-14 border-b border-border last:border-b-0 flex items-start justify-end pr-2 pt-1"
              >
                <span className="text-xs text-muted-foreground">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative border-r border-border last:border-r-0",
                  isToday && "bg-primary/5"
                )}
                style={{ height: `${HOURS.length * 56}px` }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-border/50"
                    style={{ top: `${((hour - WORK_START) / (WORK_END - WORK_START)) * 100}%`, height: `${100 / (WORK_END - WORK_START)}%` }}
                  />
                ))}
                {dayBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className={cn(
                      "absolute left-0.5 right-0.5 rounded text-[10px] font-medium px-1 py-0.5 overflow-hidden border",
                      STATUS_COLORS[booking.status] ?? "bg-secondary text-foreground border-border"
                    )}
                    style={{
                      top: `${getTopPercent(booking.starts_at)}%`,
                      height: `${Math.max(getHeightPercent(booking.starts_at, booking.ends_at), 3)}%`,
                    }}
                  >
                    <p className="truncate">{formatTime(booking.starts_at)}</p>
                    <p className="truncate">{booking.client_name}</p>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
