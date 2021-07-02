import { VdsCustomEvent } from '../../foundation/events/index.js';

/**
 * @typedef {{
 *   [MediaContainerConnectEvent.TYPE]: MediaContainerConnectEvent
 * }} MediaContainerEvents
 */

/**
 * @template DetailType
 * @augments {VdsCustomEvent<DetailType>}
 */
export class MediaContainerEvent extends VdsCustomEvent {}

/**
 * @typedef {{
 *  container: any;
 *  onDisconnect: (callback: () => void) => void;
 * }} MediaContainerConnectEventDetail
 */

/**
 * @augments MediaContainerEvent<MediaContainerConnectEventDetail>
 */
export class MediaContainerConnectEvent extends MediaContainerEvent {
  /** @readonly */
  static TYPE = 'vds-media-container-connect';
  static DEFAULT_BUBBLES = true;
  static DEFAULT_COMPOSED = true;
}
