import { useParams } from 'react-router-dom';
import { useEventConfig } from './useEventConfig';
import { resolveSlug } from '../lib/slug-resolver';

export function useSlug() {
  const { slug } = useParams<{ slug: string }>();
  const config = useEventConfig();

  if (!slug) return { found: false as const, slug: undefined };

  const result = resolveSlug(config, slug);
  if (!result) return { found: false as const, slug };

  return {
    found: true as const,
    slug,
    event: result.event,
  };
}
