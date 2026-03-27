import { PageHeader as MdsPageHeader, Breadcrumbs, Button } from '@innovaccer/design-system';
import { useNavigate } from 'react-router';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
}

export function PageHeader({ title, breadcrumbs, actions, showBackButton }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <MdsPageHeader
      title={title}
      separator={true}
      navigationPosition="center"
      breadcrumbs={
        breadcrumbs ? (
          <Breadcrumbs
            list={breadcrumbs.map((b) => ({
              label: b.label,
              link: b.link ?? '',
            }))}
            onClick={(link: string) => link && navigate(link)}
          />
        ) : undefined
      }
      actions={actions}
      button={
        showBackButton ? (
          <Button icon="arrow_back" appearance="transparent" onClick={() => navigate(-1)} />
        ) : undefined
      }
    />
  );
}
