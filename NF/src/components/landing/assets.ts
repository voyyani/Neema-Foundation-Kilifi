/**
 * Fixed media the landing page falls back to when the CMS has nothing.
 * Both are the Foundation's own Cloudinary assets.
 */
export const MISSION_VIDEO_PUBLIC_ID = 'v1762006443/0917_1080p_100mb_cvl4of';

export const MISSION_VIDEO_SRC = `https://res.cloudinary.com/dzqdxosk2/video/upload/q_auto:good,f_auto,w_1280/${MISSION_VIDEO_PUBLIC_ID}.mp4`;

export const MISSION_POSTER =
  `https://res.cloudinary.com/dzqdxosk2/video/upload/w_1280,h_720,c_fill,q_auto,f_auto,so_2/${MISSION_VIDEO_PUBLIC_ID}.jpg`;

/** 4:3 still from the mission film, used when a hero slide has no image */
export const HERO_FALLBACK_IMAGE =
  `https://res.cloudinary.com/dzqdxosk2/video/upload/w_800,h_600,c_fill,q_auto,f_auto,so_2/${MISSION_VIDEO_PUBLIC_ID}.jpg`;
