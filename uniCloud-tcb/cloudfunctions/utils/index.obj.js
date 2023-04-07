const db = uniCloud.database();
const dbCmd = db.command;

module.exports = {
	_before: function() {},

	/**
	 * 自定义增减
	 * @param {Object} col    表
	 * @param {Object} field  字段
	 * @param {Object} id
	 * @param {Object} num    增减值
	 */
	async calc(col, field, id, num) {
		let obj = {};

		obj[field] = dbCmd.inc(num);
		return await db.collection(col).doc(id).update(obj);
	}
}