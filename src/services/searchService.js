const Book = require('../models/Book');
const Category = require('../models/Category');
const { cache } = require('../config/redis');

class SearchService {
  // Kitoblarni qidirish
  static async searchBooks(query) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      language,
      rating,
      sort,
      page = 1,
      limit = 10
    } = query;

    const filter = {};

    // Qidiruv so'rovi bo'yicha
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Kategoriya bo'yicha
    if (category) {
      filter.categories = category;
    }

    // Narx oralig'i bo'yicha
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Til bo'yicha
    if (language) {
      filter.language = language;
    }

    // Reyting bo'yicha
    if (rating) {
      filter['rating.average'] = { $gte: Number(rating) };
    }

    // Status bo'yicha (faqat active kitoblar)
    filter.status = 'active';

    // Sortlash
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { 'rating.average': -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'popular':
          sortOption = { viewCount: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    const books = await Book.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name')
      .populate('seller', 'name')
      .select('-pdfUrl');

    const total = await Book.countDocuments(filter);

    return {
      books,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Kategoriyalar bo'yicha filtrlash
  static async getCategories() {
    const categories = await Category.find({ isActive: true })
      .select('name slug description bookCount')
      .sort('name');
    
    return categories;
  }

  // Tillar ro'yxatini olish
  static async getLanguages() {
    const languages = await Book.distinct('language', { status: 'active' });
    return languages;
  }

  // Narx oralig'ini olish
  static async getPriceRange() {
    const result = await Book.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    return result[0] || { minPrice: 0, maxPrice: 0 };
  }

  // Tavsiya etilgan kitoblar
  static async getRecommendedBooks(userId, limit = 5) {
    // User qiziqishlari asosida tavsiyalar
    const user = await User.findById(userId)
      .populate('purchaseHistory.book');
    
    if (!user) {
      return this.getPopularBooks(limit);
    }

    // User sotib olgan kitoblar kategoriyalari
    const userCategories = user.purchaseHistory
      .map(item => item.book.categories)
      .flat();

    // O'xshash kategoriyalardagi kitoblar
    const recommendedBooks = await Book.find({
      categories: { $in: userCategories },
      status: 'active',
      _id: { $nin: user.purchaseHistory.map(item => item.book._id) }
    })
      .sort({ 'rating.average': -1 })
      .limit(limit)
      .populate('author', 'name')
      .select('-pdfUrl');

    return recommendedBooks;
  }

  // Eng mashhur kitoblar
  static async getPopularBooks(limit = 5) {
    const books = await Book.find({ status: 'active' })
      .sort({ viewCount: -1, 'rating.average': -1 })
      .limit(limit)
      .populate('author', 'name')
      .select('-pdfUrl');

    return books;
  }
}

module.exports = SearchService; 