import {patchNode, mount, createVNode, createDOMNode, patch, Node} from "./vdom";

type State = {
    count: number
}

interface Store {
    state: State;
    OnStateChanged: () => void;
    setState: (nextState: State) => void;
}

const createVApp = (state: Store) => {
    const { count } = state.state;

    return createVNode("div", { class: "container", "data-count": count }, [
        createVNode("h1", {}, ["Hello, Virtual DOM"]),
        createVNode("div", {}, [`Count: ${count}`]),
        "Text node without tags",
        createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 }),

    ]);
};

const store = {
    state: { count: 0 },
    onStateChanged: () => {},
    setState(nextState: State) {
        this.state = nextState;
        this.onStateChanged();
    }
};
let vApp = createVApp(store as Store);
let app = patch(vApp, document.getElementById("app") as Node);

store.onStateChanged = () => {
    app = patch(createVApp(store as Store), app);
}

setInterval(() => {
    store.setState({ count: store.state.count + 1 });
}, 1000);