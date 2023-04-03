type VNode = {
    tagName: string;
    props: Record<string, string | number>;
    children: (VNode | string)[];
}

export type Node = Text | HTMLElement & {
    v: VNode
}

export const createVNode = (tagName: string, props: Record<string, string | number> = {}, children: (VNode | string)[] = []) => {
    return {
        tagName,
        props,
        children,
    };
};

const TEXT_NODE_TYPE = 3;

const recycleNode = (node: Node) => {
    if (node.nodeType === TEXT_NODE_TYPE) {
        return node.nodeValue;
    }

    const tagName = node.nodeName.toLowerCase();

    const children = [].map.call(node.childNodes, recycleNode);

    return createVNode(tagName, {}, children);
};

export const createDOMNode = (vNode: VNode | string) => {
    if (typeof vNode === "string") {
        return document.createTextNode(vNode);
    }
    const { tagName, props, children } = vNode;

    const node = document.createElement(tagName);

    patchProps(node as Node, {}, props);

    children.forEach((child) => {
        node.appendChild(createDOMNode(child));
    });

    return node;
};

export const patchNode = (node: Node, vNode: VNode | string, nextVNode: VNode | string) => {
    if (nextVNode === undefined) {
        node.remove();
        return;
    }

    if (typeof vNode === "string" || typeof nextVNode === "string") {
        if (vNode !== nextVNode) {
            const nextNode = createDOMNode(nextVNode);
            node.replaceWith(nextNode);
            return nextNode;
        }

        return node;
    }

    if (vNode.tagName !== nextVNode.tagName) {
        const nextNode = createDOMNode(nextVNode);
        node.replaceWith(nextNode);
        return nextNode;
    }

    patchProps(node, vNode.props, nextVNode.props);

    patchChildren(node, vNode.children, nextVNode.children);

    return node;
};

const patchProp = (node: Node, key: string, value: string | number, nextValue: string | number) => {
    if (nextValue == null || nextValue === false) {
        (node as HTMLElement).removeAttribute(key);
        return;
    }

    (node as HTMLElement).setAttribute(key, String(nextValue));
};

const patchProps = (node: Node, props: Record<string, string | number>, nextProps: Record<string, string | number>) => {
    const mergedProps = { ...props, ...nextProps };

    Object.keys(mergedProps).forEach(key => {
        if (props[key] !== nextProps[key]) {
            patchProp(node, key, props[key], nextProps[key]);
        }
    });
};

const patchChildren = (parent: Node, vChildren: (VNode | string)[], nextVChildren: (VNode | string)[]) => {
    parent.childNodes.forEach((childNode, i) => {
        patchNode(childNode as Node, vChildren[i], nextVChildren[i]);
    });

    nextVChildren.slice(vChildren.length).forEach(vChild => {
        parent.appendChild(createDOMNode(vChild));
    });
};

export const patch = (nextVNode: VNode, node: Node) => {
    // @ts-ignore
    const vNode = node.v || recycleNode(node)

    node = patchNode(node, vNode, nextVNode);

    // @ts-ignore
    node.v = nextVNode;

    return node;
};

export const mount = (node: Node, target: HTMLElement) => {
    target.replaceWith(node);
    return node;
};