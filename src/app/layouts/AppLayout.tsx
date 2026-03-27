import { Outlet, useNavigate } from 'react-router';
import { Icon, Avatar, LinkButton, Button, Divider, Input, Badge } from '@innovaccer/design-system';
import { ToastContainer } from '../../components/app/ToastContainer';
import { ROUTES } from '../router/routes';
import './AppLayout.css';

const headerNavItems = [
  { label: 'Home', link: ROUTES.HOME },
  { label: 'Patients', link: ROUTES.PATIENTS },
  { label: 'Form Example', link: ROUTES.FORM_EXAMPLE },
];

export function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column vh-100">
      <header className="app-header d-flex align-items-center justify-content-between flex-shrink-0 bg-light px-2">
        <div className="d-flex align-items-center">
          <div
            className="app-header__logo d-flex align-items-center justify-content-center flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <img src="/logo.svg" alt="Logo" width={19} height={24} />
          </div>
          <nav className="d-flex align-items-center ml-2">
            {headerNavItems.map((item) => {
              return (
                <LinkButton
                  key={item.label}
                  onClick={() => navigate(item.link)}
                  className="mr-4"
                  subtle={true}
                >
                  {item.label}
                </LinkButton>
              );
            })}
          </nav>
        </div>
        <div className="d-flex align-items-center flex-grow-1 justify-content-end">
          <div className="app-header__search mr-3">
            <Input
              name="search"
              icon="search"
              placeholder="Search by patients name"
              size="regular"
            />
          </div>
          <Button appearance="basic" icon="add" size="regular" className="mr-3">
            Create Patient
          </Button>
          <div className="d-flex align-items-center">
            <div className="app-header__icon-btn d-flex align-items-center justify-content-center">
              <Icon name="sms" size={16} />
              <Badge appearance="alert" subtle className="app-header__badge">
                9+
              </Badge>
            </div>
            <div className="app-header__icon-btn d-flex align-items-center justify-content-center ml-2">
              <Icon name="notifications" size={16} />
              <Badge appearance="alert" subtle className="app-header__badge">
                5
              </Badge>
            </div>
            <div className="ml-4">
              <Avatar firstName="John" lastName="Doe" size="regular" />
            </div>
          </div>
        </div>
      </header>
      <Divider appearance="header" />
      <main className="flex-grow-1 overflow-hidden bg-secondary-lightest">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
