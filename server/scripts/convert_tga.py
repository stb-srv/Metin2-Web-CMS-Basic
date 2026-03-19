"""
TGA to PNG Converter for Metin2 Item Icons
Converts uploaded TGA files to PNG format.
Input:  folder with .tga files (passed as argument)
Output: PNGs saved to public/images/items/ with VNUM-based filenames
"""
import sys
import os
import json
import shutil
from PIL import Image

def convert_tga_folder(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    results = {"converted": [], "errors": [], "skipped": []}

    for filename in sorted(os.listdir(input_dir)):
        ext = filename.lower()
        if not (ext.endswith('.tga') or ext.endswith('.png')):
            continue

        src = os.path.join(input_dir, filename)
        # Extract name without extension, keep as-is (e.g. "00010" or "30001")
        name = os.path.splitext(filename)[0]
        dst = os.path.join(output_dir, f"{name}.png")

        try:
            if ext.endswith('.tga'):
                with Image.open(src) as img:
                    # TGA files often have alpha, convert to RGBA then save as PNG
                    img = img.convert("RGBA")
                    img.save(dst, "PNG")
                results["converted"].append({"file": filename, "output": f"{name}.png", "size": os.path.getsize(dst), "type": "tga_converted"})
            else:
                # Direct PNG copy
                shutil.copy2(src, dst)
                results["converted"].append({"file": filename, "output": f"{name}.png", "size": os.path.getsize(dst), "type": "png_copied"})
        except Exception as e:
            results["errors"].append({"file": filename, "error": str(e)})

    # Output JSON result for Node.js to parse
    print(json.dumps(results))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python convert_tga.py <input_dir> <output_dir>"}))
        sys.exit(1)

    input_dir = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.isdir(input_dir):
        print(json.dumps({"error": f"Input directory not found: {input_dir}"}))
        sys.exit(1)

    convert_tga_folder(input_dir, output_dir)
