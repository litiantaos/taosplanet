import messages from "./modules/messages.js";

import {
	createStore
} from "vuex";

const store = createStore({
	modules: {
		messages
	}
});

export default store;