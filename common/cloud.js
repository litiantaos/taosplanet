import {
	store as uniIdStore
} from "@/uni_modules/uni-id-pages/common/store.js";

import store from "@/store/index.js";

const db = uniCloud.database();
const dbCmd = db.command;

const utils = uniCloud.importObject("utils", {
	customUI: true
});

export function getTempFileURL(fileIds) {
	return new Promise((resolve, reject) => {
		uniCloud.getTempFileURL({
			fileList: fileIds,
			success: res => {
				let arr = res.fileList.map(item => {
					return item.tempFileURL
				});
				resolve(arr);
			},
			fail: err => {
				reject(err);
			}
		})
	})
}

// 统一查询点赞状态
export async function checkLikes(data) {
	if (uniIdStore.hasLogin) {
		let arr = [];

		data.forEach(item => {
			arr.push(item._id);
		});

		let res = await db.collection("db-posts-likes").where({
			post_id: dbCmd.in(arr),
			user_id: uniCloud.getCurrentUserInfo().uid
		}).get();

		res.result.data.forEach(item => {
			let index = data.findIndex(find => {
				return item.post_id == find._id;
			});

			data[index].isLike = true;
		});

		return data;
	} else {
		return data;
	}
}

// 统一查询评论点赞状态
export async function checkCommentsLikes(data) {
	let arr = [];

	data.forEach(item => {
		arr.push(item._id);
	});

	let res = await db.collection("db-posts-comments-likes").where({
		comment_id: dbCmd.in(arr),
		user_id: uniCloud.getCurrentUserInfo().uid
	}).get();

	res.result.data.forEach(item => {
		let index = data.findIndex(find => {
			return item.comment_id == find._id;
		});

		data[index].isLike = true;
	});

	return data;
}

// 安全检测
export function checkContent(content) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: "content-sec-check",
			data: {
				content: content,
				scene: 3
			},
			success: res => {
				let code = 0;

				if (res.result.errCode) {
					code = 1;
					console.log(res.result.errMsg);
				}
				if (res.result.errCode == 0) {
					code = 0;
					console.log("check pass");
				}

				resolve(code);
			},
			fail: err => {
				reject(err);
				console.log(err);
			}
		});
	})
}

export function checkMedia(url) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: "media-sec-check",
			data: {
				image: url,
				mediaType: "image",
				scene: 3
			},
			success: res => {
				let code = 0;

				if (res.result.errCode) {
					code = 1;
					console.log(res.result.errMsg);
				}
				if (res.result.errCode == 0) {
					code = 0;
					console.log("check pass");
				}

				resolve(code);
			},
			fail: err => {
				reject(err);
				console.log(err);
			}
		});
	})
}

export function listenMessages() {
	if (!uniIdStore.hasLogin) return;

	db.collection("db-messages").where(`user_id == $cloudEnv_uid && is_read == false`).count().then(res => {
		let count = res.result.total;
		if (count > 0) {
			store.commit("showUnread");
		}
	});

	uni.onPushMessage(res => {
		// console.log("onPush", res);
		if (res.data.payload.type != "chat-group") {
			store.commit("showUnread");
		}
	});
}

export async function uploadFile(e) {
	let promise = e.tempPaths.map(async (item, index) => {
		return await uniCloud.uploadFile({
			filePath: item,
			cloudPath: e.path + e.user_id + "_" + Date.now() + "_" +
				index + "." + item.split(".").pop().toLowerCase()
		});
	});

	let promiseAll = await Promise.all(promise);

	let fileIdList = promiseAll.map(item => {
		return item.fileID;
	});

	return fileIdList;
}

export async function replaceImgSrc(html, func, isTmp, path) {
	const imgReg = /<img[^>]*>/gi;
	const tmpImgReg = /<img [^>]*src="http:\/\/tmp\/[^"]*"[^>]*>/gi;

	let imgRegex = isTmp ? tmpImgReg : imgReg;

	const imgTags = html.match(imgRegex);
	const srcRegex = /src="([^"]+)"/;

	// console.log("imgTags", imgTags);

	let nHtml = html;

	let result = {};

	if (imgTags != null) {
		const srcs = imgTags.map(tag => {
			const match = srcRegex.exec(tag);
			return match[1];
		});

		// console.log("srcs", srcs);

		let nSrcs;

		if (func == "uploadFile") {
			nSrcs = await uploadFile({
				tempPaths: srcs,
				path: path
			});
		} else if (func == "getTempFileURL") {
			nSrcs = await getTempFileURL(srcs);
		}

		const srcMap = {};
		srcs.forEach((src, index) => {
			srcMap[nSrcs[index]] = src;
		});

		nSrcs.forEach((nSrc, i) => {
			nHtml = nHtml.replace(srcs[i], nSrc);
		});

		result.nHtml = nHtml;
		result.nSrcs = nSrcs;
		result.srcMap = srcMap;
	} else {
		result.nHtml = nHtml;
	}

	return result;
}