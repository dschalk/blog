
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
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
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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

    function fade(node, { delay = 0, duration = 400 }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Monad1.svelte generated by Svelte v3.9.1 */

    const file = "src/Monad1.svelte";

    // (83:0) {#if visible}
    function create_if_block(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A SIMPLE LITTLE MONAD";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file, 83, 0, 2046);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var t0, br, t1, p0, t3, pre0, t4, t5, p1, t7, pre1, t8, t9, p2, t11, pre2, t12, t13, input, t14, h30, t15, t16, t17, h31, t18, t19, t20, h32, t21, t22, t23, h33, t24, t25, t26, h34, t27, t28_value = ctx.a("stop") + "", t28, t29, t30, h35, t31, t32_value = ctx.b("stop") + "", t32, t33, t34, h36, t35, t36, t37, h2, t38, t39_value = demo() + "", t39, current, dispose;

    	var if_block =  create_if_block();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "The following definition of \"Monad\" exhibits a basic feature of the more complex definitions that follow: When _f() is returned and there is some value \"v\" in front of it, _f(v) is evaluated and _f is returned again. When, at last, there is nothing in front of _f, _f just waits for further instructions. It can resume activity where it left off, start a branch without altering the current value, or return its array.";
    			t3 = space();
    			pre0 = element("pre");
    			t4 = text(ctx.code1);
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "For example:";
    			t7 = space();
    			pre1 = element("pre");
    			t8 = text(ctx.code2);
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Here's an anonymous monad performing computations and returning results along with a string.";
    			t11 = space();
    			pre2 = element("pre");
    			t12 = text(ctx.code3);
    			t13 = space();
    			input = element("input");
    			t14 = space();
    			h30 = element("h3");
    			t15 = text("res1 = ");
    			t16 = text(ctx.res1);
    			t17 = space();
    			h31 = element("h3");
    			t18 = text("res2 = ");
    			t19 = text(ctx.res2);
    			t20 = space();
    			h32 = element("h3");
    			t21 = text("res3 = ");
    			t22 = text(ctx.res3);
    			t23 = space();
    			h33 = element("h3");
    			t24 = text("res4 = ");
    			t25 = text(ctx.res4);
    			t26 = space();
    			h34 = element("h3");
    			t27 = text("a(\"stop\") returns [");
    			t28 = text(t28_value);
    			t29 = text("]");
    			t30 = space();
    			h35 = element("h3");
    			t31 = text("b(\"stop\") returns [");
    			t32 = text(t32_value);
    			t33 = text("]");
    			t34 = space();
    			h36 = element("h3");
    			t35 = text("The variable \"result\" is: ");
    			t36 = text(ctx.result);
    			t37 = space();
    			h2 = element("h2");
    			t38 = text("demo3:");
    			t39 = text(t39_value);
    			add_location(br, file, 88, 0, 2207);
    			add_location(p0, file, 89, 0, 2212);
    			add_location(pre0, file, 90, 0, 2639);
    			add_location(p1, file, 91, 0, 2658);
    			add_location(pre1, file, 93, 0, 2680);
    			add_location(p2, file, 95, 0, 2700);
    			add_location(pre2, file, 96, 0, 2801);
    			attr(input, "type", "number");
    			add_location(input, file, 98, 0, 2821);
    			add_location(h30, file, 102, 0, 2869);
    			add_location(h31, file, 103, 0, 2892);
    			add_location(h32, file, 104, 0, 2915);
    			add_location(h33, file, 105, 0, 2938);
    			add_location(h34, file, 107, 0, 2962);
    			add_location(h35, file, 108, 0, 3003);
    			add_location(h36, file, 110, 0, 3045);
    			add_location(h2, file, 112, 0, 3090);
    			dispose = listen(input, "input", demo);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br, anchor);
    			insert(target, t1, anchor);
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t4);
    			insert(target, t5, anchor);
    			insert(target, p1, anchor);
    			insert(target, t7, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t8);
    			insert(target, t9, anchor);
    			insert(target, p2, anchor);
    			insert(target, t11, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t12);
    			insert(target, t13, anchor);
    			insert(target, input, anchor);
    			insert(target, t14, anchor);
    			insert(target, h30, anchor);
    			append(h30, t15);
    			append(h30, t16);
    			insert(target, t17, anchor);
    			insert(target, h31, anchor);
    			append(h31, t18);
    			append(h31, t19);
    			insert(target, t20, anchor);
    			insert(target, h32, anchor);
    			append(h32, t21);
    			append(h32, t22);
    			insert(target, t23, anchor);
    			insert(target, h33, anchor);
    			append(h33, t24);
    			append(h33, t25);
    			insert(target, t26, anchor);
    			insert(target, h34, anchor);
    			append(h34, t27);
    			append(h34, t28);
    			append(h34, t29);
    			insert(target, t30, anchor);
    			insert(target, h35, anchor);
    			append(h35, t31);
    			append(h35, t32);
    			append(h35, t33);
    			insert(target, t34, anchor);
    			insert(target, h36, anchor);
    			append(h36, t35);
    			append(h36, t36);
    			insert(target, t37, anchor);
    			insert(target, h2, anchor);
    			append(h2, t38);
    			append(h2, t39);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (!current || changed.res1) {
    				set_data(t16, ctx.res1);
    			}

    			if (!current || changed.res2) {
    				set_data(t19, ctx.res2);
    			}

    			if (!current || changed.res3) {
    				set_data(t22, ctx.res3);
    			}

    			if (!current || changed.res4) {
    				set_data(t25, ctx.res4);
    			}

    			if ((!current || changed.a) && t28_value !== (t28_value = ctx.a("stop") + "")) {
    				set_data(t28, t28_value);
    			}

    			if ((!current || changed.b) && t32_value !== (t32_value = ctx.b("stop") + "")) {
    				set_data(t32, t32_value);
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
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(br);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(pre0);
    				detach(t5);
    				detach(p1);
    				detach(t7);
    				detach(pre1);
    				detach(t9);
    				detach(p2);
    				detach(t11);
    				detach(pre2);
    				detach(t13);
    				detach(input);
    				detach(t14);
    				detach(h30);
    				detach(t17);
    				detach(h31);
    				detach(t20);
    				detach(h32);
    				detach(t23);
    				detach(h33);
    				detach(t26);
    				detach(h34);
    				detach(t30);
    				detach(h35);
    				detach(t34);
    				detach(h36);
    				detach(t37);
    				detach(h2);
    			}

    			dispose();
    		}
    	};
    }

    let s = "stop";

    function Monad () { 
    var ar = [];
    return function _f (func) {
      if (func === "stop") return ar
      if (typeof func !== "function") {
        ar = ar.concat(func); 
        return _f
      } 
      else  {
        ar = ar.concat(func(ar.slice(-1)[0]));
        return _f;
      }
    };
    }

    function demo(num) {
    var a = Monad();
    var  b = Monad();
    var res1 = a(3)(v=>v**3)(v=>v+3)(v=>v*v)(s);    
    var res2  = b(a("stop"))(v=>v/100)(Math.sqrt)(Math.floor)(s);  
    var res3 = a(Math.floor(a(v=>v/((a(s)[0]*10)))(s))) (v=>v+4)(v=>v*3) (s);   
    var res4 = b(v=>v*2)(v=>v*7) (s);    
    return [[res1],[res2],[res3],[res4]];
    }

    function instance($$self, $$props, $$invalidate) {
    	

    var { a = Monad(), b = Monad(), res1 = a(3)(v=>v**3)(v=>v+3)(v=>v*v)(s) } = $$props;    
    var { res2  = b(a("stop"))(v=>v/100)(Math.sqrt)(Math.floor)(s) } = $$props;  
    var { res3 = a(Math.floor(a(v=>v/((a(s)[0]*10)))(s))) (v=>v+4)(v=>v*3) (s) } = $$props;   
    var { res4 = b(v=>v*2)(v=>v*7) (s) } = $$props;

    var result =  Monad()(4)(v=>v**4)(Math.sqrt)(x=>x-2)
    (v => "And the answer is: " + v*3)('stop');

    var code1 = `function Monad () { 
  var ar = []
  return function _f (func) {
    if (func === "stop") return ar.slice();
    if (typeof func !== "function") {
      ar = ar.concat(func); 
      return _f
    } 
    else  {
      ar = ar.concat(func(ar.slice(-1)[0]));
      return _f;
    }
  };
}`;

    var code2 =  `
let a = Monad()
let  b = Monad();
let res1 = a(3)(v=>v**3)(v=>v+3)(v=>v*v)(s)    // [3,27,30,900]
let res2  = b(a("stop"))(v=>v/100)(Math.sqrt)(s);  // [3,27,30,900,9,3]
let res3 = a(v=>v/90)(v=>v+4)(v=>v*3) (s)         // [3,27,30,900,10,14,42]
let res4 = b(v=>v*2)(v=>v*7) (s)                  // [3,27,30,900,9,3,6,42] `;

    var result = Monad()(4)(v=>v**4)(Math.sqrt)(x=>x-2)
        (v => "And the answer is: " + v*3)('stop');

     var code3 = `Monad()(4)(v=>v**4)(Math.sqrt)(x=>x-2)(v => "And the answer is: " + v*3)('stop')}`;

    	const writable_props = ['a', 'b', 'res1', 'res2', 'res3', 'res4'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Monad1> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('a' in $$props) $$invalidate('a', a = $$props.a);
    		if ('b' in $$props) $$invalidate('b', b = $$props.b);
    		if ('res1' in $$props) $$invalidate('res1', res1 = $$props.res1);
    		if ('res2' in $$props) $$invalidate('res2', res2 = $$props.res2);
    		if ('res3' in $$props) $$invalidate('res3', res3 = $$props.res3);
    		if ('res4' in $$props) $$invalidate('res4', res4 = $$props.res4);
    	};

    	return {
    		a,
    		b,
    		res1,
    		res2,
    		res3,
    		res4,
    		result,
    		code1,
    		code2,
    		code3
    	};
    }

    class Monad1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["a", "b", "res1", "res2", "res3", "res4"]);
    	}

    	get a() {
    		throw new Error("<Monad1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a(value) {
    		throw new Error("<Monad1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get b() {
    		throw new Error("<Monad1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set b(value) {
    		throw new Error("<Monad1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get res1() {
    		throw new Error("<Monad1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set res1(value) {
    		throw new Error("<Monad1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get res2() {
    		throw new Error("<Monad1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set res2(value) {
    		throw new Error("<Monad1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get res3() {
    		throw new Error("<Monad1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set res3(value) {
    		throw new Error("<Monad1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get res4() {
    		throw new Error("<Monad1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set res4(value) {
    		throw new Error("<Monad1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Monad2.svelte generated by Svelte v3.9.1 */

    const file$1 = "src/Monad2.svelte";

    // (312:0) {#if j === 2}
    function create_if_block$1(ctx) {
    	var div_1, div_1_transition, current;

    	return {
    		c: function create() {
    			div_1 = element("div");
    			div_1.textContent = "ASYNCHRONOUSLY MODIFIED STATE";
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "38px");
    			add_location(div_1, file$1, 312, 0, 5862);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div_1, anchor);
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
    			if (detaching) {
    				detach(div_1);
    				if (div_1_transition) div_1_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var br0, br1, t0, t1, br2, t2, p0, t4, br3, t5, div0, t7, div1, t8_value = ctx.O.c0 + "", t8, t9, t10_value = ctx.O.c1 + "", t10, t11, t12_value = ctx.O.c2 + "", t12, t13, br4, t14, span0, t16, span1, br5, t17, t18_value = ctx.O.d0.join(', ') + "", t18, t19, br6, t20, t21_value = ctx.O.d1.join(', ') + "", t21, t22, br7, t23, t24_value = ctx.O.d2.join(', ') + "", t24, t25, t26, br8, t27, br9, t28, button, pre0, t29, t30, br10, br11, br12, t31, div2, t32, t33_value = ctx.O.d0 + "", t33, t34, t35_value = ctx.O.c0 + "", t35, t36, span2, t37_value = ctx.O.d0.reduce(func) == ctx.O.c0 + "", t37, t38, br13, t39, t40_value = ctx.O.d1 + "", t40, t41, t42_value = ctx.O.c1 + "", t42, t43, span3, t44_value = ctx.O.d1.reduce(func_1) == ctx.O.c1 + "", t44, t45, br14, t46, t47_value = ctx.O.d2 + "", t47, t48, t49_value = ctx.O.c2 + "", t49, t50, span4, t51_value = ctx.O.d2.reduce(func_2) == ctx.O.c2 + "", t51, t52, br15, t53, p1, t55, pre1, t56, t57, p2, pre2, t59, t60, p3, pre3, t62, t63, p4, t65, br16, t66, span5, t68, a, current, dispose;

    	var if_block =  create_if_block$1();

    	return {
    		c: function create() {
    			br0 = element("br");
    			br1 = element("br");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			br2 = element("br");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Clicking the button below sends three requests to the Haskell WebSockets server asking for quasi-random integers. As the numbers come in from the server, they are placed in the object named \"O\" with keys prefixed by \"c\", and then forwarded to a web worker. The worker returns arrays containing the prime factors of the numbers it recieves. These are placed in \"O\" with keys prefixed by \"d\".";
    			t4 = space();
    			br3 = element("br");
    			t5 = space();
    			div0 = element("div");
    			div0.textContent = "The WebSockets server sent these numbers (now at O.c0, O.c1, and O.c2):";
    			t7 = space();
    			div1 = element("div");
    			t8 = text(t8_value);
    			t9 = text(", ");
    			t10 = text(t10_value);
    			t11 = text(", and ");
    			t12 = text(t12_value);
    			t13 = space();
    			br4 = element("br");
    			t14 = space();
    			span0 = element("span");
    			span0.textContent = "The web worker sent these arrays of prime factors (now at O.d0, O.d1, and O.d2):";
    			t16 = space();
    			span1 = element("span");
    			br5 = element("br");
    			t17 = text(" [");
    			t18 = text(t18_value);
    			t19 = text("] ");
    			br6 = element("br");
    			t20 = text(" [");
    			t21 = text(t21_value);
    			t22 = text("] ");
    			br7 = element("br");
    			t23 = text(" [");
    			t24 = text(t24_value);
    			t25 = text("]");
    			t26 = space();
    			br8 = element("br");
    			t27 = space();
    			br9 = element("br");
    			t28 = space();
    			button = element("button");
    			pre0 = element("pre");
    			t29 = text(ctx.candle);
    			t30 = space();
    			br10 = element("br");
    			br11 = element("br");
    			br12 = element("br");
    			t31 = space();
    			div2 = element("div");
    			t32 = text("[");
    			t33 = text(t33_value);
    			t34 = text("].reduce((a,b) => a*b) === ");
    			t35 = text(t35_value);
    			t36 = text(": ");
    			span2 = element("span");
    			t37 = text(t37_value);
    			t38 = space();
    			br13 = element("br");
    			t39 = text("\n[");
    			t40 = text(t40_value);
    			t41 = text("].reduce((a,b) => a*b) === ");
    			t42 = text(t42_value);
    			t43 = text(": ");
    			span3 = element("span");
    			t44 = text(t44_value);
    			t45 = space();
    			br14 = element("br");
    			t46 = text("\n[");
    			t47 = text(t47_value);
    			t48 = text("].reduce((a,b) => a*b) ==  = ");
    			t49 = text(t49_value);
    			t50 = text(": ");
    			span4 = element("span");
    			t51 = text(t51_value);
    			t52 = space();
    			br15 = element("br");
    			t53 = space();
    			p1 = element("p");
    			p1.textContent = "In this demonstration, each monad's array of computed values is preserved as an attribute of an object named O. Here's the definition of \"Monad\" used in this module:";
    			t55 = space();
    			pre1 = element("pre");
    			t56 = text(ctx.mon);
    			t57 = space();
    			p2 = element("p");
    			p2.textContent = "Messages are sent to the Haskell WebSockets server requesting pseudo-random numbers between 1 and the integer specified at the end of the request. On the server, randomR from the System.Random library produces a number which is sent to the browser with prefix \"BE#$42\". Messages from the server are parsed in socket.onmessage. If the prefix is \"BE#$42\", the payload (a number) is sent to worker_OO, which sends back the number's prime decomposition.\n";
    			pre2 = element("pre");
    			t59 = text(ctx.onmessServer);
    			t60 = space();
    			p3 = element("p");
    			p3.textContent = "Messages from the web worker are processed in worker_OO.onmessage\n";
    			pre3 = element("pre");
    			t62 = text(ctx.onmessWorker);
    			t63 = space();
    			p4 = element("p");
    			p4.textContent = "When M === 2 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand().";
    			t65 = space();
    			br16 = element("br");
    			t66 = space();
    			span5 = element("span");
    			span5.textContent = "The code for this Svelte application is at";
    			t68 = space();
    			a = element("a");
    			a.textContent = "GitHub repository";
    			add_location(br0, file$1, 310, 0, 5838);
    			add_location(br1, file$1, 310, 4, 5842);
    			add_location(br2, file$1, 317, 0, 6033);
    			add_location(p0, file$1, 318, 0, 6038);
    			add_location(br3, file$1, 319, 0, 6438);
    			set_style(div0, "color", "#BBBBFF");
    			set_style(div0, "font-size", "20px");
    			add_location(div0, file$1, 325, 0, 6448);
    			set_style(div1, "color", "#FFFFCD");
    			set_style(div1, "font-size", "20px");
    			add_location(div1, file$1, 326, 0, 6576);
    			add_location(br4, file$1, 329, 0, 6662);
    			set_style(span0, "color", "#CDCDFF");
    			set_style(span0, "font-size", "20px");
    			add_location(span0, file$1, 330, 0, 6667);
    			add_location(br5, file$1, 332, 0, 6856);
    			add_location(br6, file$1, 332, 25, 6881);
    			add_location(br7, file$1, 332, 50, 6906);
    			set_style(span1, "color", "#FFFFCD");
    			set_style(span1, "font-size", "20px");
    			add_location(span1, file$1, 331, 0, 6806);
    			add_location(br8, file$1, 333, 0, 6938);
    			add_location(br9, file$1, 334, 0, 6943);
    			add_location(pre0, file$1, 336, 0, 6978);
    			attr(button, "class", "svelte-8aass1");
    			add_location(button, file$1, 335, 0, 6948);
    			add_location(br10, file$1, 339, 0, 7009);
    			add_location(br11, file$1, 339, 4, 7013);
    			add_location(br12, file$1, 339, 8, 7017);
    			set_style(span2, "font-size", "24px");
    			set_style(span2, "color", "#FF0B0B");
    			add_location(span2, file$1, 344, 42, 7116);
    			add_location(br13, file$1, 345, 0, 7206);
    			set_style(span3, "font-size", "24px");
    			set_style(span3, "color", "#FF0B0B");
    			add_location(span3, file$1, 346, 42, 7253);
    			add_location(br14, file$1, 347, 0, 7343);
    			set_style(span4, "font-size", "24px");
    			set_style(span4, "color", "#FF0B0B");
    			add_location(span4, file$1, 348, 44, 7392);
    			add_location(br15, file$1, 349, 0, 7482);
    			set_style(div2, "color", "#FFFFCD");
    			set_style(div2, "font-size", "20px");
    			add_location(div2, file$1, 343, 0, 7025);
    			add_location(p1, file$1, 354, 0, 7497);
    			add_location(pre1, file$1, 356, 0, 7672);
    			add_location(p2, file$1, 358, 0, 7690);
    			add_location(pre2, file$1, 359, 0, 8144);
    			add_location(p3, file$1, 360, 0, 8170);
    			add_location(pre3, file$1, 361, 0, 8240);
    			add_location(p4, file$1, 362, 0, 8266);
    			add_location(br16, file$1, 363, 0, 8420);
    			add_location(span5, file$1, 364, 0, 8425);
    			attr(a, "href", "https://github.com/dschalk/blog/");
    			attr(a, "target", "_blank");
    			add_location(a, file$1, 365, 0, 8483);
    			dispose = listen(button, "click", ctx.factors);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t2, anchor);
    			insert(target, p0, anchor);
    			insert(target, t4, anchor);
    			insert(target, br3, anchor);
    			insert(target, t5, anchor);
    			insert(target, div0, anchor);
    			insert(target, t7, anchor);
    			insert(target, div1, anchor);
    			append(div1, t8);
    			append(div1, t9);
    			append(div1, t10);
    			append(div1, t11);
    			append(div1, t12);
    			insert(target, t13, anchor);
    			insert(target, br4, anchor);
    			insert(target, t14, anchor);
    			insert(target, span0, anchor);
    			insert(target, t16, anchor);
    			insert(target, span1, anchor);
    			append(span1, br5);
    			append(span1, t17);
    			append(span1, t18);
    			append(span1, t19);
    			append(span1, br6);
    			append(span1, t20);
    			append(span1, t21);
    			append(span1, t22);
    			append(span1, br7);
    			append(span1, t23);
    			append(span1, t24);
    			append(span1, t25);
    			insert(target, t26, anchor);
    			insert(target, br8, anchor);
    			insert(target, t27, anchor);
    			insert(target, br9, anchor);
    			insert(target, t28, anchor);
    			insert(target, button, anchor);
    			append(button, pre0);
    			append(pre0, t29);
    			insert(target, t30, anchor);
    			insert(target, br10, anchor);
    			insert(target, br11, anchor);
    			insert(target, br12, anchor);
    			insert(target, t31, anchor);
    			insert(target, div2, anchor);
    			append(div2, t32);
    			append(div2, t33);
    			append(div2, t34);
    			append(div2, t35);
    			append(div2, t36);
    			append(div2, span2);
    			append(span2, t37);
    			append(div2, t38);
    			append(div2, br13);
    			append(div2, t39);
    			append(div2, t40);
    			append(div2, t41);
    			append(div2, t42);
    			append(div2, t43);
    			append(div2, span3);
    			append(span3, t44);
    			append(div2, t45);
    			append(div2, br14);
    			append(div2, t46);
    			append(div2, t47);
    			append(div2, t48);
    			append(div2, t49);
    			append(div2, t50);
    			append(div2, span4);
    			append(span4, t51);
    			append(div2, t52);
    			append(div2, br15);
    			insert(target, t53, anchor);
    			insert(target, p1, anchor);
    			insert(target, t55, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t56);
    			insert(target, t57, anchor);
    			insert(target, p2, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t59);
    			insert(target, t60, anchor);
    			insert(target, p3, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t62);
    			insert(target, t63, anchor);
    			insert(target, p4, anchor);
    			insert(target, t65, anchor);
    			insert(target, br16, anchor);
    			insert(target, t66, anchor);
    			insert(target, span5, anchor);
    			insert(target, t68, anchor);
    			insert(target, a, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$1();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if ((!current || changed.O) && t8_value !== (t8_value = ctx.O.c0 + "")) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.O) && t10_value !== (t10_value = ctx.O.c1 + "")) {
    				set_data(t10, t10_value);
    			}

    			if ((!current || changed.O) && t12_value !== (t12_value = ctx.O.c2 + "")) {
    				set_data(t12, t12_value);
    			}

    			if ((!current || changed.O) && t18_value !== (t18_value = ctx.O.d0.join(', ') + "")) {
    				set_data(t18, t18_value);
    			}

    			if ((!current || changed.O) && t21_value !== (t21_value = ctx.O.d1.join(', ') + "")) {
    				set_data(t21, t21_value);
    			}

    			if ((!current || changed.O) && t24_value !== (t24_value = ctx.O.d2.join(', ') + "")) {
    				set_data(t24, t24_value);
    			}

    			if ((!current || changed.O) && t33_value !== (t33_value = ctx.O.d0 + "")) {
    				set_data(t33, t33_value);
    			}

    			if ((!current || changed.O) && t35_value !== (t35_value = ctx.O.c0 + "")) {
    				set_data(t35, t35_value);
    			}

    			if ((!current || changed.O) && t37_value !== (t37_value = ctx.O.d0.reduce(func) == ctx.O.c0 + "")) {
    				set_data(t37, t37_value);
    			}

    			if ((!current || changed.O) && t40_value !== (t40_value = ctx.O.d1 + "")) {
    				set_data(t40, t40_value);
    			}

    			if ((!current || changed.O) && t42_value !== (t42_value = ctx.O.c1 + "")) {
    				set_data(t42, t42_value);
    			}

    			if ((!current || changed.O) && t44_value !== (t44_value = ctx.O.d1.reduce(func_1) == ctx.O.c1 + "")) {
    				set_data(t44, t44_value);
    			}

    			if ((!current || changed.O) && t47_value !== (t47_value = ctx.O.d2 + "")) {
    				set_data(t47, t47_value);
    			}

    			if ((!current || changed.O) && t49_value !== (t49_value = ctx.O.c2 + "")) {
    				set_data(t49, t49_value);
    			}

    			if ((!current || changed.O) && t51_value !== (t51_value = ctx.O.d2.reduce(func_2) == ctx.O.c2 + "")) {
    				set_data(t51, t51_value);
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
    			if (detaching) {
    				detach(br0);
    				detach(br1);
    				detach(t0);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(br2);
    				detach(t2);
    				detach(p0);
    				detach(t4);
    				detach(br3);
    				detach(t5);
    				detach(div0);
    				detach(t7);
    				detach(div1);
    				detach(t13);
    				detach(br4);
    				detach(t14);
    				detach(span0);
    				detach(t16);
    				detach(span1);
    				detach(t26);
    				detach(br8);
    				detach(t27);
    				detach(br9);
    				detach(t28);
    				detach(button);
    				detach(t30);
    				detach(br10);
    				detach(br11);
    				detach(br12);
    				detach(t31);
    				detach(div2);
    				detach(t53);
    				detach(p1);
    				detach(t55);
    				detach(pre1);
    				detach(t57);
    				detach(p2);
    				detach(pre2);
    				detach(t60);
    				detach(p3);
    				detach(pre3);
    				detach(t63);
    				detach(p4);
    				detach(t65);
    				detach(br16);
    				detach(t66);
    				detach(span5);
    				detach(t68);
    				detach(a);
    			}

    			dispose();
    		}
    	};
    }

    function func(a,b) {
    	return a*b;
    }

    function func_1(a,b) {
    	return a*b;
    }

    function func_2(a,b) {
    	return a*b;
    }

    function instance$1($$self, $$props, $$invalidate) {
    var f_ = function f_ () {};

    var O = new Object();
    O.d0 = [2,3,4]; $$invalidate('O', O);
    O.d1 = [2,3,4]; $$invalidate('O', O);
    O.d2= [2,3,4]; $$invalidate('O', O);

    var M = -1;
    var Q = -1;

    O.generic = ["Nobody"]; $$invalidate('O', O);

    const Monad = function Monad ( AR = [],  name = "generic",  f_ = f_Func,  rF = runFunc )  {
    var x = AR.slice();
    O[name] = ar; $$invalidate('O', O);
    rF(x); 
    };
    var runFunc = function  runFunc () { 
    varx = O[name].pop();   //  x will be replaced below
    return run = (function run (x) {
    if (x != undefined  && x === x  && x !== false && x.name !== "f_" && x.name !== "stop" )  {
      O[name] = O[name].concat(x); $$invalidate('O', O);
    }return f_;
    })
    };

    /* let a0 = *Monad([3])(cube)
    (add(3))(square)(div(100))
    (sqrt)(()=>this)(halt); */

    // var socket = new WebSocket("ws://localhost:3055")
    var socket = new WebSocket("ws://167.71.168.53:3055");

    socket.onclose = function (event) {
    console.log('<><><> ALERT - socket is closing. <><><> ', event);
    };
    socket.onmessage = function(e) {
    // console.log("WebSocket message is", e);
    var v = e.data.split(',');
    if (v[0] === "BE#$42") {
    Q = Q + 1;
    Monad([v[3]], "c"+Q);
    if (Q === 2) Q = -1;
    worker_OO.postMessage([v[3]]);
    }
    };
    login();

    function login() {
    console.log('00000000000000000000000000000000 Entering login', socket.readyState);
    setTimeout(function () {
    if (socket.readyState === 1) {
      console.log('readyState is', socket.readyState);
      var v = Math.random().toString().substring(5);
      var v2 = v.toString().substring(2);
      var combo = v + '<o>' + v2;
      socket.send('CC#$42' + combo);
      // socket.send(`GZ#$42,solo,${v}`);
      socket.send("BE#$42,solo,name,10000");
      socket.send("BE#$42,solo,name,100000");
      socket.send("BE#$42,solo,name,1000");
    } else {
      login();
    }
    }, 200);
    }
    const factors = function factors () {
    socket.send("BE#$42,solo,name,10000");
    socket.send("BE#$42,solo,name,100000");
    socket.send("BE#$42,solo,name,1000");
    };

    var worker_OO = new Worker('worker_OO.js');

    worker_OO.onmessage = e => {
    M = M + 1;
    Monad([e.data], "d"+M);
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

    	$$self.$$.update = ($$dirty = { j: 1 }) => {
    		if ($$dirty.j) ;
    	};

    	return {
    		O,
    		factors,
    		mon,
    		onmessServer,
    		onmessWorker,
    		candle
    	};
    }

    class Monad2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/Monad3.svelte generated by Svelte v3.9.1 */

    const file$2 = "src/Monad3.svelte";

    // (408:2) {#if j === 3}
    function create_if_block$2(ctx) {
    	var div2, div0, t_1, div1, div2_transition, current;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "PROMISE MANIPULATION";
    			t_1 = space();
    			div1 = element("div");
    			div1.textContent = "Computations Easily Resumed and Branched";
    			set_style(div0, "font-size", "32px");
    			add_location(div0, file$2, 409, 0, 8567);
    			set_style(div1, "font-size", "22px");
    			add_location(div1, file$2, 410, 0, 8627);
    			set_style(div2, "font-family", "Times New Roman");
    			set_style(div2, "text-align", "center");
    			set_style(div2, "color", "hsl(210, 90%, 90%)");
    			add_location(div2, file$2, 408, 1, 8456);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div2, t_1);
    			append(div2, div1);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    				if (div2_transition) div2_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var t0, br0, t1, p0, t3, p1, t5, button, t7, h30, t8, t9, t10, h31, t11, t12_value = ctx.B[ctx.sym1] + "", t12, t13, h32, t14, t15_value = ctx.B[ctx.sym2] + "", t15, t16, h33, t17, t18_value = ctx.B[ctx.sym3] + "", t18, t19, p2, t21, pre0, t22, t23, pre1, t24, t25, pre2, t26, t27, pre3, t28, t29, br1, t30, br2, t31, p3, t32, br3, current, dispose;

    	var if_block =  create_if_block$2();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "The ES6 Promises API doesn't provide a way to access prior Promise resolution values in chains of composed procedures or in units of state saved for possible future use. In the previous module, Monad() instances saved their array payloads in the object \"O\". By the naming convention, for any array \"O.ar\" in \"O\", \"ar = Monad(O.ar)\" reactivates the Monad() instance \"ar\" and \"ar2 = Monad(O.ar)\" initiates a branch.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "In this module, the object \"B\" contains the functions returned by instances of \"Mona()\", defined below. Instances of Mona() close over a function named \"f_\", giving f_() access to the array held in Mona() instance that spawned it. These little functions name \"f_\" have unique keys in \"B\", and can resume activity under their original names (corresponding to their keys) or initiate new branches. Clicking the button below calls start() which runs test_3() after any previously queued runs have finished .";
    			t5 = space();
    			button = element("button");
    			button.textContent = "test_3()";
    			t7 = space();
    			h30 = element("h3");
    			t8 = text("lok is ");
    			t9 = text(ctx.lok);
    			t10 = space();
    			h31 = element("h3");
    			t11 = text("B[sym1] is ");
    			t12 = text(t12_value);
    			t13 = space();
    			h32 = element("h3");
    			t14 = text("B[sym2] is ");
    			t15 = text(t15_value);
    			t16 = space();
    			h33 = element("h3");
    			t17 = text("B[sym3] is ");
    			t18 = text(t18_value);
    			t19 = space();
    			p2 = element("p");
    			p2.textContent = "Symbols are used as names and as the second parameter of Mona(). Mona() instances in object \"A\" populate and update object B with their arrays. Mona() instances in \"A\" and their arrays in \"B\" have identical object keys.";
    			t21 = space();
    			pre0 = element("pre");
    			t22 = text(ctx.syms);
    			t23 = space();
    			pre1 = element("pre");
    			t24 = text(ctx.t_3);
    			t25 = space();
    			pre2 = element("pre");
    			t26 = text(ctx.code);
    			t27 = space();
    			pre3 = element("pre");
    			t28 = text(ctx.funcs);
    			t29 = space();
    			br1 = element("br");
    			t30 = space();
    			br2 = element("br");
    			t31 = space();
    			p3 = element("p");
    			t32 = space();
    			br3 = element("br");
    			add_location(br0, file$2, 413, 2, 8723);
    			add_location(p0, file$2, 414, 0, 8728);
    			add_location(p1, file$2, 415, 0, 9151);
    			set_style(button, "text-align", "left");
    			attr(button, "class", "svelte-77grfh");
    			add_location(button, file$2, 417, 0, 9666);
    			add_location(h30, file$2, 421, 0, 9743);
    			add_location(h31, file$2, 422, 0, 9765);
    			add_location(h32, file$2, 423, 0, 9797);
    			add_location(h33, file$2, 424, 0, 9829);
    			add_location(p2, file$2, 426, 0, 9862);
    			set_style(pre0, "font-size", "18");
    			attr(pre0, "class", "svelte-77grfh");
    			add_location(pre0, file$2, 428, 0, 10091);
    			set_style(pre1, "font-size", "18");
    			attr(pre1, "class", "svelte-77grfh");
    			add_location(pre1, file$2, 429, 0, 10133);
    			set_style(pre2, "font-size", "18");
    			attr(pre2, "class", "svelte-77grfh");
    			add_location(pre2, file$2, 430, 0, 10175);
    			set_style(pre3, "font-size", "18");
    			attr(pre3, "class", "svelte-77grfh");
    			add_location(pre3, file$2, 431, 0, 10217);
    			add_location(br1, file$2, 434, 2, 10264);
    			add_location(br2, file$2, 436, 2, 10272);
    			add_location(p3, file$2, 439, 2, 10282);
    			add_location(br3, file$2, 442, 2, 10298);
    			dispose = listen(button, "click", ctx.start);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br0, anchor);
    			insert(target, t1, anchor);
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, p1, anchor);
    			insert(target, t5, anchor);
    			insert(target, button, anchor);
    			insert(target, t7, anchor);
    			insert(target, h30, anchor);
    			append(h30, t8);
    			append(h30, t9);
    			insert(target, t10, anchor);
    			insert(target, h31, anchor);
    			append(h31, t11);
    			append(h31, t12);
    			insert(target, t13, anchor);
    			insert(target, h32, anchor);
    			append(h32, t14);
    			append(h32, t15);
    			insert(target, t16, anchor);
    			insert(target, h33, anchor);
    			append(h33, t17);
    			append(h33, t18);
    			insert(target, t19, anchor);
    			insert(target, p2, anchor);
    			insert(target, t21, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t22);
    			insert(target, t23, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t24);
    			insert(target, t25, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t26);
    			insert(target, t27, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t28);
    			insert(target, t29, anchor);
    			insert(target, br1, anchor);
    			insert(target, t30, anchor);
    			insert(target, br2, anchor);
    			insert(target, t31, anchor);
    			insert(target, p3, anchor);
    			insert(target, t32, anchor);
    			insert(target, br3, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$2();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (!current || changed.lok) {
    				set_data(t9, ctx.lok);
    			}

    			if ((!current || changed.B) && t12_value !== (t12_value = ctx.B[ctx.sym1] + "")) {
    				set_data(t12, t12_value);
    			}

    			if ((!current || changed.B) && t15_value !== (t15_value = ctx.B[ctx.sym2] + "")) {
    				set_data(t15, t15_value);
    			}

    			if ((!current || changed.B) && t18_value !== (t18_value = ctx.B[ctx.sym3] + "")) {
    				set_data(t18, t18_value);
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
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(p1);
    				detach(t5);
    				detach(button);
    				detach(t7);
    				detach(h30);
    				detach(t10);
    				detach(h31);
    				detach(t13);
    				detach(h32);
    				detach(t16);
    				detach(h33);
    				detach(t19);
    				detach(p2);
    				detach(t21);
    				detach(pre0);
    				detach(t23);
    				detach(pre1);
    				detach(t25);
    				detach(pre2);
    				detach(t27);
    				detach(pre3);
    				detach(t29);
    				detach(br1);
    				detach(t30);
    				detach(br2);
    				detach(t31);
    				detach(p3);
    				detach(t32);
    				detach(br3);
    			}

    			dispose();
    		}
    	};
    }

    function wait$1(ms) {
    return new Promise(r => setTimeout(r, ms));
    }

    async function squareP (x) {
    await wait$1(300);
    return x*x;
    }

    async function cubeP (x) {
    await wait$1(300);
    return x*x*x;
    }

    async function idP (x) {
    await wait$1(900);
    return x;
    }

    function instance$2($$self, $$props, $$invalidate) {

    let divP = a => async b => {
      await wait$1 (300);
      return b/a;
    };

    let doubleP = async a => {
      await wait$1 (300);
      return a+a;
    };

    let addP = x => async y => {
      await wait$1(900);
      return parseInt(x,10) + parseInt(y,10);
    };

    let multP = x => async y => {
      await wait$1(300);
      return x * y;
    };

    const sym1 = Symbol('sym1');
    const sym2 = Symbol('sym2');
    const sym3 = Symbol('sym3');

    let B = {};
    B[sym1] = []; $$invalidate('B', B);
    B[sym2] = []; $$invalidate('B', B);
    B[sym3] = []; $$invalidate('B', B);
    let Mona = function Mona ( AR = [], ar = [] )  {  
      let p, run, f_;
      B[ar] = AR.slice(); $$invalidate('B', B);
      let x = B[ar].slice(-1)[0] ;
      return run = (function run (x) {
      if (x instanceof Promise) {x.then(y => {
        if (!( y.name == "f_" || y == lok || y == NaN || y == undefined ||
          typeof y == "undefined" || y != y  ) ){B[ar] = B[ar].concat(y); $$invalidate('B', B);}
        else if (!(x.name == "f_" || x == lok || x instanceof Promise ||
          x == undefined || x == NaN)) {B[ar] = B[ar].concat(x); $$invalidate('B', B);
      }   }  );  }
        f_ = function f_ (func) {
          console.log("B[ar] is", B[ar]);
          if (func === 'halt' || func === 'h' || func == undefined ||
            typeof func == "undefined" || func == NaN ) {
            $$invalidate('B', B); 
            return B[ar].slice();
          }
          if (typeof func == "function" && x instanceof Promise) p = x.then(v => func(v));
          else if (typeof func != "function" && x instanceof Promise) p = x.then(v => v);
          else if (typeof func != "function") p = func;
          else p = func(x);
          return run(p);
        };
        return f_;
      })(x);
    };

      const A = {};

      A[sym1] = Mona([0], sym1);  A[sym2] = Mona([], sym2);  A[sym3] = Mona([], sym3);
    function test_3 () {
      $$invalidate('lok', lok = true);
      A[sym1] = Mona([0], sym1);  A[sym2] = Mona( [], sym2);  A[sym3] = Mona([], sym3);  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
        branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
          branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
          (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
            branch(sym1,sym2)(divP(7))(addP(8))(multP(3))
            (() => B[sym1].reduce((a,b) => a+b))
            (addP(-23))(divP(24))(() => { const $$result = lok = false; $$invalidate('lok', lok); return $$result; })
          )
        )
      );  
    }

    function branch (a, b) {  // Transfers a copy of the last item in A[b] to A[a]
      let c = A[b]().slice(-1);
      return A[a](c);
    }

    let lok = false;

    function start () {
      if (!lok) {
        console.log("lok is false -- calling test_3");
        test_3();
      }
      else {
        console.log("lok is true -- setTimeout 300");
        setTimeout(() => start(),300);
      }
    }
    start();

    // let resume = function resume (s) {return Mona(A[s])}

    let syms = `const sym1 = Symbol('sym1');
const sym2 = Symbol('sym2');
const sym3 = Symbol('sym3');`;

    let t_3 = `function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))(() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
} `;
    let code = `let B = {};
B[sym1] = [];
B[sym2] = [];
B[sym3] = [];

$: B;

let Mona = function Mona ( AR = [], ar = [] )  {  
  let p, run, f_;
  B[ar] = AR.slice();
  let x = B[ar].slice(-1)[0] ;
  return run = (function run (x) {
  if (x instanceof Promise) {x.then(y => {
    if (!( y.name == "f_" || y == lok || y == NaN || y == undefined || 
    typeof y == "undefined" || y != y  ) ){B[ar] = B[ar].concat(y)}
    else if (!(x.name == "f_" || x == lok || x instanceof Promise || x == undefined ||
     x == NaN)) {B[ar] = B[ar].concat(x);
  }   }  )  }
    f_ = function f_ (func) {
      console.log("B[ar] is", B[ar]);
      if (func === 'halt' || func === 'h' || func == undefined ||
       typeof func == "undefined" || func == NaN ) {
        B[ar] = B[ar]; 
        return B[ar].slice();
      }
      if (typeof func == "function" && x instanceof Promise) p = x.then(v => func(v))
      else if (typeof func != "function" && x instanceof Promise) p = x.then(v => v)
      else if (typeof func != "function") p = func
      else p = func(x);
      return run(p);
    };
    return f_;
  })(x);
}

  const A = {};

  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona([], sym2);
  A[sym3] = Mona([], sym3);

  $: B[sym1];
  $: B[sym2];

function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))
        (() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
}

test_3 ();

function branch (a, b) {  // Transfers a copy of the last item in A[b] to A[a]
  let c = A[b]().slice(-1);
  return A[a](c);
}

let lok = false;
$: lok;`;
    let funcs = `function wait(ms) {
return new Promise(r => setTimeout(r, ms));
}

async function pause (x) {
  await wait(1000)
  return x;
}

let pauseP = t => async x => {
  await wait(t*1000)
  return x;
}

async function pauseM (x) {
  await wait(600)
  return ret(x);
}

async function pauseX (x) {
  await wait(x);
}

async function squareP (x) {
  await wait(300)
  return x*x;
}

let divPinverse = a => async b => {
  await wait (300)
  return a/b;
}

let divP = a => async b => {
  await wait (300)
  return b/a;
}

let doubleP = async a => {
  await wait (300)
  return a+a;
}

let toInt = a => pareseInt(a, 10);

let addP_toInt = x => async y => {
  await wait(300)
  return toInt(x) + toInt(y);
}

let addP = x => async y => {
  await wait(900)
  return parseInt(x,10) + parseInt(y,10);
}

let multP = x => async y => {
  await wait(300)
  return x * y;
}

let powP = x => async y => {
  await wait(300)
  return y**x;
}

async function cubeP (x) {
  await wait(300)
  return x*x*x;
}

async function idP (x) {
  await wait(900)
  return x;
}
async function sqrtP (x) {
  await wait(900)
  return x**(1/2)
}`;

    	$$self.$$.update = ($$dirty = { j: 1, lock: 1, B: 1, lok: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.lock) ;
    		if ($$dirty.B) ;
    		if ($$dirty.B) ;
    		if ($$dirty.B) ;
    		if ($$dirty.lok) ;
    	};

    	return {
    		sym1,
    		sym2,
    		sym3,
    		B,
    		lok,
    		start,
    		syms,
    		t_3,
    		code,
    		funcs
    	};
    }

    class Monad3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.9.1 */

    const file$3 = "src/Matrix.svelte";

    // (150:0) {#if visible}
    function create_if_block$3(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "A LITTLE SVELTE MODULE";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "38px");
    			set_style(div, "text-align", "center");
    			add_location(div, file$3, 150, 0, 3690);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var t0, br0, t1, br1, t2, div3, div1, button0, t4, br2, t5, br3, t6, div0, button1, t7, t8, br4, t9, button2, t11, br5, t12, br6, t13, div2, button3, t14_value = ctx.cache[ctx.j][0] + "", t14, t15, button4, t16_value = ctx.cache[ctx.j][1] + "", t16, t17, button5, t18_value = ctx.cache[ctx.j][2] + "", t18, t19, br7, t20, br8, t21, button6, t22_value = ctx.cache[ctx.j][3] + "", t22, t23, button7, t24_value = ctx.cache[ctx.j][4] + "", t24, t25, button8, t26_value = ctx.cache[ctx.j][5] + "", t26, t27, br9, t28, br10, t29, button9, t30_value = ctx.cache[ctx.j][6] + "", t30, t31, button10, t32_value = ctx.cache[ctx.j][7] + "", t32, t33, button11, t34_value = ctx.cache[ctx.j][8] + "", t34, t35, br11, t36, p0, t38, pre0, t39, t40, p1, t42, pre1, t43, t44, p2, current, dispose;

    	var if_block =  create_if_block$3();

    	return {
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
    			t7 = text(ctx.j);
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
    			p0.textContent = "This is the JavaScript code inside of the script tags except for the definitions of the variables \"code\" and \"html\", which are just the code and html cut and pasted inside of back quotes:";
    			t38 = space();
    			pre0 = element("pre");
    			t39 = text(ctx.code);
    			t40 = space();
    			p1 = element("p");
    			p1.textContent = "And here is the HTML code:";
    			t42 = space();
    			pre1 = element("pre");
    			t43 = text(ctx.html);
    			t44 = space();
    			p2 = element("p");
    			p2.textContent = "Svelte implements this and other apps so simply, neatly, and transparently that, for the foreseeable future, it will remain my goto framework for small, mid-sized, and possibly large applications.";
    			add_location(br0, file$3, 155, 0, 3874);
    			add_location(br1, file$3, 156, 0, 3879);
    			add_location(button0, file$3, 160, 0, 4016);
    			add_location(br2, file$3, 163, 0, 4056);
    			add_location(br3, file$3, 164, 0, 4061);
    			add_location(button1, file$3, 165, 30, 4096);
    			set_style(div0, "text-indent", "20px");
    			add_location(div0, file$3, 165, 0, 4066);
    			add_location(br4, file$3, 166, 0, 4125);
    			add_location(button2, file$3, 167, 0, 4130);
    			add_location(br5, file$3, 170, 0, 4176);
    			add_location(br6, file$3, 171, 0, 4181);
    			set_style(div1, "text-align", "right");
    			set_style(div1, "margin-right", "2%");
    			set_style(div1, "width", "20%");
    			add_location(div1, file$3, 158, 18, 3950);
    			attr(button3, "id", "m0");
    			add_location(button3, file$3, 176, 0, 4273);
    			attr(button4, "id", "m1");
    			add_location(button4, file$3, 177, 0, 4335);
    			attr(button5, "id", "m2");
    			add_location(button5, file$3, 178, 0, 4397);
    			add_location(br7, file$3, 179, 0, 4459);
    			add_location(br8, file$3, 180, 0, 4464);
    			attr(button6, "id", "m3");
    			add_location(button6, file$3, 181, 0, 4469);
    			attr(button7, "id", "m4");
    			add_location(button7, file$3, 182, 0, 4531);
    			attr(button8, "id", "m5");
    			add_location(button8, file$3, 183, 0, 4593);
    			add_location(br9, file$3, 184, 0, 4655);
    			add_location(br10, file$3, 185, 0, 4660);
    			attr(button9, "id", "m6");
    			add_location(button9, file$3, 186, 0, 4665);
    			attr(button10, "id", "m7");
    			add_location(button10, file$3, 187, 0, 4727);
    			attr(button11, "id", "m8");
    			add_location(button11, file$3, 188, 0, 4789);
    			set_style(div2, "marginRight", "0%");
    			set_style(div2, "width", "80%");
    			add_location(div2, file$3, 174, 9, 4227);
    			set_style(div3, "display", "flex");
    			add_location(div3, file$3, 157, 18, 3902);
    			add_location(br11, file$3, 191, 0, 4865);
    			add_location(p0, file$3, 193, 0, 4871);
    			add_location(pre0, file$3, 194, 0, 5068);
    			add_location(p1, file$3, 195, 0, 5086);
    			add_location(pre1, file$3, 196, 0, 5122);
    			add_location(p2, file$3, 197, 0, 5140);

    			dispose = [
    				listen(button0, "click", ctx.back),
    				listen(button2, "click", ctx.forward),
    				listen(button3, "click", ctx.ob.push),
    				listen(button4, "click", ctx.ob.push),
    				listen(button5, "click", ctx.ob.push),
    				listen(button6, "click", ctx.ob.push),
    				listen(button7, "click", ctx.ob.push),
    				listen(button8, "click", ctx.ob.push),
    				listen(button9, "click", ctx.ob.push),
    				listen(button10, "click", ctx.ob.push),
    				listen(button11, "click", ctx.ob.push)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br0, anchor);
    			insert(target, t1, anchor);
    			insert(target, br1, anchor);
    			insert(target, t2, anchor);
    			insert(target, div3, anchor);
    			append(div3, div1);
    			append(div1, button0);
    			append(div1, t4);
    			append(div1, br2);
    			append(div1, t5);
    			append(div1, br3);
    			append(div1, t6);
    			append(div1, div0);
    			append(div0, button1);
    			append(button1, t7);
    			append(div1, t8);
    			append(div1, br4);
    			append(div1, t9);
    			append(div1, button2);
    			append(div1, t11);
    			append(div1, br5);
    			append(div1, t12);
    			append(div1, br6);
    			append(div3, t13);
    			append(div3, div2);
    			append(div2, button3);
    			append(button3, t14);
    			append(div2, t15);
    			append(div2, button4);
    			append(button4, t16);
    			append(div2, t17);
    			append(div2, button5);
    			append(button5, t18);
    			append(div2, t19);
    			append(div2, br7);
    			append(div2, t20);
    			append(div2, br8);
    			append(div2, t21);
    			append(div2, button6);
    			append(button6, t22);
    			append(div2, t23);
    			append(div2, button7);
    			append(button7, t24);
    			append(div2, t25);
    			append(div2, button8);
    			append(button8, t26);
    			append(div2, t27);
    			append(div2, br9);
    			append(div2, t28);
    			append(div2, br10);
    			append(div2, t29);
    			append(div2, button9);
    			append(button9, t30);
    			append(div2, t31);
    			append(div2, button10);
    			append(button10, t32);
    			append(div2, t33);
    			append(div2, button11);
    			append(button11, t34);
    			insert(target, t35, anchor);
    			insert(target, br11, anchor);
    			insert(target, t36, anchor);
    			insert(target, p0, anchor);
    			insert(target, t38, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t39);
    			insert(target, t40, anchor);
    			insert(target, p1, anchor);
    			insert(target, t42, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t43);
    			insert(target, t44, anchor);
    			insert(target, p2, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$3();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (!current || changed.j) {
    				set_data(t7, ctx.j);
    			}

    			if ((!current || changed.j) && t14_value !== (t14_value = ctx.cache[ctx.j][0] + "")) {
    				set_data(t14, t14_value);
    			}

    			if ((!current || changed.j) && t16_value !== (t16_value = ctx.cache[ctx.j][1] + "")) {
    				set_data(t16, t16_value);
    			}

    			if ((!current || changed.j) && t18_value !== (t18_value = ctx.cache[ctx.j][2] + "")) {
    				set_data(t18, t18_value);
    			}

    			if ((!current || changed.j) && t22_value !== (t22_value = ctx.cache[ctx.j][3] + "")) {
    				set_data(t22, t22_value);
    			}

    			if ((!current || changed.j) && t24_value !== (t24_value = ctx.cache[ctx.j][4] + "")) {
    				set_data(t24, t24_value);
    			}

    			if ((!current || changed.j) && t26_value !== (t26_value = ctx.cache[ctx.j][5] + "")) {
    				set_data(t26, t26_value);
    			}

    			if ((!current || changed.j) && t30_value !== (t30_value = ctx.cache[ctx.j][6] + "")) {
    				set_data(t30, t30_value);
    			}

    			if ((!current || changed.j) && t32_value !== (t32_value = ctx.cache[ctx.j][7] + "")) {
    				set_data(t32, t32_value);
    			}

    			if ((!current || changed.j) && t34_value !== (t34_value = ctx.cache[ctx.j][8] + "")) {
    				set_data(t34, t34_value);
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
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(br1);
    				detach(t2);
    				detach(div3);
    				detach(t35);
    				detach(br11);
    				detach(t36);
    				detach(p0);
    				detach(t38);
    				detach(pre0);
    				detach(t40);
    				detach(p1);
    				detach(t42);
    				detach(pre1);
    				detach(t44);
    				detach(p2);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

    var cache = [[1,2,3,4,5,6,7,8,9]];
    var j = 0;
    var ob = {x: [], push: function push (e) {
       ob.x.push(parseInt(e.target.id.slice(1,2), 10));
       if (ob.x.length >1) {
          var d = exchange(ob.x[0], ob.x[1]);
          cache.splice(j+1,0,d);
          ob.x = []; $$invalidate('ob', ob);
          j+=1;
          return cache;   var j = 0;
          }
       }
    };

    function exchange (k,n) {
       var ar = cache[j].slice();
       var a = ar[k];
       ar[k] = ar[n];
       ar[n] = a;
       return ar;
    }

    var back = function back () {
       if (j > 0) { $$invalidate('j', j = j-=1); $$invalidate('j', j); }
       else $$invalidate('j', j);
    };

    var forward = function forward () {
       if (j+1 < cache.length) { $$invalidate('j', j = j+=1); $$invalidate('j', j); }
       else $$invalidate('j', j);
       };

       var cache = [[1,2,3,4,5,6,7,8,9]];
       var j = 0;
       var ob = {x: [], push: function push (e) {
          ob.x.push(parseInt(e.target.id.slice(1,2), 10));
          if (ob.x.length >1) {
             var d = exchange(ob.x[0], ob.x[1]);
             cache.splice(j+1,0,d);
             ob.x = []; $$invalidate('ob', ob);
             $$invalidate('j', j+=1);
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
<div style = "font-family: Times New Roman;  text-align: center; 
color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
<br><br>
A LITTLE SVELTE MODULE
</div>
{/if}

                     <div style = "display: flex">
                     <div style = "margin-Left: 2%; width: 50%" >

<p> If you click any two numbers (below), they switch locations and 
a "BACK" button appears. If you go back and click two numbers, the 
result gets inserted  at your location.</p>
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
<p> This is the JavaScript code inside of the script tags except 
for the definitions of the variables "code" and "html", which are 
just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p> `;

    	return { cache, j, ob, back, forward, code, html };
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/Transducer.svelte generated by Svelte v3.9.1 */

    const file$4 = "src/Transducer.svelte";

    // (393:0) {#if visible}
    function create_if_block$4(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "TRANSDUCER SIMULATION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$4, 393, 1, 8806);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, br0, br1, t9, div0, t10, t11_value = ctx.transducerResult.length + "", t11, t12, br2, br3, t13, div1, t15, br4, t16, div2, t17, t18_value = ctx.A_A.join(", ") + "", t18, t19, t20, br5, t21, br6, t22, div3, t24, br7, t25, div4, t26, t27_value = ctx.B_B.join(", ") + "", t27, t28, t29, br8, t30, br9, t31, div5, t33, br10, t34, div6, t35, t36_value = ctx.C_C.join(", ") + "", t36, t37_1, t38, br11, t39, br12, t40, div7, t42, br13, t43, div8, t44, t45_value = ctx.D_D.join(", ") + "", t45, t46, t47, br14, t48, br15, t49, button0, t51, button1, t53, br16, br17, t54, div9, t55, t56, t57, br18, t58, div10, t59, t60_value = ctx.ar74.join(", ") + "", t60, t61, t62, br19, t63, div11, t65, pre0, t66, t67, p4, t69, div12, t71, pre1, t73, p5, t75, div13, t77, pre2, t79, p6, t81, p7, t83, pre3, t84, t85, p8, t87, pre4, t88, t89, span0, t91, a, t93, span1, current, dispose;

    	var if_block =  create_if_block$4();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "The tradition JavaScript method of composing functions using mainly map, filter, and reduce dot notation (eg. \"array.map(func1).filter(func2).map(func3)\") polutes memory with arrays that are used only to compute the next array in a chain. Moreover, each of the soon-to-be useless arrays must be traversed. When arrays are large and numerous functions are involved, this can be a performance bottleneck.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Transducers provide an ingenious solution to the problem. Any JavaScript developer who hasn't already done so would do well to get a good night's sleep, drink a big cup of coffee, and wrap his or her head around the transducer algorithm.";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Another, more straightforward one-array-traversal solution is to use monads. This post shows the result of an array being traversed only one time and, with the help of a monad, undersoing multiple transformations by a collection of functions. The result is the same result obtained by the dot method and a standard transducer.";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "The following results were obtained by eight transformations on an array of the first 100 integers:";
    			t8 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t9 = space();
    			div0 = element("div");
    			t10 = text("Result length is ");
    			t11 = text(t11_value);
    			t12 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t13 = space();
    			div1 = element("div");
    			div1.textContent = "Traditional dot composition";
    			t15 = space();
    			br4 = element("br");
    			t16 = space();
    			div2 = element("div");
    			t17 = text("[");
    			t18 = text(t18_value);
    			t19 = text("]");
    			t20 = space();
    			br5 = element("br");
    			t21 = space();
    			br6 = element("br");
    			t22 = space();
    			div3 = element("div");
    			div3.textContent = "Composition in two stages using Monad";
    			t24 = space();
    			br7 = element("br");
    			t25 = space();
    			div4 = element("div");
    			t26 = text("[");
    			t27 = text(t27_value);
    			t28 = text("]");
    			t29 = space();
    			br8 = element("br");
    			t30 = space();
    			br9 = element("br");
    			t31 = space();
    			div5 = element("div");
    			div5.textContent = "Composition in one traversal using Monad";
    			t33 = space();
    			br10 = element("br");
    			t34 = space();
    			div6 = element("div");
    			t35 = text("[");
    			t36 = text(t36_value);
    			t37_1 = text("]");
    			t38 = space();
    			br11 = element("br");
    			t39 = space();
    			br12 = element("br");
    			t40 = space();
    			div7 = element("div");
    			div7.textContent = "Composition using a standard transducer";
    			t42 = space();
    			br13 = element("br");
    			t43 = space();
    			div8 = element("div");
    			t44 = text("[");
    			t45 = text(t45_value);
    			t46 = text("]");
    			t47 = space();
    			br14 = element("br");
    			t48 = space();
    			br15 = element("br");
    			t49 = space();
    			button0 = element("button");
    			button0.textContent = "INCREASE";
    			t51 = space();
    			button1 = element("button");
    			button1.textContent = "DECREASE";
    			t53 = space();
    			br16 = element("br");
    			br17 = element("br");
    			t54 = space();
    			div9 = element("div");
    			t55 = text("Array length: ");
    			t56 = text(ctx.size);
    			t57 = space();
    			br18 = element("br");
    			t58 = space();
    			div10 = element("div");
    			t59 = text("ar74: [");
    			t60 = text(t60_value);
    			t61 = text("]");
    			t62 = space();
    			br19 = element("br");
    			t63 = space();
    			div11 = element("div");
    			div11.textContent = "The modified Monad (below) could benefit from some refactoring, but it does what needs to be done for this demo. The point is that a standard transducer and Monad both use one array traversal to accomplish what the built-in dot method does by traversing the original array and seven intermediary arrays.";
    			t65 = space();
    			pre0 = element("pre");
    			t66 = text(ctx.mon44);
    			t67 = space();
    			p4 = element("p");
    			p4.textContent = "On my desktop computer, when ar74.length === 100,000 I got this and similar results:";
    			t69 = space();
    			div12 = element("div");
    			div12.textContent = "ar74.length = 100,000:";
    			t71 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Dot method:: 25 ms\nMonad two traversals: 255 ms\nMonad one traversal: 220 ms\nTransducer: 26 ms";
    			t73 = space();
    			p5 = element("p");
    			p5.textContent = "ar74.length === 1,000,000 was about as far as I could go without crashing the browser. Here are two typical results:";
    			t75 = space();
    			div13 = element("div");
    			div13.textContent = "Two runs with ar74.length = 1,000,000:";
    			t77 = space();
    			pre2 = element("pre");
    			pre2.textContent = "Dot method:: 276\nMonad two traversals: 2140\nMonad one traversal: 2060\nTransducer: 180\n\nDot method:: 312\nMonad two traversals: 2093\nMonad one traversal: 2115\nTransducer: 176";
    			t79 = space();
    			p6 = element("p");
    			p6.textContent = "As you see, the built-in JavaScript dot method and the transducer gave similar results. The Monad methods are much slower. They're just a proof-of-concept hacks showing the versitility of monads spawned by Monad().";
    			t81 = space();
    			p7 = element("p");
    			p7.textContent = "Here's the definition of the increase button's callback function along with the definitions of some assoc some supportingrelated:";
    			t83 = space();
    			pre3 = element("pre");
    			t84 = text(ctx.callback);
    			t85 = space();
    			p8 = element("p");
    			p8.textContent = "And here's some of the code behind the transducer demonstration:";
    			t87 = space();
    			pre4 = element("pre");
    			t88 = text(ctx.call2);
    			t89 = space();
    			span0 = element("span");
    			span0.textContent = "The rest of the code can be found in the";
    			t91 = space();
    			a = element("a");
    			a.textContent = "Github repository";
    			t93 = space();
    			span1 = element("span");
    			span1.textContent = ".";
    			add_location(p0, file$4, 398, 0, 8970);
    			add_location(p1, file$4, 399, 0, 9381);
    			add_location(p2, file$4, 400, 0, 9627);
    			add_location(p3, file$4, 401, 0, 9962);
    			add_location(br0, file$4, 402, 0, 10070);
    			add_location(br1, file$4, 402, 4, 10074);
    			add_location(div0, file$4, 403, 0, 10079);
    			add_location(br2, file$4, 404, 0, 10133);
    			add_location(br3, file$4, 404, 4, 10137);
    			attr(div1, "class", "p svelte-1d81q6r");
    			add_location(div1, file$4, 405, 0, 10142);
    			add_location(br4, file$4, 406, 0, 10193);
    			attr(div2, "class", "q svelte-1d81q6r");
    			add_location(div2, file$4, 407, 0, 10198);
    			add_location(br5, file$4, 408, 0, 10239);
    			add_location(br6, file$4, 409, 0, 10244);
    			attr(div3, "class", "p svelte-1d81q6r");
    			add_location(div3, file$4, 410, 0, 10249);
    			add_location(br7, file$4, 411, 0, 10310);
    			attr(div4, "class", "q svelte-1d81q6r");
    			add_location(div4, file$4, 412, 0, 10315);
    			add_location(br8, file$4, 413, 0, 10357);
    			add_location(br9, file$4, 414, 0, 10362);
    			attr(div5, "class", "p svelte-1d81q6r");
    			add_location(div5, file$4, 415, 0, 10367);
    			add_location(br10, file$4, 416, 0, 10431);
    			attr(div6, "class", "q svelte-1d81q6r");
    			add_location(div6, file$4, 417, 0, 10436);
    			add_location(br11, file$4, 418, 0, 10478);
    			add_location(br12, file$4, 419, 0, 10483);
    			attr(div7, "class", "p svelte-1d81q6r");
    			add_location(div7, file$4, 420, 0, 10488);
    			add_location(br13, file$4, 421, 0, 10551);
    			attr(div8, "class", "q svelte-1d81q6r");
    			add_location(div8, file$4, 422, 0, 10556);
    			add_location(br14, file$4, 423, 0, 10598);
    			add_location(br15, file$4, 424, 0, 10603);
    			attr(button0, "class", "but");
    			add_location(button0, file$4, 425, 0, 10608);
    			attr(button1, "class", "but");
    			add_location(button1, file$4, 426, 0, 10668);
    			add_location(br16, file$4, 427, 0, 10728);
    			add_location(br17, file$4, 427, 4, 10732);
    			add_location(div9, file$4, 428, 0, 10737);
    			add_location(br18, file$4, 429, 0, 10769);
    			add_location(div10, file$4, 430, 0, 10774);
    			add_location(br19, file$4, 431, 0, 10811);
    			add_location(div11, file$4, 432, 0, 10816);
    			add_location(pre0, file$4, 433, 0, 11132);
    			add_location(p4, file$4, 434, 0, 11151);
    			set_style(div12, "color", "#BBFFBB");
    			add_location(div12, file$4, 435, 0, 11245);
    			add_location(pre1, file$4, 437, 0, 11305);
    			add_location(p5, file$4, 441, 0, 11411);
    			set_style(div13, "color", "#BBFFBB");
    			add_location(div13, file$4, 443, 0, 11538);
    			add_location(pre2, file$4, 445, 0, 11614);
    			add_location(p6, file$4, 454, 0, 11799);
    			add_location(p7, file$4, 455, 0, 12023);
    			add_location(pre3, file$4, 456, 0, 12162);
    			add_location(p8, file$4, 457, 0, 12184);
    			add_location(pre4, file$4, 458, 0, 12258);
    			add_location(span0, file$4, 459, 0, 12277);
    			attr(a, "href", "https://github.com/dschalk/blog");
    			add_location(a, file$4, 460, 0, 12333);
    			add_location(span1, file$4, 461, 0, 12399);

    			dispose = [
    				listen(button0, "click", ctx.increase),
    				listen(button1, "click", ctx.decrease)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, p1, anchor);
    			insert(target, t4, anchor);
    			insert(target, p2, anchor);
    			insert(target, t6, anchor);
    			insert(target, p3, anchor);
    			insert(target, t8, anchor);
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t9, anchor);
    			insert(target, div0, anchor);
    			append(div0, t10);
    			append(div0, t11);
    			insert(target, t12, anchor);
    			insert(target, br2, anchor);
    			insert(target, br3, anchor);
    			insert(target, t13, anchor);
    			insert(target, div1, anchor);
    			insert(target, t15, anchor);
    			insert(target, br4, anchor);
    			insert(target, t16, anchor);
    			insert(target, div2, anchor);
    			append(div2, t17);
    			append(div2, t18);
    			append(div2, t19);
    			insert(target, t20, anchor);
    			insert(target, br5, anchor);
    			insert(target, t21, anchor);
    			insert(target, br6, anchor);
    			insert(target, t22, anchor);
    			insert(target, div3, anchor);
    			insert(target, t24, anchor);
    			insert(target, br7, anchor);
    			insert(target, t25, anchor);
    			insert(target, div4, anchor);
    			append(div4, t26);
    			append(div4, t27);
    			append(div4, t28);
    			insert(target, t29, anchor);
    			insert(target, br8, anchor);
    			insert(target, t30, anchor);
    			insert(target, br9, anchor);
    			insert(target, t31, anchor);
    			insert(target, div5, anchor);
    			insert(target, t33, anchor);
    			insert(target, br10, anchor);
    			insert(target, t34, anchor);
    			insert(target, div6, anchor);
    			append(div6, t35);
    			append(div6, t36);
    			append(div6, t37_1);
    			insert(target, t38, anchor);
    			insert(target, br11, anchor);
    			insert(target, t39, anchor);
    			insert(target, br12, anchor);
    			insert(target, t40, anchor);
    			insert(target, div7, anchor);
    			insert(target, t42, anchor);
    			insert(target, br13, anchor);
    			insert(target, t43, anchor);
    			insert(target, div8, anchor);
    			append(div8, t44);
    			append(div8, t45);
    			append(div8, t46);
    			insert(target, t47, anchor);
    			insert(target, br14, anchor);
    			insert(target, t48, anchor);
    			insert(target, br15, anchor);
    			insert(target, t49, anchor);
    			insert(target, button0, anchor);
    			insert(target, t51, anchor);
    			insert(target, button1, anchor);
    			insert(target, t53, anchor);
    			insert(target, br16, anchor);
    			insert(target, br17, anchor);
    			insert(target, t54, anchor);
    			insert(target, div9, anchor);
    			append(div9, t55);
    			append(div9, t56);
    			insert(target, t57, anchor);
    			insert(target, br18, anchor);
    			insert(target, t58, anchor);
    			insert(target, div10, anchor);
    			append(div10, t59);
    			append(div10, t60);
    			append(div10, t61);
    			insert(target, t62, anchor);
    			insert(target, br19, anchor);
    			insert(target, t63, anchor);
    			insert(target, div11, anchor);
    			insert(target, t65, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t66);
    			insert(target, t67, anchor);
    			insert(target, p4, anchor);
    			insert(target, t69, anchor);
    			insert(target, div12, anchor);
    			insert(target, t71, anchor);
    			insert(target, pre1, anchor);
    			insert(target, t73, anchor);
    			insert(target, p5, anchor);
    			insert(target, t75, anchor);
    			insert(target, div13, anchor);
    			insert(target, t77, anchor);
    			insert(target, pre2, anchor);
    			insert(target, t79, anchor);
    			insert(target, p6, anchor);
    			insert(target, t81, anchor);
    			insert(target, p7, anchor);
    			insert(target, t83, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t84);
    			insert(target, t85, anchor);
    			insert(target, p8, anchor);
    			insert(target, t87, anchor);
    			insert(target, pre4, anchor);
    			append(pre4, t88);
    			insert(target, t89, anchor);
    			insert(target, span0, anchor);
    			insert(target, t91, anchor);
    			insert(target, a, anchor);
    			insert(target, t93, anchor);
    			insert(target, span1, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$4();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if ((!current || changed.transducerResult) && t11_value !== (t11_value = ctx.transducerResult.length + "")) {
    				set_data(t11, t11_value);
    			}

    			if ((!current || changed.A_A) && t18_value !== (t18_value = ctx.A_A.join(", ") + "")) {
    				set_data(t18, t18_value);
    			}

    			if ((!current || changed.B_B) && t27_value !== (t27_value = ctx.B_B.join(", ") + "")) {
    				set_data(t27, t27_value);
    			}

    			if ((!current || changed.C_C) && t36_value !== (t36_value = ctx.C_C.join(", ") + "")) {
    				set_data(t36, t36_value);
    			}

    			if ((!current || changed.D_D) && t45_value !== (t45_value = ctx.D_D.join(", ") + "")) {
    				set_data(t45, t45_value);
    			}

    			if (!current || changed.size) {
    				set_data(t56, ctx.size);
    			}

    			if ((!current || changed.ar74) && t60_value !== (t60_value = ctx.ar74.join(", ") + "")) {
    				set_data(t60, t60_value);
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
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(t2);
    				detach(p1);
    				detach(t4);
    				detach(p2);
    				detach(t6);
    				detach(p3);
    				detach(t8);
    				detach(br0);
    				detach(br1);
    				detach(t9);
    				detach(div0);
    				detach(t12);
    				detach(br2);
    				detach(br3);
    				detach(t13);
    				detach(div1);
    				detach(t15);
    				detach(br4);
    				detach(t16);
    				detach(div2);
    				detach(t20);
    				detach(br5);
    				detach(t21);
    				detach(br6);
    				detach(t22);
    				detach(div3);
    				detach(t24);
    				detach(br7);
    				detach(t25);
    				detach(div4);
    				detach(t29);
    				detach(br8);
    				detach(t30);
    				detach(br9);
    				detach(t31);
    				detach(div5);
    				detach(t33);
    				detach(br10);
    				detach(t34);
    				detach(div6);
    				detach(t38);
    				detach(br11);
    				detach(t39);
    				detach(br12);
    				detach(t40);
    				detach(div7);
    				detach(t42);
    				detach(br13);
    				detach(t43);
    				detach(div8);
    				detach(t47);
    				detach(br14);
    				detach(t48);
    				detach(br15);
    				detach(t49);
    				detach(button0);
    				detach(t51);
    				detach(button1);
    				detach(t53);
    				detach(br16);
    				detach(br17);
    				detach(t54);
    				detach(div9);
    				detach(t57);
    				detach(br18);
    				detach(t58);
    				detach(div10);
    				detach(t62);
    				detach(br19);
    				detach(t63);
    				detach(div11);
    				detach(t65);
    				detach(pre0);
    				detach(t67);
    				detach(p4);
    				detach(t69);
    				detach(div12);
    				detach(t71);
    				detach(pre1);
    				detach(t73);
    				detach(p5);
    				detach(t75);
    				detach(div13);
    				detach(t77);
    				detach(pre2);
    				detach(t79);
    				detach(p6);
    				detach(t81);
    				detach(p7);
    				detach(t83);
    				detach(pre3);
    				detach(t85);
    				detach(p8);
    				detach(t87);
    				detach(pre4);
    				detach(t89);
    				detach(span0);
    				detach(t91);
    				detach(a);
    				detach(t93);
    				detach(span1);
    			}

    			run_all(dispose);
    		}
    	};
    }

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
    }

    function Monad$1 ( AR = [] )  {
    let p, run;
    let ar = AR.slice();
    let x = ar.pop();
    return run = (function run (x) {
      if (x === null || x === NaN ||
        x === undefined) x = f_('stop').pop();
      if (x instanceof Filt) {
        let z = ar.pop();
        if (x.filt(z)) x = z; else ar = [];
      }
      else if (x instanceof Promise) x.then(y =>
        {if (y != undefined && typeof y !== "boolean" && y === y &&
        y.name !== "f_" &&
        y.name !== "stop" ) {
        ar.push(y);
      }});
      else if (x != undefined && x === x  && x !== false
        && x.name !== "f_" && x.name !== "stop" ) {
        ar.push(x);
      }  function f_ (func) {
        if (func === 'stop' || func === 'S') return ar;
        else if (func === 'finish' || func === 'F') return Object.freeze(ar);
        else if (typeof func !== "function") p = func;
        else if (x instanceof Promise) p = x.then(v => func(v));
        else p = func(x);
        return run(p);
      }
      return f_;
    })(x)
    }

    function concat(xs, val) {return xs.concat(val);}

    function mapping(f) {
     return function(rf) {
        return (acc, val) => {
           return rf(acc, f(val));
        }
     }
    }

    function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)};}

    function instance$4($$self, $$props, $$invalidate) {

    let isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

    let fives = function fives (x) {return new Filt(v => v % 10 === 5)};

    let ar = "cowgirl";

    let cleanF = function cleanF (arthur = []) {
      $$invalidate('ar', ar = arthur);
      return ar.filter(
        a => a === 0 || a && typeof a !== "boolean" //
      ).reduce((a,b)=>a.concat(b),[])
    };

    let mon44 = `function Monad ( AR = [] )  {
  let f_, p, run;
  let ar = AR.slice();
  let x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      let z = ar.pop();
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

    let compose = (...fns) =>
    fns.reduceRight((prevFn, nextFn) =>
    (...args) => nextFn(prevFn(...args)),
    value => value
    );
    let cube = function cube(v) { return v**3; };

    let size = 400;

    let ar74 = [...Array(size).keys()];

    let mapWRf = mapping(cube);
    let mapRes = ar74.reduce(mapWRf(concat), []);

    let isEven = x => x % 2 === 0;
    let not = x => !x;
    let isOdd2 = compose(not, isEven);

    let A_A = "H";

    let B_B = "s";

    let C_C = "G";

    let D_D = "I";

    let res1;
    // $: res1;

    let res2;
    // $: res2;

    let res3;

    let dotResult = [];

    let transducerResult;


     $$invalidate('A_A', A_A = dotResult = ar74
       .filter(v => (v % 2 === 1))
       .map(x => x**4)
       .map(x => x+3)
       .map(x => x-3)
       .filter(v => v % 10 === 5)
       .map(x => Math.sqrt(x))
       .map(v=>v*v)
       .map(v=>v+1000)); $$invalidate('dotResult', dotResult);

    let xform;

    let xform2;

    let xform3;

      let td1 = x => Monad$1([x])(isOdd)(v=>v**4)(v=>v+3)(v=>v-3)(fives)(Math.sqrt)('stop').pop();
      let td2 = y => Monad$1([y])(v=>v*v)(v=>v+1000)('stop').pop();

    res1 = ar74.map(x => td1(x));
    $$invalidate('B_B', B_B = res2 = res1.map(y => td2(y))); $$invalidate('res2', res2);
    $$invalidate('C_C', C_C = res3 = ar74.map(z => td2(td1(z)))); $$invalidate('res3', res3);


       $$invalidate('xform', xform = compose(
          tdFilter(x=>x%2===1),
          tdMap(x => x**4),
          tdMap(x => x+3),
          tdMap(x => x-3),
          tdFilter(x => x % 10 === 5),
          tdMap(x => Math.sqrt(x))
       ));
       $$invalidate('xform2', xform2 = compose(
          tdMap(x=>x*x),
          tdMap(x=>x+1000)
       ));

       $$invalidate('xform3', xform3 = compose(
          tdFilter(x=>x%2===1),
          tdMap(x => x**4),
          tdMap(x => x+3),
          tdMap(x => x-3),
          tdFilter(x => x % 10 === 5),
          tdMap(x => Math.sqrt(x)),
          tdMap(x=>x*x),
          tdMap(x=>x+1000)
       ));
       $$invalidate('D_D', D_D = transducerResult = ar74.reduce(xform3(concat),[] )); $$invalidate('transducerResult', transducerResult), $$invalidate('ar74', ar74), $$invalidate('xform3', xform3);

    let callback = `function increase () {
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
  let fives = function fives (x) {return new Filt(v => v % 10 === 5)}
  let isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

  let td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)
    (v=>v-3)(fives)(Math.sqrt)('stop').pop()
  res1 = ar74.map(x => td1(x));
  let td2 = y => Monad([y])(v=>v*v)(v=>v+1000)('stop').pop()`;

    let call2 = `xform3 = compose(
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

      function increase () {
        $$invalidate('size', size = size + 10);
        $$invalidate('ar74', ar74 = [...Array(size).keys()]);
        res1 = ar74.map(x => td1(x));
         $$invalidate('A_A', A_A = dotResult = ar74
         .filter(v => (v % 2 === 1))
         .map(x => x**4)
         .map(x => x+3)
         .map(x => x-3)
         .filter(v => v % 10 === 5)
         .map(x => Math.sqrt(x))
         .map(v=>v*v)
         .map(v=>v+1000)); $$invalidate('dotResult', dotResult);
        $$invalidate('B_B', B_B = res2 = res1.map(y => td2(y))); $$invalidate('res2', res2);
        $$invalidate('C_C', C_C = res3 = ar74.map(z => td2(td1(z)))); $$invalidate('res3', res3);
        $$invalidate('D_D', D_D = transducerResult = ar74.reduce(xform3(concat),[] )); $$invalidate('transducerResult', transducerResult), $$invalidate('ar74', ar74), $$invalidate('xform3', xform3);
      }

    function decrease () {
      $$invalidate('size', size = size - 10);
      $$invalidate('ar74', ar74 = [...Array(size).keys()]);
      res1 = ar74.map(x => td1(x));
       $$invalidate('A_A', A_A = dotResult = ar74
       .filter(v => (v % 2 === 1))
       .map(x => x**4)
       .map(x => x+3)
       .map(x => x-3)
       .filter(v => v % 10 === 5)
       .map(x => Math.sqrt(x))
       .map(v=>v*v)
       .map(v=>v+1000)); $$invalidate('dotResult', dotResult);
      $$invalidate('B_B', B_B = res2 = res1.map(y => td2(y))); $$invalidate('res2', res2);
      $$invalidate('C_C', C_C = res3 = ar74.map(z => td2(td1(z)))); $$invalidate('res3', res3);
      $$invalidate('D_D', D_D = transducerResult = ar74.reduce(xform3(concat),[] )); $$invalidate('transducerResult', transducerResult), $$invalidate('ar74', ar74), $$invalidate('xform3', xform3);
    }
    increase();
    decrease();

    	$$self.$$.update = ($$dirty = { k: 1, ltTest: 1, ar: 1, cleanF: 1, size: 1, ar74: 1, dotResult: 1, A_A: 1, res2: 1, B_B: 1, res3: 1, C_C: 1, xform3: 1, transducerResult: 1, D_D: 1, res4: 1, test9: 1, td3: 1, xform: 1, xform2: 1, t37: 1 }) => {
    		if ($$dirty.k) ;
    		if ($$dirty.ltTest) ;
    		if ($$dirty.ar) ;
    		if ($$dirty.cleanF) ;
    		if ($$dirty.size) ;
    		if ($$dirty.ar74) ;
    		if ($$dirty.dotResult) { $$invalidate('A_A', A_A = dotResult); }
    		if ($$dirty.A_A) ;
    		if ($$dirty.cleanF || $$dirty.res2) { $$invalidate('B_B', B_B = cleanF(res2)); }
    		if ($$dirty.B_B) ;
    		if ($$dirty.cleanF || $$dirty.res3) { $$invalidate('C_C', C_C = cleanF(res3)); }
    		if ($$dirty.C_C) ;
    		if ($$dirty.ar74 || $$dirty.xform3) { $$invalidate('transducerResult', transducerResult = ar74.reduce(xform3(concat),[] )); }
    		if ($$dirty.transducerResult) { $$invalidate('D_D', D_D = transducerResult); }
    		if ($$dirty.D_D) ;
    		if ($$dirty.res3) ;
    		if ($$dirty.res4) ;
    		if ($$dirty.dotResult) ;
    		if ($$dirty.test9) ;
    		if ($$dirty.transducerResult) ;
    		if ($$dirty.td3) ;
    		if ($$dirty.xform) ;
    		if ($$dirty.xform2) ;
    		if ($$dirty.xform3) ;
    		if ($$dirty.t37) ;
    		if ($$dirty.dotResult) ;
    		if ($$dirty.res2) ;
    		if ($$dirty.res3) ;
    		if ($$dirty.transducerResult) ;
    		if ($$dirty.size) ;
    		if ($$dirty.ar74) ;
    	};

    	return {
    		mon44,
    		size,
    		ar74,
    		A_A,
    		B_B,
    		C_C,
    		D_D,
    		transducerResult,
    		callback,
    		call2,
    		increase,
    		decrease
    	};
    }

    class Transducer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/Home.svelte generated by Svelte v3.9.1 */

    const file$5 = "src/Home.svelte";

    // (98:0) {#if visible}
    function create_if_block$5(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "INTRODUCTION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$5, 98, 0, 3847);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
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
    			if (detaching) {
    				detach(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var t0, p0, t2, span0, t4, span1, t6, p1, t8, p2, t10, p3, t12, p4, t14, p5, t16, h30, t18, span2, t20, a0, t22, a1, t24, p6, t26, p7, t28, h31, t30, p8, t32, pre0, t33, t34, p9, t36, span3, t38, a2, t40, span4, t42, span5, t44, span6, t46, p10, t48, pre1, t49, t50, a3, t52, p11, t53, s, t54, t55, pre2, t56, t57, br0, t58, br1, t59, br2, t60, div, current;

    	var if_block =  create_if_block$5();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "The recursive closures called \"monads\" (on this website) are returned by factory functions called \"Monad\". The functions returned by Monad() can be anonymous or named.";
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "Each monad \"m\" created by calling, for example, \"let m = Monad()\", has its own dynamic array named \"ar\". Each monad \"m\", as defined above, either returns a function named \"_f\" that concatenates elements onto ar or, more commonly, returns a function named \"run\" that returns a function named \"_f\" that concatenates elements onto \"ar\". After monads process everything provided to them, the returned function _f lies dormant with access to the \"ar\" array in its outer function.";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Dormant monads can resume activity or spawn orthogonal branches.";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "When a monad encounters a function, say \"func\", the last item in its outer function's array, for example \"e\" in \"[a,b,c,d,e]\", becomes the func's argument and the return value is concatenated to the array. The outer functions array then becomes [a,b,c,d,e,func(e)].";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "When a suitably defined monad encounters a promise, the promise's resolution value is concatenated to the array. Values which are niether functions nor promises that that meet conditions specified in monad m's definition of \"run\" are concatenated to ar. When a monad encounters the string \"stop\" (or \"s\" defined as \"stop\") the outer function's array is returned.";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "NOTE: The definition of \"Monad\" varies from module to module on this site. An alternative would be to define \"Monad\" with more functionality and place it in a parent module.";
    			t12 = space();
    			p4 = element("p");
    			p4.textContent = "When no value is provided to a monad, the monad's return value \"_f\" remains dormant waiting to resume its activity or provide a starting point for an orthogonal branch if and when it is called upon to do so. A dormant monad that is provided with the argument \"stop\" will return its outer function's array.";
    			t14 = space();
    			p5 = element("p");
    			p5.textContent = "The table of contents provides links to a simple monad, a monad that interacts with a WebSockets server and a Web Worker, two monads that interact with promises, and one that functions as a transducer. A monad that combines all of this functionality can easily be defined.";
    			t16 = space();
    			h30 = element("h3");
    			h30.textContent = "Functional Programming";
    			t18 = space();
    			span2 = element("span");
    			span2.textContent = "Contrary to what you may have read or heard in video presentations, functional programming can and often does entail the mutation of variables and objects. Haskell, for example, is a functional language. Haskell programmers generally perform mutations inside of monads, insulated from the rest of the prograrams that contain them, but that isn't necessary.  See";
    			t20 = space();
    			a0 = element("a");
    			a0.textContent = "Haskell Mutable Objects\"";
    			t22 = text(" and  \n");
    			a1 = element("a");
    			a1.textContent = "Haskell Mutable Variables";
    			t24 = space();
    			p6 = element("p");
    			p6.textContent = "I experimented with porting Haskell patterns and algorithms over to JavaScript. I enjoyed experimenting the way people enjoy Sudoku or crossword puzzles. My functions were pure; my \"variables\" were immutable, and my monad api's were unnecessarity complicated and pretty useless.";
    			t26 = space();
    			p7 = element("p");
    			p7.textContent = "Haskell monads of a certain type can be \"lifted\" into monads of other types and normalized with flatmap. Imposing strict typing on JavaScript can be useful, especially in large group efforts where misusing functions can create bugs, but doing so prior to developing useful monads seems decidedly counterproductive. It smacks of cargo cult programming, about which I will say more later.";
    			t28 = space();
    			h31 = element("h3");
    			h31.textContent = "The Word \"Monad\"";
    			t30 = space();
    			p8 = element("p");
    			p8.textContent = "I call the following basic function, along with variations on its theme, a \"monad\":";
    			t32 = space();
    			pre0 = element("pre");
    			t33 = text(ctx.monad_);
    			t34 = space();
    			p9 = element("p");
    			p9.textContent = "I suspect that some readers will think I am misusing the word \"monad\" because my functions don't superficially resemble Haskell or Category Theory monads, and they don't mimic mimics the mechanics of composition in another language or discipline. .";
    			t36 = space();
    			span3 = element("span");
    			span3.textContent = "Monad (from Greek μονάς monas, \"singularity\" in turn from μόνος monos, \"alone\"), refers, in cosmogony, to the Supreme Being, divinity or the totality of all things.";
    			t38 = space();
    			a2 = element("a");
    			a2.textContent = "Wikipedia article";
    			t40 = space();
    			span4 = element("span");
    			span4.textContent = "A basic unit of perceptual reality is a \"monad\" in Gottfried Leibniz'";
    			t42 = space();
    			span5 = element("span");
    			span5.textContent = "Monadology";
    			t44 = space();
    			span6 = element("span");
    			span6.textContent = ", published in 1714. A single note in music theory is called a monad.";
    			t46 = space();
    			p10 = element("p");
    			p10.textContent = "Many bloggers, lecturers, and authors seem to have definite opinions about the meaning of \"monad\". I don't use the term the way they do but before I go into that, let's have a glimpse of what the others are saying:";
    			t48 = space();
    			pre1 = element("pre");
    			t49 = text(ctx.jay);
    			t50 = space();
    			a3 = element("a");
    			a3.textContent = "JavaScript Monads Made Simple";
    			t52 = space();
    			p11 = element("p");
    			t53 = text("Monads in the Haskell Programming Language were inspired by Category Theory monads. The \"monads\" discussed herein are resemble Haskell monads in that they can be used to isolate pipelines of computations and hold the result for possible later use. Here'");
    			s = element("s");
    			t54 = text(" a very simple monad:");
    			t55 = space();
    			pre2 = element("pre");
    			t56 = text(ctx.monad_);
    			t57 = space();
    			br0 = element("br");
    			t58 = space();
    			br1 = element("br");
    			t59 = space();
    			br2 = element("br");
    			t60 = space();
    			div = element("div");
    			div.textContent = ".";
    			add_location(p0, file$5, 103, 0, 4007);
    			add_location(span0, file$5, 104, 0, 4186);
    			set_style(span1, "font-style", "italic");
    			set_style(span1, "color", "#FFBBDD");
    			add_location(span1, file$5, 104, 492, 4678);
    			add_location(p1, file$5, 105, 0, 4803);
    			add_location(p2, file$5, 106, 0, 5078);
    			set_style(p3, "font-style", "italic");
    			set_style(p3, "color", "#BBFFBB");
    			add_location(p3, file$5, 107, 0, 5454);
    			add_location(p4, file$5, 108, 0, 5683);
    			add_location(p5, file$5, 109, 0, 5997);
    			add_location(h30, file$5, 111, 0, 6280);
    			attr(span2, "class", "tao");
    			add_location(span2, file$5, 112, 0, 6313);
    			attr(a0, "href", "https://en.wikibooks.org/wiki/Haskell/Mutable_objects");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$5, 113, 0, 6702);
    			attr(a1, "href", "https://tech.fpcomplete.com/haskell/tutorial/mutable-variables");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$5, 114, 0, 6817);
    			add_location(p6, file$5, 116, 0, 6937);
    			add_location(p7, file$5, 118, 0, 7227);
    			add_location(h31, file$5, 120, 0, 7625);
    			add_location(p8, file$5, 121, 0, 7651);
    			add_location(pre0, file$5, 122, 0, 7743);
    			add_location(p9, file$5, 124, 0, 7764);
    			attr(span3, "class", "tao");
    			add_location(span3, file$5, 128, 1, 8027);
    			attr(a2, "class", "tao");
    			attr(a2, "href", "https://en.wikipedia.org/wiki/Monad_(philosophy)");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$5, 129, 1, 8219);
    			add_location(span4, file$5, 132, 2, 8341);
    			set_style(span5, "font-style", "italic");
    			add_location(span5, file$5, 133, 0, 8426);
    			add_location(span6, file$5, 134, 0, 8481);
    			add_location(p10, file$5, 136, 0, 8566);
    			set_style(pre1, "color", "#77CCFF ");
    			add_location(pre1, file$5, 137, 0, 8791);
    			attr(a3, "class", "tao");
    			attr(a3, "href", "https://medium.com/javascript-scene/javascript-monads-made-simple-7856be57bfe8");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$5, 138, 0, 8835);
    			add_location(s, file$5, 140, 257, 9250);
    			add_location(p11, file$5, 140, 0, 8993);
    			add_location(pre2, file$5, 142, 0, 9285);
    			add_location(br0, file$5, 143, 0, 9305);
    			add_location(br1, file$5, 144, 0, 9310);
    			add_location(br2, file$5, 145, 0, 9315);
    			set_style(div, "text-align", "center");
    			add_location(div, file$5, 146, 0, 9320);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, span0, anchor);
    			insert(target, t4, anchor);
    			insert(target, span1, anchor);
    			insert(target, t6, anchor);
    			insert(target, p1, anchor);
    			insert(target, t8, anchor);
    			insert(target, p2, anchor);
    			insert(target, t10, anchor);
    			insert(target, p3, anchor);
    			insert(target, t12, anchor);
    			insert(target, p4, anchor);
    			insert(target, t14, anchor);
    			insert(target, p5, anchor);
    			insert(target, t16, anchor);
    			insert(target, h30, anchor);
    			insert(target, t18, anchor);
    			insert(target, span2, anchor);
    			insert(target, t20, anchor);
    			insert(target, a0, anchor);
    			insert(target, t22, anchor);
    			insert(target, a1, anchor);
    			insert(target, t24, anchor);
    			insert(target, p6, anchor);
    			insert(target, t26, anchor);
    			insert(target, p7, anchor);
    			insert(target, t28, anchor);
    			insert(target, h31, anchor);
    			insert(target, t30, anchor);
    			insert(target, p8, anchor);
    			insert(target, t32, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t33);
    			insert(target, t34, anchor);
    			insert(target, p9, anchor);
    			insert(target, t36, anchor);
    			insert(target, span3, anchor);
    			insert(target, t38, anchor);
    			insert(target, a2, anchor);
    			insert(target, t40, anchor);
    			insert(target, span4, anchor);
    			insert(target, t42, anchor);
    			insert(target, span5, anchor);
    			insert(target, t44, anchor);
    			insert(target, span6, anchor);
    			insert(target, t46, anchor);
    			insert(target, p10, anchor);
    			insert(target, t48, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t49);
    			insert(target, t50, anchor);
    			insert(target, a3, anchor);
    			insert(target, t52, anchor);
    			insert(target, p11, anchor);
    			append(p11, t53);
    			append(p11, s);
    			append(p11, t54);
    			insert(target, t55, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t56);
    			insert(target, t57, anchor);
    			insert(target, br0, anchor);
    			insert(target, t58, anchor);
    			insert(target, br1, anchor);
    			insert(target, t59, anchor);
    			insert(target, br2, anchor);
    			insert(target, t60, anchor);
    			insert(target, div, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$5();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
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
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(t2);
    				detach(span0);
    				detach(t4);
    				detach(span1);
    				detach(t6);
    				detach(p1);
    				detach(t8);
    				detach(p2);
    				detach(t10);
    				detach(p3);
    				detach(t12);
    				detach(p4);
    				detach(t14);
    				detach(p5);
    				detach(t16);
    				detach(h30);
    				detach(t18);
    				detach(span2);
    				detach(t20);
    				detach(a0);
    				detach(t22);
    				detach(a1);
    				detach(t24);
    				detach(p6);
    				detach(t26);
    				detach(p7);
    				detach(t28);
    				detach(h31);
    				detach(t30);
    				detach(p8);
    				detach(t32);
    				detach(pre0);
    				detach(t34);
    				detach(p9);
    				detach(t36);
    				detach(span3);
    				detach(t38);
    				detach(a2);
    				detach(t40);
    				detach(span4);
    				detach(t42);
    				detach(span5);
    				detach(t44);
    				detach(span6);
    				detach(t46);
    				detach(p10);
    				detach(t48);
    				detach(pre1);
    				detach(t50);
    				detach(a3);
    				detach(t52);
    				detach(p11);
    				detach(t55);
    				detach(pre2);
    				detach(t57);
    				detach(br0);
    				detach(t58);
    				detach(br1);
    				detach(t59);
    				detach(br2);
    				detach(t60);
    				detach(div);
    			}
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {

    var jay = `If you search the Internet for “monad” you’re going to get 
bombarded by impenetrable category theory math and a bunch of people “helpfully” 
explaining monads in terms of burritos and space suits.

Monads are simple. The lingo is hard. Let’s cut to the essence.

A monad is a way of composing functions that require context in addition to the 
return value, such as computation, branching, or I/O. Monads type lift, flatten 
and map so that the types line up for lifting functions a => M(b), making them composable. 
It's a mapping from some type a to some type b along with some computational context, 

hidden in the implementation details of lift, flatten, and map:
Functions map: a => b
Functors map with context: Functor(a) => Functor(b)
Monads flatten and map with context: Monad(Monad(a)) => Monad(b)
But what do “flatten” and “map” and “context” mean?
Map means, “apply a function to an a and return a b". Given some input, return some output.
Context is the computational detail of the monad’s composition (including lift, flatten, 
and map). The Functor/Monad API and its workings supply the context which allows you to 
compose the monad with the rest of the application. The point of functors and monads is 
to abstract that context away so we don’t have to worry about it while we’re composing 
things. Mapping inside the context means that you apply a function from a => b to the 
value inside the context, and return a new value b wrapped inside the same kind of context. 
Observables on the left? Observables on the right: Observable(a) => Observable(b). Arrays 
on the left side? Arrays on the right side: Array(a) => Array(b).

Type lift means to lift a type into a context, blessing the value with an API that you can use to compute from that value, trigger contextual computations, etc… a => F(a) (Monads are a kind of functor).
Flatten means unwrap the value from the context. F(a) => a. `;

    let monad_ = `var a = Monad(); a(3)(v=>v**3)(v=>v+3)(v=>v*v); var b = Monad(); b(a('end'))(v=>v/100)(Math.sqrt); console.log(a('stop'), b('stop'))
var a = Monad(); a(3)(v=>v**3)(v=>v+3)(v=>v*v); var b = Monad(); b(a('end'))(v=>v/100)(Math.sqrt); console.log(a('stop'), b('stop'))
VM2285:1 (3) [3, 27, 30] (3) [900, 9, 3[3, 27, 30] (3) [900, 9, 3]`;

    	return { jay, monad_ };
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.9.1 */

    const file$6 = "src/Blog.svelte";

    // (149:0) {#if j === 0}
    function create_if_block_5(ctx) {
    	var div, t_1, current;

    	var home = new Home({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Home";
    			t_1 = space();
    			home.$$.fragment.c();
    			attr(div, "class", "show svelte-1rvgrtu");
    			add_location(div, file$6, 149, 0, 2905);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(home, detaching);
    		}
    	};
    }

    // (153:0) {#if j === 1}
    function create_if_block_4(ctx) {
    	var div, t_1, current;

    	var monad1 = new Monad1({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Simple Monad";
    			t_1 = space();
    			monad1.$$.fragment.c();
    			attr(div, "class", "show svelte-1rvgrtu");
    			add_location(div, file$6, 153, 0, 2963);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
    			mount_component(monad1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(monad1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad1, detaching);
    		}
    	};
    }

    // (157:0) {#if j === 2}
    function create_if_block_3(ctx) {
    	var div, t_1, current;

    	var monad2 = new Monad2({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Messages Monad";
    			t_1 = space();
    			monad2.$$.fragment.c();
    			attr(div, "class", "show svelte-1rvgrtu");
    			add_location(div, file$6, 157, 0, 3031);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad2, detaching);
    		}
    	};
    }

    // (161:0) {#if j === 3}
    function create_if_block_2(ctx) {
    	var div, t_1, current;

    	var monad3 = new Monad3({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Promises Monad";
    			t_1 = space();
    			monad3.$$.fragment.c();
    			attr(div, "class", "show svelte-1rvgrtu");
    			add_location(div, file$6, 161, 0, 3101);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(monad3, detaching);
    		}
    	};
    }

    // (165:0) {#if j === 4}
    function create_if_block_1(ctx) {
    	var div, t_1, current;

    	var transducer = new Transducer({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Transducer Monad";
    			t_1 = space();
    			transducer.$$.fragment.c();
    			attr(div, "class", "show svelte-1rvgrtu");
    			add_location(div, file$6, 165, 0, 3171);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(transducer, detaching);
    		}
    	};
    }

    // (169:0) {#if j === 5}
    function create_if_block$6(ctx) {
    	var div, t_1, current;

    	var matrix = new Matrix({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Why Svelte";
    			t_1 = space();
    			matrix.$$.fragment.c();
    			attr(div, "class", "show svelte-1rvgrtu");
    			add_location(div, file$6, 169, 0, 3247);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t_1, anchor);
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
    			if (detaching) {
    				detach(div);
    				detach(t_1);
    			}

    			destroy_component(matrix, detaching);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var div0, t1, div1, t3, div7, div2, t5, div3, t7, br0, t8, div4, t10, div5, t12, div6, t14, div15, br1, t15, div8, t17, div14, br2, t18, div9, t20, br3, t21, div10, t23, br4, t24, div11, t26, br5, t27, div12, t29, br6, t30, div13, t31, br7, t32, br8, t33, t34, div16, br9, t35, t36, t37, t38, t39, t40, t41, br10, br11, t42, t43, br12, br13, t44, br14, br15, t45, br16, br17, current, dispose;

    	var if_block0 = (ctx.j === 0) && create_if_block_5();

    	var if_block1 = (ctx.j === 1) && create_if_block_4();

    	var if_block2 = (ctx.j === 2) && create_if_block_3();

    	var if_block3 = (ctx.j === 3) && create_if_block_2();

    	var if_block4 = (ctx.j === 4) && create_if_block_1();

    	var if_block5 = (ctx.j === 5) && create_if_block$6();

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Powerful JavaScript Monads";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Asynchronously link functions, primitive values, and objects of all types with recursive closures.";
    			t3 = space();
    			div7 = element("div");
    			div2 = element("div");
    			div2.textContent = "A Svelte front-end with a";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Haskell WebSockets server";
    			t7 = space();
    			br0 = element("br");
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "David E. Schalk";
    			t10 = space();
    			div5 = element("div");
    			div5.textContent = "fp3216@protonmail.com";
    			t12 = space();
    			div6 = element("div");
    			div6.textContent = "https://github.com/dschalk";
    			t14 = space();
    			div15 = element("div");
    			br1 = element("br");
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "Table of Contents";
    			t17 = space();
    			div14 = element("div");
    			br2 = element("br");
    			t18 = space();
    			div9 = element("div");
    			div9.textContent = "Home";
    			t20 = space();
    			br3 = element("br");
    			t21 = space();
    			div10 = element("div");
    			div10.textContent = "A Simple Monad";
    			t23 = space();
    			br4 = element("br");
    			t24 = space();
    			div11 = element("div");
    			div11.textContent = "A Messaging Monad";
    			t26 = space();
    			br5 = element("br");
    			t27 = space();
    			div12 = element("div");
    			div12.textContent = "A Promises Monad";
    			t29 = space();
    			br6 = element("br");
    			t30 = space();
    			div13 = element("div");
    			t31 = text("Why Svelte>\n  ");
    			br7 = element("br");
    			t32 = space();
    			br8 = element("br");
    			t33 = text(">");
    			t34 = space();
    			div16 = element("div");
    			br9 = element("br");
    			t35 = space();
    			if (if_block0) if_block0.c();
    			t36 = space();
    			if (if_block1) if_block1.c();
    			t37 = space();
    			if (if_block2) if_block2.c();
    			t38 = space();
    			if (if_block3) if_block3.c();
    			t39 = space();
    			if (if_block4) if_block4.c();
    			t40 = space();
    			if (if_block5) if_block5.c();
    			t41 = space();
    			br10 = element("br");
    			br11 = element("br");
    			t42 = space();

    			if (default_slot) default_slot.c();
    			t43 = space();
    			br12 = element("br");
    			br13 = element("br");
    			t44 = space();
    			br14 = element("br");
    			br15 = element("br");
    			t45 = space();
    			br16 = element("br");
    			br17 = element("br");
    			set_style(div0, "font-size", "58px");
    			set_style(div0, "color", "#FFD700");
    			set_style(div0, "text-align", "center");
    			attr(div0, "class", "svelte-1rvgrtu");
    			add_location(div0, file$6, 111, 0, 1796);
    			set_style(div1, "font-size", "32px");
    			set_style(div1, "color", "#FFBBBB");
    			set_style(div1, "font-style", "italic");
    			set_style(div1, "text-align", "center");
    			set_style(div1, "margin-left", "27%");
    			set_style(div1, "margin-right", "27%");
    			attr(div1, "class", "svelte-1rvgrtu");
    			add_location(div1, file$6, 112, 0, 1896);
    			attr(div2, "class", "svelte-1rvgrtu");
    			add_location(div2, file$6, 116, 0, 2149);
    			attr(div3, "class", "svelte-1rvgrtu");
    			add_location(div3, file$6, 117, 0, 2186);
    			add_location(br0, file$6, 118, 0, 2223);
    			attr(div4, "class", "svelte-1rvgrtu");
    			add_location(div4, file$6, 119, 0, 2228);
    			attr(div5, "class", "svelte-1rvgrtu");
    			add_location(div5, file$6, 120, 0, 2258);
    			attr(div6, "class", "svelte-1rvgrtu");
    			add_location(div6, file$6, 121, 0, 2291);
    			attr(div7, "class", "stat svelte-1rvgrtu");
    			add_location(div7, file$6, 115, 0, 2130);
    			add_location(br1, file$6, 124, 0, 2359);
    			attr(div8, "class", "dropbtn svelte-1rvgrtu");
    			add_location(div8, file$6, 125, 2, 2366);
    			add_location(br2, file$6, 127, 2, 2446);
    			attr(div9, "class", "menu svelte-1rvgrtu");
    			add_location(div9, file$6, 128, 0, 2451);
    			add_location(br3, file$6, 129, 2, 2508);
    			attr(div10, "class", "menu svelte-1rvgrtu");
    			add_location(div10, file$6, 130, 0, 2513);
    			add_location(br4, file$6, 131, 2, 2580);
    			attr(div11, "class", "menu svelte-1rvgrtu");
    			add_location(div11, file$6, 132, 0, 2585);
    			add_location(br5, file$6, 133, 2, 2655);
    			attr(div12, "class", "menu svelte-1rvgrtu");
    			add_location(div12, file$6, 134, 0, 2660);
    			add_location(br6, file$6, 135, 2, 2729);
    			add_location(br7, file$6, 137, 2, 2792);
    			add_location(br8, file$6, 138, 2, 2799);
    			attr(div13, "class", "menu svelte-1rvgrtu");
    			add_location(div13, file$6, 136, 0, 2734);
    			attr(div14, "class", "dropdown-content svelte-1rvgrtu");
    			add_location(div14, file$6, 126, 2, 2413);
    			attr(div15, "class", "dropdown svelte-1rvgrtu");
    			add_location(div15, file$6, 123, 0, 2336);
    			add_location(br9, file$6, 146, 1, 2885);
    			set_style(div16, "margin-left", "25%");
    			set_style(div16, "margin-right", "25%");
    			attr(div16, "class", "svelte-1rvgrtu");
    			add_location(div16, file$6, 144, 0, 2830);
    			add_location(br10, file$6, 175, 0, 3308);
    			add_location(br11, file$6, 175, 4, 3312);

    			add_location(br12, file$6, 178, 0, 3327);
    			add_location(br13, file$6, 178, 4, 3331);
    			add_location(br14, file$6, 179, 0, 3336);
    			add_location(br15, file$6, 179, 4, 3340);
    			add_location(br16, file$6, 180, 0, 3345);
    			add_location(br17, file$6, 180, 4, 3349);

    			dispose = [
    				listen(div9, "click", ctx.click_handler),
    				listen(div10, "click", ctx.click_handler_1),
    				listen(div11, "click", ctx.click_handler_2),
    				listen(div12, "click", ctx.click_handler_3),
    				listen(div13, "click", ctx.click_handler_4)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			insert(target, t3, anchor);
    			insert(target, div7, anchor);
    			append(div7, div2);
    			append(div7, t5);
    			append(div7, div3);
    			append(div7, t7);
    			append(div7, br0);
    			append(div7, t8);
    			append(div7, div4);
    			append(div7, t10);
    			append(div7, div5);
    			append(div7, t12);
    			append(div7, div6);
    			insert(target, t14, anchor);
    			insert(target, div15, anchor);
    			append(div15, br1);
    			append(div15, t15);
    			append(div15, div8);
    			append(div15, t17);
    			append(div15, div14);
    			append(div14, br2);
    			append(div14, t18);
    			append(div14, div9);
    			append(div14, t20);
    			append(div14, br3);
    			append(div14, t21);
    			append(div14, div10);
    			append(div14, t23);
    			append(div14, br4);
    			append(div14, t24);
    			append(div14, div11);
    			append(div14, t26);
    			append(div14, br5);
    			append(div14, t27);
    			append(div14, div12);
    			append(div14, t29);
    			append(div14, br6);
    			append(div14, t30);
    			append(div14, div13);
    			append(div13, t31);
    			append(div13, br7);
    			append(div13, t32);
    			append(div13, br8);
    			append(div14, t33);
    			insert(target, t34, anchor);
    			insert(target, div16, anchor);
    			append(div16, br9);
    			append(div16, t35);
    			if (if_block0) if_block0.m(div16, null);
    			append(div16, t36);
    			if (if_block1) if_block1.m(div16, null);
    			append(div16, t37);
    			if (if_block2) if_block2.m(div16, null);
    			append(div16, t38);
    			if (if_block3) if_block3.m(div16, null);
    			append(div16, t39);
    			if (if_block4) if_block4.m(div16, null);
    			append(div16, t40);
    			if (if_block5) if_block5.m(div16, null);
    			insert(target, t41, anchor);
    			insert(target, br10, anchor);
    			insert(target, br11, anchor);
    			insert(target, t42, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t43, anchor);
    			insert(target, br12, anchor);
    			insert(target, br13, anchor);
    			insert(target, t44, anchor);
    			insert(target, br14, anchor);
    			insert(target, br15, anchor);
    			insert(target, t45, anchor);
    			insert(target, br16, anchor);
    			insert(target, br17, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.j === 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_5();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div16, t36);
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

    			if (ctx.j === 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_4();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div16, t37);
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

    			if (ctx.j === 2) {
    				if (!if_block2) {
    					if_block2 = create_if_block_3();
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div16, t38);
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

    			if (ctx.j === 3) {
    				if (!if_block3) {
    					if_block3 = create_if_block_2();
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div16, t39);
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

    			if (ctx.j === 4) {
    				if (!if_block4) {
    					if_block4 = create_if_block_1();
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div16, t40);
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

    			if (ctx.j === 5) {
    				if (!if_block5) {
    					if_block5 = create_if_block$6();
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div16, null);
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

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
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
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t1);
    				detach(div1);
    				detach(t3);
    				detach(div7);
    				detach(t14);
    				detach(div15);
    				detach(t34);
    				detach(div16);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();

    			if (detaching) {
    				detach(t41);
    				detach(br10);
    				detach(br11);
    				detach(t42);
    			}

    			if (default_slot) default_slot.d(detaching);

    			if (detaching) {
    				detach(t43);
    				detach(br12);
    				detach(br13);
    				detach(t44);
    				detach(br14);
    				detach(br15);
    				detach(t45);
    				detach(br16);
    				detach(br17);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { j = 0 } = $$props;

    	const writable_props = ['j'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Blog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler() {
    		const $$result = j = 0;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_1() {
    		const $$result = j = 1;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_2() {
    		const $$result = j = 2;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_3() {
    		const $$result = j = 3;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_4() {
    		const $$result = j = 5;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('j' in $$props) $$invalidate('j', j = $$props.j);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		j,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		$$slots,
    		$$scope
    	};
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["j"]);
    	}

    	get j() {
    		throw new Error("<Blog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set j(value) {
    		throw new Error("<Blog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.9.1 */

    function create_fragment$7(ctx) {
    	var current;

    	var blog = new Blog({ $$inline: true });

    	return {
    		c: function create() {
    			blog.$$.fragment.c();
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
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
