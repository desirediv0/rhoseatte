import { prisma } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

/**
 * Get all reviews with pagination, filtering and sorting
 */
export const getReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      productId,
      rating,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter conditions
    const where = {};

    // Add search if provided (search in review title, comment or user name/email)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          product: { name: { contains: search, mode: "insensitive" } },
        },
      ];
    }

    // Add product filter if provided
    if (productId) {
      where.productId = productId;
    }

    // Add rating filter if provided
    if (rating) {
      where.rating = parseInt(rating);
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Get reviews with pagination and filtering
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take,
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: take,
      },
      message: "Reviews fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a review from the admin panel on behalf of a customer
 * (reviewer name instead of a user account).
 */
export const createAdminReview = async (req, res, next) => {
  try {
    const { productId, reviewerName, rating, title, comment, createdAt } = req.body;
    const status = ["APPROVED", "PENDING", "REJECTED"].includes(req.body.status)
      ? req.body.status
      : "APPROVED";

    const name = String(reviewerName || "").trim();
    const ratingNum = parseInt(rating, 10);
    if (!productId) throw new ApiError(400, "Product is required");
    if (!name) throw new ApiError(400, "Reviewer name is required");
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
    if (!String(comment || "").trim()) throw new ApiError(400, "Review text is required");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, "Product not found");

    let date;
    if (createdAt) {
      date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) throw new ApiError(400, "Invalid review date");
      if (date.getTime() > Date.now()) throw new ApiError(400, "Review date cannot be in the future");
    }

    const review = await prisma.review.create({
      data: {
        productId,
        reviewerName: name.slice(0, 80),
        isAdminCreated: true,
        rating: ratingNum,
        title: String(title || "").trim().slice(0, 150) || null,
        comment: String(comment).trim(),
        status,
        ...(date && { createdAt: date }),
      },
    });

    return res.status(201).json({
      success: true,
      data: { review },
      message: "Review added successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get review stats for dashboard
 */
export const getReviewStats = async (req, res, next) => {
  try {
    const [totalReviews, pendingReviews, recentReviews, averageRatingResult] =
      await Promise.all([
        prisma.review.count(),
        prisma.review.count({
          where: { status: "PENDING" },
        }),
        prisma.review.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        prisma.review.aggregate({
          _avg: {
            rating: true,
          },
        }),
      ]);

    // Getting rating distribution
    const ratingDistributionResult = await prisma.$queryRaw`
      SELECT rating, COUNT(*) as count 
      FROM "Review" 
      GROUP BY rating 
      ORDER BY rating DESC
    `;

    // Convert BigInt values to numbers to make them serializable
    const ratingDistribution = ratingDistributionResult.map((item) => ({
      rating: item.rating,
      count: Number(item.count),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        pendingReviews,
        recentReviews,
        averageRating: averageRatingResult._avg.rating || 0,
        ratingDistribution,
      },
      message: "Review stats fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!review) {
      return next(new ApiError(404, "Review not found"));
    }

    return res.status(200).json({
      success: true,
      data: { review },
      message: "Review fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review - change status, add admin comment, change featured status
 */
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status, adminComment, featured } = req.body;

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return next(new ApiError(404, "Review not found"));
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: status,
        adminComment: adminComment,
        featured: featured !== undefined ? featured : existingReview.featured,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      data: { review: updatedReview },
      message: "Review updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a reply to a review
 */
export const replyToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return next(new ApiError(400, "Reply comment is required"));
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return next(new ApiError(404, "Review not found"));
    }

    // Update the review with admin reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: comment,
        adminReplyDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      data: { review: updatedReview },
      message: "Reply added successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return next(new ApiError(404, "Review not found"));
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
