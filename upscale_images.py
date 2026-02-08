#!/usr/bin/env python3
"""
Upscale all product images to higher resolution
"""
from PIL import Image
import os
import sys

# Configuration
source_dir = 'public/product_images'
scale_factor = 4  # 4x upscaling (282x282 -> 1128x1128)
quality = 95  # JPEG quality

if not os.path.exists(source_dir):
    print(f"Directory {source_dir} not found!")
    sys.exit(1)

# Get all image files
image_files = sorted([f for f in os.listdir(source_dir) 
                     if f.startswith('image_row_') and 
                     (f.endswith('.jpg') or f.endswith('.jpeg') or f.endswith('.png'))])

if not image_files:
    print("No images found!")
    sys.exit(1)

print(f"Found {len(image_files)} images to upscale")
print(f"Upscaling by {scale_factor}x (e.g., 282x282 -> {282*scale_factor}x{282*scale_factor})")
print("This may take a few minutes...\n")

processed = 0
errors = 0

for i, filename in enumerate(image_files, 1):
    try:
        filepath = os.path.join(source_dir, filename)
        
        # Open image
        img = Image.open(filepath)
        original_size = img.size
        
        # Calculate new size
        new_size = (original_size[0] * scale_factor, original_size[1] * scale_factor)
        
        # Upscale using LANCZOS resampling (high quality)
        upscaled = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Save with high quality
        if filename.endswith('.png'):
            upscaled.save(filepath, 'PNG', optimize=True)
        else:
            upscaled.save(filepath, 'JPEG', quality=quality, optimize=True)
        
        processed += 1
        if i % 50 == 0:
            print(f"  Processed {i}/{len(image_files)} images... ({processed} successful, {errors} errors)")
            
    except Exception as e:
        print(f"  Error processing {filename}: {e}")
        errors += 1

print(f"\n✓ Completed!")
print(f"  Successfully upscaled: {processed} images")
print(f"  Errors: {errors}")
if processed > 0:
    print(f"  New size: approximately {282*scale_factor}x{282*scale_factor} pixels per image")

