"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          className="relative group block p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/10 dark:bg-primary/20 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1.05,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                exit={{
                  opacity: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: "easeIn" },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <div className="relative z-20 h-full">
              <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                {item.icon && <div className="mb-4">{item.icon}</div>}
                <div>
                  <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2 group-hover:text-primary/90 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm group-hover:text-primary/70 transition-colors">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full bg-card dark:bg-card border-2 border-border dark:border-border transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
};


