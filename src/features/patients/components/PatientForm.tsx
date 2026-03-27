import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Column,
  Label,
  HelpText,
  Input,
  DatePicker,
  Dropdown,
  Radio,
} from '@innovaccer/design-system';
import { patientFormSchema, type PatientFormData, type Patient } from '../types/patient';

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  defaultValues?: Patient;
  isSubmitting?: boolean;
}

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

export function PatientForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  isSubmitting,
}: PatientFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: defaultValues
      ? {
          firstName: defaultValues.firstName,
          lastName: defaultValues.lastName,
          dateOfBirth: defaultValues.dateOfBirth,
          gender: defaultValues.gender,
          phone: defaultValues.phone,
          email: defaultValues.email,
          status: defaultValues.status,
          riskScore: defaultValues.riskScore,
        }
      : {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'Male',
          phone: '',
          email: '',
          status: 'Active',
          riskScore: 'Low',
        },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} dimension="large">
      <ModalHeader heading={defaultValues ? 'Edit Patient' : 'Add Patient'} onClose={handleClose} />
      <ModalBody>
        <form id="patient-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Row 1: firstName, lastName */}
          <Row className="mb-6">
            <Column size="6">
              <Label withInput required>
                First Name
              </Label>
              <Controller
                name="firstName"
                control={control}
                render={({ field: { onChange, onBlur, value, name } }) => (
                  <Input
                    name={name}
                    value={value}
                    placeholder="Enter first name"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onBlur={onBlur}
                    error={!!errors.firstName}
                  />
                )}
              />
              {errors.firstName && <HelpText message={errors.firstName.message ?? ''} error />}
            </Column>
            <Column size="6">
              <Label withInput required>
                Last Name
              </Label>
              <Controller
                name="lastName"
                control={control}
                render={({ field: { onChange, onBlur, value, name } }) => (
                  <Input
                    name={name}
                    value={value}
                    placeholder="Enter last name"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onBlur={onBlur}
                    error={!!errors.lastName}
                  />
                )}
              />
              {errors.lastName && <HelpText message={errors.lastName.message ?? ''} error />}
            </Column>
          </Row>

          {/* Row 2: dateOfBirth, gender */}
          <Row className="mb-6">
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
              {errors.dateOfBirth && <HelpText message={errors.dateOfBirth.message ?? ''} error />}
            </Column>
            <Column size="6">
              <Label withInput required>
                Gender
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    options={genderOptions}
                    onChange={(selectedValue: unknown) => {
                      const selected = selectedValue as { label: string; value: string };
                      onChange(selected.value);
                    }}
                    placeholder="Select gender"
                    selected={
                      value
                        ? [genderOptions.find((o) => o.value === value) ?? genderOptions[0]]
                        : undefined
                    }
                  />
                )}
              />
              {errors.gender && <HelpText message={errors.gender.message ?? ''} error />}
            </Column>
          </Row>

          {/* Row 3: phone, email */}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onBlur={onBlur}
                    error={!!errors.phone}
                  />
                )}
              />
              {errors.phone && <HelpText message={errors.phone.message ?? ''} error />}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onBlur={onBlur}
                    error={!!errors.email}
                  />
                )}
              />
              {errors.email && <HelpText message={errors.email.message ?? ''} error />}
            </Column>
          </Row>

          {/* Row 4: status */}
          <Row className="mb-6">
            <Column size="6">
              <Label withInput required>
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="d-flex">
                    <Radio
                      label="Active"
                      name="status"
                      value="Active"
                      checked={value === 'Active'}
                      onChange={() => onChange('Active')}
                    />
                    <Radio
                      label="Inactive"
                      name="status"
                      value="Inactive"
                      checked={value === 'Inactive'}
                      onChange={() => onChange('Inactive')}
                      className="ml-6"
                    />
                  </div>
                )}
              />
              {errors.status && <HelpText message={errors.status.message ?? ''} error />}
            </Column>
            <Column size="6">
              <Label withInput required>
                Risk Score
              </Label>
              <Controller
                name="riskScore"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="d-flex">
                    <Radio
                      label="Low"
                      name="riskScore"
                      value="Low"
                      checked={value === 'Low'}
                      onChange={() => onChange('Low')}
                    />
                    <Radio
                      label="Medium"
                      name="riskScore"
                      value="Medium"
                      checked={value === 'Medium'}
                      onChange={() => onChange('Medium')}
                      className="ml-6"
                    />
                    <Radio
                      label="High"
                      name="riskScore"
                      value="High"
                      checked={value === 'High'}
                      onChange={() => onChange('High')}
                      className="ml-6"
                    />
                  </div>
                )}
              />
              {errors.riskScore && <HelpText message={errors.riskScore.message ?? ''} error />}
            </Column>
          </Row>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button appearance="basic" onClick={handleClose}>
          Cancel
        </Button>
        <Button appearance="primary" type="submit" form="patient-form" loading={isSubmitting}>
          {defaultValues ? 'Save Changes' : 'Add Patient'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
