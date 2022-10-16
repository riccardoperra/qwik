import { createDocument } from '../../testing/document';
import { useStore } from '../use/use-store.public';
import { useLexicalScope } from '../use/use-lexical-scope.public';
import { component$ } from '../component/component.public';
import { $ } from '../qrl/qrl.public';
import { logDebug } from '../util/log';
import { inlinedQrl } from '../qrl/qrl';
import { suite } from 'uvu';
import { render } from '../render/dom/render.public';
import { expectDOM } from '../../testing/expect-dom.unit';
import { pauseContainer } from './pause';
import { noSerialize } from '../state/common';
import { useSignal } from '../use/use-signal';
import { getQwikJSON } from './resume';
import { equal } from 'uvu/assert';

const storeSuite = suite('store');

storeSuite('should serialize content', async () => {
  const document = createDocument();

  await render(
    document.body,
    <div>
      <LexicalScope />
    </div>
  );
  await expectDOM(
    document.body,
    `
  <body q:version="dev" q:container="resumed" q:render="dom-dev">
    <div>
      <!--qv q:key=sX:-->
      <div>0</div>
      <!--/qv-->
    </div>
  </body>`
  );
  await pauseContainer(document.body);
  const script = getQwikJSON(document.body)!;
  script.remove();

  await expectDOM(
    document.body,
    `
    <body q:version="dev" q:container="paused" q:render="dom-dev">
      <div>
        <!--qv q:key=sX: q:id=0-->
        <div q:id="1" on:click="/runtimeQRL#_[0 1 2 3 4 5 6 7 8 9 10 11]">
          <!--t=2-->
          0
          <!---->
        </div>
        <!--/qv-->
      </div>
      <script>
        window.qwikevents ||= [];
        window.qwikevents.push("click");
      </script>
    </body>`
  );

  equal(JSON.parse(script.textContent!), {
    ctx: {
      '#1': {
        r: '1 2 f m 8 i 7 6 k! m l 0',
      },
    },
    objs: [
      '\u0012j',
      1,
      'hola',
      12,
      {
        thing: '3',
      },
      123,
      false,
      true,
      null,
      'string',
      {
        hola: '1',
      },
      'hello',
      ['b'],
      ['1', '9', '6', 'a', 'c'],
      '\u0010/runtimeQRL#_',
      {
        a: '4',
        b: '2',
        c: '5',
        d: '6',
        e: '7',
        f: '8',
        g: 'm',
        h: 'd',
        i: 'e',
      },
      2,
      {},
      ['1', 'g', '2', 'h'],
      0,
      {
        count: 'j',
      },
      '\u0002/runtimeQRL#_',
      '\u0001',
    ],
    subs: [['2 #0 0 #2 data']],
  });
});

export const LexicalScope_render = () => {
  const [a, b, c, d, e, f, g, h, state, noserialize] = useLexicalScope();
  return (
    <section>
      <p>{JSON.stringify(a)}</p>
      <p>{JSON.stringify(b)}</p>
      <p>{JSON.stringify(c)}</p>
      <p>{String(d)}</p>
      <p>{String(e)}</p>
      <p>{JSON.stringify(f)}</p>
      <p>{JSON.stringify(g)}</p>
      <p>{JSON.stringify(h)}</p>
      <p>{noserialize.text}</p>
      <button onDocumentClick$={() => state.count++}>Rerender {state.count}</button>
    </section>
  );
};

export const LexicalScope = component$(() => {
  const state = useStore({
    count: 0,
  });
  const signal = useSignal(0);
  const nu = 1;
  const str = 'hola';
  const obj = {
    a: { thing: 12 },
    b: 'hola',
    c: 123,
    d: false,
    e: true,
    f: null,
    g: undefined,
    h: [1, 'string', false, { hola: 1 }, ['hello']],
    i: LexicalScope,
  };
  const noserialize = noSerialize({ text: 'not included', window: () => {} });
  const undef = undefined;
  const nulll = null;
  const array = [1, 2, 'hola', {}];
  const boolTrue = true;
  const boolFalse = false;
  const qrl = $(() => logDebug('qrl'));
  const thing = inlinedQrl(LexicalScope_render, 'LexicalScope_render', [
    nu,
    str,
    obj,
    undef,
    nulll,
    array,
    boolTrue,
    boolFalse,
    state,
    noserialize,
    qrl,
    signal,
  ]);
  return <div onClick$={thing}>{signal as any}</div>;
});

storeSuite.run();