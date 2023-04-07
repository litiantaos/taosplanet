'use strict';

const UniSecCheck = require("uni-sec-check");

exports.main = async (event, context) => {
	const uniSecCheck = new UniSecCheck({
		provider: "mp-weixin",
		requestId: context.requestId
	});

	const textSecCheckRes = await uniSecCheck.textSecCheck({
		content: event.content,
		openid: event.openid,
		scene: event.scene,
		version: event.version
	});

	if (textSecCheckRes.errCode === uniSecCheck.ErrorCode.RISK_CONTENT) {
		return {
			errCode: textSecCheckRes.errCode,
			errMsg: "文字存在风险",
			result: textSecCheckRes.result
		}
	} else if (textSecCheckRes.errCode) {
		console.log(`其他原因导致此文件未完成自动审核（错误码：${textSecCheckRes.errCode}，错误信息：${textSecCheckRes.errMsg}），需要人工审核`)
	}
	return {
		errCode: 0,
		errMsg: ''
	}
};