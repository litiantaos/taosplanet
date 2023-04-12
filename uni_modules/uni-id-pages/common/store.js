import pagesJson from "@/pages.json";

const uniIdCo = uniCloud.importObject("uni-id-co", {
	customUI: true
});
const db = uniCloud.database();
const usersTable = db.collection("uni-id-users");

let hostUserInfo = uni.getStorageSync('uni-id-pages-userInfo') || {};

const data = {
	userInfo: hostUserInfo,
	hasLogin: Object.keys(hostUserInfo).length != 0
}

export const mutations = {
	async updateUserInfo(data = false) {
		if (data) {
			usersTable.where(`_id == $env.uid`).update(data).then(e => {
				if (e.result.updated) {
					console.log("success", data);
					this.setUserInfo(data);
				} else {
					console.log("no change");
				}
			});
		} else {
			try {
				let res = await usersTable.where("'_id' == $cloudEnv_uid")
					.field(
						"avatar_file, nickname, intro, gender, birth_date, hometown, region, emotion_id, emotion_name, status_id, status_name, city"
					)
					.get();

				this.setUserInfo({
					...res.result.data[0]
				});
			} catch (e) {
				this.setUserInfo({}, {
					cover: true
				});
				console.error(e.message, e.errCode);
			}
		}
	},
	async setUserInfo(data, {
		cover
	} = {
		cover: false
	}) {
		let userInfo = cover ? data : Object.assign(store.userInfo, data);

		store.userInfo = Object.assign({}, userInfo);
		store.hasLogin = Object.keys(store.userInfo).length != 0;

		uni.setStorageSync("uni-id-pages-userInfo", store.userInfo);

		return data;
	},
	async logout() {
		if (uniCloud.getCurrentUserInfo().tokenExpired > Date.now()) {
			try {
				await uniIdCo.logout();
			} catch (e) {
				console.error(e);
			}
		}
		uni.removeStorageSync("uni_id_token");
		uni.setStorageSync("uni_id_token_expired", 0);
		uni.redirectTo({
			url: `/${pagesJson.uniIdRouter?.loginPage}`,
		});
		uni.$emit("uni-id-pages-logout");
		this.setUserInfo({}, {
			cover: true
		});
	},
	loginBack(e = {}) {
		const {
			uniIdRedirectUrl = ""
		} = e
		let delta = 0;
		let pages = getCurrentPages();

		pages.forEach((page, index) => {
			if (pages[pages.length - index - 1].route.split('/')[3] == 'login') {
				delta++
			}
		});

		if (uniIdRedirectUrl) {
			return uni.redirectTo({
				url: uniIdRedirectUrl,
				fail: (err1) => {
					uni.switchTab({
						url: uniIdRedirectUrl,
						fail: (err2) => {
							console.log(err1, err2);
						}
					})
				}
			})
		}

		if (delta) {
			const page = pagesJson.pages[0];

			return uni.reLaunch({
				url: `/${page.path}`
			});
		}

		uni.navigateBack({
			delta
		});
	},
	loginSuccess(e = {}) {
		const {
			autoBack = true, uniIdRedirectUrl = '', passwordConfirmed
		} = e;

		this.updateUserInfo();

		uni.$emit("uni-id-pages-login-success");

		if (autoBack) {
			this.loginBack({
				uniIdRedirectUrl
			});
		}
	}

}

// #ifdef VUE2
import Vue from 'vue'
// 通过Vue.observable创建一个可响应的对象
export const store = Vue.observable(data)
// #endif

// #ifdef VUE3
import {
	reactive
} from 'vue'
// 通过Vue.observable创建一个可响应的对象
export const store = reactive(data)
// #endif