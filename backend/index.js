const app = require('express')()
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const cors = require('cors')
const bodyParser = require('body-parser')
const { response } = require('express')

const razorpay = new Razorpay({
	key_id: 'rzp_test_QOU28hSloMpNbK',
	key_secret: 'R3cnP0JcNL7MaPgJenV6hEtE'
})

exports.handler = async(event) => {
	try {
		console.log("hello em")

		const path = event['path'];
		let response = "method not allowed";
		if (path === "/razorpay/createorder") {
			console.log("here in creatorder")
			response = await createOrder();
		}
		if (path === "/razorpay/validate") {
			console.log("here in validate")
			let body = JSON.parse(event.body)
			if(body===undefined){
				throw new Error("request is not valid");
			}
			const paymentResp=body;
			// return generateResponse({res:paymentResp.razorpay_order_id})
			
			response = { "signatureIsValid": false };
			let paymentString = paymentResp.razorpay_order_id + "|" + paymentResp.razorpay_payment_id;
			var crypto = require("crypto");
			var expectedSignature = crypto.createHmac('sha256', 'R3cnP0JcNL7MaPgJenV6hEtE')
				.update(paymentString.toString())
				.digest('hex');
			// console.log("sig received ", paymentResp.razorpay_signature);
			// console.log("sig generated ", expectedSignature);
			if (expectedSignature === paymentResp.razorpay_signature) {
				response = { "signatureIsValid": true,received:paymentResp.razorpay_signature,exp: expectedSignature}
			}
		}
		if(path==='/razorpay/capture'){
			console.log("here in capture")
			capture(event);
		}
		console.log("hello check", response)
		return generateResponse(response);
	}
	catch (err) {
		console.log(err, "werewrewrew");
		return generateResponse(err.message)
		// throw new Error("failed");
	}
}

async function createOrder() {
	const payment_capture = 1
	const amount = 499
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		const orderResp = {
			id: response.id,
			currency: response.currency,
			amount: response.amount
		}
		return orderResp;
	}
	catch (error) {
		console.log(error)
	}
}

const generateResponse = (message) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify(message),
		headers: {
			"Access-Control-Allow-Origin": "*"
		},
	};
	return response;
}

const reached = (req) => {
	return req.body;
}

const capture = (event) => {
	// do a validation
	const secret = '12345678'
	console.log("catpure body",event.body)
	const crypto = require('crypto')
	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(event.body))
	const digest = shasum.digest('hex')

	console.log("in catpure>>>",digest, event.headers['x-razorpay-signature'])
	
	if (digest === event.headers['x-razorpay-signature']) {
		console.log('request is legit')
		return true;
	}
	else {
		// pass it
		return false;
	}
}


// app.listen(1337, () => {
// 	console.log('Listening on 1337')
// })
