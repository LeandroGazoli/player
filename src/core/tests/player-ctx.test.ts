import '../vds-player';
import './vds-fake-consumer';

import {
  elementUpdated,
  expect,
  fixture,
  html,
  oneEvent,
} from '@open-wc/testing';

import { isBoolean, isNumber, isString, isUndefined } from '../../utils';
import { ProviderDisconnectEvent, ProviderSrcChangeEvent } from '..';
import { Player } from '../Player';
import { playerContext } from '../player.context';
import { SrcChangeEvent } from '../player.events';
import { PlayerContext, ViewType } from '../player.types';
import { FakeConsumer } from './FakeConsumer';
import { emitEvent } from './helpers';

describe('context', () => {
  it.skip('should have defined all context properties', async () => {
    const player = await fixture<Player>(html`<vds-player></vds-player>`);

    Object.keys(playerContext).forEach(prop => {
      const ctxProp = `${prop}Ctx`;
      const descriptor = Object.getOwnPropertyDescriptor(
        player.constructor.prototype,
        ctxProp,
      );
      expect(
        descriptor?.get && descriptor?.set,
        `Expected context property [${ctxProp}] to be defined.`,
      ).to.exist;
    });
  });

  it('should update context consumer', async () => {
    const player = await fixture<Player>(
      html`
        <vds-player>
          <vds-fake-consumer></vds-fake-consumer>
        </vds-player>
      `,
    );

    const consumer = player.querySelector('vds-fake-consumer') as FakeConsumer;

    function genRandomNewValue(prop: keyof PlayerContext, value: unknown) {
      if (isString(value) || prop === 'aspectRatio') {
        return Math.random().toString(36).substring(7);
      } else if (isNumber(value)) {
        return Math.random();
      } else if (isBoolean(value)) {
        return !value;
      }

      return undefined;
    }

    const dontTest = new Set<keyof PlayerContext>([
      'uuid',
      'device',
      'isMobileDevice',
      'isDesktopDevice',
    ]);

    const promises = ((Object.keys(
      playerContext,
    ) as unknown) as (keyof PlayerContext)[]).map(async prop => {
      if (dontTest.has(prop)) return;

      const ctxProp = `${prop}Ctx`;
      const newValue = genRandomNewValue(prop, player.context[ctxProp]);

      expect(
        newValue,
        `
            Failed to generate random value for context update [${prop}] 

            It might be because the value is \`undefined\` or a non-primitive value so the 
            type can't be automatically determined. Handle this outlier in the \`genRandomNewValue\` 
            function inside this test case.\n
          `,
      ).to.exist;

      if (!isUndefined(newValue)) {
        player.context[ctxProp] = newValue;
        await elementUpdated(consumer);
        expect(
          consumer[prop],
          `
              Context [${prop}] failed to update

              1. Check that you've included it correctly in \`player.context.ts\`
              2. Check that you've defined the provider correctly in \`Player.ts\`.
              3. Check that you've defined the consumer correctly in \`FakeConsumer.ts\`\n
            `,
        ).to.equal(newValue);
      }
    });

    await Promise.all(promises);
  });

  it('should soft reset context when media is changed', async () => {
    const player = await fixture<Player>(
      html`
        <vds-player>
          <vds-fake-consumer></vds-fake-consumer>
        </vds-player>
      `,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const consumer = player.querySelector('vds-fake-consumer')!;

    player.context.pausedCtx = false;
    player.context.durationCtx = 200;
    await elementUpdated(consumer);

    emitEvent(consumer, new ProviderSrcChangeEvent({ detail: '' }));
    await oneEvent(player, SrcChangeEvent.TYPE);
    await elementUpdated(consumer);

    expect(consumer.paused, 'paused').to.equal(true);
    expect(consumer.duration, 'duration').to.equal(-1);
  });

  it('should hard reset context when provider disconnects', async () => {
    const player = await fixture<Player>(
      html`
        <vds-player>
          <vds-fake-consumer></vds-fake-consumer>
        </vds-player>
      `,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const consumer = player.querySelector('vds-fake-consumer')!;

    player.context.viewTypeCtx = ViewType.Video;
    await elementUpdated(consumer);

    emitEvent(consumer, new ProviderDisconnectEvent());
    await oneEvent(player, ProviderDisconnectEvent.TYPE);
    await elementUpdated(consumer);

    expect(consumer.viewType, 'viewType').to.equal(ViewType.Unknown);
  });
});