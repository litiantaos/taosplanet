export default {
	state: {
		messages: []
	},
	mutations: {
		saveTempMsgs(state, data) {
			// console.log("tempMsgs", data);
			state.messages.push(data);
		},
		clearTempMsgs(state) {
			state.messages = [];
		}
	}
}