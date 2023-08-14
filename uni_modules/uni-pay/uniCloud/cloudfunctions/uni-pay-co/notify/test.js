'use strict';

const payCrypto = require('../libs/crypto.js'); // 获取加密服务

module.exports = async (obj) => {
	let user_order_success = true;
	let {
		data = {}
	} = obj;
	let {
		order_no,
		out_trade_no,
		total_fee,
		status
	} = data; // uni-pay-orders

	console.log("pay", status);

	// const db = uniCloud.database();
	// const _ = db.command;

	// let orderRes = await db.collection("db-project-investment").where({
	// 	order_no
	// }).get();
	// let orderInfo = orderRes.data[0];
	// let res = await db.collection("uni-id-users").doc(orderInfo.user_id).update({
	// 	balance: _.inc(total_fee)
	// });
	// if (res && res.updated) {
	// 	user_order_success = true;
	// } else {
	// 	user_order_success = false;
	// }

	return user_order_success;
};