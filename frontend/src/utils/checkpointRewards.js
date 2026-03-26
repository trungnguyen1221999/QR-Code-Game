export const CHECKPOINT_SECRET_REWARDS = {
  1: { name: 'Totem', image: '/storyItem/sacredtotem(tower).png' },
  2: { name: 'Hammer', image: '/storyItem/sacredhammer(whakAMole).png' },
  3: { name: 'Scroll', image: '/storyItem/sacredscroll(quiz).png' },
  4: { name: 'Hat', image: '/storyItem/sacredhat(memory).png' },
  5: { name: 'Stone', image: '/storyItem/sacredstone(puzzle).png' },
  6: { name: 'Necklace', image: '/storyItem/sacrednecklace(simon).png' },
};

export function getCheckpointSecretReward(checkpoint) {
  return CHECKPOINT_SECRET_REWARDS[checkpoint] || CHECKPOINT_SECRET_REWARDS[1];
}



