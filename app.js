const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const catchAsync = require("./utilities/catchAsync");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/Campground");
const Review = require("./models/Review");

const db = mongoose
	.connect("mongodb://localhost:27017/yelp-camp")
	.then(() => {
		console.log("MONGO CONNECTION OPEN!!!");
	})
	.catch((err) => {
		console.log("OH NO MONGO CONNECTION ERROR!!!!");
		console.log(err);
	});

const app = express();

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
	res.render("home");
});

app.get(
	"/campgrounds",
	catchAsync(async (req, res, next) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);

app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

app.post(
	"/campgrounds",
	validateCampground,
	catchAsync(async (req, res, next) => {
		const newCampground = await new Campground(req.body.campground);
		await newCampground.save();
		res.redirect(`/campgrounds/${newCampground._id}`);
	})
);

app.get(
	"/campgrounds/:id/edit",
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		res.render("campgrounds/edit", { campground });
	})
);

app.delete(
	"/campgrounds/:id",
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	})
);

app.put(
	"/campgrounds/:id",
	validateCampground,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		const updatedCampground = await Campground.findById(id);
		res.render("campgrounds/show", { campground: updatedCampground });
	})
);

app.get(
	"/campgrounds/:id",
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id).populate("reviews");
		res.render("campgrounds/show", { campground });
	})
);

app.post(
	"/campgrounds/:id/reviews",
	validateReview,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.delete(
	"/campgrounds/:id/reviews/:reviewId",
	catchAsync(async (req, res, next) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, {
			$pull: { reviews: reviewId },
		});
		await Review.findByIdAndDelete(reviewId);
		res.redirect(`/campgrounds/${id}`);
	})
);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use(function (err, req, res, next) {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Something went wrong...";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on port 3000");
});
