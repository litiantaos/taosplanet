import {
	store
} from "@/uni_modules/uni-id-pages/common/store.js";

const db = uniCloud.database();
const dbCmd = db.command;

export function getTempFileURL(ids) {
	return new Promise((resolve, reject) => {
		uniCloud.getTempFileURL({
			fileList: ids,
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
	if (!store.hasLogin) return;

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