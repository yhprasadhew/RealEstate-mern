import Review from "../models/review.model.js";

// Create Review (User must be logged in)
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required.",
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      rating: ratingNum,
      comment: comment.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully. It will be visible once approved by an administrator.",
      review,
    });
  } catch (error) {
    console.error("CREATE_REVIEW_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Approved Reviews (Public)
export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET_APPROVED_REVIEWS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Reviews (Admin Only)
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET_ALL_REVIEWS_ADMIN_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Review (Admin Only)
export const approveReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    review.isApproved = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review approved successfully.",
      review,
    });
  } catch (error) {
    console.error("APPROVE_REVIEW_ADMIN_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Review (Admin Only)
export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_REVIEW_ADMIN_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
