-- Refresh only the dedicated SEO fields of the five currently published articles.
-- Preserve editorial content and timestamps (the posts trigger normally updates updated_at).
DO $$
DECLARE
  updated_rows INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.posts'::regclass
      AND tgname = 'posts_set_updated_at'
      AND NOT tgisinternal
      AND tgenabled = 'O'
  ) THEN
    RAISE EXCEPTION 'Expected enabled trigger posts_set_updated_at was not found; SEO metadata was not changed.';
  END IF;

  EXECUTE 'ALTER TABLE public.posts DISABLE TRIGGER posts_set_updated_at';

  UPDATE public.posts AS post
  SET
    seo_title = metadata.seo_title,
    seo_description = metadata.seo_description
  FROM (VALUES
    (
      'salute-mentale-la-fatica-di-dover-spiegare',
      'Salute mentale: il peso di dover spiegare',
      'Ansia, diagnosi e pregiudizi: quando convivere con un disturbo mentale significa dover spiegare continuamente il proprio disagio e chiedere ascolto.'
    ),
    (
      'per-dimagrire-la-dieta-non-basta',
      'Dimagrire: perché la dieta da sola non basta',
      'Il rapporto con la bilancia, le diete restrittive e il percorso con un nutrizionista: una storia sull’equilibrio con il cibo e sul senso di colpa.'
    ),
    (
      'e-se-non-fossimo-nel-posto-o-nel-tempo-giusto',
      'Posto giusto e tempo giusto: sentirsi in ritardo',
      'Una riflessione su aspettative, ritardi e paura del fallimento, e su quanto conti trovare accanto a sé persone capaci di restare.'
    ),
    (
      'sempre-piu-persone-si-confidano-con-l-ia',
      'Confidarsi con l’IA: solitudine e relazioni',
      'Perché alcuni giovani si rivolgono all’IA quando hanno bisogno di parlare? Una riflessione su solitudine, relazioni e limiti del supporto digitale.'
    ),
    (
      'social-e-perdita-di-autenticita',
      'Social network: confronto e paura del giudizio',
      'Dalla FOMO al confronto continuo: i social possono alimentare frustrazione, imitazione e paura del giudizio, allontanandoci dalla nostra identità.'
    )
  ) AS metadata(slug, seo_title, seo_description)
  WHERE post.slug = metadata.slug
    AND post.published = TRUE
    AND post.published_at <= NOW();

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  EXECUTE 'ALTER TABLE public.posts ENABLE TRIGGER posts_set_updated_at';

  IF updated_rows <> 5 THEN
    RAISE EXCEPTION 'Expected to update exactly 5 published articles, updated %; transaction rolled back.', updated_rows;
  END IF;
END;
$$;
