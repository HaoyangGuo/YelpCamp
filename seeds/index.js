const mongoose = require("mongoose");
const Campground = require("../models/Campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const axios = require("axios").default;

const db = mongoose
	.connect("mongodb://localhost:27017/yelp-camp")
	.then(() => {
		console.log("MONGO CONNECTION OPEN!!!");
	})
	.catch((err) => {
		console.log("OH NO MONGO CONNECTION ERROR!!!!");
		console.log(err);
	});

// call unsplash and return small image
async function seedImg() {
	try {
		const resp = await axios.get("https://api.unsplash.com/photos/random", {
			params: {
				client_id: "Dp0HMR-OVAMObwoR6-ygFYB5wQ9XSgDwlnxPy5xDvHg",
				collections: 11389229,
			},
		});
		return resp.data.urls.small;
	} catch (err) {
		console.error(err);
	}
}

const sample = (array) => {
	return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 10; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const title = `${sample(descriptors)} ${sample(places)}`;
		const camp = await new Campground({
			image: await seedImg(),
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: title,
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum, recusandae nisi, porro eos ab ipsam adipisci quam voluptatum expedita provident placeat commodi aspernatur. Quas unde corrupti eius repellendus quaerat dicta.",
			price: price,
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
