export default {
	state: {
		unread: false
	},
	mutations: {
		showUnread(state) {
			state.unread = true;
		},
		clearUnread(state) {
			state.unread = false;
		}
	}
}