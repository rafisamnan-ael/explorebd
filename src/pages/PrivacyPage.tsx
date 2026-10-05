import { StaticProsePage } from './AboutPage';

export default function PrivacyPage() {
  return (
    <StaticProsePage
      titleKey="privacy.title"
      introKey="privacy.intro"
      sections={[
        { titleKey: 'privacy.s1Title', bodyKey: 'privacy.s1Body' },
        { titleKey: 'privacy.s2Title', bodyKey: 'privacy.s2Body' },
        { titleKey: 'privacy.s3Title', bodyKey: 'privacy.s3Body' },
        { titleKey: 'privacy.s4Title', bodyKey: 'privacy.s4Body' },
        { titleKey: 'privacy.s5Title', bodyKey: 'privacy.s5Body' },
      ]}
    />
  );
}
