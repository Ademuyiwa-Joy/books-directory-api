const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Book = require('./book')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		required: true,
		lowercase: true,
		unique: true,
		validate (value) {
			if(!validator.isEmail(value)){
				throw new Erro('Invalid email')
			}
		}
	},
	password: {
		type: String,
		trim: true,
		minlength: 6,
		required: true,
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps: true
})

userSchema.virtual('myBooks', {
	ref: "Book",
	localField: "_id",
	foreignField: "owner"
})

userSchema.methods.toJSON = function() {
	const user = this
	const userObject = user.toObject()

	delete userObject.password,
	delete userObject.tokens
	return userObject
}

userSchema.methods.generateAuthToken = async function(){
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

	user.tokens = user.tokens.concat({token})
	await user.save()
	return token
}

userSchema.statics.findByCredentials = async(email, password) => {
	const user = await User.findOne({email})
	if(!user){
		throw new Error('Invalid email or password!')
	}
	const isMatch = await bcrypt.compare(password, user.password)
	if(!isMatch){
		throw new Error('Invalid email or password!')
	}

	return user
}

userSchema.pre('save', async function(next) {
	const user = this;
	if(user.isModified('password')){
		return user.password = await bcrypt.hash(user.password, 8)
	}
	next()
	return user
})

userSchema.pre('remove', async function(next) {
	const user = this;
	await Book.deleteMany({owner: user._id})

	next()
})

const User = mongoose.model('User', userSchema)
module.exports = User;