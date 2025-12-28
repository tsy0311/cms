const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    default: ''
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure slug is not empty - use default for empty names
    if (!baseSlug || baseSlug.trim() === '') {
      baseSlug = 'default-category';
    }
    
    // Make slug unique by appending random string if needed
    let slug = baseSlug;
    let counter = 0;
    const maxAttempts = 100;
    
    while (counter < maxAttempts) {
      const existing = await mongoose.model('Category').findOne({ slug });
      if (!existing || existing._id.toString() === this._id.toString()) {
        this.slug = slug;
        return next();
      }
      // Append random string to make it unique
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 9)}`;
      counter++;
    }
    
    // Fallback: use timestamp if still duplicate
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);

