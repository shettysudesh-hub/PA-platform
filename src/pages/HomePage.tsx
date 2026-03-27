import { Row, Column, Card, CardHeader, Heading, Text, Icon } from '@innovaccer/design-system';
import { Page } from '../components/app/Page';
import { PageHeader } from '../components/app/PageHeader';

type IconAppearance =
  | 'default'
  | 'destructive'
  | 'white'
  | 'subtle'
  | 'disabled'
  | 'info'
  | 'alert'
  | 'warning'
  | 'success'
  | 'primary_lighter'
  | 'primary'
  | 'primary_dark'
  | 'primary_darker'
  | 'alert_lighter'
  | 'alert_dark'
  | 'alert_darker'
  | 'warning_lighter'
  | 'warning_dark'
  | 'warning_darker'
  | 'success_lighter'
  | 'success_dark'
  | 'success_darker'
  | 'accent1'
  | 'accent1_lighter'
  | 'accent1_dark'
  | 'accent1_darker'
  | 'accent2'
  | 'accent2_lighter'
  | 'accent2_dark'
  | 'accent2_darker'
  | 'accent3'
  | 'accent3_lighter'
  | 'accent3_dark'
  | 'accent3_darker'
  | 'accent4'
  | 'accent4_lighter'
  | 'accent4_dark'
  | 'accent4_darker'
  | 'inverse';

interface Metric {
  label: string;
  value: string;
  icon: string;
  color: IconAppearance;
}

const metrics: Metric[] = [
  { label: 'Total Patients', value: '1,247', icon: 'people', color: 'primary' },
  { label: 'Active', value: '1,052', icon: 'check_circle', color: 'success' },
  { label: 'High Risk', value: '89', icon: 'warning', color: 'alert' },
  { label: 'Encounters This Week', value: '342', icon: 'event', color: 'accent1' },
];

export function HomePage() {
  return (
    <Page>
      <PageHeader title="Dashboard" />
      <div className="mt-6">
        <Row>
          {metrics.map((metric) => (
            <Column key={metric.label} size="3" className="mb-6 px-3">
              <Card className="p-6">
                <div className="d-flex align-items-center">
                  <Icon name={metric.icon} size={24} appearance={metric.color} className="mr-3" />
                  <div>
                    <Text size="small" appearance="subtle">
                      {metric.label}
                    </Text>
                    <Heading size="l">{metric.value}</Heading>
                  </div>
                </div>
              </Card>
            </Column>
          ))}
        </Row>
        <Row>
          <Column size="12" className="px-3">
            <Card>
              <CardHeader>
                <Heading size="s">Welcome to MDS App</Heading>
              </CardHeader>
              <div className="p-6">
                <Text>
                  This is a starter template built with the Innovaccer Masala Design System. Use it
                  as a foundation to prototype features and build applications.
                </Text>
              </div>
            </Card>
          </Column>
        </Row>
      </div>
    </Page>
  );
}
