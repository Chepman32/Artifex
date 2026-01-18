// Utility to parse particle data from stikaro_particles_500 directory

interface ParticleData {
  id: number;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  finalX: number;
  finalY: number;
}

// Generate all particle data for the 500 particles
export const generateParticleData = (): ParticleData[] => {
  const particles: ParticleData[] = [];
  
  // Generate data for all 500 particles based on the naming pattern
  for (let i = 1; i <= 500; i++) {
    // Calculate row and column based on particle ID
    const row = Math.floor((i - 1) / 20);
    const col = (i - 1) % 20;
    
    // Calculate coordinates based on the grid pattern observed in filenames
    const xStart = col * 51;
    const xEnd = col === 19 ? 1024 : (col + 1) * 51;
    const yStart = row * 41;
    const yEnd = (row + 1) * 41;
    
    particles.push({
      id: i,
      sourceX: xStart,
      sourceY: yStart,
      sourceWidth: xEnd - xStart,
      sourceHeight: yEnd - yStart,
      finalX: xStart,
      finalY: yStart,
    });
  }
  
  return particles;
};

// Get random starting positions for particles (scattered around screen)
export const getRandomStartPosition = (screenWidth: number, screenHeight: number) => {
  const margin = 100;
  return {
    x: margin + Math.random() * (screenWidth - 2 * margin),
    y: margin + Math.random() * (screenHeight - 2 * margin),
  };
};

// Calculate centered position for the complete icon
export const getCenteredPosition = (
  sourceX: number, 
  sourceY: number, 
  screenWidth: number, 
  screenHeight: number,
  iconSize: number = 200
) => {
  // Scale down from 1024x1024 to iconSize
  const scale = iconSize / 1024;
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const offsetX = -iconSize / 2;
  const offsetY = -iconSize / 2;
  
  return {
    x: centerX + offsetX + sourceX * scale,
    y: centerY + offsetY + sourceY * scale,
  };
};
