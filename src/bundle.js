
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

    /* src/Monad.svelte generated by Svelte v3.9.1 */

    const file = "src/Monad.svelte";

    // (111:1) {#if visible}
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
    			add_location(div, file, 111, 2, 2423);
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
    	var t0, br, t1, span0, t3, span1, t5, span2, t7, p0, t9, p1, t11, p2, t13, pre0, t14, t15, p3, t17, pre1, t19, p4, t21, t22, t23, input, t24, p5, t25, t26, t27, t28_value = ctx.bonads(ctx.num) + "", t28, t29, span3, t31, pre2, t32, t33, p6, t35, t36, t37, p7, t39, p8, t41, p9, t43, p10, t45, pre3, t46, t47, p11, t48, t49, t50, span4, t52, span5, current, dispose;

    	var if_block =  create_if_block();

    	return {
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
    			t14 = text(ctx.monadDisplay);
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
    			t22 = text(ctx.bonadsD);
    			t23 = space();
    			input = element("input");
    			t24 = space();
    			p5 = element("p");
    			t25 = text("num is ");
    			t26 = text(ctx.num);
    			t27 = text(" so bonads(num) returns ");
    			t28 = text(t28_value);
    			t29 = space();
    			span3 = element("span");
    			span3.textContent = "Named monads retain their values, even after they encounter \"stop\" and return the value of x held in the Monad closure. The following examples illustrate this:";
    			t31 = space();
    			pre2 = element("pre");
    			t32 = text(ctx.axe);
    			t33 = space();
    			p6 = element("p");
    			p6.textContent = "As expected, mon returns which is the \"foo()\" returned by by calling Monad(3):";
    			t35 = space();
    			t36 = text(ctx.mon);
    			t37 = space();
    			p7 = element("p");
    			p7.textContent = "mon() is still the foo() returned by Monad(). Because mon() maintains a reference to the x in the context of its creation, x will not be garbage collected.";
    			t39 = space();
    			p8 = element("p");
    			p8.textContent = "It is convenient to have state, in the form of x, safely tucked away in a closure; but if later in your program you no longer have any use for x, it's up to you to destroy the named monad that points to it.";
    			t41 = space();
    			p9 = element("p");
    			p9.textContent = "One reason Svelte is so fast and efficient is that it mutates variables and objects. In this and other ways, Svelte has shaken off the bonds of current conventional \"wisdom\".";
    			t43 = space();
    			p10 = element("p");
    			p10.textContent = "If you want to save older versions of a monad, you can stash it in an ordinary curly braces object, an array, a set, etc. Here's some code that demonstrates preserving a monad's history. It also demonstrates a monad named \"mon2\" branching off of mon and going its own way.";
    			t45 = space();
    			pre3 = element("pre");
    			t46 = text(ctx.fred);
    			t47 = space();
    			p11 = element("p");
    			t48 = text("ar is ");
    			t49 = text(ctx.ar);
    			t50 = space();
    			span4 = element("span");
    			span4.textContent = "Another technique is to keep the array of computation results in the closure.  It would then be convenient to run functions on array elements or the array itself. Monads could be asynchronous, populating the array with Promise resolution values. They could even be made to perform multiple array transformation - including map, filter, and reduce - in a single step, just as transducers do. To see a monad that does all of these things, click \"A Swiss Army Knife Monad\".";
    			t52 = space();
    			span5 = element("span");
    			span5.textContent = "By the way, I leave sentence punctuation outside of quotation marks, which is customary in the UK and eliminates the ambiguity inherent in the standard American syntax.";
    			add_location(br, file, 115, 0, 2588);
    			attr(span0, "class", "tao");
    			add_location(span0, file, 116, 0, 2593);
    			set_style(span1, "font-style", "italic");
    			add_location(span1, file, 117, 0, 2696);
    			add_location(span2, file, 118, 0, 2751);
    			add_location(p0, file, 119, 0, 3121);
    			add_location(p1, file, 120, 0, 3547);
    			add_location(p2, file, 121, 0, 4017);
    			add_location(pre0, file, 122, 0, 4069);
    			add_location(p3, file, 123, 0, 4095);
    			add_location(pre1, file, 124, 0, 4177);
    			add_location(p4, file, 125, 0, 4237);
    			attr(input, "id", "one");
    			attr(input, "type", "number");
    			add_location(input, file, 127, 0, 4437);
    			add_location(p5, file, 128, 0, 4510);
    			attr(span3, "class", "tao");
    			add_location(span3, file, 130, 0, 4570);
    			add_location(pre2, file, 131, 0, 4757);
    			add_location(p6, file, 135, 0, 4777);
    			add_location(p7, file, 138, 0, 4871);
    			add_location(p8, file, 140, 0, 5037);
    			add_location(p9, file, 141, 0, 5253);
    			add_location(p10, file, 142, 0, 5437);
    			add_location(pre3, file, 143, 0, 5718);
    			add_location(p11, file, 144, 0, 5736);
    			attr(span4, "class", "tao");
    			add_location(span4, file, 145, 0, 5756);
    			attr(span5, "id", "aside");
    			attr(span5, "class", "svelte-uo8pcq");
    			add_location(span5, file, 146, 0, 6254);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "input", ctx.bonads)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br, anchor);
    			insert(target, t1, anchor);
    			insert(target, span0, anchor);
    			insert(target, t3, anchor);
    			insert(target, span1, anchor);
    			insert(target, t5, anchor);
    			insert(target, span2, anchor);
    			insert(target, t7, anchor);
    			insert(target, p0, anchor);
    			insert(target, t9, anchor);
    			insert(target, p1, anchor);
    			insert(target, t11, anchor);
    			insert(target, p2, anchor);
    			insert(target, t13, anchor);
    			insert(target, pre0, anchor);
    			append(pre0, t14);
    			insert(target, t15, anchor);
    			insert(target, p3, anchor);
    			insert(target, t17, anchor);
    			insert(target, pre1, anchor);
    			insert(target, t19, anchor);
    			insert(target, p4, anchor);
    			insert(target, t21, anchor);
    			insert(target, t22, anchor);
    			insert(target, t23, anchor);
    			insert(target, input, anchor);

    			set_input_value(input, ctx.num);

    			insert(target, t24, anchor);
    			insert(target, p5, anchor);
    			append(p5, t25);
    			append(p5, t26);
    			append(p5, t27);
    			append(p5, t28);
    			insert(target, t29, anchor);
    			insert(target, span3, anchor);
    			insert(target, t31, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t32);
    			insert(target, t33, anchor);
    			insert(target, p6, anchor);
    			insert(target, t35, anchor);
    			insert(target, t36, anchor);
    			insert(target, t37, anchor);
    			insert(target, p7, anchor);
    			insert(target, t39, anchor);
    			insert(target, p8, anchor);
    			insert(target, t41, anchor);
    			insert(target, p9, anchor);
    			insert(target, t43, anchor);
    			insert(target, p10, anchor);
    			insert(target, t45, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t46);
    			insert(target, t47, anchor);
    			insert(target, p11, anchor);
    			append(p11, t48);
    			append(p11, t49);
    			insert(target, t50, anchor);
    			insert(target, span4, anchor);
    			insert(target, t52, anchor);
    			insert(target, span5, anchor);
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

    			if (changed.num) set_input_value(input, ctx.num);

    			if (!current || changed.num) {
    				set_data(t26, ctx.num);
    			}

    			if ((!current || changed.num) && t28_value !== (t28_value = ctx.bonads(ctx.num) + "")) {
    				set_data(t28, t28_value);
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
    				detach(span0);
    				detach(t3);
    				detach(span1);
    				detach(t5);
    				detach(span2);
    				detach(t7);
    				detach(p0);
    				detach(t9);
    				detach(p1);
    				detach(t11);
    				detach(p2);
    				detach(t13);
    				detach(pre0);
    				detach(t15);
    				detach(p3);
    				detach(t17);
    				detach(pre1);
    				detach(t19);
    				detach(p4);
    				detach(t21);
    				detach(t22);
    				detach(t23);
    				detach(input);
    				detach(t24);
    				detach(p5);
    				detach(t29);
    				detach(span3);
    				detach(t31);
    				detach(pre2);
    				detach(t33);
    				detach(p6);
    				detach(t35);
    				detach(t36);
    				detach(t37);
    				detach(p7);
    				detach(t39);
    				detach(p8);
    				detach(t41);
    				detach(p9);
    				detach(t43);
    				detach(p10);
    				detach(t45);
    				detach(pre3);
    				detach(t47);
    				detach(p11);
    				detach(t50);
    				detach(span4);
    				detach(t52);
    				detach(span5);
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

    let fred = `
let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon(stop));
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)
ar.push(a);
ar.push(mon(x => x/100)(stop));
ar.push(mon2(mon(stop)(x=>x*100)))
console.log("ar is", ar)  // [3, 900, 9] `;

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

    let ar = [];
    let mon = Monad(3);
    let mon2 = Monad();
    ar.push(mon(stop));
    var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop);
    ar.push(a);
    ar.push(mon(x => x/100)(stop));
    ar.push(mon2(()=>mon(stop))(x=>x*100)(stop));

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
    		fred,
    		num,
    		bonads,
    		ar,
    		mon,
    		input_input_handler
    	};
    }

    class Monad_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/Monad2.svelte generated by Svelte v3.9.1 */

    const file$1 = "src/Monad2.svelte";

    // (51:1) {#if visible}
    function create_if_block$1(ctx) {
    	var div, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "COMPLEX MONADS";
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$1, 51, 2, 1202);
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
    	var t0, p0, t2, pre, t3, t4, span0, t6, a0, t8, span1, t10, p1, t12, span2, t14, a1, t16, span3, t18, span4, t20, a2, current;

    	var if_block =  create_if_block$1();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "The basic JavaScript monad is good for composing simple functions. But what if you want your monad to accept raw data and Promises? What if you want to mimick the behavior of transducers and perform multiple transformations, including filtering, on arrays, sets, or any other container of enumerable data? Here's a monad that has been reliably performing these tasks in my current project:";
    			t2 = space();
    			pre = element("pre");
    			t3 = text(ctx.monad2);
    			t4 = space();
    			span0 = element("span");
    			span0.textContent = "You can see Monad2 in action at";
    			t6 = space();
    			a0 = element("a");
    			a0.textContent = "schalk.site";
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "Monad2 is named \"Comp\" there. Demonstration 1 shows Monad2 (a/k/a \"Comp\") restarting, running asynchronous code, and forking into orthogonal branches. Demonstration 2 compares ordinary dot composition, a transducer, and Monad2. In a single step, Monad2 gets the result the transducer gets in a single step and the dot procedure gets in five steps, four of which create useless intermediate arrays for the garbage collector to clean up.";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "You might wonder what \"diffRender()\" is. schalk.site is in a Cycle.js framework. In Cycle.js, reactivity is usually accomplished by merging streams and havind main() send the result into the virtual DOM. This is convenient when main() is responding to DOM events. Responding to other things, for example incoming WebSockets or Web Worker messages for example , requires dedicated drivers. After defining numerous drivers I lost patience and started using diffRender().";
    			t12 = space();
    			span2 = element("span");
    			span2.textContent = "diffRender() increments a number in the virtual DOM up to 50 then starts again at 0. This prompts Snabbdom to diff the entire virtual DOM. The Snabbdom API provides more targeted ways to force updates. patch(oldVnode, newVnode) comes to mind. I might have gotten around to benchmarking various alternatives to defining drivers but instead, I switched to";
    			t14 = space();
    			a1 = element("a");
    			a1.textContent = "Svelte";
    			t16 = space();
    			span3 = element("span");
    			span3.textContent = "It isn't burdened with a virtual DOM, and Svelte provides reactivity with elegant simplicity.";
    			t18 = space();
    			span4 = element("span");
    			span4.textContent = "The code for this Svelte application is at";
    			t20 = space();
    			a2 = element("a");
    			a2.textContent = "GitHub repository";
    			add_location(p0, file$1, 55, 0, 1360);
    			add_location(pre, file$1, 56, 0, 1759);
    			attr(span0, "class", "tao");
    			add_location(span0, file$1, 57, 0, 1779);
    			attr(a0, "href", "http://schalk.site");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$1, 58, 0, 1838);
    			add_location(span1, file$1, 59, 0, 1904);
    			add_location(p1, file$1, 60, 0, 2355);
    			attr(span2, "class", "tao");
    			add_location(span2, file$1, 61, 0, 2833);
    			attr(a1, "href", "https://svelte.dev/");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$1, 62, 0, 3215);
    			add_location(span3, file$1, 63, 0, 3277);
    			add_location(span4, file$1, 64, 0, 3386);
    			attr(a2, "href", "https://github.com/dschalk/blog/");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$1, 65, 0, 3444);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, pre, anchor);
    			append(pre, t3);
    			insert(target, t4, anchor);
    			insert(target, span0, anchor);
    			insert(target, t6, anchor);
    			insert(target, a0, anchor);
    			insert(target, t8, anchor);
    			insert(target, span1, anchor);
    			insert(target, t10, anchor);
    			insert(target, p1, anchor);
    			insert(target, t12, anchor);
    			insert(target, span2, anchor);
    			insert(target, t14, anchor);
    			insert(target, a1, anchor);
    			insert(target, t16, anchor);
    			insert(target, span3, anchor);
    			insert(target, t18, anchor);
    			insert(target, span4, anchor);
    			insert(target, t20, anchor);
    			insert(target, a2, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block$1();
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
    				detach(pre);
    				detach(t4);
    				detach(span0);
    				detach(t6);
    				detach(a0);
    				detach(t8);
    				detach(span1);
    				detach(t10);
    				detach(p1);
    				detach(t12);
    				detach(span2);
    				detach(t14);
    				detach(a1);
    				detach(t16);
    				detach(span3);
    				detach(t18);
    				detach(span4);
    				detach(t20);
    				detach(a2);
    			}
    		}
    	};
    }

    function instance$1($$self) {
    	

    var monad2 = `
var Monad2 = function Monad2 ( AR = [] )  {
  var f_, p;
  var ar = AR.slice();
  var x = ar.pop();
  return (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" && y.name !== "stop" ) {
      ar.push(y);
      diffRender()
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
      diffRender()
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

    	return { monad2 };
    }

    class Monad2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/Haskell.svelte generated by Svelte v3.9.1 */

    const file$2 = "src/Haskell.svelte";

    // (30:0) {#if visible}
    function create_if_block$2(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nHASKELL TUTORIAL SUPPLEMENT");
    			add_location(br0, file$2, 31, 1, 721);
    			add_location(br1, file$2, 31, 5, 725);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$2, 30, 1, 594);
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

    function create_fragment$2(ctx) {
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
    			add_location(p0, file$2, 36, 0, 773);
    			add_location(p1, file$2, 37, 0, 1156);
    			attr(p2, "id", "large");
    			attr(p2, "class", "svelte-hw6ke3");
    			add_location(p2, file$2, 38, 0, 1603);
    			add_location(p3, file$2, 39, 0, 1637);
    			attr(span0, "class", "tao");
    			add_location(span0, file$2, 40, 0, 1924);
    			attr(a0, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$2, 41, 0, 2042);
    			add_location(br0, file$2, 42, 0, 2163);
    			add_location(pre, file$2, 43, 0, 2170);
    			add_location(p4, file$2, 44, 0, 2197);
    			attr(span1, "class", "tao");
    			add_location(span1, file$2, 45, 0, 2759);
    			attr(a1, "href", "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html");
    			attr(a1, "target", "_blank");
    			add_location(a1, file$2, 46, 0, 2815);
    			add_location(br1, file$2, 47, 0, 2942);
    			add_location(br2, file$2, 48, 0, 2949);
    			attr(span2, "class", "tao");
    			add_location(span2, file$2, 49, 0, 2956);
    			attr(a2, "href", "https://wiki.haskell.org/Unsafe_functions");
    			attr(a2, "target", "_blank");
    			add_location(a2, file$2, 50, 0, 3065);
    			add_location(span3, file$2, 51, 0, 3166);
    			attr(a3, "href", "https://wiki.haskell.org/Top_level_mutable_state");
    			attr(a3, "target", "_blank");
    			add_location(a3, file$2, 52, 0, 3254);
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

    function instance$2($$self) {

    	return {};
    }

    class Haskell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/Bugs.svelte generated by Svelte v3.9.1 */

    const file$3 = "src/Bugs.svelte";

    // (11:0) {#if visible}
    function create_if_block$3(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nCOMPLETE ERADICATION OF BED BUGS");
    			add_location(br0, file$3, 12, 1, 521);
    			add_location(br1, file$3, 12, 5, 525);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$3, 11, 1, 393);
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
    	var t0, p0, t2, p1, t4, p2, t6, p3, t8, p4, t10, p5, t12, p6, t14, p7, t16, p8, t18, p9, t20, p10, t22, p11, current;

    	var if_block =  create_if_block$3();

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
    			add_location(p0, file$3, 16, 0, 577);
    			add_location(p1, file$3, 17, 0, 786);
    			add_location(p2, file$3, 18, 0, 1149);
    			add_location(p3, file$3, 19, 0, 1497);
    			add_location(p4, file$3, 20, 0, 1798);
    			add_location(p5, file$3, 21, 0, 2158);
    			add_location(p6, file$3, 22, 0, 2417);
    			add_location(p7, file$3, 24, 0, 2862);
    			add_location(p8, file$3, 25, 0, 3320);
    			add_location(p9, file$3, 26, 0, 3646);
    			add_location(p10, file$3, 27, 0, 3802);
    			add_location(p11, file$3, 28, 0, 4189);
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

    function instance$3($$self) {

    	return {};
    }

    class Bugs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/Matrix.svelte generated by Svelte v3.9.1 */

    const file$4 = "src/Matrix.svelte";

    // (37:0) {#if visible}
    function create_if_block_2(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nA LITTLE SVELTE MODULE");
    			add_location(br0, file$4, 38, 1, 828);
    			add_location(br1, file$4, 38, 5, 832);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$4, 37, 1, 700);
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

    // (65:0) {#if j > 0}
    function create_if_block_1(ctx) {
    	var br0, t0, br1, t1, button, dispose;

    	return {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			button = element("button");
    			button.textContent = "BACK";
    			add_location(br0, file$4, 65, 0, 1879);
    			add_location(br1, file$4, 66, 0, 1884);
    			add_location(button, file$4, 67, 1, 1890);
    			dispose = listen(button, "click", ctx.back);
    		},

    		m: function mount(target, anchor) {
    			insert(target, br0, anchor);
    			insert(target, t0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t1, anchor);
    			insert(target, button, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(br0);
    				detach(t0);
    				detach(br1);
    				detach(t1);
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    // (74:0) {#if j < cache.length -1}
    function create_if_block$4(ctx) {
    	var button, t1, br0, t2, br1, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "FORWARD";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			br1 = element("br");
    			add_location(button, file$4, 74, 1, 1976);
    			add_location(br0, file$4, 77, 1, 2026);
    			add_location(br1, file$4, 78, 1, 2032);
    			dispose = listen(button, "click", ctx.forward);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			insert(target, t1, anchor);
    			insert(target, br0, anchor);
    			insert(target, t2, anchor);
    			insert(target, br1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    				detach(t1);
    				detach(br0);
    				detach(t2);
    				detach(br1);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var t0, p0, t2, p1, t4, div, br0, t5, button0, t6_value = ctx.cache[ctx.j][0] + "", t6, t7, button1, t8_value = ctx.cache[ctx.j][1] + "", t8, t9, button2, t10_value = ctx.cache[ctx.j][2] + "", t10, t11, br1, t12, br2, t13, br3, t14, button3, t15_value = ctx.cache[ctx.j][3] + "", t15, t16, button4, t17_value = ctx.cache[ctx.j][4] + "", t17, t18, button5, t19_value = ctx.cache[ctx.j][5] + "", t19, t20, br4, t21, br5, t22, br6, t23, button6, t24_value = ctx.cache[ctx.j][6] + "", t24, t25, button7, t26_value = ctx.cache[ctx.j][7] + "", t26, t27, button8, t28_value = ctx.cache[ctx.j][8] + "", t28, t29, t30, br7, t31, br8, t32, t33, p2, t35, p3, t37, p4, current, dispose;

    	var if_block0 =  create_if_block_2();

    	var if_block1 = (ctx.j > 0) && create_if_block_1(ctx);

    	var if_block2 = (ctx.j < ctx.cache.length -1) && create_if_block$4(ctx);

    	return {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "If you click any two numbers (below), they switch locations and a \"BACK\" button appears. If you go back and click two numbers, the result gets inserted  at your location.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing.";
    			t4 = space();
    			div = element("div");
    			br0 = element("br");
    			t5 = space();
    			button0 = element("button");
    			t6 = text(t6_value);
    			t7 = space();
    			button1 = element("button");
    			t8 = text(t8_value);
    			t9 = space();
    			button2 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			br1 = element("br");
    			t12 = space();
    			br2 = element("br");
    			t13 = space();
    			br3 = element("br");
    			t14 = space();
    			button3 = element("button");
    			t15 = text(t15_value);
    			t16 = space();
    			button4 = element("button");
    			t17 = text(t17_value);
    			t18 = space();
    			button5 = element("button");
    			t19 = text(t19_value);
    			t20 = space();
    			br4 = element("br");
    			t21 = space();
    			br5 = element("br");
    			t22 = space();
    			br6 = element("br");
    			t23 = space();
    			button6 = element("button");
    			t24 = text(t24_value);
    			t25 = space();
    			button7 = element("button");
    			t26 = text(t26_value);
    			t27 = space();
    			button8 = element("button");
    			t28 = text(t28_value);
    			t29 = space();
    			if (if_block1) if_block1.c();
    			t30 = space();
    			br7 = element("br");
    			t31 = space();
    			br8 = element("br");
    			t32 = space();
    			if (if_block2) if_block2.c();
    			t33 = space();
    			p2 = element("p");
    			p2.textContent = "This is the JavaScript code inside of the \"script\" tags:";
    			t35 = space();
    			p3 = element("p");
    			p3.textContent = "And here is the HTML code:";
    			t37 = space();
    			p4 = element("p");
    			p4.textContent = "Is Svelte awesome, or what?";
    			add_location(p0, file$4, 44, 0, 876);
    			add_location(p1, file$4, 45, 0, 1055);
    			add_location(br0, file$4, 47, 0, 1267);
    			attr(button0, "id", "m0");
    			add_location(button0, file$4, 48, 0, 1272);
    			attr(button1, "id", "m1");
    			add_location(button1, file$4, 49, 0, 1334);
    			attr(button2, "id", "m2");
    			add_location(button2, file$4, 50, 0, 1396);
    			add_location(br1, file$4, 51, 0, 1458);
    			add_location(br2, file$4, 52, 0, 1463);
    			add_location(br3, file$4, 53, 0, 1468);
    			attr(button3, "id", "m3");
    			add_location(button3, file$4, 54, 0, 1473);
    			attr(button4, "id", "m4");
    			add_location(button4, file$4, 55, 0, 1535);
    			attr(button5, "id", "m5");
    			add_location(button5, file$4, 56, 0, 1597);
    			add_location(br4, file$4, 57, 0, 1659);
    			add_location(br5, file$4, 58, 0, 1664);
    			add_location(br6, file$4, 59, 0, 1669);
    			attr(button6, "id", "m6");
    			add_location(button6, file$4, 60, 0, 1674);
    			attr(button7, "id", "m7");
    			add_location(button7, file$4, 61, 0, 1736);
    			attr(button8, "id", "m8");
    			add_location(button8, file$4, 62, 0, 1798);
    			attr(div, "id", "buttons");
    			add_location(div, file$4, 46, 0, 1248);
    			add_location(br7, file$4, 71, 0, 1939);
    			add_location(br8, file$4, 72, 0, 1944);
    			add_location(p2, file$4, 80, 0, 2043);
    			add_location(p3, file$4, 81, 0, 2109);
    			add_location(p4, file$4, 82, 0, 2145);

    			dispose = [
    				listen(button0, "click", ctx.ob.push),
    				listen(button1, "click", ctx.ob.push),
    				listen(button2, "click", ctx.ob.push),
    				listen(button3, "click", ctx.ob.push),
    				listen(button4, "click", ctx.ob.push),
    				listen(button5, "click", ctx.ob.push),
    				listen(button6, "click", ctx.ob.push),
    				listen(button7, "click", ctx.ob.push),
    				listen(button8, "click", ctx.ob.push)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, p0, anchor);
    			insert(target, t2, anchor);
    			insert(target, p1, anchor);
    			insert(target, t4, anchor);
    			insert(target, div, anchor);
    			append(div, br0);
    			append(div, t5);
    			append(div, button0);
    			append(button0, t6);
    			append(div, t7);
    			append(div, button1);
    			append(button1, t8);
    			append(div, t9);
    			append(div, button2);
    			append(button2, t10);
    			append(div, t11);
    			append(div, br1);
    			append(div, t12);
    			append(div, br2);
    			append(div, t13);
    			append(div, br3);
    			append(div, t14);
    			append(div, button3);
    			append(button3, t15);
    			append(div, t16);
    			append(div, button4);
    			append(button4, t17);
    			append(div, t18);
    			append(div, button5);
    			append(button5, t19);
    			append(div, t20);
    			append(div, br4);
    			append(div, t21);
    			append(div, br5);
    			append(div, t22);
    			append(div, br6);
    			append(div, t23);
    			append(div, button6);
    			append(button6, t24);
    			append(div, t25);
    			append(div, button7);
    			append(button7, t26);
    			append(div, t27);
    			append(div, button8);
    			append(button8, t28);
    			insert(target, t29, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t30, anchor);
    			insert(target, br7, anchor);
    			insert(target, t31, anchor);
    			insert(target, br8, anchor);
    			insert(target, t32, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t33, anchor);
    			insert(target, p2, anchor);
    			insert(target, t35, anchor);
    			insert(target, p3, anchor);
    			insert(target, t37, anchor);
    			insert(target, p4, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block0) {
    					if_block0 = create_if_block_2();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block0, 1);
    				}
    			}

    			if ((!current || changed.j) && t6_value !== (t6_value = ctx.cache[ctx.j][0] + "")) {
    				set_data(t6, t6_value);
    			}

    			if ((!current || changed.j) && t8_value !== (t8_value = ctx.cache[ctx.j][1] + "")) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.j) && t10_value !== (t10_value = ctx.cache[ctx.j][2] + "")) {
    				set_data(t10, t10_value);
    			}

    			if ((!current || changed.j) && t15_value !== (t15_value = ctx.cache[ctx.j][3] + "")) {
    				set_data(t15, t15_value);
    			}

    			if ((!current || changed.j) && t17_value !== (t17_value = ctx.cache[ctx.j][4] + "")) {
    				set_data(t17, t17_value);
    			}

    			if ((!current || changed.j) && t19_value !== (t19_value = ctx.cache[ctx.j][5] + "")) {
    				set_data(t19, t19_value);
    			}

    			if ((!current || changed.j) && t24_value !== (t24_value = ctx.cache[ctx.j][6] + "")) {
    				set_data(t24, t24_value);
    			}

    			if ((!current || changed.j) && t26_value !== (t26_value = ctx.cache[ctx.j][7] + "")) {
    				set_data(t26, t26_value);
    			}

    			if ((!current || changed.j) && t28_value !== (t28_value = ctx.cache[ctx.j][8] + "")) {
    				set_data(t28, t28_value);
    			}

    			if (ctx.j > 0) {
    				if (!if_block1) {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t30.parentNode, t30);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (ctx.j < ctx.cache.length -1) {
    				if (!if_block2) {
    					if_block2 = create_if_block$4(ctx);
    					if_block2.c();
    					if_block2.m(t33.parentNode, t33);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(p0);
    				detach(t2);
    				detach(p1);
    				detach(t4);
    				detach(div);
    				detach(t29);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(t30);
    				detach(br7);
    				detach(t31);
    				detach(br8);
    				detach(t32);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach(t33);
    				detach(p2);
    				detach(t35);
    				detach(p3);
    				detach(t37);
    				detach(p4);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

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

       function exchange (k,n) {
          var ar = cache[j].slice();
          var a = ar[k];
          ar[k] = ar[n];
          ar[n] = a;
          return ar;
       }

       var back = function back () {
           $$invalidate('j', j = j-=1); $$invalidate('j', j);
       };

       var forward = function forward () {
          if (j < 9) { $$invalidate('j', j = j+=1); $$invalidate('j', j); }
        };

    	return { cache, j, ob, back, forward };
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/Home.svelte generated by Svelte v3.9.1 */

    const file$5 = "src/Home.svelte";

    function create_fragment$5(ctx) {
    	var br0, t0, br1, t1, br2, t2, br3;

    	return {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			br2 = element("br");
    			t2 = space();
    			br3 = element("br");
    			add_location(br0, file$5, 5, 0, 79);
    			add_location(br1, file$5, 6, 0, 84);
    			add_location(br2, file$5, 7, 0, 89);
    			add_location(br3, file$5, 8, 0, 94);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, br0, anchor);
    			insert(target, t0, anchor);
    			insert(target, br1, anchor);
    			insert(target, t1, anchor);
    			insert(target, br2, anchor);
    			insert(target, t2, anchor);
    			insert(target, br3, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(br0);
    				detach(t0);
    				detach(br1);
    				detach(t1);
    				detach(br2);
    				detach(t2);
    				detach(br3);
    			}
    		}
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/Blog.svelte generated by Svelte v3.9.1 */

    const file$6 = "src/Blog.svelte";

    // (31:0) {#if j === 0}
    function create_if_block_6(ctx) {
    	var t, p, current;

    	var if_block =  create_if_block_7();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			p = element("p");
    			p.textContent = "This blog is where I am going to preserve ideas that I don't want to forget, and which I hope others will find interesting. I'll mostly write about computer programming, but already there is a post on bed bug eradication. I practiced law for twenty-three years, so there will probably be some posts related to that.";
    			add_location(p, file$6, 37, 0, 760);
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			insert(target, p, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			{
    				if (!if_block) {
    					if_block = create_if_block_7();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
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
    				detach(t);
    				detach(p);
    			}
    		}
    	};
    }

    // (32:0) {#if visible}
    function create_if_block_7(ctx) {
    	var div, br0, br1, t, div_transition, current;

    	return {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t = text("\nINITIAL POST");
    			add_location(br0, file$6, 33, 1, 724);
    			add_location(br1, file$6, 33, 5, 728);
    			set_style(div, "font-family", "Times New Roman");
    			set_style(div, "text-align", "center");
    			set_style(div, "color", "hsl(210, 90%, 90%)");
    			set_style(div, "font-size", "32px");
    			add_location(div, file$6, 32, 1, 596);
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

    // (59:0) {#if j === 0}
    function create_if_block_5(ctx) {
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

    // (63:0) {#if j === 1}
    function create_if_block_4(ctx) {
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

    // (67:0) {#if j === 2}
    function create_if_block_3(ctx) {
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

    // (71:0) {#if j === 3}
    function create_if_block_2$1(ctx) {
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

    // (75:0) {#if j === 4}
    function create_if_block_1$1(ctx) {
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

    // (79:0) {#if j === 5}
    function create_if_block$5(ctx) {
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

    function create_fragment$6(ctx) {
    	var div, t0, br0, t1, button0, t3, br1, t4, br2, t5, button1, t7, br3, t8, br4, t9, button2, t11, br5, t12, br6, t13, button3, t15, br7, t16, br8, t17, button4, t19, br9, t20, br10, t21, button5, t23, br11, br12, t24, t25, br13, br14, t26, t27, br15, br16, t28, t29, br17, br18, t30, t31, br19, br20, t32, t33, br21, br22, t34, t35, br23, br24, br25, br26, current, dispose;

    	var if_block0 = (ctx.j === 0) && create_if_block_6();

    	var if_block1 = (ctx.j === 0) && create_if_block_5();

    	var if_block2 = (ctx.j === 1) && create_if_block_4();

    	var if_block3 = (ctx.j === 2) && create_if_block_3();

    	var if_block4 = (ctx.j === 3) && create_if_block_2$1();

    	var if_block5 = (ctx.j === 4) && create_if_block_1$1();

    	var if_block6 = (ctx.j === 5) && create_if_block$5();

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "A Simple Monad";
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "A Swiss Army Knife Monad";
    			t7 = space();
    			br3 = element("br");
    			t8 = space();
    			br4 = element("br");
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "Hidden Haskell Information";
    			t11 = space();
    			br5 = element("br");
    			t12 = space();
    			br6 = element("br");
    			t13 = space();
    			button3 = element("button");
    			button3.textContent = "100% Effectove Non-Toxic Bed Bug Eradication";
    			t15 = space();
    			br7 = element("br");
    			t16 = space();
    			br8 = element("br");
    			t17 = space();
    			button4 = element("button");
    			button4.textContent = "Beauty of Svelte";
    			t19 = space();
    			br9 = element("br");
    			t20 = space();
    			br10 = element("br");
    			t21 = space();
    			button5 = element("button");
    			button5.textContent = "Home";
    			t23 = space();
    			br11 = element("br");
    			br12 = element("br");
    			t24 = space();
    			if (if_block1) if_block1.c();
    			t25 = space();
    			br13 = element("br");
    			br14 = element("br");
    			t26 = space();
    			if (if_block2) if_block2.c();
    			t27 = space();
    			br15 = element("br");
    			br16 = element("br");
    			t28 = space();
    			if (if_block3) if_block3.c();
    			t29 = space();
    			br17 = element("br");
    			br18 = element("br");
    			t30 = space();
    			if (if_block4) if_block4.c();
    			t31 = space();
    			br19 = element("br");
    			br20 = element("br");
    			t32 = space();
    			if (if_block5) if_block5.c();
    			t33 = space();
    			br21 = element("br");
    			br22 = element("br");
    			t34 = space();
    			if (if_block6) if_block6.c();
    			t35 = space();
    			br23 = element("br");
    			br24 = element("br");
    			br25 = element("br");
    			br26 = element("br");
    			add_location(br0, file$6, 39, 0, 1091);
    			add_location(button0, file$6, 40, 0, 1096);
    			add_location(br1, file$6, 41, 0, 1145);
    			add_location(br2, file$6, 42, 0, 1150);
    			add_location(button1, file$6, 43, 0, 1155);
    			add_location(br3, file$6, 44, 0, 1215);
    			add_location(br4, file$6, 45, 0, 1220);
    			add_location(button2, file$6, 46, 0, 1225);
    			add_location(br5, file$6, 47, 0, 1288);
    			add_location(br6, file$6, 48, 0, 1293);
    			add_location(button3, file$6, 49, 0, 1298);
    			add_location(br7, file$6, 50, 0, 1376);
    			add_location(br8, file$6, 51, 0, 1381);
    			add_location(button4, file$6, 52, 0, 1386);
    			add_location(br9, file$6, 53, 0, 1438);
    			add_location(br10, file$6, 54, 0, 1443);
    			add_location(button5, file$6, 55, 0, 1448);
    			add_location(br11, file$6, 56, 0, 1486);
    			add_location(br12, file$6, 56, 4, 1490);
    			add_location(br13, file$6, 61, 0, 1528);
    			add_location(br14, file$6, 61, 4, 1532);
    			add_location(br15, file$6, 65, 0, 1569);
    			add_location(br16, file$6, 65, 4, 1573);
    			add_location(br17, file$6, 69, 0, 1611);
    			add_location(br18, file$6, 69, 4, 1615);
    			add_location(br19, file$6, 73, 0, 1654);
    			add_location(br20, file$6, 73, 4, 1658);
    			add_location(br21, file$6, 77, 0, 1694);
    			add_location(br22, file$6, 77, 4, 1698);
    			add_location(br23, file$6, 81, 0, 1736);
    			add_location(br24, file$6, 81, 4, 1740);
    			add_location(br25, file$6, 81, 8, 1744);
    			add_location(br26, file$6, 81, 12, 1748);
    			attr(div, "id", "content");
    			add_location(div, file$6, 29, 0, 546);

    			dispose = [
    				listen(button0, "click", ctx.monad),
    				listen(button1, "click", ctx.monad2),
    				listen(button2, "click", ctx.haskell),
    				listen(button3, "click", ctx.bugs),
    				listen(button4, "click", ctx.matrix),
    				listen(button5, "click", ctx.home)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t0);
    			append(div, br0);
    			append(div, t1);
    			append(div, button0);
    			append(div, t3);
    			append(div, br1);
    			append(div, t4);
    			append(div, br2);
    			append(div, t5);
    			append(div, button1);
    			append(div, t7);
    			append(div, br3);
    			append(div, t8);
    			append(div, br4);
    			append(div, t9);
    			append(div, button2);
    			append(div, t11);
    			append(div, br5);
    			append(div, t12);
    			append(div, br6);
    			append(div, t13);
    			append(div, button3);
    			append(div, t15);
    			append(div, br7);
    			append(div, t16);
    			append(div, br8);
    			append(div, t17);
    			append(div, button4);
    			append(div, t19);
    			append(div, br9);
    			append(div, t20);
    			append(div, br10);
    			append(div, t21);
    			append(div, button5);
    			append(div, t23);
    			append(div, br11);
    			append(div, br12);
    			append(div, t24);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t25);
    			append(div, br13);
    			append(div, br14);
    			append(div, t26);
    			if (if_block2) if_block2.m(div, null);
    			append(div, t27);
    			append(div, br15);
    			append(div, br16);
    			append(div, t28);
    			if (if_block3) if_block3.m(div, null);
    			append(div, t29);
    			append(div, br17);
    			append(div, br18);
    			append(div, t30);
    			if (if_block4) if_block4.m(div, null);
    			append(div, t31);
    			append(div, br19);
    			append(div, br20);
    			append(div, t32);
    			if (if_block5) if_block5.m(div, null);
    			append(div, t33);
    			append(div, br21);
    			append(div, br22);
    			append(div, t34);
    			if (if_block6) if_block6.m(div, null);
    			append(div, t35);
    			append(div, br23);
    			append(div, br24);
    			append(div, br25);
    			append(div, br26);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.j === 0) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_6();
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

    			if (ctx.j === 0) {
    				if (!if_block1) {
    					if_block1 = create_if_block_5();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t25);
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

    			if (ctx.j === 1) {
    				if (!if_block2) {
    					if_block2 = create_if_block_4();
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t27);
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

    			if (ctx.j === 2) {
    				if (!if_block3) {
    					if_block3 = create_if_block_3();
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t29);
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

    			if (ctx.j === 3) {
    				if (!if_block4) {
    					if_block4 = create_if_block_2$1();
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, t31);
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

    			if (ctx.j === 4) {
    				if (!if_block5) {
    					if_block5 = create_if_block_1$1();
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div, t33);
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

    			if (ctx.j === 5) {
    				if (!if_block6) {
    					if_block6 = create_if_block$5();
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div, t35);
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
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	


        let j = 0;

        function monad () {$$invalidate('j', j = 1);}    function monad2 () {$$invalidate('j', j = 2);}    function haskell () {$$invalidate('j', j = 3);}    function bugs () {$$invalidate('j', j = 4);}    function matrix () {$$invalidate('j', j = 5);}    function home () {$$invalidate('j', j = 0);}
    	return {
    		j,
    		monad,
    		monad2,
    		haskell,
    		bugs,
    		matrix,
    		home
    	};
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, []);
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
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
