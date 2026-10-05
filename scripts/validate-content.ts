/**
 * Validates content integrity: duplicate ids/slugs, unknown district refs,
 * invalid coordinates/months, missing bilingual names, broken nearby refs,
 * missing image attribution.
 * Run with: npm run scripts:validate-content
 */
async function main() {
  const { districts } = await import('../src/data/districts.ts');
  const { places } = await import('../src/data/places.ts');
  const { famousEntries } = await import('../src/data/famous.ts');
  const { quizQuestions } = await import('../src/data/quiz.ts');

  const errors: string[] = [];
  const districtIds = new Set(districts.map((d) => d.id));
  const placeIds = new Set(places.map((p) => p.id));
  const slugs = new Set<string>();

  if (districts.length !== 64) errors.push(`Expected 64 districts, found ${districts.length}`);

  for (const place of places) {
    if (!place.nameEn || !place.nameBn) errors.push(`${place.id}: missing bilingual name`);
    if (!districtIds.has(place.districtId)) errors.push(`${place.id}: unknown district ${place.districtId}`);
    if (place.lat < -90 || place.lat > 90 || place.lng < -180 || place.lng > 180) errors.push(`${place.id}: invalid coordinates`);
    if (place.bestMonths.some((m) => m < 1 || m > 12)) errors.push(`${place.id}: invalid best month`);
    for (const nearby of place.nearbyPlaceIds) {
      if (!placeIds.has(nearby)) errors.push(`${place.id}: broken nearby reference ${nearby}`);
    }
    for (const media of place.media) {
      if (!media.license || !media.sourceUrl) errors.push(`${place.id}: image missing license/source`);
    }
    if (slugs.has(place.slug)) errors.push(`${place.id}: duplicate slug ${place.slug}`);
    slugs.add(place.slug);
  }

  for (const famous of famousEntries) {
    if (!districtIds.has(famous.districtId)) errors.push(`${famous.id}: unknown district ${famous.districtId}`);
    if (famous.placeId && !placeIds.has(famous.placeId)) errors.push(`${famous.id}: broken place reference`);
  }

  for (const question of quizQuestions) {
    const optionIds = new Set(question.options.map((o) => o.id));
    for (const answer of question.answerIds) {
      if (!optionIds.has(answer)) errors.push(`${question.id}: answer ${answer} not in options`);
    }
    if (!question.localeData.bn.prompt || !question.localeData.en.prompt) errors.push(`${question.id}: missing bilingual prompt`);
  }

  if (errors.length) {
    // eslint-disable-next-line no-console
    console.error(`Content validation failed with ${errors.length} problem(s):`);
    for (const error of errors) console.error(' -', error);
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log(`Content validation passed: ${places.length} places, ${famousEntries.length} famous entries, ${quizQuestions.length} quiz questions.`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
