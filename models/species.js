const mongoose = require('mongoose');

const speciesSchema = new mongoose.Schema({
    id: Number,
    common_name: String,
    scientific_name: [String],
    other_name: [String],
    cycle: String,
    watering: String,
    sunlight: [String],
    default_image: {
        license: Number,
        license_name: String,
        license_url: String,
        original_url: String,
        regular_url: String,
        medium_url: String,
        small_url: String,
        thumbnail: String
    }
});

module.exports = mongoose.model('Species-1', speciesSchema);
