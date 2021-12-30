const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/Campground");

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/campgrounds", async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
});

app.post("/campgrounds", async (req, res) => {
	const newCampground = await new Campground(req.body.campground);
	await newCampground.save();
	res.redirect(`/campgrounds/${newCampground._id}`);
});

app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

app.get("/campgrounds/:id/edit", async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	res.render("campgrounds/edit", { campground });
});

app.delete("/campgrounds/:id", async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	res.redirect("/campgrounds");
});

app.put("/campgrounds/:id", async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	const updatedCampground = await Campground.findById(id);
	res.render("campgrounds/show", { campground: updatedCampground });
});

app.get("/campgrounds/:id", async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	res.render("campgrounds/show", { campground });
});

app.listen(3000, () => {
	console.log("Serving on port 3000");
});
