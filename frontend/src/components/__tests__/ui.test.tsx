import { render, screen } from '@testing-library/react';
import { SectionHeader, Card } from '../ui';

describe('UI components', () => {
  it('renders SectionHeader with title and subtitle', () => {
    render(<SectionHeader title="Título" subtitle="Sub" />);
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('renders Card content', () => {
    render(
      <Card>
        <span>Contenido</span>
      </Card>,
    );
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });
});
