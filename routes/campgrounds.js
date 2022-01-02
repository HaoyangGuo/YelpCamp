const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const Campground = require("../models/Campground");
const { campgroundSchema } = require("../schemas.js");
const ExpressError = require("../utilities/ExpressError");
const { isLoggedIn, isAuthor } = require("../middleware.js");

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get(
	"/",
	catchAsync(async (req, res, next) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);

router.get("/new", isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

router.post(
	"/",
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const newCampground = await new Campground(req.body.campground);
		newCampground.author = req.user._id;
		await newCampground.save();
		req.flash("success", "Successfully made a new campground!");
		res.redirect(`/campgrounds/${newCampground._id}`);
	})
);

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash("error", "Campground doesn't exist");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", { campground });
	})
);

router.delete(
	"/:id",
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash("success", "Successfully deleted campground");
		res.redirect("/campgrounds");
	})
);

router.put(
	"/:id",
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		const updatedCampground = await Campground.findById(id);
		if (!updatedCampground) {
			req.flash("error", "Campground doesn't exist");
			return res.redirect("/campgrounds");
		}
		req.flash("success", "Successfully updated campground!");
		res.render("campgrounds/show", { campground: updatedCampground });
	})
);

router.get(
	"/:id",
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id)
			.populate({ path: "reviews", populate: { path: "author" } })
			.populate("author");
		console.log(campground);
		res.render("campgrounds/show", { campground });
	})
);

module.exports = router;
