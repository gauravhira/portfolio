"use client";

import { useRef } from "react";
import Link from "next/link";

export type BlogCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date: string | null;
  image: string | null;
};

export default function BlogScrollRow({ cards }: { cards: BlogCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only hijack mouse drag — touch already gets native swipe + scroll-snap.
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (el) el.releasePointerCapture(e.pointerId);
    drag.current.active = false;
  }

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-[5%] px-[5%] cursor-grab active:cursor-grabbing select-none"
    >
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/blog/${card.slug}`}
          draggable={false}
          onClickCapture={(e) => {
            // A drag that ended over the link shouldn't count as a click-through.
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="hover-lift snap-start flex-shrink-0 w-[260px] md:w-[300px] bg-white rounded-2xl border border-black/[0.07] overflow-hidden flex flex-col"
        >
          {card.image && (
            <div className="w-full h-[140px] overflow-hidden bg-black/[0.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.image} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            {card.date && <p className="text-[11px] text-[--muted] mb-2">{card.date}</p>}
            <h3 className="font-serif text-[18px] text-[--navy] tracking-[-0.3px] mb-2 leading-[1.3]">
              {card.title}
            </h3>
            {card.excerpt && (
              <p className="text-[13px] text-[--muted] leading-[1.6]">{card.excerpt}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
