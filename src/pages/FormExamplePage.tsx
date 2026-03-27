import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '../store/useToastStore';
import {
  Card,
  Heading,
  Row,
  Column,
  Label,
  HelpText,
  Input,
  DatePicker,
  Dropdown,
  Radio,
  Textarea,
  Checkbox,
  Switch,
  Button,
} from '@innovaccer/design-system';
import { Page } from '../components/app/Page';
import { PageHeader } from '../components/app/PageHeader';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  department: z.string().min(1, 'Department is required'),
  notes: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  agreeToTerms: z.literal(true, {
    error: 'You must agree to terms',
  }),
  notifications: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const departmentOptions = [
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Neurology', value: 'Neurology' },
  { label: 'Orthopedics', value: 'Orthopedics' },
  { label: 'Pediatrics', value: 'Pediatrics' },
  { label: 'Oncology', value: 'Oncology' },
];

export function FormExamplePage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      department: '',
      notes: '',
      gender: 'Male',
      agreeToTerms: false as unknown as true,
      notifications: false,
    },
  });

  const onSubmit = () => {
    toast.add({
      title: 'Form submitted',
      appearance: 'success',
      message: 'Your form has been submitted successfully.',
    });
    reset();
  };

  return (
    <Page>
      <PageHeader title="Form Example" />
      <div className="p-6">
        <Card className="p-6">
          <Heading size="m" className="mb-6">
            Sample Form
          </Heading>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: Full Name, Email */}
            <Row className="mb-6">
              <Column size="6">
                <Label withInput required>
                  Full Name
                </Label>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name } }) => (
                    <Input
                      name={name}
                      value={value}
                      placeholder="Enter full name"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(e.target.value)
                      }
                      onBlur={onBlur}
                      error={!!errors.fullName}
                    />
                  )}
                />
                {errors.fullName && <HelpText message={errors.fullName.message ?? ''} error />}
              </Column>
              <Column size="6">
                <Label withInput required>
                  Email
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name } }) => (
                    <Input
                      name={name}
                      type="email"
                      value={value}
                      placeholder="Enter email address"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(e.target.value)
                      }
                      onBlur={onBlur}
                      error={!!errors.email}
                    />
                  )}
                />
                {errors.email && <HelpText message={errors.email.message ?? ''} error />}
              </Column>
            </Row>

            {/* Row 2: Phone, Date of Birth */}
            <Row className="mb-6">
              <Column size="6">
                <Label withInput required>
                  Phone
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name } }) => (
                    <Input
                      name={name}
                      type="tel"
                      value={value}
                      placeholder="Enter phone number"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(e.target.value)
                      }
                      onBlur={onBlur}
                      error={!!errors.phone}
                    />
                  )}
                />
                {errors.phone && <HelpText message={errors.phone.message ?? ''} error />}
              </Column>
              <Column size="6">
                <Label withInput required>
                  Date of Birth
                </Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      withInput
                      inputFormat="mm/dd/yyyy"
                      outputFormat="mm/dd/yyyy"
                      date={value ? new Date(value) : undefined}
                      onDateChange={(_date: Date | undefined, dateVal?: string) => {
                        onChange(dateVal ?? '');
                      }}
                      inputOptions={{
                        placeholder: 'mm/dd/yyyy',
                        name: 'dateOfBirth',
                        required: true,
                      }}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <HelpText message={errors.dateOfBirth.message ?? ''} error />
                )}
              </Column>
            </Row>

            {/* Row 3: Department, Gender */}
            <Row className="mb-6">
              <Column size="6">
                <Label withInput required>
                  Department
                </Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      options={departmentOptions}
                      onChange={(selectedValue: unknown) => {
                        const selected = selectedValue as { label: string; value: string };
                        onChange(selected.value);
                      }}
                      placeholder="Select department"
                      selected={
                        value
                          ? [
                              departmentOptions.find((o) => o.value === value) ??
                                departmentOptions[0],
                            ]
                          : undefined
                      }
                    />
                  )}
                />
                {errors.department && <HelpText message={errors.department.message ?? ''} error />}
              </Column>
              <Column size="6">
                <Label withInput required>
                  Gender
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="d-flex">
                      <Radio
                        label="Male"
                        name="gender"
                        value="Male"
                        checked={value === 'Male'}
                        onChange={() => onChange('Male')}
                      />
                      <Radio
                        label="Female"
                        name="gender"
                        value="Female"
                        checked={value === 'Female'}
                        onChange={() => onChange('Female')}
                        className="ml-6"
                      />
                      <Radio
                        label="Other"
                        name="gender"
                        value="Other"
                        checked={value === 'Other'}
                        onChange={() => onChange('Other')}
                        className="ml-6"
                      />
                    </div>
                  )}
                />
                {errors.gender && <HelpText message={errors.gender.message ?? ''} error />}
              </Column>
            </Row>

            {/* Row 4: Notes */}
            <Row className="mb-6">
              <Column size="6">
                <Label withInput>Notes</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name } }) => (
                    <Textarea
                      name={name}
                      value={value}
                      placeholder="Enter any additional notes"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        onChange(e.target.value)
                      }
                      onBlur={onBlur}
                      rows={3}
                    />
                  )}
                />
              </Column>
            </Row>

            {/* Row 5: Agree to terms, Notifications */}
            <Row className="mb-6">
              <Column size="6">
                <Controller
                  name="agreeToTerms"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      label="I agree to the terms and conditions"
                      checked={value}
                      onChange={(_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) =>
                        onChange(checked)
                      }
                    />
                  )}
                />
                {errors.agreeToTerms && (
                  <HelpText message={errors.agreeToTerms.message ?? ''} error />
                )}
              </Column>
              <Column size="6">
                <Controller
                  name="notifications"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="d-flex align-items-center">
                      <Switch
                        checked={value}
                        onChange={(_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) =>
                          onChange(checked)
                        }
                      />
                      <Label className="ml-4">Enable notifications</Label>
                    </div>
                  )}
                />
              </Column>
            </Row>

            <Button appearance="primary" type="submit">
              Submit
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  );
}
