const express = require('express');
const bookRouter = new express.Router();
const Book = require('../models/book');
const auth = require('../middleware/auth')

bookRouter.route('/')
.get(auth, async(req, res) => {
	try{
		const sort = {}
		if(req.query.sortBy){
			const parts = req.query.sortBy.split(':')
			sort[parts[0]] = parts[1] === "desc" ? -1 : 1
		}

		await req.user.populate({
			path:'myBooks',
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		})
		
		res.send(req.user.myBooks)
	}catch(e){
		res.status(500).send(e.message)
	}
})
.post(auth, async(req, res) => {
	 
	try{
		const book = new Book({...req.body, owner: req.user._id})
		await book.save()
		res.status(201).send({status: 'Book added successfully!', book})
	}catch(e){
		res.status(400).send('Invalid request')
	}
})
.put()
.delete(auth, async(req, res) => {
	try{
		await Book.deleteMany({owner: req.user._id})

		res.send('All books deleted!')
	}catch(e){
		res.status(500).send(e.message)
	}
})

bookRouter.route('/:bookId')
.get(auth, async(req, res) => {
	try{
		const book  = await Book.findOne({isbn: req.params.bookId, owner: req.user._id}) 
		if(!book){
			throw new Error('Book not found, please try another search...')
		}

		res.send(book)
	}catch(e){
		res.status(404).send(e.message)
	}
})
.post()
.patch(auth, async(req, res) => {
		const updates = Object.keys(req.body)
		const allowedUpdates = ['author','title','isbn']

		const isValid = updates.every((update) => {
			return allowedUpdates.includes(update)
		})

		if(!isValid){
			return res.status(400).send('Invalid updates')
		}

	try{
		const book = await Book.findOne({isbn: req.params.bookId, owner: req.user._id})
		if(!book){
			throw new Error('Book not found, try another search...')
		}
		
		updates.forEach((update) => {
			return book[update] = req.body[update]
		})
		await book.save()
		res.send({status: 'Update successful', book})
	}catch(e){
		res.status(400).send(e.message)
	}
})
.delete(auth, async(req, res) => {
	try{
		const book = await Book.findOneAndDelete({isbn: req.params.bookId, owner: req.user._id})
		
		if(!book){
			throw new Error('Book not found...')
		}
		const {title, isbn, author} = book
		res.send({status:'Book removed from directory!', title, author})
	}catch(e){
		res.status(500).send(e.message)
	}
})

module.exports = bookRouter;