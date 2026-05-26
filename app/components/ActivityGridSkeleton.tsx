"use client";

import { cn } from "@/lib/utils";

export default function ActivityGridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
        <div className="space-y-4 max-w-2xl">
          <div className="h-4 w-32 bg-primary/10 rounded-full animate-pulse" />
          <div className="h-12 w-96 bg-secondary/5 rounded-2xl animate-pulse" />
          <div className="h-6 w-[500px] bg-secondary/5 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-[32px] overflow-hidden border border-border-light bg-white shadow-sm h-[500px]">
             <div className="aspect-[3/2] bg-secondary/10 animate-pulse" />
             <div className="p-8 space-y-4">
                <div className="h-4 w-20 bg-primary/10 rounded-full animate-pulse" />
                <div className="h-8 w-full bg-secondary/5 rounded-xl animate-pulse" />
                <div className="h-6 w-2/3 bg-secondary/5 rounded-lg animate-pulse" />
                <div className="pt-8 flex justify-between">
                   <div className="h-10 w-24 bg-primary/5 rounded-xl animate-pulse" />
                   <div className="h-10 w-32 bg-primary/20 rounded-xl animate-pulse" />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
