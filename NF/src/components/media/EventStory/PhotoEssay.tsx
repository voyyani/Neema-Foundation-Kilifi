/**
 * PhotoEssay — Automatic photo essay layout engine
 * Neema Foundation Kilifi · Phase 3
 *
 * Sorts items: featured first, then by display_order.
 * Cycles through block patterns: hero → diptych → trio → masonry → diptych → trio → …
 * All remaining items land in a final masonry block.
 *
 * This guarantees a compelling layout with zero manual curation.
 */

import React from 'react';
import type { PublicMediaItem } from '../../../hooks/public/usePublicMedia';
import HeroShot from './layouts/HeroShot';
import DiptychRow from './layouts/DiptychRow';
import TrioRow from './layouts/TrioRow';
import MasonryBlock from './layouts/MasonryBlock';

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockType = 'hero' | 'diptych' | 'trio' | 'masonry';

interface HeroBlock   { type: 'hero';    items: [PublicMediaItem] }
interface DiptychBlock{ type: 'diptych'; items: [PublicMediaItem, PublicMediaItem] }
interface TrioBlock   { type: 'trio';    items: [PublicMediaItem, PublicMediaItem, PublicMediaItem] }
interface MasonryBlock2 { type: 'masonry'; items: PublicMediaItem[] }

type EssayBlock = HeroBlock | DiptychBlock | TrioBlock | MasonryBlock2;

// ─── Layout Engine ────────────────────────────────────────────────────────────

const BLOCK_SIZES: Record<BlockType, number> = {
  hero:    1,
  diptych: 2,
  trio:    3,
  masonry: 6, // prefers 6 but will accept 4–8
};

/** Cycling pattern after the initial hero */
const CYCLE: BlockType[] = ['diptych', 'trio', 'masonry', 'diptych', 'trio'];

export function buildPhotoEssayLayout(items: PublicMediaItem[]): EssayBlock[] {
  if (items.length === 0) return [];

  // Sort: featured first, then by display_order
  const sorted = [...items].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return a.display_order - b.display_order;
  });

  const blocks: EssayBlock[] = [];
  let cursor = 0;
  let cycleIdx = 0;

  // First block is always a HeroShot
  if (sorted.length >= 1) {
    blocks.push({ type: 'hero', items: [sorted[0]] });
    cursor = 1;
  }

  while (cursor < sorted.length) {
    const remaining = sorted.length - cursor;

    // Decide block type
    let blockType: BlockType;
    if (remaining <= 3 && remaining >= 1) {
      // Too few for masonry — use diptych or trio to finish cleanly
      blockType = remaining === 1 ? 'hero' : remaining === 2 ? 'diptych' : 'trio';
    } else {
      blockType = CYCLE[cycleIdx % CYCLE.length];
      cycleIdx++;
    }

    const size = BLOCK_SIZES[blockType];

    if (blockType === 'hero' && remaining >= 1) {
      blocks.push({ type: 'hero', items: [sorted[cursor]] });
      cursor += 1;
    } else if (blockType === 'diptych' && remaining >= 2) {
      blocks.push({ type: 'diptych', items: [sorted[cursor], sorted[cursor + 1]] });
      cursor += 2;
    } else if (blockType === 'trio' && remaining >= 3) {
      blocks.push({ type: 'trio', items: [sorted[cursor], sorted[cursor + 1], sorted[cursor + 2]] });
      cursor += 3;
    } else if (blockType === 'masonry' && remaining >= 4) {
      // Take 4–8 items for this masonry block
      const take = Math.min(remaining, size);
      blocks.push({ type: 'masonry', items: sorted.slice(cursor, cursor + take) });
      cursor += take;
    } else {
      // Fallback: dump everything left into masonry
      if (remaining >= 4) {
        blocks.push({ type: 'masonry', items: sorted.slice(cursor) });
      } else if (remaining === 3) {
        blocks.push({ type: 'trio',    items: [sorted[cursor], sorted[cursor + 1], sorted[cursor + 2]] });
      } else if (remaining === 2) {
        blocks.push({ type: 'diptych', items: [sorted[cursor], sorted[cursor + 1]] });
      } else {
        blocks.push({ type: 'hero', items: [sorted[cursor]] });
      }
      cursor = sorted.length;
    }
  }

  return blocks;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PhotoEssayProps {
  items: PublicMediaItem[];
  albumTitle: string;
  onImageClick?: (item: PublicMediaItem, index: number) => void;
}

const PhotoEssay: React.FC<PhotoEssayProps> = ({ items, albumTitle, onImageClick }) => {
  if (items.length === 0) return null;

  const blocks = buildPhotoEssayLayout(items);

  // Build a flat index map so onImageClick can pass the global index
  const flatOrder: PublicMediaItem[] = [...items].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return a.display_order - b.display_order;
  });

  const handleClick = (item: PublicMediaItem) => {
    const idx = flatOrder.findIndex((x) => x.id === item.id);
    onImageClick?.(item, idx >= 0 ? idx : 0);
  };

  return (
    <section aria-label="Photo essay" className="space-y-4 sm:space-y-6">
      {blocks.map((block, blockIdx) => {
        switch (block.type) {
          case 'hero':
            return (
              <HeroShot
                key={`block-${blockIdx}`}
                item={block.items[0]}
                albumTitle={albumTitle}
                onImageClick={handleClick}
              />
            );
          case 'diptych':
            return (
              <DiptychRow
                key={`block-${blockIdx}`}
                items={block.items}
                albumTitle={albumTitle}
                onImageClick={handleClick}
              />
            );
          case 'trio':
            return (
              <TrioRow
                key={`block-${blockIdx}`}
                items={block.items}
                albumTitle={albumTitle}
                onImageClick={handleClick}
              />
            );
          case 'masonry':
            return (
              <MasonryBlock
                key={`block-${blockIdx}`}
                items={block.items}
                albumTitle={albumTitle}
                onImageClick={handleClick}
              />
            );
          default:
            return null;
        }
      })}
    </section>
  );
};

export default PhotoEssay;
