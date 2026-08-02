"use client";

import { ExternalLink, Play } from "lucide-react";
import * as React from "react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  url: string;
}

export function YouTubePlayer({ videoId, title, url }: YouTubePlayerProps) {
  const [playing, setPlaying] = React.useState(false);

  return (
    <figure className="overflow-hidden rounded-xl bg-surface-sunken shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="relative aspect-video w-full bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 size-full"
          >
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className="size-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-black/65 backdrop-blur-sm transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:scale-110">
                <Play className="ml-0.5 size-6 fill-white text-white" />
              </span>
            </span>
          </button>
        )}
      </div>

      <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="truncate text-sm font-medium text-ink">{title}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex shrink-0 items-center gap-1.5 text-2xs text-ink-subtle transition-colors hover:text-ink"
        >
          YouTube
          <ExternalLink className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}
