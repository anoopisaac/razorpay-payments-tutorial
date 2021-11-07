const app = require('express')()
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const cors = require('cors')
const bodyParser = require('body-parser')
const { response } = require('express')

app.use(cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: 'rzp_test_QOU28hSloMpNbK',
	key_secret: 'R3cnP0JcNL7MaPgJenV6hEtE'
})

app.get('/logo.svg', (req, res) => {
	res.sendFile(path.join(__dirname, 'logo.svg'))
})

app.post('/verification', (req, res) => {

	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
	const resp = await createOrder();
	res.json(resp);
})

exports.handler = async (event) => {
	return "hellooo";
	const resp = await createOrder();
	return generateResponse(resp);
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
	} catch (error) {
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

// const verify = (event) => {
// 	// do a validation
// 	const secret = '12345678'
// 	console.log(event.body)
// 	const crypto = require('crypto')
// 	const shasum = crypto.createHmac('sha256', secret)
// 	shasum.update(JSON.stringify(event.body))
// 	const digest = shasum.digest('hex')

// 	console.log(digest, event.headers['x-razorpay-signature'])

// 	if (digest === event.headers['x-razorpay-signature']) {
// 		console.log('request is legit')
// 		return true;
// 	} else {
// 		// pass it
// 		return false;
// 	}
// }


// app.listen(1337, () => {
// 	console.log('Listening on 1337')
// })
