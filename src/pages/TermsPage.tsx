import { StaticProsePage } from './AboutPage';

export default function TermsPage() {
  return (
    <StaticProsePage
      titleKey="terms.title"
      introKey="terms.intro"
      sections={[
        { titleKey: 'terms.s1Title', bodyKey: 'terms.s1Body' },
        { titleKey: 'terms.s2Title', bodyKey: 'terms.s2Body' },
        { titleKey: 'terms.s3Title', bodyKey: 'terms.s3Body' },
        { titleKey: 'terms.s4Title', bodyKey: 'terms.s4Body' },
      ]}
    />
  );
}
