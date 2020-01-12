
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run$1);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run$1).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Cow.svelte generated by Svelte v3.16.7 */

    const file = "src/Cow.svelte";

    function create_fragment(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*name*/ ctx[0]} says ${/*statement*/ ctx[1]}`;
    			add_location(div, file, 5, 0, 62);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self) {
    	let name = "Cow";
    	let statement = "\"Moo.\"";

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("statement" in $$props) $$invalidate(1, statement = $$props.statement);
    	};

    	return [name, statement];
    }

    class Cow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cow",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Drop1.svelte generated by Svelte v3.16.7 */

    const file$1 = "src/Drop1.svelte";

    function create_fragment$1(ctx) {
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let div2;
    	let div0;
    	let t5;
    	let div1;
    	let button0;
    	let t7;
    	let button1;
    	let t9;
    	let button2;
    	let t11;
    	let a0;
    	let t13;
    	let a1;
    	let dispose;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "Alice";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Jane";
    			t3 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Dropdown";
    			t5 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "A Simple Monad";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "A Messaging Monad";
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "A Promises Monad";
    			t11 = space();
    			a0 = element("a");
    			a0.textContent = "Link 2";
    			t13 = space();
    			a1 = element("a");
    			a1.textContent = "Link 3";
    			attr_dev(span0, "id", "rain");
    			add_location(span0, file$1, 45, 0, 801);
    			attr_dev(span1, "id", "snow");
    			add_location(span1, file$1, 46, 0, 833);
    			attr_dev(div0, "class", "dropbtn svelte-1kuci0q");
    			add_location(div0, file$1, 48, 2, 889);
    			add_location(button0, file$1, 50, 4, 962);
    			add_location(button1, file$1, 51, 4, 1018);
    			add_location(button2, file$1, 52, 4, 1083);
    			attr_dev(a0, "href", "#rain");
    			attr_dev(a0, "class", "svelte-1kuci0q");
    			add_location(a0, file$1, 53, 4, 1147);
    			attr_dev(a1, "href", "#snow  ");
    			attr_dev(a1, "class", "svelte-1kuci0q");
    			add_location(a1, file$1, 54, 4, 1178);
    			attr_dev(div1, "class", "dropdown-content svelte-1kuci0q");
    			add_location(div1, file$1, 49, 2, 927);
    			attr_dev(div2, "class", "dropdown svelte-1kuci0q");
    			add_location(div2, file$1, 47, 0, 864);

    			dispose = [
    				listen_dev(button0, "click", monad, false, false, false),
    				listen_dev(button1, "click", /*click_handler*/ ctx[1], false, false, false),
    				listen_dev(button2, "click", /*click_handler_1*/ ctx[2], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t7);
    			append_dev(div1, button1);
    			append_dev(div1, t9);
    			append_dev(div1, button2);
    			append_dev(div1, t11);
    			append_dev(div1, a0);
    			append_dev(div1, t13);
    			append_dev(div1, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let j = 40;
    	const click_handler = () => $$invalidate(0, j = 2);
    	const click_handler_1 = () => $$invalidate(0, j = 3);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    	};

    	return [j, click_handler, click_handler_1];
    }

    class Drop1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drop1",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Drop2.svelte generated by Svelte v3.16.7 */

    const file$2 = "src/Drop2.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Dropdown";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = ">";
    			attr_dev(div0, "class", "dropbtn svelte-1kuci0q");
    			add_location(div0, file$2, 43, 2, 795);
    			attr_dev(div1, "class", "dropdown-content svelte-1kuci0q");
    			add_location(div1, file$2, 44, 2, 833);
    			attr_dev(div2, "class", "dropdown svelte-1kuci0q");
    			add_location(div2, file$2, 42, 0, 770);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Drop2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drop2",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Drop3.svelte generated by Svelte v3.16.7 */

    const file$3 = "src/Drop3.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Dropdown";
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "dropbtn svelte-16jwv47");
    			add_location(div0, file$3, 40, 2, 759);
    			attr_dev(div1, "class", "dropdown-content svelte-16jwv47");
    			add_location(div1, file$3, 41, 2, 797);
    			attr_dev(div2, "class", "dropdown svelte-16jwv47");
    			add_location(div2, file$3, 39, 0, 734);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Drop3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drop3",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Drop4.svelte generated by Svelte v3.16.7 */

    const file$4 = "src/Drop4.svelte";

    function create_fragment$4(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let div2;
    	let div0;
    	let t7;
    	let div1;
    	let a0;
    	let t9;
    	let a1;
    	let t11;
    	let a2;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "a";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "b";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "c";
    			t5 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Dropdown";
    			t7 = space();
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Link 1";
    			t9 = space();
    			a1 = element("a");
    			a1.textContent = "Link 2";
    			t11 = space();
    			a2 = element("a");
    			a2.textContent = "Link 3";
    			attr_dev(p0, "id", "a");
    			add_location(p0, file$4, 39, 0, 734);
    			attr_dev(p1, "id", "b");
    			add_location(p1, file$4, 40, 0, 752);
    			attr_dev(p2, "id", "c");
    			add_location(p2, file$4, 41, 0, 770);
    			attr_dev(div0, "class", "dropbtn svelte-16jwv47");
    			add_location(div0, file$4, 45, 2, 815);
    			attr_dev(a0, "href", "#a");
    			attr_dev(a0, "class", "svelte-16jwv47");
    			add_location(a0, file$4, 47, 4, 888);
    			attr_dev(a1, "href", "#b");
    			attr_dev(a1, "class", "svelte-16jwv47");
    			add_location(a1, file$4, 48, 4, 916);
    			attr_dev(a2, "href", "#c");
    			attr_dev(a2, "class", "svelte-16jwv47");
    			add_location(a2, file$4, 49, 4, 944);
    			attr_dev(div1, "class", "dropdown-content svelte-16jwv47");
    			add_location(div1, file$4, 46, 2, 853);
    			attr_dev(div2, "class", "dropdown svelte-16jwv47");
    			add_location(div2, file$4, 44, 0, 790);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t9);
    			append_dev(div1, a1);
    			append_dev(div1, t11);
    			append_dev(div1, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Drop4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drop4",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Drop5.svelte generated by Svelte v3.16.7 */

    const file$5 = "src/Drop5.svelte";

    function create_fragment$5(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let div2;
    	let div0;
    	let t7;
    	let div1;
    	let a0;
    	let t9;
    	let a1;
    	let t11;
    	let a2;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "a";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "b";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "c";
    			t5 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Dropdown";
    			t7 = space();
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Link 1";
    			t9 = space();
    			a1 = element("a");
    			a1.textContent = "Link 2";
    			t11 = space();
    			a2 = element("a");
    			a2.textContent = "Link 3";
    			attr_dev(p0, "id", "a");
    			add_location(p0, file$5, 40, 0, 735);
    			attr_dev(p1, "id", "b");
    			add_location(p1, file$5, 41, 0, 753);
    			attr_dev(p2, "id", "c");
    			add_location(p2, file$5, 42, 0, 771);
    			attr_dev(div0, "class", "dropbtn svelte-16jwv47");
    			add_location(div0, file$5, 46, 2, 816);
    			attr_dev(a0, "href", "#a");
    			attr_dev(a0, "class", "svelte-16jwv47");
    			add_location(a0, file$5, 48, 4, 889);
    			attr_dev(a1, "href", "#b");
    			attr_dev(a1, "class", "svelte-16jwv47");
    			add_location(a1, file$5, 49, 4, 917);
    			attr_dev(a2, "href", "#c");
    			attr_dev(a2, "class", "svelte-16jwv47");
    			add_location(a2, file$5, 50, 4, 945);
    			attr_dev(div1, "class", "dropdown-content svelte-16jwv47");
    			add_location(div1, file$5, 47, 2, 854);
    			attr_dev(div2, "class", "dropdown svelte-16jwv47");
    			add_location(div2, file$5, 45, 0, 791);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t9);
    			append_dev(div1, a1);
    			append_dev(div1, t11);
    			append_dev(div1, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Drop5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drop5",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Monad.svelte generated by Svelte v3.16.7 */
    const file$6 = "src/Monad.svelte";

    // (103:1) {#if visible}
    function create_if_block(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A SIMPLE LITTLE MONAD";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$6, 103, 2, 2252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(103:1) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let span2;
    	let t7;
    	let p0;
    	let t9;
    	let p1;
    	let t11;
    	let p2;
    	let t13;
    	let pre0;
    	let t15;
    	let p3;
    	let t17;
    	let pre1;
    	let t19;
    	let p4;
    	let t21;
    	let t22;
    	let t23;
    	let input;
    	let input_updating = false;
    	let t24;
    	let p5;
    	let t25;
    	let t26;
    	let t27;
    	let t28_value = /*bonads*/ ctx[5](/*num*/ ctx[0]) + "";
    	let t28;
    	let t29;
    	let span3;
    	let t31;
    	let pre2;
    	let t33;
    	let p6;
    	let t35;
    	let p7;
    	let t37;
    	let p8;
    	let t39;
    	let p9;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[1] && create_if_block(ctx);

    	function input_input_handler() {
    		input_updating = true;
    		/*input_input_handler*/ ctx[12].call(input);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "The word \"monad\" has been around for centuries. Gottfried Leibniz published";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Monadology";
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "in 1714. The precursor to the familiar symbol of yin-yang, taijitu (太極圖), has a version with two dots added, has been given the august designation: \"The Great Monad\". A single note in music theory is called a monad. All of this is too tangential to warrant references. I Googled around a little to get it and you can too if the word \"monad\" interests you.";
    			t7 = space();
    			p0 = element("p");
    			p0.textContent = "Monads in the Haskell Programming Language were inspired by Category Theory monads. In order to be Category Theory monads, function must exist in a mathematically rigorous \"category\". Haskells objects and functions are not the objects and morphisms of Category Theory. Making a category out of most of Haskell's functions and types is an amusing pasttime for some people, but I doubt that it has any practical value.";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "So it should be no surprise that my JavaScript monads are not Category Theory monads. They do obey a JavaScript version of the Haskell monad laws, which are not a requirement in Haskell but are indicative of utility and robustness objects (including functions) don't constitute a category. But functions that hold values and compose with multiple functions that operate on their values behave like Category Theory monads enough to justify calling them \"monads\".";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Here's the definitions of three functions:";
    			t13 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*monadDisplay*/ ctx[2]}`;
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "And here is an anonymous monad followed by three functions and \"stop\". :";
    			t17 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Monad(6)(sum(7))(prod(4))(v=>v-10)(stop) // 42";
    			t19 = space();
    			p4 = element("p");
    			p4.textContent = "Anonymous monads never interfere with other monads. The demonstration below illustrates this by running seven anonymous monads in rapid succession. The number you enter is \"num\" in";
    			t21 = space();
    			t22 = text(/*bonadsD*/ ctx[3]);
    			t23 = space();
    			input = element("input");
    			t24 = space();
    			p5 = element("p");
    			t25 = text("num is ");
    			t26 = text(/*num*/ ctx[0]);
    			t27 = text(" so bonads(num) returns ");
    			t28 = text(t28_value);
    			t29 = space();
    			span3 = element("span");
    			span3.textContent = "Named monads retain their values, even after they encounter \"stop\" and return the value of x held in the Monad closure. The following examples illustrate this:";
    			t31 = space();
    			pre2 = element("pre");
    			pre2.textContent = `${/*axe*/ ctx[4]}`;
    			t33 = space();
    			p6 = element("p");
    			p6.textContent = "As expected, mon returns which is the \"foo()\" returned by by calling Monad(3):";
    			t35 = space();
    			p7 = element("p");
    			p7.textContent = "mon is still the foo() returned by Monad(). Because mon points to x in the context of its creation by Monad(), x will not be garbage collected. Care should be taken not to polute memory with useless x's.";
    			t37 = space();
    			p8 = element("p");
    			p8.textContent = "One reason Svelte is so fast and efficient is that it mutates variables and the attributes and methods of objects. Each module in a discrete global space.  When modules are small, applications are easy to organize and mutations don't have unforseen effects in other parts of applications. Svelte shook off the bonds of current conventional \"wisdom\" advocating immutability, virtual DOM, and assigning types to functions.";
    			t39 = space();
    			p9 = element("p");
    			p9.textContent = "The next entry in the monad series defines a variation of Monad that maintains an array of primitive data, function return values, and Promise resolution values. Functions have access to everything in the array when they execute.";
    			add_location(br, file$6, 107, 1, 2418);
    			attr_dev(span0, "class", "tao svelte-1dr4x6t");
    			add_location(span0, file$6, 108, 1, 2424);
    			set_style(span1, "font-style", "italic");
    			add_location(span1, file$6, 109, 0, 2527);
    			add_location(span2, file$6, 110, 0, 2582);
    			add_location(p0, file$6, 111, 0, 2952);
    			add_location(p1, file$6, 112, 0, 3378);
    			add_location(p2, file$6, 113, 0, 3848);
    			add_location(pre0, file$6, 114, 0, 3900);
    			add_location(p3, file$6, 115, 0, 3926);
    			add_location(pre1, file$6, 116, 0, 4008);
    			add_location(p4, file$6, 117, 0, 4068);
    			attr_dev(input, "id", "one");
    			attr_dev(input, "type", "number");
    			add_location(input, file$6, 119, 0, 4268);
    			add_location(p5, file$6, 120, 0, 4341);
    			attr_dev(span3, "class", "tao svelte-1dr4x6t");
    			add_location(span3, file$6, 122, 0, 4401);
    			add_location(pre2, file$6, 123, 0, 4588);
    			add_location(p6, file$6, 127, 0, 4608);
    			add_location(p7, file$6, 129, 0, 4696);
    			add_location(p8, file$6, 131, 0, 4909);
    			add_location(p9, file$6, 132, 0, 5339);

    			dispose = [
    				listen_dev(input, "input", /*bonads*/ ctx[5], false, false, false),
    				listen_dev(input, "input", input_input_handler)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, pre0, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*num*/ ctx[0]);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t25);
    			append_dev(p5, t26);
    			append_dev(p5, t27);
    			append_dev(p5, t28);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, p8, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, p9, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!input_updating && dirty & /*num*/ 1) {
    				set_input_value(input, /*num*/ ctx[0]);
    			}

    			input_updating = false;
    			if (!current || dirty & /*num*/ 1) set_data_dev(t26, /*num*/ ctx[0]);
    			if ((!current || dirty & /*num*/ 1) && t28_value !== (t28_value = /*bonads*/ ctx[5](/*num*/ ctx[0]) + "")) set_data_dev(t28, t28_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(p9);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function Monad(z) {
    	var x = z;

    	var foo = function foo(func) {
    		if (func.name === "stop") return x; else {
    			x = func(x);
    			return foo;
    		}
    	};

    	return foo;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let visible = true;

    	let monadDisplay = `function Monad (z) {
    var x = z;
    var foo = function foo (func) {
        var stop = 'stop';
        if (func.name === 'stop') return x
        else {
            x = func(x);
            return foo;
        }
    };
    return foo;
}

const prod = a => b => a*b;
const sum = a => b => a+b;`;

    	let bonadsD = `function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)(stop)]}`;

    	let axe = `
let mon = Monad(3);
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop);
console.log("a is", a)  // a is 900`;

    	let tree = `
mon(x => x/100)
console.log("mon(stop) now is",mon(stop))  // mon(stop) now is 9 `;

    	let fred = `
let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon(stop));
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)
ar.push(a);
ar.push(mon(x => x/100);
ar.push(mon2(mon(stop)(x=>x*100)))
console.log("ar.map(v=>v('stop')) is", ar.map(v=>v('stop')))  // [3, 900, 9] `;

    	const prod = a => b => a * b;
    	const sum = a => b => a + b;
    	let num = 6;

    	let bonads = function bonads(num) {
    		return [
    			Monad(num)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 1)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 2)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 3)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 2)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 1)(sum(7))(prod(4))(v => v - 10)(stop),
    			Monad(num - 0)(sum(7))(prod(4))(v => v - 10)(stop)
    		];
    	};

    	let mona = bonads(num);
    	console.log(mona);

    	function numF(e) {
    		$$invalidate(0, num = e.target.value);
    		console.log("e.target.value is", e.target.value);
    		return e.target.value;
    	}

    	console.log("num is", num);

    	function input_input_handler() {
    		num = to_number(this.value);
    		$$invalidate(0, num);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("monadDisplay" in $$props) $$invalidate(2, monadDisplay = $$props.monadDisplay);
    		if ("bonadsD" in $$props) $$invalidate(3, bonadsD = $$props.bonadsD);
    		if ("axe" in $$props) $$invalidate(4, axe = $$props.axe);
    		if ("tree" in $$props) tree = $$props.tree;
    		if ("fred" in $$props) fred = $$props.fred;
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("bonads" in $$props) $$invalidate(5, bonads = $$props.bonads);
    		if ("mona" in $$props) mona = $$props.mona;
    	};

    	return [
    		num,
    		visible,
    		monadDisplay,
    		bonadsD,
    		axe,
    		bonads,
    		tree,
    		fred,
    		prod,
    		sum,
    		mona,
    		numF,
    		input_input_handler
    	];
    }

    class Monad_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Monad_1",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Monad2.svelte generated by Svelte v3.16.7 */
    const file$7 = "src/Monad2.svelte";

    // (308:0) {#if j === 2}
    function create_if_block$1(ctx) {
    	let div_1;
    	let div_1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			div_1.textContent = "MAINTAINING STATE IN \"O\"";
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "32px");
    			add_location(div_1, file$7, 308, 0, 5865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_1_transition) div_1_transition = create_bidirectional_transition(div_1, fade, {}, true);
    				div_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_1_transition) div_1_transition = create_bidirectional_transition(div_1, fade, {}, false);
    			div_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			if (detaching && div_1_transition) div_1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(308:0) {#if j === 2}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let p0;
    	let t3;
    	let br1;
    	let t4;
    	let button;
    	let br2;
    	let t5;
    	let span0;
    	let t7;
    	let pre0;
    	let t9;
    	let br3;
    	let br4;
    	let br5;
    	let t10;
    	let div0;
    	let t12;
    	let div1;
    	let t13_value = /*O*/ ctx[0].c0 + "";
    	let t13;
    	let t14;
    	let t15_value = /*O*/ ctx[0].c1 + "";
    	let t15;
    	let t16;
    	let t17_value = /*O*/ ctx[0].c2 + "";
    	let t17;
    	let t18;
    	let br6;
    	let t19;
    	let span1;
    	let t21;
    	let span2;
    	let t22;
    	let t23_value = /*O*/ ctx[0].d0.join(", ") + "";
    	let t23;
    	let t24;
    	let t25_value = /*O*/ ctx[0].d1.join(", ") + "";
    	let t25;
    	let t26;
    	let t27_value = /*O*/ ctx[0].d2.join(", ") + "";
    	let t27;
    	let t28;
    	let t29;
    	let br7;
    	let t30;
    	let br8;
    	let t31;
    	let div2;
    	let t32;
    	let t33_value = /*O*/ ctx[0].d0 + "";
    	let t33;
    	let t34;
    	let t35_value = /*O*/ ctx[0].c0 + "";
    	let t35;
    	let t36;
    	let span3;
    	let t37_value = (/*O*/ ctx[0].d0.reduce(func) == /*O*/ ctx[0].c0) + "";
    	let t37;
    	let t38;
    	let br9;
    	let t39;
    	let t40_value = /*O*/ ctx[0].d1 + "";
    	let t40;
    	let t41;
    	let t42_value = /*O*/ ctx[0].c1 + "";
    	let t42;
    	let t43;
    	let span4;
    	let t44_value = (/*O*/ ctx[0].d1.reduce(func_1) == /*O*/ ctx[0].c1) + "";
    	let t44;
    	let t45;
    	let br10;
    	let t46;
    	let t47_value = /*O*/ ctx[0].d2 + "";
    	let t47;
    	let t48;
    	let t49_value = /*O*/ ctx[0].c2 + "";
    	let t49;
    	let t50;
    	let span5;
    	let t51_value = (/*O*/ ctx[0].d2.reduce(func_2) == /*O*/ ctx[0].c2) + "";
    	let t51;
    	let t52;
    	let br11;
    	let t53;
    	let p1;
    	let t55;
    	let pre1;
    	let t57;
    	let p2;
    	let pre2;
    	let t60;
    	let p3;
    	let pre3;
    	let t63;
    	let p4;
    	let t65;
    	let br12;
    	let t66;
    	let span6;
    	let t68;
    	let a;
    	let current;
    	let dispose;
    	let if_block = /*j*/ ctx[1] === 2 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Clicking the button below sends three requests to the Haskell WebSockets server asking for quasi-random integers. As the numbers come in from the server, they are placed in the object named \"O\" with keys prefixed by \"c\", and then forwarded to a web worker. The worker returns arrays containing the prime factors of the numbers it recieves. These are placed in \"O\" with keys prefixed by \"d\".";
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			button = element("button");
    			br2 = element("br");
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = "Click -->";
    			t7 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*candle*/ ctx[6]}`;
    			t9 = space();
    			br3 = element("br");
    			br4 = element("br");
    			br5 = element("br");
    			t10 = space();
    			div0 = element("div");
    			div0.textContent = "The WebSockets server sent these numbers (now at O.c0, O.c1, and O.c2):";
    			t12 = space();
    			div1 = element("div");
    			t13 = text(t13_value);
    			t14 = text(", ");
    			t15 = text(t15_value);
    			t16 = text(", and ");
    			t17 = text(t17_value);
    			t18 = space();
    			br6 = element("br");
    			t19 = space();
    			span1 = element("span");
    			span1.textContent = "The web worker sent these arrays of prime factors (now at O.d0, O.d1, and O.d2):";
    			t21 = space();
    			span2 = element("span");
    			t22 = text("[");
    			t23 = text(t23_value);
    			t24 = text("], [");
    			t25 = text(t25_value);
    			t26 = text("], and [");
    			t27 = text(t27_value);
    			t28 = text("]");
    			t29 = space();
    			br7 = element("br");
    			t30 = space();
    			br8 = element("br");
    			t31 = space();
    			div2 = element("div");
    			t32 = text("[");
    			t33 = text(t33_value);
    			t34 = text("].reduce((a,b) => a*b) == ");
    			t35 = text(t35_value);
    			t36 = text(": ");
    			span3 = element("span");
    			t37 = text(t37_value);
    			t38 = space();
    			br9 = element("br");
    			t39 = text("\n[");
    			t40 = text(t40_value);
    			t41 = text("].reduce((a,b) => a*b) == ");
    			t42 = text(t42_value);
    			t43 = text(": ");
    			span4 = element("span");
    			t44 = text(t44_value);
    			t45 = space();
    			br10 = element("br");
    			t46 = text("\n[");
    			t47 = text(t47_value);
    			t48 = text("].reduce((a,b) => a*b) == ");
    			t49 = text(t49_value);
    			t50 = text(": ");
    			span5 = element("span");
    			t51 = text(t51_value);
    			t52 = space();
    			br11 = element("br");
    			t53 = space();
    			p1 = element("p");
    			p1.textContent = "In this demonstration, each monad's array of computed values is preserved as an attribute of an object named O. Here's the definition of \"Monad\" used in this module:";
    			t55 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${/*mon*/ ctx[3]}`;
    			t57 = space();
    			p2 = element("p");
    			p2.textContent = "Messages are sent to the Haskell WebSockets server requesting pseudo-random numbers between 1 and the integer specified at the end of the request. On the server, randomR from the System.Random library produces a number which is sent to the browser with prefix \"BE#$42\". Messages from the server are parsed in socket.onmessage. If the prefix is \"BE#$42\", the payload (a number) is sent to worker_OO, which sends back the number's prime decomposition.\n";
    			pre2 = element("pre");
    			pre2.textContent = `${/*onmessServer*/ ctx[4]}`;
    			t60 = space();
    			p3 = element("p");
    			p3.textContent = "Messages from the web worker are processed in worker_OO.onmessage\n";
    			pre3 = element("pre");
    			pre3.textContent = `${/*onmessWorker*/ ctx[5]}`;
    			t63 = space();
    			p4 = element("p");
    			p4.textContent = "When M === 2 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand().";
    			t65 = space();
    			br12 = element("br");
    			t66 = space();
    			span6 = element("span");
    			span6.textContent = "The code for this Svelte application is at";
    			t68 = space();
    			a = element("a");
    			a.textContent = "GitHub repository";
    			add_location(br0, file$7, 313, 0, 6031);
    			add_location(p0, file$7, 314, 0, 6036);
    			add_location(br1, file$7, 315, 1, 6437);
    			add_location(br2, file$7, 317, 0, 6472);
    			set_style(span0, "font-size", "27px");
    			set_style(span0, "color", "#FFABAB");
    			add_location(span0, file$7, 318, 0, 6477);
    			add_location(pre0, file$7, 319, 0, 6540);
    			attr_dev(button, "class", "svelte-14lwxew");
    			add_location(button, file$7, 316, 0, 6442);
    			add_location(br3, file$7, 322, 0, 6571);
    			add_location(br4, file$7, 322, 4, 6575);
    			add_location(br5, file$7, 322, 8, 6579);
    			set_style(div0, "color", "#BBBBFF");
    			set_style(div0, "font-size", "20px");
    			add_location(div0, file$7, 325, 0, 6586);
    			set_style(div1, "color", "#FFFFCD");
    			set_style(div1, "font-size", "20px");
    			add_location(div1, file$7, 326, 0, 6714);
    			add_location(br6, file$7, 329, 0, 6800);
    			set_style(span1, "color", "#CDCDFF");
    			set_style(span1, "font-size", "20px");
    			add_location(span1, file$7, 330, 0, 6805);
    			set_style(span2, "color", "#FFFFCD");
    			set_style(span2, "font-size", "20px");
    			add_location(span2, file$7, 331, 0, 6944);
    			add_location(br7, file$7, 333, 0, 7067);
    			add_location(br8, file$7, 334, 0, 7072);
    			set_style(span3, "font-size", "24px");
    			set_style(span3, "color", "#FF0B0B");
    			add_location(span3, file$7, 338, 41, 7169);
    			add_location(br9, file$7, 339, 0, 7259);
    			set_style(span4, "font-size", "24px");
    			set_style(span4, "color", "#FF0B0B");
    			add_location(span4, file$7, 340, 41, 7305);
    			add_location(br10, file$7, 341, 0, 7395);
    			set_style(span5, "font-size", "24px");
    			set_style(span5, "color", "#FF0B0B");
    			add_location(span5, file$7, 342, 41, 7441);
    			add_location(br11, file$7, 343, 0, 7531);
    			set_style(div2, "color", "#FFFFCD");
    			set_style(div2, "font-size", "20px");
    			add_location(div2, file$7, 337, 0, 7079);
    			add_location(p1, file$7, 348, 0, 7546);
    			add_location(pre1, file$7, 350, 0, 7721);
    			add_location(p2, file$7, 352, 0, 7739);
    			add_location(pre2, file$7, 353, 0, 8193);
    			add_location(p3, file$7, 354, 0, 8219);
    			add_location(pre3, file$7, 355, 0, 8289);
    			add_location(p4, file$7, 356, 0, 8315);
    			add_location(br12, file$7, 357, 0, 8469);
    			add_location(span6, file$7, 358, 0, 8474);
    			attr_dev(a, "href", "https://github.com/dschalk/blog/");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$7, 359, 0, 8532);
    			dispose = listen_dev(button, "click", /*factors*/ ctx[2], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, br2);
    			append_dev(button, t5);
    			append_dev(button, span0);
    			append_dev(button, t7);
    			append_dev(button, pre0);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t13);
    			append_dev(div1, t14);
    			append_dev(div1, t15);
    			append_dev(div1, t16);
    			append_dev(div1, t17);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, t22);
    			append_dev(span2, t23);
    			append_dev(span2, t24);
    			append_dev(span2, t25);
    			append_dev(span2, t26);
    			append_dev(span2, t27);
    			append_dev(span2, t28);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t32);
    			append_dev(div2, t33);
    			append_dev(div2, t34);
    			append_dev(div2, t35);
    			append_dev(div2, t36);
    			append_dev(div2, span3);
    			append_dev(span3, t37);
    			append_dev(div2, t38);
    			append_dev(div2, br9);
    			append_dev(div2, t39);
    			append_dev(div2, t40);
    			append_dev(div2, t41);
    			append_dev(div2, t42);
    			append_dev(div2, t43);
    			append_dev(div2, span4);
    			append_dev(span4, t44);
    			append_dev(div2, t45);
    			append_dev(div2, br10);
    			append_dev(div2, t46);
    			append_dev(div2, t47);
    			append_dev(div2, t48);
    			append_dev(div2, t49);
    			append_dev(div2, t50);
    			append_dev(div2, span5);
    			append_dev(span5, t51);
    			append_dev(div2, t52);
    			append_dev(div2, br11);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t55, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t57, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t60, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, pre3, anchor);
    			insert_dev(target, t63, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, t66, anchor);
    			insert_dev(target, span6, anchor);
    			insert_dev(target, t68, anchor);
    			insert_dev(target, a, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*O*/ 1) && t13_value !== (t13_value = /*O*/ ctx[0].c0 + "")) set_data_dev(t13, t13_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t15_value !== (t15_value = /*O*/ ctx[0].c1 + "")) set_data_dev(t15, t15_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t17_value !== (t17_value = /*O*/ ctx[0].c2 + "")) set_data_dev(t17, t17_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t23_value !== (t23_value = /*O*/ ctx[0].d0.join(", ") + "")) set_data_dev(t23, t23_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t25_value !== (t25_value = /*O*/ ctx[0].d1.join(", ") + "")) set_data_dev(t25, t25_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t27_value !== (t27_value = /*O*/ ctx[0].d2.join(", ") + "")) set_data_dev(t27, t27_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t33_value !== (t33_value = /*O*/ ctx[0].d0 + "")) set_data_dev(t33, t33_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t35_value !== (t35_value = /*O*/ ctx[0].c0 + "")) set_data_dev(t35, t35_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t37_value !== (t37_value = (/*O*/ ctx[0].d0.reduce(func) == /*O*/ ctx[0].c0) + "")) set_data_dev(t37, t37_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t40_value !== (t40_value = /*O*/ ctx[0].d1 + "")) set_data_dev(t40, t40_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t42_value !== (t42_value = /*O*/ ctx[0].c1 + "")) set_data_dev(t42, t42_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t44_value !== (t44_value = (/*O*/ ctx[0].d1.reduce(func_1) == /*O*/ ctx[0].c1) + "")) set_data_dev(t44, t44_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t47_value !== (t47_value = /*O*/ ctx[0].d2 + "")) set_data_dev(t47, t47_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t49_value !== (t49_value = /*O*/ ctx[0].c2 + "")) set_data_dev(t49, t49_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t51_value !== (t51_value = (/*O*/ ctx[0].d2.reduce(func_2) == /*O*/ ctx[0].c2) + "")) set_data_dev(t51, t51_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t55);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t57);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t60);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(pre3);
    			if (detaching) detach_dev(t63);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t66);
    			if (detaching) detach_dev(span6);
    			if (detaching) detach_dev(t68);
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wait$1(ms) {
    	return new Promise(r => setTimeout(r, ms));
    }

    const func = (a, b) => a * b;
    const func_1 = (a, b) => a * b;
    const func_2 = (a, b) => a * b;

    function instance$3($$self, $$props, $$invalidate) {
    	let visible = true;
    	let j = 2;

    	var pauseP = t => async x => {
    		await wait$1(t * 1000);
    		return x;
    	};

    	var divPinverse = a => async b => {
    		await wait$1(600);
    		return a / b;
    	};

    	var divP = a => async b => {
    		await wait$1(600);
    		return b / a;
    	};

    	var doubleP = async a => {
    		await wait$1(1000);
    		return a + a;
    	};

    	var toInt = a => parseInt(a, 10);

    	var addP_toInt = x => async y => {
    		await wait$1(1000);
    		return toInt(x) + toInt(y);
    	};

    	var addP = x => async y => {
    		await wait$1(1000);
    		return x + y;
    	};

    	var multP = x => async y => {
    		await wait$1(1200);
    		return x * y;
    	};

    	var powP = x => async y => {
    		await wait$1(1200);
    		return y ** x;
    	};

    	var cube = x => x ** 3;
    	var pow = p => x => x ** p;
    	var square = x => x * x;
    	var add = x => y => x + y;
    	var sqrt = x => x ** (1 / 2);
    	var root = r => x => x(1 / r);
    	var div = d => x => x / d;

    	var f = function f() {
    		
    	};

    	var f_ = function f_() {
    		
    	};

    	var sto = "sto";
    	var halt = "halt";
    	var O = new Object();
    	O.d0 = [2, 3, 4];
    	O.d1 = [2, 3, 4];
    	O.d2 = [2, 3, 4];
    	var M = -1;
    	var Q = -1;
    	var lock = false;
    	O.generic = ["Nobody"];

    	const Monad = function Monad(AR = [], name = "generic", f_ = mFunc) {
    		let ar = AR.slice();
    		$$invalidate(0, O[name] = ar, O);
    		let run;
    		let x = O[name].pop();

    		return run = (function run(x) {
    			if (x != undefined && x === x && x !== false && x.name !== "f_" && x.name !== "halt") {
    				$$invalidate(0, O[name] = O[name].concat(x), O);
    			}

    			
    			return f_;
    		})(x);
    	};

    	var mFunc = function mFunc_(func) {
    		if (func === "halt" || func === "S") return O[name]; else if (typeof func !== "function") p = func(x); else if (x instanceof Promise) p = x.then(v => func(v));
    		return run(p);
    	};

    	var socket = new WebSocket("ws://167.71.168.53:3055");

    	socket.onclose = function (event) {
    		console.log("<><><> ALERT - socket is closing. <><><> ", event);
    	};

    	socket.onmessage = function (e) {
    		var v = e.data.split(",");

    		if (v[0] === "BE#$42") {
    			Q = Q + 1;
    			Monad([v[3]], "c" + Q);
    			if (Q === 2) Q = -1;
    			worker_OO.postMessage([v[3]]);
    		}
    	};

    	login();

    	function login() {
    		console.log("00000000000000000000000000000000 Entering login", socket.readyState);

    		setTimeout(
    			function () {
    				if (socket.readyState === 1) {
    					console.log("readyState is", socket.readyState);
    					var v = Math.random().toString().substring(5);
    					var v2 = v.toString().substring(2);
    					var combo = v + "<o>" + v2;
    					socket.send("CC#$42" + combo);
    					socket.send("BE#$42,solo,name,10000");
    					socket.send("BE#$42,solo,name,100000");
    					socket.send("BE#$42,solo,name,1000");
    				} else {
    					login();
    				}
    			},
    			200
    		);
    	}

    	

    	var groupDelete = function groupDelete(ob, x) {
    		for (var z in ob) if (z.startsWith("x")) delete ob[z];
    	};

    	var clearOb = function clearOb(ob) {
    		for (var x in ob) delete ob[x];
    	};

    	const factors = function factors() {
    		socket.send("BE#$42,solo,name,10000");
    		socket.send("BE#$42,solo,name,100000");
    		socket.send("BE#$42,solo,name,1000");
    	};

    	var worker_OO = new Worker("worker_OO.js");

    	worker_OO.onmessage = e => {
    		M = M + 1;
    		Monad([e.data], "d" + M);

    		if (M === 2) {
    			M = -1;
    		}
    	};

    	var mon = `const Monad = function Monad ( AR = [], name = "generic" )  {
var f_, p, run;
var ar = AR.slice();
var name = name;
O[name] = ar;
let x = O[name].pop();
return run = (function run (x) {
if (x != undefined && x === x  && x !== false
  && x.name !== "f_" && x.name !== "halt" ) {
    O[name] = O[name].concat(x)
  };
  function f_ (func) {
    if (func === 'halt' || func === 'S') return O[name];
    else if (typeof func !== "function") p = func;
    else if (x instanceof Promise) p = x.then(v => func(v));
    else p = func(x);
    return run(p);
  };
  return f_;
})(x);
} `;

    	var statement = `    Monad(["value"], "key")(x => "This is the " + x)(x => x + ".")(halt)
O.key   // ["value", "This is the value", "This is the value."]`;

    	var fa = `    function factors () {
if (lock === false && j === 2) {
  lock = true;
  clearOb(O);
  N = -1;
  M = -1;
  Q = -1;
  groupDelete(O, "c");
  groupDelete(O, "d");
  fact();
}
else if (j !== 2) {return}
else {
  setTimeout(()=> {
  factors()
},1000)
}
}`;

    	var onmessServer = `ar v = e.data.split(',');
if (v[0] === "BE#$42") {
Q = Q + 1;
Monad([v[3]], "c"+Q);
worker_OO.postMessage([v[3]])
}
}  `;

    	var onmessWorker = `worker_OO.onmessage = e => {
  M = M + 1;
  Monad([e.data], "d"+M);
  if (M === 2) {
    M = -1;
  }
}`;

    	let candle = ` socket.send(\"BE#$42,solo,name,10000\")    
socket.send('\BE#$42,solo,name,100000\")    
socket.send(\"BE#$42,solo,name,1000\")    `;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("j" in $$props) $$invalidate(1, j = $$props.j);
    		if ("pauseP" in $$props) pauseP = $$props.pauseP;
    		if ("divPinverse" in $$props) divPinverse = $$props.divPinverse;
    		if ("divP" in $$props) divP = $$props.divP;
    		if ("doubleP" in $$props) doubleP = $$props.doubleP;
    		if ("toInt" in $$props) toInt = $$props.toInt;
    		if ("addP_toInt" in $$props) addP_toInt = $$props.addP_toInt;
    		if ("addP" in $$props) addP = $$props.addP;
    		if ("multP" in $$props) multP = $$props.multP;
    		if ("powP" in $$props) powP = $$props.powP;
    		if ("cube" in $$props) cube = $$props.cube;
    		if ("pow" in $$props) pow = $$props.pow;
    		if ("square" in $$props) square = $$props.square;
    		if ("add" in $$props) add = $$props.add;
    		if ("sqrt" in $$props) sqrt = $$props.sqrt;
    		if ("root" in $$props) root = $$props.root;
    		if ("div" in $$props) div = $$props.div;
    		if ("f" in $$props) f = $$props.f;
    		if ("f_" in $$props) f_ = $$props.f_;
    		if ("sto" in $$props) sto = $$props.sto;
    		if ("halt" in $$props) halt = $$props.halt;
    		if ("O" in $$props) $$invalidate(0, O = $$props.O);
    		if ("M" in $$props) M = $$props.M;
    		if ("Q" in $$props) Q = $$props.Q;
    		if ("lock" in $$props) lock = $$props.lock;
    		if ("mFunc" in $$props) mFunc = $$props.mFunc;
    		if ("socket" in $$props) socket = $$props.socket;
    		if ("groupDelete" in $$props) groupDelete = $$props.groupDelete;
    		if ("clearOb" in $$props) clearOb = $$props.clearOb;
    		if ("worker_OO" in $$props) worker_OO = $$props.worker_OO;
    		if ("mon" in $$props) $$invalidate(3, mon = $$props.mon);
    		if ("statement" in $$props) statement = $$props.statement;
    		if ("fa" in $$props) fa = $$props.fa;
    		if ("onmessServer" in $$props) $$invalidate(4, onmessServer = $$props.onmessServer);
    		if ("onmessWorker" in $$props) $$invalidate(5, onmessWorker = $$props.onmessWorker);
    		if ("candle" in $$props) $$invalidate(6, candle = $$props.candle);
    	};
    	return [O, j, factors, mon, onmessServer, onmessWorker, candle];
    }

    class Monad2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$7, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Monad2",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Monad3.svelte generated by Svelte v3.16.7 */
    const file$8 = "src/Monad3.svelte";

    // (248:2) {#if j === 3}
    function create_if_block$2(ctx) {
    	let div_1;
    	let div_1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			div_1.textContent = "PROMISES MONAD";
    			add_location(div_1, file$8, 248, 4, 5966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_1_transition) div_1_transition = create_bidirectional_transition(div_1, fade, {}, true);
    				div_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_1_transition) div_1_transition = create_bidirectional_transition(div_1, fade, {}, false);
    			div_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			if (detaching && div_1_transition) div_1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(248:2) {#if j === 3}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let h20;
    	let t1;
    	let t2_value = /*O*/ ctx[0].test + "";
    	let t2;
    	let t3;
    	let h21;
    	let t4;
    	let t5_value = /*O*/ ctx[0].test_2 + "";
    	let t5;
    	let t6;
    	let br0;
    	let t7;
    	let span0;
    	let t9;
    	let br1;
    	let br2;
    	let t10;
    	let button0;
    	let pre0;
    	let t12;
    	let br3;
    	let t13;
    	let p0;
    	let t15;
    	let pre1;
    	let t17;
    	let p1;
    	let t19;
    	let pre2;
    	let t21;
    	let p2;
    	let t23;
    	let pre3;
    	let t25;
    	let br4;
    	let t26;
    	let button1;
    	let pre4;
    	let t28;
    	let br5;
    	let t29;
    	let h22;
    	let t30;
    	let t31_value = /*O*/ ctx[0].test + "";
    	let t31;
    	let t32;
    	let h23;
    	let t33;
    	let t34_value = /*O*/ ctx[0].test_2 + "";
    	let t34;
    	let t35;
    	let br6;
    	let t36;
    	let br7;
    	let t37;
    	let span1;
    	let t39;
    	let span2;
    	let t41;
    	let span3;
    	let current;
    	let dispose;
    	let if_block = /*j*/ ctx[1] === 3 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			h20 = element("h2");
    			t1 = text("O.test is ");
    			t2 = text(t2_value);
    			t3 = space();
    			h21 = element("h2");
    			t4 = text("O.test_2 is ");
    			t5 = text(t5_value);
    			t6 = space();
    			br0 = element("br");
    			t7 = space();
    			span0 = element("span");
    			span0.textContent = "To see branch() and resume() in action, click the verbose butt6n (below). To see the boolean \"lok\" protecting the integrity of the data, click the verbose button (below) several times in rapid succession:";
    			t9 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t10 = space();
    			button0 = element("button");
    			pre0 = element("pre");
    			pre0.textContent = "Monad([2], \"test\")(addP(1))\n(cubeP)(addP(3))(squareP)(divP(100))(() => \nbranch(\"test\", \"test_2\")(sqrtP)(cubeP)(addP(O.test_2[2])\n(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() =>\nresume(\"test\")(multP(4))(addP(6))))";
    			t12 = space();
    			br3 = element("br");
    			t13 = space();
    			p0 = element("p");
    			p0.textContent = "Here's the modified monad constructor:";
    			t15 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${/*mon*/ ctx[2]}`;
    			t17 = space();
    			p1 = element("p");
    			p1.textContent = "After monads encounter \"halt\", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:";
    			t19 = space();
    			pre2 = element("pre");
    			pre2.textContent = `${/*fs*/ ctx[4]}`;
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "This is the statement that produces the observed results when \"START\" is clicked.";
    			t23 = space();
    			pre3 = element("pre");
    			pre3.textContent = `${/*code*/ ctx[5]}`;
    			t25 = space();
    			br4 = element("br");
    			t26 = space();
    			button1 = element("button");
    			pre4 = element("pre");
    			pre4.textContent = "Monad([2], \"test\")(addP(1))\n(cubeP)(addP(3))(squareP)(divP(100))(() => \nbranch(\"test\", \"test_2\")(sqrtP)(cubeP)(addP(O.test_2[2])\n(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() =>\nresume(\"test\")(multP(4))(addP(6))))";
    			t28 = space();
    			br5 = element("br");
    			t29 = space();
    			h22 = element("h2");
    			t30 = text("O.test is ");
    			t31 = text(t31_value);
    			t32 = space();
    			h23 = element("h2");
    			t33 = text("O.test_2 is ");
    			t34 = text(t34_value);
    			t35 = space();
    			br6 = element("br");
    			t36 = space();
    			br7 = element("br");
    			t37 = space();
    			span1 = element("span");
    			span1.textContent = "Notice the statement:";
    			t39 = space();
    			span2 = element("span");
    			span2.textContent = "()=>addP(O.test_2[2])(O.test_2[1])";
    			t41 = space();
    			span3 = element("span");
    			span3.textContent = ". Promises in chains of ES6 Promises can't access previous Promise resolution values. One way to get access to prior resolution values is to encapsulate Promise chains in Monad(). This also makes it convenient to resume or branch from terminated computation chains; and this can be accomplished without naming the chains.";
    			add_location(h20, file$8, 252, 2, 6026);
    			add_location(h21, file$8, 253, 2, 6056);
    			add_location(br0, file$8, 253, 46, 6100);
    			attr_dev(span0, "class", "tao");
    			add_location(span0, file$8, 254, 2, 6107);
    			add_location(br1, file$8, 255, 2, 6338);
    			add_location(br2, file$8, 255, 6, 6342);
    			attr_dev(pre0, "class", "svelte-41wco8");
    			add_location(pre0, file$8, 257, 56, 6404);
    			set_style(button0, "text-align", "left");
    			attr_dev(button0, "class", "svelte-41wco8");
    			add_location(button0, file$8, 257, 2, 6350);
    			add_location(br3, file$8, 263, 2, 6651);
    			add_location(p0, file$8, 264, 2, 6658);
    			attr_dev(pre1, "class", "svelte-41wco8");
    			add_location(pre1, file$8, 265, 2, 6708);
    			add_location(p1, file$8, 266, 2, 6727);
    			attr_dev(pre2, "class", "svelte-41wco8");
    			add_location(pre2, file$8, 267, 2, 6940);
    			add_location(p2, file$8, 268, 2, 6958);
    			attr_dev(pre3, "class", "svelte-41wco8");
    			add_location(pre3, file$8, 269, 2, 7051);
    			add_location(br4, file$8, 269, 46, 7095);
    			attr_dev(pre4, "class", "svelte-41wco8");
    			add_location(pre4, file$8, 270, 56, 7156);
    			set_style(button1, "text-align", "left");
    			attr_dev(button1, "class", "svelte-41wco8");
    			add_location(button1, file$8, 270, 2, 7102);
    			add_location(br5, file$8, 277, 2, 7404);
    			add_location(h22, file$8, 278, 2, 7411);
    			add_location(h23, file$8, 279, 2, 7441);
    			add_location(br6, file$8, 280, 2, 7475);
    			add_location(br7, file$8, 282, 2, 7483);
    			attr_dev(span1, "class", "tao");
    			add_location(span1, file$8, 283, 2, 7490);
    			set_style(span2, "color", "#AAFFAA");
    			add_location(span2, file$8, 284, 2, 7543);
    			add_location(span3, file$8, 285, 2, 7618);

    			dispose = [
    				listen_dev(button0, "click", /*start*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", /*start*/ ctx[3], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t1);
    			append_dev(h20, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t4);
    			append_dev(h21, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, button0, anchor);
    			append_dev(button0, pre0);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, pre3, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, pre4);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, h22, anchor);
    			append_dev(h22, t30);
    			append_dev(h22, t31);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, h23, anchor);
    			append_dev(h23, t33);
    			append_dev(h23, t34);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, span3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*O*/ 1) && t2_value !== (t2_value = /*O*/ ctx[0].test + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t5_value !== (t5_value = /*O*/ ctx[0].test_2 + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t31_value !== (t31_value = /*O*/ ctx[0].test + "")) set_data_dev(t31, t31_value);
    			if ((!current || dirty[0] & /*O*/ 1) && t34_value !== (t34_value = /*O*/ ctx[0].test_2 + "")) set_data_dev(t34, t34_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(pre3);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(span3);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wait$2(ms) {
    	return new Promise(r => setTimeout(r, ms));
    }

    async function squareP(x) {
    	await wait$2(100);
    	return x * x;
    }

    async function cubeP(x) {
    	await wait$2(300);
    	return x * x * x;
    }

    async function sqrtP(x) {
    	await wait$2(900);
    	return x ** (1 / 2);
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let visible = true;
    	let j = 3;

    	var pauseP = t => async x => {
    		await wait$2(t * 1000);
    		return x;
    	};

    	var divPinverse = a => async b => {
    		await wait$2(300);
    		return a / b;
    	};

    	var divP = a => async b => {
    		await wait$2(300);
    		return b / a;
    	};

    	var doubleP = async a => {
    		await wait$2(300);
    		return a + a;
    	};

    	var toInt = a => pareseInt(a, 10);

    	var addP_toInt = x => async y => {
    		await wait$2(300);
    		return toInt(x) + toInt(y);
    	};

    	var addP = x => async y => {
    		await wait$2(900);
    		return x + y;
    	};

    	var multP = x => async y => {
    		await wait$2(300);
    		return x * y;
    	};

    	var powP = x => async y => {
    		await wait$2(300);
    		return y ** x;
    	};

    	var _conveNt_ = a => b => parseFloat(b, a);
    	var toFloat = _conveNt_(10);
    	var cube = x => x ** 3;
    	var pow = p => x => x ** p;
    	var square = x => x * x;
    	var add = x => y => x + y;
    	var sqrt = x => x ** (1 / 2);
    	var root = r => x => x(1 / r);
    	var div = d => x => x / d;

    	var f = function f() {
    		
    	};

    	var f_ = function f_() {
    		
    	};

    	var sto = "sto";
    	var halt = "halt";
    	var O = new Object();
    	var M = -1;
    	var N = -1;
    	var T = -1;
    	var Q = -1;
    	var lock = false;

    	var Monad = function Monad(AR = [], name = "generic") {
    		var p, run;
    		let ar = AR.slice();
    		$$invalidate(0, O[name] = ar, O);
    		let x = O[name].pop();

    		return run = (function run(x) {
    			if (x instanceof Promise) x.then(y => {
    				if (typeof y != "undefined" && y == y && y.name !== "f_") {
    					$$invalidate(0, O[name] = O[name].concat(y), O);
    				}
    			});

    			if (!(x instanceof Promise)) {
    				if (x != undefined && x == x) {
    					$$invalidate(0, O[name] = O[name].concat(x), O);
    				}
    			}

    			function f_(func) {
    				if (func === "halt" || func === "S") return O[name].slice(); else if (typeof func !== "function") p = func; else if (x instanceof Promise) p = x.then(v => func(v)); else p = func(x);
    				return run(p);
    			}

    			
    			return f_;
    		})(x);
    	};

    	var branch = function branch(s, s2) {
    		return Monad(O[s].slice(), s2);
    	};

    	var resume = function resume(s) {
    		return Monad(O[s], s);
    	};

    	Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))(() => branch("test", "test_2")(sqrtP)(cubeP)(() => addP(O.test_2[2])(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() => resume("test")(multP(4))(addP(6))));

    	var mon = `   var Monad = function Monad ( AR = [], name = "generic"  )  {
      var f_, p, run;
      var ar = AR.slice();
      var name = name;
      O[name] = ar;
      let x = O[name].pop();
      return run = (function run (x) {
        if (x instanceof Promise) x.then(y => {
          if (y != undefined && y == y && y.name !== "f_") {
          O[name] = O[name].concat(y)
          }
        })
        if (!(x instanceof Promise)) {
            if (x != undefined && x == x) {
              O[name] = O[name].concat(x)
            }
        }
        function f_ (func) {
          if (func === 'halt' || func === 'S') return O[name].slice();
          else if (typeof func !== "function") p = func;
          else if (x instanceof Promise) p = x.then(v => func(v));
          else p = func(x);
          return run(p);
        };
        return f_;
      })(x);
    }`;

    	var lok = false;

    	var start = function start() {
    		if (!lok) {
    			lok = true;
    			setTimeout(() => lok = false, 3000);
    			$$invalidate(0, O = {});
    			Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))(() => branch("test", "test_2")(sqrtP)(cubeP)(() => addP(O.test_2[2])(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() => resume("test")(multP(4))(addP(6))));
    		} else {
    			setTimeout(() => start(), 300);
    		}
    	};

    	var fs = `   var branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
    var resume = function resume (s) {return Monad(O[s], s)}`;

    	var code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
      (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
      (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
      (() => resume("test")(multP(4))(addP(6))))`;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("j" in $$props) $$invalidate(1, j = $$props.j);
    		if ("pauseP" in $$props) pauseP = $$props.pauseP;
    		if ("divPinverse" in $$props) divPinverse = $$props.divPinverse;
    		if ("divP" in $$props) divP = $$props.divP;
    		if ("doubleP" in $$props) doubleP = $$props.doubleP;
    		if ("toInt" in $$props) toInt = $$props.toInt;
    		if ("addP_toInt" in $$props) addP_toInt = $$props.addP_toInt;
    		if ("addP" in $$props) addP = $$props.addP;
    		if ("multP" in $$props) multP = $$props.multP;
    		if ("powP" in $$props) powP = $$props.powP;
    		if ("_conveNt_" in $$props) _conveNt_ = $$props._conveNt_;
    		if ("toFloat" in $$props) toFloat = $$props.toFloat;
    		if ("cube" in $$props) cube = $$props.cube;
    		if ("pow" in $$props) pow = $$props.pow;
    		if ("square" in $$props) square = $$props.square;
    		if ("add" in $$props) add = $$props.add;
    		if ("sqrt" in $$props) sqrt = $$props.sqrt;
    		if ("root" in $$props) root = $$props.root;
    		if ("div" in $$props) div = $$props.div;
    		if ("f" in $$props) f = $$props.f;
    		if ("f_" in $$props) f_ = $$props.f_;
    		if ("sto" in $$props) sto = $$props.sto;
    		if ("halt" in $$props) halt = $$props.halt;
    		if ("O" in $$props) $$invalidate(0, O = $$props.O);
    		if ("M" in $$props) $$invalidate(30, M = $$props.M);
    		if ("N" in $$props) $$invalidate(31, N = $$props.N);
    		if ("T" in $$props) $$invalidate(32, T = $$props.T);
    		if ("Q" in $$props) $$invalidate(33, Q = $$props.Q);
    		if ("lock" in $$props) $$invalidate(34, lock = $$props.lock);
    		if ("Monad" in $$props) Monad = $$props.Monad;
    		if ("branch" in $$props) branch = $$props.branch;
    		if ("resume" in $$props) resume = $$props.resume;
    		if ("mon" in $$props) $$invalidate(2, mon = $$props.mon);
    		if ("lok" in $$props) lok = $$props.lok;
    		if ("start" in $$props) $$invalidate(3, start = $$props.start);
    		if ("fs" in $$props) $$invalidate(4, fs = $$props.fs);
    		if ("code" in $$props) $$invalidate(5, code = $$props.code);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*O*/ 1) ;
    	};
    	return [O, j, mon, start, fs, code];
    }

    class Monad3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$8, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Monad3",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Haskell.svelte generated by Svelte v3.16.7 */
    const file$9 = "src/Haskell.svelte";

    // (30:0) {#if visible}
    function create_if_block$3(ctx) {
    	let div;
    	let br0;
    	let br1;
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nHASKELL TUTORIAL SUPPLEMENT");
    			add_location(br0, file$9, 31, 1, 721);
    			add_location(br1, file$9, 31, 5, 725);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$9, 30, 1, 594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(30:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t0;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let t8;
    	let span0;
    	let t10;
    	let a0;
    	let t12;
    	let br0;
    	let t13;
    	let pre;
    	let t15;
    	let p4;
    	let t17;
    	let span1;
    	let t19;
    	let a1;
    	let t21;
    	let br1;
    	let t22;
    	let br2;
    	let t23;
    	let span2;
    	let t25;
    	let a2;
    	let t27;
    	let span3;
    	let t29;
    	let a3;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "If you are learning to program in Haskell, the book or blog or YouTube video on which you rely might be telling you that mutations can occur only inside of monads or somewhere away from a program such as the command line or a browser. You might be learning that mutations and side effects can occur only in the lazy IO monad. If so, don't believe it. You are being misled.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Even if you resent being lied to, you might find value in some of the dishonest learning resources. They are trying to teach best practices. Just know know that it is easy to mutate values and types anywhere in a Haskell program. Doing so before you know what your compiler (presumably GHC) will do with your mutations is asking for bugs and crashes.  Here are some unsafe functions with descriptions from their creators and maintainers:";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Unsafe.Coerce";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "The highly unsafe primitive unsafeCoerce converts a value from any type to any other type. If you use this function, avoiding runtime errors will be especially challenging if the old and new types have different internal representations.";
    			t8 = space();
    			span0 = element("span");
    			span0.textContent = "The only function in the Unsafe.Coerce library is unsafeCoerce :: a -> b. You can read more about it at";
    			t10 = space();
    			a0 = element("a");
    			a0.textContent = "Unsafe.Coerce";
    			t12 = space();
    			br0 = element("br");
    			t13 = space();
    			pre = element("pre");
    			pre.textContent = "GHC.IO.Unsafe";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "If the IO computation wrapped in \\'unsafePerformIO\\' performs side effects, then the relative order in which those side effects take place (relative to the main IO trunk, or other calls to \\'unsafePerformIO\\') is indeterminate.  Furthermore, when using \\'unsafePerformIO\\' to cause side-effects, you should take the following precautions to ensure the side effects are performed as many times as you expect them to be.  Note that these precautions are necessary for GHC, but may not be sufficient, and other compilers may require different precautions.";
    			t17 = space();
    			span1 = element("span");
    			span1.textContent = "For more information, go to";
    			t19 = space();
    			a1 = element("a");
    			a1.textContent = "GHC.IO.Unsafe";
    			t21 = space();
    			br1 = element("br");
    			t22 = space();
    			br2 = element("br");
    			t23 = space();
    			span2 = element("span");
    			span2.textContent = "And here\\'s a stub on the Haskell Wiki site that isn\\'t generating much interest:";
    			t25 = space();
    			a2 = element("a");
    			a2.textContent = "More on GHC.IO.Unsafe";
    			t27 = space();
    			span3 = element("span");
    			span3.textContent = "along with a discussion of mutable global variables in Haskell programs:";
    			t29 = space();
    			a3 = element("a");
    			a3.textContent = "Top level mutable state";
    			add_location(p0, file$9, 36, 0, 773);
    			add_location(p1, file$9, 37, 0, 1156);
    			attr_dev(p2, "id", "large");
    			attr_dev(p2, "class", "svelte-hw6ke3");
    			add_location(p2, file$9, 38, 0, 1603);
    			add_location(p3, file$9, 39, 0, 1637);
    			attr_dev(span0, "class", "tao");
    			add_location(span0, file$9, 40, 0, 1884);
    			attr_dev(a0, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$9, 41, 0, 2015);
    			add_location(br0, file$9, 42, 0, 2136);
    			add_location(pre, file$9, 43, 0, 2143);
    			add_location(p4, file$9, 44, 0, 2170);
    			attr_dev(span1, "class", "tao");
    			add_location(span1, file$9, 45, 0, 2732);
    			attr_dev(a1, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$9, 46, 0, 2788);
    			add_location(br1, file$9, 47, 0, 2915);
    			add_location(br2, file$9, 48, 0, 2922);
    			attr_dev(span2, "class", "tao");
    			add_location(span2, file$9, 49, 0, 2929);
    			attr_dev(a2, "href", "https://wiki.haskell.org/Unsafe_functions");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$9, 50, 0, 3038);
    			add_location(span3, file$9, 51, 0, 3139);
    			attr_dev(a3, "href", "https://wiki.haskell.org/Top_level_mutable_state");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$9, 52, 0, 3227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, pre, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, a1, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, a2, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, a3, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(pre);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(a3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self) {
    	let visible = true;

    	let GHC_IO = `module GHC.IO.Unsafe (
    unsafePerformIO, unsafeInterleaveIO,
    unsafeDupablePerformIO, unsafeDupableInterleaveIO,
    noDuplicate,
  ) where

import GHC.Base

This is a \"back door\" into the \'IO\' monad, allowing\'IO\' computation to be performed at any time.  For this to be safe, the \'IO\' computation should be free of side effects and independent of its environment.
 `;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("GHC_IO" in $$props) GHC_IO = $$props.GHC_IO;
    	};

    	return [visible];
    }

    class Haskell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Haskell",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Bugs.svelte generated by Svelte v3.16.7 */
    const file$a = "src/Bugs.svelte";

    // (12:0) {#if visible}
    function create_if_block$4(ctx) {
    	let div;
    	let br0;
    	let br1;
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nCOMPLETE ERADICATION OF BED BUGS");
    			add_location(br0, file$a, 13, 1, 522);
    			add_location(br1, file$a, 13, 5, 526);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$a, 12, 1, 394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let p0;
    	let t2;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let h3;
    	let t8;
    	let ul;
    	let li0;
    	let t10;
    	let li1;
    	let t12;
    	let li2;
    	let t14;
    	let li3;
    	let t16;
    	let li4;
    	let t18;
    	let li5;
    	let t20;
    	let li6;
    	let t22;
    	let li7;
    	let t24;
    	let li8;
    	let t26;
    	let p1;
    	let t28;
    	let p2;
    	let t30;
    	let p3;
    	let t32;
    	let p4;
    	let t34;
    	let p5;
    	let t36;
    	let p6;
    	let t38;
    	let p7;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "It is widely believed that the only reliable way to eraacate a bed bug infestation is to pay thousands of dollars for a thorough heat treatment; one that sends deadly heat through drywall and insullation all the way to the exterior walls. I had a massive bed bug infestation in my rented condominium. My box springs were on the floor, making it easy for bed bugs to climb onto my mattress and feast on me -- and increase in numbers exponentially.";
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "As I researched the life cycle of bed bugs, it became clear that bed bugs are far easier to eradicate than termites or cock roaches:";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "BED BUG INFESTATIONS ARE EXTREMELY FRAGILE!";
    			t6 = space();
    			h3 = element("h3");
    			h3.textContent = "Pertinent Facts About Bed Bugs";
    			t8 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Blood is the only substance that nourishes them.";
    			t10 = space();
    			li1 = element("li");
    			li1.textContent = "After emerging from eggs, bed bug nymphs molt five times.";
    			t12 = space();
    			li2 = element("li");
    			li2.textContent = "Stage one nymphs can't survive beyond two months at room temperature without blood.";
    			t14 = space();
    			li3 = element("li");
    			li3.textContent = "Mature bed bugs don't survive more than six months at room temperature.";
    			t16 = space();
    			li4 = element("li");
    			li4.textContent = "Nymphs must have blood before each of their five moltings.";
    			t18 = space();
    			li5 = element("li");
    			li5.textContent = "Bed bugs will go to the source of exhaled carbon dioxide.";
    			t20 = space();
    			li6 = element("li");
    			li6.textContent = "After sufficient (not much) contact with silica gel, bed bugs dry up and die within three days.";
    			t22 = space();
    			li7 = element("li");
    			li7.textContent = "Silica gel is not systemically toxic, but it is a respiratory tract irritant.";
    			t24 = space();
    			li8 = element("li");
    			li8.textContent = "Cimex® silica gel is very expensive but a five-pound bag from Ebay is pretty cheap.";
    			t26 = space();
    			p1 = element("p");
    			p1.textContent = "I put the box spring on a metal frame with each leg in a bed bug trap. I encased the mattress but not the box spring because I could see through the mesh on the bottom that no bugs had entered.";
    			t28 = space();
    			p2 = element("p");
    			p2.textContent = "A coffee grinder was used to Fluff the silica gel (obtained from Ebay) which was then applied (with a big yellow puffer from Amazon.com) under and around my bed and between the box spring and matterss.";
    			t30 = space();
    			p3 = element("p");
    			p3.textContent = "I knew bed bugs would not lay dormant in furnature, walls, and rugs when they sensed a source of carbon dioxide. I was confident that failing to find a route to my bed around the silica gel they would give up and walk through silica gel in an effort to obtain blood. Their life expectancy was then a couple of days, at most.";
    			t32 = space();
    			p4 = element("p");
    			p4.textContent = "I puffed silica gel into light sockets and anywhere a wall panel could be removed. Soon, the only bed bugs I could find were located in upholstered furniture. I could have killed them, but I decided to throw the invested furnitue away.";
    			t34 = space();
    			p5 = element("p");
    			p5.textContent = "Professional exterminators get unsatisfactory results with silica gel because they won't leave a site that has visible white powder on the floor. They tried applying silica gel in water, which seems absurd since silica gel kills bed bugs by drying them out.";
    			t36 = space();
    			p6 = element("p");
    			p6.textContent = "The little packets of drying agent found in jars and bags of commercial consumer goods usually contain silica gel. USDA regulations allow up to two percent silica gel in food. You should wear a dust mask while dispensing silica gel with a puffer, or else hold your breath and rush into an adjacent room when you need air.";
    			t38 = space();
    			p7 = element("p");
    			p7.textContent = "Professional eradicators don't leave visible residues on floors. That is why they get poor results with silica gel; results comparable to the ones they get with toxic pesticides. Professional exterminators have been known to apply silica gel dissolved in water, which seems absurd in light of the fact that silica gel kills bed bugs by drying them up.";
    			add_location(p0, file$a, 17, 0, 578);
    			add_location(span0, file$a, 18, 0, 1032);
    			set_style(span1, "font-weight", "900");
    			set_style(span1, "color", "#ddff00");
    			add_location(span1, file$a, 19, 0, 1180);
    			add_location(h3, file$a, 20, 0, 1280);
    			add_location(li0, file$a, 22, 0, 1325);
    			add_location(li1, file$a, 23, 0, 1384);
    			add_location(li2, file$a, 24, 0, 1451);
    			add_location(li3, file$a, 25, 0, 1544);
    			add_location(li4, file$a, 26, 0, 1625);
    			add_location(li5, file$a, 27, 0, 1693);
    			add_location(li6, file$a, 28, 0, 1760);
    			add_location(li7, file$a, 29, 0, 1865);
    			add_location(li8, file$a, 30, 0, 1953);
    			add_location(ul, file$a, 21, 0, 1320);
    			add_location(p1, file$a, 32, 0, 2052);
    			add_location(p2, file$a, 33, 0, 2255);
    			add_location(p3, file$a, 34, 0, 2466);
    			add_location(p4, file$a, 35, 0, 2799);
    			add_location(p5, file$a, 38, 0, 3046);
    			add_location(p6, file$a, 39, 0, 3312);
    			add_location(p7, file$a, 40, 0, 3642);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, t10);
    			append_dev(ul, li1);
    			append_dev(ul, t12);
    			append_dev(ul, li2);
    			append_dev(ul, t14);
    			append_dev(ul, li3);
    			append_dev(ul, t16);
    			append_dev(ul, li4);
    			append_dev(ul, t18);
    			append_dev(ul, li5);
    			append_dev(ul, t20);
    			append_dev(ul, li6);
    			append_dev(ul, t22);
    			append_dev(ul, li7);
    			append_dev(ul, t24);
    			append_dev(ul, li8);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, p7, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(p7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self) {
    	let visible = true;
    	var axe = `var mon = Monad(3);var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)console.log("a is", a) // a os 900console.log("mon is", mon); /*ƒ foo(func) {var stop = "stop";if (func.name === "stop") return x;else {x = func(x);return foo;}} */mon(x => x/100)console.log("mon(stop) now is",mon(stop))`;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("axe" in $$props) axe = $$props.axe;
    	};

    	return [visible];
    }

    class Bugs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bugs",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.16.7 */
    const file$b = "src/Matrix.svelte";

    // (147:0) {#if visible}
    function create_if_block$5(ctx) {
    	let div;
    	let br0;
    	let br1;
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\n A LITTLE SVELTE MODULE");
    			add_location(br0, file$b, 148, 1, 4083);
    			add_location(br1, file$b, 148, 5, 4087);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$b, 147, 1, 3955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(147:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let div3;
    	let div1;
    	let button0;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let div0;
    	let button1;
    	let t7;
    	let t8;
    	let br4;
    	let t9;
    	let button2;
    	let t11;
    	let br5;
    	let t12;
    	let br6;
    	let t13;
    	let div2;
    	let button3;
    	let t14_value = /*cache*/ ctx[3][/*j*/ ctx[0]][0] + "";
    	let t14;
    	let t15;
    	let button4;
    	let t16_value = /*cache*/ ctx[3][/*j*/ ctx[0]][1] + "";
    	let t16;
    	let t17;
    	let button5;
    	let t18_value = /*cache*/ ctx[3][/*j*/ ctx[0]][2] + "";
    	let t18;
    	let t19;
    	let br7;
    	let t20;
    	let br8;
    	let t21;
    	let button6;
    	let t22_value = /*cache*/ ctx[3][/*j*/ ctx[0]][3] + "";
    	let t22;
    	let t23;
    	let button7;
    	let t24_value = /*cache*/ ctx[3][/*j*/ ctx[0]][4] + "";
    	let t24;
    	let t25;
    	let button8;
    	let t26_value = /*cache*/ ctx[3][/*j*/ ctx[0]][5] + "";
    	let t26;
    	let t27;
    	let br9;
    	let t28;
    	let br10;
    	let t29;
    	let button9;
    	let t30_value = /*cache*/ ctx[3][/*j*/ ctx[0]][6] + "";
    	let t30;
    	let t31;
    	let button10;
    	let t32_value = /*cache*/ ctx[3][/*j*/ ctx[0]][7] + "";
    	let t32;
    	let t33;
    	let button11;
    	let t34_value = /*cache*/ ctx[3][/*j*/ ctx[0]][8] + "";
    	let t34;
    	let t35;
    	let br11;
    	let t36;
    	let p0;
    	let t38;
    	let t39;
    	let br12;
    	let br13;
    	let t40;
    	let div4;
    	let t42;
    	let div5;
    	let t44;
    	let br14;
    	let t45;
    	let br15;
    	let t46;
    	let p1;
    	let t48;
    	let pre0;
    	let t50;
    	let p2;
    	let t52;
    	let pre1;
    	let t54;
    	let p3;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[2] && create_if_block$5(ctx);
    	const cow = new Cow({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "BACK";
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			br3 = element("br");
    			t6 = space();
    			div0 = element("div");
    			button1 = element("button");
    			t7 = text(/*j*/ ctx[0]);
    			t8 = space();
    			br4 = element("br");
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "FORWARD";
    			t11 = space();
    			br5 = element("br");
    			t12 = space();
    			br6 = element("br");
    			t13 = space();
    			div2 = element("div");
    			button3 = element("button");
    			t14 = text(t14_value);
    			t15 = space();
    			button4 = element("button");
    			t16 = text(t16_value);
    			t17 = space();
    			button5 = element("button");
    			t18 = text(t18_value);
    			t19 = space();
    			br7 = element("br");
    			t20 = space();
    			br8 = element("br");
    			t21 = space();
    			button6 = element("button");
    			t22 = text(t22_value);
    			t23 = space();
    			button7 = element("button");
    			t24 = text(t24_value);
    			t25 = space();
    			button8 = element("button");
    			t26 = text(t26_value);
    			t27 = space();
    			br9 = element("br");
    			t28 = space();
    			br10 = element("br");
    			t29 = space();
    			button9 = element("button");
    			t30 = text(t30_value);
    			t31 = space();
    			button10 = element("button");
    			t32 = text(t32_value);
    			t33 = space();
    			button11 = element("button");
    			t34 = text(t34_value);
    			t35 = space();
    			br11 = element("br");
    			t36 = space();
    			p0 = element("p");
    			p0.textContent = "An example of an imbedded module that I will explain later:";
    			t38 = space();
    			create_component(cow.$$.fragment);
    			t39 = space();
    			br12 = element("br");
    			br13 = element("br");
    			t40 = space();
    			div4 = element("div");
    			div4.textContent = "David Schalk";
    			t42 = space();
    			div5 = element("div");
    			div5.textContent = "October, 2019";
    			t44 = space();
    			br14 = element("br");
    			t45 = space();
    			br15 = element("br");
    			t46 = space();
    			p1 = element("p");
    			p1.textContent = "This is the JavaScript code inside of the script tags except for the definitions of the variables \"code\" and \"html\", which are just the code and html cut and pasted inside of back quotes:";
    			t48 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*code*/ ctx[6]}`;
    			t50 = space();
    			p2 = element("p");
    			p2.textContent = "And here is the HTML code:";
    			t52 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${/*html*/ ctx[7]}`;
    			t54 = space();
    			p3 = element("p");
    			p3.textContent = "I'm new to Svelte and so far I am very impressed.";
    			add_location(br0, file$b, 153, 0, 4131);
    			add_location(br1, file$b, 154, 0, 4136);
    			add_location(button0, file$b, 158, 0, 4277);
    			add_location(br2, file$b, 161, 0, 4317);
    			add_location(br3, file$b, 162, 0, 4322);
    			add_location(button1, file$b, 163, 30, 4357);
    			set_style(div0, "text-indent", "20px");
    			add_location(div0, file$b, 163, 0, 4327);
    			add_location(br4, file$b, 164, 0, 4386);
    			add_location(button2, file$b, 165, 0, 4391);
    			add_location(br5, file$b, 168, 0, 4437);
    			add_location(br6, file$b, 169, 0, 4442);
    			set_style(div1, "text-align", "right");
    			set_style(div1, "margin-right", "2%");
    			set_style(div1, "width", "20%");
    			add_location(div1, file$b, 156, 20, 4211);
    			attr_dev(button3, "id", "m0");
    			add_location(button3, file$b, 174, 0, 4541);
    			attr_dev(button4, "id", "m1");
    			add_location(button4, file$b, 175, 0, 4603);
    			attr_dev(button5, "id", "m2");
    			add_location(button5, file$b, 176, 0, 4665);
    			add_location(br7, file$b, 177, 0, 4727);
    			add_location(br8, file$b, 178, 0, 4732);
    			attr_dev(button6, "id", "m3");
    			add_location(button6, file$b, 179, 0, 4737);
    			attr_dev(button7, "id", "m4");
    			add_location(button7, file$b, 180, 0, 4799);
    			attr_dev(button8, "id", "m5");
    			add_location(button8, file$b, 181, 0, 4861);
    			add_location(br9, file$b, 182, 0, 4923);
    			add_location(br10, file$b, 183, 0, 4928);
    			attr_dev(button9, "id", "m6");
    			add_location(button9, file$b, 184, 0, 4933);
    			attr_dev(button10, "id", "m7");
    			add_location(button10, file$b, 185, 0, 4995);
    			attr_dev(button11, "id", "m8");
    			add_location(button11, file$b, 186, 0, 5057);
    			set_style(div2, "marginRight", "0%");
    			set_style(div2, "width", "80%");
    			add_location(div2, file$b, 172, 12, 4495);
    			set_style(div3, "display", "flex");
    			add_location(div3, file$b, 155, 20, 4161);
    			add_location(br11, file$b, 189, 0, 5133);
    			add_location(p0, file$b, 190, 0, 5138);
    			add_location(br12, file$b, 192, 0, 5217);
    			add_location(br13, file$b, 192, 4, 5221);
    			add_location(div4, file$b, 193, 0, 5226);
    			add_location(div5, file$b, 194, 0, 5250);
    			add_location(br14, file$b, 195, 0, 5276);
    			add_location(br15, file$b, 196, 0, 5281);
    			add_location(p1, file$b, 217, 0, 5306);
    			add_location(pre0, file$b, 218, 0, 5503);
    			add_location(p2, file$b, 219, 0, 5521);
    			add_location(pre1, file$b, 220, 0, 5557);
    			add_location(p3, file$b, 221, 0, 5575);

    			dispose = [
    				listen_dev(button0, "click", /*back*/ ctx[4], false, false, false),
    				listen_dev(button2, "click", /*forward*/ ctx[5], false, false, false),
    				listen_dev(
    					button3,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button4,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button5,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button6,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button7,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button8,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button9,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button10,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					button11,
    					"click",
    					function () {
    						if (is_function(/*ob*/ ctx[1].push)) /*ob*/ ctx[1].push.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t4);
    			append_dev(div1, br2);
    			append_dev(div1, t5);
    			append_dev(div1, br3);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, button1);
    			append_dev(button1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, br4);
    			append_dev(div1, t9);
    			append_dev(div1, button2);
    			append_dev(div1, t11);
    			append_dev(div1, br5);
    			append_dev(div1, t12);
    			append_dev(div1, br6);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			append_dev(div2, button3);
    			append_dev(button3, t14);
    			append_dev(div2, t15);
    			append_dev(div2, button4);
    			append_dev(button4, t16);
    			append_dev(div2, t17);
    			append_dev(div2, button5);
    			append_dev(button5, t18);
    			append_dev(div2, t19);
    			append_dev(div2, br7);
    			append_dev(div2, t20);
    			append_dev(div2, br8);
    			append_dev(div2, t21);
    			append_dev(div2, button6);
    			append_dev(button6, t22);
    			append_dev(div2, t23);
    			append_dev(div2, button7);
    			append_dev(button7, t24);
    			append_dev(div2, t25);
    			append_dev(div2, button8);
    			append_dev(button8, t26);
    			append_dev(div2, t27);
    			append_dev(div2, br9);
    			append_dev(div2, t28);
    			append_dev(div2, br10);
    			append_dev(div2, t29);
    			append_dev(div2, button9);
    			append_dev(button9, t30);
    			append_dev(div2, t31);
    			append_dev(div2, button10);
    			append_dev(button10, t32);
    			append_dev(div2, t33);
    			append_dev(div2, button11);
    			append_dev(button11, t34);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t38, anchor);
    			mount_component(cow, target, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, br13, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, br14, anchor);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, br15, anchor);
    			insert_dev(target, t46, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t48, anchor);
    			insert_dev(target, pre0, anchor);
    			insert_dev(target, t50, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t52, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t54, anchor);
    			insert_dev(target, p3, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*j*/ 1) set_data_dev(t7, /*j*/ ctx[0]);
    			if ((!current || dirty & /*j*/ 1) && t14_value !== (t14_value = /*cache*/ ctx[3][/*j*/ ctx[0]][0] + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*j*/ 1) && t16_value !== (t16_value = /*cache*/ ctx[3][/*j*/ ctx[0]][1] + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty & /*j*/ 1) && t18_value !== (t18_value = /*cache*/ ctx[3][/*j*/ ctx[0]][2] + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty & /*j*/ 1) && t22_value !== (t22_value = /*cache*/ ctx[3][/*j*/ ctx[0]][3] + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty & /*j*/ 1) && t24_value !== (t24_value = /*cache*/ ctx[3][/*j*/ ctx[0]][4] + "")) set_data_dev(t24, t24_value);
    			if ((!current || dirty & /*j*/ 1) && t26_value !== (t26_value = /*cache*/ ctx[3][/*j*/ ctx[0]][5] + "")) set_data_dev(t26, t26_value);
    			if ((!current || dirty & /*j*/ 1) && t30_value !== (t30_value = /*cache*/ ctx[3][/*j*/ ctx[0]][6] + "")) set_data_dev(t30, t30_value);
    			if ((!current || dirty & /*j*/ 1) && t32_value !== (t32_value = /*cache*/ ctx[3][/*j*/ ctx[0]][7] + "")) set_data_dev(t32, t32_value);
    			if ((!current || dirty & /*j*/ 1) && t34_value !== (t34_value = /*cache*/ ctx[3][/*j*/ ctx[0]][8] + "")) set_data_dev(t34, t34_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(cow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(cow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t38);
    			destroy_component(cow, detaching);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t46);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t48);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t52);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t54);
    			if (detaching) detach_dev(p3);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let visible = true;
    	var cache = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    	var j = 0;

    	var ob = {
    		x: [],
    		push: function push(e) {
    			ob.x.push(parseInt(e.target.id.slice(1, 2), 10));

    			if (ob.x.length > 1) {
    				var d = exchange(ob.x[0], ob.x[1]);
    				cache.splice(j + 1, 0, d);
    				$$invalidate(1, ob.x = [], ob);
    				j += 1;
    				return cache;
    				var j = 0;
    			}
    		}
    	};

    	function exchange(k, n) {
    		var ar = cache[j].slice();
    		var a = ar[k];
    		ar[k] = ar[n];
    		ar[n] = a;
    		return ar;
    	}

    	var back = function back() {
    		if (j > 0) $$invalidate(0, j = $$invalidate(0, j -= 1)); else $$invalidate(0, j);
    	};

    	var forward = function forward() {
    		if (j + 1 < cache.length) $$invalidate(0, j = $$invalidate(0, j += 1)); else $$invalidate(0, j);
    	};

    	var cache = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    	var j = 0;

    	var ob = {
    		x: [],
    		push: function push(e) {
    			ob.x.push(parseInt(e.target.id.slice(1, 2), 10));

    			if (ob.x.length > 1) {
    				var d = exchange(ob.x[0], ob.x[1]);
    				cache.splice(j + 1, 0, d);
    				$$invalidate(1, ob.x = [], ob);
    				$$invalidate(0, j += 1);
    				return cache;
    			}
    		}
    	};

    	var code = `
  var cache = [[1,2,3,4,5,6,7,8,9]];
  var j = 0;
  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(j+1,0,d);
         ob.x = [];
         j+=1;
         return cache;   var j = 0;
        }
     }
  }

   function exchange (k,n) {
      var ar = cache[j].slice();
      var a = ar[k]
      ar[k] = ar[n];
      ar[n] = a;
      return ar;
   }

   function back () {
      if (j > 0) j = j-=1;
      else j = j;
   }

   function forward () {
      if (j+1 < cache.length) j = j+=1;
      else j = j;
    }

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var j = 0;
     var ob = {x: [], push: function push (e) {
        ob.x.push(parseInt(e.target.id.slice(1,2), 10));
        if (ob.x.length >1) {
            var d = exchange(ob.x[0], ob.x[1]);
            cache.splice(j+1,0,d);
            ob.x = [];
            j+=1;
            return cache;
           }
        }
     }`;

    	var html = `{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
 A LITTLE SVELTE MODULE
 </div>
{/if}

                        <div style = "display: flex">
                        <div style = "margin-Left: 2%; width: 50%" >

<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<br>	<button on:click={back}>
		BACK
	</button>
<br>
<br>

   <div style="text-indent:20px"><button>{ j }</button></div>
<br>
	<button on:click={forward}>
		FORWARD
	</button>
                        </div>
                     <div style = "marginRight: 2%; width: 50%; font-size: 30">
<br><br><br><br><br><p>Suck my dick</p>
<button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[j][
   2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[j]
   [7]}</button>
<button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
</div>
</div>
<p> This is the JavaScript code inside of the script tags except for the definitions of the variables "code" and "html", which are just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p> `;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    		if ("cache" in $$props) $$invalidate(3, cache = $$props.cache);
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    		if ("ob" in $$props) $$invalidate(1, ob = $$props.ob);
    		if ("back" in $$props) $$invalidate(4, back = $$props.back);
    		if ("forward" in $$props) $$invalidate(5, forward = $$props.forward);
    		if ("code" in $$props) $$invalidate(6, code = $$props.code);
    		if ("html" in $$props) $$invalidate(7, html = $$props.html);
    	};

    	return [j, ob, visible, cache, back, forward, code, html];
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Matrix",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Transducer.svelte generated by Svelte v3.16.7 */
    const file$c = "src/Transducer.svelte";

    // (398:0) {#if visible}
    function create_if_block$6(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "TRANSDUCER SIMULATION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$c, 398, 1, 8910);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(398:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let br0;
    	let br1;
    	let br2;
    	let t0;
    	let t1;
    	let br3;
    	let br4;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let p2;
    	let t8;
    	let p3;
    	let t10;
    	let br5;
    	let br6;
    	let t11;
    	let div0;
    	let t12;
    	let t13_value = /*transducerResult*/ ctx[6].length + "";
    	let t13;
    	let t14;
    	let br7;
    	let br8;
    	let t15;
    	let div1;
    	let t17;
    	let br9;
    	let t18;
    	let div2;
    	let t19;
    	let t20_value = /*A_A*/ ctx[2].join(", ") + "";
    	let t20;
    	let t21;
    	let t22;
    	let br10;
    	let t23;
    	let br11;
    	let t24;
    	let div3;
    	let t26;
    	let br12;
    	let t27;
    	let div4;
    	let t28;
    	let t29_value = /*B_B*/ ctx[3].join(", ") + "";
    	let t29;
    	let t30;
    	let t31;
    	let br13;
    	let t32;
    	let br14;
    	let t33;
    	let div5;
    	let t35;
    	let br15;
    	let t36;
    	let div6;
    	let t37_1;
    	let t38_value = /*C_C*/ ctx[4].join(", ") + "";
    	let t38;
    	let t39;
    	let t40;
    	let br16;
    	let t41;
    	let br17;
    	let t42;
    	let div7;
    	let t44;
    	let br18;
    	let t45;
    	let div8;
    	let t46;
    	let t47_value = /*D_D*/ ctx[5].join(", ") + "";
    	let t47;
    	let t48;
    	let t49;
    	let br19;
    	let t50;
    	let br20;
    	let t51;
    	let button0;
    	let t53;
    	let button1;
    	let t55;
    	let br21;
    	let br22;
    	let t56;
    	let div9;
    	let t57;
    	let t58;
    	let t59;
    	let br23;
    	let t60;
    	let div10;
    	let t61;
    	let t62_value = /*ar74*/ ctx[1].join(", ") + "";
    	let t62;
    	let t63;
    	let t64;
    	let br24;
    	let t65;
    	let div11;
    	let t67;
    	let pre0;
    	let t69;
    	let p4;
    	let t71;
    	let div12;
    	let t73;
    	let pre1;
    	let t75;
    	let p5;
    	let t77;
    	let div13;
    	let t79;
    	let pre2;
    	let t81;
    	let p6;
    	let t83;
    	let p7;
    	let t85;
    	let pre3;
    	let t87;
    	let p8;
    	let t89;
    	let pre4;
    	let t91;
    	let span0;
    	let t93;
    	let a;
    	let t95;
    	let span1;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[7] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			br3 = element("br");
    			br4 = element("br");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "The tradition JavaScript method of composing functions using mainly map, filter, and reduce dot notation (eg. \"array.map(func1).filter(func2).map(func3)\") polutes memory with arrays that are used only to compute the next array in a chain. Moreover, each of the soon-to-be useless arrays must be traversed. When arrays are large and numerous functions are involved, this can be a performance bottleneck.";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Transducers provide an ingenious solution to the problem. Any JavaScript developer who hasn't already done so would do well to get a good night's sleep, drink a big cup of coffee, and wrap his or her head around the transducer algorithm.";
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "Another, more straightforward one-array-traversal solution is to use monads. This post shows the result of an array being traversed only one time and, with the help of a monad, undersoing multiple transformations by a collection of functions. The result is the same result obtained by the dot method and a standard transducer.";
    			t8 = space();
    			p3 = element("p");
    			p3.textContent = "The following results were obtained by eight transformations on an array of the first 100 integers:";
    			t10 = space();
    			br5 = element("br");
    			br6 = element("br");
    			t11 = space();
    			div0 = element("div");
    			t12 = text("Result length is ");
    			t13 = text(t13_value);
    			t14 = space();
    			br7 = element("br");
    			br8 = element("br");
    			t15 = space();
    			div1 = element("div");
    			div1.textContent = "Traditional dot composition";
    			t17 = space();
    			br9 = element("br");
    			t18 = space();
    			div2 = element("div");
    			t19 = text("[");
    			t20 = text(t20_value);
    			t21 = text("]");
    			t22 = space();
    			br10 = element("br");
    			t23 = space();
    			br11 = element("br");
    			t24 = space();
    			div3 = element("div");
    			div3.textContent = "Composition in two stages using Monad";
    			t26 = space();
    			br12 = element("br");
    			t27 = space();
    			div4 = element("div");
    			t28 = text("[");
    			t29 = text(t29_value);
    			t30 = text("]");
    			t31 = space();
    			br13 = element("br");
    			t32 = space();
    			br14 = element("br");
    			t33 = space();
    			div5 = element("div");
    			div5.textContent = "Composition in one traversal using Monad";
    			t35 = space();
    			br15 = element("br");
    			t36 = space();
    			div6 = element("div");
    			t37_1 = text("[");
    			t38 = text(t38_value);
    			t39 = text("]");
    			t40 = space();
    			br16 = element("br");
    			t41 = space();
    			br17 = element("br");
    			t42 = space();
    			div7 = element("div");
    			div7.textContent = "Composition using a standard transducer";
    			t44 = space();
    			br18 = element("br");
    			t45 = space();
    			div8 = element("div");
    			t46 = text("[");
    			t47 = text(t47_value);
    			t48 = text("]");
    			t49 = space();
    			br19 = element("br");
    			t50 = space();
    			br20 = element("br");
    			t51 = space();
    			button0 = element("button");
    			button0.textContent = "INCREASE";
    			t53 = space();
    			button1 = element("button");
    			button1.textContent = "DECREASE";
    			t55 = space();
    			br21 = element("br");
    			br22 = element("br");
    			t56 = space();
    			div9 = element("div");
    			t57 = text("Array length: ");
    			t58 = text(/*size*/ ctx[0]);
    			t59 = space();
    			br23 = element("br");
    			t60 = space();
    			div10 = element("div");
    			t61 = text("ar74: [");
    			t62 = text(t62_value);
    			t63 = text("]");
    			t64 = space();
    			br24 = element("br");
    			t65 = space();
    			div11 = element("div");
    			div11.textContent = "The modified Monad (below) could benefit from some refactoring, but it does what needs to be done for this demo. The point is that a standard transducer and Monad both use one array traversal to accomplish what the built-in dot method does by traversing the original array and seven intermediary arrays.";
    			t67 = space();
    			pre0 = element("pre");
    			pre0.textContent = `${/*mon44*/ ctx[8]}`;
    			t69 = space();
    			p4 = element("p");
    			p4.textContent = "On my desktop computer, when ar74.length === 100,000 I got this and similar results:";
    			t71 = space();
    			div12 = element("div");
    			div12.textContent = "ar74.length = 100,000:";
    			t73 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Dot method:: 25 ms\nMonad two traversals: 255 ms\nMonad one traversal: 220 ms\nTransducer: 26 ms";
    			t75 = space();
    			p5 = element("p");
    			p5.textContent = "ar74.length === 1,000,000 was about as far as I could go without crashing the browser. Here are two typical results:";
    			t77 = space();
    			div13 = element("div");
    			div13.textContent = "Two runs with ar74.length = 1,000,000:";
    			t79 = space();
    			pre2 = element("pre");
    			pre2.textContent = "Dot method:: 276\nMonad two traversals: 2140\nMonad one traversal: 2060\nTransducer: 180\n\nDot method:: 312\nMonad two traversals: 2093\nMonad one traversal: 2115\nTransducer: 176";
    			t81 = space();
    			p6 = element("p");
    			p6.textContent = "As you see, the built-in JavaScript dot method and the transducer gave similar results. The Monad methods are much slower. They're just a proof-of-concept hacks showing the versitility of monads spawned by Monad().";
    			t83 = space();
    			p7 = element("p");
    			p7.textContent = "Here's the definition of the increase button's callback function along with the definitions of some assoc some supportingrelated:";
    			t85 = space();
    			pre3 = element("pre");
    			pre3.textContent = `${/*callback*/ ctx[9]}`;
    			t87 = space();
    			p8 = element("p");
    			p8.textContent = "And here's some of the code behind the transducer demonstration:";
    			t89 = space();
    			pre4 = element("pre");
    			pre4.textContent = `${/*call2*/ ctx[10]}`;
    			t91 = space();
    			span0 = element("span");
    			span0.textContent = "The rest of the code can be found in the";
    			t93 = space();
    			a = element("a");
    			a.textContent = "Github repository";
    			t95 = space();
    			span1 = element("span");
    			span1.textContent = ".";
    			add_location(br0, file$c, 396, 0, 8882);
    			add_location(br1, file$c, 396, 4, 8886);
    			add_location(br2, file$c, 396, 8, 8890);
    			add_location(br3, file$c, 402, 0, 9073);
    			add_location(br4, file$c, 402, 4, 9077);
    			add_location(p0, file$c, 404, 0, 9083);
    			add_location(p1, file$c, 405, 0, 9494);
    			add_location(p2, file$c, 406, 0, 9740);
    			add_location(p3, file$c, 407, 0, 10075);
    			add_location(br5, file$c, 408, 0, 10183);
    			add_location(br6, file$c, 408, 4, 10187);
    			add_location(div0, file$c, 409, 0, 10192);
    			add_location(br7, file$c, 410, 0, 10246);
    			add_location(br8, file$c, 410, 4, 10250);
    			attr_dev(div1, "class", "p svelte-1d81q6r");
    			add_location(div1, file$c, 411, 0, 10255);
    			add_location(br9, file$c, 412, 0, 10306);
    			attr_dev(div2, "class", "q svelte-1d81q6r");
    			add_location(div2, file$c, 413, 0, 10311);
    			add_location(br10, file$c, 414, 0, 10352);
    			add_location(br11, file$c, 415, 0, 10357);
    			attr_dev(div3, "class", "p svelte-1d81q6r");
    			add_location(div3, file$c, 416, 0, 10362);
    			add_location(br12, file$c, 417, 0, 10423);
    			attr_dev(div4, "class", "q svelte-1d81q6r");
    			add_location(div4, file$c, 418, 0, 10428);
    			add_location(br13, file$c, 419, 0, 10470);
    			add_location(br14, file$c, 420, 0, 10475);
    			attr_dev(div5, "class", "p svelte-1d81q6r");
    			add_location(div5, file$c, 421, 0, 10480);
    			add_location(br15, file$c, 422, 0, 10544);
    			attr_dev(div6, "class", "q svelte-1d81q6r");
    			add_location(div6, file$c, 423, 0, 10549);
    			add_location(br16, file$c, 424, 0, 10591);
    			add_location(br17, file$c, 425, 0, 10596);
    			attr_dev(div7, "class", "p svelte-1d81q6r");
    			add_location(div7, file$c, 426, 0, 10601);
    			add_location(br18, file$c, 427, 0, 10664);
    			attr_dev(div8, "class", "q svelte-1d81q6r");
    			add_location(div8, file$c, 428, 0, 10669);
    			add_location(br19, file$c, 429, 0, 10711);
    			add_location(br20, file$c, 430, 0, 10716);
    			attr_dev(button0, "class", "but");
    			add_location(button0, file$c, 431, 0, 10721);
    			attr_dev(button1, "class", "but");
    			add_location(button1, file$c, 432, 0, 10781);
    			add_location(br21, file$c, 433, 0, 10841);
    			add_location(br22, file$c, 433, 4, 10845);
    			add_location(div9, file$c, 434, 0, 10850);
    			add_location(br23, file$c, 435, 0, 10882);
    			add_location(div10, file$c, 436, 0, 10887);
    			add_location(br24, file$c, 437, 0, 10924);
    			add_location(div11, file$c, 438, 0, 10929);
    			add_location(pre0, file$c, 439, 0, 11245);
    			add_location(p4, file$c, 440, 0, 11264);
    			set_style(div12, "color", "#BBFFBB");
    			add_location(div12, file$c, 441, 0, 11358);
    			add_location(pre1, file$c, 443, 0, 11418);
    			add_location(p5, file$c, 447, 0, 11524);
    			set_style(div13, "color", "#BBFFBB");
    			add_location(div13, file$c, 449, 0, 11651);
    			add_location(pre2, file$c, 451, 0, 11727);
    			add_location(p6, file$c, 460, 0, 11912);
    			add_location(p7, file$c, 461, 0, 12136);
    			add_location(pre3, file$c, 462, 0, 12275);
    			add_location(p8, file$c, 463, 0, 12297);
    			add_location(pre4, file$c, 464, 0, 12371);
    			add_location(span0, file$c, 465, 0, 12390);
    			attr_dev(a, "href", "https://github.com/dschalk/blog");
    			add_location(a, file$c, 466, 0, 12446);
    			add_location(span1, file$c, 467, 0, 12512);

    			dispose = [
    				listen_dev(button0, "click", /*increase*/ ctx[11], false, false, false),
    				listen_dev(button1, "click", /*decrease*/ ctx[12], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t12);
    			append_dev(div0, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t19);
    			append_dev(div2, t20);
    			append_dev(div2, t21);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t28);
    			append_dev(div4, t29);
    			append_dev(div4, t30);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, br13, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, br14, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br15, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, t37_1);
    			append_dev(div6, t38);
    			append_dev(div6, t39);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, br16, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, br17, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, br18, anchor);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, t46);
    			append_dev(div8, t47);
    			append_dev(div8, t48);
    			insert_dev(target, t49, anchor);
    			insert_dev(target, br19, anchor);
    			insert_dev(target, t50, anchor);
    			insert_dev(target, br20, anchor);
    			insert_dev(target, t51, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t55, anchor);
    			insert_dev(target, br21, anchor);
    			insert_dev(target, br22, anchor);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, t57);
    			append_dev(div9, t58);
    			insert_dev(target, t59, anchor);
    			insert_dev(target, br23, anchor);
    			insert_dev(target, t60, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, t61);
    			append_dev(div10, t62);
    			append_dev(div10, t63);
    			insert_dev(target, t64, anchor);
    			insert_dev(target, br24, anchor);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t67, anchor);
    			insert_dev(target, pre0, anchor);
    			insert_dev(target, t69, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t71, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t73, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t75, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t77, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t79, anchor);
    			insert_dev(target, pre2, anchor);
    			insert_dev(target, t81, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t83, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t85, anchor);
    			insert_dev(target, pre3, anchor);
    			insert_dev(target, t87, anchor);
    			insert_dev(target, p8, anchor);
    			insert_dev(target, t89, anchor);
    			insert_dev(target, pre4, anchor);
    			insert_dev(target, t91, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t93, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t95, anchor);
    			insert_dev(target, span1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*transducerResult*/ 64) && t13_value !== (t13_value = /*transducerResult*/ ctx[6].length + "")) set_data_dev(t13, t13_value);
    			if ((!current || dirty[0] & /*A_A*/ 4) && t20_value !== (t20_value = /*A_A*/ ctx[2].join(", ") + "")) set_data_dev(t20, t20_value);
    			if ((!current || dirty[0] & /*B_B*/ 8) && t29_value !== (t29_value = /*B_B*/ ctx[3].join(", ") + "")) set_data_dev(t29, t29_value);
    			if ((!current || dirty[0] & /*C_C*/ 16) && t38_value !== (t38_value = /*C_C*/ ctx[4].join(", ") + "")) set_data_dev(t38, t38_value);
    			if ((!current || dirty[0] & /*D_D*/ 32) && t47_value !== (t47_value = /*D_D*/ ctx[5].join(", ") + "")) set_data_dev(t47, t47_value);
    			if (!current || dirty[0] & /*size*/ 1) set_data_dev(t58, /*size*/ ctx[0]);
    			if ((!current || dirty[0] & /*ar74*/ 2) && t62_value !== (t62_value = /*ar74*/ ctx[1].join(", ") + "")) set_data_dev(t62, t62_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(br16);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(br17);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(br18);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t49);
    			if (detaching) detach_dev(br19);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(br20);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t55);
    			if (detaching) detach_dev(br21);
    			if (detaching) detach_dev(br22);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t59);
    			if (detaching) detach_dev(br23);
    			if (detaching) detach_dev(t60);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t64);
    			if (detaching) detach_dev(br24);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t67);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t69);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t71);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t73);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t75);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t77);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t79);
    			if (detaching) detach_dev(pre2);
    			if (detaching) detach_dev(t81);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t83);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t85);
    			if (detaching) detach_dev(pre3);
    			if (detaching) detach_dev(t87);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t89);
    			if (detaching) detach_dev(pre4);
    			if (detaching) detach_dev(t91);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t93);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t95);
    			if (detaching) detach_dev(span1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function tdMap(func) {
    	return function (reducingFunction) {
    		return (accumulator, v) => {
    			return reducingFunction(accumulator, func(v));
    		};
    	};
    }

    function tdFilter(test) {
    	return function (reducingFunction) {
    		return (accumulator, v) => {
    			return test(v) ? reducingFunction(accumulator, v) : accumulator;
    		};
    	};
    }

    function Monad$1(AR = []) {
    	var p, run;
    	var ar = AR.slice();
    	var x = ar.pop();

    	return run = (function run(x) {
    		if (x === null || x === NaN || x === undefined) x = f_("stop").pop();

    		if (x instanceof Filt) {
    			var z = ar.pop();
    			if (x.filt(z)) x = z; else ar = [];
    		} else if (x instanceof Promise) x.then(y => {
    			if (y != undefined && typeof y !== "boolean" && y === y && y.name !== "f_" && y.name !== "stop") {
    				ar.push(y);
    			}
    		}); else if (x != undefined && x === x && x !== false && x.name !== "f_" && x.name !== "stop") {
    			ar.push(x);
    		}

    		

    		function f_(func) {
    			if (func === "stop" || func === "S") return ar; else if (func === "finish" || func === "F") return Object.freeze(ar); else if (typeof func !== "function") p = func; else if (x instanceof Promise) p = x.then(v => func(v)); else p = func(x);
    			return run(p);
    		}

    		
    		return f_;
    	})(x);
    }

    function concat(xs, val) {
    	return xs.concat(val);
    }

    function mapping(f) {
    	return function (rf) {
    		return (acc, val) => {
    			return rf(acc, f(val));
    		};
    	};
    }

    function Filt(p) {
    	this.p = p;

    	this.filt = function filt(x) {
    		return p(x);
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let visible = true;
    	var k = 100000000;
    	var ltTest = x => y => new Filt(x => y < x);

    	var isOdd = function isOdd(x) {
    		return new Filt(v => v % 2 === 1);
    	};

    	var _fives = function _fives(x) {
    		if (typeof x === "number") {
    			return new Filt(v => v % 10 === 5);
    		} else if (typeof x === "string") {
    			return Filt(v = v(v.length - 1));
    		} else {
    			return undefined;
    		}
    	};

    	var fives = function fives(x) {
    		return new Filt(v => v % 10 === 5);
    	};

    	var isOddF = function isOddF(x) {
    		return new Filt(v => v % 2 === 1);
    	};

    	
    	var lessThan = x => y => new Filt(x => y < x);
    	
    	var ar = "cowgirl";

    	var cleanF = function cleanF(arthur = []) {
    		$$invalidate(13, ar = arthur);
    		return ar.filter(a => a === 0 || a && typeof a !== "boolean").reduce((a, b) => a.concat(b), []);
    	};

    	var mon44 = `function Monad ( AR = [] )  {
  var f_, p, run;
  var ar = AR.slice();
  var x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" &&
      y.name !== "stop" ) {
      ar.push(y);
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
    };
    function f_ (func) {
      if (func === 'stop' || func === 'S') return ar;
      else if (func === 'finish' || func === 'F') return Object.freeze(ar);
      else if (typeof func !== "function") p = func;
      else if (x instanceof Promise) p = x.then(v => func(v));
      else p = func(x);
      return run(p);
    };

    return f_;
  })(x)
} `;

    	var compose = (...fns) => fns.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), value => value);

    	var add1 = function add1(v) {
    		return v + 1;
    	};

    	var sum = function sum(total, v) {
    		return total + v;
    	};

    	var cube = function cube(v) {
    		return v ** 3;
    	};

    	var size = 400;
    	var ar74 = [...Array(size).keys()];
    	var mapWRf = mapping(cube);
    	var mapRes = ar74.reduce(mapWRf(concat), []);
    	var isEven = x => x % 2 === 0;
    	var not = x => !x;
    	var isOdd2 = compose(not, isEven);
    	var map = f => ar => ar.map(v => f(v));
    	var filter = p => ar => ar.filter(p);
    	var reduce = f => ar => v => ar.reduce(f, v);
    	var A_A = "H";
    	var B_B = "s";
    	var C_C = "G";
    	var D_D = "I";
    	var res1;
    	var res2;
    	var res3;
    	var res4;
    	var dotResult = [];
    	var test9;
    	var transducerResult;
    	A_A = dotResult = ar74.filter(v => v % 2 === 1).map(x => x ** 4).map(x => x + 3).map(x => x - 3).filter(v => v % 10 === 5).map(x => Math.sqrt(x)).map(v => v * v).map(v => v + 1000);
    	var td3;
    	var xform;
    	var xform2;
    	var xform3;
    	var test8 = k => ltTest(k).filt;
    	
    	var test9;
    	

    	var fives = function fives(x) {
    		return new Filt(v => v % 10 === 5);
    	};

    	var td1 = x => Monad$1([x])(isOdd)(v => v ** 4)(v => v + 3)(v => v - 3)(fives)(Math.sqrt)("stop").pop();
    	var td2 = y => Monad$1([y])(v => v * v)(v => v + 1000)("stop").pop();
    	res1 = ar74.map(x => td1(x));
    	B_B = res2 = res1.map(y => td2(y));
    	C_C = res3 = ar74.map(z => td2(td1(z)));
    	xform = compose(tdFilter(x => x % 2 === 1), tdMap(x => x ** 4), tdMap(x => x + 3), tdMap(x => x - 3), tdFilter(x => x % 10 === 5), tdMap(x => Math.sqrt(x)));
    	xform2 = compose(tdMap(x => x * x), tdMap(x => x + 1000));
    	xform3 = compose(tdFilter(x => x % 2 === 1), tdMap(x => x ** 4), tdMap(x => x + 3), tdMap(x => x - 3), tdFilter(x => x % 10 === 5), tdMap(x => Math.sqrt(x)), tdMap(x => x * x), tdMap(x => x + 1000));
    	D_D = transducerResult = ar74.reduce(xform3(concat), []);
    	var t37;

    	

    	var callback = `function increase () {
  size = size + 10;
  ar74 = [...Array(size).keys()];
   A_A = dotResult = ar74
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .filter(v => v % 10 === 5)
   .map(x => Math.sqrt(x))
   .map(v=>v*v)
  res1 = ar74.map(x => td1(x));
  B_B = res2 = res1.map(y => td2(y));
  C_C = res3 = ar74.map(z => td2(td1(z)));
  D_D = transducerResult = ar74.reduce(xform3(concat),[] );
}

  function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};
  var fives = function fives (x) {return new Filt(v => v % 10 === 5)}
  var isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

  var td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)
    (v=>v-3)(fives)(Math.sqrt)('stop').pop()
  res1 = ar74.map(x => td1(x));
  var td2 = y => Monad([y])(v=>v*v)(v=>v+1000)('stop').pop()`;

    	var call2 = `xform3 = compose(
    tdFilter(x=>x%2===1),
    tdMap(x => x**4),
    tdMap(x => x+3),
    tdMap(x => x-3),
    tdFilter(x => x % 10 === 5),
    tdMap(x => Math.sqrt(x)),
    tdMap(x=>x*x),
    tdMap(x=>x+1000)
  );

  function tdMap(func) {
    return function(reducingFunction) {
      return (accumulator, v) => {
        return reducingFunction(accumulator, func(v));
      }
    }
  }

  function tdFilter(test) {
    return function(reducingFunction) {
      return (accumulator, v) => {
        return (test(v) ? reducingFunction(accumulator, v) : accumulator)
      };
    };
  }; `;

    	function increase() {
    		$$invalidate(0, size = size + 10);
    		$$invalidate(1, ar74 = [...Array(size).keys()]);
    		res1 = ar74.map(x => td1(x));
    		$$invalidate(2, A_A = $$invalidate(17, dotResult = ar74.filter(v => v % 2 === 1).map(x => x ** 4).map(x => x + 3).map(x => x - 3).filter(v => v % 10 === 5).map(x => Math.sqrt(x)).map(v => v * v).map(v => v + 1000)));
    		$$invalidate(3, B_B = $$invalidate(15, res2 = res1.map(y => td2(y))));
    		$$invalidate(4, C_C = $$invalidate(16, res3 = ar74.map(z => td2(td1(z)))));
    		$$invalidate(5, D_D = $$invalidate(6, transducerResult = ar74.reduce(xform3(concat), [])));
    	}

    	function decrease() {
    		$$invalidate(0, size = size - 10);
    		$$invalidate(1, ar74 = [...Array(size).keys()]);
    		res1 = ar74.map(x => td1(x));
    		$$invalidate(2, A_A = $$invalidate(17, dotResult = ar74.filter(v => v % 2 === 1).map(x => x ** 4).map(x => x + 3).map(x => x - 3).filter(v => v % 10 === 5).map(x => Math.sqrt(x)).map(v => v * v).map(v => v + 1000)));
    		$$invalidate(3, B_B = $$invalidate(15, res2 = res1.map(y => td2(y))));
    		$$invalidate(4, C_C = $$invalidate(16, res3 = ar74.map(z => td2(td1(z)))));
    		$$invalidate(5, D_D = $$invalidate(6, transducerResult = ar74.reduce(xform3(concat), [])));
    	}

    	increase();
    	decrease();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(7, visible = $$props.visible);
    		if ("k" in $$props) $$invalidate(22, k = $$props.k);
    		if ("ltTest" in $$props) $$invalidate(23, ltTest = $$props.ltTest);
    		if ("isOdd" in $$props) isOdd = $$props.isOdd;
    		if ("_fives" in $$props) _fives = $$props._fives;
    		if ("fives" in $$props) fives = $$props.fives;
    		if ("isOddF" in $$props) isOddF = $$props.isOddF;
    		if ("lessThan" in $$props) lessThan = $$props.lessThan;
    		if ("ar" in $$props) $$invalidate(13, ar = $$props.ar);
    		if ("cleanF" in $$props) $$invalidate(29, cleanF = $$props.cleanF);
    		if ("mon44" in $$props) $$invalidate(8, mon44 = $$props.mon44);
    		if ("compose" in $$props) compose = $$props.compose;
    		if ("add1" in $$props) add1 = $$props.add1;
    		if ("sum" in $$props) sum = $$props.sum;
    		if ("cube" in $$props) cube = $$props.cube;
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("ar74" in $$props) $$invalidate(1, ar74 = $$props.ar74);
    		if ("mapWRf" in $$props) mapWRf = $$props.mapWRf;
    		if ("mapRes" in $$props) mapRes = $$props.mapRes;
    		if ("isEven" in $$props) isEven = $$props.isEven;
    		if ("not" in $$props) not = $$props.not;
    		if ("isOdd2" in $$props) isOdd2 = $$props.isOdd2;
    		if ("map" in $$props) map = $$props.map;
    		if ("filter" in $$props) filter = $$props.filter;
    		if ("reduce" in $$props) reduce = $$props.reduce;
    		if ("A_A" in $$props) $$invalidate(2, A_A = $$props.A_A);
    		if ("B_B" in $$props) $$invalidate(3, B_B = $$props.B_B);
    		if ("C_C" in $$props) $$invalidate(4, C_C = $$props.C_C);
    		if ("D_D" in $$props) $$invalidate(5, D_D = $$props.D_D);
    		if ("res1" in $$props) res1 = $$props.res1;
    		if ("res2" in $$props) $$invalidate(15, res2 = $$props.res2);
    		if ("res3" in $$props) $$invalidate(16, res3 = $$props.res3);
    		if ("res4" in $$props) $$invalidate(42, res4 = $$props.res4);
    		if ("dotResult" in $$props) $$invalidate(17, dotResult = $$props.dotResult);
    		if ("test9" in $$props) $$invalidate(43, test9 = $$props.test9);
    		if ("transducerResult" in $$props) $$invalidate(6, transducerResult = $$props.transducerResult);
    		if ("td3" in $$props) $$invalidate(44, td3 = $$props.td3);
    		if ("xform" in $$props) $$invalidate(18, xform = $$props.xform);
    		if ("xform2" in $$props) $$invalidate(19, xform2 = $$props.xform2);
    		if ("xform3" in $$props) $$invalidate(20, xform3 = $$props.xform3);
    		if ("test8" in $$props) test8 = $$props.test8;
    		if ("td1" in $$props) td1 = $$props.td1;
    		if ("td2" in $$props) td2 = $$props.td2;
    		if ("t37" in $$props) $$invalidate(21, t37 = $$props.t37);
    		if ("callback" in $$props) $$invalidate(9, callback = $$props.callback);
    		if ("call2" in $$props) $$invalidate(10, call2 = $$props.call2);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ar*/ 8192) ;

    		if ($$self.$$.dirty[0] & /*size*/ 1) ;

    		if ($$self.$$.dirty[0] & /*ar74*/ 2) ;

    		if ($$self.$$.dirty[0] & /*dotResult*/ 131072) {
    			 $$invalidate(2, A_A = dotResult);
    		}

    		if ($$self.$$.dirty[0] & /*A_A*/ 4) ;

    		if ($$self.$$.dirty[0] & /*res2*/ 32768) {
    			 $$invalidate(3, B_B = cleanF(res2));
    		}

    		if ($$self.$$.dirty[0] & /*B_B*/ 8) ;

    		if ($$self.$$.dirty[0] & /*res3*/ 65536) {
    			 $$invalidate(4, C_C = cleanF(res3));
    		}

    		if ($$self.$$.dirty[0] & /*C_C*/ 16) ;

    		if ($$self.$$.dirty[0] & /*ar74, xform3*/ 1048578) {
    			 $$invalidate(6, transducerResult = ar74.reduce(xform3(concat), []));
    		}

    		if ($$self.$$.dirty[0] & /*transducerResult*/ 64) {
    			 $$invalidate(5, D_D = transducerResult);
    		}

    		if ($$self.$$.dirty[0] & /*D_D*/ 32) ;

    		if ($$self.$$.dirty[0] & /*res3*/ 65536) ;

    		if ($$self.$$.dirty[0] & /*dotResult*/ 131072) ;

    		if ($$self.$$.dirty[0] & /*transducerResult*/ 64) ;

    		if ($$self.$$.dirty[0] & /*xform*/ 262144) ;

    		if ($$self.$$.dirty[0] & /*xform2*/ 524288) ;

    		if ($$self.$$.dirty[0] & /*xform3*/ 1048576) ;

    		if ($$self.$$.dirty[0] & /*t37*/ 2097152) ;

    		if ($$self.$$.dirty[0] & /*dotResult*/ 131072) ;

    		if ($$self.$$.dirty[0] & /*res2*/ 32768) ;

    		if ($$self.$$.dirty[0] & /*res3*/ 65536) ;

    		if ($$self.$$.dirty[0] & /*transducerResult*/ 64) ;

    		if ($$self.$$.dirty[0] & /*size*/ 1) ;

    		if ($$self.$$.dirty[0] & /*ar74*/ 2) ;
    	};

    	return [
    		size,
    		ar74,
    		A_A,
    		B_B,
    		C_C,
    		D_D,
    		transducerResult,
    		visible,
    		mon44,
    		callback,
    		call2,
    		increase,
    		decrease
    	];
    }

    class Transducer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$c, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Transducer",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/ToggleClass.svelte generated by Svelte v3.16.7 */

    const file$d = "src/ToggleClass.svelte";

    function create_fragment$d(ctx) {
    	let p;
    	let t0_value = /*num*/ ctx[0] + 1 + "";
    	let t0;
    	let t1;
    	let span;
    	let t3;
    	let input;
    	let t4;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			span.textContent = "Seconds modulo";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "foo";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "bar";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "baz";
    			add_location(p, file$d, 33, 0, 440);
    			add_location(span, file$d, 34, 1, 457);
    			attr_dev(input, "class", "svelte-o4l4cy");
    			add_location(input, file$d, 35, 0, 486);
    			attr_dev(button0, "class", "svelte-o4l4cy");
    			toggle_class(button0, "active", /*current*/ ctx[2] === "foo");
    			add_location(button0, file$d, 37, 0, 516);
    			attr_dev(button1, "class", "svelte-o4l4cy");
    			toggle_class(button1, "active", /*current*/ ctx[2] === "bar");
    			add_location(button1, file$d, 42, 0, 607);
    			attr_dev(button2, "class", "svelte-o4l4cy");
    			toggle_class(button2, "active", /*current*/ ctx[2] === "baz");
    			add_location(button2, file$d, 47, 0, 698);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    				listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[6], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*mod*/ ctx[1]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, button2, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*num*/ 1 && t0_value !== (t0_value = /*num*/ ctx[0] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*mod*/ 2 && input.value !== /*mod*/ ctx[1]) {
    				set_input_value(input, /*mod*/ ctx[1]);
    			}

    			if (dirty & /*current*/ 4) {
    				toggle_class(button0, "active", /*current*/ ctx[2] === "foo");
    			}

    			if (dirty & /*current*/ 4) {
    				toggle_class(button1, "active", /*current*/ ctx[2] === "bar");
    			}

    			if (dirty & /*current*/ 4) {
    				toggle_class(button2, "active", /*current*/ ctx[2] === "baz");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(button2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let current = "foo";
    	let { num } = $$props;
    	let { mod } = $$props;
    	num = 0;
    	mod = 5;

    	setInterval(
    		() => {
    			if (mod) $$invalidate(0, num = $$invalidate(0, num += 1) % mod);
    		},
    		1000
    	);

    	const writable_props = ["num", "mod"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToggleClass> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		mod = this.value;
    		$$invalidate(1, mod);
    	}

    	const click_handler = () => $$invalidate(2, current = "foo");
    	const click_handler_1 = () => $$invalidate(2, current = "bar");
    	const click_handler_2 = () => $$invalidate(2, current = "baz");

    	$$self.$set = $$props => {
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("mod" in $$props) $$invalidate(1, mod = $$props.mod);
    	};

    	$$self.$capture_state = () => {
    		return { current, num, mod };
    	};

    	$$self.$inject_state = $$props => {
    		if ("current" in $$props) $$invalidate(2, current = $$props.current);
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("mod" in $$props) $$invalidate(1, mod = $$props.mod);
    	};

    	return [
    		num,
    		mod,
    		current,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class ToggleClass extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$d, safe_not_equal, { num: 0, mod: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleClass",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*num*/ ctx[0] === undefined && !("num" in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'num'");
    		}

    		if (/*mod*/ ctx[1] === undefined && !("mod" in props)) {
    			console.warn("<ToggleClass> was created without expected prop 'mod'");
    		}
    	}

    	get num() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mod() {
    		throw new Error("<ToggleClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mod(value) {
    		throw new Error("<ToggleClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/Stor.svelte generated by Svelte v3.16.7 */
    const file$e = "src/Stor.svelte";

    function create_fragment$e(ctx) {
    	let h2;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("loc is ");
    			t1 = text(/*$loc*/ ctx[0]);
    			add_location(h2, file$e, 27, 0, 434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$loc*/ 1) set_data_dev(t1, /*$loc*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $count;
    	let $loc;
    	const count = writable(0);
    	validate_store(count, "count");
    	component_subscribe($$self, count, value => $$invalidate(3, $count = value));
    	console.log($count);
    	count.set(1);
    	console.log($count);
    	set_store_value(count, $count = 2);
    	console.log($count);
    	const loc = writable(false);
    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, value => $$invalidate(0, $loc = value));
    	console.log($loc);
    	loc.set(true);
    	console.log($loc);
    	set_store_value(loc, $loc = false);
    	console.log($loc);
    	loc.set(true);
    	console.log($loc);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$count" in $$props) count.set($count = $$props.$count);
    		if ("$loc" in $$props) loc.set($loc = $$props.$loc);
    	};

    	return [$loc, count, loc];
    }

    class Stor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stor",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/ToggleTheme.svelte generated by Svelte v3.16.7 */
    const file$f = "src/ToggleTheme.svelte";

    // (10:1) {#if dark}
    function create_if_block$7(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$f, 10, 1, 171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(10:1) {#if dark}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;
    	let t0;
    	let h1;
    	let t2;
    	let t3;
    	let button;
    	let current;
    	let dispose;
    	let if_block = /*dark*/ ctx[0] && create_if_block$7(ctx);
    	const stor = new Stor({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Hello World!";
    			t2 = space();
    			create_component(stor.$$.fragment);
    			t3 = space();
    			button = element("button");
    			button.textContent = "toggle theme";
    			add_location(h1, file$f, 14, 0, 235);
    			add_location(button, file$f, 17, 0, 267);
    			dispose = listen_dev(button, "click", /*toggleTheme*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(document.head, null);
    			append_dev(document.head, if_block_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(stor, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*dark*/ ctx[0]) {
    				if (!if_block) {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			detach_dev(if_block_anchor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			destroy_component(stor, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let dark = false;
    	const toggleTheme = () => $$invalidate(0, dark = dark === false);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("dark" in $$props) $$invalidate(0, dark = $$props.dark);
    	};

    	return [dark, toggleTheme];
    }

    class ToggleTheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleTheme",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/Home.svelte generated by Svelte v3.16.7 */
    const file$g = "src/Home.svelte";

    // (44:0) {#if visible}
    function create_if_block$8(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "INTRODUCTION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$g, 44, 0, 724);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(44:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let p0;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let br1;
    	let t7;
    	let br2;
    	let t8;
    	let div0;
    	let t10;
    	let div1;
    	let t12;
    	let br3;
    	let t13;
    	let br4;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "The cult that captivated me had no makeshift control towers or runways to entice cargo-bearing planes to land. It was a conglomeration of authors, presenters, and bloggers who ritualistically avoid things not found in exclusively functional languages, such as mutations and referentially opaque functions while favoring curried functions over multi-parameter versions. My enthusiasm for the Haskell programming language and the Glasgow Haskell Compiler (a/k/a Glorious Haskell Compiler) made me an easy recruit.\n\nWhen the global space is a tiny module, global variables are not dangerous. When a million and one non-tail-call recursions or passes through a loop can either spew a million pieces of garbage into memory or mutate something a million times, there should be a good reason for choosing to feed the garbage such a large meal. I'll have more on this later. \n\n";
    			p1 = element("p");
    			p1.textContent = "The functional programming I espouse is, in the case of JavaScript, the art of devising application-specific higher-order functions to manipulate smaller, reusable functions.";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "This blog isn't only about computer programming. The Tao Te Ching, bed bugs, and other miscellaneous topics have already found places here.";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			div0 = element("div");
    			div0.textContent = "David Schalk";
    			t10 = space();
    			div1 = element("div");
    			div1.textContent = "October, 2019";
    			t12 = space();
    			br3 = element("br");
    			t13 = space();
    			br4 = element("br");
    			add_location(br0, file$g, 48, 0, 878);
    			add_location(p0, file$g, 49, 0, 883);
    			add_location(p1, file$g, 53, 0, 1756);
    			add_location(p2, file$g, 54, 0, 1940);
    			add_location(br1, file$g, 55, 0, 2089);
    			add_location(br2, file$g, 56, 0, 2094);
    			add_location(div0, file$g, 57, 0, 2099);
    			add_location(div1, file$g, 58, 0, 2123);
    			add_location(br3, file$g, 59, 0, 2149);
    			add_location(br4, file$g, 60, 0, 2154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br4, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self) {
    	var cache = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    	var j = 0;

    	var ob = {
    		x: [],
    		push: function push(e) {
    			ob.x.push(parseInt(e.target.id.slice(1, 2), 10));

    			if (ob.x.length > 1) {
    				var d = exchange(ob.x[0], ob.x[1]);
    				cache.splice(j + 1, 0, d);
    				ob.x = [];
    				j += 1;
    				return cache;
    				var j = 0;
    			}
    		}
    	};

    	function exchange(k, n) {
    		var ar = cache[j].slice();
    		var a = ar[k];
    		ar[k] = ar[n];
    		ar[n] = a;
    		return ar;
    	}

    	var back = function back() {
    		if (j > 0) j = j -= 1; else j = j;
    	};

    	var forward = function forward() {
    		if (j + 1 < cache.length) j = j += 1; else j = j;
    	};

    	let visible = true;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("cache" in $$props) cache = $$props.cache;
    		if ("j" in $$props) j = $$props.j;
    		if ("ob" in $$props) ob = $$props.ob;
    		if ("back" in $$props) back = $$props.back;
    		if ("forward" in $$props) forward = $$props.forward;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	return [visible];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/Score.svelte generated by Svelte v3.16.7 */
    const file$h = "src/Score.svelte";

    // (5:0) {#if visible}
    function create_if_block$9(ctx) {
    	let div;
    	let br0;
    	let br1;
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\n GAME OF SCORE");
    			add_location(br0, file$h, 6, 1, 221);
    			add_location(br1, file$h, 6, 5, 225);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$h, 5, 1, 93);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(5:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let a0;
    	let t9;
    	let br1;
    	let br2;
    	let t10;
    	let span0;
    	let t12;
    	let a1;
    	let t14;
    	let br3;
    	let br4;
    	let t15;
    	let span1;
    	let t17;
    	let a2;
    	let t19;
    	let span2;
    	let t21;
    	let a3;
    	let t23;
    	let span3;
    	let t25;
    	let a4;
    	let t27;
    	let span4;
    	let t29;
    	let a5;
    	let t31;
    	let span5;
    	let t33;
    	let a6;
    	let t35;
    	let span6;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Score is an elaborate React project with a Haskell Wai WebSockets server on the back end. Users can form or join groups that play, exchange text messages, and maintain a todo list among themselves.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "You will be in the default group \"solo\" until you join or create a group with another name. You can change the user name assigned to you by entering a new name and password, separated by a comma (name,password).";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Game rules are available at the game site, which runs online here:";
    			t7 = space();
    			a0 = element("a");
    			a0.textContent = "Online game of Score>";
    			t9 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t10 = space();
    			span0 = element("span");
    			span0.textContent = "The code is here:";
    			t12 = space();
    			a1 = element("a");
    			a1.textContent = "Score Github Repository";
    			t14 = space();
    			br3 = element("br");
    			br4 = element("br");
    			t15 = space();
    			span1 = element("span");
    			span1.textContent = "I switched from";
    			t17 = space();
    			a2 = element("a");
    			a2.textContent = "Node";
    			t19 = space();
    			span2 = element("span");
    			span2.textContent = "to";
    			t21 = space();
    			a3 = element("a");
    			a3.textContent = "React";
    			t23 = space();
    			span3 = element("span");
    			span3.textContent = "and then, a few years ago, I switched to";
    			t25 = space();
    			a4 = element("a");
    			a4.textContent = "Cycle.js>";
    			t27 = space();
    			span4 = element("span");
    			span4.textContent = ". Recently, I started using";
    			t29 = space();
    			a5 = element("a");
    			a5.textContent = "Svelte";
    			t31 = space();
    			span5 = element("span");
    			span5.textContent = ". For me, writing and maintaining code became easier and easier as I went from React to Cycle.js to Svelte. Another important feature of Svelte is that";
    			t33 = space();
    			a6 = element("a");
    			a6.textContent = "substantially less code needs to be uploaded to browsers";
    			t35 = space();
    			span6 = element("span");
    			span6.textContent = ". I'm impressed.";
    			add_location(br0, file$h, 10, 0, 259);
    			add_location(p0, file$h, 12, 0, 265);
    			add_location(p1, file$h, 14, 0, 472);
    			add_location(p2, file$h, 16, 0, 694);
    			attr_dev(a0, "href", "http://game.schalk.site");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$h, 17, 0, 769);
    			add_location(br1, file$h, 18, 0, 849);
    			add_location(br2, file$h, 18, 4, 853);
    			add_location(span0, file$h, 19, 0, 858);
    			attr_dev(a1, "href", "https://github.com/dschalk/score2");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$h, 20, 0, 891);
    			add_location(br3, file$h, 21, 0, 983);
    			add_location(br4, file$h, 21, 4, 987);
    			add_location(span1, file$h, 22, 0, 992);
    			attr_dev(a2, "href", "https://nodejs.org/en/about/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$h, 23, 0, 1023);
    			add_location(span2, file$h, 24, 0, 1091);
    			attr_dev(a3, "href", "https://reactjs.org/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$h, 25, 0, 1109);
    			add_location(span3, file$h, 26, 0, 1170);
    			attr_dev(a4, "href", "https://cycle.js.org");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$h, 27, 0, 1226);
    			add_location(span4, file$h, 28, 0, 1291);
    			attr_dev(a5, "href", "https://svelte.dev/");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$h, 29, 0, 1333);
    			add_location(span5, file$h, 30, 0, 1394);
    			attr_dev(a6, "href", "https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/");
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$h, 31, 0, 1560);
    			add_location(span6, file$h, 32, 0, 1774);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, a1, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, a2, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, a3, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, span3, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, a4, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, span4, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, a5, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, span5, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, a6, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, span6, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(a3);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(span3);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(a4);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(span4);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(a5);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(span5);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(a6);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(span6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self) {
    	let visible = true;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	return [visible];
    }

    class Score extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Score",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.16.7 */

    const file$i = "node_modules/svelte-select/src/Item.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-1xfc328");
    			add_location(div, file$i, 60, 0, 1286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
    			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-1xfc328")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { isActive = false } = $$props;
    	let { isFirst = false } = $$props;
    	let { isHover = false } = $$props;
    	let { getOptionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let itemClasses = "";
    	const writable_props = ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => {
    		return {
    			isActive,
    			isFirst,
    			isHover,
    			getOptionLabel,
    			item,
    			filterText,
    			itemClasses
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
    			 {
    				const classes = [];

    				if (isActive) {
    					classes.push("active");
    				}

    				if (isFirst) {
    					classes.push("first");
    				}

    				if (isHover) {
    					classes.push("hover");
    				}

    				if (item.isGroupHeader) {
    					classes.push("groupHeader");
    				}

    				if (item.isGroupItem) {
    					classes.push("groupItem");
    				}

    				$$invalidate(3, itemClasses = classes.join(" "));
    			}
    		}
    	};

    	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$i, safe_not_equal, {
    			isActive: 4,
    			isFirst: 5,
    			isHover: 6,
    			getOptionLabel: 0,
    			item: 1,
    			filterText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFirst() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFirst(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isHover() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isHover(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.16.7 */
    const file$j = "node_modules/svelte-select/src/VirtualList.svelte";

    const get_default_slot_changes = dirty => ({
    	item: dirty & /*visible*/ 32,
    	i: dirty & /*visible*/ 32,
    	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
    });

    const get_default_slot_context = ctx => ({
    	item: /*row*/ ctx[23].data,
    	i: /*row*/ ctx[23].index,
    	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
    });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (158:2) {#each visible as row (row.index)}
    function create_each_block(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");

    			if (!default_slot) {
    				t0 = text("Missing template");
    			}

    			if (default_slot) default_slot.c();
    			t1 = space();
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_row, file$j, 158, 3, 3514);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (!default_slot) {
    				append_dev(svelte_virtual_list_row, t0);
    			}

    			if (default_slot) {
    				default_slot.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope, visible, hoverItemIndex*/ 262178) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(158:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let dispose;
    	let each_value = /*visible*/ ctx[5];
    	const get_key = ctx => /*row*/ ctx[23].index;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_contents, file$j, 156, 1, 3364);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-p6ehlv");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[22].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$j, 154, 0, 3222);
    			dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[20](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[21](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[22].bind(svelte_virtual_list_viewport));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const each_value = /*visible*/ ctx[5];
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();

    			if (!current || dirty & /*top*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 128) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[20](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[21](null);
    			svelte_virtual_list_viewport_resize_listener.cancel();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { items = undefined } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;
    	let height_map = [];
    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick();
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(10, end = i + 1);
    				await tick();
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(7, bottom = remaining * average_height);
    		height_map.length = items.length;
    		$$invalidate(2, viewport.scrollTop = 0, viewport);
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(9, start = i);
    				$$invalidate(6, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(7, bottom = remaining * average_height);

    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	}

    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(15, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, contents = $$value);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, viewport = $$value);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(4, viewport_height);
    	}

    	$$self.$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			items,
    			height,
    			itemHeight,
    			hoverItemIndex,
    			start,
    			end,
    			height_map,
    			rows,
    			viewport,
    			contents,
    			viewport_height,
    			visible,
    			mounted,
    			top,
    			bottom,
    			average_height
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(2, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(3, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(4, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(15, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(6, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
    			 $$invalidate(5, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 38928) {
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		hoverItemIndex,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		height_map,
    		rows,
    		mounted,
    		average_height,
    		refresh,
    		$$scope,
    		$$slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$j, safe_not_equal, {
    			items: 11,
    			height: 0,
    			itemHeight: 12,
    			hoverItemIndex: 1,
    			start: 9,
    			end: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.16.7 */
    const file$k = "node_modules/svelte-select/src/List.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (210:0) {#if isVirtualList}
    function create_if_block_3(ctx) {
    	let div;
    	let current;

    	const virtuallist = new VirtualList({
    			props: {
    				items: /*items*/ ctx[4],
    				itemHeight: /*itemHeight*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ item, i }) => ({ 34: item, 36: i }),
    						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(virtuallist.$$.fragment);
    			attr_dev(div, "class", "listContainer virtualList svelte-bqv8jo");
    			add_location(div, file$k, 210, 0, 5850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			/*div_binding*/ ctx[30](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
    			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

    			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(virtuallist);
    			/*div_binding*/ ctx[30](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(210:0) {#if isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (213:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot(ctx) {
    	let div;
    	let current;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[28](/*i*/ ctx[36], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[29](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$k, 214, 4, 5972);

    			dispose = [
    				listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    				listen_dev(div, "click", click_handler, false, false, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
    			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(213:2) <VirtualList {items} {itemHeight} let:item let:i>",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if !isVirtualList}
    function create_if_block$a(ctx) {
    	let div;
    	let current;
    	let each_value = /*items*/ ctx[4];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "listContainer svelte-bqv8jo");
    			add_location(div, file$k, 232, 0, 6482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			/*div_binding_1*/ ctx[33](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*items, getGroupHeaderLabel, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, hideEmptyState, noOptionsMessage*/ 32630) {
    				each_value = /*items*/ ctx[4];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!each_value.length && each_1_else) {
    				each_1_else.p(ctx, dirty);
    			} else if (!each_value.length) {
    				each_1_else = create_else_block_1(ctx);
    				each_1_else.c();
    				each_1_else.m(div, null);
    			} else if (each_1_else) {
    				each_1_else.d(1);
    				each_1_else = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			/*div_binding_1*/ ctx[33](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(232:0) {#if !isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideEmptyState*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:4) {#if !hideEmptyState}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noOptionsMessage*/ ctx[11]);
    			attr_dev(div, "class", "empty svelte-bqv8jo");
    			add_location(div, file$k, 255, 6, 7186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data_dev(t, /*noOptionsMessage*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(255:4) {#if !hideEmptyState}",
    		ctx
    	});

    	return block;
    }

    // (237:4) { :else }
    function create_else_block(ctx) {
    	let div;
    	let t;
    	let current;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1(...args) {
    		return /*mouseover_handler_1*/ ctx[31](/*i*/ ctx[36], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[32](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$k, 237, 4, 6696);

    			dispose = [
    				listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
    				listen_dev(div, "click", click_handler_1, false, false, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(237:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1(ctx) {
    	let div;
    	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "listGroupTitle svelte-bqv8jo");
    			add_location(div, file$k, 235, 6, 6616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(235:4) {#if item.isGroupHeader && !item.isSelectable}",
    		ctx
    	});

    	return block;
    }

    // (234:2) {#each items as item, i}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(234:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3(ctx);
    	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*isVirtualList*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*isVirtualList*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
    	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
    }

    function isItemFirst(itemIndex) {
    	return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
    	return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { items = [] } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		if (option) return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { optionIdentifier = "value" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { isMulti = false } = $$props;
    	let { activeItemIndex = 0 } = $$props;
    	let { filterText = "" } = $$props;
    	let isScrollingTimer = 0;
    	let isScrolling = false;
    	let prev_items;
    	let prev_activeItemIndex;
    	let prev_selectedValue;

    	onMount(() => {
    		if (items.length > 0 && !isMulti && selectedValue) {
    			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

    			if (_hoverItemIndex) {
    				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
    			}
    		}

    		scrollToActiveItem("active");

    		container.addEventListener(
    			"scroll",
    			() => {
    				clearTimeout(isScrollingTimer);

    				isScrollingTimer = setTimeout(
    					() => {
    						isScrolling = false;
    					},
    					100
    				);
    			},
    			false
    		);
    	});

    	onDestroy(() => {
    		
    	});

    	beforeUpdate(() => {
    		if (items !== prev_items && items.length > 0) {
    			$$invalidate(1, hoverItemIndex = 0);
    		}

    		prev_items = items;
    		prev_activeItemIndex = activeItemIndex;
    		prev_selectedValue = selectedValue;
    	});

    	function handleSelect(item) {
    		if (item.isCreator) return;
    		dispatch("itemSelected", item);
    	}

    	function handleHover(i) {
    		if (isScrolling) return;
    		$$invalidate(1, hoverItemIndex = i);
    	}

    	function handleClick(args) {
    		const { item, i, event } = args;
    		event.stopPropagation();
    		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

    		if (item.isCreator) {
    			dispatch("itemCreated", filterText);
    		} else {
    			$$invalidate(16, activeItemIndex = i);
    			$$invalidate(1, hoverItemIndex = i);
    			handleSelect(item);
    		}
    	}

    	function closeList() {
    		dispatch("closeList");
    	}

    	async function updateHoverItem(increment) {
    		if (isVirtualList) return;
    		let isNonSelectableItem = true;

    		while (isNonSelectableItem) {
    			if (increment > 0 && hoverItemIndex === items.length - 1) {
    				$$invalidate(1, hoverItemIndex = 0);
    			} else if (increment < 0 && hoverItemIndex === 0) {
    				$$invalidate(1, hoverItemIndex = items.length - 1);
    			} else {
    				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
    			}

    			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
    		}

    		await tick();
    		scrollToActiveItem("hover");
    	}

    	function handleKeyDown(e) {
    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				items.length && updateHoverItem(1);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				items.length && updateHoverItem(-1);
    				break;
    			case "Enter":
    				e.preventDefault();
    				if (items.length === 0) break;
    				const hoverItem = items[hoverItemIndex];
    				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
    					closeList();
    					break;
    				}
    				if (hoverItem.isCreator) {
    					dispatch("itemCreated", filterText);
    				} else {
    					$$invalidate(16, activeItemIndex = hoverItemIndex);
    					handleSelect(items[hoverItemIndex]);
    				}
    				break;
    			case "Tab":
    				e.preventDefault();
    				if (items.length === 0) break;
    				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
    				$$invalidate(16, activeItemIndex = hoverItemIndex);
    				handleSelect(items[hoverItemIndex]);
    				break;
    		}
    	}

    	function scrollToActiveItem(className) {
    		if (isVirtualList || !container) return;
    		let offsetBounding;
    		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

    		if (focusedElemBounding) {
    			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    		}

    		$$invalidate(0, container.scrollTop -= offsetBounding, container);
    	}

    	
    	

    	const writable_props = [
    		"container",
    		"Item",
    		"isVirtualList",
    		"items",
    		"getOptionLabel",
    		"getGroupHeaderLabel",
    		"itemHeight",
    		"hoverItemIndex",
    		"selectedValue",
    		"optionIdentifier",
    		"hideEmptyState",
    		"noOptionsMessage",
    		"isMulti",
    		"activeItemIndex",
    		"filterText"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = i => handleHover(i);
    	const click_handler = (item, i, event) => handleClick({ item, i, event });

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	const mouseover_handler_1 = i => handleHover(i);
    	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => {
    		return {
    			container,
    			Item: Item$1,
    			isVirtualList,
    			items,
    			getOptionLabel,
    			getGroupHeaderLabel,
    			itemHeight,
    			hoverItemIndex,
    			selectedValue,
    			optionIdentifier,
    			hideEmptyState,
    			noOptionsMessage,
    			isMulti,
    			activeItemIndex,
    			filterText,
    			isScrollingTimer,
    			isScrolling,
    			prev_items,
    			prev_activeItemIndex,
    			prev_selectedValue
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
    		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
    		if ("prev_items" in $$props) prev_items = $$props.prev_items;
    		if ("prev_activeItemIndex" in $$props) prev_activeItemIndex = $$props.prev_activeItemIndex;
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    	};

    	return [
    		container,
    		hoverItemIndex,
    		Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		filterText,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		activeItemIndex,
    		isMulti,
    		isScrollingTimer,
    		isScrolling,
    		prev_items,
    		prev_activeItemIndex,
    		prev_selectedValue,
    		dispatch,
    		handleSelect,
    		closeList,
    		updateHoverItem,
    		scrollToActiveItem,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$g,
    			create_fragment$k,
    			safe_not_equal,
    			{
    				container: 0,
    				Item: 2,
    				isVirtualList: 3,
    				items: 4,
    				getOptionLabel: 5,
    				getGroupHeaderLabel: 6,
    				itemHeight: 7,
    				hoverItemIndex: 1,
    				selectedValue: 8,
    				optionIdentifier: 9,
    				hideEmptyState: 10,
    				noOptionsMessage: 11,
    				isMulti: 17,
    				activeItemIndex: 16,
    				filterText: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get container() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.16.7 */

    const file$l = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$l(ctx) {
    	let div;
    	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "selection svelte-ch6bh7");
    			add_location(div, file$l, 13, 0, 210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { getSelectionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	const writable_props = ["getSelectionLabel", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	$$self.$capture_state = () => {
    		return { getSelectionLabel, item };
    	};

    	$$self.$inject_state = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	return [getSelectionLabel, item];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$l, safe_not_equal, { getSelectionLabel: 0, item: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get getSelectionLabel() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.16.7 */
    const file$m = "node_modules/svelte-select/src/MultiSelection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (22:2) {#if !isDisabled}
    function create_if_block$b(ctx) {
    	let div;
    	let svg;
    	let path;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$m, 24, 6, 806);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-rtzfov");
    			add_location(svg, file$m, 23, 4, 707);
    			attr_dev(div, "class", "multiSelectItem_clear svelte-rtzfov");
    			add_location(div, file$m, 22, 2, 623);
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(22:2) {#if !isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#each selectedValue as value, i}
    function create_each_block$2(ctx) {
    	let div1;
    	let div0;
    	let raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "";
    	let t0;
    	let t1;
    	let div1_class_value;
    	let if_block = !/*isDisabled*/ ctx[2] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "multiSelectItem_label svelte-rtzfov");
    			add_location(div0, file$m, 18, 2, 519);

    			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-rtzfov");

    			add_location(div1, file$m, 17, 0, 412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getSelectionLabel, selectedValue*/ 9 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "")) div0.innerHTML = raw_value;
    			if (!/*isDisabled*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-rtzfov")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:0) {#each selectedValue as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedValue*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSelectedValue, isDisabled, handleClear, getSelectionLabel, selectedValue*/ 31) {
    				each_value = /*selectedValue*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { selectedValue = [] } = $$props;
    	let { activeSelectedValue = undefined } = $$props;
    	let { isDisabled = false } = $$props;
    	let { getSelectionLabel = undefined } = $$props;

    	function handleClear(i, event) {
    		event.stopPropagation();
    		dispatch("multiItemClear", { i });
    	}

    	const writable_props = ["selectedValue", "activeSelectedValue", "isDisabled", "getSelectionLabel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, event) => handleClear(i, event);

    	$$self.$set = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	$$self.$capture_state = () => {
    		return {
    			selectedValue,
    			activeSelectedValue,
    			isDisabled,
    			getSelectionLabel
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	return [
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear,
    		dispatch,
    		click_handler
    	];
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$m, safe_not_equal, {
    			selectedValue: 0,
    			activeSelectedValue: 1,
    			isDisabled: 2,
    			getSelectionLabel: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelection",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get selectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSelectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSelectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }

    function debounce(func, wait, immediate) {
      let timeout;

      return function executedFunction() {
        let context = this;
        let args = arguments;
    	    
        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;
    	
        clearTimeout(timeout);

        timeout = setTimeout(later, wait);
    	
        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.16.7 */

    const { Object: Object_1 } = globals;
    const file$n = "node_modules/svelte-select/src/Select.svelte";

    // (573:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_4(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*MultiSelection*/ ctx[6];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selectedValue: /*selectedValue*/ ctx[2],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[11],
    				activeSelectedValue: /*activeSelectedValue*/ ctx[16],
    				isDisabled: /*isDisabled*/ ctx[8]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[21]);
    		switch_instance.$on("focus", /*handleFocus*/ ctx[24]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 4) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[2];
    			if (dirty[0] & /*getSelectionLabel*/ 2048) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[11];
    			if (dirty[0] & /*activeSelectedValue*/ 65536) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[16];
    			if (dirty[0] & /*isDisabled*/ 256) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[8];

    			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[21]);
    					switch_instance.$on("focus", /*handleFocus*/ ctx[24]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(573:2) {#if isMulti && selectedValue && selectedValue.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (595:2) {#if !isMulti && showSelectedItem }
    function create_if_block_3$1(ctx) {
    	let div;
    	let current;
    	let dispose;
    	var switch_value = /*Selection*/ ctx[5];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*selectedValue*/ ctx[2],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[11]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "selectedItem svelte-e3bo9s");
    			add_location(div, file$n, 595, 2, 15514);
    			dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[24], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 4) switch_instance_changes.item = /*selectedValue*/ ctx[2];
    			if (dirty[0] & /*getSelectionLabel*/ 2048) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[11];

    			if (switch_value !== (switch_value = /*Selection*/ ctx[5])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(595:2) {#if !isMulti && showSelectedItem }",
    		ctx
    	});

    	return block;
    }

    // (601:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_2$1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$n, 604, 6, 15917);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-e3bo9s");
    			add_location(svg, file$n, 602, 4, 15809);
    			attr_dev(div, "class", "clearSelect svelte-e3bo9s");
    			add_location(div, file$n, 601, 2, 15739);
    			dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[15]), false, true, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(601:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (611:2) {#if !isSearchable && !isDisabled && !isWaiting && (showSelectedItem && !isClearable || !showSelectedItem)}
    function create_if_block_1$1(ctx) {
    	let div;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$n, 613, 6, 16401);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "css-19bqh2r svelte-e3bo9s");
    			add_location(svg, file$n, 612, 4, 16304);
    			attr_dev(div, "class", "indicator svelte-e3bo9s");
    			add_location(div, file$n, 611, 2, 16276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(611:2) {#if !isSearchable && !isDisabled && !isWaiting && (showSelectedItem && !isClearable || !showSelectedItem)}",
    		ctx
    	});

    	return block;
    }

    // (620:2) {#if isWaiting}
    function create_if_block$c(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "spinner_path svelte-e3bo9s");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "currentColor");
    			attr_dev(circle, "stroke-width", "5");
    			attr_dev(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$n, 622, 6, 16835);
    			attr_dev(svg, "class", "spinner_icon svelte-e3bo9s");
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$n, 621, 4, 16780);
    			attr_dev(div, "class", "spinner svelte-e3bo9s");
    			add_location(div, file$n, 620, 2, 16754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(620:2) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div;
    	let t0;
    	let input_1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div_class_value;
    	let current;
    	let dispose;
    	let if_block0 = /*isMulti*/ ctx[7] && /*selectedValue*/ ctx[2] && /*selectedValue*/ ctx[2].length > 0 && create_if_block_4(ctx);

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[18],
    		{ placeholder: /*placeholderText*/ ctx[20] },
    		{ disabled: /*isDisabled*/ ctx[8] },
    		{ style: /*inputStyles*/ ctx[13] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	let if_block1 = !/*isMulti*/ ctx[7] && /*showSelectedItem*/ ctx[19] && create_if_block_3$1(ctx);
    	let if_block2 = /*showSelectedItem*/ ctx[19] && /*isClearable*/ ctx[14] && !/*isDisabled*/ ctx[8] && !/*isWaiting*/ ctx[4] && create_if_block_2$1(ctx);
    	let if_block3 = !/*isSearchable*/ ctx[12] && !/*isDisabled*/ ctx[8] && !/*isWaiting*/ ctx[4] && (/*showSelectedItem*/ ctx[19] && !/*isClearable*/ ctx[14] || !/*showSelectedItem*/ ctx[19]) && create_if_block_1$1(ctx);
    	let if_block4 = /*isWaiting*/ ctx[4] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input_1 = element("input");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-e3bo9s", true);
    			add_location(input_1, file$n, 584, 2, 15261);
    			attr_dev(div, "class", div_class_value = "" + (/*containerClasses*/ ctx[17] + " " + (/*hasError*/ ctx[9] ? "hasError" : "") + " svelte-e3bo9s"));
    			attr_dev(div, "style", /*containerStyles*/ ctx[10]);
    			add_location(div, file$n, 569, 0, 14835);

    			dispose = [
    				listen_dev(window, "click", /*handleWindowClick*/ ctx[25], false, false, false),
    				listen_dev(window, "keydown", /*handleKeyDown*/ ctx[23], false, false, false),
    				listen_dev(window, "resize", /*getPosition*/ ctx[22], false, false, false),
    				listen_dev(input_1, "focus", /*handleFocus*/ ctx[24], false, false, false),
    				listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[68]),
    				listen_dev(div, "click", /*handleClick*/ ctx[26], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, input_1);
    			/*input_1_binding*/ ctx[67](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[3]);
    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t2);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t3);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t4);
    			if (if_block4) if_block4.m(div, null);
    			/*div_binding*/ ctx[69](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*isMulti*/ ctx[7] && /*selectedValue*/ ctx[2] && /*selectedValue*/ ctx[2].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			set_attributes(input_1, get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 262144 && /*_inputAttributes*/ ctx[18],
    				dirty[0] & /*placeholderText*/ 1048576 && ({ placeholder: /*placeholderText*/ ctx[20] }),
    				dirty[0] & /*isDisabled*/ 256 && ({ disabled: /*isDisabled*/ ctx[8] }),
    				dirty[0] & /*inputStyles*/ 8192 && ({ style: /*inputStyles*/ ctx[13] })
    			]));

    			if (dirty[0] & /*filterText*/ 8 && input_1.value !== /*filterText*/ ctx[3]) {
    				set_input_value(input_1, /*filterText*/ ctx[3]);
    			}

    			toggle_class(input_1, "svelte-e3bo9s", true);

    			if (!/*isMulti*/ ctx[7] && /*showSelectedItem*/ ctx[19]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*showSelectedItem*/ ctx[19] && /*isClearable*/ ctx[14] && !/*isDisabled*/ ctx[8] && !/*isWaiting*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(div, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!/*isSearchable*/ ctx[12] && !/*isDisabled*/ ctx[8] && !/*isWaiting*/ ctx[4] && (/*showSelectedItem*/ ctx[19] && !/*isClearable*/ ctx[14] || !/*showSelectedItem*/ ctx[19])) {
    				if (!if_block3) {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					if_block3.m(div, t4);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*isWaiting*/ ctx[4]) {
    				if (!if_block4) {
    					if_block4 = create_if_block$c(ctx);
    					if_block4.c();
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (!current || dirty[0] & /*containerClasses, hasError*/ 131584 && div_class_value !== (div_class_value = "" + (/*containerClasses*/ ctx[17] + " " + (/*hasError*/ ctx[9] ? "hasError" : "") + " svelte-e3bo9s"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 1024) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			/*input_1_binding*/ ctx[67](null);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			/*div_binding*/ ctx[69](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { input = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { Selection: Selection$1 = Selection } = $$props;
    	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
    	let { isMulti = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isCreatable = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let { placeholder = "Select..." } = $$props;
    	let { items = [] } = $$props;
    	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
    	let { groupBy = undefined } = $$props;
    	let { groupFilter = groups => groups } = $$props;
    	let { isGroupHeaderSelectable = false } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { optionIdentifier = "value" } = $$props;
    	let { loadOptions = undefined } = $$props;
    	let { hasError = false } = $$props;
    	let { containerStyles = "" } = $$props;

    	let { getSelectionLabel = option => {
    		if (option) return option.label;
    	} } = $$props;

    	let { createGroupHeaderItem = groupValue => {
    		return { value: groupValue, label: groupValue };
    	} } = $$props;

    	let { createItem = filterText => {
    		return { value: filterText, label: filterText };
    	} } = $$props;

    	let { isSearchable = true } = $$props;
    	let { inputStyles = "" } = $$props;
    	let { isClearable = true } = $$props;
    	let { isWaiting = false } = $$props;
    	let { listPlacement = "auto" } = $$props;
    	let { listOpen = false } = $$props;
    	let { list = undefined } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { loadOptionsInterval = 300 } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { filteredItems = [] } = $$props;
    	let { inputAttributes = {} } = $$props;
    	let { listAutoWidth = true } = $$props;
    	let target;
    	let activeSelectedValue;
    	let _items = [];
    	let originalItemsClone;
    	let containerClasses = "";
    	let prev_selectedValue;
    	let prev_listOpen;
    	let prev_filterText;
    	let prev_isFocused;
    	let prev_filteredItems;

    	async function resetFilter() {
    		await tick();
    		$$invalidate(3, filterText = "");
    	}

    	const getItems = debounce(
    		async () => {
    			$$invalidate(4, isWaiting = true);
    			$$invalidate(28, items = await loadOptions(filterText));
    			$$invalidate(4, isWaiting = false);
    			$$invalidate(27, isFocused = true);
    			$$invalidate(29, listOpen = true);
    		},
    		loadOptionsInterval
    	);

    	let _inputAttributes = {};

    	beforeUpdate(() => {
    		if (isMulti && selectedValue && selectedValue.length > 1) {
    			checkSelectedValueForDuplicates();
    		}

    		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
    			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
    			if (checkSelectedValueForDuplicates()) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (container && listOpen !== prev_listOpen) {
    			if (listOpen) {
    				loadList();
    			} else {
    				removeList();
    			}
    		}

    		if (filterText !== prev_filterText) {
    			if (filterText.length > 0) {
    				$$invalidate(27, isFocused = true);
    				$$invalidate(29, listOpen = true);

    				if (loadOptions) {
    					getItems();
    				} else {
    					loadList();
    					$$invalidate(29, listOpen = true);

    					if (isMulti) {
    						$$invalidate(16, activeSelectedValue = undefined);
    					}
    				}
    			} else {
    				setList([]);
    			}

    			if (list) {
    				list.$set({ filterText });
    			}
    		}

    		if (isFocused !== prev_isFocused) {
    			if (isFocused || listOpen) {
    				handleFocus();
    			} else {
    				resetFilter();
    				if (input) input.blur();
    			}
    		}

    		if (prev_filteredItems !== filteredItems) {
    			let _filteredItems = [...filteredItems];

    			if (isCreatable && filterText) {
    				const itemToCreate = {
    					...createItem(filterText),
    					isCreator: true
    				};

    				const existingItemWithFilterValue = _filteredItems.find(item => {
    					return item[optionIdentifier] === itemToCreate[optionIdentifier];
    				});

    				let existingSelectionWithFilterValue;

    				if (selectedValue) {
    					if (isMulti) {
    						existingSelectionWithFilterValue = selectedValue.find(selection => {
    							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
    						});
    					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
    						existingSelectionWithFilterValue = selectedValue;
    					}
    				}

    				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
    					_filteredItems = [..._filteredItems, itemToCreate];
    				}
    			}

    			setList(_filteredItems);
    		}

    		prev_selectedValue = selectedValue;
    		prev_listOpen = listOpen;
    		prev_filterText = filterText;
    		prev_isFocused = isFocused;
    		prev_filteredItems = filteredItems;
    	});

    	function checkSelectedValueForDuplicates() {
    		let noDuplicates = true;

    		if (selectedValue) {
    			const ids = [];
    			const uniqueValues = [];

    			selectedValue.forEach(val => {
    				if (!ids.includes(val[optionIdentifier])) {
    					ids.push(val[optionIdentifier]);
    					uniqueValues.push(val);
    				} else {
    					noDuplicates = false;
    				}
    			});

    			$$invalidate(2, selectedValue = uniqueValues);
    		}

    		return noDuplicates;
    	}

    	async function setList(items) {
    		await tick();
    		if (list) return list.$set({ items });
    		if (loadOptions && items.length > 0) loadList();
    	}

    	function handleMultiItemClear(event) {
    		const { detail } = event;
    		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

    		if (selectedValue.length === 1) {
    			$$invalidate(2, selectedValue = undefined);
    		} else {
    			$$invalidate(2, selectedValue = selectedValue.filter(item => {
    				return item !== itemToRemove;
    			}));
    		}

    		dispatch("clear", itemToRemove);
    		getPosition();
    	}

    	async function getPosition() {
    		await tick();
    		if (!target || !container) return;
    		const { top, height, width } = container.getBoundingClientRect();
    		target.style["min-width"] = `${width}px`;
    		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
    		target.style.left = "0";

    		if (listPlacement === "top") {
    			target.style.bottom = `${height + 5}px`;
    		} else {
    			target.style.top = `${height + 5}px`;
    		}

    		target = target;

    		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
    			target.style.top = ``;
    			target.style.bottom = `${height + 5}px`;
    		}

    		target.style.visibility = "";
    	}

    	function handleKeyDown(e) {
    		if (!isFocused) return;

    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				$$invalidate(29, listOpen = true);
    				$$invalidate(16, activeSelectedValue = undefined);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				$$invalidate(29, listOpen = true);
    				$$invalidate(16, activeSelectedValue = undefined);
    				break;
    			case "Tab":
    				if (!listOpen) $$invalidate(27, isFocused = false);
    				break;
    			case "Backspace":
    				if (!isMulti || filterText.length > 0) return;
    				if (isMulti && selectedValue && selectedValue.length > 0) {
    					handleMultiItemClear(activeSelectedValue !== undefined
    					? activeSelectedValue
    					: selectedValue.length - 1);

    					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

    					$$invalidate(16, activeSelectedValue = selectedValue.length > activeSelectedValue
    					? activeSelectedValue - 1
    					: undefined);
    				}
    				break;
    			case "ArrowLeft":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0) return;
    				if (activeSelectedValue === undefined) {
    					$$invalidate(16, activeSelectedValue = selectedValue.length - 1);
    				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
    					$$invalidate(16, activeSelectedValue -= 1);
    				}
    				break;
    			case "ArrowRight":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
    				if (activeSelectedValue === selectedValue.length - 1) {
    					$$invalidate(16, activeSelectedValue = undefined);
    				} else if (activeSelectedValue < selectedValue.length - 1) {
    					$$invalidate(16, activeSelectedValue += 1);
    				}
    				break;
    		}
    	}

    	function handleFocus() {
    		$$invalidate(27, isFocused = true);
    		if (input) input.focus();
    	}

    	function removeList() {
    		resetFilter();
    		$$invalidate(16, activeSelectedValue = undefined);
    		if (!list) return;
    		list.$destroy();
    		$$invalidate(30, list = undefined);
    		if (!target) return;
    		if (target.parentNode) target.parentNode.removeChild(target);
    		target = undefined;
    		$$invalidate(30, list);
    		target = target;
    	}

    	function handleWindowClick(event) {
    		if (!container) return;
    		if (container.contains(event.target)) return;
    		$$invalidate(27, isFocused = false);
    		$$invalidate(29, listOpen = false);
    		$$invalidate(16, activeSelectedValue = undefined);
    		if (input) input.blur();
    	}

    	function handleClick() {
    		if (isDisabled) return;
    		$$invalidate(27, isFocused = true);
    		$$invalidate(29, listOpen = !listOpen);
    	}

    	function handleClear() {
    		$$invalidate(2, selectedValue = undefined);
    		$$invalidate(29, listOpen = false);
    		dispatch("clear", selectedValue);
    		handleFocus();
    	}

    	async function loadList() {
    		await tick();
    		if (target && list) return;

    		const data = {
    			Item: Item$1,
    			filterText,
    			optionIdentifier,
    			noOptionsMessage,
    			hideEmptyState,
    			isVirtualList,
    			selectedValue,
    			isMulti,
    			getGroupHeaderLabel,
    			items: filteredItems
    		};

    		if (getOptionLabel) {
    			data.getOptionLabel = getOptionLabel;
    		}

    		target = document.createElement("div");

    		Object.assign(target.style, {
    			position: "absolute",
    			"z-index": 2,
    			"visibility": "hidden"
    		});

    		$$invalidate(30, list);
    		target = target;
    		if (container) container.appendChild(target);
    		$$invalidate(30, list = new List({ target, props: data }));

    		list.$on("itemSelected", event => {
    			const { detail } = event;

    			if (detail) {
    				const item = Object.assign({}, detail);

    				if (isMulti) {
    					$$invalidate(2, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
    				} else {
    					$$invalidate(2, selectedValue = item);
    				}

    				resetFilter();
    				($$invalidate(2, selectedValue), $$invalidate(41, optionIdentifier));

    				setTimeout(() => {
    					$$invalidate(29, listOpen = false);
    					$$invalidate(16, activeSelectedValue = undefined);
    				});
    			}
    		});

    		list.$on("itemCreated", event => {
    			const { detail } = event;

    			if (isMulti) {
    				$$invalidate(2, selectedValue = selectedValue || []);
    				$$invalidate(2, selectedValue = [...selectedValue, createItem(detail)]);
    			} else {
    				$$invalidate(2, selectedValue = createItem(detail));
    			}

    			$$invalidate(3, filterText = "");
    			$$invalidate(29, listOpen = false);
    			$$invalidate(16, activeSelectedValue = undefined);
    			resetFilter();
    		});

    		list.$on("closeList", () => {
    			$$invalidate(29, listOpen = false);
    		});

    		($$invalidate(30, list), target = target);
    		getPosition();
    	}

    	onMount(() => {
    		if (isFocused) input.focus();
    		if (listOpen) loadList();

    		if (items && items.length > 0) {
    			$$invalidate(53, originalItemsClone = JSON.stringify(items));
    		}

    		if (selectedValue) {
    			if (isMulti) {
    				$$invalidate(2, selectedValue = selectedValue.map(item => {
    					if (typeof item === "string") {
    						return { value: item, label: item };
    					} else {
    						return item;
    					}
    				}));
    			}
    		}
    	});

    	onDestroy(() => {
    		removeList();
    	});

    	const writable_props = [
    		"container",
    		"input",
    		"Item",
    		"Selection",
    		"MultiSelection",
    		"isMulti",
    		"isDisabled",
    		"isCreatable",
    		"isFocused",
    		"selectedValue",
    		"filterText",
    		"placeholder",
    		"items",
    		"itemFilter",
    		"groupBy",
    		"groupFilter",
    		"isGroupHeaderSelectable",
    		"getGroupHeaderLabel",
    		"getOptionLabel",
    		"optionIdentifier",
    		"loadOptions",
    		"hasError",
    		"containerStyles",
    		"getSelectionLabel",
    		"createGroupHeaderItem",
    		"createItem",
    		"isSearchable",
    		"inputStyles",
    		"isClearable",
    		"isWaiting",
    		"listPlacement",
    		"listOpen",
    		"list",
    		"isVirtualList",
    		"loadOptionsInterval",
    		"noOptionsMessage",
    		"hideEmptyState",
    		"filteredItems",
    		"inputAttributes",
    		"listAutoWidth"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, input = $$value);
    		});
    	}

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate(3, filterText);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(32, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(5, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(6, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(7, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(8, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(33, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(27, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(2, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(3, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(34, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(28, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(35, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(36, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(37, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(38, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(39, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(40, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(41, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(42, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(9, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(10, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(11, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(43, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(44, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(12, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(13, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(14, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(4, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(45, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(29, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(30, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(46, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(47, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(48, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(49, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(31, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(50, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(51, listAutoWidth = $$props.listAutoWidth);
    	};

    	$$self.$capture_state = () => {
    		return {
    			container,
    			input,
    			Item: Item$1,
    			Selection: Selection$1,
    			MultiSelection: MultiSelection$1,
    			isMulti,
    			isDisabled,
    			isCreatable,
    			isFocused,
    			selectedValue,
    			filterText,
    			placeholder,
    			items,
    			itemFilter,
    			groupBy,
    			groupFilter,
    			isGroupHeaderSelectable,
    			getGroupHeaderLabel,
    			getOptionLabel,
    			optionIdentifier,
    			loadOptions,
    			hasError,
    			containerStyles,
    			getSelectionLabel,
    			createGroupHeaderItem,
    			createItem,
    			isSearchable,
    			inputStyles,
    			isClearable,
    			isWaiting,
    			listPlacement,
    			listOpen,
    			list,
    			isVirtualList,
    			loadOptionsInterval,
    			noOptionsMessage,
    			hideEmptyState,
    			filteredItems,
    			inputAttributes,
    			listAutoWidth,
    			target,
    			activeSelectedValue,
    			_items,
    			originalItemsClone,
    			containerClasses,
    			prev_selectedValue,
    			prev_listOpen,
    			prev_filterText,
    			prev_isFocused,
    			prev_filteredItems,
    			_inputAttributes,
    			showSelectedItem,
    			placeholderText
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(32, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(5, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(6, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(7, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(8, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(33, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(27, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(2, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(3, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(34, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(28, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(35, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(36, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(37, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(38, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(39, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(40, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(41, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(42, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(9, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(10, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(11, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(43, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(44, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(12, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(13, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(14, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(4, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(45, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(29, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(30, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(46, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(47, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(48, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(49, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(31, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(50, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(51, listAutoWidth = $$props.listAutoWidth);
    		if ("target" in $$props) target = $$props.target;
    		if ("activeSelectedValue" in $$props) $$invalidate(16, activeSelectedValue = $$props.activeSelectedValue);
    		if ("_items" in $$props) $$invalidate(60, _items = $$props._items);
    		if ("originalItemsClone" in $$props) $$invalidate(53, originalItemsClone = $$props.originalItemsClone);
    		if ("containerClasses" in $$props) $$invalidate(17, containerClasses = $$props.containerClasses);
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    		if ("prev_listOpen" in $$props) prev_listOpen = $$props.prev_listOpen;
    		if ("prev_filterText" in $$props) prev_filterText = $$props.prev_filterText;
    		if ("prev_isFocused" in $$props) prev_isFocused = $$props.prev_isFocused;
    		if ("prev_filteredItems" in $$props) prev_filteredItems = $$props.prev_filteredItems;
    		if ("_inputAttributes" in $$props) $$invalidate(18, _inputAttributes = $$props._inputAttributes);
    		if ("showSelectedItem" in $$props) $$invalidate(19, showSelectedItem = $$props.showSelectedItem);
    		if ("placeholderText" in $$props) $$invalidate(20, placeholderText = $$props.placeholderText);
    	};

    	let showSelectedItem;
    	let placeholderText;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*containerClasses, isMulti, isDisabled, isFocused*/ 134349184) {
    			 {
    				$$invalidate(17, containerClasses = `selectContainer`);
    				$$invalidate(17, containerClasses += isMulti ? " multiSelect" : "");
    				$$invalidate(17, containerClasses += isDisabled ? " disabled" : "");
    				$$invalidate(17, containerClasses += isFocused ? " focused" : "");
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 4 | $$self.$$.dirty[1] & /*optionIdentifier*/ 1024) {
    			 {
    				if (typeof selectedValue === "string") {
    					$$invalidate(2, selectedValue = {
    						[optionIdentifier]: selectedValue,
    						label: selectedValue
    					});
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 12) {
    			 $$invalidate(19, showSelectedItem = selectedValue && filterText.length === 0);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 4 | $$self.$$.dirty[1] & /*placeholder*/ 8) {
    			 $$invalidate(20, placeholderText = selectedValue ? "" : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*isSearchable*/ 4096 | $$self.$$.dirty[1] & /*inputAttributes*/ 524288) {
    			 {
    				$$invalidate(18, _inputAttributes = Object.assign(inputAttributes, {
    					autocomplete: "off",
    					autocorrect: "off",
    					spellcheck: false
    				}));

    				if (!isSearchable) {
    					$$invalidate(18, _inputAttributes.readonly = true, _inputAttributes);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*items, filterText, isMulti, selectedValue*/ 268435596 | $$self.$$.dirty[1] & /*loadOptions, originalItemsClone, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 4202224) {
    			 {
    				let _filteredItems;
    				let _items = items;

    				if (items && items.length > 0 && typeof items[0] !== "object") {
    					_items = items.map((item, index) => {
    						return { index, value: item, label: item };
    					});
    				}

    				if (loadOptions && filterText.length === 0 && originalItemsClone) {
    					_filteredItems = JSON.parse(originalItemsClone);
    					_items = JSON.parse(originalItemsClone);
    				} else {
    					_filteredItems = loadOptions
    					? filterText.length === 0 ? [] : _items
    					: _items.filter(item => {
    							let keepItem = true;

    							if (isMulti && selectedValue) {
    								keepItem = !selectedValue.find(value => {
    									return value[optionIdentifier] === item[optionIdentifier];
    								});
    							}

    							if (!keepItem) return false;
    							if (filterText.length < 1) return true;
    							return itemFilter(getOptionLabel(item, filterText), filterText, item);
    						});
    				}

    				if (groupBy) {
    					const groupValues = [];
    					const groups = {};

    					_filteredItems.forEach(item => {
    						const groupValue = groupBy(item);

    						if (!groupValues.includes(groupValue)) {
    							groupValues.push(groupValue);
    							groups[groupValue] = [];

    							if (groupValue) {
    								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
    									id: groupValue,
    									isGroupHeader: true,
    									isSelectable: isGroupHeaderSelectable
    								}));
    							}
    						}

    						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
    					});

    					const sortedGroupedItems = [];

    					groupFilter(groupValues).forEach(groupValue => {
    						sortedGroupedItems.push(...groups[groupValue]);
    					});

    					$$invalidate(31, filteredItems = sortedGroupedItems);
    				} else {
    					$$invalidate(31, filteredItems = _filteredItems);
    				}
    			}
    		}
    	};

    	return [
    		container,
    		input,
    		selectedValue,
    		filterText,
    		isWaiting,
    		Selection$1,
    		MultiSelection$1,
    		isMulti,
    		isDisabled,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		handleClear,
    		activeSelectedValue,
    		containerClasses,
    		_inputAttributes,
    		showSelectedItem,
    		placeholderText,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		isFocused,
    		items,
    		listOpen,
    		list,
    		filteredItems,
    		Item$1,
    		isCreatable,
    		placeholder,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		createGroupHeaderItem,
    		createItem,
    		listPlacement,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		inputAttributes,
    		listAutoWidth,
    		target,
    		originalItemsClone,
    		prev_selectedValue,
    		prev_listOpen,
    		prev_filterText,
    		prev_isFocused,
    		prev_filteredItems,
    		dispatch,
    		_items,
    		resetFilter,
    		getItems,
    		checkSelectedValueForDuplicates,
    		setList,
    		removeList,
    		loadList,
    		input_1_binding,
    		input_1_input_handler,
    		div_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$j,
    			create_fragment$n,
    			safe_not_equal,
    			{
    				container: 0,
    				input: 1,
    				Item: 32,
    				Selection: 5,
    				MultiSelection: 6,
    				isMulti: 7,
    				isDisabled: 8,
    				isCreatable: 33,
    				isFocused: 27,
    				selectedValue: 2,
    				filterText: 3,
    				placeholder: 34,
    				items: 28,
    				itemFilter: 35,
    				groupBy: 36,
    				groupFilter: 37,
    				isGroupHeaderSelectable: 38,
    				getGroupHeaderLabel: 39,
    				getOptionLabel: 40,
    				optionIdentifier: 41,
    				loadOptions: 42,
    				hasError: 9,
    				containerStyles: 10,
    				getSelectionLabel: 11,
    				createGroupHeaderItem: 43,
    				createItem: 44,
    				isSearchable: 12,
    				inputStyles: 13,
    				isClearable: 14,
    				isWaiting: 4,
    				listPlacement: 45,
    				listOpen: 29,
    				list: 30,
    				isVirtualList: 46,
    				loadOptionsInterval: 47,
    				noOptionsMessage: 48,
    				hideEmptyState: 49,
    				filteredItems: 31,
    				inputAttributes: 50,
    				listAutoWidth: 51,
    				handleClear: 15
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get container() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Selection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Selection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get MultiSelection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set MultiSelection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isCreatable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupBy() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupBy(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGroupHeaderSelectable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGroupHeaderSelectable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptions() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptions(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasError() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasError(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createGroupHeaderItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createGroupHeaderItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearchable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearchable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isWaiting() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isWaiting(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listPlacement() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listPlacement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listOpen() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listOpen(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptionsInterval() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptionsInterval(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filteredItems() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filteredItems(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAttributes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAttributes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listAutoWidth() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listAutoWidth(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[15];
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Snack.svelte generated by Svelte v3.16.7 */

    function create_fragment$o(ctx) {
    	let updating_selectedValue;
    	let current;

    	function select_selectedValue_binding(value) {
    		/*select_selectedValue_binding*/ ctx[2].call(null, value);
    	}

    	let select_props = { items: /*items*/ ctx[1] };

    	if (/*selectedValue*/ ctx[0] !== void 0) {
    		select_props.selectedValue = /*selectedValue*/ ctx[0];
    	}

    	const select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const select_changes = {};

    			if (!updating_selectedValue && dirty & /*selectedValue*/ 1) {
    				updating_selectedValue = true;
    				select_changes.selectedValue = /*selectedValue*/ ctx[0];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let items = [
    		{ value: "chocolate", label: "Chocolate" },
    		{ value: "pizza", label: "Pizza" },
    		{ value: "cake", label: "Cake" },
    		{ value: "chips", label: "Chips" },
    		{ value: "ice-cream", label: "Ice Cream" }
    	];

    	let selectedValue = undefined;

    	function select_selectedValue_binding(value) {
    		selectedValue = value;
    		$$invalidate(0, selectedValue);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    	};

    	return [selectedValue, items, select_selectedValue_binding];
    }

    class Snack extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Snack",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/Cargo.svelte generated by Svelte v3.16.7 */
    const file$o = "src/Cargo.svelte";

    // (18:0) {#if visible}
    function create_if_block$d(ctx) {
    	let div;
    	let br0;
    	let br1;
    	let t0;
    	let div_transition;
    	let t1;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t0 = text("\nFUNCTIONAL PROGRAMMING WITH JAVASCRIPT\n ");
    			t1 = text("}");
    			add_location(br0, file$o, 19, 1, 323);
    			add_location(br1, file$o, 19, 5, 327);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$o, 18, 1, 196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(18:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let t0;
    	let p0;
    	let p1;
    	let t3;
    	let a;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let p4;
    	let t11;
    	let p5;
    	let t13;
    	let h3;
    	let t15;
    	let pre;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "\"Functional programming\" means different things to different people. Applied to JavaScript, I wish it meant making good use JavaScript functions. \n\n";
    			p1 = element("p");
    			p1.textContent = "Mimicking features of the Haskell programming language vaguely hoping Haskell's reliability, ease of maintenance, and other conveniences will come your way reminds me of the cargo cults. \"The name derives from the belief which began among Melanesians in the late 19th and early 20th centuries that various ritualistic acts such as the building of an airplane runway will result in the appearance of material wealth, particularly highly desirable Western goods (i.e., \"cargo\"), via Western airplanes.\"";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Cargo Cult";
    			t5 = text(", \n\n\n");
    			p2 = element("p");
    			p2.textContent = "According to the Wikipedia article \"Cargo Cult\", \"a cargo cult is a belief system among members of a relatively undeveloped society in which adherents practice superstitious rituals hoping to bring modern goods supplied by a more technologically advanced society. https://en.wikipedia.org/wiki/Cargo_cult The article goes on to say, \"The name derives from the belief which began among Melanesians in the late 19th and early 20th centuries that various ritualistic acts such as the building of an airplane runway will result in the appearance of material wealth, particularly highly desirable Western goods (i.e., \"cargo\"), via Western airplanes.\" citing Burridge, Kenelm (1969). New Heaven, New Earth: A study of Millenarian Activities. London: Basil Blackwell. p. 48 and Lindstrom, Lamont (1993). Cargo Cult: Strange Stories of desire from Melanesia and beyond. Honolulu: University of Hawaii Press.";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Haskell programming language code has, in my experience, been wonderfully reliable and maintainable. The WebSockets server supporting two games and one of the monad demonstrations is a good example. Hoping to bring some of this Haskell goodness into my JavaScript code, I toyed with what I call \"cargo cult functional JavaScript\" for a time. Without thinking things through intelligently, I imposed strict type checking, referential transparency, and immutability on my JavaScript code in situations where these things needlessly caused clutter, inefficiency, code bloat, and obfuscation. I invented all sorts of \"monads\" along with monad transformers and mechanisms for lifting values into composite monadic types.";
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "Now that I have abandoned the folly of mindlessly mimicking features of functional programming languages, I can console myself with the thought that I wasn't the first and I wasn't the last JavaScript programmer to got lost in this manner. Strict typing where it serves no useful purpose and insisting on immutability where all it does is polute memory with useless intermediate values is trendy these days.";
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "Code where functions might colide over mutable global variables leads programmers to religeously avoid mutable global variables. I'm using the Svelte framework for this project, and my numerous modules are quite small. Mutable global variables can't cause problems because I have no modules or heirarchies of nested modules in which clashes might occur. Were I to constrain my creativity by following \"best practices\" regarding global variables, I would be engaging in another form of cargo cult coding, mindlessly micking forms that have no value.";
    			t13 = space();
    			h3 = element("h3");
    			h3.textContent = "References";
    			t15 = space();
    			pre = element("pre");
    			pre.textContent = "Cargo Cult Programming video presentation\nhttps://www.youtube.com/watch?v=nm22duia0jU\n\nCargo Cult Science Richard Feynman' s 1974 video\nhttps://www.brainpickings.org/2012/06/08/richard-\n  feynman-caltech-cargo-cult-science/s";
    			add_location(p0, file$o, 24, 0, 413);
    			add_location(p1, file$o, 26, 0, 565);
    			attr_dev(a, "href", "https://en.wikipedia.org/wiki/Cargo_cult");
    			attr_dev(a, ",", "");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$o, 27, 0, 1076);
    			add_location(p2, file$o, 30, 0, 1165);
    			add_location(p3, file$o, 32, 0, 2074);
    			add_location(p4, file$o, 35, 0, 2799);
    			add_location(p5, file$o, 36, 0, 3215);
    			attr_dev(h3, "class", "svelte-hw6ke3");
    			add_location(h3, file$o, 39, 0, 3774);
    			add_location(pre, file$o, 41, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, pre, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self) {
    	let visible = true;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	return [visible];
    }

    class Cargo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cargo",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.16.7 */
    const file$p = "src/Blog.svelte";

    // (147:0) {#if j === 0}
    function create_if_block_19(ctx) {
    	let current;
    	const home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(147:0) {#if j === 0}",
    		ctx
    	});

    	return block;
    }

    // (150:0) {#if j === 1}
    function create_if_block_18(ctx) {
    	let current;
    	const monad = new Monad_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(monad.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(monad, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monad.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(monad, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(150:0) {#if j === 1}",
    		ctx
    	});

    	return block;
    }

    // (153:0) {#if j === 2}
    function create_if_block_17(ctx) {
    	let current;
    	const monad2 = new Monad2({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(monad2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(monad2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monad2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(monad2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(153:0) {#if j === 2}",
    		ctx
    	});

    	return block;
    }

    // (156:0) {#if j === 3}
    function create_if_block_16(ctx) {
    	let current;
    	const monad3 = new Monad3({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(monad3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(monad3, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monad3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(monad3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(156:0) {#if j === 3}",
    		ctx
    	});

    	return block;
    }

    // (159:0) {#if j === 4}
    function create_if_block_15(ctx) {
    	let current;
    	const bugs = new Bugs({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bugs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bugs, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bugs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bugs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bugs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(159:0) {#if j === 4}",
    		ctx
    	});

    	return block;
    }

    // (162:0) {#if j === 5}
    function create_if_block_14(ctx) {
    	let current;
    	const matrix = new Matrix({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(matrix.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(matrix, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(matrix.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(matrix.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(matrix, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(162:0) {#if j === 5}",
    		ctx
    	});

    	return block;
    }

    // (165:0) {#if j === 7}
    function create_if_block_13(ctx) {
    	let current;
    	const transducer = new Transducer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(transducer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(transducer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transducer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transducer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transducer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(165:0) {#if j === 7}",
    		ctx
    	});

    	return block;
    }

    // (168:0) {#if j === 8}
    function create_if_block_12(ctx) {
    	let current;
    	const toggletheme = new ToggleTheme({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(toggletheme.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggletheme, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggletheme.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggletheme.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggletheme, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(168:0) {#if j === 8}",
    		ctx
    	});

    	return block;
    }

    // (171:0) {#if j === 9}
    function create_if_block_11(ctx) {
    	let current;
    	const haskell = new Haskell({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(haskell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(haskell, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(haskell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(haskell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(haskell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(171:0) {#if j === 9}",
    		ctx
    	});

    	return block;
    }

    // (174:0) {#if j === 10}
    function create_if_block_10(ctx) {
    	let current;
    	const score = new Score({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(score.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(score, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(score.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(score.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(score, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(174:0) {#if j === 10}",
    		ctx
    	});

    	return block;
    }

    // (177:0) {#if j === 11}
    function create_if_block_9(ctx) {
    	let current;
    	const toggleclass = new ToggleClass({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(toggleclass.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggleclass, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggleclass.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggleclass.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggleclass, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(177:0) {#if j === 11}",
    		ctx
    	});

    	return block;
    }

    // (180:0) {#if j === 20}
    function create_if_block_8(ctx) {
    	let current;
    	const cow = new Cow({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cow, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(180:0) {#if j === 20}",
    		ctx
    	});

    	return block;
    }

    // (183:0) {#if j === 21}
    function create_if_block_7(ctx) {
    	let current;
    	const stor = new Stor({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(stor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stor, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(183:0) {#if j === 21}",
    		ctx
    	});

    	return block;
    }

    // (186:0) {#if j === 22}
    function create_if_block_6(ctx) {
    	let current;
    	const snack = new Snack({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(snack.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(snack, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(snack.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(snack.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(snack, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(186:0) {#if j === 22}",
    		ctx
    	});

    	return block;
    }

    // (189:0) {#if j === 23}
    function create_if_block_5(ctx) {
    	let current;
    	const cargo = new Cargo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cargo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cargo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cargo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cargo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cargo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(189:0) {#if j === 23}",
    		ctx
    	});

    	return block;
    }

    // (192:0) {#if j === 40}
    function create_if_block_4$1(ctx) {
    	let current;
    	const drop1 = new Drop1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(drop1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drop1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drop1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drop1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drop1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(192:0) {#if j === 40}",
    		ctx
    	});

    	return block;
    }

    // (195:0) {#if j === 41}
    function create_if_block_3$2(ctx) {
    	let current;
    	const drop2 = new Drop2({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(drop2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drop2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drop2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drop2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drop2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(195:0) {#if j === 41}",
    		ctx
    	});

    	return block;
    }

    // (198:0) {#if j === 42}
    function create_if_block_2$2(ctx) {
    	let current;
    	const drop3 = new Drop3({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(drop3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drop3, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drop3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drop3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drop3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(198:0) {#if j === 42}",
    		ctx
    	});

    	return block;
    }

    // (201:0) {#if j === 43}
    function create_if_block_1$2(ctx) {
    	let current;
    	const drop4 = new Drop4({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(drop4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drop4, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drop4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drop4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drop4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(201:0) {#if j === 43}",
    		ctx
    	});

    	return block;
    }

    // (204:0) {#if j === 44}
    function create_if_block$e(ctx) {
    	let current;
    	const drop5 = new Drop5({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(drop5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drop5, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drop5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drop5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drop5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(204:0) {#if j === 44}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let br0;
    	let t0;
    	let div5;
    	let div0;
    	let t2;
    	let div4;
    	let div1;
    	let t4;
    	let div2;
    	let t6;
    	let div3;
    	let t8;
    	let div9;
    	let div8;
    	let div6;
    	let t10;
    	let div7;
    	let t12;
    	let br1;
    	let br2;
    	let br3;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let t26;
    	let t27;
    	let t28;
    	let t29;
    	let t30;
    	let t31;
    	let t32;
    	let t33;
    	let br4;
    	let br5;
    	let t34;
    	let t35;
    	let pre;
    	let current;
    	let dispose;
    	let if_block0 = /*j*/ ctx[0] === 0 && create_if_block_19(ctx);
    	let if_block1 = /*j*/ ctx[0] === 1 && create_if_block_18(ctx);
    	let if_block2 = /*j*/ ctx[0] === 2 && create_if_block_17(ctx);
    	let if_block3 = /*j*/ ctx[0] === 3 && create_if_block_16(ctx);
    	let if_block4 = /*j*/ ctx[0] === 4 && create_if_block_15(ctx);
    	let if_block5 = /*j*/ ctx[0] === 5 && create_if_block_14(ctx);
    	let if_block6 = /*j*/ ctx[0] === 7 && create_if_block_13(ctx);
    	let if_block7 = /*j*/ ctx[0] === 8 && create_if_block_12(ctx);
    	let if_block8 = /*j*/ ctx[0] === 9 && create_if_block_11(ctx);
    	let if_block9 = /*j*/ ctx[0] === 10 && create_if_block_10(ctx);
    	let if_block10 = /*j*/ ctx[0] === 11 && create_if_block_9(ctx);
    	let if_block11 = /*j*/ ctx[0] === 20 && create_if_block_8(ctx);
    	let if_block12 = /*j*/ ctx[0] === 21 && create_if_block_7(ctx);
    	let if_block13 = /*j*/ ctx[0] === 22 && create_if_block_6(ctx);
    	let if_block14 = /*j*/ ctx[0] === 23 && create_if_block_5(ctx);
    	let if_block15 = /*j*/ ctx[0] === 40 && create_if_block_4$1(ctx);
    	let if_block16 = /*j*/ ctx[0] === 41 && create_if_block_3$2(ctx);
    	let if_block17 = /*j*/ ctx[0] === 42 && create_if_block_2$2(ctx);
    	let if_block18 = /*j*/ ctx[0] === 43 && create_if_block_1$2(ctx);
    	let if_block19 = /*j*/ ctx[0] === 44 && create_if_block$e(ctx);
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = "Table of Contents";
    			t2 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "A Simple Monad";
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "A Messaging Monad";
    			t6 = space();
    			div3 = element("div");
    			div3.textContent = "A Promises Monad";
    			t8 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			div6.textContent = "DAVID SCHALK's BLOG";
    			t10 = space();
    			div7 = element("div");
    			div7.textContent = "Escape from a Cargo Cult and Other Adventures";
    			t12 = space();
    			br1 = element("br");
    			br2 = element("br");
    			br3 = element("br");
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			if (if_block1) if_block1.c();
    			t15 = space();
    			if (if_block2) if_block2.c();
    			t16 = space();
    			if (if_block3) if_block3.c();
    			t17 = space();
    			if (if_block4) if_block4.c();
    			t18 = space();
    			if (if_block5) if_block5.c();
    			t19 = space();
    			if (if_block6) if_block6.c();
    			t20 = space();
    			if (if_block7) if_block7.c();
    			t21 = space();
    			if (if_block8) if_block8.c();
    			t22 = space();
    			if (if_block9) if_block9.c();
    			t23 = space();
    			if (if_block10) if_block10.c();
    			t24 = space();
    			if (if_block11) if_block11.c();
    			t25 = space();
    			if (if_block12) if_block12.c();
    			t26 = space();
    			if (if_block13) if_block13.c();
    			t27 = space();
    			if (if_block14) if_block14.c();
    			t28 = space();
    			if (if_block15) if_block15.c();
    			t29 = space();
    			if (if_block16) if_block16.c();
    			t30 = space();
    			if (if_block17) if_block17.c();
    			t31 = space();
    			if (if_block18) if_block18.c();
    			t32 = space();
    			if (if_block19) if_block19.c();
    			t33 = space();
    			br4 = element("br");
    			br5 = element("br");
    			t34 = space();
    			if (default_slot) default_slot.c();
    			t35 = space();
    			pre = element("pre");
    			pre.textContent = "...";
    			add_location(br0, file$p, 79, 0, 1553);
    			attr_dev(div0, "class", "dropbtn svelte-yyhr28");
    			add_location(div0, file$p, 84, 2, 1667);
    			attr_dev(div1, "class", "menu svelte-yyhr28");
    			add_location(div1, file$p, 86, 0, 1745);
    			attr_dev(div2, "class", "menu svelte-yyhr28");
    			add_location(div2, file$p, 87, 0, 1810);
    			attr_dev(div3, "class", "menu svelte-yyhr28");
    			add_location(div3, file$p, 88, 0, 1887);
    			attr_dev(div4, "class", "dropdown-content svelte-yyhr28");
    			add_location(div4, file$p, 85, 2, 1714);
    			attr_dev(div5, "class", "dropdown svelte-yyhr28");
    			add_location(div5, file$p, 83, 0, 1642);
    			set_style(div6, "font-size", "40px");
    			set_style(div6, "color", "#FFD700");
    			set_style(div6, "text-align", "center");
    			add_location(div6, file$p, 142, 0, 4541);
    			set_style(div7, "font-size", "24px");
    			set_style(div7, "color", "#FFCCAA");
    			set_style(div7, "font-style", "italic");
    			set_style(div7, "text-align", "center");
    			add_location(div7, file$p, 143, 0, 4634);
    			add_location(br1, file$p, 144, 0, 4774);
    			add_location(br2, file$p, 144, 4, 4778);
    			add_location(br3, file$p, 144, 8, 4782);
    			set_style(div8, "margin-left", "25%");
    			set_style(div8, "margin-right", "25%");
    			add_location(div8, file$p, 140, 0, 4487);
    			add_location(br4, file$p, 207, 0, 5424);
    			add_location(br5, file$p, 207, 4, 5428);
    			attr_dev(div9, "class", "margins");
    			add_location(div9, file$p, 138, 8, 4464);
    			add_location(pre, file$p, 210, 0, 5449);

    			dispose = [
    				listen_dev(div1, "click", /*click_handler_2*/ ctx[5], false, false, false),
    				listen_dev(div2, "click", /*click_handler*/ ctx[4], false, false, false),
    				listen_dev(div2, "click", /*click_handler_3*/ ctx[6], false, false, false),
    				listen_dev(div3, "click", /*click_handler_1*/ ctx[3], false, false, false),
    				listen_dev(div3, "click", /*click_handler_4*/ ctx[7], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div8, t12);
    			append_dev(div8, br1);
    			append_dev(div8, br2);
    			append_dev(div8, br3);
    			append_dev(div8, t13);
    			if (if_block0) if_block0.m(div8, null);
    			append_dev(div8, t14);
    			if (if_block1) if_block1.m(div8, null);
    			append_dev(div8, t15);
    			if (if_block2) if_block2.m(div8, null);
    			append_dev(div8, t16);
    			if (if_block3) if_block3.m(div8, null);
    			append_dev(div8, t17);
    			if (if_block4) if_block4.m(div8, null);
    			append_dev(div8, t18);
    			if (if_block5) if_block5.m(div8, null);
    			append_dev(div8, t19);
    			if (if_block6) if_block6.m(div8, null);
    			append_dev(div8, t20);
    			if (if_block7) if_block7.m(div8, null);
    			append_dev(div8, t21);
    			if (if_block8) if_block8.m(div8, null);
    			append_dev(div8, t22);
    			if (if_block9) if_block9.m(div8, null);
    			append_dev(div8, t23);
    			if (if_block10) if_block10.m(div8, null);
    			append_dev(div8, t24);
    			if (if_block11) if_block11.m(div8, null);
    			append_dev(div8, t25);
    			if (if_block12) if_block12.m(div8, null);
    			append_dev(div8, t26);
    			if (if_block13) if_block13.m(div8, null);
    			append_dev(div8, t27);
    			if (if_block14) if_block14.m(div8, null);
    			append_dev(div8, t28);
    			if (if_block15) if_block15.m(div8, null);
    			append_dev(div8, t29);
    			if (if_block16) if_block16.m(div8, null);
    			append_dev(div8, t30);
    			if (if_block17) if_block17.m(div8, null);
    			append_dev(div8, t31);
    			if (if_block18) if_block18.m(div8, null);
    			append_dev(div8, t32);
    			if (if_block19) if_block19.m(div8, null);
    			append_dev(div9, t33);
    			append_dev(div9, br4);
    			append_dev(div9, br5);
    			append_dev(div9, t34);

    			if (default_slot) {
    				default_slot.m(div9, null);
    			}

    			insert_dev(target, t35, anchor);
    			insert_dev(target, pre, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*j*/ ctx[0] === 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_19(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div8, t14);
    				} else {
    					transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_18(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div8, t15);
    				} else {
    					transition_in(if_block1, 1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 2) {
    				if (!if_block2) {
    					if_block2 = create_if_block_17(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div8, t16);
    				} else {
    					transition_in(if_block2, 1);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 3) {
    				if (!if_block3) {
    					if_block3 = create_if_block_16(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div8, t17);
    				} else {
    					transition_in(if_block3, 1);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 4) {
    				if (!if_block4) {
    					if_block4 = create_if_block_15(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div8, t18);
    				} else {
    					transition_in(if_block4, 1);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 5) {
    				if (!if_block5) {
    					if_block5 = create_if_block_14(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div8, t19);
    				} else {
    					transition_in(if_block5, 1);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 7) {
    				if (!if_block6) {
    					if_block6 = create_if_block_13(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div8, t20);
    				} else {
    					transition_in(if_block6, 1);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 8) {
    				if (!if_block7) {
    					if_block7 = create_if_block_12(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div8, t21);
    				} else {
    					transition_in(if_block7, 1);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 9) {
    				if (!if_block8) {
    					if_block8 = create_if_block_11(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div8, t22);
    				} else {
    					transition_in(if_block8, 1);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 10) {
    				if (!if_block9) {
    					if_block9 = create_if_block_10(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div8, t23);
    				} else {
    					transition_in(if_block9, 1);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 11) {
    				if (!if_block10) {
    					if_block10 = create_if_block_9(ctx);
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div8, t24);
    				} else {
    					transition_in(if_block10, 1);
    				}
    			} else if (if_block10) {
    				group_outros();

    				transition_out(if_block10, 1, 1, () => {
    					if_block10 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 20) {
    				if (!if_block11) {
    					if_block11 = create_if_block_8(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(div8, t25);
    				} else {
    					transition_in(if_block11, 1);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 21) {
    				if (!if_block12) {
    					if_block12 = create_if_block_7(ctx);
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(div8, t26);
    				} else {
    					transition_in(if_block12, 1);
    				}
    			} else if (if_block12) {
    				group_outros();

    				transition_out(if_block12, 1, 1, () => {
    					if_block12 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 22) {
    				if (!if_block13) {
    					if_block13 = create_if_block_6(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(div8, t27);
    				} else {
    					transition_in(if_block13, 1);
    				}
    			} else if (if_block13) {
    				group_outros();

    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 23) {
    				if (!if_block14) {
    					if_block14 = create_if_block_5(ctx);
    					if_block14.c();
    					transition_in(if_block14, 1);
    					if_block14.m(div8, t28);
    				} else {
    					transition_in(if_block14, 1);
    				}
    			} else if (if_block14) {
    				group_outros();

    				transition_out(if_block14, 1, 1, () => {
    					if_block14 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 40) {
    				if (!if_block15) {
    					if_block15 = create_if_block_4$1(ctx);
    					if_block15.c();
    					transition_in(if_block15, 1);
    					if_block15.m(div8, t29);
    				} else {
    					transition_in(if_block15, 1);
    				}
    			} else if (if_block15) {
    				group_outros();

    				transition_out(if_block15, 1, 1, () => {
    					if_block15 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 41) {
    				if (!if_block16) {
    					if_block16 = create_if_block_3$2(ctx);
    					if_block16.c();
    					transition_in(if_block16, 1);
    					if_block16.m(div8, t30);
    				} else {
    					transition_in(if_block16, 1);
    				}
    			} else if (if_block16) {
    				group_outros();

    				transition_out(if_block16, 1, 1, () => {
    					if_block16 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 42) {
    				if (!if_block17) {
    					if_block17 = create_if_block_2$2(ctx);
    					if_block17.c();
    					transition_in(if_block17, 1);
    					if_block17.m(div8, t31);
    				} else {
    					transition_in(if_block17, 1);
    				}
    			} else if (if_block17) {
    				group_outros();

    				transition_out(if_block17, 1, 1, () => {
    					if_block17 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 43) {
    				if (!if_block18) {
    					if_block18 = create_if_block_1$2(ctx);
    					if_block18.c();
    					transition_in(if_block18, 1);
    					if_block18.m(div8, t32);
    				} else {
    					transition_in(if_block18, 1);
    				}
    			} else if (if_block18) {
    				group_outros();

    				transition_out(if_block18, 1, 1, () => {
    					if_block18 = null;
    				});

    				check_outros();
    			}

    			if (/*j*/ ctx[0] === 44) {
    				if (!if_block19) {
    					if_block19 = create_if_block$e(ctx);
    					if_block19.c();
    					transition_in(if_block19, 1);
    					if_block19.m(div8, null);
    				} else {
    					transition_in(if_block19, 1);
    				}
    			} else if (if_block19) {
    				group_outros();

    				transition_out(if_block19, 1, 1, () => {
    					if_block19 = null;
    				});

    				check_outros();
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(if_block14);
    			transition_in(if_block15);
    			transition_in(if_block16);
    			transition_in(if_block17);
    			transition_in(if_block18);
    			transition_in(if_block19);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(if_block14);
    			transition_out(if_block15);
    			transition_out(if_block16);
    			transition_out(if_block17);
    			transition_out(if_block18);
    			transition_out(if_block19);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (if_block15) if_block15.d();
    			if (if_block16) if_block16.d();
    			if (if_block17) if_block17.d();
    			if (if_block18) if_block18.d();
    			if (if_block19) if_block19.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(pre);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { j = 0 } = $$props;
    	const writable_props = ["j"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Blog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler_2 = () => $$invalidate(0, j = 1);
    	const click_handler_3 = () => $$invalidate(0, j = 2);
    	const click_handler_4 = () => $$invalidate(0, j = 3);

    	$$self.$set = $$props => {
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { j };
    	};

    	$$self.$inject_state = $$props => {
    		if ("j" in $$props) $$invalidate(0, j = $$props.j);
    	};

    	return [
    		j,
    		$$scope,
    		$$slots,
    		click_handler_1,
    		click_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$q, safe_not_equal, { j: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blog",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get j() {
    		throw new Error("<Blog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set j(value) {
    		throw new Error("<Blog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.7 */

    function create_fragment$r(ctx) {
    	let current;
    	const blog = new Blog({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(blog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(blog, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(blog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(blog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(blog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
