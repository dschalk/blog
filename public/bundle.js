
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

    const globals = (typeof window !== 'undefined' ? window : global);
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

    /* src/Monad.svelte generated by Svelte v3.9.1 */

    const file = "src/Monad.svelte";

    // (105:1) {#if visible}
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
    			add_location(div, file, 105, 2, 2279);
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
    	var br0, br1, br2, t0, t1, br3, t2, span0, t4, span1, t6, span2, t8, p0, t10, p1, t12, p2, t14, pre0, t15, t16, p3, t18, pre1, t20, p4, t22, t23, t24, input, t25, p5, t26, t27, t28, t29_value = ctx.bonads(ctx.num) + "", t29, t30, span3, t32, pre2, t33, t34, p6, t36, p7, t38, p8, t40, p9, current, dispose;

    	var if_block =  create_if_block();

    	return {
    		c: function create() {
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
    			add_location(br0, file, 103, 0, 2249);
    			add_location(br1, file, 103, 4, 2253);
    			add_location(br2, file, 103, 8, 2257);
    			add_location(br3, file, 109, 1, 2445);
    			attr(span0, "class", "tao svelte-1dr4x6t");
    			add_location(span0, file, 110, 0, 2450);
    			set_style(span1, "font-style", "italic");
    			add_location(span1, file, 111, 0, 2553);
    			add_location(span2, file, 112, 0, 2608);
    			add_location(p0, file, 113, 0, 2978);
    			add_location(p1, file, 114, 0, 3404);
    			add_location(p2, file, 115, 0, 3874);
    			add_location(pre0, file, 116, 0, 3926);
    			add_location(p3, file, 117, 0, 3952);
    			add_location(pre1, file, 118, 0, 4034);
    			add_location(p4, file, 119, 0, 4094);
    			attr(input, "id", "one");
    			attr(input, "type", "number");
    			add_location(input, file, 121, 0, 4294);
    			add_location(p5, file, 122, 0, 4367);
    			attr(span3, "class", "tao svelte-1dr4x6t");
    			add_location(span3, file, 124, 0, 4427);
    			add_location(pre2, file, 125, 0, 4614);
    			add_location(p6, file, 129, 0, 4634);
    			add_location(p7, file, 131, 0, 4722);
    			add_location(p8, file, 133, 0, 4935);
    			add_location(p9, file, 134, 0, 5365);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "input", ctx.bonads)
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
    			insert(target, t2, anchor);
    			insert(target, span0, anchor);
    			insert(target, t4, anchor);
    			insert(target, span1, anchor);
    			insert(target, t6, anchor);
    			insert(target, span2, anchor);
    			insert(target, t8, anchor);
    			insert(target, p0, anchor);
    			insert(target, t10, anchor);
    			insert(target, p1, anchor);
    			insert(target, t12, anchor);
    			insert(target, p2, anchor);
    			insert(target, t14, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t15);
    			insert(target, t16, anchor);
    			insert(target, p3, anchor);
    			insert(target, t18, anchor);
    			insert(target, pre1, anchor);
    			insert(target, t20, anchor);
    			insert(target, p4, anchor);
    			insert(target, t22, anchor);
    			insert(target, t23, anchor);
    			insert(target, t24, anchor);
    			insert(target, input, anchor);

    			set_input_value(input, ctx.num);

    			insert(target, t25, anchor);
    			insert(target, p5, anchor);
    			append(p5, t26);
    			append(p5, t27);
    			append(p5, t28);
    			append(p5, t29);
    			insert(target, t30, anchor);
    			insert(target, span3, anchor);
    			insert(target, t32, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t33);
    			insert(target, t34, anchor);
    			insert(target, p6, anchor);
    			insert(target, t36, anchor);
    			insert(target, p7, anchor);
    			insert(target, t38, anchor);
    			insert(target, p8, anchor);
    			insert(target, t40, anchor);
    			insert(target, p9, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
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
    				detach(br0);
    				detach(br1);
    				detach(br2);
    				detach(t0);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(br3);
    				detach(t2);
    				detach(span0);
    				detach(t4);
    				detach(span1);
    				detach(t6);
    				detach(span2);
    				detach(t8);
    				detach(p0);
    				detach(t10);
    				detach(p1);
    				detach(t12);
    				detach(p2);
    				detach(t14);
    				detach(pre0);
    				detach(t16);
    				detach(p3);
    				detach(t18);
    				detach(pre1);
    				detach(t20);
    				detach(p4);
    				detach(t22);
    				detach(t23);
    				detach(t24);
    				detach(input);
    				detach(t25);
    				detach(p5);
    				detach(t30);
    				detach(span3);
    				detach(t32);
    				detach(pre2);
    				detach(t34);
    				detach(p6);
    				detach(t36);
    				detach(p7);
    				detach(t38);
    				detach(p8);
    				detach(t40);
    				detach(p9);
    			}

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
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/Asynchronous_Monad.svelte generated by Svelte v3.9.1 */
    const { Object: Object_1, console: console_1 } = globals;

    const file$1 = "src/Asynchronous_Monad.svelte";

    // (347:0) {#if visible}
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
    			add_location(div_1, file$1, 347, 1, 8239);
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
    	var br0, br1, br2, t0, t1, br3, br4, t2, button, t4, br5, br6, t5, span0, t7, span1, t8_value = ctx.O.c0 + "", t8, t9, t10_value = ctx.O.c1 + "", t10, t11, t12_value = ctx.O.c2 + "", t12, t13, t14_value = ctx.O.c3 + "", t14, t15, t16_value = ctx.O.c4 + "", t16, t17, t18_value = ctx.O.c5 + "", t18, t19, t20_value = ctx.O.c6 + "", t20, t21, t22_value = ctx.O.c7 + "", t22, t23, t24_value = ctx.O.c8 + "", t24, t25, t26_value = ctx.O.c9 + "", t26, t27, t28_value = ctx.O.c10 + "", t28, t29, t30_value = ctx.O.c11 + "", t30, t31, t32_value = ctx.O.c12 + "", t32, t33, t34_value = ctx.O.c13 + "", t34, t35, t36_value = ctx.O.c14 + "", t36, t37, br7, br8, t38, div0, t40, div1, t41_value = ctx.O.d0 + "", t41, t42, br9, t43, t44_value = ctx.O.d1 + "", t44, t45, br10, t46, t47_value = ctx.O.d2 + "", t47, t48, br11, t49, t50_value = ctx.O.d3 + "", t50, t51, br12, t52, t53_value = ctx.O.d4 + "", t53, t54, br13, t55, t56_value = ctx.O.d5 + "", t56, t57, br14, t58, t59_value = ctx.O.d6 + "", t59, t60, br15, t61, t62_value = ctx.O.d7 + "", t62, t63, br16, t64, t65_value = ctx.O.d8 + "", t65, t66, br17, t67, t68_value = ctx.O.d9 + "", t68, t69, br18, t70, t71_value = ctx.O.d10 + "", t71, t72, br19, t73, t74_value = ctx.O.d11 + "", t74, t75, br20, t76, t77_value = ctx.O.d12 + "", t77, t78, br21, t79, t80_value = ctx.O.d13 + "", t80, t81, br22, t82, t83_value = ctx.O.d14 + "", t83, t84, br23, t85, br24, t86, p0, pre0, t88, t89, pre1, t90, t91, p1, pre2, t93, t94, p2, t96, pre3, t97, t98, p3, pre4, t100, t101, p4, pre5, t103, t104, p5, t106, br25, t107, span2, t109, a, current, dispose;

    	var if_block =  create_if_block$1();

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
    			button = element("button");
    			button.textContent = "EXECUTE factors()";
    			t4 = space();
    			br5 = element("br");
    			br6 = element("br");
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = "The WebSockets server sent these pseudo-random numbers:";
    			t7 = space();
    			span1 = element("span");
    			t8 = text(t8_value);
    			t9 = text(", ");
    			t10 = text(t10_value);
    			t11 = text(", ");
    			t12 = text(t12_value);
    			t13 = text(", ");
    			t14 = text(t14_value);
    			t15 = text(", ");
    			t16 = text(t16_value);
    			t17 = text(", ");
    			t18 = text(t18_value);
    			t19 = text(", ");
    			t20 = text(t20_value);
    			t21 = text(", ");
    			t22 = text(t22_value);
    			t23 = text(", ");
    			t24 = text(t24_value);
    			t25 = text(", ");
    			t26 = text(t26_value);
    			t27 = text(", ");
    			t28 = text(t28_value);
    			t29 = text(", ");
    			t30 = text(t30_value);
    			t31 = text(", ");
    			t32 = text(t32_value);
    			t33 = text(", ");
    			t34 = text(t34_value);
    			t35 = text(", ");
    			t36 = text(t36_value);
    			t37 = space();
    			br7 = element("br");
    			br8 = element("br");
    			t38 = space();
    			div0 = element("div");
    			div0.textContent = "The web worker sent these results:";
    			t40 = space();
    			div1 = element("div");
    			t41 = text(t41_value);
    			t42 = space();
    			br9 = element("br");
    			t43 = space();
    			t44 = text(t44_value);
    			t45 = space();
    			br10 = element("br");
    			t46 = space();
    			t47 = text(t47_value);
    			t48 = space();
    			br11 = element("br");
    			t49 = space();
    			t50 = text(t50_value);
    			t51 = space();
    			br12 = element("br");
    			t52 = space();
    			t53 = text(t53_value);
    			t54 = space();
    			br13 = element("br");
    			t55 = space();
    			t56 = text(t56_value);
    			t57 = space();
    			br14 = element("br");
    			t58 = space();
    			t59 = text(t59_value);
    			t60 = space();
    			br15 = element("br");
    			t61 = space();
    			t62 = text(t62_value);
    			t63 = space();
    			br16 = element("br");
    			t64 = space();
    			t65 = text(t65_value);
    			t66 = space();
    			br17 = element("br");
    			t67 = space();
    			t68 = text(t68_value);
    			t69 = space();
    			br18 = element("br");
    			t70 = space();
    			t71 = text(t71_value);
    			t72 = space();
    			br19 = element("br");
    			t73 = space();
    			t74 = text(t74_value);
    			t75 = space();
    			br20 = element("br");
    			t76 = space();
    			t77 = text(t77_value);
    			t78 = space();
    			br21 = element("br");
    			t79 = space();
    			t80 = text(t80_value);
    			t81 = space();
    			br22 = element("br");
    			t82 = space();
    			t83 = text(t83_value);
    			t84 = space();
    			br23 = element("br");
    			t85 = space();
    			br24 = element("br");
    			t86 = space();
    			p0 = element("p");
    			p0.textContent = "There are many ways to display the behavior of monads returned by Monad(). For this demonstration, a simple object named \"O\" was created and Monad was modified to make key-value pairs on O out of each monad's monad's name and array.\n";
    			pre0 = element("pre");
    			t88 = text(ctx.mon);
    			t89 = text("\nThe statement \"Monad(['value\"], 'key\")(x => 'This is the ' + x)(x => x + '.')(halt)\" attaches the the resulting monad to O as follows:\n");
    			pre1 = element("pre");
    			t90 = text(ctx.statement);
    			t91 = space();
    			p1 = element("p");
    			p1.textContent = "The demonstration procedure is initiated by calling factors().\n";
    			pre2 = element("pre");
    			t93 = text(ctx.fa);
    			t94 = space();
    			p2 = element("p");
    			p2.textContent = "factor() is called once every second until lock === false; then, lock is set to true and fact() is called. The lock assures that the procedures initiated by fact() will complete before fact() is called again.";
    			t96 = space();
    			pre3 = element("pre");
    			t97 = text(ctx.fac);
    			t98 = space();
    			p3 = element("p");
    			p3.textContent = "Messages are sent to the Haskell WebSockets server requesting random numbers between 1 and the integer specified at the end of the request. randomR from the System.Random library produces a number which is sent back to the browser with prefix \"BE#$42\". Messages from the server are parsed and processed in socket.onmessage, which requests the random number's prime decomposition from worker_O.\n";
    			pre4 = element("pre");
    			t100 = text(ctx.onmessServer);
    			t101 = space();
    			p4 = element("p");
    			p4.textContent = "Messages from the web worker are processed in worker_O.onmessage\n";
    			pre5 = element("pre");
    			t103 = text(ctx.onmessWorker);
    			t104 = space();
    			p5 = element("p");
    			p5.textContent = "When M === 14 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand().";
    			t106 = space();
    			br25 = element("br");
    			t107 = space();
    			span2 = element("span");
    			span2.textContent = "The code for this Svelte application is at";
    			t109 = space();
    			a = element("a");
    			a.textContent = "GitHub repository";
    			add_location(br0, file$1, 345, 0, 8211);
    			add_location(br1, file$1, 345, 4, 8215);
    			add_location(br2, file$1, 345, 8, 8219);
    			add_location(br3, file$1, 352, 0, 8400);
    			add_location(br4, file$1, 352, 4, 8404);
    			add_location(button, file$1, 353, 0, 8409);
    			add_location(br5, file$1, 354, 0, 8465);
    			add_location(br6, file$1, 354, 4, 8469);
    			set_style(span0, "color", "#EEBBBB");
    			add_location(span0, file$1, 355, 0, 8474);
    			add_location(span1, file$1, 356, 0, 8570);
    			add_location(br7, file$1, 357, 0, 8708);
    			add_location(br8, file$1, 357, 4, 8712);
    			set_style(div0, "color", "#EEBBBB");
    			add_location(div0, file$1, 358, 0, 8717);
    			add_location(br9, file$1, 361, 0, 8803);
    			add_location(br10, file$1, 363, 0, 8815);
    			add_location(br11, file$1, 365, 0, 8827);
    			add_location(br12, file$1, 367, 0, 8839);
    			add_location(br13, file$1, 369, 0, 8851);
    			add_location(br14, file$1, 371, 0, 8863);
    			add_location(br15, file$1, 373, 0, 8875);
    			add_location(br16, file$1, 375, 0, 8887);
    			add_location(br17, file$1, 377, 0, 8899);
    			add_location(br18, file$1, 379, 0, 8911);
    			add_location(br19, file$1, 381, 0, 8924);
    			add_location(br20, file$1, 383, 0, 8937);
    			add_location(br21, file$1, 385, 0, 8950);
    			add_location(br22, file$1, 387, 0, 8963);
    			add_location(br23, file$1, 389, 0, 8976);
    			add_location(div1, file$1, 359, 0, 8790);
    			add_location(br24, file$1, 391, 0, 8988);
    			add_location(p0, file$1, 392, 0, 8993);
    			add_location(pre0, file$1, 393, 0, 9230);
    			add_location(pre1, file$1, 395, 0, 9382);
    			add_location(p1, file$1, 396, 0, 9405);
    			add_location(pre2, file$1, 397, 0, 9472);
    			add_location(p2, file$1, 398, 0, 9488);
    			add_location(pre3, file$1, 399, 0, 9706);
    			add_location(p3, file$1, 400, 0, 9723);
    			add_location(pre4, file$1, 401, 0, 10121);
    			add_location(p4, file$1, 402, 0, 10147);
    			add_location(pre5, file$1, 403, 0, 10216);
    			add_location(p5, file$1, 404, 0, 10242);
    			add_location(br25, file$1, 405, 0, 10397);
    			add_location(span2, file$1, 406, 0, 10402);
    			attr(a, "href", "https://github.com/dschalk/blog/");
    			attr(a, "target", "_blank");
    			add_location(a, file$1, 407, 0, 10460);
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
    			insert(target, button, anchor);
    			insert(target, t4, anchor);
    			insert(target, br5, anchor);
    			insert(target, br6, anchor);
    			insert(target, t5, anchor);
    			insert(target, span0, anchor);
    			insert(target, t7, anchor);
    			insert(target, span1, anchor);
    			append(span1, t8);
    			append(span1, t9);
    			append(span1, t10);
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
    			insert(target, t37, anchor);
    			insert(target, br7, anchor);
    			insert(target, br8, anchor);
    			insert(target, t38, anchor);
    			insert(target, div0, anchor);
    			insert(target, t40, anchor);
    			insert(target, div1, anchor);
    			append(div1, t41);
    			append(div1, t42);
    			append(div1, br9);
    			append(div1, t43);
    			append(div1, t44);
    			append(div1, t45);
    			append(div1, br10);
    			append(div1, t46);
    			append(div1, t47);
    			append(div1, t48);
    			append(div1, br11);
    			append(div1, t49);
    			append(div1, t50);
    			append(div1, t51);
    			append(div1, br12);
    			append(div1, t52);
    			append(div1, t53);
    			append(div1, t54);
    			append(div1, br13);
    			append(div1, t55);
    			append(div1, t56);
    			append(div1, t57);
    			append(div1, br14);
    			append(div1, t58);
    			append(div1, t59);
    			append(div1, t60);
    			append(div1, br15);
    			append(div1, t61);
    			append(div1, t62);
    			append(div1, t63);
    			append(div1, br16);
    			append(div1, t64);
    			append(div1, t65);
    			append(div1, t66);
    			append(div1, br17);
    			append(div1, t67);
    			append(div1, t68);
    			append(div1, t69);
    			append(div1, br18);
    			append(div1, t70);
    			append(div1, t71);
    			append(div1, t72);
    			append(div1, br19);
    			append(div1, t73);
    			append(div1, t74);
    			append(div1, t75);
    			append(div1, br20);
    			append(div1, t76);
    			append(div1, t77);
    			append(div1, t78);
    			append(div1, br21);
    			append(div1, t79);
    			append(div1, t80);
    			append(div1, t81);
    			append(div1, br22);
    			append(div1, t82);
    			append(div1, t83);
    			append(div1, t84);
    			append(div1, br23);
    			insert(target, t85, anchor);
    			insert(target, br24, anchor);
    			insert(target, t86, anchor);
    			insert(target, p0, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t88);
    			insert(target, t89, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t90);
    			insert(target, t91, anchor);
    			insert(target, p1, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t93);
    			insert(target, t94, anchor);
    			insert(target, p2, anchor);
    			insert(target, t96, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t97);
    			insert(target, t98, anchor);
    			insert(target, p3, anchor);
    			insert(target, pre4, anchor);
    			append(pre4, t100);
    			insert(target, t101, anchor);
    			insert(target, p4, anchor);
    			insert(target, pre5, anchor);
    			append(pre5, t103);
    			insert(target, t104, anchor);
    			insert(target, p5, anchor);
    			insert(target, t106, anchor);
    			insert(target, br25, anchor);
    			insert(target, t107, anchor);
    			insert(target, span2, anchor);
    			insert(target, t109, anchor);
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

    			if ((!current || changed.O) && t14_value !== (t14_value = ctx.O.c3 + "")) {
    				set_data(t14, t14_value);
    			}

    			if ((!current || changed.O) && t16_value !== (t16_value = ctx.O.c4 + "")) {
    				set_data(t16, t16_value);
    			}

    			if ((!current || changed.O) && t18_value !== (t18_value = ctx.O.c5 + "")) {
    				set_data(t18, t18_value);
    			}

    			if ((!current || changed.O) && t20_value !== (t20_value = ctx.O.c6 + "")) {
    				set_data(t20, t20_value);
    			}

    			if ((!current || changed.O) && t22_value !== (t22_value = ctx.O.c7 + "")) {
    				set_data(t22, t22_value);
    			}

    			if ((!current || changed.O) && t24_value !== (t24_value = ctx.O.c8 + "")) {
    				set_data(t24, t24_value);
    			}

    			if ((!current || changed.O) && t26_value !== (t26_value = ctx.O.c9 + "")) {
    				set_data(t26, t26_value);
    			}

    			if ((!current || changed.O) && t28_value !== (t28_value = ctx.O.c10 + "")) {
    				set_data(t28, t28_value);
    			}

    			if ((!current || changed.O) && t30_value !== (t30_value = ctx.O.c11 + "")) {
    				set_data(t30, t30_value);
    			}

    			if ((!current || changed.O) && t32_value !== (t32_value = ctx.O.c12 + "")) {
    				set_data(t32, t32_value);
    			}

    			if ((!current || changed.O) && t34_value !== (t34_value = ctx.O.c13 + "")) {
    				set_data(t34, t34_value);
    			}

    			if ((!current || changed.O) && t36_value !== (t36_value = ctx.O.c14 + "")) {
    				set_data(t36, t36_value);
    			}

    			if ((!current || changed.O) && t41_value !== (t41_value = ctx.O.d0 + "")) {
    				set_data(t41, t41_value);
    			}

    			if ((!current || changed.O) && t44_value !== (t44_value = ctx.O.d1 + "")) {
    				set_data(t44, t44_value);
    			}

    			if ((!current || changed.O) && t47_value !== (t47_value = ctx.O.d2 + "")) {
    				set_data(t47, t47_value);
    			}

    			if ((!current || changed.O) && t50_value !== (t50_value = ctx.O.d3 + "")) {
    				set_data(t50, t50_value);
    			}

    			if ((!current || changed.O) && t53_value !== (t53_value = ctx.O.d4 + "")) {
    				set_data(t53, t53_value);
    			}

    			if ((!current || changed.O) && t56_value !== (t56_value = ctx.O.d5 + "")) {
    				set_data(t56, t56_value);
    			}

    			if ((!current || changed.O) && t59_value !== (t59_value = ctx.O.d6 + "")) {
    				set_data(t59, t59_value);
    			}

    			if ((!current || changed.O) && t62_value !== (t62_value = ctx.O.d7 + "")) {
    				set_data(t62, t62_value);
    			}

    			if ((!current || changed.O) && t65_value !== (t65_value = ctx.O.d8 + "")) {
    				set_data(t65, t65_value);
    			}

    			if ((!current || changed.O) && t68_value !== (t68_value = ctx.O.d9 + "")) {
    				set_data(t68, t68_value);
    			}

    			if ((!current || changed.O) && t71_value !== (t71_value = ctx.O.d10 + "")) {
    				set_data(t71, t71_value);
    			}

    			if ((!current || changed.O) && t74_value !== (t74_value = ctx.O.d11 + "")) {
    				set_data(t74, t74_value);
    			}

    			if ((!current || changed.O) && t77_value !== (t77_value = ctx.O.d12 + "")) {
    				set_data(t77, t77_value);
    			}

    			if ((!current || changed.O) && t80_value !== (t80_value = ctx.O.d13 + "")) {
    				set_data(t80, t80_value);
    			}

    			if ((!current || changed.O) && t83_value !== (t83_value = ctx.O.d14 + "")) {
    				set_data(t83, t83_value);
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
    				detach(button);
    				detach(t4);
    				detach(br5);
    				detach(br6);
    				detach(t5);
    				detach(span0);
    				detach(t7);
    				detach(span1);
    				detach(t37);
    				detach(br7);
    				detach(br8);
    				detach(t38);
    				detach(div0);
    				detach(t40);
    				detach(div1);
    				detach(t85);
    				detach(br24);
    				detach(t86);
    				detach(p0);
    				detach(pre0);
    				detach(t89);
    				detach(pre1);
    				detach(t91);
    				detach(p1);
    				detach(pre2);
    				detach(t94);
    				detach(p2);
    				detach(t96);
    				detach(pre3);
    				detach(t98);
    				detach(p3);
    				detach(pre4);
    				detach(t101);
    				detach(p4);
    				detach(pre5);
    				detach(t104);
    				detach(p5);
    				detach(t106);
    				detach(br25);
    				detach(t107);
    				detach(span2);
    				detach(t109);
    				detach(a);
    			}

    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	


       let { lock } = $$props;
       $$invalidate('lock', lock = false);

       var O = new Object();

       var M = -1;
       var N = -1;
       var Q = -1;

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

       var socket = new WebSocket("ws://schalk.net:3055");

       socket.onclose = function (event) {
         console.log('<><><> ALERT - socket is closing. <><><> ', event);
       };
       socket.onmessage = function(e) {
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
             factors();
             factors();
             factors();
             // socket.send(`GZ#$42,solo,${v}`);
           } else {
             login();
           }
         }, 200);
       }
       var groupDelete = function groupDelete (ob, x) {
          for (var x in ob) if (x.startsWith("d")) delete ob[x];
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
             groupDelete(O, "c");
             groupDelete(O, "d");
             fact();
          }
          else {
             setTimeout(()=> {
             factors();
          },1000);
          }
       }

       var fact = function fact () {
          socket.send("BE#$42,solo,3032896499791,10000");
          socket.send("BE#$42,solo,3032896499791,1000");
          socket.send("BE#$42,solo,3032896499791,100000");
          socket.send("BE#$42,solo,3032896499791,100000");
          socket.send("BE#$42,solo,3032896499791,10000");
          socket.send("BE#$42,solo,3032896499791,100000");
          socket.send("BE#$42,solo,3032896499791,1000000");
          socket.send("BE#$42,solo,3032896499791,1000");
          socket.send("BE#$42,solo,3032896499791,1000000");
          socket.send("BE#$42,solo,3032896499791,10000");
          socket.send("BE#$42,solo,3032896499791,100000");
          socket.send("BE#$42,solo,3032896499791,100000");
          socket.send("BE#$42,solo,3032896499791,100000");
          socket.send("BE#$42,solo,3032896499791,10000");
          socket.send("BE#$42,solo,3032896499791,100000");

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
      var mon = `   var Monad = function Monad ( AR = [], name = "generic"  )  {
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
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,1000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,1000000")
   socket.send("BE#$42,solo,3032896499791,1000")
   socket.send("BE#$42,solo,3032896499791,1000000")
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,100000")

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
     }
   } `;

    	const writable_props = ['lock'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Asynchronous_Monad> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('lock' in $$props) $$invalidate('lock', lock = $$props.lock);
    	};

    	$$self.$$.update = ($$dirty = { O: 1, M: 1, N: 1, T: 1, Q: 1 }) => {
    		if ($$dirty.O) ;
    		if ($$dirty.M) ;
    		if ($$dirty.N) ;
    		if ($$dirty.T) ;
    		if ($$dirty.Q) ;
    	};

    	return {
    		lock,
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

    class Asynchronous_Monad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["lock"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.lock === undefined && !('lock' in props)) {
    			console_1.warn("<Asynchronous_Monad> was created without expected prop 'lock'");
    		}
    	}

    	get lock() {
    		throw new Error("<Asynchronous_Monad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lock(value) {
    		throw new Error("<Asynchronous_Monad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Promises_Monad.svelte generated by Svelte v3.9.1 */

    const file$2 = "src/Promises_Monad.svelte";

    // (198:0) {#if visible}
    function create_if_block$2(ctx) {
    	var div_1, br0, br1, t, div_1_transition, current;

    	return {
    		c: function create() {
    			div_1 = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nHandling Promises With Monads");
    			add_location(br0, file$2, 199, 1, 4850);
    			add_location(br1, file$2, 199, 5, 4854);
    			set_style(div_1, "font-family", "Times New Roman");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "color", "hsl(210, 90%, 90%)");
    			set_style(div_1, "font-size", "32px");
    			add_location(div_1, file$2, 198, 1, 4722);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div_1, anchor);
    			append(div_1, br0);
    			append(div_1, br1);
    			append(div_1, t);
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
    	var t0, br0, t1, h1, t3, div0, t4_value = ctx.O.test + "", t4, t5, div1, t6_value = ctx.O.test_2 + "", t6, t7, button, t9, p0, t11, pre0, t12, t13, p1, t15, pre1, t16, t17, p2, t19, pre2, t20, t21, br1, t22, br2, t23, span0, t25, span1, t27, span2, current, dispose;

    	var if_block =  create_if_block$2();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "PISS";
    			t3 = space();
    			div0 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			button = element("button");
    			button.textContent = "START";
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Here's the modified monad constructor:";
    			t11 = space();
    			pre0 = element("pre");
    			t12 = text(ctx.mon);
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "After monads encounter \"halt\", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:";
    			t15 = space();
    			pre1 = element("pre");
    			t16 = text(ctx.fs);
    			t17 = space();
    			p2 = element("p");
    			p2.textContent = "This is the statement that produces the observed results when \"START\" is clicked.";
    			t19 = space();
    			pre2 = element("pre");
    			t20 = text(ctx.code);
    			t21 = space();
    			br1 = element("br");
    			t22 = space();
    			br2 = element("br");
    			t23 = space();
    			span0 = element("span");
    			span0.textContent = "Notice the statement:";
    			t25 = space();
    			span1 = element("span");
    			span1.textContent = "()=>addP(O.test_2[2])(O.test_2[1])";
    			t27 = space();
    			span2 = element("span");
    			span2.textContent = ". Promises in chains of ES6 Promises can't access previous Promise resolution values. One way to get access to prior resolution values is to encapsulate Promise chains in Monad(). This also makes it convenient to resume or branch from terminated computation chains; and this can be accomplished without naming the chains.";
    			add_location(br0, file$2, 203, 0, 4903);
    			add_location(h1, file$2, 204, 0, 4908);
    			add_location(div0, file$2, 205, 0, 4922);
    			add_location(div1, file$2, 206, 0, 4942);
    			add_location(button, file$2, 207, 0, 4964);
    			add_location(p0, file$2, 209, 0, 5007);
    			add_location(pre0, file$2, 210, 0, 5055);
    			add_location(p1, file$2, 211, 0, 5072);
    			add_location(pre1, file$2, 212, 0, 5283);
    			add_location(p2, file$2, 213, 0, 5299);
    			add_location(pre2, file$2, 214, 0, 5390);
    			add_location(br1, file$2, 215, 0, 5408);
    			add_location(br2, file$2, 217, 0, 5414);
    			attr(span0, "class", "tao");
    			add_location(span0, file$2, 218, 0, 5419);
    			set_style(span1, "color", "#AAFFAA");
    			add_location(span1, file$2, 219, 0, 5470);
    			add_location(span2, file$2, 220, 0, 5543);
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
    			insert(target, h1, anchor);
    			insert(target, t3, anchor);
    			insert(target, div0, anchor);
    			append(div0, t4);
    			insert(target, t5, anchor);
    			insert(target, div1, anchor);
    			append(div1, t6);
    			insert(target, t7, anchor);
    			insert(target, button, anchor);
    			insert(target, t9, anchor);
    			insert(target, p0, anchor);
    			insert(target, t11, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t12);
    			insert(target, t13, anchor);
    			insert(target, p1, anchor);
    			insert(target, t15, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t16);
    			insert(target, t17, anchor);
    			insert(target, p2, anchor);
    			insert(target, t19, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t20);
    			insert(target, t21, anchor);
    			insert(target, br1, anchor);
    			insert(target, t22, anchor);
    			insert(target, br2, anchor);
    			insert(target, t23, anchor);
    			insert(target, span0, anchor);
    			insert(target, t25, anchor);
    			insert(target, span1, anchor);
    			insert(target, t27, anchor);
    			insert(target, span2, anchor);
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

    			if ((!current || changed.O) && t4_value !== (t4_value = ctx.O.test + "")) {
    				set_data(t4, t4_value);
    			}

    			if ((!current || changed.O) && t6_value !== (t6_value = ctx.O.test_2 + "")) {
    				set_data(t6, t6_value);
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
    				detach(h1);
    				detach(t3);
    				detach(div0);
    				detach(t5);
    				detach(div1);
    				detach(t7);
    				detach(button);
    				detach(t9);
    				detach(p0);
    				detach(t11);
    				detach(pre0);
    				detach(t13);
    				detach(p1);
    				detach(t15);
    				detach(pre1);
    				detach(t17);
    				detach(p2);
    				detach(t19);
    				detach(pre2);
    				detach(t21);
    				detach(br1);
    				detach(t22);
    				detach(br2);
    				detach(t23);
    				detach(span0);
    				detach(t25);
    				detach(span1);
    				detach(t27);
    				detach(span2);
    			}

    			dispose();
    		}
    	};
    }

    async function squareP (x) {
        await wait$1(1200);
        return x*x;
      }

    async function cubeP (x) {
        await wait$1(1200);
        return x*x*x;
      }

    async function sqrtP (x) {
        await wait$1(1200);
        return x**(1/2)
      }

    function wait$1(ms) {
         return new Promise(r => setTimeout(r, ms));
      }

    function instance$2($$self, $$props, $$invalidate) {

        var divP = a => async b => {
          await wait$1 (1000);
          return b/a;
        };

        var addP = x => async y => {
          await wait$1(1000);
          return x + y;
        };

        var multP = x => async y => {
          await wait$1(1200);
          return x * y;
        };

       var O = new Object();
       O.test = []; $$invalidate('O', O);
       O.test_2 = []; $$invalidate('O', O);

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

       var branch = function branch (s,s2) {return Monad(O[s]  , s2)};
       var resume = function resume (s) {return Monad(O[s], s)};

    var mon = `   var Monad = function Monad ( AR = [], name = "generic"  )  {
     var f_, p, run;
     var ar = AR.slice();
     var name = name;
     O[name] = ar;
     let x = O[name].pop();
     return run = (function run (x) {
       if (x instanceof Promise) x.then(y => {
         console.log(x, "is a Promise");
         if (y != undefined && y == y && y.name !== "f_") {
         O[name] = O[name].concat(y)
         }
       })
       if (!(x instanceof Promise)) {
          console.log(x, "is not a promise");
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

      var start = function start () {
         $$invalidate('O', O = {});
         Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
         (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
         (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
         (() => resume("test")(multP(4))(addP(6))));
      };

    var fs = `   var branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
   var resume = function resume (s) {return Monad(O[s], s)}`;
    var code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
     (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
     (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
     (() => resume("test")(multP(4))(addP(6))))`;

    	$$self.$$.update = ($$dirty = { O: 1, M: 1, N: 1, T: 1, Q: 1, lock: 1 }) => {
    		if ($$dirty.O) ;
    		if ($$dirty.M) ;
    		if ($$dirty.N) ;
    		if ($$dirty.T) ;
    		if ($$dirty.Q) ;
    		if ($$dirty.lock) ;
    	};

    	return { O, mon, start, fs, code };
    }

    class Promises_Monad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/Haskell.svelte generated by Svelte v3.9.1 */

    const file$3 = "src/Haskell.svelte";

    // (30:0) {#if visible}
    function create_if_block$3(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nHASKELL TUTORIAL SUPPLEMENT");
    			add_location(br0, file$3, 31, 1, 721);
    			add_location(br1, file$3, 31, 5, 725);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$3, 30, 1, 594);
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

    function create_fragment$3(ctx) {
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, span0, t10, a0, t12, br0, t13, pre, t15, p4, t17, span1, t19, a1, t21, br1, t22, br2, t23, span2, t25, a2, t27, span3, t29, a3, current;

    	var if_block =  create_if_block$3();

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
    			add_location(p0, file$3, 36, 0, 773);
    			add_location(p1, file$3, 37, 0, 1156);
    			attr(p2, "id", "large");
    			attr(p2, "class", "svelte-hw6ke3");
    			add_location(p2, file$3, 38, 0, 1603);
    			add_location(p3, file$3, 39, 0, 1637);
    			attr(span0, "class", "tao");
    			add_location(span0, file$3, 40, 0, 1924);
    			attr(a0, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$3, 41, 0, 2042);
    			add_location(br0, file$3, 42, 0, 2163);
    			add_location(pre, file$3, 43, 0, 2170);
    			add_location(p4, file$3, 44, 0, 2197);
    			attr(span1, "class", "tao");
    			add_location(span1, file$3, 45, 0, 2759);
    			attr(a1, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$3, 46, 0, 2815);
    			add_location(br1, file$3, 47, 0, 2942);
    			add_location(br2, file$3, 48, 0, 2949);
    			attr(span2, "class", "tao");
    			add_location(span2, file$3, 49, 0, 2956);
    			attr(a2, "href", "https://wiki.haskell.org/Unsafe_functions");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$3, 50, 0, 3065);
    			add_location(span3, file$3, 51, 0, 3166);
    			attr(a3, "href", "https://wiki.haskell.org/Top_level_mutable_state");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$3, 52, 0, 3254);
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/Bugs.svelte generated by Svelte v3.9.1 */

    const file$4 = "src/Bugs.svelte";

    // (11:0) {#if visible}
    function create_if_block$4(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nCOMPLETE ERADICATION OF BED BUGS");
    			add_location(br0, file$4, 12, 1, 521);
    			add_location(br1, file$4, 12, 5, 525);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$4, 11, 1, 393);
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
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, p4, t10, p5, t12, p6, t14, p7, t16, p8, t18, p9, t20, p10, t22, p11, current;

    	var if_block =  create_if_block$4();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "I had a massive bed bug infestation in my rented condominium before I knew what hit me. My box springs were on the floor, making it easy for bed bugs to climb onto my mattress and feast while I slept.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "When I realized what was happening, I saw that large numbers of bed bugs were clustered at numerous locations on on the walls near the head of my bed. They were seeking the source of the carbon dioxide I exhaled as I slept. I squashed them and washed the walls. Many others were hiding in my mattress. I encased the mattress and those bugs are now dead.";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "I know the procedure I am about to describe works because I used it and eradication proceeded quickly to completion. Over the past two years there has been no sign of a bedbug being in my home. My strategy was to put my box springs on a metal frame, encase my mattress, and apply fluffed up silica gel on the floor under and around my bed.";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "I bought five pounds of silica gel on Ebay and a large yellow puff dispenser on Amazon.com. I dedicated my coffee grinder to the fluffing process. You should wear a dust mask while dispensing silica gel with a puffer, or else hold your breath and rush into an adjacent room when you need air.";
    			t8 = space();
    			p4 = element("p");
    			p4.textContent = "Professional eradicators don't leave visible residues on floors. That is why they get poor results with silica gel, results comparable to the ones they get with toxic pesticides. Professional exterminators have been known to apply silica gel dissolved in water, which seems absurd in light of the fact that silica gel kills bed bugs by drying them up.";
    			t10 = space();
    			p5 = element("p");
    			p5.textContent = "Silica gel is found in little packets in over the counter medications. The FDA allows up to two percent as a food additive. Lung irritation during application can be avoided by using a dust mask or ducking into an adjacent room to catch your breath.";
    			t12 = space();
    			p6 = element("p");
    			p6.textContent = "Newly hatched bed bugs don\\'t survive as long as mature ones without blood, so get your bed up on a frame and encase the box springs and mattress. Eggs hatch within ten days. The hatchlings need blood before each molting, so they don't mature without blood. Put the legs of the frame into traps for extra protection. Then, at least, you can sleep without being bitten and know that the mature bed bug population can no longer increase.";
    			t14 = space();
    			p7 = element("p");
    			p7.textContent = "You have to be willing to live with visible white powder on your floor for a while. As I said, puff the silica gel you fluffed in the coffee grinder all around and under your bed. You can also apply along base boards and in crawl spaces. When I tried sleeping in a room down the hall, bed bugs quickly found me. I removed a panel in the middle bedroom and saw the bathtub and a bed bug. Bed bugs were traveling under the floor and behind the walls.";
    			t16 = space();
    			p8 = element("p");
    			p8.textContent = "Bed bugs can remain dormant in a vacant building for up to one year, but if they sense someone breathing, they go to the site of the exhaled carbon dioxide. Bed bugs can\\'t nourish themselves with anything but blood. When they go after yours, they will step into silica gel, start drying up, and die within two days.";
    			t18 = space();
    			p9 = element("p");
    			p9.textContent = "Bed bugs can feast on you when you sit on upholstered furniture. The simplest thing to do is discard all upholstered furniture. That's what I did.";
    			t20 = space();
    			p10 = element("p");
    			p10.textContent = "We think my infestation started when bed bugs migrated away from my neighbor's adjoining condo. Bed bugs like to cluster but pregnant females stray off to avoid more traumatic insemination. They don't have vaginas and male bed bugs have spear penises that punch through female bed bugs\\'s abdomens causing serious injury. These are, by any standard, truly disgusting creatures.";
    			t22 = space();
    			p11 = element("p");
    			p11.textContent = "Heat treatment is the current state of the art. It costs thousands of dollars and sometimes doesn't work. Google searches result in nothing but misinformation so I felt obliged to publish this. I urge the reader to spread the word wherever it might be noticed by a bed bug victim.";
    			add_location(p0, file$4, 16, 0, 577);
    			add_location(p1, file$4, 17, 0, 786);
    			add_location(p2, file$4, 18, 0, 1149);
    			add_location(p3, file$4, 19, 0, 1497);
    			add_location(p4, file$4, 20, 0, 1798);
    			add_location(p5, file$4, 21, 0, 2158);
    			add_location(p6, file$4, 22, 0, 2417);
    			add_location(p7, file$4, 23, 0, 2861);
    			add_location(p8, file$4, 24, 0, 3319);
    			add_location(p9, file$4, 25, 0, 3645);
    			add_location(p10, file$4, 26, 0, 3801);
    			add_location(p11, file$4, 27, 0, 4188);
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
    			insert(target, p4, anchor);
    			insert(target, t10, anchor);
    			insert(target, p5, anchor);
    			insert(target, t12, anchor);
    			insert(target, p6, anchor);
    			insert(target, t14, anchor);
    			insert(target, p7, anchor);
    			insert(target, t16, anchor);
    			insert(target, p8, anchor);
    			insert(target, t18, anchor);
    			insert(target, p9, anchor);
    			insert(target, t20, anchor);
    			insert(target, p10, anchor);
    			insert(target, t22, anchor);
    			insert(target, p11, anchor);
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
    				detach(p4);
    				detach(t10);
    				detach(p5);
    				detach(t12);
    				detach(p6);
    				detach(t14);
    				detach(p7);
    				detach(t16);
    				detach(p8);
    				detach(t18);
    				detach(p9);
    				detach(t20);
    				detach(p10);
    				detach(t22);
    				detach(p11);
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.9.1 */

    const file$5 = "src/Matrix.svelte";

    // (145:0) {#if visible}
    function create_if_block$5(ctx) {
    	var div, br0, br1, t0, div_transition, t1, br2, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t0 = text("\n A LITTLE SVELTE MODULE");
    			t1 = space();
    			br2 = element("br");
    			add_location(br0, file$5, 146, 1, 4055);
    			add_location(br1, file$5, 146, 5, 4059);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$5, 145, 1, 3927);
    			add_location(br2, file$5, 149, 1, 4097);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, br1);
    			append(div, t0);
    			insert(target, t1, anchor);
    			insert(target, br2, anchor);
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
    				detach(t1);
    				detach(br2);
    			}
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var t0, div5, p0, t2, p1, t4, div4, div2, br0, t5, br1, t6, div1, button0, t8, br2, t9, br3, t10, button1, t12, br4, t13, br5, t14, div0, t15, t16, t17, br6, t18, br7, t19, br8, t20, div3, br9, br10, t21, button2, t22_value = ctx.cache[ctx.j][0] + "", t22, t23, button3, t24_value = ctx.cache[ctx.j][1] + "", t24, t25, button4, t26_value = ctx.cache[ctx.j][2] + "", t26, t27, br11, t28, br12, t29, button5, t30_value = ctx.cache[ctx.j][3] + "", t30, t31, button6, t32_value = ctx.cache[ctx.j][4] + "", t32, t33, button7, t34_value = ctx.cache[ctx.j][5] + "", t34, t35, br13, t36, br14, t37, button8, t38_value = ctx.cache[ctx.j][6] + "", t38, t39, button9, t40_value = ctx.cache[ctx.j][7] + "", t40, t41, button10, t42_value = ctx.cache[ctx.j][8] + "", t42, t43, p2, t45, pre0, t46, t47, p3, t49, pre1, t50, current, dispose;

    	var if_block =  create_if_block$5();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div5 = element("div");
    			p0 = element("p");
    			p0.textContent = "Right now (10/28/2019), Svelte 3 still needs to have some rough parts ironed out. But Svelte has so much going for it that I predict that it will soon be ready for small and medium sized production projects.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "If you click any two numbers (below), they switch locations and a \"BACK\" button appears. If you go back and click two numbers, the result gets inserted  at your location.";
    			t4 = space();
    			div4 = element("div");
    			div2 = element("div");
    			br0 = element("br");
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "BACK";
    			t8 = space();
    			br2 = element("br");
    			t9 = space();
    			br3 = element("br");
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "FORWARD";
    			t12 = space();
    			br4 = element("br");
    			t13 = space();
    			br5 = element("br");
    			t14 = space();
    			div0 = element("div");
    			t15 = text("Index: ");
    			t16 = text(ctx.j);
    			t17 = space();
    			br6 = element("br");
    			t18 = space();
    			br7 = element("br");
    			t19 = space();
    			br8 = element("br");
    			t20 = space();
    			div3 = element("div");
    			br9 = element("br");
    			br10 = element("br");
    			t21 = space();
    			button2 = element("button");
    			t22 = text(t22_value);
    			t23 = space();
    			button3 = element("button");
    			t24 = text(t24_value);
    			t25 = space();
    			button4 = element("button");
    			t26 = text(t26_value);
    			t27 = space();
    			br11 = element("br");
    			t28 = space();
    			br12 = element("br");
    			t29 = space();
    			button5 = element("button");
    			t30 = text(t30_value);
    			t31 = space();
    			button6 = element("button");
    			t32 = text(t32_value);
    			t33 = space();
    			button7 = element("button");
    			t34 = text(t34_value);
    			t35 = space();
    			br13 = element("br");
    			t36 = space();
    			br14 = element("br");
    			t37 = space();
    			button8 = element("button");
    			t38 = text(t38_value);
    			t39 = space();
    			button9 = element("button");
    			t40 = text(t40_value);
    			t41 = space();
    			button10 = element("button");
    			t42 = text(t42_value);
    			t43 = space();
    			p2 = element("p");
    			p2.textContent = "This is the JavaScript code inside of the script tags except for the definitions of the variables \"code\" and \"html\", which are just the code and html cut and pasted inside of back quotes:";
    			t45 = space();
    			pre0 = element("pre");
    			t46 = text(ctx.code);
    			t47 = space();
    			p3 = element("p");
    			p3.textContent = "And here is the HTML code:";
    			t49 = space();
    			pre1 = element("pre");
    			t50 = text(ctx.html);
    			add_location(p0, file$5, 154, 0, 4131);
    			add_location(p1, file$5, 156, 0, 4350);
    			add_location(br0, file$5, 161, 0, 4654);
    			add_location(br1, file$5, 162, 0, 4659);
    			add_location(button0, file$5, 164, 1, 4682);
    			add_location(br2, file$5, 167, 0, 4725);
    			add_location(br3, file$5, 168, 0, 4730);
    			add_location(button1, file$5, 169, 1, 4736);
    			add_location(br4, file$5, 172, 0, 4785);
    			add_location(br5, file$5, 173, 0, 4790);
    			set_style(div0, "font-size", "23px");
    			set_style(div0, "color", "#FFCCAA");
    			add_location(div0, file$5, 174, 3, 4798);
    			add_location(br6, file$5, 175, 0, 4862);
    			attr(div1, "class", "tR svelte-12hd15a");
    			add_location(div1, file$5, 163, 0, 4664);
    			add_location(br7, file$5, 177, 1, 4876);
    			add_location(br8, file$5, 178, 1, 4882);
    			set_style(div2, "margin-Left", "2%");
    			set_style(div2, "width", "50%");
    			add_location(div2, file$5, 159, 24, 4608);
    			add_location(br9, file$5, 181, 0, 4984);
    			add_location(br10, file$5, 181, 4, 4988);
    			attr(button2, "id", "m0");
    			add_location(button2, file$5, 182, 0, 4993);
    			attr(button3, "id", "m1");
    			add_location(button3, file$5, 183, 0, 5055);
    			attr(button4, "id", "m2");
    			add_location(button4, file$5, 184, 0, 5117);
    			add_location(br11, file$5, 185, 0, 5179);
    			add_location(br12, file$5, 186, 0, 5184);
    			attr(button5, "id", "m3");
    			add_location(button5, file$5, 187, 0, 5189);
    			attr(button6, "id", "m4");
    			add_location(button6, file$5, 188, 0, 5251);
    			attr(button7, "id", "m5");
    			add_location(button7, file$5, 189, 0, 5313);
    			add_location(br13, file$5, 190, 0, 5375);
    			add_location(br14, file$5, 191, 0, 5380);
    			attr(button8, "id", "m6");
    			add_location(button8, file$5, 192, 0, 5385);
    			attr(button9, "id", "m7");
    			add_location(button9, file$5, 193, 0, 5447);
    			attr(button10, "id", "m8");
    			add_location(button10, file$5, 194, 0, 5509);
    			set_style(div3, "marginRight", "2%");
    			set_style(div3, "width", "50%");
    			add_location(div3, file$5, 180, 21, 4939);
    			set_style(div4, "display", "flex");
    			add_location(div4, file$5, 158, 24, 4554);
    			add_location(p2, file$5, 197, 0, 5585);
    			add_location(pre0, file$5, 198, 0, 5782);
    			add_location(p3, file$5, 199, 0, 5800);
    			add_location(pre1, file$5, 200, 0, 5836);
    			attr(div5, "class", "narrow svelte-12hd15a");
    			add_location(div5, file$5, 152, 0, 4109);

    			dispose = [
    				listen(button0, "click", ctx.back),
    				listen(button1, "click", ctx.forward),
    				listen(button2, "click", ctx.ob.push),
    				listen(button3, "click", ctx.ob.push),
    				listen(button4, "click", ctx.ob.push),
    				listen(button5, "click", ctx.ob.push),
    				listen(button6, "click", ctx.ob.push),
    				listen(button7, "click", ctx.ob.push),
    				listen(button8, "click", ctx.ob.push),
    				listen(button9, "click", ctx.ob.push),
    				listen(button10, "click", ctx.ob.push)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div5, anchor);
    			append(div5, p0);
    			append(div5, t2);
    			append(div5, p1);
    			append(div5, t4);
    			append(div5, div4);
    			append(div4, div2);
    			append(div2, br0);
    			append(div2, t5);
    			append(div2, br1);
    			append(div2, t6);
    			append(div2, div1);
    			append(div1, button0);
    			append(div1, t8);
    			append(div1, br2);
    			append(div1, t9);
    			append(div1, br3);
    			append(div1, t10);
    			append(div1, button1);
    			append(div1, t12);
    			append(div1, br4);
    			append(div1, t13);
    			append(div1, br5);
    			append(div1, t14);
    			append(div1, div0);
    			append(div0, t15);
    			append(div0, t16);
    			append(div1, t17);
    			append(div1, br6);
    			append(div2, t18);
    			append(div2, br7);
    			append(div2, t19);
    			append(div2, br8);
    			append(div4, t20);
    			append(div4, div3);
    			append(div3, br9);
    			append(div3, br10);
    			append(div3, t21);
    			append(div3, button2);
    			append(button2, t22);
    			append(div3, t23);
    			append(div3, button3);
    			append(button3, t24);
    			append(div3, t25);
    			append(div3, button4);
    			append(button4, t26);
    			append(div3, t27);
    			append(div3, br11);
    			append(div3, t28);
    			append(div3, br12);
    			append(div3, t29);
    			append(div3, button5);
    			append(button5, t30);
    			append(div3, t31);
    			append(div3, button6);
    			append(button6, t32);
    			append(div3, t33);
    			append(div3, button7);
    			append(button7, t34);
    			append(div3, t35);
    			append(div3, br13);
    			append(div3, t36);
    			append(div3, br14);
    			append(div3, t37);
    			append(div3, button8);
    			append(button8, t38);
    			append(div3, t39);
    			append(div3, button9);
    			append(button9, t40);
    			append(div3, t41);
    			append(div3, button10);
    			append(button10, t42);
    			append(div5, t43);
    			append(div5, p2);
    			append(div5, t45);
    			append(div5, pre0);
    			append(pre0, t46);
    			append(div5, t47);
    			append(div5, p3);
    			append(div5, t49);
    			append(div5, pre1);
    			append(pre1, t50);
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

    			if (!current || changed.j) {
    				set_data(t16, ctx.j);
    			}

    			if ((!current || changed.j) && t22_value !== (t22_value = ctx.cache[ctx.j][0] + "")) {
    				set_data(t22, t22_value);
    			}

    			if ((!current || changed.j) && t24_value !== (t24_value = ctx.cache[ctx.j][1] + "")) {
    				set_data(t24, t24_value);
    			}

    			if ((!current || changed.j) && t26_value !== (t26_value = ctx.cache[ctx.j][2] + "")) {
    				set_data(t26, t26_value);
    			}

    			if ((!current || changed.j) && t30_value !== (t30_value = ctx.cache[ctx.j][3] + "")) {
    				set_data(t30, t30_value);
    			}

    			if ((!current || changed.j) && t32_value !== (t32_value = ctx.cache[ctx.j][4] + "")) {
    				set_data(t32, t32_value);
    			}

    			if ((!current || changed.j) && t34_value !== (t34_value = ctx.cache[ctx.j][5] + "")) {
    				set_data(t34, t34_value);
    			}

    			if ((!current || changed.j) && t38_value !== (t38_value = ctx.cache[ctx.j][6] + "")) {
    				set_data(t38, t38_value);
    			}

    			if ((!current || changed.j) && t40_value !== (t40_value = ctx.cache[ctx.j][7] + "")) {
    				set_data(t40, t40_value);
    			}

    			if ((!current || changed.j) && t42_value !== (t42_value = ctx.cache[ctx.j][8] + "")) {
    				set_data(t42, t42_value);
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
    				detach(div5);
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
    var code = `function exchange (k,n) {
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
<p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. Slap that bitch.</p>

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
    	};

    	return { cache, j, ob, back, forward, code, html };
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/ToggleTheme.svelte generated by Svelte v3.9.1 */

    const file$6 = "src/ToggleTheme.svelte";

    // (7:1) {#if dark}
    function create_if_block$6(ctx) {
    	var link;

    	return {
    		c: function create() {
    			link = element("link");
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", "style.css");
    			add_location(link, file$6, 7, 1, 115);
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

    function create_fragment$6(ctx) {
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
    			add_location(h1, file$6, 11, 0, 179);
    			add_location(button, file$6, 13, 0, 202);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let dark = false;
    	const toggleTheme = () => { const $$result = dark = dark === false; $$invalidate('dark', dark); return $$result; };

    	return { dark, toggleTheme };
    }

    class ToggleTheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/Home.svelte generated by Svelte v3.9.1 */

    const file$7 = "src/Home.svelte";

    // (6:0) {#if visible}
    function create_if_block$7(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\n FIRST POST");
    			add_location(br0, file$7, 7, 1, 222);
    			add_location(br1, file$7, 7, 5, 226);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$7, 6, 1, 94);
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

    function create_fragment$7(ctx) {
    	var t0, p, t2, div0, t4, div1, t6, br0, t7, br1, current;

    	var if_block =  create_if_block$7();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p = element("p");
    			p.textContent = "This is where I store code snippets, discoveries, and ideas that I don't want to forget, or that might be useful to others. Eventually I might adopt the usual reverse chronology blog format, but for now I am piecing together what I want to salvage from piles of disorganized computer code and a head full of ideas and memories I want to preserve.";
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "David Schalk";
    			t4 = space();
    			div1 = element("div");
    			div1.textContent = "October, 2019";
    			t6 = space();
    			br0 = element("br");
    			t7 = space();
    			br1 = element("br");
    			add_location(p, file$7, 12, 0, 258);
    			add_location(div0, file$7, 14, 0, 614);
    			add_location(div1, file$7, 15, 0, 638);
    			add_location(br0, file$7, 16, 0, 663);
    			add_location(br1, file$7, 17, 0, 668);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p, anchor);
    			insert(target, t2, anchor);
    			insert(target, div0, anchor);
    			insert(target, t4, anchor);
    			insert(target, div1, anchor);
    			insert(target, t6, anchor);
    			insert(target, br0, anchor);
    			insert(target, t7, anchor);
    			insert(target, br1, anchor);
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
    				detach(p);
    				detach(t2);
    				detach(div0);
    				detach(t4);
    				detach(div1);
    				detach(t6);
    				detach(br0);
    				detach(t7);
    				detach(br1);
    			}
    		}
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/Blank.svelte generated by Svelte v3.9.1 */

    function create_fragment$8(ctx) {
    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    class Blank extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    	}
    }

    /* src/Score.svelte generated by Svelte v3.9.1 */

    const file$8 = "src/Score.svelte";

    // (13:0) {#if visible}
    function create_if_block$8(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\n GAME OF SCORE");
    			add_location(br0, file$8, 14, 1, 229);
    			add_location(br1, file$8, 14, 5, 233);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$8, 13, 1, 101);
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
    	var t0, br0, t1, p0, t3, p1, t5, p2, t7, a0, t9, br1, br2, t10, span0, t12, a1, t14, br3, br4, t15, span1, t17, a2, t19, span2, t21, a3, t23, span3, t25, a4, t27, span4, t29, a5, t31, span5, t33, a6, t35, span6, current;

    	var if_block =  create_if_block$8();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Score is an elaborate React project with a Haskell Wai WebSockets server on the back end. Users can form or join groups that play the among themselves, chat with one another, and share a group todo list.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Here you can play the game in the default group \"solo\" or you can create a group with another name. You can change the user name assigned to you by entering a new name and password, separated by a comma. If you join an existing group or if people join a group you created, you can compete among yourselves.";
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
    			add_location(br0, file$8, 18, 0, 267);
    			add_location(p0, file$8, 20, 0, 273);
    			add_location(p1, file$8, 22, 0, 486);
    			add_location(p2, file$8, 24, 0, 803);
    			attr(a0, "href", "http://game.schalk.site");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$8, 25, 0, 878);
    			add_location(br1, file$8, 26, 0, 958);
    			add_location(br2, file$8, 26, 4, 962);
    			add_location(span0, file$8, 27, 0, 967);
    			attr(a1, "href", "https://github.com/dschalk/score2");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$8, 28, 0, 1000);
    			add_location(br3, file$8, 29, 0, 1092);
    			add_location(br4, file$8, 29, 4, 1096);
    			add_location(span1, file$8, 30, 0, 1101);
    			attr(a2, "href", "https://nodejs.org/en/about/");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$8, 31, 0, 1132);
    			add_location(span2, file$8, 32, 0, 1200);
    			attr(a3, "href", "https://reactjs.org/");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$8, 33, 0, 1218);
    			add_location(span3, file$8, 34, 0, 1279);
    			attr(a4, "href", "https://cycle.js.org");
    			attr(a4, "target", "_blank");
    			add_location(a4, file$8, 35, 0, 1335);
    			add_location(span4, file$8, 36, 0, 1400);
    			attr(a5, "href", "https://svelte.dev/");
    			attr(a5, "target", "_blank");
    			add_location(a5, file$8, 37, 0, 1442);
    			add_location(span5, file$8, 38, 0, 1503);
    			attr(a6, "href", "https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/");
    			attr(a6, "target", "_blank");
    			add_location(a6, file$8, 39, 0, 1669);
    			add_location(span6, file$8, 40, 0, 1883);
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
    		init(this, options, null, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.9.1 */

    const file$9 = "src/Blog.svelte";

    // (118:0) {#if j === 0}
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

    // (122:0) {#if j === 1}
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

    // (126:0) {#if j === 2}
    function create_if_block_8(ctx) {
    	var current;

    	var async_1 = new Asynchronous_Monad({ $$inline: true });

    	return {
    		c: function create() {
    			async_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(async_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(async_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(async_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(async_1, detaching);
    		}
    	};
    }

    // (130:0) {#if j === 3}
    function create_if_block_7(ctx) {
    	var current;

    	var promises_1 = new Promises_Monad({ $$inline: true });

    	return {
    		c: function create() {
    			promises_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(promises_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(promises_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(promises_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(promises_1, detaching);
    		}
    	};
    }

    // (134:0) {#if j === 4}
    function create_if_block_6(ctx) {
    	var current;

    	var tranducer = new Tranducer({ $$inline: true });

    	return {
    		c: function create() {
    			tranducer.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(tranducer, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(tranducer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(tranducer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(tranducer, detaching);
    		}
    	};
    }

    // (138:0) {#if j === 5}
    function create_if_block_5(ctx) {
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

    // (142:0) {#if j === 6}
    function create_if_block_4(ctx) {
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

    // (146:0) {#if j === 7}
    function create_if_block_3(ctx) {
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

    // (150:0) {#if j === 8}
    function create_if_block_2(ctx) {
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

    // (154:0) {#if j === 9}
    function create_if_block_1(ctx) {
    	var current;

    	var blank_1 = new Blank({ $$inline: true });

    	return {
    		c: function create() {
    			blank_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(blank_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(blank_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(blank_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(blank_1, detaching);
    		}
    	};
    }

    // (158:0) {#if j === 10}
    function create_if_block$9(ctx) {
    	var current;

    	var theme_1 = new ToggleTheme({ $$inline: true });

    	return {
    		c: function create() {
    			theme_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(theme_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(theme_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(theme_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(theme_1, detaching);
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var div18, br0, br1, t0, div17, div13, br2, br3, br4, br5, br6, br7, br8, t1, ul, li0, div0, t3, br9, t4, li1, div1, t6, br10, t7, li2, div2, t9, br11, t10, li3, div3, t12, br12, t13, li4, div4, t15, br13, t16, li5, div5, t18, br14, t19, li6, div6, t21, br15, t22, li7, t23, div7, t25, br16, t26, li8, div8, t28, br17, t29, li9, div9, t31, br18, t32, li10, div10, t34, br19, t35, li11, div11, t37, br20, t38, li12, div12, t40, br21, t41, div15, div14, t43, div16, t44, t45, t46, t47, t48, t49, t50, t51, t52, t53, t54, br22, br23, br24, t55, br25, br26, current, dispose;

    	var if_block0 = (ctx.j === 0) && create_if_block_10();

    	var if_block1 = (ctx.j === 1) && create_if_block_9();

    	var if_block2 = (ctx.j === 2) && create_if_block_8();

    	var if_block3 = (ctx.j === 3) && create_if_block_7();

    	var if_block4 = (ctx.j === 4) && create_if_block_6();

    	var if_block5 = (ctx.j === 5) && create_if_block_5();

    	var if_block6 = (ctx.j === 6) && create_if_block_4();

    	var if_block7 = (ctx.j === 7) && create_if_block_3();

    	var if_block8 = (ctx.j === 8) && create_if_block_2();

    	var if_block9 = (ctx.j === 9) && create_if_block_1();

    	var if_block10 = (ctx.j === 10) && create_if_block$9();

    	return {
    		c: function create() {
    			div18 = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t0 = space();
    			div17 = element("div");
    			div13 = element("div");
    			br2 = element("br");
    			br3 = element("br");
    			br4 = element("br");
    			br5 = element("br");
    			br6 = element("br");
    			br7 = element("br");
    			br8 = element("br");
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			div0.textContent = "Svelte Demo";
    			t3 = space();
    			br9 = element("br");
    			t4 = space();
    			li1 = element("li");
    			div1 = element("div");
    			div1.textContent = "MONAD SERIES";
    			t6 = space();
    			br10 = element("br");
    			t7 = space();
    			li2 = element("li");
    			div2 = element("div");
    			div2.textContent = "A Simple Monad";
    			t9 = space();
    			br11 = element("br");
    			t10 = space();
    			li3 = element("li");
    			div3 = element("div");
    			div3.textContent = "Asynchronous Monads";
    			t12 = space();
    			br12 = element("br");
    			t13 = space();
    			li4 = element("li");
    			div4 = element("div");
    			div4.textContent = "Promises Monad";
    			t15 = space();
    			br13 = element("br");
    			t16 = space();
    			li5 = element("li");
    			div5 = element("div");
    			div5.textContent = "Transducer Simulator";
    			t18 = space();
    			br14 = element("br");
    			t19 = space();
    			li6 = element("li");
    			div6 = element("div");
    			div6.textContent = "Game of Score";
    			t21 = space();
    			br15 = element("br");
    			t22 = space();
    			li7 = element("li");
    			t23 = text("e");
    			div7 = element("div");
    			div7.textContent = "MISCELANEOUS TOPICS";
    			t25 = space();
    			br16 = element("br");
    			t26 = space();
    			li8 = element("li");
    			div8 = element("div");
    			div8.textContent = "Haskell Tip";
    			t28 = space();
    			br17 = element("br");
    			t29 = space();
    			li9 = element("li");
    			div9 = element("div");
    			div9.textContent = "Bed Bug Eradication";
    			t31 = space();
    			br18 = element("br");
    			t32 = space();
    			li10 = element("li");
    			div10 = element("div");
    			div10.textContent = "Home";
    			t34 = space();
    			br19 = element("br");
    			t35 = space();
    			li11 = element("li");
    			div11 = element("div");
    			div11.textContent = "Blank";
    			t37 = space();
    			br20 = element("br");
    			t38 = space();
    			li12 = element("li");
    			div12 = element("div");
    			div12.textContent = "Toggle Theme";
    			t40 = space();
    			br21 = element("br");
    			t41 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "DAVID SCHALK'S BLOG";
    			t43 = space();
    			div16 = element("div");
    			if (if_block0) if_block0.c();
    			t44 = space();
    			if (if_block1) if_block1.c();
    			t45 = space();
    			if (if_block2) if_block2.c();
    			t46 = space();
    			if (if_block3) if_block3.c();
    			t47 = space();
    			if (if_block4) if_block4.c();
    			t48 = space();
    			if (if_block5) if_block5.c();
    			t49 = space();
    			if (if_block6) if_block6.c();
    			t50 = space();
    			if (if_block7) if_block7.c();
    			t51 = space();
    			if (if_block8) if_block8.c();
    			t52 = space();
    			if (if_block9) if_block9.c();
    			t53 = space();
    			if (if_block10) if_block10.c();
    			t54 = space();
    			br22 = element("br");
    			br23 = element("br");
    			br24 = element("br");
    			t55 = space();
    			br25 = element("br");
    			br26 = element("br");
    			add_location(br0, file$9, 77, 0, 1713);
    			add_location(br1, file$9, 77, 4, 1717);
    			add_location(br2, file$9, 82, 24, 1847);
    			add_location(br3, file$9, 82, 28, 1851);
    			add_location(br4, file$9, 82, 32, 1855);
    			add_location(br5, file$9, 82, 36, 1859);
    			add_location(br6, file$9, 82, 40, 1863);
    			add_location(br7, file$9, 82, 44, 1867);
    			add_location(br8, file$9, 82, 48, 1871);
    			attr(div0, "class", "button svelte-eqbi6d");
    			add_location(div0, file$9, 84, 28, 1961);
    			add_location(li0, file$9, 84, 24, 1957);
    			add_location(br9, file$9, 85, 24, 2052);
    			attr(div1, "class", "svelte-eqbi6d");
    			add_location(div1, file$9, 86, 28, 2085);
    			add_location(li1, file$9, 86, 24, 2081);
    			add_location(br10, file$9, 87, 24, 2138);
    			attr(div2, "class", "button svelte-eqbi6d");
    			add_location(div2, file$9, 88, 28, 2171);
    			add_location(li2, file$9, 88, 24, 2167);
    			add_location(br11, file$9, 89, 24, 2288);
    			attr(div3, "class", "button svelte-eqbi6d");
    			add_location(div3, file$9, 90, 28, 2321);
    			add_location(li3, file$9, 90, 24, 2317);
    			add_location(br12, file$9, 91, 24, 2441);
    			attr(div4, "class", "button svelte-eqbi6d");
    			add_location(div4, file$9, 92, 28, 2474);
    			add_location(li4, file$9, 92, 24, 2470);
    			add_location(br13, file$9, 93, 24, 2589);
    			attr(div5, "class", "button svelte-eqbi6d");
    			add_location(div5, file$9, 94, 28, 2622);
    			add_location(li5, file$9, 94, 24, 2618);
    			add_location(br14, file$9, 95, 24, 2747);
    			attr(div6, "class", "button svelte-eqbi6d");
    			add_location(div6, file$9, 96, 28, 2780);
    			add_location(li6, file$9, 96, 24, 2776);
    			add_location(br15, file$9, 97, 24, 2894);
    			attr(div7, "class", "svelte-eqbi6d");
    			add_location(div7, file$9, 99, 29, 2929);
    			add_location(li7, file$9, 99, 24, 2924);
    			add_location(br16, file$9, 100, 24, 2989);
    			attr(div8, "class", "button svelte-eqbi6d");
    			add_location(div8, file$9, 101, 28, 3022);
    			add_location(li8, file$9, 101, 24, 3018);
    			add_location(br17, file$9, 102, 24, 3134);
    			attr(div9, "class", "button svelte-eqbi6d");
    			add_location(div9, file$9, 103, 28, 3167);
    			add_location(li9, file$9, 103, 24, 3163);
    			add_location(br18, file$9, 104, 24, 3291);
    			attr(div10, "class", "button svelte-eqbi6d");
    			add_location(div10, file$9, 105, 28, 3324);
    			add_location(li10, file$9, 105, 24, 3320);
    			add_location(br19, file$9, 106, 24, 3433);
    			attr(div11, "class", "button svelte-eqbi6d");
    			add_location(div11, file$9, 107, 28, 3466);
    			add_location(li11, file$9, 107, 24, 3462);
    			add_location(br20, file$9, 108, 24, 3576);
    			attr(div12, "class", "button svelte-eqbi6d");
    			add_location(div12, file$9, 109, 28, 3609);
    			add_location(li12, file$9, 109, 24, 3605);
    			add_location(br21, file$9, 110, 24, 3694);
    			set_style(ul, "list-style", "none");
    			attr(ul, "class", "svelte-eqbi6d");
    			add_location(ul, file$9, 83, 24, 1900);
    			set_style(div13, "margin-Left", "2%");
    			set_style(div13, "width", "20%");
    			attr(div13, "class", "svelte-eqbi6d");
    			add_location(div13, file$9, 80, 12, 1777);
    			set_style(div14, "font-weight", "900");
    			set_style(div14, "font-size", "45px");
    			set_style(div14, "color", "#bbbb00");
    			set_style(div14, "text-align", "center");
    			attr(div14, "class", "svelte-eqbi6d");
    			add_location(div14, file$9, 114, 24, 3854);
    			set_style(div15, "margin-Right", "2%");
    			set_style(div15, "width", "80%");
    			attr(div15, "class", "svelte-eqbi6d");
    			add_location(div15, file$9, 113, 24, 3784);
    			add_location(br22, file$9, 162, 0, 4398);
    			add_location(br23, file$9, 162, 4, 4402);
    			add_location(br24, file$9, 162, 8, 4406);
    			set_style(div16, "margin-Right", "2%");
    			set_style(div16, "width", "80%");
    			attr(div16, "class", "svelte-eqbi6d");
    			add_location(div16, file$9, 116, 12, 3997);
    			set_style(div17, "display", "flex");
    			attr(div17, "class", "svelte-eqbi6d");
    			add_location(div17, file$9, 79, 12, 1735);
    			attr(div18, "class", "content svelte-eqbi6d");
    			add_location(div18, file$9, 76, 0, 1691);
    			add_location(br25, file$9, 166, 0, 4432);
    			add_location(br26, file$9, 166, 4, 4436);

    			dispose = [
    				listen(div0, "click", ctx.click_handler),
    				listen(div2, "click", ctx.click_handler_1),
    				listen(div3, "click", ctx.click_handler_2),
    				listen(div4, "click", ctx.click_handler_3),
    				listen(div5, "click", ctx.click_handler_4),
    				listen(div6, "click", ctx.click_handler_5),
    				listen(div8, "click", ctx.click_handler_6),
    				listen(div9, "click", ctx.click_handler_7),
    				listen(div10, "click", ctx.click_handler_8),
    				listen(div11, "click", ctx.click_handler_9),
    				listen(div12, "click", ctx.theme)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div18, anchor);
    			append(div18, br0);
    			append(div18, br1);
    			append(div18, t0);
    			append(div18, div17);
    			append(div17, div13);
    			append(div13, br2);
    			append(div13, br3);
    			append(div13, br4);
    			append(div13, br5);
    			append(div13, br6);
    			append(div13, br7);
    			append(div13, br8);
    			append(div13, t1);
    			append(div13, ul);
    			append(ul, li0);
    			append(li0, div0);
    			append(ul, t3);
    			append(ul, br9);
    			append(ul, t4);
    			append(ul, li1);
    			append(li1, div1);
    			append(ul, t6);
    			append(ul, br10);
    			append(ul, t7);
    			append(ul, li2);
    			append(li2, div2);
    			append(ul, t9);
    			append(ul, br11);
    			append(ul, t10);
    			append(ul, li3);
    			append(li3, div3);
    			append(ul, t12);
    			append(ul, br12);
    			append(ul, t13);
    			append(ul, li4);
    			append(li4, div4);
    			append(ul, t15);
    			append(ul, br13);
    			append(ul, t16);
    			append(ul, li5);
    			append(li5, div5);
    			append(ul, t18);
    			append(ul, br14);
    			append(ul, t19);
    			append(ul, li6);
    			append(li6, div6);
    			append(ul, t21);
    			append(ul, br15);
    			append(ul, t22);
    			append(ul, li7);
    			append(li7, t23);
    			append(li7, div7);
    			append(ul, t25);
    			append(ul, br16);
    			append(ul, t26);
    			append(ul, li8);
    			append(li8, div8);
    			append(ul, t28);
    			append(ul, br17);
    			append(ul, t29);
    			append(ul, li9);
    			append(li9, div9);
    			append(ul, t31);
    			append(ul, br18);
    			append(ul, t32);
    			append(ul, li10);
    			append(li10, div10);
    			append(ul, t34);
    			append(ul, br19);
    			append(ul, t35);
    			append(ul, li11);
    			append(li11, div11);
    			append(ul, t37);
    			append(ul, br20);
    			append(ul, t38);
    			append(ul, li12);
    			append(li12, div12);
    			append(ul, t40);
    			append(ul, br21);
    			append(div17, t41);
    			append(div17, div15);
    			append(div15, div14);
    			append(div17, t43);
    			append(div17, div16);
    			if (if_block0) if_block0.m(div16, null);
    			append(div16, t44);
    			if (if_block1) if_block1.m(div16, null);
    			append(div16, t45);
    			if (if_block2) if_block2.m(div16, null);
    			append(div16, t46);
    			if (if_block3) if_block3.m(div16, null);
    			append(div16, t47);
    			if (if_block4) if_block4.m(div16, null);
    			append(div16, t48);
    			if (if_block5) if_block5.m(div16, null);
    			append(div16, t49);
    			if (if_block6) if_block6.m(div16, null);
    			append(div16, t50);
    			if (if_block7) if_block7.m(div16, null);
    			append(div16, t51);
    			if (if_block8) if_block8.m(div16, null);
    			append(div16, t52);
    			if (if_block9) if_block9.m(div16, null);
    			append(div16, t53);
    			if (if_block10) if_block10.m(div16, null);
    			append(div16, t54);
    			append(div16, br22);
    			append(div16, br23);
    			append(div16, br24);
    			insert(target, t55, anchor);
    			insert(target, br25, anchor);
    			insert(target, br26, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.j === 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_10();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div16, t44);
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
    					if_block1.m(div16, t45);
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
    					if_block2.m(div16, t46);
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
    					if_block3.m(div16, t47);
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
    					if_block4.m(div16, t48);
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
    					if_block5.m(div16, t49);
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

    			if (ctx.j === 6) {
    				if (!if_block6) {
    					if_block6 = create_if_block_4();
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div16, t50);
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

    			if (ctx.j === 7) {
    				if (!if_block7) {
    					if_block7 = create_if_block_3();
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div16, t51);
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

    			if (ctx.j === 8) {
    				if (!if_block8) {
    					if_block8 = create_if_block_2();
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div16, t52);
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

    			if (ctx.j === 9) {
    				if (!if_block9) {
    					if_block9 = create_if_block_1();
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div16, t53);
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

    			if (ctx.j === 10) {
    				if (!if_block10) {
    					if_block10 = create_if_block$9();
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div16, t54);
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
    				detach(div18);
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
    				detach(t55);
    				detach(br25);
    				detach(br26);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

        var j = 0;
     console.log(j);
        function theme () {$$invalidate('j', j = 10); console.log(j);}
    	function click_handler() {
    		const $$result = j = 8;
    		$$invalidate('j', j);
    		return $$result;
    	}

    	function click_handler_1() {j = 1; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_2() {j=2; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_3() {j=3; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_4() {j = 4; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_5() {j=5; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_6() {j=6; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_7() {j = 7; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_8() {j = 0; $$invalidate('j', j); console.log("j is", j);}

    	function click_handler_9() {j = 9; $$invalidate('j', j); console.log("j is", j);}

    	$$self.$$.update = ($$dirty = { j: 1 }) => {
    		if ($$dirty.j) ;
    	};

    	return {
    		j,
    		theme,
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
    		init(this, options, instance$7, create_fragment$a, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.9.1 */

    function create_fragment$b(ctx) {
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

    function instance$8($$self) {
    	$$self.$$.update = ($$dirty = { lock: 1 }) => {
    		if ($$dirty.lock) ;
    	};

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$b, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
