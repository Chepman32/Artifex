// Script to generate all particle imports for the ParticleSplashScreen

const fs = require('fs');
const path = require('path');

const generateParticleImports = () => {
  let imports = `// Generated particle imports for all 500 particles\nconst particleImages: { [key: string]: any } = {\n`;

  // Generate particle imports for all 500 particles
  for (let i = 1; i <= 500; i++) {
    const paddedId = i.toString().padStart(4, '0');
    const row = Math.floor((i - 1) / 20);
    const col = (i - 1) % 20;
    const xStart = col * 51;
    const xEnd = col === 19 ? 1024 : (col + 1) * 51;
    const yStart = row * 41;
    const yEnd = row === 24 ? 1024 : (row + 1) * 41 - 1;

    const filename = `particle_${paddedId}_r${row
      .toString()
      .padStart(2, '0')}_c${col
      .toString()
      .padStart(2, '0')}_x${xStart}-${xEnd}_y${yStart}-${yEnd}.png`;
    const importLine = `  '${paddedId}': require('../assets/icons/stikaro_particles_500/${filename}'),`;

    imports += importLine + '\n';
  }

  imports += `};\n\nexport default particleImages;`;

  return imports;
};

// Generate and write the imports
const imports = generateParticleImports();
const outputPath = path.join(__dirname, 'src', 'screens', 'ParticleImports.ts');

try {
  fs.writeFileSync(outputPath, imports);
  console.log(`Generated ${outputPath} with all 500 particle imports`);
} catch (error) {
  console.error('Error writing particle imports:', error);
}
