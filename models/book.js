const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	isbn: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	author: {
		type: String,
		required: true,
		trim: true
	},
	owner:{
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
}, {
	timestamps: true
})

const Book = mongoose.model('Book', bookSchema)
module.exports = Book;