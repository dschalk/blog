
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
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
    function empty() {
        return text('');
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
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
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
            const new_on_destroy = on_mount.map(run).filter(is_function);
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

    /* src/Cow.svelte generated by Svelte v3.9.1 */

    const file = "src/Cow.svelte";

    function create_fragment(ctx) {
    	var div, t0, t1, t2;

    	return {
    		c: function create() {
    			div = element("div");
    			t0 = text(name);
    			t1 = text(" says ");
    			t2 = text(statement);
    			add_location(div, file, 5, 0, 62);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    let name = "Cow";

    let statement = '"Moo."';

    class Cow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/Monad.svelte generated by Svelte v3.9.1 */

    const file$1 = "src/Monad.svelte";

    // (106:1) {#if visible}
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
    			add_location(div, file$1, 106, 2, 2332);
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

    function create_fragment$1(ctx) {
    	var div, br0, br1, br2, t0, t1, br3, t2, span0, t4, span1, t6, span2, t8, p0, t10, p1, t12, p2, t14, pre0, t15, t16, p3, t18, pre1, t20, p4, t22, t23, t24, input, t25, p5, t26, t27, t28, t29_value = ctx.bonads(ctx.num) + "", t29, t30, span3, t32, pre2, t33, t34, p6, t36, p7, t38, p8, t40, p9, current, dispose;

    	var if_block =  create_if_block();

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			br3 = element("br");
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "The word \"monad\" has been around for centuries. Gottfried Leibniz published";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Monadology";
    			t6 = space();
    			span2 = element("span");
    			span2.textContent = "in 1714. The precursor to the familiar symbol of yin-yang, taijitu (太極圖), has a version with two dots added, has been given the august designation: \"The Great Monad\". A single note in music theory is called a monad. All of this is too tangential to warrant references. I Googled around a little to get it and you can too if the word \"monad\" interests you.";
    			t8 = space();
    			p0 = element("p");
    			p0.textContent = "Monads in the Haskell Programming Language were inspired by Category Theory monads. In order to be Category Theory monads, function must exist in a mathematically rigorous \"category\". Haskells objects and functions are not the objects and morphisms of Category Theory. Making a category out of most of Haskell's functions and types is an amusing pasttime for some people, but I doubt that it has any practical value.";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "So it should be no surprise that my JavaScript monads are not Category Theory monads. They do obey a JavaScript version of the Haskell monad laws, which are not a requirement in Haskell but are indicative of utility and robustness objects (including functions) don't constitute a category. But functions that hold values and compose with multiple functions that operate on their values behave like Category Theory monads enough to justify calling them \"monads\".";
    			t12 = space();
    			p2 = element("p");
    			p2.textContent = "Here's the definitions of three functions:";
    			t14 = space();
    			pre0 = element("pre");
    			t15 = text(ctx.monadDisplay);
    			t16 = space();
    			p3 = element("p");
    			p3.textContent = "And here is an anonymous monad followed by three functions and \"stop\". :";
    			t18 = space();
    			pre1 = element("pre");
    			pre1.textContent = "Monad(6)(sum(7))(prod(4))(v=>v-10)(stop) // 42";
    			t20 = space();
    			p4 = element("p");
    			p4.textContent = "Anonymous monads never interfere with other monads. The demonstration below illustrates this by running seven anonymous monads in rapid succession. The number you enter is \"num\" in";
    			t22 = space();
    			t23 = text(ctx.bonadsD);
    			t24 = space();
    			input = element("input");
    			t25 = space();
    			p5 = element("p");
    			t26 = text("num is ");
    			t27 = text(ctx.num);
    			t28 = text(" so bonads(num) returns ");
    			t29 = text(t29_value);
    			t30 = space();
    			span3 = element("span");
    			span3.textContent = "Named monads retain their values, even after they encounter \"stop\" and return the value of x held in the Monad closure. The following examples illustrate this:";
    			t32 = space();
    			pre2 = element("pre");
    			t33 = text(ctx.axe);
    			t34 = space();
    			p6 = element("p");
    			p6.textContent = "As expected, mon returns which is the \"foo()\" returned by by calling Monad(3):";
    			t36 = space();
    			p7 = element("p");
    			p7.textContent = "mon is still the foo() returned by Monad(). Because mon points to x in the context of its creation by Monad(), x will not be garbage collected. Care should be taken not to polute memory with useless x's.";
    			t38 = space();
    			p8 = element("p");
    			p8.textContent = "One reason Svelte is so fast and efficient is that it mutates variables and the attributes and methods of objects. Each module in a discrete global space.  When modules are small, applications are easy to organize and mutations don't have unforseen effects in other parts of applications. Svelte shook off the bonds of current conventional \"wisdom\" advocating immutability, virtual DOM, and assigning types to functions.";
    			t40 = space();
    			p9 = element("p");
    			p9.textContent = "The next entry in the monad series defines a variation of Monad that maintains and array of primitive data, function return values, and Promise resolution values. Functions have access to everything in the array when they execute.";
    			add_location(br0, file$1, 104, 0, 2302);
    			add_location(br1, file$1, 104, 4, 2306);
    			add_location(br2, file$1, 104, 8, 2310);
    			add_location(br3, file$1, 110, 1, 2498);
    			attr(span0, "class", "tao svelte-1dr4x6t");
    			add_location(span0, file$1, 111, 1, 2504);
    			set_style(span1, "font-style", "italic");
    			add_location(span1, file$1, 112, 0, 2607);
    			add_location(span2, file$1, 113, 0, 2662);
    			add_location(p0, file$1, 114, 0, 3032);
    			add_location(p1, file$1, 115, 0, 3458);
    			add_location(p2, file$1, 116, 0, 3928);
    			add_location(pre0, file$1, 117, 0, 3980);
    			add_location(p3, file$1, 118, 0, 4006);
    			add_location(pre1, file$1, 119, 0, 4088);
    			add_location(p4, file$1, 120, 0, 4148);
    			attr(input, "id", "one");
    			attr(input, "type", "number");
    			add_location(input, file$1, 122, 0, 4348);
    			add_location(p5, file$1, 123, 0, 4421);
    			attr(span3, "class", "tao svelte-1dr4x6t");
    			add_location(span3, file$1, 125, 0, 4481);
    			add_location(pre2, file$1, 126, 0, 4668);
    			add_location(p6, file$1, 130, 0, 4688);
    			add_location(p7, file$1, 132, 0, 4776);
    			add_location(p8, file$1, 134, 0, 4989);
    			add_location(p9, file$1, 135, 0, 5419);
    			set_style(div, "margin-left", "12%");
    			set_style(div, "margin-right", "12%");
    			add_location(div, file$1, 103, 0, 2249);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "input", ctx.bonads)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, br2);
    			append(div, t0);
    			if (if_block) if_block.m(div, null);
    			append(div, t1);
    			append(div, br3);
    			append(div, t2);
    			append(div, span0);
    			append(div, t4);
    			append(div, span1);
    			append(div, t6);
    			append(div, span2);
    			append(div, t8);
    			append(div, p0);
    			append(div, t10);
    			append(div, p1);
    			append(div, t12);
    			append(div, p2);
    			append(div, t14);
    			append(div, pre0);
    			append(pre0, t15);
    			append(div, t16);
    			append(div, p3);
    			append(div, t18);
    			append(div, pre1);
    			append(div, t20);
    			append(div, p4);
    			append(div, t22);
    			append(div, t23);
    			append(div, t24);
    			append(div, input);

    			set_input_value(input, ctx.num);

    			append(div, t25);
    			append(div, p5);
    			append(p5, t26);
    			append(p5, t27);
    			append(p5, t28);
    			append(p5, t29);
    			append(div, t30);
    			append(div, span3);
    			append(div, t32);
    			append(div, pre2);
    			append(pre2, t33);
    			append(div, t34);
    			append(div, p6);
    			append(div, t36);
    			append(div, p7);
    			append(div, t38);
    			append(div, p8);
    			append(div, t40);
    			append(div, p9);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (changed.num) set_input_value(input, ctx.num);

    			if (!current || changed.num) {
    				set_data(t27, ctx.num);
    			}

    			if ((!current || changed.num) && t29_value !== (t29_value = ctx.bonads(ctx.num) + "")) {
    				set_data(t29, t29_value);
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
    				detach(div);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function Monad (z) {
    var x = z;
    var foo = function foo (func) {
      if (func.name === "stop") return x
      else {
        x = func(x);
        return foo;
      }
    };
    return foo;
    }

    function instance($$self, $$props, $$invalidate) {
    	

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

    const prod = a => b => a*b;
    const sum = a => b => a+b;

    let num = 6;

    let bonads = function bonads(num) {
    return [Monad(num)(sum(7))(prod(4))(v=>v-10)(stop),
    Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
    Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
    Monad(num-3)(sum(7))(prod(4))(v=>v-10)(stop),
    Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
    Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
    Monad(num-0)(sum(7))(prod(4))(v=>v-10)(stop)]};


    let mona = bonads(num);
    console.log(mona);

    console.log("num is", num);

    	function input_input_handler() {
    		num = to_number(this.value);
    		$$invalidate('num', num);
    	}

    	$$self.$$.update = ($$dirty = { mona: 1, num: 1 }) => {
    		if ($$dirty.mona) ;
    		if ($$dirty.num) ;
    	};

    	return {
    		monadDisplay,
    		bonadsD,
    		axe,
    		num,
    		bonads,
    		input_input_handler
    	};
    }

    class Monad_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/Monad2.svelte generated by Svelte v3.9.1 */

    const file$2 = "src/Monad2.svelte";

    // (351:0) {#if j === 2}
    function create_if_block$1(ctx) {
    	var div_1, div_1_transition, current;

    	return {
    		c: function create() {
    			div_1 = element("div");
    			div_1.textContent = "ASYNCHRONOUS MONAD";
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "32px");
    			add_location(div_1, file$2, 351, 1, 8136);
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

    function create_fragment$2(ctx) {
    	var br0, br1, br2, t0, t1, br3, br4, t2, p0, t4, br5, br6, t5, button, t7, br7, br8, t8, span0, t10, span1, t11_value = ctx.O.c0 + "", t11, t12, t13_value = ctx.O.c1 + "", t13, t14, t15_value = ctx.O.c2 + "", t15, t16, t17_value = ctx.O.c3 + "", t17, t18, t19_value = ctx.O.c4 + "", t19, t20, t21_value = ctx.O.c5 + "", t21, t22, t23_value = ctx.O.c6 + "", t23, t24, t25_value = ctx.O.c7 + "", t25, t26, t27_value = ctx.O.c8 + "", t27, t28, t29_value = ctx.O.c9 + "", t29, t30, t31_value = ctx.O.c10 + "", t31, t32, t33_value = ctx.O.c11 + "", t33, t34, t35_value = ctx.O.c12 + "", t35, t36, t37_value = ctx.O.c13 + "", t37, t38, t39_value = ctx.O.c14 + "", t39, t40, br9, br10, t41, div0, t43, div1, t44_value = ctx.O.d0 + "", t44, t45, br11, t46, t47_value = ctx.O.d1 + "", t47, t48, br12, t49, t50_value = ctx.O.d2 + "", t50, t51, br13, t52, t53_value = ctx.O.d3 + "", t53, t54, br14, t55, t56_value = ctx.O.d4 + "", t56, t57, br15, t58, t59_value = ctx.O.d5 + "", t59, t60, br16, t61, t62_value = ctx.O.d6 + "", t62, t63, br17, t64, t65_value = ctx.O.d7 + "", t65, t66, br18, t67, t68_value = ctx.O.d8 + "", t68, t69, br19, t70, t71_value = ctx.O.d9 + "", t71, t72, br20, t73, t74_value = ctx.O.d10 + "", t74, t75, br21, t76, t77_value = ctx.O.d11 + "", t77, t78, br22, t79, t80_value = ctx.O.d12 + "", t80, t81, br23, t82, t83_value = ctx.O.d13 + "", t83, t84, br24, t85, t86_value = ctx.O.d14 + "", t86, t87, br25, t88, br26, t89, p1, t91, pre0, t92, t93, pre1, t94, t95, p2, pre2, t97, t98, p3, t100, pre3, t101, t102, p4, pre4, t104, t105, p5, pre5, t107, t108, p6, t110, br27, t111, span2, t113, a, current, dispose;

    	var if_block = (ctx.j === 2) && create_if_block$1();

    	return {
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
    			p0.textContent = "If you click execute multiple times in rapid succession, you will see that execution waits until previous runs have completed. This feature was implemented with the Boolean variable \"lock\".";
    			t4 = space();
    			br5 = element("br");
    			br6 = element("br");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Run Monad([2], \"test\")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))\n     (() => branch(\"test\", \"test_2\")(sqrtP)(cubeP)(()=>addP(O.test_2[2])\n     (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))\n     (() => resume(\"test\")(multP(4))(addP(6))))";
    			t7 = space();
    			br7 = element("br");
    			br8 = element("br");
    			t8 = space();
    			span0 = element("span");
    			span0.textContent = "The WebSockets server sent these pseudo-random numbers:";
    			t10 = space();
    			span1 = element("span");
    			t11 = text(t11_value);
    			t12 = text(", ");
    			t13 = text(t13_value);
    			t14 = text(", ");
    			t15 = text(t15_value);
    			t16 = text(", ");
    			t17 = text(t17_value);
    			t18 = text(", ");
    			t19 = text(t19_value);
    			t20 = text(", ");
    			t21 = text(t21_value);
    			t22 = text(", ");
    			t23 = text(t23_value);
    			t24 = text(", ");
    			t25 = text(t25_value);
    			t26 = text(", ");
    			t27 = text(t27_value);
    			t28 = text(", ");
    			t29 = text(t29_value);
    			t30 = text(", ");
    			t31 = text(t31_value);
    			t32 = text(", ");
    			t33 = text(t33_value);
    			t34 = text(", ");
    			t35 = text(t35_value);
    			t36 = text(", ");
    			t37 = text(t37_value);
    			t38 = text(", ");
    			t39 = text(t39_value);
    			t40 = space();
    			br9 = element("br");
    			br10 = element("br");
    			t41 = space();
    			div0 = element("div");
    			div0.textContent = "The web worker sent these results:";
    			t43 = space();
    			div1 = element("div");
    			t44 = text(t44_value);
    			t45 = space();
    			br11 = element("br");
    			t46 = space();
    			t47 = text(t47_value);
    			t48 = space();
    			br12 = element("br");
    			t49 = space();
    			t50 = text(t50_value);
    			t51 = space();
    			br13 = element("br");
    			t52 = space();
    			t53 = text(t53_value);
    			t54 = space();
    			br14 = element("br");
    			t55 = space();
    			t56 = text(t56_value);
    			t57 = space();
    			br15 = element("br");
    			t58 = space();
    			t59 = text(t59_value);
    			t60 = space();
    			br16 = element("br");
    			t61 = space();
    			t62 = text(t62_value);
    			t63 = space();
    			br17 = element("br");
    			t64 = space();
    			t65 = text(t65_value);
    			t66 = space();
    			br18 = element("br");
    			t67 = space();
    			t68 = text(t68_value);
    			t69 = space();
    			br19 = element("br");
    			t70 = space();
    			t71 = text(t71_value);
    			t72 = space();
    			br20 = element("br");
    			t73 = space();
    			t74 = text(t74_value);
    			t75 = space();
    			br21 = element("br");
    			t76 = space();
    			t77 = text(t77_value);
    			t78 = space();
    			br22 = element("br");
    			t79 = space();
    			t80 = text(t80_value);
    			t81 = space();
    			br23 = element("br");
    			t82 = space();
    			t83 = text(t83_value);
    			t84 = space();
    			br24 = element("br");
    			t85 = space();
    			t86 = text(t86_value);
    			t87 = space();
    			br25 = element("br");
    			t88 = space();
    			br26 = element("br");
    			t89 = space();
    			p1 = element("p");
    			p1.textContent = "There are many ways to display the behavior of monads returned by Monad(). For this demonstration, a simple object name,d \"O\" was created and Monad was modified to make the name,s of monads attributes pointing to the monads'internal arrays. Here's the revised definition of Monad.";
    			t91 = space();
    			pre0 = element("pre");
    			t92 = text(ctx.mon);
    			t93 = text("\nThe statement \"Monad(['value\"], 'key\")(x => 'This is the ' + x)(x => x + '.')(halt)\" attaches the the resulting monad to O as follows:\n");
    			pre1 = element("pre");
    			t94 = text(ctx.statement);
    			t95 = space();
    			p2 = element("p");
    			p2.textContent = "The demonstration procedure is initiated by calling factors().\n";
    			pre2 = element("pre");
    			t97 = text(ctx.fa);
    			t98 = space();
    			p3 = element("p");
    			p3.textContent = "factor() is called once every second until lock === false; then, lock is set to true and fact() is called. The lock assures that the procedures initiated by fact() will complete before fact() is called again.";
    			t100 = space();
    			pre3 = element("pre");
    			t101 = text(ctx.fac);
    			t102 = space();
    			p4 = element("p");
    			p4.textContent = "Messages are sent to the Haskell WebSockets server requesting random numbers between 1 and the integer specified at the end of the request. randomR from the System.Random library produces a number which is sent back to the browser with prefix \"BE#$42\". Messages from the server are parsed and processed in socket.onmessage, which requests the random number's prime decomposition from worker_O.\n";
    			pre4 = element("pre");
    			t104 = text(ctx.onmessServer);
    			t105 = space();
    			p5 = element("p");
    			p5.textContent = "Messages from the web worker are processed in worker_O.onmessage\n";
    			pre5 = element("pre");
    			t107 = text(ctx.onmessWorker);
    			t108 = space();
    			p6 = element("p");
    			p6.textContent = "When M === 14 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand().";
    			t110 = space();
    			br27 = element("br");
    			t111 = space();
    			span2 = element("span");
    			span2.textContent = "The code for this Svelte application is at";
    			t113 = space();
    			a = element("a");
    			a.textContent = "GitHub repository";
    			add_location(br0, file$2, 349, 0, 8108);
    			add_location(br1, file$2, 349, 4, 8112);
    			add_location(br2, file$2, 349, 8, 8116);
    			add_location(br3, file$2, 355, 0, 8296);
    			add_location(br4, file$2, 355, 4, 8300);
    			add_location(p0, file$2, 356, 0, 8305);
    			add_location(br5, file$2, 357, 0, 8504);
    			add_location(br6, file$2, 357, 4, 8508);
    			add_location(button, file$2, 358, 0, 8513);
    			add_location(br7, file$2, 362, 0, 8799);
    			add_location(br8, file$2, 362, 4, 8803);
    			set_style(span0, "color", "#EEBBBB");
    			add_location(span0, file$2, 363, 0, 8808);
    			add_location(span1, file$2, 364, 0, 8904);
    			add_location(br9, file$2, 365, 0, 9042);
    			add_location(br10, file$2, 365, 4, 9046);
    			set_style(div0, "color", "#EEBBBB");
    			add_location(div0, file$2, 366, 0, 9051);
    			add_location(br11, file$2, 369, 0, 9137);
    			add_location(br12, file$2, 371, 0, 9149);
    			add_location(br13, file$2, 373, 0, 9161);
    			add_location(br14, file$2, 375, 0, 9173);
    			add_location(br15, file$2, 377, 0, 9185);
    			add_location(br16, file$2, 379, 0, 9197);
    			add_location(br17, file$2, 381, 0, 9209);
    			add_location(br18, file$2, 383, 0, 9221);
    			add_location(br19, file$2, 385, 0, 9233);
    			add_location(br20, file$2, 387, 0, 9245);
    			add_location(br21, file$2, 389, 0, 9258);
    			add_location(br22, file$2, 391, 0, 9271);
    			add_location(br23, file$2, 393, 0, 9284);
    			add_location(br24, file$2, 395, 0, 9297);
    			add_location(br25, file$2, 397, 0, 9310);
    			add_location(div1, file$2, 367, 0, 9124);
    			add_location(br26, file$2, 399, 0, 9322);
    			add_location(p1, file$2, 400, 0, 9327);
    			add_location(pre0, file$2, 401, 0, 9616);
    			add_location(pre1, file$2, 403, 0, 9768);
    			add_location(p2, file$2, 404, 0, 9791);
    			add_location(pre2, file$2, 405, 0, 9858);
    			add_location(p3, file$2, 406, 0, 9874);
    			add_location(pre3, file$2, 407, 0, 10092);
    			add_location(p4, file$2, 408, 0, 10109);
    			add_location(pre4, file$2, 409, 0, 10507);
    			add_location(p5, file$2, 410, 0, 10533);
    			add_location(pre5, file$2, 411, 0, 10602);
    			add_location(p6, file$2, 412, 0, 10628);
    			add_location(br27, file$2, 413, 0, 10783);
    			add_location(span2, file$2, 414, 0, 10788);
    			attr(a, "href", "https://github.com/dschalk/blog/");
    			attr(a, "target", "_blank");
    			add_location(a, file$2, 415, 0, 10846);
    			dispose = listen(button, "click", ctx.factors);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t1, anchor);
    			insert(target, br3, anchor);
    			insert(target, br4, anchor);
    			insert(target, t2, anchor);
    			insert(target, p0, anchor);
    			insert(target, t4, anchor);
    			insert(target, br5, anchor);
    			insert(target, br6, anchor);
    			insert(target, t5, anchor);
    			insert(target, button, anchor);
    			insert(target, t7, anchor);
    			insert(target, br7, anchor);
    			insert(target, br8, anchor);
    			insert(target, t8, anchor);
    			insert(target, span0, anchor);
    			insert(target, t10, anchor);
    			insert(target, span1, anchor);
    			append(span1, t11);
    			append(span1, t12);
    			append(span1, t13);
    			append(span1, t14);
    			append(span1, t15);
    			append(span1, t16);
    			append(span1, t17);
    			append(span1, t18);
    			append(span1, t19);
    			append(span1, t20);
    			append(span1, t21);
    			append(span1, t22);
    			append(span1, t23);
    			append(span1, t24);
    			append(span1, t25);
    			append(span1, t26);
    			append(span1, t27);
    			append(span1, t28);
    			append(span1, t29);
    			append(span1, t30);
    			append(span1, t31);
    			append(span1, t32);
    			append(span1, t33);
    			append(span1, t34);
    			append(span1, t35);
    			append(span1, t36);
    			append(span1, t37);
    			append(span1, t38);
    			append(span1, t39);
    			insert(target, t40, anchor);
    			insert(target, br9, anchor);
    			insert(target, br10, anchor);
    			insert(target, t41, anchor);
    			insert(target, div0, anchor);
    			insert(target, t43, anchor);
    			insert(target, div1, anchor);
    			append(div1, t44);
    			append(div1, t45);
    			append(div1, br11);
    			append(div1, t46);
    			append(div1, t47);
    			append(div1, t48);
    			append(div1, br12);
    			append(div1, t49);
    			append(div1, t50);
    			append(div1, t51);
    			append(div1, br13);
    			append(div1, t52);
    			append(div1, t53);
    			append(div1, t54);
    			append(div1, br14);
    			append(div1, t55);
    			append(div1, t56);
    			append(div1, t57);
    			append(div1, br15);
    			append(div1, t58);
    			append(div1, t59);
    			append(div1, t60);
    			append(div1, br16);
    			append(div1, t61);
    			append(div1, t62);
    			append(div1, t63);
    			append(div1, br17);
    			append(div1, t64);
    			append(div1, t65);
    			append(div1, t66);
    			append(div1, br18);
    			append(div1, t67);
    			append(div1, t68);
    			append(div1, t69);
    			append(div1, br19);
    			append(div1, t70);
    			append(div1, t71);
    			append(div1, t72);
    			append(div1, br20);
    			append(div1, t73);
    			append(div1, t74);
    			append(div1, t75);
    			append(div1, br21);
    			append(div1, t76);
    			append(div1, t77);
    			append(div1, t78);
    			append(div1, br22);
    			append(div1, t79);
    			append(div1, t80);
    			append(div1, t81);
    			append(div1, br23);
    			append(div1, t82);
    			append(div1, t83);
    			append(div1, t84);
    			append(div1, br24);
    			append(div1, t85);
    			append(div1, t86);
    			append(div1, t87);
    			append(div1, br25);
    			insert(target, t88, anchor);
    			insert(target, br26, anchor);
    			insert(target, t89, anchor);
    			insert(target, p1, anchor);
    			insert(target, t91, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t92);
    			insert(target, t93, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t94);
    			insert(target, t95, anchor);
    			insert(target, p2, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t97);
    			insert(target, t98, anchor);
    			insert(target, p3, anchor);
    			insert(target, t100, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t101);
    			insert(target, t102, anchor);
    			insert(target, p4, anchor);
    			insert(target, pre4, anchor);
    			append(pre4, t104);
    			insert(target, t105, anchor);
    			insert(target, p5, anchor);
    			insert(target, pre5, anchor);
    			append(pre5, t107);
    			insert(target, t108, anchor);
    			insert(target, p6, anchor);
    			insert(target, t110, anchor);
    			insert(target, br27, anchor);
    			insert(target, t111, anchor);
    			insert(target, span2, anchor);
    			insert(target, t113, anchor);
    			insert(target, a, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.j === 2) {
    				if (!if_block) {
    					if_block = create_if_block$1();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				} else {
    									transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			if ((!current || changed.O) && t11_value !== (t11_value = ctx.O.c0 + "")) {
    				set_data(t11, t11_value);
    			}

    			if ((!current || changed.O) && t13_value !== (t13_value = ctx.O.c1 + "")) {
    				set_data(t13, t13_value);
    			}

    			if ((!current || changed.O) && t15_value !== (t15_value = ctx.O.c2 + "")) {
    				set_data(t15, t15_value);
    			}

    			if ((!current || changed.O) && t17_value !== (t17_value = ctx.O.c3 + "")) {
    				set_data(t17, t17_value);
    			}

    			if ((!current || changed.O) && t19_value !== (t19_value = ctx.O.c4 + "")) {
    				set_data(t19, t19_value);
    			}

    			if ((!current || changed.O) && t21_value !== (t21_value = ctx.O.c5 + "")) {
    				set_data(t21, t21_value);
    			}

    			if ((!current || changed.O) && t23_value !== (t23_value = ctx.O.c6 + "")) {
    				set_data(t23, t23_value);
    			}

    			if ((!current || changed.O) && t25_value !== (t25_value = ctx.O.c7 + "")) {
    				set_data(t25, t25_value);
    			}

    			if ((!current || changed.O) && t27_value !== (t27_value = ctx.O.c8 + "")) {
    				set_data(t27, t27_value);
    			}

    			if ((!current || changed.O) && t29_value !== (t29_value = ctx.O.c9 + "")) {
    				set_data(t29, t29_value);
    			}

    			if ((!current || changed.O) && t31_value !== (t31_value = ctx.O.c10 + "")) {
    				set_data(t31, t31_value);
    			}

    			if ((!current || changed.O) && t33_value !== (t33_value = ctx.O.c11 + "")) {
    				set_data(t33, t33_value);
    			}

    			if ((!current || changed.O) && t35_value !== (t35_value = ctx.O.c12 + "")) {
    				set_data(t35, t35_value);
    			}

    			if ((!current || changed.O) && t37_value !== (t37_value = ctx.O.c13 + "")) {
    				set_data(t37, t37_value);
    			}

    			if ((!current || changed.O) && t39_value !== (t39_value = ctx.O.c14 + "")) {
    				set_data(t39, t39_value);
    			}

    			if ((!current || changed.O) && t44_value !== (t44_value = ctx.O.d0 + "")) {
    				set_data(t44, t44_value);
    			}

    			if ((!current || changed.O) && t47_value !== (t47_value = ctx.O.d1 + "")) {
    				set_data(t47, t47_value);
    			}

    			if ((!current || changed.O) && t50_value !== (t50_value = ctx.O.d2 + "")) {
    				set_data(t50, t50_value);
    			}

    			if ((!current || changed.O) && t53_value !== (t53_value = ctx.O.d3 + "")) {
    				set_data(t53, t53_value);
    			}

    			if ((!current || changed.O) && t56_value !== (t56_value = ctx.O.d4 + "")) {
    				set_data(t56, t56_value);
    			}

    			if ((!current || changed.O) && t59_value !== (t59_value = ctx.O.d5 + "")) {
    				set_data(t59, t59_value);
    			}

    			if ((!current || changed.O) && t62_value !== (t62_value = ctx.O.d6 + "")) {
    				set_data(t62, t62_value);
    			}

    			if ((!current || changed.O) && t65_value !== (t65_value = ctx.O.d7 + "")) {
    				set_data(t65, t65_value);
    			}

    			if ((!current || changed.O) && t68_value !== (t68_value = ctx.O.d8 + "")) {
    				set_data(t68, t68_value);
    			}

    			if ((!current || changed.O) && t71_value !== (t71_value = ctx.O.d9 + "")) {
    				set_data(t71, t71_value);
    			}

    			if ((!current || changed.O) && t74_value !== (t74_value = ctx.O.d10 + "")) {
    				set_data(t74, t74_value);
    			}

    			if ((!current || changed.O) && t77_value !== (t77_value = ctx.O.d11 + "")) {
    				set_data(t77, t77_value);
    			}

    			if ((!current || changed.O) && t80_value !== (t80_value = ctx.O.d12 + "")) {
    				set_data(t80, t80_value);
    			}

    			if ((!current || changed.O) && t83_value !== (t83_value = ctx.O.d13 + "")) {
    				set_data(t83, t83_value);
    			}

    			if ((!current || changed.O) && t86_value !== (t86_value = ctx.O.d14 + "")) {
    				set_data(t86, t86_value);
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
    				detach(br2);
    				detach(t0);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(br3);
    				detach(br4);
    				detach(t2);
    				detach(p0);
    				detach(t4);
    				detach(br5);
    				detach(br6);
    				detach(t5);
    				detach(button);
    				detach(t7);
    				detach(br7);
    				detach(br8);
    				detach(t8);
    				detach(span0);
    				detach(t10);
    				detach(span1);
    				detach(t40);
    				detach(br9);
    				detach(br10);
    				detach(t41);
    				detach(div0);
    				detach(t43);
    				detach(div1);
    				detach(t88);
    				detach(br26);
    				detach(t89);
    				detach(p1);
    				detach(t91);
    				detach(pre0);
    				detach(t93);
    				detach(pre1);
    				detach(t95);
    				detach(p2);
    				detach(pre2);
    				detach(t98);
    				detach(p3);
    				detach(t100);
    				detach(pre3);
    				detach(t102);
    				detach(p4);
    				detach(pre4);
    				detach(t105);
    				detach(p5);
    				detach(pre5);
    				detach(t108);
    				detach(p6);
    				detach(t110);
    				detach(br27);
    				detach(t111);
    				detach(span2);
    				detach(t113);
    				detach(a);
    			}

    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

        let j;

       var O = new Object();

       var M = -1;
       var N = -1;
       var Q = -1;

       var lock = false;

       var Monad = function Monad ( AR = [], name = "generic"  )  {
         var p, run;
         var ar = AR.slice();
         var name = name;
         O[name] = ar; $$invalidate('O', O);
         let x = O[name].pop();
         return run = (function run (x) {
         if (x != undefined && x === x  && x !== false
           && x.name !== "f_" && x.name !== "halt" ) {
             O[name] = O[name].concat(x); $$invalidate('O', O);
           }       function f_ (func) {
             if (func === 'halt' || func === 'S') return O[name];
             else if (typeof func !== "function") p = func;
             else if (x instanceof Promise) p = x.then(v => func(v));
             else p = func(x);
             return run(p);
           }       return f_;
         })(x);
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
           $$invalidate('Q', Q = Q + 1);
           Monad([v[3]], "c"+Q);
           worker_O.postMessage([v[3]]);
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
             factors();
             factors();
             factors();
           } else {
             login();
           }
         }, 200);
       }
       var groupDelete = function groupDelete (ob, x) {
          for (var z in ob) if (z.startsWith("x")) delete ob[z];
       };

       var clearOb = function clearOb (ob) {
          for (var x in ob) delete ob[x];
       };

       function factors () {
          if (lock === false) {
             $$invalidate('lock', lock = true);
             clearOb(O);
             $$invalidate('N', N = -1);
             $$invalidate('M', M = -1);
             $$invalidate('Q', Q = -1);
             groupDelete(O);
             groupDelete(O);
             fact();
          }
          else {
             setTimeout(()=> {
             factors();
          },1000);
          }
       }

       var fact = function fact () {
          socket.send("BE#$42,solo,name,10000");
          socket.send("BE#$42,solo,name,1000");
          socket.send("BE#$42,solo,name,100000");
          socket.send("BE#$42,solo,name,100000");
          socket.send("BE#$42,solo,name,10000");
          socket.send("BE#$42,solo,name,100000");
          socket.send("BE#$42,solo,name,1000");
          socket.send("BE#$42,solo,name,1000");
          socket.send("BE#$42,solo,name,100000");
          socket.send("BE#$42,solo,name,10000");
          socket.send("BE#$42,solo,name,100000");
          socket.send("BE#$42,solo,name,100");
          socket.send("BE#$42,solo,name,100000");
          socket.send("BE#$42,solo,name,10000");
          socket.send("BE#$42,solo,name,100000");

       };

       /*   if (countKeys(O) > 34) {
               setTimeout( () => {
               N = -1;
               M = -1;
               Q = -1;
               clearOb(O);
               factors();
           },700)
       } */

       var worker_O = new Worker('worker_O.js');

       worker_O.onmessage = e => {
         $$invalidate('M', M = M = M + 1); $$invalidate('M', M);
         Monad([e.data], "d"+M);
         if (M === 14) {
            $$invalidate('M', M = -1);
            $$invalidate('N', N = -1);
           $$invalidate('lock', lock = false);
         }
       };
      var mon = `   var Monad = function Monad ( AR = [], name, = "generic"  )  {
       var f_, p, run;
       var ar = AR.slice();
       var name, = name,;
       O[name,] = ar;y-value pairs on O out of each monad's monad's name, and array
       let x = O[name,].pop();
       return run = (function run (x) {
       if (x != undefined && x === x  && x !== false
         && x.name, !== "f_" && x.name, !== "halt" ) {
           O[name,] = O[name,].concat(x)
         };
         function f_ (func) {
           if (func === 'halt' || func === 'S') return O[name,];
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
     if (lock === false) {
        lock = true;
        clearOb(O);
        N = -1;
        M = -1;
        Q = -1;
        groupDelete(O, "c");
        groupDelete(O, "d");
        fact();
     }
     else {
        setTimeout(()=> {
        factors()
     },1000)
     }
  }`;

    var fac = `  var fact = function fact () {
   socket.send("BE#$42,solo,name,10000")
   socket.send("BE#$42,solo,name,1000")
   socket.send("BE#$42,solo,name,100000")
   socket.send("BE#$42,solo,name,100000")
   socket.send("BE#$42,solo,name,10000")
   socket.send("BE#$42,solo,name,100000")
   socket.send("BE#$42,solo,name,1000000")
   socket.send("BE#$42,solo,name,1000")
   socket.send("BE#$42,solo,name,1000000")
   socket.send("BE#$42,solo,name,10000")
   socket.send("BE#$42,solo,name,100000")
   socket.send("BE#$42,solo,name,100000")
   socket.send("BE#$42,solo,name,100000")
   socket.send("BE#$42,solo,name,10000")
   socket.send("BE#$42,solo,name,100000")

}`;

      var onmessServer = `  ar v = e.data.split(',');
  if (v[0] === "BE#$42") {
    Q = Q + 1;
    Monad([v[3]], "c"+Q);
    worker_O.postMessage([v[3]])
  }
}  `;

      var onmessWorker = `    worker_O.onmessage = e => {
     M = M = M + 1;
     Monad([e.data], "d"+M);
     if (M === 14) {
        M = -1;
        N = -1;
       lock = false;
     }<br>
<h2>O.test is {O.test}</h2>
<h2>O.test_2 is {O.test_2}</h2>
<br>
   } `;

    	$$self.$$.update = ($$dirty = { j: 1, O: 1, M: 1, N: 1, T: 1, Q: 1, lock: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.O) ;
    		if ($$dirty.M) ;
    		if ($$dirty.N) ;
    		if ($$dirty.T) ;
    		if ($$dirty.Q) ;
    		if ($$dirty.lock) ;
    	};

    	return {
    		j,
    		O,
    		factors,
    		mon,
    		statement,
    		fa,
    		fac,
    		onmessServer,
    		onmessWorker
    	};
    }

    class Monad2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/Monad3.svelte generated by Svelte v3.9.1 */

    const file$3 = "src/Monad3.svelte";

    function create_fragment$3(ctx) {
    	var div_1, br0, br1, t0, div_1_transition, t1, br2, t2, h20, t3, t4_value = ctx.O.test + "", t4, t5, h21, t6, t7_value = ctx.O.test_2 + "", t7, t8, br3, t9, button0, t11, br4, t12, p0, t14, pre0, t15, t16, p1, t18, pre1, t19, t20, p2, t22, pre2, t23, t24, br5, t25, button1, t27, br6, t28, h22, t29, t30_value = ctx.O.test + "", t30, t31, h23, t32, t33_value = ctx.O.test_2 + "", t33, t34, br7, t35, br8, t36, span0, t38, span1, t40, span2, current, dispose;

    	return {
    		c: function create() {
    			div_1 = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t0 = text("\nHandling Promises With Monads");
    			t1 = space();
    			br2 = element("br");
    			t2 = space();
    			h20 = element("h2");
    			t3 = text("O.test is ");
    			t4 = text(t4_value);
    			t5 = space();
    			h21 = element("h2");
    			t6 = text("O.test_2 is ");
    			t7 = text(t7_value);
    			t8 = space();
    			br3 = element("br");
    			t9 = space();
    			button0 = element("button");
    			button0.textContent = "START";
    			t11 = space();
    			br4 = element("br");
    			t12 = space();
    			p0 = element("p");
    			p0.textContent = "Here's the modified monad constructor:";
    			t14 = space();
    			pre0 = element("pre");
    			t15 = text(ctx.mon);
    			t16 = space();
    			p1 = element("p");
    			p1.textContent = "After monads encounter \"halt\", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:";
    			t18 = space();
    			pre1 = element("pre");
    			t19 = text(ctx.fs);
    			t20 = space();
    			p2 = element("p");
    			p2.textContent = "This is the statement that produces the observed results when \"START\" is clicked.";
    			t22 = space();
    			pre2 = element("pre");
    			t23 = text(ctx.code);
    			t24 = space();
    			br5 = element("br");
    			t25 = space();
    			button1 = element("button");
    			button1.textContent = "START";
    			t27 = space();
    			br6 = element("br");
    			t28 = space();
    			h22 = element("h2");
    			t29 = text("O.test is ");
    			t30 = text(t30_value);
    			t31 = space();
    			h23 = element("h2");
    			t32 = text("O.test_2 is ");
    			t33 = text(t33_value);
    			t34 = space();
    			br7 = element("br");
    			t35 = space();
    			br8 = element("br");
    			t36 = space();
    			span0 = element("span");
    			span0.textContent = "Notice the statement:";
    			t38 = space();
    			span1 = element("span");
    			span1.textContent = "()=>addP(O.test_2[2])(O.test_2[1])";
    			t40 = space();
    			span2 = element("span");
    			span2.textContent = ". Promises in chains of ES6 Promises can't access previous Promise resolution values. One way to get access to prior resolution values is to encapsulate Promise chains in Monad(). This also makes it convenient to resume or branch from terminated computation chains; and this can be accomplished without naming the chains.";
    			add_location(br0, file$3, 209, 1, 5074);
    			add_location(br1, file$3, 209, 5, 5078);
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "32px");
    			add_location(div_1, file$3, 208, 1, 4946);
    			add_location(br2, file$3, 211, 44, 5157);
    			add_location(h20, file$3, 212, 0, 5162);
    			add_location(h21, file$3, 213, 0, 5190);
    			add_location(br3, file$3, 213, 44, 5234);
    			add_location(button0, file$3, 214, 0, 5239);
    			add_location(br4, file$3, 214, 44, 5283);
    			add_location(p0, file$3, 215, 0, 5288);
    			add_location(pre0, file$3, 216, 0, 5336);
    			add_location(p1, file$3, 217, 0, 5353);
    			add_location(pre1, file$3, 218, 0, 5564);
    			add_location(p2, file$3, 219, 0, 5580);
    			add_location(pre2, file$3, 220, 0, 5671);
    			add_location(br5, file$3, 220, 44, 5715);
    			add_location(button1, file$3, 221, 0, 5720);
    			add_location(br6, file$3, 224, 0, 5764);
    			add_location(h22, file$3, 225, 0, 5769);
    			add_location(h23, file$3, 226, 0, 5797);
    			add_location(br7, file$3, 227, 0, 5829);
    			add_location(br8, file$3, 229, 0, 5835);
    			attr(span0, "class", "tao");
    			add_location(span0, file$3, 230, 0, 5840);
    			set_style(span1, "color", "#AAFFAA");
    			add_location(span1, file$3, 231, 0, 5891);
    			add_location(span2, file$3, 232, 0, 5964);

    			dispose = [
    				listen(button0, "click", ctx.start),
    				listen(button1, "click", ctx.start)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div_1, anchor);
    			append(div_1, br0);
    			append(div_1, br1);
    			append(div_1, t0);
    			insert(target, t1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t2, anchor);
    			insert(target, h20, anchor);
    			append(h20, t3);
    			append(h20, t4);
    			insert(target, t5, anchor);
    			insert(target, h21, anchor);
    			append(h21, t6);
    			append(h21, t7);
    			insert(target, t8, anchor);
    			insert(target, br3, anchor);
    			insert(target, t9, anchor);
    			insert(target, button0, anchor);
    			insert(target, t11, anchor);
    			insert(target, br4, anchor);
    			insert(target, t12, anchor);
    			insert(target, p0, anchor);
    			insert(target, t14, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t15);
    			insert(target, t16, anchor);
    			insert(target, p1, anchor);
    			insert(target, t18, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t19);
    			insert(target, t20, anchor);
    			insert(target, p2, anchor);
    			insert(target, t22, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t23);
    			insert(target, t24, anchor);
    			insert(target, br5, anchor);
    			insert(target, t25, anchor);
    			insert(target, button1, anchor);
    			insert(target, t27, anchor);
    			insert(target, br6, anchor);
    			insert(target, t28, anchor);
    			insert(target, h22, anchor);
    			append(h22, t29);
    			append(h22, t30);
    			insert(target, t31, anchor);
    			insert(target, h23, anchor);
    			append(h23, t32);
    			append(h23, t33);
    			insert(target, t34, anchor);
    			insert(target, br7, anchor);
    			insert(target, t35, anchor);
    			insert(target, br8, anchor);
    			insert(target, t36, anchor);
    			insert(target, span0, anchor);
    			insert(target, t38, anchor);
    			insert(target, span1, anchor);
    			insert(target, t40, anchor);
    			insert(target, span2, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.O) && t4_value !== (t4_value = ctx.O.test + "")) {
    				set_data(t4, t4_value);
    			}

    			if ((!current || changed.O) && t7_value !== (t7_value = ctx.O.test_2 + "")) {
    				set_data(t7, t7_value);
    			}

    			if ((!current || changed.O) && t30_value !== (t30_value = ctx.O.test + "")) {
    				set_data(t30, t30_value);
    			}

    			if ((!current || changed.O) && t33_value !== (t33_value = ctx.O.test_2 + "")) {
    				set_data(t33, t33_value);
    			}
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
    				detach(t1);
    				detach(br2);
    				detach(t2);
    				detach(h20);
    				detach(t5);
    				detach(h21);
    				detach(t8);
    				detach(br3);
    				detach(t9);
    				detach(button0);
    				detach(t11);
    				detach(br4);
    				detach(t12);
    				detach(p0);
    				detach(t14);
    				detach(pre0);
    				detach(t16);
    				detach(p1);
    				detach(t18);
    				detach(pre1);
    				detach(t20);
    				detach(p2);
    				detach(t22);
    				detach(pre2);
    				detach(t24);
    				detach(br5);
    				detach(t25);
    				detach(button1);
    				detach(t27);
    				detach(br6);
    				detach(t28);
    				detach(h22);
    				detach(t31);
    				detach(h23);
    				detach(t34);
    				detach(br7);
    				detach(t35);
    				detach(br8);
    				detach(t36);
    				detach(span0);
    				detach(t38);
    				detach(span1);
    				detach(t40);
    				detach(span2);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function wait$1(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    async function squareP (x) {
        await wait$1(100);
        return x*x;
      }

    async function cubeP (x) {
        await wait$1(300);
        return x*x*x;
      }

    async function sqrtP (x) {
        await wait$1(900);
        return x**(1/2)
      }

    function instance$2($$self, $$props, $$invalidate) {

        var divP = a => async b => {
          await wait$1 (300);
          return b/a;
        };

        var addP = x => async y => {
          await wait$1(900);
          return x + y;
        };

        var multP = x => async y => {
          await wait$1(300);
          return x * y;
        };

       var O = new Object();

       var Monad = function Monad ( AR = [], name = "generic"  )  {
         var p, run;
         var ar = AR.slice();
         var name = name;
         O[name] = ar; $$invalidate('O', O);
         let x = O[name].pop();
         return run = (function run (x) {
           if (x instanceof Promise) x.then(y => {
             if (y != undefined && y == y && y.name !== "f_") {
             O[name] = O[name].concat(y); $$invalidate('O', O);
             }
           });
           if (!(x instanceof Promise)) {
              if (x != undefined && x == x) {
                 O[name] = O[name].concat(x); $$invalidate('O', O);
              }
           }
           function f_ (func) {
             if (func === 'halt' || func === 'S') return O[name].slice();
             else if (typeof func !== "function") p = func;
             else if (x instanceof Promise) p = x.then(v => func(v));
             else p = func(x);
             return run(p);
           }       return f_;
         })(x);
      };

       var branch = function branch (s,s2) {return Monad(O[s].slice()  , s2)};
       var resume = function resume (s) {return Monad(O[s], s)};

       Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
       (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
       (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
       (() => resume("test")(multP(4))(addP(6))));


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

      var start = function start () {
         if (!lok) {
           lok = true;
           setTimeout(() => { const $$result = lok = false; return $$result; },3000 );
           $$invalidate('O', O = {});
           Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
           (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
           (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
           (() => resume("test")(multP(4))(addP(6)))); }
         else {
           setTimeout(() => start(),300);
         }
      };

    var fs = `   var branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
   var resume = function resume (s) {return Monad(O[s], s)}`;
    var code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
     (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
     (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
     (() => resume("test")(multP(4))(addP(6))))`;

    	$$self.$$.update = ($$dirty = { j: 1, O: 1, M: 1, N: 1, T: 1, Q: 1, lock: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.O) ;
    		if ($$dirty.M) ;
    		if ($$dirty.N) ;
    		if ($$dirty.T) ;
    		if ($$dirty.Q) ;
    		if ($$dirty.lock) ;
    	};

    	return { O, mon, start, fs, code };
    }

    class Monad3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/Haskell.svelte generated by Svelte v3.9.1 */

    const file$4 = "src/Haskell.svelte";

    // (30:0) {#if visible}
    function create_if_block$2(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nHASKELL TUTORIAL SUPPLEMENT");
    			add_location(br0, file$4, 31, 1, 721);
    			add_location(br1, file$4, 31, 5, 725);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$4, 30, 1, 594);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, t);
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
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, span0, t10, a0, t12, br0, t13, pre, t15, p4, t17, span1, t19, a1, t21, br1, t22, br2, t23, span2, t25, a2, t27, span3, t29, a3, current;

    	var if_block =  create_if_block$2();

    	return {
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
    			p3.textContent = "The highly unsafe primitive unsafeCoerce converts a value from any type to any other type. Needless to say, if you use this function, it is your responsibility to ensure that the old and new types have identical internal representations, in order to prevent runtime corruption.";
    			t8 = space();
    			span0 = element("span");
    			span0.textContent = "The only function in this library is unsafeCoerce :: a -> b. You can read more about it at";
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
    			add_location(p0, file$4, 36, 0, 773);
    			add_location(p1, file$4, 37, 0, 1156);
    			attr(p2, "id", "large");
    			attr(p2, "class", "svelte-hw6ke3");
    			add_location(p2, file$4, 38, 0, 1603);
    			add_location(p3, file$4, 39, 0, 1637);
    			attr(span0, "class", "tao");
    			add_location(span0, file$4, 40, 0, 1924);
    			attr(a0, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$4, 41, 0, 2042);
    			add_location(br0, file$4, 42, 0, 2163);
    			add_location(pre, file$4, 43, 0, 2170);
    			add_location(p4, file$4, 44, 0, 2197);
    			attr(span1, "class", "tao");
    			add_location(span1, file$4, 45, 0, 2759);
    			attr(a1, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$4, 46, 0, 2815);
    			add_location(br1, file$4, 47, 0, 2942);
    			add_location(br2, file$4, 48, 0, 2949);
    			attr(span2, "class", "tao");
    			add_location(span2, file$4, 49, 0, 2956);
    			attr(a2, "href", "https://wiki.haskell.org/Unsafe_functions");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$4, 50, 0, 3065);
    			add_location(span3, file$4, 51, 0, 3166);
    			attr(a3, "href", "https://wiki.haskell.org/Top_level_mutable_state");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$4, 52, 0, 3254);
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
    			insert(target, span0, anchor);
    			insert(target, t10, anchor);
    			insert(target, a0, anchor);
    			insert(target, t12, anchor);
    			insert(target, br0, anchor);
    			insert(target, t13, anchor);
    			insert(target, pre, anchor);
    			insert(target, t15, anchor);
    			insert(target, p4, anchor);
    			insert(target, t17, anchor);
    			insert(target, span1, anchor);
    			insert(target, t19, anchor);
    			insert(target, a1, anchor);
    			insert(target, t21, anchor);
    			insert(target, br1, anchor);
    			insert(target, t22, anchor);
    			insert(target, br2, anchor);
    			insert(target, t23, anchor);
    			insert(target, span2, anchor);
    			insert(target, t25, anchor);
    			insert(target, a2, anchor);
    			insert(target, t27, anchor);
    			insert(target, span3, anchor);
    			insert(target, t29, anchor);
    			insert(target, a3, anchor);
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
    				detach(span0);
    				detach(t10);
    				detach(a0);
    				detach(t12);
    				detach(br0);
    				detach(t13);
    				detach(pre);
    				detach(t15);
    				detach(p4);
    				detach(t17);
    				detach(span1);
    				detach(t19);
    				detach(a1);
    				detach(t21);
    				detach(br1);
    				detach(t22);
    				detach(br2);
    				detach(t23);
    				detach(span2);
    				detach(t25);
    				detach(a2);
    				detach(t27);
    				detach(span3);
    				detach(t29);
    				detach(a3);
    			}
    		}
    	};
    }

    function instance$3($$self) {

    	return {};
    }

    class Haskell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/Bugs.svelte generated by Svelte v3.9.1 */

    const file$5 = "src/Bugs.svelte";

    // (12:0) {#if visible}
    function create_if_block$3(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nCOMPLETE ERADICATION OF BED BUGS");
    			add_location(br0, file$5, 13, 1, 522);
    			add_location(br1, file$5, 13, 5, 526);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$5, 12, 1, 394);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, t);
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
    	var t0, p0, t2, span0, t4, span1, t6, h3, t8, ul, li0, t10, li1, t12, li2, t14, li3, t16, li4, t18, li5, t20, li6, t22, li7, t24, li8, t26, p1, t28, p2, t30, p3, t32, p4, t34, p5, t36, p6, t38, p7, current;

    	var if_block =  create_if_block$3();

    	return {
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
    			add_location(p0, file$5, 17, 0, 578);
    			add_location(span0, file$5, 18, 0, 1032);
    			set_style(span1, "font-weight", "900");
    			set_style(span1, "color", "#ddff00");
    			add_location(span1, file$5, 19, 0, 1180);
    			add_location(h3, file$5, 20, 0, 1280);
    			add_location(li0, file$5, 22, 0, 1325);
    			add_location(li1, file$5, 23, 0, 1384);
    			add_location(li2, file$5, 24, 0, 1451);
    			add_location(li3, file$5, 25, 0, 1544);
    			add_location(li4, file$5, 26, 0, 1625);
    			add_location(li5, file$5, 27, 0, 1693);
    			add_location(li6, file$5, 28, 0, 1760);
    			add_location(li7, file$5, 29, 0, 1865);
    			add_location(li8, file$5, 30, 0, 1953);
    			add_location(ul, file$5, 21, 0, 1320);
    			add_location(p1, file$5, 32, 0, 2052);
    			add_location(p2, file$5, 33, 0, 2255);
    			add_location(p3, file$5, 34, 0, 2466);
    			add_location(p4, file$5, 35, 0, 2799);
    			add_location(p5, file$5, 38, 0, 3046);
    			add_location(p6, file$5, 39, 0, 3312);
    			add_location(p7, file$5, 40, 0, 3642);
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
    			insert(target, h3, anchor);
    			insert(target, t8, anchor);
    			insert(target, ul, anchor);
    			append(ul, li0);
    			append(ul, t10);
    			append(ul, li1);
    			append(ul, t12);
    			append(ul, li2);
    			append(ul, t14);
    			append(ul, li3);
    			append(ul, t16);
    			append(ul, li4);
    			append(ul, t18);
    			append(ul, li5);
    			append(ul, t20);
    			append(ul, li6);
    			append(ul, t22);
    			append(ul, li7);
    			append(ul, t24);
    			append(ul, li8);
    			insert(target, t26, anchor);
    			insert(target, p1, anchor);
    			insert(target, t28, anchor);
    			insert(target, p2, anchor);
    			insert(target, t30, anchor);
    			insert(target, p3, anchor);
    			insert(target, t32, anchor);
    			insert(target, p4, anchor);
    			insert(target, t34, anchor);
    			insert(target, p5, anchor);
    			insert(target, t36, anchor);
    			insert(target, p6, anchor);
    			insert(target, t38, anchor);
    			insert(target, p7, anchor);
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
    				detach(h3);
    				detach(t8);
    				detach(ul);
    				detach(t26);
    				detach(p1);
    				detach(t28);
    				detach(p2);
    				detach(t30);
    				detach(p3);
    				detach(t32);
    				detach(p4);
    				detach(t34);
    				detach(p5);
    				detach(t36);
    				detach(p6);
    				detach(t38);
    				detach(p7);
    			}
    		}
    	};
    }

    function instance$4($$self) {

    	return {};
    }

    class Bugs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.9.1 */

    const file$6 = "src/Matrix.svelte";

    // (151:0) {#if visible}
    function create_if_block$4(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\n A LITTLE SVELTE MODULE");
    			add_location(br0, file$6, 152, 1, 4115);
    			add_location(br1, file$6, 152, 5, 4119);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$6, 151, 1, 3987);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, t);
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

    function create_fragment$6(ctx) {
    	var t0, div3, div1, p0, t2, p1, t4, br0, t5, br1, t6, button0, t8, br2, t9, br3, t10, div0, button1, t11, t12, br4, t13, button2, t15, br5, t16, br6, t17, div2, br7, br8, br9, br10, br11, br12, br13, br14, br15, br16, t18, button3, t19_value = ctx.cache[ctx.j][0] + "", t19, t20, button4, t21_value = ctx.cache[ctx.j][1] + "", t21, t22, button5, t23_value = ctx.cache[ctx.j][2] + "", t23, t24, br17, t25, br18, t26, button6, t27_value = ctx.cache[ctx.j][3] + "", t27, t28, button7, t29_value = ctx.cache[ctx.j][4] + "", t29, t30, button8, t31_value = ctx.cache[ctx.j][5] + "", t31, t32, br19, t33, br20, t34, button9, t35_value = ctx.cache[ctx.j][6] + "", t35, t36, button10, t37_value = ctx.cache[ctx.j][7] + "", t37, t38, button11, t39_value = ctx.cache[ctx.j][8] + "", t39, t40, p2, t42, pre0, t43, t44, p3, t46, pre1, t47, t48, p4, current, dispose;

    	var if_block =  create_if_block$4();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "If you click any two numbers (below), they switch locations and a \"BACK\" button appears. If you go back and click two numbers, the result gets inserted  at your location.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing.";
    			t4 = space();
    			br0 = element("br");
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "BACK";
    			t8 = space();
    			br2 = element("br");
    			t9 = space();
    			br3 = element("br");
    			t10 = space();
    			div0 = element("div");
    			button1 = element("button");
    			t11 = text(ctx.j);
    			t12 = space();
    			br4 = element("br");
    			t13 = space();
    			button2 = element("button");
    			button2.textContent = "FORWARD";
    			t15 = space();
    			br5 = element("br");
    			t16 = space();
    			br6 = element("br");
    			t17 = space();
    			div2 = element("div");
    			br7 = element("br");
    			br8 = element("br");
    			br9 = element("br");
    			br10 = element("br");
    			br11 = element("br");
    			br12 = element("br");
    			br13 = element("br");
    			br14 = element("br");
    			br15 = element("br");
    			br16 = element("br");
    			t18 = space();
    			button3 = element("button");
    			t19 = text(t19_value);
    			t20 = space();
    			button4 = element("button");
    			t21 = text(t21_value);
    			t22 = space();
    			button5 = element("button");
    			t23 = text(t23_value);
    			t24 = space();
    			br17 = element("br");
    			t25 = space();
    			br18 = element("br");
    			t26 = space();
    			button6 = element("button");
    			t27 = text(t27_value);
    			t28 = space();
    			button7 = element("button");
    			t29 = text(t29_value);
    			t30 = space();
    			button8 = element("button");
    			t31 = text(t31_value);
    			t32 = space();
    			br19 = element("br");
    			t33 = space();
    			br20 = element("br");
    			t34 = space();
    			button9 = element("button");
    			t35 = text(t35_value);
    			t36 = space();
    			button10 = element("button");
    			t37 = text(t37_value);
    			t38 = space();
    			button11 = element("button");
    			t39 = text(t39_value);
    			t40 = space();
    			p2 = element("p");
    			p2.textContent = "This is the JavaScript code inside of the script tags except for the definitions of the variables \"code\" and \"html\", which are just the code and html cut and pasted inside of back quotes:";
    			t42 = space();
    			pre0 = element("pre");
    			t43 = text(ctx.code);
    			t44 = space();
    			p3 = element("p");
    			p3.textContent = "And here is the HTML code:";
    			t46 = space();
    			pre1 = element("pre");
    			t47 = text(ctx.html);
    			t48 = space();
    			p4 = element("p");
    			p4.textContent = "I'm new to Svelte and so far I am very impressed.";
    			add_location(p0, file$6, 159, 0, 4286);
    			add_location(p1, file$6, 160, 0, 4465);
    			add_location(br0, file$6, 162, 0, 4659);
    			add_location(br1, file$6, 163, 0, 4664);
    			add_location(button0, file$6, 164, 1, 4670);
    			add_location(br2, file$6, 167, 0, 4713);
    			add_location(br3, file$6, 168, 0, 4718);
    			add_location(button1, file$6, 169, 33, 4756);
    			set_style(div0, "text-indent", "20px");
    			add_location(div0, file$6, 169, 3, 4726);
    			add_location(br4, file$6, 170, 0, 4785);
    			add_location(button2, file$6, 171, 1, 4791);
    			add_location(br5, file$6, 174, 1, 4841);
    			add_location(br6, file$6, 175, 1, 4847);
    			set_style(div1, "margin-Left", "2%");
    			set_style(div1, "width", "50%");
    			add_location(div1, file$6, 157, 24, 4240);
    			add_location(br7, file$6, 178, 0, 4949);
    			add_location(br8, file$6, 178, 4, 4953);
    			add_location(br9, file$6, 178, 8, 4957);
    			add_location(br10, file$6, 178, 12, 4961);
    			add_location(br11, file$6, 178, 16, 4965);
    			add_location(br12, file$6, 178, 20, 4969);
    			add_location(br13, file$6, 178, 24, 4973);
    			add_location(br14, file$6, 178, 28, 4977);
    			add_location(br15, file$6, 178, 32, 4981);
    			add_location(br16, file$6, 178, 36, 4985);
    			attr(button3, "id", "m0");
    			add_location(button3, file$6, 179, 0, 4990);
    			attr(button4, "id", "m1");
    			add_location(button4, file$6, 180, 0, 5052);
    			attr(button5, "id", "m2");
    			add_location(button5, file$6, 181, 0, 5114);
    			add_location(br17, file$6, 182, 0, 5176);
    			add_location(br18, file$6, 183, 0, 5181);
    			attr(button6, "id", "m3");
    			add_location(button6, file$6, 184, 0, 5186);
    			attr(button7, "id", "m4");
    			add_location(button7, file$6, 185, 0, 5248);
    			attr(button8, "id", "m5");
    			add_location(button8, file$6, 186, 0, 5310);
    			add_location(br19, file$6, 187, 0, 5372);
    			add_location(br20, file$6, 188, 0, 5377);
    			attr(button9, "id", "m6");
    			add_location(button9, file$6, 189, 0, 5382);
    			attr(button10, "id", "m7");
    			add_location(button10, file$6, 190, 0, 5444);
    			attr(button11, "id", "m8");
    			add_location(button11, file$6, 191, 0, 5506);
    			set_style(div2, "marginRight", "2%");
    			set_style(div2, "width", "50%");
    			add_location(div2, file$6, 177, 21, 4904);
    			set_style(div3, "display", "flex");
    			add_location(div3, file$6, 156, 24, 4186);
    			add_location(p2, file$6, 194, 0, 5582);
    			add_location(pre0, file$6, 195, 0, 5779);
    			add_location(p3, file$6, 196, 0, 5797);
    			add_location(pre1, file$6, 197, 0, 5833);
    			add_location(p4, file$6, 198, 0, 5851);

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
    			insert(target, div3, anchor);
    			append(div3, div1);
    			append(div1, p0);
    			append(div1, t2);
    			append(div1, p1);
    			append(div1, t4);
    			append(div1, br0);
    			append(div1, t5);
    			append(div1, br1);
    			append(div1, t6);
    			append(div1, button0);
    			append(div1, t8);
    			append(div1, br2);
    			append(div1, t9);
    			append(div1, br3);
    			append(div1, t10);
    			append(div1, div0);
    			append(div0, button1);
    			append(button1, t11);
    			append(div1, t12);
    			append(div1, br4);
    			append(div1, t13);
    			append(div1, button2);
    			append(div1, t15);
    			append(div1, br5);
    			append(div1, t16);
    			append(div1, br6);
    			append(div3, t17);
    			append(div3, div2);
    			append(div2, br7);
    			append(div2, br8);
    			append(div2, br9);
    			append(div2, br10);
    			append(div2, br11);
    			append(div2, br12);
    			append(div2, br13);
    			append(div2, br14);
    			append(div2, br15);
    			append(div2, br16);
    			append(div2, t18);
    			append(div2, button3);
    			append(button3, t19);
    			append(div2, t20);
    			append(div2, button4);
    			append(button4, t21);
    			append(div2, t22);
    			append(div2, button5);
    			append(button5, t23);
    			append(div2, t24);
    			append(div2, br17);
    			append(div2, t25);
    			append(div2, br18);
    			append(div2, t26);
    			append(div2, button6);
    			append(button6, t27);
    			append(div2, t28);
    			append(div2, button7);
    			append(button7, t29);
    			append(div2, t30);
    			append(div2, button8);
    			append(button8, t31);
    			append(div2, t32);
    			append(div2, br19);
    			append(div2, t33);
    			append(div2, br20);
    			append(div2, t34);
    			append(div2, button9);
    			append(button9, t35);
    			append(div2, t36);
    			append(div2, button10);
    			append(button10, t37);
    			append(div2, t38);
    			append(div2, button11);
    			append(button11, t39);
    			insert(target, t40, anchor);
    			insert(target, p2, anchor);
    			insert(target, t42, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t43);
    			insert(target, t44, anchor);
    			insert(target, p3, anchor);
    			insert(target, t46, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t47);
    			insert(target, t48, anchor);
    			insert(target, p4, anchor);
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

    			if (!current || changed.j) {
    				set_data(t11, ctx.j);
    			}

    			if ((!current || changed.j) && t19_value !== (t19_value = ctx.cache[ctx.j][0] + "")) {
    				set_data(t19, t19_value);
    			}

    			if ((!current || changed.j) && t21_value !== (t21_value = ctx.cache[ctx.j][1] + "")) {
    				set_data(t21, t21_value);
    			}

    			if ((!current || changed.j) && t23_value !== (t23_value = ctx.cache[ctx.j][2] + "")) {
    				set_data(t23, t23_value);
    			}

    			if ((!current || changed.j) && t27_value !== (t27_value = ctx.cache[ctx.j][3] + "")) {
    				set_data(t27, t27_value);
    			}

    			if ((!current || changed.j) && t29_value !== (t29_value = ctx.cache[ctx.j][4] + "")) {
    				set_data(t29, t29_value);
    			}

    			if ((!current || changed.j) && t31_value !== (t31_value = ctx.cache[ctx.j][5] + "")) {
    				set_data(t31, t31_value);
    			}

    			if ((!current || changed.j) && t35_value !== (t35_value = ctx.cache[ctx.j][6] + "")) {
    				set_data(t35, t35_value);
    			}

    			if ((!current || changed.j) && t37_value !== (t37_value = ctx.cache[ctx.j][7] + "")) {
    				set_data(t37, t37_value);
    			}

    			if ((!current || changed.j) && t39_value !== (t39_value = ctx.cache[ctx.j][8] + "")) {
    				set_data(t39, t39_value);
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
    				detach(div3);
    				detach(t40);
    				detach(p2);
    				detach(t42);
    				detach(pre0);
    				detach(t44);
    				detach(p3);
    				detach(t46);
    				detach(pre1);
    				detach(t48);
    				detach(p4);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

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

   var back = function back () {
      if (j > 0) j = j-=1;
      else j = j;
   }

   var forward = function forward () {
      if (j+1 < cache.length) j = j+=1;
      else j = j;
    }

    $: j

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var j = 0;
     $: j
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

    	$$self.$$.update = ($$dirty = { j: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.j) ;
    	};

    	return { cache, j, ob, back, forward, code, html };
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/Transducer.svelte generated by Svelte v3.9.1 */

    const file$7 = "src/Transducer.svelte";

    // (398:0) {#if visible}
    function create_if_block$5(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "TRANSDUCER SIMULATION";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$7, 398, 1, 8910);
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

    function create_fragment$7(ctx) {
    	var br0, br1, br2, t0, t1, br3, br4, t2, p0, t4, p1, t6, p2, t8, p3, t10, br5, br6, t11, div0, t12, t13_value = ctx.transducerResult.length + "", t13, t14, br7, br8, t15, div1, t17, br9, t18, div2, t19, t20_value = ctx.A_A.join(", ") + "", t20, t21, t22, br10, t23, br11, t24, div3, t26, br12, t27, div4, t28, t29_value = ctx.B_B.join(", ") + "", t29, t30, t31, br13, t32, br14, t33, div5, t35, br15, t36, div6, t37_1, t38_value = ctx.C_C.join(", ") + "", t38, t39, t40, br16, t41, br17, t42, div7, t44, br18, t45, div8, t46, t47_value = ctx.D_D.join(", ") + "", t47, t48, t49, br19, t50, br20, t51, button0, t53, button1, t55, br21, br22, t56, div9, t57, t58, t59, br23, t60, div10, t61, t62_value = ctx.ar74.join(", ") + "", t62, t63, t64, br24, t65, div11, t67, pre0, t68, t69, p4, t71, div12, t73, pre1, t75, p5, t77, div13, t79, pre2, t81, p6, t83, p7, t85, pre3, t86, t87, p8, t89, pre4, t90, t91, span0, t93, a, t95, span1, current, dispose;

    	var if_block =  create_if_block$5();

    	return {
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
    			t58 = text(ctx.size);
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
    			t68 = text(ctx.mon44);
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
    			t86 = text(ctx.callback);
    			t87 = space();
    			p8 = element("p");
    			p8.textContent = "And here's some of the code behind the transducer demonstration:";
    			t89 = space();
    			pre4 = element("pre");
    			t90 = text(ctx.call2);
    			t91 = space();
    			span0 = element("span");
    			span0.textContent = "The rest of the code can be found in the";
    			t93 = space();
    			a = element("a");
    			a.textContent = "Github repository";
    			t95 = space();
    			span1 = element("span");
    			span1.textContent = ".";
    			add_location(br0, file$7, 396, 0, 8882);
    			add_location(br1, file$7, 396, 4, 8886);
    			add_location(br2, file$7, 396, 8, 8890);
    			add_location(br3, file$7, 402, 0, 9073);
    			add_location(br4, file$7, 402, 4, 9077);
    			add_location(p0, file$7, 404, 0, 9083);
    			add_location(p1, file$7, 405, 0, 9494);
    			add_location(p2, file$7, 406, 0, 9740);
    			add_location(p3, file$7, 407, 0, 10075);
    			add_location(br5, file$7, 408, 0, 10183);
    			add_location(br6, file$7, 408, 4, 10187);
    			add_location(div0, file$7, 409, 0, 10192);
    			add_location(br7, file$7, 410, 0, 10246);
    			add_location(br8, file$7, 410, 4, 10250);
    			attr(div1, "class", "p svelte-1d81q6r");
    			add_location(div1, file$7, 411, 0, 10255);
    			add_location(br9, file$7, 412, 0, 10306);
    			attr(div2, "class", "q svelte-1d81q6r");
    			add_location(div2, file$7, 413, 0, 10311);
    			add_location(br10, file$7, 414, 0, 10352);
    			add_location(br11, file$7, 415, 0, 10357);
    			attr(div3, "class", "p svelte-1d81q6r");
    			add_location(div3, file$7, 416, 0, 10362);
    			add_location(br12, file$7, 417, 0, 10423);
    			attr(div4, "class", "q svelte-1d81q6r");
    			add_location(div4, file$7, 418, 0, 10428);
    			add_location(br13, file$7, 419, 0, 10470);
    			add_location(br14, file$7, 420, 0, 10475);
    			attr(div5, "class", "p svelte-1d81q6r");
    			add_location(div5, file$7, 421, 0, 10480);
    			add_location(br15, file$7, 422, 0, 10544);
    			attr(div6, "class", "q svelte-1d81q6r");
    			add_location(div6, file$7, 423, 0, 10549);
    			add_location(br16, file$7, 424, 0, 10591);
    			add_location(br17, file$7, 425, 0, 10596);
    			attr(div7, "class", "p svelte-1d81q6r");
    			add_location(div7, file$7, 426, 0, 10601);
    			add_location(br18, file$7, 427, 0, 10664);
    			attr(div8, "class", "q svelte-1d81q6r");
    			add_location(div8, file$7, 428, 0, 10669);
    			add_location(br19, file$7, 429, 0, 10711);
    			add_location(br20, file$7, 430, 0, 10716);
    			attr(button0, "class", "but");
    			add_location(button0, file$7, 431, 0, 10721);
    			attr(button1, "class", "but");
    			add_location(button1, file$7, 432, 0, 10781);
    			add_location(br21, file$7, 433, 0, 10841);
    			add_location(br22, file$7, 433, 4, 10845);
    			add_location(div9, file$7, 434, 0, 10850);
    			add_location(br23, file$7, 435, 0, 10882);
    			add_location(div10, file$7, 436, 0, 10887);
    			add_location(br24, file$7, 437, 0, 10924);
    			add_location(div11, file$7, 438, 0, 10929);
    			add_location(pre0, file$7, 439, 0, 11245);
    			add_location(p4, file$7, 440, 0, 11264);
    			set_style(div12, "color", "#BBFFBB");
    			add_location(div12, file$7, 441, 0, 11358);
    			add_location(pre1, file$7, 443, 0, 11418);
    			add_location(p5, file$7, 447, 0, 11524);
    			set_style(div13, "color", "#BBFFBB");
    			add_location(div13, file$7, 449, 0, 11651);
    			add_location(pre2, file$7, 451, 0, 11727);
    			add_location(p6, file$7, 460, 0, 11912);
    			add_location(p7, file$7, 461, 0, 12136);
    			add_location(pre3, file$7, 462, 0, 12275);
    			add_location(p8, file$7, 463, 0, 12297);
    			add_location(pre4, file$7, 464, 0, 12371);
    			add_location(span0, file$7, 465, 0, 12390);
    			attr(a, "href", "https://github.com/dschalk/blog");
    			add_location(a, file$7, 466, 0, 12446);
    			add_location(span1, file$7, 467, 0, 12512);

    			dispose = [
    				listen(button0, "click", ctx.increase),
    				listen(button1, "click", ctx.decrease)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, br0, anchor);
    			insert(target, br1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t1, anchor);
    			insert(target, br3, anchor);
    			insert(target, br4, anchor);
    			insert(target, t2, anchor);
    			insert(target, p0, anchor);
    			insert(target, t4, anchor);
    			insert(target, p1, anchor);
    			insert(target, t6, anchor);
    			insert(target, p2, anchor);
    			insert(target, t8, anchor);
    			insert(target, p3, anchor);
    			insert(target, t10, anchor);
    			insert(target, br5, anchor);
    			insert(target, br6, anchor);
    			insert(target, t11, anchor);
    			insert(target, div0, anchor);
    			append(div0, t12);
    			append(div0, t13);
    			insert(target, t14, anchor);
    			insert(target, br7, anchor);
    			insert(target, br8, anchor);
    			insert(target, t15, anchor);
    			insert(target, div1, anchor);
    			insert(target, t17, anchor);
    			insert(target, br9, anchor);
    			insert(target, t18, anchor);
    			insert(target, div2, anchor);
    			append(div2, t19);
    			append(div2, t20);
    			append(div2, t21);
    			insert(target, t22, anchor);
    			insert(target, br10, anchor);
    			insert(target, t23, anchor);
    			insert(target, br11, anchor);
    			insert(target, t24, anchor);
    			insert(target, div3, anchor);
    			insert(target, t26, anchor);
    			insert(target, br12, anchor);
    			insert(target, t27, anchor);
    			insert(target, div4, anchor);
    			append(div4, t28);
    			append(div4, t29);
    			append(div4, t30);
    			insert(target, t31, anchor);
    			insert(target, br13, anchor);
    			insert(target, t32, anchor);
    			insert(target, br14, anchor);
    			insert(target, t33, anchor);
    			insert(target, div5, anchor);
    			insert(target, t35, anchor);
    			insert(target, br15, anchor);
    			insert(target, t36, anchor);
    			insert(target, div6, anchor);
    			append(div6, t37_1);
    			append(div6, t38);
    			append(div6, t39);
    			insert(target, t40, anchor);
    			insert(target, br16, anchor);
    			insert(target, t41, anchor);
    			insert(target, br17, anchor);
    			insert(target, t42, anchor);
    			insert(target, div7, anchor);
    			insert(target, t44, anchor);
    			insert(target, br18, anchor);
    			insert(target, t45, anchor);
    			insert(target, div8, anchor);
    			append(div8, t46);
    			append(div8, t47);
    			append(div8, t48);
    			insert(target, t49, anchor);
    			insert(target, br19, anchor);
    			insert(target, t50, anchor);
    			insert(target, br20, anchor);
    			insert(target, t51, anchor);
    			insert(target, button0, anchor);
    			insert(target, t53, anchor);
    			insert(target, button1, anchor);
    			insert(target, t55, anchor);
    			insert(target, br21, anchor);
    			insert(target, br22, anchor);
    			insert(target, t56, anchor);
    			insert(target, div9, anchor);
    			append(div9, t57);
    			append(div9, t58);
    			insert(target, t59, anchor);
    			insert(target, br23, anchor);
    			insert(target, t60, anchor);
    			insert(target, div10, anchor);
    			append(div10, t61);
    			append(div10, t62);
    			append(div10, t63);
    			insert(target, t64, anchor);
    			insert(target, br24, anchor);
    			insert(target, t65, anchor);
    			insert(target, div11, anchor);
    			insert(target, t67, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t68);
    			insert(target, t69, anchor);
    			insert(target, p4, anchor);
    			insert(target, t71, anchor);
    			insert(target, div12, anchor);
    			insert(target, t73, anchor);
    			insert(target, pre1, anchor);
    			insert(target, t75, anchor);
    			insert(target, p5, anchor);
    			insert(target, t77, anchor);
    			insert(target, div13, anchor);
    			insert(target, t79, anchor);
    			insert(target, pre2, anchor);
    			insert(target, t81, anchor);
    			insert(target, p6, anchor);
    			insert(target, t83, anchor);
    			insert(target, p7, anchor);
    			insert(target, t85, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t86);
    			insert(target, t87, anchor);
    			insert(target, p8, anchor);
    			insert(target, t89, anchor);
    			insert(target, pre4, anchor);
    			append(pre4, t90);
    			insert(target, t91, anchor);
    			insert(target, span0, anchor);
    			insert(target, t93, anchor);
    			insert(target, a, anchor);
    			insert(target, t95, anchor);
    			insert(target, span1, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$5();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if ((!current || changed.transducerResult) && t13_value !== (t13_value = ctx.transducerResult.length + "")) {
    				set_data(t13, t13_value);
    			}

    			if ((!current || changed.A_A) && t20_value !== (t20_value = ctx.A_A.join(", ") + "")) {
    				set_data(t20, t20_value);
    			}

    			if ((!current || changed.B_B) && t29_value !== (t29_value = ctx.B_B.join(", ") + "")) {
    				set_data(t29, t29_value);
    			}

    			if ((!current || changed.C_C) && t38_value !== (t38_value = ctx.C_C.join(", ") + "")) {
    				set_data(t38, t38_value);
    			}

    			if ((!current || changed.D_D) && t47_value !== (t47_value = ctx.D_D.join(", ") + "")) {
    				set_data(t47, t47_value);
    			}

    			if (!current || changed.size) {
    				set_data(t58, ctx.size);
    			}

    			if ((!current || changed.ar74) && t62_value !== (t62_value = ctx.ar74.join(", ") + "")) {
    				set_data(t62, t62_value);
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
    				detach(br2);
    				detach(t0);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(br3);
    				detach(br4);
    				detach(t2);
    				detach(p0);
    				detach(t4);
    				detach(p1);
    				detach(t6);
    				detach(p2);
    				detach(t8);
    				detach(p3);
    				detach(t10);
    				detach(br5);
    				detach(br6);
    				detach(t11);
    				detach(div0);
    				detach(t14);
    				detach(br7);
    				detach(br8);
    				detach(t15);
    				detach(div1);
    				detach(t17);
    				detach(br9);
    				detach(t18);
    				detach(div2);
    				detach(t22);
    				detach(br10);
    				detach(t23);
    				detach(br11);
    				detach(t24);
    				detach(div3);
    				detach(t26);
    				detach(br12);
    				detach(t27);
    				detach(div4);
    				detach(t31);
    				detach(br13);
    				detach(t32);
    				detach(br14);
    				detach(t33);
    				detach(div5);
    				detach(t35);
    				detach(br15);
    				detach(t36);
    				detach(div6);
    				detach(t40);
    				detach(br16);
    				detach(t41);
    				detach(br17);
    				detach(t42);
    				detach(div7);
    				detach(t44);
    				detach(br18);
    				detach(t45);
    				detach(div8);
    				detach(t49);
    				detach(br19);
    				detach(t50);
    				detach(br20);
    				detach(t51);
    				detach(button0);
    				detach(t53);
    				detach(button1);
    				detach(t55);
    				detach(br21);
    				detach(br22);
    				detach(t56);
    				detach(div9);
    				detach(t59);
    				detach(br23);
    				detach(t60);
    				detach(div10);
    				detach(t64);
    				detach(br24);
    				detach(t65);
    				detach(div11);
    				detach(t67);
    				detach(pre0);
    				detach(t69);
    				detach(p4);
    				detach(t71);
    				detach(div12);
    				detach(t73);
    				detach(pre1);
    				detach(t75);
    				detach(p5);
    				detach(t77);
    				detach(div13);
    				detach(t79);
    				detach(pre2);
    				detach(t81);
    				detach(p6);
    				detach(t83);
    				detach(p7);
    				detach(t85);
    				detach(pre3);
    				detach(t87);
    				detach(p8);
    				detach(t89);
    				detach(pre4);
    				detach(t91);
    				detach(span0);
    				detach(t93);
    				detach(a);
    				detach(t95);
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
    var p, run;
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

    function instance$6($$self, $$props, $$invalidate) {

    var isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

    var fives = function fives (x) {return new Filt(v => v % 10 === 5)};

    var ar = "cowgirl";

    var cleanF = function cleanF (arthur = []) {
      $$invalidate('ar', ar = arthur);
      return ar.filter(
        a => a === 0 || a && typeof a !== "boolean" //
      ).reduce((a,b)=>a.concat(b),[])
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

    var compose = (...fns) =>
    fns.reduceRight((prevFn, nextFn) =>
    (...args) => nextFn(prevFn(...args)),
    value => value
    );
    var cube = function cube(v) { return v**3; };

    var size = 400;

    var ar74 = [...Array(size).keys()];

    var mapWRf = mapping(cube);
    var mapRes = ar74.reduce(mapWRf(concat), []);

    var isEven = x => x % 2 === 0;
    var not = x => !x;
    var isOdd2 = compose(not, isEven);

    var A_A = "H";

    var B_B = "s";

    var C_C = "G";

    var D_D = "I";

    var res1;
    // $: res1;

    var res2;
    // $: res2;

    var res3;

    var dotResult = [];

    var transducerResult;


     $$invalidate('A_A', A_A = dotResult = ar74
       .filter(v => (v % 2 === 1))
       .map(x => x**4)
       .map(x => x+3)
       .map(x => x-3)
       .filter(v => v % 10 === 5)
       .map(x => Math.sqrt(x))
       .map(v=>v*v)
       .map(v=>v+1000)); $$invalidate('dotResult', dotResult);

    var xform;

    var xform2;

    var xform3;
      var fives = function fives (x) {return new Filt(v => v % 10 === 5)};

      var td1 = x => Monad$1([x])(isOdd)(v=>v**4)(v=>v+3)(v=>v-3)(fives)(Math.sqrt)('stop').pop();
      var td2 = y => Monad$1([y])(v=>v*v)(v=>v+1000)('stop').pop();

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
    		if ($$dirty.test9) ;
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
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/ToggleTheme.svelte generated by Svelte v3.9.1 */

    const file$8 = "src/ToggleTheme.svelte";

    // (7:1) {#if dark}
    function create_if_block$6(ctx) {
    	var link;

    	return {
    		c: function create() {
    			link = element("link");
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", "style.css");
    			add_location(link, file$8, 7, 1, 115);
    		},

    		m: function mount(target, anchor) {
    			insert(target, link, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(link);
    			}
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var if_block_anchor, t0, h1, t2, button, dispose;

    	var if_block = (ctx.dark) && create_if_block$6();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Hello World!";
    			t2 = space();
    			button = element("button");
    			button.textContent = "toggle theme";
    			add_location(h1, file$8, 11, 0, 179);
    			add_location(button, file$8, 13, 0, 202);
    			dispose = listen(button, "click", ctx.toggleTheme);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(document.head, null);
    			append(document.head, if_block_anchor);
    			insert(target, t0, anchor);
    			insert(target, h1, anchor);
    			insert(target, t2, anchor);
    			insert(target, button, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.dark) {
    				if (!if_block) {
    					if_block = create_if_block$6();
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			detach(if_block_anchor);

    			if (detaching) {
    				detach(t0);
    				detach(h1);
    				detach(t2);
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let dark = false;
    	const toggleTheme = () => { const $$result = dark = dark === false; $$invalidate('dark', dark); return $$result; };

    	return { dark, toggleTheme };
    }

    class ToggleTheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, []);
    	}
    }

    /* src/Home.svelte generated by Svelte v3.9.1 */

    const file$9 = "src/Home.svelte";

    // (61:0) {#if visible}
    function create_if_block$7(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nINTRODUCTION");
    			add_location(br0, file$9, 62, 0, 1113);
    			add_location(br1, file$9, 62, 4, 1117);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$9, 61, 0, 986);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, t);
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

    function create_fragment$9(ctx) {
    	var t0, br0, t1, p0, t3, h20, t5, p1, t7, p2, t9, p3, t11, p4, t13, p5, t15, h3, t17, div0, t18, div1, t20, h21, t22, p6, t24, p7, t26, p8, t28, br1, t29, br2, t30, div5, div3, button0, t32, br3, t33, br4, t34, div2, button1, t35, t36, br5, t37, button2, t39, br6, t40, br7, t41, div4, button3, t42_value = ctx.cache[ctx.j][0] + "", t42, t43, button4, t44_value = ctx.cache[ctx.j][1] + "", t44, t45, button5, t46_value = ctx.cache[ctx.j][2] + "", t46, t47, br8, t48, br9, t49, button6, t50_value = ctx.cache[ctx.j][3] + "", t50, t51, button7, t52_value = ctx.cache[ctx.j][4] + "", t52, t53, button8, t54_value = ctx.cache[ctx.j][5] + "", t54, t55, br10, t56, br11, t57, button9, t58_value = ctx.cache[ctx.j][6] + "", t58, t59, button10, t60_value = ctx.cache[ctx.j][7] + "", t60, t61, button11, t62_value = ctx.cache[ctx.j][8] + "", t62, t63, br12, t64, p9, t66, t67, br13, br14, t68, div6, t70, div7, t72, br15, t73, br16, current, dispose;

    	var if_block =  create_if_block$7();

    	var cow = new Cow({ $$inline: true });

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Posts are placed either in the \"Functional JavaScript\" section or else in the section named \"Miscellaneous\". The functional JavaScript section includes a React application named \"Game of Score\"; a Cycle.js application named \"Frunctional Web Applications\"; and functional JavaScript examples each presented in a small Svelte module. \"Game of Score\", \"Functional Web AookuxRUIBA\", abd the \"Asychronous Monad\" Svelte module all use the same modified Haskell Wai WebSockets server.";
    			t3 = space();
    			h20 = element("h2");
    			h20.textContent = "Functional JavaScript";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "My functional JavaScript ideas will raise eyebrows and cause some immediate consternation among functional Javascript enthusiasts. My Haskell WebSockets server is coded in a pure functional style. It works like a charm and is exceedingly easy to maintain as new requirements emerge.";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "The Haskell language in combination with the Glorious Haskell Compiler (a/k/a \"Glaskow Haskell Compiler\") is so wonderful that, if I weren't so inclined to think about what I am doing and so skeptical of authority, I might be persuaded by the many blog posts and video presentations advocating Cargo Cult functional JavaScript. I might be advocating Cargo Cult JavaScript here.";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "Functional-cargo-cult developers will weigh down their code with universal type checking, even when there is no rational reason to do so. If they have a million cycle recursive expression inside of a function, they will spew 999,999 useless creations into RAM rather than mutate an attribute of the function a million times.";
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = "Cargo-cult JavaScript practitioners \"think\" something like this: Lisp ML, Haskell, and other functional programming languages avoid mutation have strict type requirements, so the wonderfully hybrid and dynamic JavaScript programming language should be fettered, constricted, and weighed down with univeral immutability and type checking because that will magically bring the benifits inherent in the functional languages.";
    			t13 = space();
    			p5 = element("p");
    			p5.textContent = "I urge everyone involved in creating JavaScript applications to at least take a look at my examples of what funtions returned by modifications of Monad() can do. \"Functional JavaScript\" means various things to different people. I like meanings that stress getting the most out of JavaScripts first-class functions";
    			t15 = space();
    			h3 = element("h3");
    			h3.textContent = "References";
    			t17 = space();
    			div0 = element("div");
    			t18 = space();
    			div1 = element("div");
    			div1.textContent = "Cargo Cult Science http://calteches.library.caltech.edu/51/2/CargoCult.pdf";
    			t20 = space();
    			h21 = element("h2");
    			h21.textContent = "Miscellaneous Section";
    			t22 = space();
    			p6 = element("p");
    			p6.textContent = "The \"Misclaneous\" is for discoveries that seem worth sharing, and ideas of minimal general interest that I don't want to forget";
    			t24 = space();
    			p7 = element("p");
    			p7.textContent = "If you click any two numbers (below), they switch locations and a \"BACK\" button appears. If you go back and click two numbers, the result gets inserted  at your location.";
    			t26 = space();
    			p8 = element("p");
    			p8.textContent = "I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing.";
    			t28 = space();
    			br1 = element("br");
    			t29 = space();
    			br2 = element("br");
    			t30 = space();
    			div5 = element("div");
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "BACK";
    			t32 = space();
    			br3 = element("br");
    			t33 = space();
    			br4 = element("br");
    			t34 = space();
    			div2 = element("div");
    			button1 = element("button");
    			t35 = text(ctx.j);
    			t36 = space();
    			br5 = element("br");
    			t37 = space();
    			button2 = element("button");
    			button2.textContent = "FORWARD";
    			t39 = space();
    			br6 = element("br");
    			t40 = space();
    			br7 = element("br");
    			t41 = space();
    			div4 = element("div");
    			button3 = element("button");
    			t42 = text(t42_value);
    			t43 = space();
    			button4 = element("button");
    			t44 = text(t44_value);
    			t45 = space();
    			button5 = element("button");
    			t46 = text(t46_value);
    			t47 = space();
    			br8 = element("br");
    			t48 = space();
    			br9 = element("br");
    			t49 = space();
    			button6 = element("button");
    			t50 = text(t50_value);
    			t51 = space();
    			button7 = element("button");
    			t52 = text(t52_value);
    			t53 = space();
    			button8 = element("button");
    			t54 = text(t54_value);
    			t55 = space();
    			br10 = element("br");
    			t56 = space();
    			br11 = element("br");
    			t57 = space();
    			button9 = element("button");
    			t58 = text(t58_value);
    			t59 = space();
    			button10 = element("button");
    			t60 = text(t60_value);
    			t61 = space();
    			button11 = element("button");
    			t62 = text(t62_value);
    			t63 = space();
    			br12 = element("br");
    			t64 = space();
    			p9 = element("p");
    			p9.textContent = "An example of an imbedded module that I will explain later:";
    			t66 = space();
    			cow.$$.fragment.c();
    			t67 = space();
    			br13 = element("br");
    			br14 = element("br");
    			t68 = space();
    			div6 = element("div");
    			div6.textContent = "David Schalk";
    			t70 = space();
    			div7 = element("div");
    			div7.textContent = "October, 2019";
    			t72 = space();
    			br15 = element("br");
    			t73 = space();
    			br16 = element("br");
    			add_location(br0, file$9, 66, 0, 1149);
    			add_location(p0, file$9, 67, 0, 1154);
    			add_location(h20, file$9, 70, 0, 1643);
    			add_location(p1, file$9, 71, 0, 1674);
    			add_location(p2, file$9, 72, 0, 1965);
    			add_location(p3, file$9, 73, 0, 2352);
    			add_location(p4, file$9, 74, 0, 2685);
    			add_location(p5, file$9, 75, 0, 3118);
    			add_location(h3, file$9, 76, 0, 3440);
    			add_location(div0, file$9, 78, 0, 3461);
    			add_location(div1, file$9, 79, 0, 3473);
    			add_location(h21, file$9, 83, 0, 3564);
    			add_location(p6, file$9, 84, 0, 3595);
    			add_location(p7, file$9, 85, 0, 3734);
    			add_location(p8, file$9, 86, 0, 3913);
    			add_location(br1, file$9, 88, 0, 4107);
    			add_location(br2, file$9, 89, 0, 4112);
    			add_location(button0, file$9, 94, 0, 4254);
    			add_location(br3, file$9, 97, 0, 4294);
    			add_location(br4, file$9, 98, 0, 4299);
    			add_location(button1, file$9, 99, 30, 4334);
    			set_style(div2, "text-indent", "20px");
    			add_location(div2, file$9, 99, 0, 4304);
    			add_location(br5, file$9, 100, 0, 4363);
    			add_location(button2, file$9, 101, 0, 4368);
    			add_location(br6, file$9, 104, 0, 4414);
    			add_location(br7, file$9, 105, 0, 4419);
    			set_style(div3, "text-align", "right");
    			set_style(div3, "margin-right", "2%");
    			set_style(div3, "width", "20%");
    			add_location(div3, file$9, 92, 20, 4188);
    			attr(button3, "id", "m0");
    			add_location(button3, file$9, 110, 0, 4518);
    			attr(button4, "id", "m1");
    			add_location(button4, file$9, 111, 0, 4580);
    			attr(button5, "id", "m2");
    			add_location(button5, file$9, 112, 0, 4642);
    			add_location(br8, file$9, 113, 0, 4704);
    			add_location(br9, file$9, 114, 0, 4709);
    			attr(button6, "id", "m3");
    			add_location(button6, file$9, 115, 0, 4714);
    			attr(button7, "id", "m4");
    			add_location(button7, file$9, 116, 0, 4776);
    			attr(button8, "id", "m5");
    			add_location(button8, file$9, 117, 0, 4838);
    			add_location(br10, file$9, 118, 0, 4900);
    			add_location(br11, file$9, 119, 0, 4905);
    			attr(button9, "id", "m6");
    			add_location(button9, file$9, 120, 0, 4910);
    			attr(button10, "id", "m7");
    			add_location(button10, file$9, 121, 0, 4972);
    			attr(button11, "id", "m8");
    			add_location(button11, file$9, 122, 0, 5034);
    			set_style(div4, "marginRight", "0%");
    			set_style(div4, "width", "80%");
    			add_location(div4, file$9, 108, 12, 4472);
    			set_style(div5, "display", "flex");
    			add_location(div5, file$9, 91, 20, 4138);
    			add_location(br12, file$9, 125, 0, 5110);
    			add_location(p9, file$9, 126, 0, 5115);
    			add_location(br13, file$9, 128, 0, 5194);
    			add_location(br14, file$9, 128, 4, 5198);
    			add_location(div6, file$9, 129, 0, 5203);
    			add_location(div7, file$9, 130, 0, 5227);
    			add_location(br15, file$9, 131, 0, 5253);
    			add_location(br16, file$9, 132, 0, 5258);

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
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, h20, anchor);
    			insert(target, t5, anchor);
    			insert(target, p1, anchor);
    			insert(target, t7, anchor);
    			insert(target, p2, anchor);
    			insert(target, t9, anchor);
    			insert(target, p3, anchor);
    			insert(target, t11, anchor);
    			insert(target, p4, anchor);
    			insert(target, t13, anchor);
    			insert(target, p5, anchor);
    			insert(target, t15, anchor);
    			insert(target, h3, anchor);
    			insert(target, t17, anchor);
    			insert(target, div0, anchor);
    			insert(target, t18, anchor);
    			insert(target, div1, anchor);
    			insert(target, t20, anchor);
    			insert(target, h21, anchor);
    			insert(target, t22, anchor);
    			insert(target, p6, anchor);
    			insert(target, t24, anchor);
    			insert(target, p7, anchor);
    			insert(target, t26, anchor);
    			insert(target, p8, anchor);
    			insert(target, t28, anchor);
    			insert(target, br1, anchor);
    			insert(target, t29, anchor);
    			insert(target, br2, anchor);
    			insert(target, t30, anchor);
    			insert(target, div5, anchor);
    			append(div5, div3);
    			append(div3, button0);
    			append(div3, t32);
    			append(div3, br3);
    			append(div3, t33);
    			append(div3, br4);
    			append(div3, t34);
    			append(div3, div2);
    			append(div2, button1);
    			append(button1, t35);
    			append(div3, t36);
    			append(div3, br5);
    			append(div3, t37);
    			append(div3, button2);
    			append(div3, t39);
    			append(div3, br6);
    			append(div3, t40);
    			append(div3, br7);
    			append(div5, t41);
    			append(div5, div4);
    			append(div4, button3);
    			append(button3, t42);
    			append(div4, t43);
    			append(div4, button4);
    			append(button4, t44);
    			append(div4, t45);
    			append(div4, button5);
    			append(button5, t46);
    			append(div4, t47);
    			append(div4, br8);
    			append(div4, t48);
    			append(div4, br9);
    			append(div4, t49);
    			append(div4, button6);
    			append(button6, t50);
    			append(div4, t51);
    			append(div4, button7);
    			append(button7, t52);
    			append(div4, t53);
    			append(div4, button8);
    			append(button8, t54);
    			append(div4, t55);
    			append(div4, br10);
    			append(div4, t56);
    			append(div4, br11);
    			append(div4, t57);
    			append(div4, button9);
    			append(button9, t58);
    			append(div4, t59);
    			append(div4, button10);
    			append(button10, t60);
    			append(div4, t61);
    			append(div4, button11);
    			append(button11, t62);
    			insert(target, t63, anchor);
    			insert(target, br12, anchor);
    			insert(target, t64, anchor);
    			insert(target, p9, anchor);
    			insert(target, t66, anchor);
    			mount_component(cow, target, anchor);
    			insert(target, t67, anchor);
    			insert(target, br13, anchor);
    			insert(target, br14, anchor);
    			insert(target, t68, anchor);
    			insert(target, div6, anchor);
    			insert(target, t70, anchor);
    			insert(target, div7, anchor);
    			insert(target, t72, anchor);
    			insert(target, br15, anchor);
    			insert(target, t73, anchor);
    			insert(target, br16, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$7();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			}

    			if (!current || changed.j) {
    				set_data(t35, ctx.j);
    			}

    			if ((!current || changed.j) && t42_value !== (t42_value = ctx.cache[ctx.j][0] + "")) {
    				set_data(t42, t42_value);
    			}

    			if ((!current || changed.j) && t44_value !== (t44_value = ctx.cache[ctx.j][1] + "")) {
    				set_data(t44, t44_value);
    			}

    			if ((!current || changed.j) && t46_value !== (t46_value = ctx.cache[ctx.j][2] + "")) {
    				set_data(t46, t46_value);
    			}

    			if ((!current || changed.j) && t50_value !== (t50_value = ctx.cache[ctx.j][3] + "")) {
    				set_data(t50, t50_value);
    			}

    			if ((!current || changed.j) && t52_value !== (t52_value = ctx.cache[ctx.j][4] + "")) {
    				set_data(t52, t52_value);
    			}

    			if ((!current || changed.j) && t54_value !== (t54_value = ctx.cache[ctx.j][5] + "")) {
    				set_data(t54, t54_value);
    			}

    			if ((!current || changed.j) && t58_value !== (t58_value = ctx.cache[ctx.j][6] + "")) {
    				set_data(t58, t58_value);
    			}

    			if ((!current || changed.j) && t60_value !== (t60_value = ctx.cache[ctx.j][7] + "")) {
    				set_data(t60, t60_value);
    			}

    			if ((!current || changed.j) && t62_value !== (t62_value = ctx.cache[ctx.j][8] + "")) {
    				set_data(t62, t62_value);
    			}
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

    			if (detaching) {
    				detach(t0);
    				detach(br0);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(h20);
    				detach(t5);
    				detach(p1);
    				detach(t7);
    				detach(p2);
    				detach(t9);
    				detach(p3);
    				detach(t11);
    				detach(p4);
    				detach(t13);
    				detach(p5);
    				detach(t15);
    				detach(h3);
    				detach(t17);
    				detach(div0);
    				detach(t18);
    				detach(div1);
    				detach(t20);
    				detach(h21);
    				detach(t22);
    				detach(p6);
    				detach(t24);
    				detach(p7);
    				detach(t26);
    				detach(p8);
    				detach(t28);
    				detach(br1);
    				detach(t29);
    				detach(br2);
    				detach(t30);
    				detach(div5);
    				detach(t63);
    				detach(br12);
    				detach(t64);
    				detach(p9);
    				detach(t66);
    			}

    			destroy_component(cow, detaching);

    			if (detaching) {
    				detach(t67);
    				detach(br13);
    				detach(br14);
    				detach(t68);
    				detach(div6);
    				detach(t70);
    				detach(div7);
    				detach(t72);
    				detach(br15);
    				detach(t73);
    				detach(br16);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
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

    	$$self.$$.update = ($$dirty = { j: 1 }) => {
    		if ($$dirty.j) ;
    		if ($$dirty.j) ;
    	};

    	return { cache, j, ob, back, forward };
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/Score.svelte generated by Svelte v3.9.1 */

    const file$a = "src/Score.svelte";

    // (5:0) {#if visible}
    function create_if_block$8(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\n GAME OF SCORE");
    			add_location(br0, file$a, 6, 1, 221);
    			add_location(br1, file$a, 6, 5, 225);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$a, 5, 1, 93);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, t);
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

    function create_fragment$a(ctx) {
    	var t0, br0, t1, p0, t3, p1, t5, p2, t7, a0, t9, br1, br2, t10, span0, t12, a1, t14, br3, br4, t15, span1, t17, a2, t19, span2, t21, a3, t23, span3, t25, a4, t27, span4, t29, a5, t31, span5, t33, a6, t35, span6, current;

    	var if_block =  create_if_block$8();

    	return {
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
    			add_location(br0, file$a, 10, 0, 259);
    			add_location(p0, file$a, 12, 0, 265);
    			add_location(p1, file$a, 14, 0, 472);
    			add_location(p2, file$a, 16, 0, 694);
    			attr(a0, "href", "http://game.schalk.site");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$a, 17, 0, 769);
    			add_location(br1, file$a, 18, 0, 849);
    			add_location(br2, file$a, 18, 4, 853);
    			add_location(span0, file$a, 19, 0, 858);
    			attr(a1, "href", "https://github.com/dschalk/score2");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$a, 20, 0, 891);
    			add_location(br3, file$a, 21, 0, 983);
    			add_location(br4, file$a, 21, 4, 987);
    			add_location(span1, file$a, 22, 0, 992);
    			attr(a2, "href", "https://nodejs.org/en/about/");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$a, 23, 0, 1023);
    			add_location(span2, file$a, 24, 0, 1091);
    			attr(a3, "href", "https://reactjs.org/");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$a, 25, 0, 1109);
    			add_location(span3, file$a, 26, 0, 1170);
    			attr(a4, "href", "https://cycle.js.org");
    			attr(a4, "target", "_blank");
    			add_location(a4, file$a, 27, 0, 1226);
    			add_location(span4, file$a, 28, 0, 1291);
    			attr(a5, "href", "https://svelte.dev/");
    			attr(a5, "target", "_blank");
    			add_location(a5, file$a, 29, 0, 1333);
    			add_location(span5, file$a, 30, 0, 1394);
    			attr(a6, "href", "https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/");
    			attr(a6, "target", "_blank");
    			add_location(a6, file$a, 31, 0, 1560);
    			add_location(span6, file$a, 32, 0, 1774);
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
    			insert(target, p2, anchor);
    			insert(target, t7, anchor);
    			insert(target, a0, anchor);
    			insert(target, t9, anchor);
    			insert(target, br1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t10, anchor);
    			insert(target, span0, anchor);
    			insert(target, t12, anchor);
    			insert(target, a1, anchor);
    			insert(target, t14, anchor);
    			insert(target, br3, anchor);
    			insert(target, br4, anchor);
    			insert(target, t15, anchor);
    			insert(target, span1, anchor);
    			insert(target, t17, anchor);
    			insert(target, a2, anchor);
    			insert(target, t19, anchor);
    			insert(target, span2, anchor);
    			insert(target, t21, anchor);
    			insert(target, a3, anchor);
    			insert(target, t23, anchor);
    			insert(target, span3, anchor);
    			insert(target, t25, anchor);
    			insert(target, a4, anchor);
    			insert(target, t27, anchor);
    			insert(target, span4, anchor);
    			insert(target, t29, anchor);
    			insert(target, a5, anchor);
    			insert(target, t31, anchor);
    			insert(target, span5, anchor);
    			insert(target, t33, anchor);
    			insert(target, a6, anchor);
    			insert(target, t35, anchor);
    			insert(target, span6, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$8();
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
    				detach(br0);
    				detach(t1);
    				detach(p0);
    				detach(t3);
    				detach(p1);
    				detach(t5);
    				detach(p2);
    				detach(t7);
    				detach(a0);
    				detach(t9);
    				detach(br1);
    				detach(br2);
    				detach(t10);
    				detach(span0);
    				detach(t12);
    				detach(a1);
    				detach(t14);
    				detach(br3);
    				detach(br4);
    				detach(t15);
    				detach(span1);
    				detach(t17);
    				detach(a2);
    				detach(t19);
    				detach(span2);
    				detach(t21);
    				detach(a3);
    				detach(t23);
    				detach(span3);
    				detach(t25);
    				detach(a4);
    				detach(t27);
    				detach(span4);
    				detach(t29);
    				detach(a5);
    				detach(t31);
    				detach(span5);
    				detach(t33);
    				detach(a6);
    				detach(t35);
    				detach(span6);
    			}
    		}
    	};
    }

    class Score extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$a, safe_not_equal, []);
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.9.1 */

    const file$b = "src/Blog.svelte";

    // (145:0) {#if j === 0}
    function create_if_block_10(ctx) {
    	var current;

    	var home_1 = new Home({ $$inline: true });

    	return {
    		c: function create() {
    			home_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(home_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(home_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(home_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(home_1, detaching);
    		}
    	};
    }

    // (148:0) {#if j === 1}
    function create_if_block_9(ctx) {
    	var current;

    	var monad_1 = new Monad_1({ $$inline: true });

    	return {
    		c: function create() {
    			monad_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(monad_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(monad_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(monad_1, detaching);
    		}
    	};
    }

    // (151:0) {#if j === 2}
    function create_if_block_8(ctx) {
    	var current;

    	var monad2_1 = new Monad2({ $$inline: true });

    	return {
    		c: function create() {
    			monad2_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(monad2_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad2_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(monad2_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(monad2_1, detaching);
    		}
    	};
    }

    // (154:0) {#if j === 3}
    function create_if_block_7(ctx) {
    	var current;

    	var haskell_1 = new Haskell({ $$inline: true });

    	return {
    		c: function create() {
    			haskell_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(haskell_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(haskell_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(haskell_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(haskell_1, detaching);
    		}
    	};
    }

    // (157:0) {#if j === 4}
    function create_if_block_6(ctx) {
    	var current;

    	var bugs_1 = new Bugs({ $$inline: true });

    	return {
    		c: function create() {
    			bugs_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(bugs_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(bugs_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(bugs_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(bugs_1, detaching);
    		}
    	};
    }

    // (160:0) {#if j === 5}
    function create_if_block_5(ctx) {
    	var current;

    	var matrix_1 = new Matrix({ $$inline: true });

    	return {
    		c: function create() {
    			matrix_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(matrix_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(matrix_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(matrix_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(matrix_1, detaching);
    		}
    	};
    }

    // (163:0) {#if j === 7}
    function create_if_block_4(ctx) {
    	var current;

    	var transducer_1 = new Transducer({ $$inline: true });

    	return {
    		c: function create() {
    			transducer_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(transducer_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(transducer_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(transducer_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(transducer_1, detaching);
    		}
    	};
    }

    // (166:0) {#if j === 8}
    function create_if_block_3(ctx) {
    	var current;

    	var toggletheme = new ToggleTheme({ $$inline: true });

    	return {
    		c: function create() {
    			toggletheme.$$.fragment.c();
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
    }

    // (169:0) {#if j === 9}
    function create_if_block_2(ctx) {
    	var current;

    	var monad3_1 = new Monad3({ $$inline: true });

    	return {
    		c: function create() {
    			monad3_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(monad3_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(monad3_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(monad3_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(monad3_1, detaching);
    		}
    	};
    }

    // (172:0) {#if j === 10}
    function create_if_block_1(ctx) {
    	var current;

    	var score_1 = new Score({ $$inline: true });

    	return {
    		c: function create() {
    			score_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(score_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(score_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(score_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(score_1, detaching);
    		}
    	};
    }

    // (175:0) {#if j === 20}
    function create_if_block$9(ctx) {
    	var current;

    	var cow = new Cow({ $$inline: true });

    	return {
    		c: function create() {
    			cow.$$.fragment.c();
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
    }

    function create_fragment$b(ctx) {
    	var div16, div15, div12, br0, br1, br2, br3, br4, br5, br6, t0, ul, li0, div0, t2, br7, t3, li1, div1, t5, br8, t6, li2, div2, t8, br9, t9, li3, div3, t11, br10, t12, li4, div4, t14, br11, t15, li5, div5, t17, br12, t18, li6, div6, t20, br13, t21, li7, div7, t23, br14, t24, li8, div8, t26, br15, t27, li9, div9, t29, br16, t30, li10, div10, t32, br17, t33, li11, div11, t35, br18, t36, div14, div13, t38, t39, t40, t41, t42, t43, t44, t45, t46, t47, t48, t49, br19, br20, br21, t50, br22, br23, current, dispose;

    	var if_block0 = (ctx.j === 0) && create_if_block_10();

    	var if_block1 = (ctx.j === 1) && create_if_block_9();

    	var if_block2 = (ctx.j === 2) && create_if_block_8();

    	var if_block3 = (ctx.j === 3) && create_if_block_7();

    	var if_block4 = (ctx.j === 4) && create_if_block_6();

    	var if_block5 = (ctx.j === 5) && create_if_block_5();

    	var if_block6 = (ctx.j === 7) && create_if_block_4();

    	var if_block7 = (ctx.j === 8) && create_if_block_3();

    	var if_block8 = (ctx.j === 9) && create_if_block_2();

    	var if_block9 = (ctx.j === 10) && create_if_block_1();

    	var if_block10 = (ctx.j === 20) && create_if_block$9();

    	return {
    		c: function create() {
    			div16 = element("div");
    			div15 = element("div");
    			div12 = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			br3 = element("br");
    			br4 = element("br");
    			br5 = element("br");
    			br6 = element("br");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			div0.textContent = "MONAD SERIES";
    			t2 = space();
    			br7 = element("br");
    			t3 = space();
    			li1 = element("li");
    			div1 = element("div");
    			div1.textContent = "A Simple Monad";
    			t5 = space();
    			br8 = element("br");
    			t6 = space();
    			li2 = element("li");
    			div2 = element("div");
    			div2.textContent = "Asynchronous Monad";
    			t8 = space();
    			br9 = element("br");
    			t9 = space();
    			li3 = element("li");
    			div3 = element("div");
    			div3.textContent = "Promises Monad";
    			t11 = space();
    			br10 = element("br");
    			t12 = space();
    			li4 = element("li");
    			div4 = element("div");
    			div4.textContent = "Transducer Simulator";
    			t14 = space();
    			br11 = element("br");
    			t15 = space();
    			li5 = element("li");
    			div5 = element("div");
    			div5.textContent = "Game of Score";
    			t17 = space();
    			br12 = element("br");
    			t18 = space();
    			li6 = element("li");
    			div6 = element("div");
    			div6.textContent = "MISCELANEOUS TOPICS";
    			t20 = space();
    			br13 = element("br");
    			t21 = space();
    			li7 = element("li");
    			div7 = element("div");
    			div7.textContent = "Why Svelte";
    			t23 = space();
    			br14 = element("br");
    			t24 = space();
    			li8 = element("li");
    			div8 = element("div");
    			div8.textContent = "Hidden Haskell Information";
    			t26 = space();
    			br15 = element("br");
    			t27 = space();
    			li9 = element("li");
    			div9 = element("div");
    			div9.textContent = "Bed Bug Eradication";
    			t29 = space();
    			br16 = element("br");
    			t30 = space();
    			li10 = element("li");
    			div10 = element("div");
    			div10.textContent = "Toggle Theme";
    			t32 = space();
    			br17 = element("br");
    			t33 = space();
    			li11 = element("li");
    			div11 = element("div");
    			div11.textContent = "Home";
    			t35 = space();
    			br18 = element("br");
    			t36 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div13.textContent = "DAVID SCHALK'S BLOG";
    			t38 = space();
    			if (if_block0) if_block0.c();
    			t39 = space();
    			if (if_block1) if_block1.c();
    			t40 = space();
    			if (if_block2) if_block2.c();
    			t41 = space();
    			if (if_block3) if_block3.c();
    			t42 = space();
    			if (if_block4) if_block4.c();
    			t43 = space();
    			if (if_block5) if_block5.c();
    			t44 = space();
    			if (if_block6) if_block6.c();
    			t45 = space();
    			if (if_block7) if_block7.c();
    			t46 = space();
    			if (if_block8) if_block8.c();
    			t47 = space();
    			if (if_block9) if_block9.c();
    			t48 = space();
    			if (if_block10) if_block10.c();
    			t49 = space();
    			br19 = element("br");
    			br20 = element("br");
    			br21 = element("br");
    			t50 = space();
    			br22 = element("br");
    			br23 = element("br");
    			add_location(br0, file$b, 112, 24, 2281);
    			add_location(br1, file$b, 112, 28, 2285);
    			add_location(br2, file$b, 112, 32, 2289);
    			add_location(br3, file$b, 112, 36, 2293);
    			add_location(br4, file$b, 112, 40, 2297);
    			add_location(br5, file$b, 112, 44, 2301);
    			add_location(br6, file$b, 112, 48, 2305);
    			attr(div0, "class", "svelte-eqbi6d");
    			add_location(div0, file$b, 114, 28, 2395);
    			add_location(li0, file$b, 114, 24, 2391);
    			add_location(br7, file$b, 115, 24, 2448);
    			attr(div1, "class", "button svelte-eqbi6d");
    			add_location(div1, file$b, 116, 28, 2481);
    			add_location(li1, file$b, 116, 24, 2477);
    			add_location(br8, file$b, 117, 24, 2598);
    			attr(div2, "class", "button svelte-eqbi6d");
    			add_location(div2, file$b, 118, 28, 2631);
    			add_location(li2, file$b, 118, 24, 2627);
    			add_location(br9, file$b, 119, 24, 2750);
    			attr(div3, "class", "button svelte-eqbi6d");
    			add_location(div3, file$b, 120, 28, 2783);
    			add_location(li3, file$b, 120, 24, 2779);
    			add_location(br10, file$b, 121, 24, 2898);
    			attr(div4, "class", "button svelte-eqbi6d");
    			add_location(div4, file$b, 122, 28, 2931);
    			add_location(li4, file$b, 122, 24, 2927);
    			add_location(br11, file$b, 123, 24, 3056);
    			attr(div5, "class", "button svelte-eqbi6d");
    			add_location(div5, file$b, 124, 28, 3089);
    			add_location(li5, file$b, 124, 24, 3085);
    			add_location(br12, file$b, 125, 24, 3204);
    			attr(div6, "class", "svelte-eqbi6d");
    			add_location(div6, file$b, 126, 28, 3237);
    			add_location(li6, file$b, 126, 24, 3233);
    			add_location(br13, file$b, 127, 24, 3297);
    			attr(div7, "class", "button svelte-eqbi6d");
    			add_location(div7, file$b, 128, 28, 3330);
    			add_location(li7, file$b, 128, 24, 3326);
    			add_location(br14, file$b, 129, 24, 3420);
    			attr(div8, "class", "button svelte-eqbi6d");
    			add_location(div8, file$b, 130, 28, 3453);
    			add_location(li8, file$b, 130, 24, 3449);
    			add_location(br15, file$b, 131, 24, 3584);
    			attr(div9, "class", "button svelte-eqbi6d");
    			add_location(div9, file$b, 132, 28, 3617);
    			add_location(li9, file$b, 132, 24, 3613);
    			add_location(br16, file$b, 133, 24, 3741);
    			attr(div10, "class", "button svelte-eqbi6d");
    			add_location(div10, file$b, 134, 28, 3774);
    			add_location(li10, file$b, 134, 24, 3770);
    			add_location(br17, file$b, 135, 24, 3891);
    			attr(div11, "class", "button svelte-eqbi6d");
    			add_location(div11, file$b, 136, 28, 3924);
    			add_location(li11, file$b, 136, 24, 3920);
    			add_location(br18, file$b, 138, 24, 4057);
    			set_style(ul, "list-style", "none");
    			attr(ul, "class", "svelte-eqbi6d");
    			add_location(ul, file$b, 113, 24, 2334);
    			set_style(div12, "margin-Right", "2%");
    			set_style(div12, "width", "20%");
    			attr(div12, "class", "svelte-eqbi6d");
    			add_location(div12, file$b, 111, 24, 2211);
    			set_style(div13, "font-weight", "900");
    			set_style(div13, "font-size", "45px");
    			set_style(div13, "color", "#bbbb00");
    			set_style(div13, "text-align", "center");
    			attr(div13, "class", "svelte-eqbi6d");
    			add_location(div13, file$b, 142, 24, 4217);
    			add_location(br19, file$b, 179, 0, 4678);
    			add_location(br20, file$b, 179, 4, 4682);
    			add_location(br21, file$b, 179, 8, 4686);
    			set_style(div14, "margin-Right", "2%");
    			set_style(div14, "width", "80%");
    			attr(div14, "class", "svelte-eqbi6d");
    			add_location(div14, file$b, 141, 24, 4147);
    			set_style(div15, "display", "flex");
    			attr(div15, "class", "svelte-eqbi6d");
    			add_location(div15, file$b, 109, 24, 2156);
    			attr(div16, "class", "content svelte-eqbi6d");
    			add_location(div16, file$b, 108, 0, 2110);
    			add_location(br22, file$b, 183, 0, 4712);
    			add_location(br23, file$b, 183, 4, 4716);

    			dispose = [
    				listen(div1, "click", ctx.click_handler),
    				listen(div2, "click", ctx.click_handler_1),
    				listen(div3, "click", ctx.click_handler_2),
    				listen(div4, "click", ctx.click_handler_3),
    				listen(div5, "click", ctx.click_handler_4),
    				listen(div7, "click", ctx.click_handler_5),
    				listen(div8, "click", ctx.click_handler_6),
    				listen(div9, "click", ctx.click_handler_7),
    				listen(div10, "click", ctx.click_handler_8),
    				listen(div11, "click", ctx.click_handler_9)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div16, anchor);
    			append(div16, div15);
    			append(div15, div12);
    			append(div12, br0);
    			append(div12, br1);
    			append(div12, br2);
    			append(div12, br3);
    			append(div12, br4);
    			append(div12, br5);
    			append(div12, br6);
    			append(div12, t0);
    			append(div12, ul);
    			append(ul, li0);
    			append(li0, div0);
    			append(ul, t2);
    			append(ul, br7);
    			append(ul, t3);
    			append(ul, li1);
    			append(li1, div1);
    			append(ul, t5);
    			append(ul, br8);
    			append(ul, t6);
    			append(ul, li2);
    			append(li2, div2);
    			append(ul, t8);
    			append(ul, br9);
    			append(ul, t9);
    			append(ul, li3);
    			append(li3, div3);
    			append(ul, t11);
    			append(ul, br10);
    			append(ul, t12);
    			append(ul, li4);
    			append(li4, div4);
    			append(ul, t14);
    			append(ul, br11);
    			append(ul, t15);
    			append(ul, li5);
    			append(li5, div5);
    			append(ul, t17);
    			append(ul, br12);
    			append(ul, t18);
    			append(ul, li6);
    			append(li6, div6);
    			append(ul, t20);
    			append(ul, br13);
    			append(ul, t21);
    			append(ul, li7);
    			append(li7, div7);
    			append(ul, t23);
    			append(ul, br14);
    			append(ul, t24);
    			append(ul, li8);
    			append(li8, div8);
    			append(ul, t26);
    			append(ul, br15);
    			append(ul, t27);
    			append(ul, li9);
    			append(li9, div9);
    			append(ul, t29);
    			append(ul, br16);
    			append(ul, t30);
    			append(ul, li10);
    			append(li10, div10);
    			append(ul, t32);
    			append(ul, br17);
    			append(ul, t33);
    			append(ul, li11);
    			append(li11, div11);
    			append(ul, t35);
    			append(ul, br18);
    			append(div15, t36);
    			append(div15, div14);
    			append(div14, div13);
    			append(div14, t38);
    			if (if_block0) if_block0.m(div14, null);
    			append(div14, t39);
    			if (if_block1) if_block1.m(div14, null);
    			append(div14, t40);
    			if (if_block2) if_block2.m(div14, null);
    			append(div14, t41);
    			if (if_block3) if_block3.m(div14, null);
    			append(div14, t42);
    			if (if_block4) if_block4.m(div14, null);
    			append(div14, t43);
    			if (if_block5) if_block5.m(div14, null);
    			append(div14, t44);
    			if (if_block6) if_block6.m(div14, null);
    			append(div14, t45);
    			if (if_block7) if_block7.m(div14, null);
    			append(div14, t46);
    			if (if_block8) if_block8.m(div14, null);
    			append(div14, t47);
    			if (if_block9) if_block9.m(div14, null);
    			append(div14, t48);
    			if (if_block10) if_block10.m(div14, null);
    			append(div14, t49);
    			append(div14, br19);
    			append(div14, br20);
    			append(div14, br21);
    			insert(target, t50, anchor);
    			insert(target, br22, anchor);
    			insert(target, br23, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.j === 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_10();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div14, t39);
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
    					if_block1 = create_if_block_9();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div14, t40);
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
    					if_block2 = create_if_block_8();
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div14, t41);
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
    					if_block3 = create_if_block_7();
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div14, t42);
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
    					if_block4 = create_if_block_6();
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div14, t43);
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
    					if_block5 = create_if_block_5();
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div14, t44);
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

    			if (ctx.j === 7) {
    				if (!if_block6) {
    					if_block6 = create_if_block_4();
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div14, t45);
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

    			if (ctx.j === 8) {
    				if (!if_block7) {
    					if_block7 = create_if_block_3();
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div14, t46);
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

    			if (ctx.j === 9) {
    				if (!if_block8) {
    					if_block8 = create_if_block_2();
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div14, t47);
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

    			if (ctx.j === 10) {
    				if (!if_block9) {
    					if_block9 = create_if_block_1();
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div14, t48);
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

    			if (ctx.j === 20) {
    				if (!if_block10) {
    					if_block10 = create_if_block$9();
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div14, t49);
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
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div16);
    			}

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

    			if (detaching) {
    				detach(t50);
    				detach(br22);
    				detach(br23);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

        let j = 0;
     console.log(j);

        console.log("j is", j);

    	function click_handler() {j = 1; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_1() {j=2; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_2() {j=9; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_3() {j = 7; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_4() {j=10; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_5() {
    		const $$result = j = 5;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_6() {j = 3; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_7() {j = 4; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_8() {j = 8; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_9() {j = 0; $$invalidate('j', j); console.log("j is", j);}

    	$$self.$$.update = ($$dirty = { j: 1 }) => {
    		if ($$dirty.j) ;
    	};

    	return {
    		j,
    		console,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	};
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$b, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.9.1 */

    function create_fragment$c(ctx) {
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
    		init(this, options, null, create_fragment$c, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world',
    		lok: false
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
