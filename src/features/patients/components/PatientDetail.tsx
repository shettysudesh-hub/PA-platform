import { useState } from 'react';
import {
  Tabs,
  Card,
  Row,
  Column,
  MetaList,
  Badge,
  StatusHint,
  Text,
  Heading,
} from '@innovaccer/design-system';
import { AppTable } from '../../../components/app/AppTable';
import type { Patient } from '../types/patient';

interface PatientDetailProps {
  patient: Patient;
}

const riskScoreAppearance: Record<string, string> = {
  Low: 'success',
  Medium: 'warning',
  High: 'alert',
};

const conditionStatusAppearance: Record<string, string> = {
  Active: 'info',
  Resolved: 'success',
};

const conditionSchema = [
  { name: 'name', displayName: 'Condition', width: '40%' },
  {
    name: 'status',
    displayName: 'Status',
    width: '30%',
    cellRenderer: (props: { data: { status: string } }) => (
      <StatusHint appearance={conditionStatusAppearance[props.data.status] ?? 'default'}>
        {props.data.status}
      </StatusHint>
    ),
  },
  { name: 'diagnosedDate', displayName: 'Diagnosed Date', width: '30%' },
];

const encounterSchema = [
  { name: 'date', displayName: 'Date', width: '20%' },
  { name: 'type', displayName: 'Type', width: '20%' },
  { name: 'provider', displayName: 'Provider', width: '25%' },
  { name: 'summary', displayName: 'Summary', width: '35%' },
];

const tabs = [{ label: 'Overview' }, { label: 'Conditions' }, { label: 'Encounters' }];

export function PatientDetail({ patient }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeIndex={activeTab}
        onTabChange={(tabIndex: number) => setActiveTab(tabIndex)}
      />
      <div className="mt-6">
        {activeTab === 0 && (
          <Row>
            <Column size="8">
              <Card className="p-6 mb-6">
                <Heading size="s" className="mb-5">
                  Demographics
                </Heading>
                <MetaList
                  list={[
                    { label: `DOB: ${patient.dateOfBirth}` },
                    { label: `Gender: ${patient.gender}` },
                    { label: `Phone: ${patient.phone}` },
                    { label: `Email: ${patient.email}` },
                  ]}
                />
              </Card>
            </Column>
            <Column size="4">
              <Card className="p-6 mb-6">
                <Heading size="s" className="mb-5">
                  Risk Score
                </Heading>
                <Badge appearance={riskScoreAppearance[patient.riskScore] ?? 'secondary'}>
                  {patient.riskScore}
                </Badge>
              </Card>
              <Card className="p-6">
                <Heading size="s" className="mb-5">
                  Care Team
                </Heading>
                {patient.careTeam.length === 0 ? (
                  <Text appearance="subtle">No care team members</Text>
                ) : (
                  patient.careTeam.map((member, index) => (
                    <div key={index} className="mb-4">
                      <Text weight="strong">{member.name}</Text>
                      <br />
                      <Text appearance="subtle" size="small">
                        {member.role}
                      </Text>
                    </div>
                  ))
                )}
              </Card>
            </Column>
          </Row>
        )}

        {activeTab === 1 && <AppTable data={patient.conditions} schema={conditionSchema} />}

        {activeTab === 2 && <AppTable data={patient.encounters} schema={encounterSchema} />}
      </div>
    </div>
  );
}
