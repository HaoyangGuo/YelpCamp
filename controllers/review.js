const Review = require("../models/Review");
const Campground = require("../models/Campground");

module.exports.createReview = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash("success", "Created new review!");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deletReview = async (req, res, next) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, {
		$pull: { reviews: reviewId },
	});
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Successfully deleted review");
	res.redirect(`/campgrounds/${id}`);
};
