import { LIB_PREFIX } from '../../shared';
import { safelyDefineCustomElement } from '../../utils';
import { MockMediaProvider } from './MockMediaProvider';

export const MOCK_MEDIA_PROVIDER_TAG_NAME = `${LIB_PREFIX}-mock-media-provider`;

safelyDefineCustomElement(MOCK_MEDIA_PROVIDER_TAG_NAME, MockMediaProvider);

declare global {
  interface HTMLElementTagNameMap {
    'vds-mock-media-provider': MockMediaProvider;
  }
}