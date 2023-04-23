import message from "./modules/message.js";

import {
	createStore
} from "vuex";

const store = createStore({
	modules: {
		message
	}
});

export default store;