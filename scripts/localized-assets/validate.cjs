const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const {designs} = require('./designs.cjs');
const {languages} = require('./copy.json');
const root = path.resolve(__dirname,'../..');

async function main() {
  const files = [];
  let totalBytes = 0;
  for (const language of Object.keys(languages)) {
    for (const design of designs) {
      const relative = `${language}/${design.kind}/${design.id}.png`;
      const filename = path.join(root,'src/assets/localized',relative);
      const bytes = fs.readFileSync(filename);
      const metadata = await sharp(bytes).metadata();
      if (metadata.format !== 'png' || metadata.width !== 640 || metadata.height !== 640 || !metadata.hasAlpha) {
        throw new Error(`Invalid native image: ${relative}`);
      }
      const {data,info} = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      let visible = 0;
      for (let y=0;y<640;y++) {
        for (let x=0;x<640;x++) {
          const alpha = data[(y*640+x)*info.channels+info.channels-1];
          if (alpha) {
            visible++;
            if (x===0 || y===0 || x===639 || y===639) throw new Error(`Artwork clipped at image edge: ${relative}`);
          }
        }
      }
      if (visible < 1000 || visible > 640*640*.9) throw new Error(`Blank image or opaque background: ${relative}`);
      totalBytes += bytes.length;
      files.push({path:relative,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
    }
  }
  const report = {languages:Object.keys(languages).length,assetsPerLanguage:designs.length,totalAssets:files.length,totalBytes,files};
  fs.writeFileSync(path.join(root,'output/localized-assets-review/validation.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Validated ${files.length} transparent, nonempty 640×640 PNGs; no image-edge clipping. ${(totalBytes/1024/1024).toFixed(1)} MiB total.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
