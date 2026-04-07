export const CHECKPOINT_SECRET_REWARDS = {
  1: { name: 'Totem', image: '/storyItem/sacredhammer(whakAMole).png' },
  2: { name: 'Hammer', image: '/storyItem/sacredhammer(whakAMole).png' },
  3: { name: 'Scroll', image: '/storyItem/sacredhammer(whakAMole).png' },
  4: { name: 'Hat', image: '/storyItem/sacredhat(memory).png' },
  5: { name: 'Stone', image: '/storyItem/sacredhammer(whakAMole).png' },
  6: { name: 'Necklace', image: '/storyItem/sacredhat(memory).png' },
  7: { name: 'Hammer', image: '/storyItem/sacredhat(memory).png' },
  8: { name: 'Scroll', image: '/storyItem/sacredhat(memory).png' },
  9: { name: 'Totem', image: '/storyItem/sacredhat(memory).png' },
  10: { name: 'Stone', image: '/storyItem/sacredhat(memory).png' },
  11: { name: 'Necklace', image: '/storyItem/sacredhat(memory).png' },
  12: { name: 'Scroll', image: '/storyItem/sacredhat(memory).png' },
  13: { name: 'Totem', image: '/storyItem/sacredhat(memory).png' },
};

export function getCheckpointSecretReward(checkpoint) {
  return CHECKPOINT_SECRET_REWARDS[checkpoint] || CHECKPOINT_SECRET_REWARDS[1];
}



