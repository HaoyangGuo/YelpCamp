const Campground = require("./models/Campground")

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be signed in to add new campground");
		return res.redirect("/login");
	}
	next();
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author._id.equals(req.user._id)) {
		req.flash("error", "You don't have permission to do that!");
		return res.redirect(`/campgrounds/${campground._id}`);
	}
	next();
};