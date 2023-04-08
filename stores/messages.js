import {
	defineStore
} from "pinia";

export const msgsStore = defineStore("message", {
	state: () => {
		return {
			messages: []
		}
	},
	actions: {
		saveTempMsgs(data) {
			// console.log("tempMsgs", data);
			this.messages.push(data);
			// uni.setStorageSync("messages", this.messages);
		},
		clearTempMsgs() {
			this.messages = [];
		}
	}
})