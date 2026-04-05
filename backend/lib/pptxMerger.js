const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PptxMerger {
  /**
   * Merge multiple single-slide PPTX files into one presentation.
   * @param {Array<{slideNumber: number, outputPath: string}>} slideFiles - Ordered slide files
   * @param {string} finalOutputPath - Path for the merged PPTX
   * @returns {string} finalOutputPath
   */
  static merge(slideFiles, finalOutputPath) {
    const orderedPaths = slideFiles
      .sort((a, b) => a.slideNumber - b.slideNumber)
      .map(f => f.outputPath);

    // Write merge script to temp file
    const mergeScript = path.join(os.tmpdir(), `merge-slides-${Date.now()}.py`);
    fs.writeFileSync(mergeScript, this._getMergeScript(), 'utf-8');

    // Pass file list and output path as JSON args
    const inputJson = JSON.stringify(orderedPaths);
    const cmd = `python3 "${mergeScript}" '${inputJson}' "${finalOutputPath}"`;

    console.log(`[merger] Merging ${orderedPaths.length} slides into ${finalOutputPath}`);

    try {
      execSync(cmd, { cwd: '/app', timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] });
      console.log(`[merger] Merge complete: ${finalOutputPath}`);
    } catch (err) {
      console.error(`[merger] Merge failed: ${err.stderr?.toString() || err.message}`);
      throw new Error(`PPTX merge failed: ${err.message}`);
    } finally {
      try { fs.unlinkSync(mergeScript); } catch (e) { /* ignore */ }
    }

    // Validate merged file
    this._validate(finalOutputPath);

    return finalOutputPath;
  }

  /**
   * Clean up temporary slide files.
   */
  static cleanup(slideFiles) {
    for (const f of slideFiles) {
      try { fs.unlinkSync(f.outputPath); } catch (e) { /* ignore */ }
    }
  }

  static _validate(filePath) {
    try {
      execSync(`python3 -c "from pptx import Presentation; p = Presentation('${filePath}'); p.save('${filePath}')"`, {
        cwd: '/app', timeout: 30000
      });
      console.log(`[merger] Validation passed: ${filePath}`);
    } catch (err) {
      console.error(`[merger] Validation warning: ${err.message}`);
    }
  }

  static _getMergeScript() {
    return `
import sys
import json
import copy
from pptx import Presentation
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from lxml import etree

slide_files = json.loads(sys.argv[1])
output_path = sys.argv[2]

if len(slide_files) == 0:
    print("No slide files to merge")
    sys.exit(1)

# Use the first slide's presentation as the base
merged = Presentation(slide_files[0])

# Copy slides from remaining files
for slide_file in slide_files[1:]:
    src_prs = Presentation(slide_file)
    for src_slide in src_prs.slides:
        # Add a blank slide using a blank layout
        slide_layout = merged.slide_layouts[6] if len(merged.slide_layouts) > 6 else merged.slide_layouts[-1]
        new_slide = merged.slides.add_slide(slide_layout)

        # Clear the blank slide's shapes
        for shape in list(new_slide.shapes):
            sp = shape._element
            sp.getparent().remove(sp)

        # Copy all shapes from source slide
        for shape in src_slide.shapes:
            el = copy.deepcopy(shape._element)
            new_slide.shapes._spTree.append(el)

        # Copy slide background if set
        src_bg = src_slide.background._element
        if src_bg is not None:
            new_bg = copy.deepcopy(src_bg)
            # Replace the background element
            slide_elem = new_slide._element
            existing_bg = slide_elem.find('{http://schemas.openxmlformats.org/presentationml/2006/main}bg')
            if existing_bg is not None:
                slide_elem.remove(existing_bg)
            # Insert bg as first child (before spTree)
            slide_elem.insert(0, new_bg)

        # Copy images and other relationships
        for rel in src_slide.part.rels.values():
            if rel.reltype in [RT.IMAGE, RT.MEDIA]:
                try:
                    new_slide.part.rels.get_or_add(rel.reltype, rel.target_ref)
                except Exception:
                    # If relationship already exists or target is embedded, copy the blob
                    try:
                        new_slide.part.rels.get_or_add_ext_rel(rel.reltype, rel.target_ref)
                    except Exception:
                        pass

# Set slide dimensions from the first source
merged.slide_width = Presentation(slide_files[0]).slide_width
merged.slide_height = Presentation(slide_files[0]).slide_height

merged.save(output_path)
print(f"Merged {len(slide_files)} slides into {output_path}")
`;
  }
}

module.exports = PptxMerger;
