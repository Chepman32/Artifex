// Particle index utility to handle all 500 particles efficiently

// Generate particle filename based on ID
const generateParticleFilename = (id: number): string => {
  const paddedId = id.toString().padStart(4, '0');
  const row = Math.floor((id - 1) / 20);
  const col = (id - 1) % 20;
  const xStart = col * 51;
  const xEnd = col === 19 ? 1024 : (col + 1) * 51;
  const yStart = row * 41;
  const yEnd = (row + 1) * 41;
  
  return `particle_${paddedId}_r${row.toString().padStart(2, '0')}_c${col.toString().padStart(2, '0')}_x${xStart}-${xEnd}_y${yStart}-${yEnd}.png`;
};

// Particle image mapping
export const particleImages: { [key: string]: any } = {};

// Initialize all particle images
const initializeParticles = () => {
  for (let i = 1; i <= 500; i++) {
    const paddedId = i.toString().padStart(4, '0');
    const filename = generateParticleFilename(i);
    try {
      // Use require with the full path
      particleImages[paddedId] = require(`../assets/icons/stikaro_particles_500/${filename}`);
    } catch (error) {
      console.warn(`Failed to load particle ${i}: ${filename}`);
    }
  }
};

// Initialize on module load
initializeParticles();

// Export particle count
export const PARTICLE_COUNT = 500;
