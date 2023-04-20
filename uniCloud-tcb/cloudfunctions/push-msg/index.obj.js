const db = uniCloud.database();

module.exports = {
	_before: function() {
		this.pushMsg = async (param) => {
			const appId = "__UNI__E179C2C";

			let res = await uniCloud.getPushManager({
				appId: appId
			}).sendMessage(param);

			return res;
		}
	},

	async sendMsgToGroup({
		param,
		userIds = []
	}) {
		const limit = 500;

		if (!userIds.length) {
			let res = await db.collection("db-chat-group-join").aggregate()
				.sort({
					_id: 1
				})
				.project({
					_id: 0,
					user_id: 1
				})
				.end()

			userIds = res.data.map(item => {
				return item.user_id;
			});
		}

		let nextUserIds = userIds.slice(limit);

		userIds = userIds.slice(0, limit);
		param.user_id = userIds;

		await this.pushMsg(param);

		if (nextUserIds.length) {
			uniCloud.importObject("push-msg").sendMsgToGroup({
				param,
				userIds: nextUserIds
			});
		}
	},

	async sendMsg(param) {
		return await this.pushMsg(param);
	}
}