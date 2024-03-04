'use strict';

const UniSecCheck = require("uni-sec-check");

exports.main = async (event, context) => {
	const uniSecCheck = new UniSecCheck({
		provider: "mp-weixin",
		requestId: context.requestId
	})

	let mediaSecCheckRes;
	if (event.mediaType == "image") {
		mediaSecCheckRes = await uniSecCheck.imgSecCheck({
			image: event.image,
			openid: event.openid,
			scene: event.scene,
			version: event.version
		});
	} else {
		mediaSecCheckRes = await uniSecCheck.avSecCheck({
			mediaUrl: event.mediaUrl,
			openid: event.openid,
			scene: event.scene,
			version: event.version
		});
	}

	if (mediaSecCheckRes.errCode == uniSecCheck.ErrorCode.RISK_CONTENT) {
		event.image && await uniCloud.deleteFile({
			fileList: [event.image]
		})
		return {
			errCode: mediaSecCheckRes.errCode,
			errMsg: "文件存在风险，已自动删除",
			result: mediaSecCheckRes.result
		}
	} else if (mediaSecCheckRes.errCode) {
		console.log(`其他原因导致此文件未完成自动审核（错误码：${mediaSecCheckRes.errCode}，错误信息：${mediaSecCheckRes.errMsg}），需要人工审核`)
	}
	return {
		errCode: 0,
		errMsg: '',
		traceId: mediaSecCheckRes.traceId
	}
};