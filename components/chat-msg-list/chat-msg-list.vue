<template>
	<nav-bar>
		<avatar-group borderColor="#f5f5f5"></avatar-group>
	</nav-bar>
	<safe-area></safe-area>

	<view>
		<chat-msg-item></chat-msg-item>
	</view>

</template>

<script>
	export default {
		name: "chat-msg-list",
		props: {
			isSelf: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>

</style>