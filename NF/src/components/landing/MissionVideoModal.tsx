import React from 'react';
import { Modal } from '../ui';
import { MISSION_POSTER, MISSION_VIDEO_SRC } from './assets';

/**
 * MissionVideoModal — the Foundation's mission film in a plain HTML5
 * player. Native controls do everything the custom player did, with
 * keyboard support and captions for free; the modal handles focus.
 */
const MissionVideoModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="The mission film" description="Neema Foundation Kilifi · Ganze Sub-county" size="xl" bare>
    <div className="bg-surface-board">
      <video
        className="aspect-video w-full"
        src={MISSION_VIDEO_SRC}
        poster={MISSION_POSTER}
        controls
        autoPlay
        playsInline
        preload="metadata"
      >
        Your browser cannot play this video.{' '}
        <a href={MISSION_VIDEO_SRC} className="underline">Download it instead</a>.
      </video>
    </div>
  </Modal>
);

export default MissionVideoModal;
