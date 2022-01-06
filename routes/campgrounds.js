const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utilities/catchAsync");
const { campgroundSchema } = require("../schemas.js");
const ExpressError = require("../utilities/ExpressError");
const { isLoggedIn, isAuthor } = require("../middleware.js");

const { cloudinary, storage } = require("../cloudinary/index");
const multer = require("multer");
const upload = multer({ storage });

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router
	.route("/")
	.get(catchAsync(campgrounds.index))
	.post(
		isLoggedIn,
		upload.array("image"),
		validateCampground,
		catchAsync(campgrounds.createNewCampground)
	);

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderEditForm)
);

router
	.route("/:id")
	.get(catchAsync(campgrounds.showCampGround))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
	.put(
		isLoggedIn,
		isAuthor,
		validateCampground,
		catchAsync(campgrounds.updateCampground)
	);

module.exports = router;


