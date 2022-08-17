const express = require('express');
const userRouter = new express.Router();
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')


//get all users --- by admin--lateron
userRouter.get('/users', auth, async(req, res) => {
	try{
		const users = await User.find({})
		if(!users){
			return res.send('No user accounts found!')
		}

		res.send({status: "User accounts", users})
	}catch(e){
		res.status(500).send(e.message)
	}
})

//create user
userRouter.post('/profile', async(req, res) => {
	try{
		const user = new User(req.body)
		await user.save()
		const token = await user.generateAuthToken()
		res.status(201).send({user, token})
	}catch(e){
		if(e.code === 11000){
			return res.status(400).send('Email is already registered!')
		}
		res.status(400).send(e.message)
	}
})

//login user
userRouter.post('/login', async(req, res) => {
	try{
		const user = await User.findByCredentials(req.body.email, req.body.password)
		if(!user){
			throw new Error()
		}
		const token = await user.generateAuthToken()
		res.send({user, token})
	}catch(e){
		res.status(401).send(e.message)
	}
})

//update user account
userRouter.patch('/profile', auth, async(req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['username', 'email', 'password']
	const isValid = updates.every((update) => {
		return allowedUpdates.includes(update)
	})

	if(!isValid){
		throw new Error('Invalid update!')
	}
	try{
		updates.forEach((update) => {
			return req.user[update] = req.body[update]
		})

		res.send(req.user)
		
	}catch(e){
		res.status(400).send(e.message)
	}
})

//delete all users
userRouter.delete('/users', auth , async(req, res) => {
	try{
		await User.remove()
		
		res.send('Deleted all users!')
	}catch(e){
		res.status(500).send(e.message)
	}
})

//delete user account
userRouter.delete('/profile', auth, async(req, res) => {
	try{
		await req.user.remove()
		res.send({status: 'User account deleted!', user: req.user})
	}catch(e){
		res.status(500).send(e.message)
	}
})

//update avi

const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter (req, file, cb){
		if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
			return cb(new Error('Please, upload an image...'))
		}
		cb(undefined, true)
	}
})

userRouter.post('/profile/avi', auth, upload.single('avatar'), async(req, res) => {
	const buffer = await sharp(req.file.buffer).resize({width: 200, height: 200}).png().toBuffer()

	req.user.avatar = buffer
	res.set('content-type', 'image/png')
	res.send(req.user.avatar)
}, (error, req, res, next) => {
	res.status(400).send({error: error.message})
})

//get avi
userRouter.get('/profile/avi', auth, async(req, res) => {
	try{
		res.set('content-type', 'image/png')
		res.send(req.user.avatar)
	}catch(e){
		res.status(500).send(e.message)
	}
})

userRouter.delete('/profile/avi', auth, async(req, res) => {
	try{ 
		req.user.avatar = undefined
	    await req.user.save()
		res.send('Avatar deleted')
	}catch(e){
		res.status(500).send(e.message)
	}
})

module.exports = userRouter;
